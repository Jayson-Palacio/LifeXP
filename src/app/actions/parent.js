'use server';

import { requireParent } from '../../lib/authz';
import { createAdminClient } from '../../utils/supabase/admin';

const RESOURCE_FIELDS = {
  children: ['name', 'avatar', 'age_group'],
  missions: ['name', 'category', 'xp_reward', 'coin_reward', 'icon', 'image', 'max_completions', 'max_completions_per_period', 'frequency', 'specific_days', 'start_date', 'end_date', 'assigned_to'],
  rewards: ['name', 'cost', 'icon', 'image', 'assigned_to', 'max_total_redemptions', 'max_daily_redemptions', 'max_weekly_redemptions', 'max_monthly_redemptions'],
};

function pick(source, fields) {
  return Object.fromEntries(Object.entries(source || {}).filter(([key, value]) => fields.includes(key) && value !== undefined));
}

function validName(value, max = 120) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

export async function saveParentResource(table, id, values) {
  const { user } = await requireParent();
  const fields = RESOURCE_FIELDS[table];
  if (!fields) return { success: false, error: 'Invalid resource.' };
  const safe = pick(values, fields);
  if (!validName(safe.name)) return { success: false, error: 'Please provide a name of 120 characters or fewer.' };

  if (table === 'missions' && !['daily', 'weekly', 'monthly', 'date_range'].includes(safe.frequency)) {
    return { success: false, error: 'Invalid mission frequency.' };
  }
  if (table === 'rewards' && (!Number.isInteger(safe.cost) || safe.cost < 1 || safe.cost > 100000)) {
    return { success: false, error: 'Reward cost must be between 1 and 100,000.' };
  }

  const admin = createAdminClient();
  const query = id
    ? admin.from(table).update(safe).eq('id', id).eq('user_id', user.id)
    : admin.from(table).insert({ ...safe, user_id: user.id });
  const { data, error } = await query.select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteParentResource(table, id) {
  const { user } = await requireParent();
  if (!['children', 'missions', 'rewards'].includes(table) || typeof id !== 'string') {
    return { success: false, error: 'Invalid resource.' };
  }
  const { error } = await createAdminClient().from(table).delete().eq('id', id).eq('user_id', user.id);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function setParentResourceActive(table, id, isActive) {
  const { user } = await requireParent();
  if (!['missions', 'rewards'].includes(table) || typeof isActive !== 'boolean') {
    return { success: false, error: 'Invalid resource.' };
  }
  const { data, error } = await createAdminClient().from(table)
    .update({ is_active: isActive }).eq('id', id).eq('user_id', user.id).select().single();
  return error ? { success: false, error: error.message } : { success: true, data };
}

async function callParentRpc(name, args, fallback) {
  const { user, supabase } = await requireParent();
  const { data, error } = await supabase.rpc(name, args);
  if (!error) return { success: true, data };
  const msg = error?.message || '';
  if (fallback && /schema cache|does not exist|PGRST202/i.test(msg)) return fallback(supabase, user, args);
  return { success: false, error: error.message };
}

async function reviewCompletionFallback(supabase, _user, { p_completion_id: completionId, p_approved: approved }) {
  const { data: completion } = await supabase.from('completions').select('*').eq('id', completionId).eq('status', 'pending').single();
  if (!completion) return { success: false, error: 'Pending completion not found' };
  if (!approved) {
    const { data, error } = await supabase.from('completions').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', completionId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: { completion: data } };
  }
  const { data: mission } = await supabase.from('missions').select('*').eq('id', completion.mission_id).single();
  const { data: child } = await supabase.from('children').select('*').eq('id', completion.child_id).single();
  const { data: reviewed, error } = await supabase.from('completions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', completionId).select().single();
  if (error) return { success: false, error: error.message };
  const xp = (child?.total_xp_earned || child?.xp || 0) + (mission?.xp_reward || 0);
  const { data: updatedChild } = await supabase.from('children').update({
    xp,
    total_xp_earned: xp,
    coins: (child?.coins || 0) + (mission?.coin_reward || 0),
    last_completion_date: new Date().toISOString(),
  }).eq('id', completion.child_id).select().single();
  return { success: true, data: { completion: reviewed, child: updatedChild } };
}

async function reviewRedemptionFallback(supabase, _user, { p_redemption_id: redemptionId, p_fulfilled: fulfilled }) {
  const { data: redemption } = await supabase.from('redemptions').select('*').eq('id', redemptionId).eq('status', 'pending').single();
  if (!redemption) return { success: false, error: 'Pending redemption not found' };
  if (fulfilled) {
    const { data, error } = await supabase.from('redemptions').update({ status: 'fulfilled' }).eq('id', redemptionId).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data: { redemption: data } };
  }
  const { data: reward } = await supabase.from('rewards').select('cost').eq('id', redemption.reward_id).single();
  const { data: child } = await supabase.from('children').select('*').eq('id', redemption.child_id).single();
  const { data: refunded, error } = await supabase.from('redemptions').update({ status: 'refunded' }).eq('id', redemptionId).select().single();
  if (error) return { success: false, error: error.message };
  const { data: updatedChild } = await supabase.from('children').update({
    coins: (child?.coins || 0) + (reward?.cost || 0),
  }).eq('id', redemption.child_id).select().single();
  return { success: true, data: { redemption: refunded, child: updatedChild } };
}

export async function reviewCompletion(completionId, approved) {
  return callParentRpc('kaeluma_review_completion', { p_completion_id: completionId, p_approved: approved }, reviewCompletionFallback);
}

export async function reviewRedemption(redemptionId, fulfilled) {
  return callParentRpc('kaeluma_review_redemption', { p_redemption_id: redemptionId, p_fulfilled: fulfilled }, reviewRedemptionFallback);
}

export async function adjustChildCoins(childId, amount) {
  return callParentRpc('kaeluma_adjust_child_coins', { p_child_id: childId, p_amount: amount }, async (supabase, _user, { p_child_id, p_amount }) => {
    const { data: child } = await supabase.from('children').select('coins').eq('id', p_child_id).single();
    if (!child) return { success: false, error: 'Player not found' };
    const { data, error } = await supabase.from('children').update({
      coins: Math.max(0, (child.coins || 0) + p_amount),
    }).eq('id', p_child_id).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  });
}
