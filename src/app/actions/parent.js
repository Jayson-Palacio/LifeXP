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

async function callParentRpc(name, args) {
  const { supabase } = await requireParent();
  const { data, error } = await supabase.rpc(name, args);
  return error ? { success: false, error: error.message } : { success: true, data };
}

export async function reviewCompletion(completionId, approved) {
  return callParentRpc('kaeluma_review_completion', { p_completion_id: completionId, p_approved: approved });
}

export async function reviewRedemption(redemptionId, fulfilled) {
  return callParentRpc('kaeluma_review_redemption', { p_redemption_id: redemptionId, p_fulfilled: fulfilled });
}

export async function adjustChildCoins(childId, amount) {
  return callParentRpc('kaeluma_adjust_child_coins', { p_child_id: childId, p_amount: amount });
}
