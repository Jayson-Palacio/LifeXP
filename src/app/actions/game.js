'use server';

import { requireUser } from '../../lib/authz';

function missingRpc(error) {
  const msg = error?.message || '';
  return /schema cache|does not exist|PGRST202/i.test(msg);
}

async function callGameRpc(name, args, fallback) {
  const { user, supabase } = await requireUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  const { data, error } = await supabase.rpc(name, args);
  if (!error) return { success: true, data };
  if (missingRpc(error) && fallback) return fallback(supabase, user, args);
  return { success: false, error: error.message };
}

async function submitMissionFallback(supabase, user, { p_child_id: childId, p_mission_id: missionId }) {
  const { data: child } = await supabase.from('children').select('*').eq('id', childId).single();
  const { data: mission } = await supabase.from('missions').select('*').eq('id', missionId).single();
  if (!child || !mission || mission.is_active === false) return { success: false, error: 'Mission unavailable' };
  if (Array.isArray(mission.assigned_to) && mission.assigned_to.length > 0 && !mission.assigned_to.includes(childId)) {
    return { success: false, error: 'Mission is not assigned to this player' };
  }

  const { data: settings } = await supabase
    .from('app_settings')
    .select('require_approval')
    .order('setup_complete', { ascending: false })
    .limit(1)
    .maybeSingle();
  const status = settings?.require_approval === false ? 'approved' : 'pending';

  const { data: completion, error } = await supabase.from('completions').insert({
    user_id: child.user_id || user.id,
    mission_id: missionId,
    child_id: childId,
    status,
  }).select().single();
  if (error) return { success: false, error: error.message };

  let updatedChild = child;
  if (status === 'approved') {
    const xp = (child.total_xp_earned || child.xp || 0) + (mission.xp_reward || 0);
    const { data: awarded } = await supabase.from('children').update({
      xp,
      total_xp_earned: xp,
      coins: (child.coins || 0) + (mission.coin_reward || 0),
      last_completion_date: new Date().toISOString(),
    }).eq('id', childId).select().single();
    if (awarded) updatedChild = awarded;
  }

  return { success: true, data: { completion, child: updatedChild } };
}

async function undoMissionFallback(supabase, _user, { p_completion_id: completionId }) {
  const { data, error } = await supabase
    .from('completions')
    .delete()
    .eq('id', completionId)
    .eq('status', 'pending')
    .select()
    .maybeSingle();
  if (error) return { success: false, error: error.message };
  if (!data) return { success: false, error: 'Pending completion not found' };
  return { success: true, data };
}

async function redeemRewardFallback(supabase, user, { p_child_id: childId, p_reward_id: rewardId }) {
  const { data: child } = await supabase.from('children').select('*').eq('id', childId).single();
  const { data: reward } = await supabase.from('rewards').select('*').eq('id', rewardId).eq('is_active', true).single();
  if (!child || !reward) return { success: false, error: 'Reward unavailable' };
  if ((child.coins || 0) < (reward.cost || 0)) return { success: false, error: 'Not enough coins' };

  const { data: redemption, error } = await supabase.from('redemptions').insert({
    user_id: child.user_id || user.id,
    reward_id: rewardId,
    child_id: childId,
    status: 'pending',
  }).select().single();
  if (error) return { success: false, error: error.message };

  const { data: updatedChild, error: coinErr } = await supabase.from('children').update({
    coins: Math.max(0, (child.coins || 0) - (reward.cost || 0)),
  }).eq('id', childId).select().single();
  if (coinErr) return { success: false, error: coinErr.message };

  return { success: true, data: { redemption, child: updatedChild } };
}

async function updateAppearanceFallback(supabase, _user, { p_child_id: childId, p_field: field, p_value: value }) {
  if (field !== 'theme' && field !== 'ring_style') return { success: false, error: 'Invalid appearance field' };
  const patch = field === 'theme' ? { theme: String(value).slice(0, 80) } : { ring_style: String(value).slice(0, 80) };
  const { data, error } = await supabase.from('children').update(patch).eq('id', childId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function submitMission(childId, missionId) {
  return callGameRpc('kaeluma_submit_mission', { p_child_id: childId, p_mission_id: missionId }, submitMissionFallback);
}

export async function undoMission(completionId) {
  return callGameRpc('kaeluma_undo_mission', { p_completion_id: completionId }, undoMissionFallback);
}

export async function redeemReward(childId, rewardId) {
  return callGameRpc('kaeluma_redeem_reward', { p_child_id: childId, p_reward_id: rewardId }, redeemRewardFallback);
}

export async function updateAppearance(childId, field, value) {
  return callGameRpc('kaeluma_update_child_appearance', { p_child_id: childId, p_field: field, p_value: value }, updateAppearanceFallback);
}
