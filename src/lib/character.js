// ─── CHARACTER CONFIGURATION ─────────────────────────────────────────────────

export const PETS = [
  // ─── ANIMALS ──────────────────────────────────────────────────────────────
  { id: 'pup',     name: 'Pup',     levelUnlock: 1,   rarity: 'common',    emoji: '🐶', behavior: 'bounce', tag: 'Loyal & playful' },
  { id: 'kitty',   name: 'Kitty',   levelUnlock: 3,   rarity: 'common',    emoji: '🐱', behavior: 'sway',   tag: 'Purrfect friend' },
  { id: 'bunny',   name: 'Bunny',   levelUnlock: 6,   rarity: 'common',    emoji: '🐰', behavior: 'hop',    tag: 'Quick & fluffy' },
  { id: 'penguin', name: 'Penguin', levelUnlock: 10,  rarity: 'common',    emoji: '🐧', behavior: 'wobble', tag: 'Cool & chill' },
  { id: 'fox',     name: 'Fox',     levelUnlock: 15,  rarity: 'rare',      emoji: '🦊', behavior: 'strut',  tag: 'Clever & sly' },
  { id: 'bear',    name: 'Bear',    levelUnlock: 20,  rarity: 'rare',      emoji: '🐻', behavior: 'stomp',  tag: 'Strong protector' },
  { id: 'panda',   name: 'Panda',   levelUnlock: 30,  rarity: 'rare',      emoji: '🐼', behavior: 'wobble', tag: 'Peaceful giant' },
  { id: 'owl',     name: 'Owl',     levelUnlock: 40,  rarity: 'epic',      emoji: '🦉', behavior: 'sway',   tag: 'Wise & watchful' },
  { id: 'lion',    name: 'Lion',    levelUnlock: 60,  rarity: 'epic',      emoji: '🦁', behavior: 'strut',  tag: 'Majestic king' },
  { id: 'dragon',  name: 'Dragon',  levelUnlock: 80,  rarity: 'legendary', emoji: '🐉', behavior: 'float',  tag: 'Fire-breathing ancient' },

  // ─── ROBOTS ───────────────────────────────────────────────────────────────
  { id: 'bot',    name: 'Bot',    levelUnlock: 2,   rarity: 'common',    emoji: '🤖', behavior: 'bounce', tag: 'Helpful little buddy' },
  { id: 'pixel',  name: 'Pixel',  levelUnlock: 5,   rarity: 'common',    emoji: '👾', behavior: 'hop',    tag: '8-bit adventurer' },
  { id: 'spark',  name: 'Spark',  levelUnlock: 8,   rarity: 'common',    emoji: '⚡', behavior: 'flip',   tag: 'Shocking fast!' },
  { id: 'gear',   name: 'Gear',   levelUnlock: 12,  rarity: 'rare',      emoji: '⚙️', behavior: 'pulse',  tag: 'Spinning mechanic' },
  { id: 'astro',  name: 'Astro',  levelUnlock: 18,  rarity: 'rare',      emoji: '🚀', behavior: 'float',  tag: 'Space explorer' },
  { id: 'turbo',  name: 'Turbo',  levelUnlock: 25,  rarity: 'rare',      emoji: '🏎️', behavior: 'strut',  tag: 'Blazing speed' },
  { id: 'chrome', name: 'Chrome', levelUnlock: 35,  rarity: 'epic',      emoji: '🪩', behavior: 'sway',   tag: 'Mirror-polished elite' },
  { id: 'glitch', name: 'Glitch', levelUnlock: 50,  rarity: 'epic',      emoji: '💠', behavior: 'flip',   tag: 'Matrix entity' },
  { id: 'nova',   name: 'Nova',   levelUnlock: 70,  rarity: 'epic',      emoji: '🌌', behavior: 'pulse',  tag: 'Star-powered' },
  { id: 'zenith', name: 'Zenith', levelUnlock: 100, rarity: 'legendary', emoji: '👑', behavior: 'float',  tag: 'The ultimate machine' },
];

export const RARITY_COLORS = {
  common:    { bg: '#1E293B', text: '#94A3B8', border: '#334155', glow: false },
  rare:      { bg: '#0C4A6E', text: '#38BDF8', border: '#0284C7', glow: true },
  epic:      { bg: '#4C1D95', text: '#C084FC', border: '#7C3AED', glow: true },
  legendary: { bg: '#713F12', text: '#FDE047', border: '#CA8A04', glow: true },
};

export function checkCharacterUnlocks(oldLevel, newLevel) {
  if (newLevel <= oldLevel) return [];
  return PETS.filter(p => p.levelUnlock > oldLevel && p.levelUnlock <= newLevel);
}

export function getUnlockedPets(level) {
  return PETS.filter(p => level >= p.levelUnlock);
}

export function parseCharacter(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}
