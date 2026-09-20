export const TIERS = [
  { levelMax: 10,  name: 'The Beginning', symbol: '🌱', colorTheme: 'seedling' },
  { levelMax: 20,  name: 'The Seeker',    symbol: '🧭', colorTheme: 'ocean' },
  { levelMax: 30,  name: 'The Grower',    symbol: '🌿', colorTheme: 'golden-hour' },
  { levelMax: 40,  name: 'The Aware',     symbol: '👁',  colorTheme: 'forest-deep' },
  { levelMax: 50,  name: 'The Steady',    symbol: '⛰',  colorTheme: 'violet' },
  { levelMax: 60,  name: 'The Wise',      symbol: '🕯',  colorTheme: 'stone' },
  { levelMax: 70,  name: 'The Chosen',    symbol: '✦',  colorTheme: 'candle-flame' },
  { levelMax: 80,  name: 'The Devoted',   symbol: '🌊', colorTheme: 'indigo' },
  { levelMax: 90,  name: 'The Guiding',   symbol: '🏮', colorTheme: 'coral' },
  { levelMax: 100, name: 'The Everlight', symbol: '☀',  colorTheme: 'golden-hour' }
];

export const COLORS = [
  { id: 'seedling',      name: 'Green',   hex: '#4ade80', levelUnlock: 1 },
  { id: 'ocean',         name: 'Sky',     hex: '#38bdf8', levelUnlock: 1 },
  { id: 'bubblegum',     name: 'Pink',    hex: '#f472b6', levelUnlock: 1 },
  { id: 'golden-hour',   name: 'Gold',    hex: '#fbbf24', levelUnlock: 6 },
  { id: 'violet',        name: 'Violet',  hex: '#8b5cf6', levelUnlock: 10 },
  { id: 'coral',         name: 'Coral',   hex: '#fb7185', levelUnlock: 16 },
  { id: 'forest-deep',   name: 'Forest',  hex: '#059669', levelUnlock: 24 },
  { id: 'crimson',       name: 'Crimson', hex: '#e11d48', levelUnlock: 32 },
  { id: 'stone',         name: 'Stone',   hex: '#94a3b8', levelUnlock: 42 },
  { id: 'candle-flame',  name: 'Amber',   hex: '#f59e0b', levelUnlock: 52 },
  { id: 'indigo',        name: 'Indigo',  hex: '#6366f1', levelUnlock: 64 },
  { id: 'sapphire',      name: 'Navy',    hex: '#1d4ed8', levelUnlock: 80 },
];

/* Stored on children.ring_style; not shown in the UI anymore. */
export const RING_STYLES = [
  { id: 'solid',      name: 'Solid',         levelUnlock: 1,  description: 'Clean solid line' },
  { id: 'pulse',      name: 'Pulse',         levelUnlock: 5,  description: 'Soft breathing glow' },
  { id: 'double',     name: 'Double Ring',   levelUnlock: 10, description: 'Two stacked rings' },
  { id: 'neon',       name: 'Neon',          levelUnlock: 20, description: 'Hard neon glow' },
  { id: 'spin',       name: 'Spin',          levelUnlock: 30, description: 'Rotating conic gradient' },
  { id: 'shimmer',    name: 'Shimmer',       levelUnlock: 40, description: 'Sweeping light sheen' },
  { id: 'plasma',     name: 'Plasma',        levelUnlock: 55, description: 'Multi-color animated plasma' },
  { id: 'fire',       name: 'Fire',          levelUnlock: 70, description: 'Flickering fire aura' },
  { id: 'galaxy',     name: 'Galaxy',        levelUnlock: 85, description: 'Deep space starfield spin' },
  { id: 'legendary',  name: '✦ Legendary',   levelUnlock: 100, description: 'Full rainbow prismatic spin' },
];

export function getUnlockedRings(level) {
  return RING_STYLES.filter(r => level >= r.levelUnlock);
}

// Exponential XP curve generator
// Level 1: 0 XP
// Level 10: ~1,500 XP
// Level 50: ~25,000 XP
// Level 100: ~80,000 XP
export function getXPForLevel(level) {
  if (level <= 1) return 0;
  // A curve that starts gentle and grows steeper, aiming for ~80k at 100
  // Formula: Base * (Level^EXPONENT)
  const base = 50; 
  const exponent = 1.6;
  return Math.floor(base * Math.pow(level, exponent));
}

// Get the current level based on total XP
export function getLevelForXP(totalXp) {
  let level = 1;
  while (level < 100 && totalXp >= getXPForLevel(level + 1)) {
    level++;
  }
  
  const currentTier = TIERS.find(t => level <= t.levelMax) || TIERS[TIERS.length - 1];

  return {
    level,
    tierName: currentTier.name,
    tierSymbol: currentTier.symbol,
    tierColor: currentTier.colorTheme
  };
}

// Returns the progress fraction (0.0 to 1.0) towards the NEXT level
export function getXPProgress(totalXp) {
  const { level } = getLevelForXP(totalXp);
  if (level >= 100) return 1;

  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;

  return xpIntoLevel / xpNeededForNext;
}

// Display string: e.g., "350 / 500"
export function getXPDisplay(totalXp) {
  const { level } = getLevelForXP(totalXp);
  if (level >= 100) return "MAX LEVEL";

  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpIntoLevel = Math.floor(totalXp - currentLevelXP);
  const xpNeededForNext = Math.floor(nextLevelXP - currentLevelXP);

  return `${xpIntoLevel} / ${xpNeededForNext}`;
}

export function getUnlockedColors(level) {
  return COLORS.filter(c => level >= c.levelUnlock);
}

// Check for newly unlocked colors based on old vs new level
export function checkColorUnlocks(oldLevel, newLevel) {
  if (newLevel <= oldLevel) return [];
  return COLORS.filter(c => c.levelUnlock > oldLevel && c.levelUnlock <= newLevel);
}

