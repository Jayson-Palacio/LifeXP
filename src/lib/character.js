// ─── Pet Companion System ─────────────────────────────────────────────────────
// Clean, modern vector companions — mixing cute and cool/warrior options.

export const PETS = [
  {
    id: 'pup',     name: 'Pup',       levelUnlock: 1,  rarity: 'common',
    emoji: '🐶',   behavior: 'bounce', tag: 'Your loyal first friend',
  },
  {
    id: 'kitty',   name: 'Kitty',     levelUnlock: 1,  rarity: 'common',
    emoji: '🐱',   behavior: 'sway',   tag: 'Cool and a little mysterious',
  },
  {
    id: 'bot',     name: 'Sparkbot',  levelUnlock: 2,  rarity: 'common',
    emoji: '🤖',   behavior: 'float',  tag: 'Compact hovering helper',
  },
  {
    id: 'ninja',   name: 'Shadow',    levelUnlock: 4,  rarity: 'common',
    emoji: '🥷',   behavior: 'flip',   tag: 'Silent and quick',
  },
  {
    id: 'fox',     name: 'Fox',       levelUnlock: 8,  rarity: 'rare',
    emoji: '🦊',   behavior: 'strut',  tag: 'Clever and stylish',
  },
  {
    id: 'trex',    name: 'Rex',       levelUnlock: 12, rarity: 'rare',
    emoji: '🦖',   behavior: 'stomp',  tag: 'Tiny arms, huge attitude',
  },
  {
    id: 'penguin', name: 'Penguin',   levelUnlock: 18, rarity: 'rare',
    emoji: '🐧',   behavior: 'waddle', tag: 'Cool as absolute zero',
  },
  {
    id: 'knight',  name: 'Paladin',   levelUnlock: 24, rarity: 'rare',
    emoji: '🛡️',   behavior: 'guard',  tag: 'Brave protector of the realm',
  },
  {
    id: 'wolf',    name: 'Wolf',      levelUnlock: 35, rarity: 'epic',
    emoji: '🐺',   behavior: 'howl',   tag: 'Fierce leader of the pack',
  },
  {
    id: 'mech',    name: 'Mechatron', levelUnlock: 50, rarity: 'epic',
    emoji: '🦾',   behavior: 'pulse',  tag: 'Heavy armored warrior',
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

export { checkPetUnlocks as checkCharacterUnlocks };
