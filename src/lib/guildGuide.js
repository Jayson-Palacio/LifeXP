/**
 * Guild Guide — Kaeluma's first parent-facing agent.
 *
 * Design (privacy-first, no LLM):
 * - Runs entirely in the browser / server from household data you already load.
 * - Never sends child names, quests, or PIN state to a third-party model.
 * - Speaks like a calm guide, not a taskmaster (see brand messaging playbook).
 * - One job: pick the single highest-leverage next move for the parent.
 *
 * Priority ladder (first match wins):
 * 1. Empty household → add a player
 * 2. No quests → seed the morning loop
 * 3. Review queue → clear approvals / redemptions first
 * 4. No rewards → coins need somewhere to go
 * 5. Thin quest board → suggest a missing routine slot
 * 6. Healthy guild → affirm and get out of the way
 */

export const MORNING_STARTERS = [
  { name: 'Make Bed', icon: '🛏️', category: 'Chores', coin_reward: 3 },
  { name: 'Brush Teeth', icon: '🦷', category: 'Health & Hygiene', coin_reward: 3 },
  { name: 'Get Dressed', icon: '👕', category: 'Health & Hygiene', coin_reward: 2 },
];

export const HABIT_STARTERS = [
  { name: 'Read 15 Mins', icon: '📚', category: 'School & Learning', coin_reward: 5 },
  { name: 'Clean Room', icon: '🧹', category: 'Chores', coin_reward: 5 },
  { name: 'Be Kind', icon: '🤝', category: 'Behavior', coin_reward: 4 },
];

function activeMissions(missions = []) {
  return missions.filter((m) => m && m.is_active !== false);
}

function missionNames(missions = []) {
  return new Set(
    activeMissions(missions).map((m) => String(m.name || '').trim().toLowerCase())
  );
}

function missingFrom(catalog, missions) {
  const have = missionNames(missions);
  return catalog.filter((q) => !have.has(q.name.toLowerCase()));
}

function missionsForChild(missions, childId) {
  return activeMissions(missions).filter(
    (m) =>
      !m.assigned_to ||
      m.assigned_to.length === 0 ||
      m.assigned_to.includes(childId)
  );
}

/**
 * @param {{
 *   children?: Array<{ id: string, name?: string, coins?: number }>,
 *   missions?: Array<{ id?: string, name?: string, is_active?: boolean, assigned_to?: string[]|null }>,
 *   rewards?: Array<{ id?: string, is_active?: boolean }>,
 *   pending?: unknown[],
 *   pendingRedemptions?: unknown[],
 *   familyName?: string,
 * }} input
 * @returns {{
 *   kicker: string,
 *   title: string,
 *   body: string,
 *   kind: string,
 *   action: { type: string, label: string } | null,
 *   suggestions: Array<{ name: string, icon: string, category: string, coin_reward: number }>,
 * }}
 */
export function guildGuideNote(input = {}) {
  const children = input.children || [];
  const missions = input.missions || [];
  const rewards = (input.rewards || []).filter((r) => r && r.is_active !== false);
  const pending = input.pending || [];
  const pendingRedemptions = input.pendingRedemptions || [];
  const family = input.familyName || 'Your family';
  const active = activeMissions(missions);
  const queue = pending.length + pendingRedemptions.length;

  if (children.length === 0) {
    return {
      kicker: 'Guild Guide',
      title: 'Add the first player.',
      body: 'Kaeluma starts with one kid on the board. Name them, pick an avatar, then the quest log can do the talking.',
      kind: 'add_player',
      action: { type: 'add_child', label: 'Add player' },
      suggestions: [],
    };
  }

  if (active.length === 0) {
    const suggestions = MORNING_STARTERS;
    return {
      kicker: 'Guild Guide',
      title: 'Give them three morning quests.',
      body: `${children[0].name || 'Your kid'} needs a short loop they can finish without a reminder. Bed, teeth, dressed — then you approve once.`,
      kind: 'seed_quests',
      action: { type: 'add_mission', label: 'Add a quest' },
      suggestions,
    };
  }

  if (queue > 0) {
    const approvals = pending.length;
    const reds = pendingRedemptions.length;
    const bits = [];
    if (approvals) bits.push(`${approvals} quest${approvals === 1 ? '' : 's'} waiting`);
    if (reds) bits.push(`${reds} reward${reds === 1 ? '' : 's'} to hand out`);
    return {
      kicker: 'Guild Guide',
      title: 'Clear the review queue first.',
      body: `${bits.join(' · ')}. Fast approvals keep the dopamine loop honest — redo only when it was not actually done.`,
      kind: 'review_queue',
      action: null,
      suggestions: [],
    };
  }

  if (rewards.length === 0) {
    return {
      kicker: 'Guild Guide',
      title: 'Coins need a shop.',
      body: 'Add one reward they care about — screen time, a movie night, or a small treat. Without a shop, gold piles up and the loop goes quiet.',
      kind: 'add_reward',
      action: { type: 'add_reward', label: 'Add a reward' },
      suggestions: [],
    };
  }

  const thinChild = children.find((c) => missionsForChild(missions, c.id).length < 2);
  if (thinChild) {
    const missing = missingFrom([...MORNING_STARTERS, ...HABIT_STARTERS], missions).slice(0, 3);
    return {
      kicker: 'Guild Guide',
      title: `${thinChild.name || 'Someone'} needs a fuller quest log.`,
      body: 'Two or three daily quests beat a long chore list. Keep it short enough that success is the default.',
      kind: 'thin_board',
      action: { type: 'add_mission', label: 'Add a quest' },
      suggestions: missing,
    };
  }

  const missingHabits = missingFrom(HABIT_STARTERS, missions);
  if (active.length < 4 && missingHabits.length > 0) {
    return {
      kicker: 'Guild Guide',
      title: 'One more habit quest fits.',
      body: `${family} already has a working loop. Add reading, tidy-up, or kindness when you want the board to stretch without nagging.`,
      kind: 'stretch_board',
      action: { type: 'add_mission', label: 'Add a quest' },
      suggestions: missingHabits.slice(0, 3),
    };
  }

  const richest = [...children].sort((a, b) => (b.coins || 0) - (a.coins || 0))[0];
  if (richest && (richest.coins || 0) >= 40 && rewards.length > 0) {
    return {
      kicker: 'Guild Guide',
      title: `${richest.name || 'Someone'} can spend.`,
      body: 'A full coin purse is a nudge to visit the shop. Spending teaches opportunity cost better than another lecture.',
      kind: 'encourage_spend',
      action: null,
      suggestions: [],
    };
  }

  return {
    kicker: 'Guild Guide',
    title: 'The guild is humming.',
    body: `${children.length} player${children.length === 1 ? '' : 's'}, ${active.length} active quest${active.length === 1 ? '' : 's'}, ${rewards.length} reward${rewards.length === 1 ? '' : 's'}. Stay out of the way unless something needs a redo.`,
    kind: 'healthy',
    action: null,
    suggestions: [],
  };
}
