// ============================================
// STATE MANAGER — Supabase CRUD
// ============================================

import { supabase } from './supabase.js';
import { getLevelForXP } from './utils/levels.js';
import { todayStr, yesterdayStr, isSameDay } from './utils/dates.js';

// ============================================
// HELPERS
// ============================================

// Map DB snake_case to JS camelCase
function mapChild(db) {
  if (!db) return null;
  return {
    id: db.id,
    name: db.name,
    avatar: db.avatar,
    xp: db.xp,
    coins: db.coins,
    level: db.level,
    streak: db.streak,
    lastCompletionDate: db.last_completion_date,
    pendingLevelUp: db.pending_level_up,
    newLevel: db.new_level_info,
    theme: db.theme,
  };
}

function mapMission(db) {
  if (!db) return null;
  return {
    id: db.id,
    name: db.name,
    xpReward: db.xp_reward,
    coinReward: db.coin_reward,
    icon: db.icon,
    isRecurring: db.is_recurring,
    maxCompletions: db.max_completions,
  };
}

function mapCompletion(db) {
  if (!db) return null;
  return {
    id: db.id,
    missionId: db.mission_id,
    childId: db.child_id,
    status: db.status,
    submittedAt: db.submitted_at,
    reviewedAt: db.reviewed_at,
  };
}

function mapReward(db) {
  if (!db) return null;
  return {
    id: db.id,
    name: db.name,
    cost: db.cost,
    icon: db.icon,
  };
}

function mapRedemption(db) {
  if (!db) return null;
  return {
    id: db.id,
    rewardId: db.reward_id,
    childId: db.child_id,
    redeemedAt: db.redeemed_at,
  };
}

// ============================================
// SETUP
// ============================================

async function getAppSettings() {
  const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
  if (error && error.code !== 'PGRST116') console.error('getAppSettings error:', error);
  return data;
}

export async function isSetupComplete() {
  const settings = await getAppSettings();
  return !!settings?.setup_complete;
}

export async function completeSetup(pin) {
  const settings = await getAppSettings();
  if (settings) {
    await supabase.from('app_settings').update({ parent_pin: pin, setup_complete: true }).eq('id', settings.id);
  } else {
    await supabase.from('app_settings').insert({ parent_pin: pin, setup_complete: true });
  }
}

export async function verifyPin(pin) {
  const settings = await getAppSettings();
  return settings?.parent_pin === pin;
}

// ============================================
// CHILDREN
// ============================================

export async function getChildren() {
  const { data } = await supabase.from('children').select('*').order('name');
  return (data || []).map(mapChild);
}

export async function getChild(id) {
  const { data } = await supabase.from('children').select('*').eq('id', id).single();
  return mapChild(data);
}

export async function addChild(name, avatar) {
  const { data } = await supabase.from('children').insert({
    name,
    avatar,
    xp: 0,
    coins: 0,
    level: 1,
    streak: 0,
  }).select().single();
  return mapChild(data);
}

export async function updateChild(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
  if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
  if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
  if (updates.coins !== undefined) dbUpdates.coins = updates.coins;
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
  if (updates.lastCompletionDate !== undefined) dbUpdates.last_completion_date = updates.lastCompletionDate;
  if (updates.pendingLevelUp !== undefined) dbUpdates.pending_level_up = updates.pendingLevelUp;
  if (updates.newLevel !== undefined) dbUpdates.new_level_info = updates.newLevel;

  await supabase.from('children').update(dbUpdates).eq('id', id);
}

export async function updateChildTheme(id, theme) {
  await updateChild(id, { theme });
}

export async function deleteChild(id) {
  await supabase.from('children').delete().eq('id', id);
}

// ============================================
// MISSIONS
// ============================================

export async function getMissions() {
  const { data } = await supabase.from('missions').select('*').order('name');
  return (data || []).map(mapMission);
}

export async function getMission(id) {
  const { data } = await supabase.from('missions').select('*').eq('id', id).single();
  return mapMission(data);
}

export async function addMission(name, xpReward, coinReward, icon = '⭐', isRecurring = true, maxCompletions = 1) {
  const { data } = await supabase.from('missions').insert({
    name,
    xp_reward: parseInt(xpReward) || 10,
    coin_reward: parseInt(coinReward) || 5,
    icon,
    is_recurring: isRecurring,
    max_completions: parseInt(maxCompletions) || 1,
  }).select().single();
  return mapMission(data);
}

export async function updateMission(id, updates) {
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.xpReward !== undefined) dbUpdates.xp_reward = updates.xpReward;
  if (updates.coinReward !== undefined) dbUpdates.coin_reward = updates.coinReward;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
  if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
  if (updates.maxCompletions !== undefined) dbUpdates.max_completions = updates.maxCompletions;

  await supabase.from('missions').update(dbUpdates).eq('id', id);
}

export async function deleteMission(id) {
  await supabase.from('missions').delete().eq('id', id);
}

// ============================================
// COMPLETIONS
// ============================================

export async function getCompletions() {
  const { data } = await supabase.from('completions').select('*');
  return (data || []).map(mapCompletion);
}

export async function getPendingCompletions() {
  const { data } = await supabase.from('completions').select('*').eq('status', 'pending').order('submitted_at');
  return (data || []).map(mapCompletion);
}

