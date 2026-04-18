// ─── CHARACTER CONFIGURATION ────────────────────────────────────────────────

export const PETS = [
  // ─── ANIMALS 🐾 ────────────────────────────────────────────────────────────
  { id: 'pup',      name: 'Pup',       levelUnlock: 1,  rarity: 'common', emoji: '🐶', behavior: 'bounce', tag: 'Loyal and playful' },
  { id: 'kitty',    name: 'Kitty',     levelUnlock: 2,  rarity: 'common', emoji: '🐱', behavior: 'sway',   tag: 'Purrfect friend' },
  { id: 'bunny',    name: 'Bunny',     levelUnlock: 4,  rarity: 'common', emoji: '🐰', behavior: 'hop',    tag: 'Quick and fluffy' },
  { id: 'fox',      name: 'Fox',       levelUnlock: 12, rarity: 'rare',   emoji: '🦊', behavior: 'strut',  tag: 'Clever and sly' },
  { id: 'bear',     name: 'Bear',      levelUnlock: 18, rarity: 'rare',   emoji: '🐻', behavior: 'guard',  tag: 'Strong protector' },
  { id: 'wolf',     name: 'Wolf',      levelUnlock: 35, rarity: 'epic',   emoji: '🐺', behavior: 'howl',   tag: 'Fierce pack leader' },
  { id: 'lion',     name: 'Lion',      levelUnlock: 42, rarity: 'epic',   emoji: '🦁', behavior: 'strut',  tag: 'Majestic king' },
  { id: 'eagle',    name: 'Eagle',     levelUnlock: 48, rarity: 'epic',   emoji: '🦅', behavior: 'flap',   tag: 'Soaring freedom' },
  { id: 'panther',  name: 'Panther',   levelUnlock: 70, rarity: 'legendary', emoji: '🐆', behavior: 'strut', tag: 'Sleek night hunter' },
  { id: 'panda',    name: 'Panda',     levelUnlock: 85, rarity: 'legendary', emoji: '🐼', behavior: 'wobble',tag: 'Peaceful bamboo giant' },

  // ─── DINOS & MYTHIC 🦖 ───────────────────────────────────────────────────
  { id: 'trike',    name: 'Trike',     levelUnlock: 3,  rarity: 'common', emoji: '🦕', behavior: 'stomp',  tag: 'Three-horned hero' },
  { id: 'raptor',   name: 'Raptor',    levelUnlock: 6,  rarity: 'common', emoji: '🦖', behavior: 'strut',  tag: 'Speedy runner' },
  { id: 'ptero',    name: 'Ptero',     levelUnlock: 15, rarity: 'rare',   emoji: '🦇', behavior: 'flap',   tag: 'Sky ruler' },
  { id: 'stego',    name: 'Stego',     levelUnlock: 22, rarity: 'rare',   emoji: '🦕', behavior: 'stomp',  tag: 'Spiked defender' },
  { id: 'ankylo',   name: 'Ankylo',    levelUnlock: 28, rarity: 'rare',   emoji: '🦕', behavior: 'stomp',  tag: 'Armored tank' },
  { id: 'rex',      name: 'Rex',       levelUnlock: 45, rarity: 'epic',   emoji: '🦖', behavior: 'stomp',  tag: 'The fierce king' },
  { id: 'spino',    name: 'Spino',     levelUnlock: 52, rarity: 'epic',   emoji: '🦕', behavior: 'wobble', tag: 'Sail-backed predator' },
  { id: 'griffin',  name: 'Griffin',   levelUnlock: 75, rarity: 'legendary', emoji: '🦅', behavior: 'flap',  tag: 'Mythical beast' },
  { id: 'dragon',   name: 'Dragon',    levelUnlock: 88, rarity: 'legendary', emoji: '🐉', behavior: 'flap',  tag: 'Fire-breathing ancient' },
  { id: 'phoenix',  name: 'Phoenix',   levelUnlock: 95, rarity: 'legendary', emoji: '🔥', behavior: 'pulse', tag: 'Reborn bird of fire' },

  // ─── TECH & SCI-FI 🤖 ────────────────────────────────────────────────────
  { id: 'sparkbot', name: 'Sparkbot',  levelUnlock: 5,  rarity: 'common', emoji: '🤖', behavior: 'float',  tag: 'Helpful hover bot' },
  { id: 'gear',     name: 'Gear',      levelUnlock: 8,  rarity: 'common', emoji: '⚙️', behavior: 'pulse',  tag: 'Spinning drone' },
  { id: 'astro',    name: 'Astro',     levelUnlock: 16, rarity: 'rare',   emoji: '👨‍🚀', behavior: 'float',  tag: 'Space explorer' },
  { id: 'zap',      name: 'Zap',       levelUnlock: 25, rarity: 'rare',   emoji: '⚡', behavior: 'flip',   tag: 'Lightning fast' },
  { id: 'mechatron',name: 'Mechatron', levelUnlock: 40, rarity: 'epic',   emoji: '🦾', behavior: 'pulse',  tag: 'Heavy armored mech' },
  { id: 'plasma',   name: 'Plasma',    levelUnlock: 50, rarity: 'epic',   emoji: '🔮', behavior: 'pulse',  tag: 'Energy core' },
  { id: 'zenith',   name: 'Zenith',    levelUnlock: 60, rarity: 'epic',   emoji: '🛸', behavior: 'float',  tag: 'High-altitude drone' },
  { id: 'titan',    name: 'Titan',     levelUnlock: 80, rarity: 'legendary', emoji: '🤖', behavior: 'stomp', tag: 'Massive guardian' },
  { id: 'glitch',   name: 'Glitch',    levelUnlock: 92, rarity: 'legendary', emoji: '👾', behavior: 'flip',  tag: 'Matrix entity' },
  { id: 'nova',     name: 'Nova',      levelUnlock: 98, rarity: 'legendary', emoji: '🌌', behavior: 'float', tag: 'Cosmic being' },

  // ─── HEROES & LEGENDS 📖 ─────────────────────────────────────────────────
  { id: 'david',    name: 'David',     levelUnlock: 10, rarity: 'rare',   emoji: '🧗‍♂️', behavior: 'hop',    tag: 'Brave shepherd boy' },
  { id: 'shadow',   name: 'Shadow',    levelUnlock: 20, rarity: 'rare',   emoji: '🥷', behavior: 'flip',   tag: 'Stealth ninja' },
  { id: 'samson',   name: 'Samson',    levelUnlock: 32, rarity: 'epic',   emoji: '💪', behavior: 'stomp',  tag: 'God-given strength' },
  { id: 'paul',     name: 'Paul',      levelUnlock: 38, rarity: 'epic',   emoji: '📜', behavior: 'strut',  tag: 'Apostle of the seas' },
  { id: 'spartan',  name: 'Spartan',   levelUnlock: 55, rarity: 'epic',   emoji: '🛡️', behavior: 'guard',  tag: 'Elite spear warrior' },
  { id: 'moses',    name: 'Moses',     levelUnlock: 65, rarity: 'legendary', emoji: '🌊', behavior: 'guard',  tag: 'Parted the Red Sea' },
  { id: 'abraham',  name: 'Abraham',   levelUnlock: 82, rarity: 'legendary', emoji: '✨', behavior: 'sway',   tag: 'Father of Nations' },
  { id: 'elijah',   name: 'Elijah',    levelUnlock: 90, rarity: 'legendary', emoji: '🐎', behavior: 'flap',   tag: 'Chariot of Fire' },
  { id: 'guardian', name: 'Guardian',  levelUnlock: 96, rarity: 'legendary', emoji: '🛡️', behavior: 'guard',  tag: 'Golden armored paladin' },
  { id: 'jesus',    name: 'Jesus',     levelUnlock: 100,rarity: 'legendary', emoji: '✝️', behavior: 'pulse',  tag: 'The Good Shepherd' },
];

export const RARITY_COLORS = {
  common: { bg: '#1E293B', text: '#94A3B8', border: '#334155', glow: false },
  rare: { bg: '#0C4A6E', text: '#38BDF8', border: '#0284C7', glow: true },
  epic: { bg: '#4C1D95', text: '#C084FC', border: '#7C3AED', glow: true },
  legendary: { bg: '#713F12', text: '#FDE047', border: '#CA8A04', glow: true },
};

export function checkCharacterUnlocks(oldLevel, newLevel) {
  if (newLevel <= oldLevel) return [];
  const newlyUnlocked = PETS.filter(p => p.levelUnlock > oldLevel && p.levelUnlock <= newLevel);
  return newlyUnlocked;
}

export function getUnlockedPets(level) {
  return PETS.filter(p => level >= p.levelUnlock);
}

export function parseCharacter(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}
