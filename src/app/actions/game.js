'use server';

import { requireUser } from '../../lib/authz';

async function callGameRpc(name, args) {
  const { user, supabase } = await requireUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  const { data, error } = await supabase.rpc(name, args);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function submitMission(childId, missionId) {
  return callGameRpc('kaeluma_submit_mission', { p_child_id: childId, p_mission_id: missionId });
}

export async function undoMission(completionId) {
  return callGameRpc('kaeluma_undo_mission', { p_completion_id: completionId });
}

export async function redeemReward(childId, rewardId) {
  return callGameRpc('kaeluma_redeem_reward', { p_child_id: childId, p_reward_id: rewardId });
}

export async function updateAppearance(childId, field, value) {
  return callGameRpc('kaeluma_update_child_appearance', { p_child_id: childId, p_field: field, p_value: value });
}
