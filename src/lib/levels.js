export const TIERS = [
  { levelMax: 10,  name: 'The Beginning', symbol: '🌱', colorTheme: 'seedling' },
  { levelMax: 20,  name: 'The Seeker',    symbol: '🧭', colorTheme: 'morning-sky' },
  { levelMax: 30,  name: 'The Grower',    symbol: '🌿', colorTheme: 'golden-hour' },
  { levelMax: 40,  name: 'The Aware',     symbol: '👁',  colorTheme: 'forest-deep' },
  { levelMax: 50,  name: 'The Steady',    symbol: '⛰',  colorTheme: 'lavender-mist' },
  { levelMax: 60,  name: 'The Wise',      symbol: '🕯',  colorTheme: 'stone' },
  { levelMax: 70,  name: 'The Chosen',    symbol: '✦',  colorTheme: 'candle-flame' },
  { levelMax: 80,  name: 'The Devoted',   symbol: '🌊', colorTheme: 'celestial' },
  { levelMax: 90,  name: 'The Guiding',   symbol: '🏮', colorTheme: 'rose-gold' },
  { levelMax: 100, name: 'The Everlight', symbol: '☀',  colorTheme: 'everlight' }
];

export const COLORS = [
  { id: 'seedling',      name: 'Seedling Green',  hex: '#4ade80', levelUnlock: 1 },
  { id: 'morning-sky',   name: 'Morning Sky',     hex: '#7dd3fc', levelUnlock: 5 },
  { id: 'golden-hour',   name: 'Golden Hour',     hex: '#fbbf24', levelUnlock: 10 },
  { id: 'forest-deep',   name: 'Forest Deep',     hex: '#059669', levelUnlock: 15 },
  { id: 'lavender-mist', name: 'Lavender Mist',   hex: '#a78bfa', levelUnlock: 20 },
  { id: 'stone',         name: 'Stone',           hex: '#94a3b8', levelUnlock: 30 },
  { id: 'candle-flame',  name: 'Candle Flame',    hex: '#f59e0b', levelUnlock: 40 },
  { id: 'celestial',     name: 'Celestial',       hex: '#818cf8', levelUnlock: 50 },
  { id: 'rose-gold',     name: 'Rose Gold',       hex: '#fb7185', levelUnlock: 65 },
  { id: 'sapphire',      name: 'Deep Sapphire',   hex: '#3b82f6', levelUnlock: 80 },
  { id: 'everlight',     name: 'Everlight',       hex: 'animated', levelUnlock: 100 }
];

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
