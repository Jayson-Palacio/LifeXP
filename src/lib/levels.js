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
  // Level 1: Basics
  { id: 'seedling',      name: 'Seedling Green',  hex: '#4ade80', levelUnlock: 1 },
  { id: 'bubblegum',     name: 'Bubblegum Pink',  hex: '#f472b6', levelUnlock: 1 },
  { id: 'ocean',         name: 'Ocean Blue',      hex: '#38bdf8', levelUnlock: 1 },
  // Level 3-10
  { id: 'morning-sky',   name: 'Morning Sky',     hex: '#7dd3fc', levelUnlock: 3 },
  { id: 'lavender-mist', name: 'Lavender Mist',   hex: '#c084fc', levelUnlock: 5 },
  { id: 'golden-hour',   name: 'Golden Hour',     hex: '#fbbf24', levelUnlock: 7 },
  { id: 'mint',          name: 'Fresh Mint',      hex: '#34d399', levelUnlock: 10 },
  // Level 12-25
  { id: 'coral',         name: 'Coral Reef',      hex: '#fb7185', levelUnlock: 12 },
  { id: 'sunny',         name: 'Sunny Day',       hex: '#facc15', levelUnlock: 15 },
  { id: 'forest-deep',   name: 'Forest Deep',     hex: '#059669', levelUnlock: 18 },
  { id: 'sky',           name: 'Bright Sky',      hex: '#0ea5e9', levelUnlock: 20 },
  { id: 'violet',        name: 'Deep Violet',     hex: '#8b5cf6', levelUnlock: 25 },
  // Level 30-45
  { id: 'crimson',       name: 'Crimson Red',     hex: '#e11d48', levelUnlock: 30 },
  { id: 'teal',          name: 'Ocean Teal',      hex: '#14b8a6', levelUnlock: 35 },
  { id: 'stone',         name: 'Stone Gray',      hex: '#94a3b8', levelUnlock: 40 },
  { id: 'candle-flame',  name: 'Candle Flame',    hex: '#f59e0b', levelUnlock: 45 },
  // Level 50-70
  { id: 'indigo',        name: 'Deep Indigo',     hex: '#6366f1', levelUnlock: 50 },
  { id: 'ruby',          name: 'Ruby Gem',        hex: '#be123c', levelUnlock: 55 },
  { id: 'emerald',       name: 'Emerald Gem',     hex: '#10b981', levelUnlock: 60 },
  { id: 'sapphire',      name: 'Sapphire Gem',    hex: '#1d4ed8', levelUnlock: 65 },
  { id: 'amethyst',      name: 'Amethyst',        hex: '#7e22ce', levelUnlock: 70 },
  // Level 75-90 (Neon)
  { id: 'neon-pink',     name: 'Neon Pink',       hex: '#ff00ff', levelUnlock: 75 },
  { id: 'neon-cyan',     name: 'Neon Cyan',       hex: '#00ffff', levelUnlock: 80 },
  { id: 'electric-blue', name: 'Electric Blue',   hex: '#2563eb', levelUnlock: 85 },
  { id: 'plasma',        name: 'Plasma Green',    hex: '#39ff14', levelUnlock: 90 },
  // Level 92-100 (Epic/Creative gradients)
  { id: 'sunset-split',  name: 'Sunset Split',    hex: 'gradient-sunset', levelUnlock: 92 },
  { id: 'midnight-split',name: 'Midnight Split',  hex: 'gradient-midnight', levelUnlock: 94 },
  { id: 'galactic',      name: 'Galactic Void',   hex: 'gradient-galactic', levelUnlock: 96 },
  { id: 'magma',         name: 'Molten Magma',    hex: 'gradient-magma', levelUnlock: 98 },
  { id: 'rainbow',       name: 'Rainbow Dash',    hex: 'gradient-rainbow', levelUnlock: 99 },
  { id: 'everlight',     name: 'Everlight (Max)', hex: 'animated', levelUnlock: 100 }
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
