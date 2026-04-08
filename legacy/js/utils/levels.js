// ============================================
// LEVEL SYSTEM
// ============================================

export const LEVELS = [
  { level: 1, xp: 0,    title: "Rookie",    emoji: "🐣" },
  { level: 2, xp: 50,   title: "Helper",    emoji: "🧹" },
  { level: 3, xp: 120,  title: "Explorer",  emoji: "🧭" },
  { level: 4, xp: 200,  title: "Hero",      emoji: "🦸" },
  { level: 5, xp: 300,  title: "Champion",  emoji: "🏆" },
  { level: 6, xp: 450,  title: "Legend",    emoji: "⚡" },
  { level: 7, xp: 650,  title: "Master",    emoji: "👑" },
  { level: 8, xp: 900,  title: "Grandmaster", emoji: "🌟" },
];

/**
 * Returns the level info for a given XP total.
 */
export function getLevelForXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl;
    else break;
  }
  return current;
}

/**
 * Returns the next level info, or null if at max level.
 */
export function getNextLevel(currentLevel) {
  const idx = LEVELS.findIndex(l => l.level === currentLevel);
  if (idx < 0 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

/**
 * Returns XP progress as a fraction (0-1) towards the next level.
 */
export function getXPProgress(xp) {
  const current = getLevelForXP(xp);
  const next = getNextLevel(current.level);
  if (!next) return 1; // max level
  const xpIntoLevel = xp - current.xp;
  const xpNeeded = next.xp - current.xp;
  return xpIntoLevel / xpNeeded;
}

/**
 * Returns a display string like "135 / 200 XP"
 */
export function getXPDisplay(xp) {
  const current = getLevelForXP(xp);
  const next = getNextLevel(current.level);
  if (!next) return `${xp} XP (MAX)`;
  return `${xp} / ${next.xp} XP`;
}
