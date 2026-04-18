// ─── Pet Companion System ─────────────────────────────────────────────────────
// Completely replaces the old multi-layer avatar builder.
// Everything is now a simple { petId } stored in the `character` column.

export const PETS = [
  {
    id: 'dog',     name: 'Pup',       levelUnlock: 1,  rarity: 'common',
    emoji: '🐶',   behavior: 'bounce', tag: 'Your loyal first friend',
  },
  {
    id: 'cat',     name: 'Kitty',     levelUnlock: 1,  rarity: 'common',
    emoji: '🐱',   behavior: 'sway',   tag: 'Cool and a little mysterious',
  },
  {
    id: 'bunny',   name: 'Bunny',     levelUnlock: 5,  rarity: 'common',
    emoji: '🐰',   behavior: 'hop',    tag: 'Bouncy and full of energy',
  },
  {
    id: 'hamster', name: 'Hamster',   levelUnlock: 9,  rarity: 'common',
    emoji: '🐹',   behavior: 'wobble', tag: 'Chubby-cheeked little buddy',
  },
  {
    id: 'fox',     name: 'Fox',       levelUnlock: 14, rarity: 'rare',
    emoji: '🦊',   behavior: 'strut',  tag: 'Clever, quick, and stylish',
  },
  {
    id: 'frog',    name: 'Froggy',    levelUnlock: 19, rarity: 'rare',
    emoji: '🐸',   behavior: 'jump',   tag: 'Always ready to leap',
  },
  {
    id: 'penguin', name: 'Penguin',   levelUnlock: 25, rarity: 'rare',
    emoji: '🐧',   behavior: 'waddle', tag: 'Cool as ice',
  },
  {
    id: 'panda',   name: 'Panda',     levelUnlock: 32, rarity: 'rare',
    emoji: '🐼',   behavior: 'wave',   tag: 'Rare, calm, and wise',
  },
  {
    id: 'wolf',    name: 'Wolf',      levelUnlock: 42, rarity: 'epic',
    emoji: '🐺',   behavior: 'howl',   tag: 'Leader of the pack',
  },
  {
    id: 'dragon',  name: 'Dragon',    levelUnlock: 55, rarity: 'epic',
    emoji: '🐲',   behavior: 'flap',   tag: 'Ancient fire and power',
  },
  {
    id: 'unicorn', name: 'Unicorn',   levelUnlock: 75, rarity: 'legendary',
    emoji: '🦄',   behavior: 'float',  tag: 'Pure magic, pure you',
  },
  {
    id: 'phoenix', name: 'Phoenix',   levelUnlock: 100,rarity: 'legendary',
    emoji: '🔥',   behavior: 'blaze',  tag: 'Born from the flames of triumph',
  },
];

export const RARITY_COLORS = {
  common:    { color: '#94a3b8', glow: 'rgba(148,163,184,0.25)', label: 'Common' },
  rare:      { color: '#38bdf8', glow: 'rgba(56,189,248,0.35)',  label: 'Rare' },
  epic:      { color: '#a855f7', glow: 'rgba(168,85,247,0.35)',  label: 'Epic' },
  legendary: { color: '#facc15', glow: 'rgba(250,204,21,0.4)',   label: 'Legendary' },
};

export function getUnlockedPets(level) {
  return PETS.filter(p => level >= p.levelUnlock);
}

export function checkPetUnlocks(oldLevel, newLevel) {
  return PETS.filter(p => p.levelUnlock > oldLevel && p.levelUnlock <= newLevel);
}

export function parseCharacter(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}

// Re-export for backwards compat with any existing imports
export { checkPetUnlocks as checkCharacterUnlocks };
