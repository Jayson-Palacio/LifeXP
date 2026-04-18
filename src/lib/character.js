// ─── CHARACTER CONFIGURATION ────────────────────────────────────────────────

// 60 Unique Expandable Pet Companions!
export const PETS = [
  // ─── COMMON (Levels 1 - 15) ────────────────────────────────────────────────
  { id: 'pup',      name: 'Pup',        levelUnlock: 1,  rarity: 'common', emoji: '🐶', behavior: 'bounce', tag: 'Loyal and playful' },
  { id: 'kitty',    name: 'Kitty',      levelUnlock: 1,  rarity: 'common', emoji: '🐱', behavior: 'sway',   tag: 'Purrfect friend' },
  { id: 'sparkbot', name: 'Sparkbot',   levelUnlock: 2,  rarity: 'common', emoji: '🤖', behavior: 'float',  tag: 'Helpful hover bot' },
  { id: 'squire',   name: 'Squire',     levelUnlock: 3,  rarity: 'common', emoji: '🛡️', behavior: 'guard',  tag: 'Training to be a knight' },
  { id: 'trike',    name: 'Trike',      levelUnlock: 4,  rarity: 'common', emoji: '🦕', behavior: 'stomp',  tag: 'Three-horned herbivore' },
  { id: 'bunny',    name: 'Bunny',      levelUnlock: 5,  rarity: 'common', emoji: '🐰', behavior: 'hop',    tag: 'Quick and fluffy' },
  { id: 'gear',     name: 'Gear Drone', levelUnlock: 6,  rarity: 'common', emoji: '⚙️', behavior: 'pulse',  tag: 'Spinning assistant' },
  { id: 'ptero',    name: 'Ptero',      levelUnlock: 7,  rarity: 'common', emoji: '🦇', behavior: 'flap',   tag: 'Ruler of the sky' },
  { id: 'scout',    name: 'Scout',      levelUnlock: 8,  rarity: 'common', emoji: '🏹', behavior: 'sway',   tag: 'Wilderness explorer' },
  { id: 'raptor',   name: 'Raptor',     levelUnlock: 9,  rarity: 'common', emoji: '🦖', behavior: 'strut',  tag: 'Speedy runner' },
  { id: 'shadow',   name: 'Shadow',     levelUnlock: 11, rarity: 'common', emoji: '🥷', behavior: 'flip',   tag: 'Stealthy ninja trained in shadows' },
  { id: 'astro',    name: 'Astro',      levelUnlock: 13, rarity: 'common', emoji: '👨‍🚀', behavior: 'float',  tag: 'Space explorer' },

  // ─── RARE (Levels 15 - 35) ─────────────────────────────────────────────────
  { id: 'fox',      name: 'Fox',        levelUnlock: 15, rarity: 'rare', emoji: '🦊', behavior: 'wobble', tag: 'Clever and quick' },
  { id: 'stego',    name: 'Stego',      levelUnlock: 16, rarity: 'rare', emoji: '🦕', behavior: 'stomp',  tag: 'Spiked tail defender' },
  { id: 'bear',     name: 'Bear',       levelUnlock: 18, rarity: 'rare', emoji: '🐻', behavior: 'guard',  tag: 'Strong and protective' },
  { id: 'sonar',    name: 'Sonar Bot',  levelUnlock: 19, rarity: 'rare', emoji: '📡', behavior: 'pulse',  tag: 'Antenna tracking unit' },
  { id: 'david',    name: 'David',      levelUnlock: 20, rarity: 'rare', emoji: '🧗‍♂️', behavior: 'hop',    tag: 'Brave shepherd boy with a sling' },
  { id: 'ranger',   name: 'Ranger',     levelUnlock: 21, rarity: 'rare', emoji: '🏹', behavior: 'strut',  tag: 'Expert marksman' },
  { id: 'bronto',   name: 'Bronto',     levelUnlock: 23, rarity: 'rare', emoji: '🦕', behavior: 'waddle', tag: 'Gentle long neck' },
  { id: 'zap',      name: 'Zap',        levelUnlock: 24, rarity: 'rare', emoji: '⚡', behavior: 'flip',   tag: 'Moves at the speed of light' },
  { id: 'joseph',   name: 'Joseph',     levelUnlock: 25, rarity: 'rare', emoji: '🧥', behavior: 'sway',   tag: 'Dreamer with a colorful coat' },
  { id: 'elephant', name: 'Elephant',   levelUnlock: 27, rarity: 'rare', emoji: '🐘', behavior: 'stomp',  tag: 'Gentle giant with a big heart' },
  { id: 'paladin',  name: 'Paladin',    levelUnlock: 28, rarity: 'rare', emoji: '⚔️', behavior: 'guard',  tag: 'Heavy shield defender' },
  { id: 'ankylo',   name: 'Ankylo',     levelUnlock: 30, rarity: 'rare', emoji: '🦕', behavior: 'stomp',  tag: 'Walking fortress tank' },
  { id: 'samurai',  name: 'Samurai',    levelUnlock: 31, rarity: 'rare', emoji: '🗡️', behavior: 'sway',   tag: 'Honorable blade master' },
  { id: 'plasma',   name: 'Plasma',     levelUnlock: 33, rarity: 'rare', emoji: '🔮', behavior: 'pulse',  tag: 'Glowing energy core' },
  { id: 'esther',   name: 'Esther',     levelUnlock: 35, rarity: 'rare', emoji: '👑', behavior: 'sway',   tag: 'Brave Queen who saved her people' },

  // ─── EPIC (Levels 36 - 65) ─────────────────────────────────────────────────
  { id: 'wolf',     name: 'Wolf',       levelUnlock: 36, rarity: 'epic', emoji: '🐺', behavior: 'howl',   tag: 'Fierce leader of the pack' },
  { id: 'valkyrie', name: 'Valkyrie',   levelUnlock: 38, rarity: 'epic', emoji: '🛡️', behavior: 'flap',   tag: 'Winged warrior of justice' },
  { id: 'rex',      name: 'Rex',        levelUnlock: 40, rarity: 'epic', emoji: '🦖', behavior: 'stomp',  tag: 'The fierce T-Rex king' },
  { id: 'daniel',   name: 'Daniel',     levelUnlock: 42, rarity: 'epic', emoji: '🦁', behavior: 'guard',  tag: 'Unfazed in the lions\' den' },
  { id: 'mechatron',name: 'Mechatron',  levelUnlock: 44, rarity: 'epic', emoji: '🦾', behavior: 'pulse',  tag: 'Heavy armored sci-fi warrior' },
  { id: 'lion',     name: 'Lion',       levelUnlock: 45, rarity: 'epic', emoji: '🦁', behavior: 'strut',  tag: 'Majestic king of the jungle' },
  { id: 'berserker',name: 'Berserker',  levelUnlock: 47, rarity: 'epic', emoji: '🪓', behavior: 'stomp',  tag: 'Fierce dual-axe fighter' },
  { id: 'noah',     name: 'Noah',       levelUnlock: 49, rarity: 'epic', emoji: '🚢', behavior: 'waddle', tag: 'Builder of the great Ark' },
  { id: 'plesio',   name: 'Plesio',     levelUnlock: 50, rarity: 'epic', emoji: '🐋', behavior: 'sway',   tag: 'Master of the deep oceans' },
  { id: 'cyborg',   name: 'Cyborg',     levelUnlock: 52, rarity: 'epic', emoji: '🤖', behavior: 'pulse',  tag: 'Half human, half machine' },
  { id: 'eagle',    name: 'Eagle',      levelUnlock: 54, rarity: 'epic', emoji: '🦅', behavior: 'flap',   tag: 'Soaring symbol of freedom' },
  { id: 'samson',   name: 'Samson',     levelUnlock: 55, rarity: 'epic', emoji: '💪', behavior: 'stomp',  tag: 'God-given incredible strength' },
  { id: 'mage',     name: 'Mage',       levelUnlock: 57, rarity: 'epic', emoji: '🧙', behavior: 'float',  tag: 'Master of mystical elements' },
  { id: 'spino',    name: 'Spino',      levelUnlock: 59, rarity: 'epic', emoji: '🦕', behavior: 'wobble', tag: 'Fearsome sail-backed predator' },
  { id: 'zenith',   name: 'Zenith',     levelUnlock: 61, rarity: 'epic', emoji: '🛸', behavior: 'float',  tag: 'High-altitude super drone' },
  { id: 'paul',     name: 'Paul',       levelUnlock: 62, rarity: 'epic', emoji: '📜', behavior: 'strut',  tag: 'Apostle carrying the Gospel across seas' },
  { id: 'dolphin',  name: 'Dolphin',    levelUnlock: 64, rarity: 'epic', emoji: '🐬', behavior: 'flip',   tag: 'Ocean acrobat and friend' },
  { id: 'moses',    name: 'Moses',      levelUnlock: 65, rarity: 'epic', emoji: '🌊', behavior: 'guard',  tag: 'Leader who parted the Red Sea' },

  // ─── LEGENDARY (Levels 66 - 100) ───────────────────────────────────────────
  { id: 'spartan',  name: 'Spartan',    levelUnlock: 68, rarity: 'legendary', emoji: '🛡️', behavior: 'guard', tag: 'Elite spear and shield warrior' },
  { id: 'griffin',  name: 'Griffin',    levelUnlock: 71, rarity: 'legendary', emoji: '🦅', behavior: 'flap',  tag: 'Mythical eagle-lion beast' },
  { id: 'titan',    name: 'Titan',      levelUnlock: 74, rarity: 'legendary', emoji: '🤖', behavior: 'stomp', tag: 'Massive towering guardian robot' },
  { id: 'abraham',  name: 'Abraham',    levelUnlock: 77, rarity: 'legendary', emoji: '✨', behavior: 'sway',  tag: 'Father of Nations, looking to the stars' },
  { id: 'panther',  name: 'Panther',    levelUnlock: 80, rarity: 'legendary', emoji: '🐆', behavior: 'strut', tag: 'Silent and sleek night hunter' },
  { id: 'dragon',   name: 'Dragon',     levelUnlock: 82, rarity: 'legendary', emoji: '🐉', behavior: 'flap',  tag: 'Fire-breathing ancient scaler' },
  { id: 'guardian', name: 'Guardian',   levelUnlock: 85, rarity: 'legendary', emoji: '🛡️', behavior: 'guard', tag: 'Golden armored eternal defender' },
  { id: 'joshua',   name: 'Joshua',     levelUnlock: 87, rarity: 'legendary', emoji: '🎺', behavior: 'pulse', tag: 'Conqueror blowing the ram\'s horn' },
  { id: 'glitch',   name: 'Glitch',     levelUnlock: 90, rarity: 'legendary', emoji: '👾', behavior: 'flip',  tag: 'Unpredictable matrix entity' },
  { id: 'panda',    name: 'Panda',      levelUnlock: 92, rarity: 'legendary', emoji: '🐼', behavior: 'wobble',tag: 'Peaceful bamboo-chewing giant' },
  { id: 'phoenix',  name: 'Phoenix',    levelUnlock: 94, rarity: 'legendary', emoji: '🔥', behavior: 'pulse', tag: 'Reborn bird of eternal fire' },
  { id: 'sentinel', name: 'Sentinel',   levelUnlock: 96, rarity: 'legendary', emoji: '🗡️', behavior: 'float', tag: 'Wielder of the ethereal glowing sword' },
  { id: 'nova',     name: 'Nova',       levelUnlock: 97, rarity: 'legendary', emoji: '🌌', behavior: 'float', tag: 'Radiant cosmic space being' },
  { id: 'elijah',   name: 'Elijah',     levelUnlock: 98, rarity: 'legendary', emoji: '🐎', behavior: 'flap',  tag: 'Prophet matching the Chariot of Fire' },
  { id: 'jesus',    name: 'Jesus',      levelUnlock: 100,rarity: 'legendary', emoji: '✝️', behavior: 'pulse', tag: 'The Good Shepherd, radiant light of the world' },
];

export const RARITY_COLORS = {
  common: { bg: '#1E293B', text: '#94A3B8', border: '#334155', glow: false },
  rare: { bg: '#0C4A6E', text: '#38BDF8', border: '#0284C7', glow: true },
  epic: { bg: '#4C1D95', text: '#C084FC', border: '#7C3AED', glow: true },
  legendary: { bg: '#713F12', text: '#FDE047', border: '#CA8A04', glow: true },
};

// Check for recent pet unlocks based on oldLevel vs newLevel
export function checkPetUnlocks(oldLevel, newLevel) {
  if (newLevel <= oldLevel) return [];
  const newlyUnlocked = PETS.filter(p => p.levelUnlock > oldLevel && p.levelUnlock <= newLevel);
  return newlyUnlocked;
}