export async function getTodayCompletionsForChild(childId) {
  const today = todayStr();
  // Postgres comparison: submitted_at >= 'YYYY-MM-DD' and submitted_at < 'YYYY-MM-DD+1'
  // Or simpler: fetch child's completions, filter in JS for today (like before) since the payload is small anyway.
  const { data } = await supabase.from('completions').select('*').eq('child_id', childId);
  const all = (data || []).map(mapCompletion);
  return all.filter(c => {
    const submittedDate = c.submittedAt.split('T')[0];
    return submittedDate === today;
  });
}

export async function submitCompletion(missionId, childId) {
  const { data } = await supabase.from('completions').insert({
    mission_id: missionId,
    child_id: childId,
    status: 'pending'
  }).select().single();
  return mapCompletion(data);
}

export async function approveCompletion(completionId) {
  const { data: compDb } = await supabase.from('completions').select('*').eq('id', completionId).single();
  if (!compDb || compDb.status !== 'pending') return null;
  const completion = mapCompletion(compDb);

  const [mission, child] = await Promise.all([
    getMission(completion.missionId),
    getChild(completion.childId)
  ]);

  if (!mission || !child) return null;

  // Update completion status
  await supabase.from('completions').update({
    status: 'approved',
    reviewed_at: new Date().toISOString()
  }).eq('id', completionId);

  // Award XP + coins
  const oldLevel = child.level;

  const today = todayStr();
  const yesterday = yesterdayStr();
  
  let newStreak = child.streak;
  let newLastCompletionDate = child.lastCompletionDate;

  if (child.lastCompletionDate === null || (!isSameDay(child.lastCompletionDate, today) && !isSameDay(child.lastCompletionDate, yesterday))) {
    newStreak = 1;
  } else if (isSameDay(child.lastCompletionDate, yesterday)) {
    newStreak += 1;
  }
  newLastCompletionDate = today;

  let bonusXP = 0;
  if (newStreak >= 7) bonusXP = 30;
  else if (newStreak >= 5) bonusXP = 20;
  else if (newStreak >= 3) bonusXP = 10;
  else if (newStreak >= 2) bonusXP = 5;

  let newXp = child.xp + mission.xpReward + bonusXP;
  let newCoins = child.coins + mission.coinReward;

  const newLevelInfo = getLevelForXP(newXp);
  let finalLevel = child.level;
  let pendingLvlUp = child.pendingLevelUp;
  let finalNewLevelInfo = child.newLevel;

  if (newLevelInfo.level > oldLevel) {
    finalLevel = newLevelInfo.level;
    pendingLvlUp = true;
    finalNewLevelInfo = newLevelInfo;
  }

  // Save to DB
  await updateChild(child.id, {
    xp: newXp,
    coins: newCoins,
    level: finalLevel,
    streak: newStreak,
    lastCompletionDate: newLastCompletionDate,
    pendingLevelUp: pendingLvlUp,
    newLevel: finalNewLevelInfo
  });

  const updatedChild = await getChild(child.id);

  return {
    completion,
    mission,
    child: updatedChild,
    bonusXP,
    leveledUp: finalLevel > oldLevel,
  };
}

export async function rejectCompletion(completionId) {
  await supabase.from('completions').update({
    status: 'rejected',
    reviewed_at: new Date().toISOString()
  }).eq('id', completionId);
}

// ============================================
// REWARDS
// ============================================

export async function getRewards() {
  const { data } = await supabase.from('rewards').select('*').order('cost');
  return (data || []).map(mapReward);
}

export async function addReward(name, cost, icon = '🎁') {
  const { data } = await supabase.from('rewards').insert({
    name,
    cost: parseInt(cost) || 10,
    icon,
  }).select().single();
  return mapReward(data);
}

export async function updateReward(id, updates) {
  await supabase.from('rewards').update(updates).eq('id', id);
}

export async function deleteReward(id) {
  await supabase.from('rewards').delete().eq('id', id);
}

// ============================================
// REDEMPTIONS
// ============================================

export async function redeemReward(rewardId, childId) {
  const [reward, child] = await Promise.all([
    (async () => {
      const { data } = await supabase.from('rewards').select('*').eq('id', rewardId).single();
      return mapReward(data);
    })(),
    getChild(childId)
  ]);

  if (!reward || !child) return null;
  if (child.coins < reward.cost) return null;

  // Deduct coins
  await updateChild(child.id, { coins: child.coins - reward.cost });

  // Record redemption
  const { data: redDb } = await supabase.from('redemptions').insert({
    reward_id: rewardId,
    child_id: childId
  }).select().single();
  
  return { reward, child: await getChild(child.id), redemption: mapRedemption(redDb) };
}

export async function getRedemptions() {
  const { data } = await supabase.from('redemptions').select('*');
  return (data || []).map(mapRedemption);
}

// ============================================
// CLEAR LEVEL UP FLAG
// ============================================

export async function clearLevelUp(childId) {
  await updateChild(childId, {
    pendingLevelUp: false,
    newLevel: null
  });
}

// ============================================
// RESET (dev / debug)
// ============================================

export async function resetAll() {
  console.warn("Reset All is deprecated on Supabase to prevent accidental wipe out of live tables. Delete rows manually in Supabase editor.");
}
