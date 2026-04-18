// ─── Character System ────────────────────────────────────────────────────────
// Completely separate from the child's avatar photo/emoji.
// Stored as JSON in the `character` column of the `children` table.
// Shape: { base, hat, face, aura, pet }

export const BASE_CHARACTERS = [
  { id: 'cat',   name: 'Cat',   levelUnlock: 1,  rarity: 'common',    description: 'A brave little explorer' },
  { id: 'frog',  name: 'Frog',  levelUnlock: 1,  rarity: 'common',    description: 'Quick and clever' },
  { id: 'bear',  name: 'Bear',  levelUnlock: 1,  rarity: 'common',    description: 'Strong and loyal' },
  { id: 'panda', name: 'Panda', levelUnlock: 1,  rarity: 'common',    description: 'Rare and wise' },
  { id: 'fox',   name: 'Fox',   levelUnlock: 7,  rarity: 'rare',      description: 'Sly and cunning' },
  { id: 'wolf',  name: 'Wolf',  levelUnlock: 20, rarity: 'epic',      description: 'Commander of the pack' },
  { id: 'lion',  name: 'Lion',  levelUnlock: 40, rarity: 'legendary', description: 'King of the realm' },
];

export const HATS = [
  { id: 'top-hat',       name: 'Top Hat',       levelUnlock: 3,  rarity: 'common' },
  { id: 'cap',           name: 'Cap',           levelUnlock: 8,  rarity: 'common' },
  { id: 'crown',         name: 'Crown',         levelUnlock: 15, rarity: 'rare' },
  { id: 'wizard',        name: 'Wizard Hat',    levelUnlock: 30, rarity: 'rare' },
  { id: 'diamond-crown', name: 'Diamond Crown', levelUnlock: 50, rarity: 'epic' },
  { id: 'rainbow-hat',   name: 'Rainbow Hat',   levelUnlock: 75, rarity: 'legendary' },
];

export const FACE_ITEMS = [
  { id: 'shades',    name: 'Shades',     levelUnlock: 5,  rarity: 'common' },
  { id: 'scuba',     name: 'Scuba Mask', levelUnlock: 18, rarity: 'rare' },
  { id: 'star-eyes', name: 'Star Eyes',  levelUnlock: 35, rarity: 'epic' },
];

export const AURAS = [
  { id: 'star',      name: 'Star Aura',      color: '#facc15', levelUnlock: 10,  rarity: 'common' },
  { id: 'wave',      name: 'Wave Aura',      color: '#38bdf8', levelUnlock: 20,  rarity: 'common' },
  { id: 'fire',      name: 'Fire Aura',      color: '#f97316', levelUnlock: 30,  rarity: 'rare' },
  { id: 'lightning', name: 'Lightning Aura', color: '#a855f7', levelUnlock: 50,  rarity: 'epic' },
  { id: 'rainbow',   name: 'Rainbow Aura',   color: 'rainbow', levelUnlock: 75,  rarity: 'legendary' },
  { id: 'max',       name: 'Max Aura',       color: '#ffffff', levelUnlock: 100, rarity: 'legendary' },
];

export const PETS = [
  { id: 'chick',     name: 'Baby Chick',  levelUnlock: 12, rarity: 'common' },
  { id: 'butterfly', name: 'Butterfly',   levelUnlock: 25, rarity: 'rare' },
  { id: 'dragon',    name: 'Baby Dragon', levelUnlock: 40, rarity: 'epic' },
  { id: 'unicorn',   name: 'Unicorn',     levelUnlock: 75, rarity: 'legendary' },
];

export const RARITY_COLORS = {
  common:    { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)',  label: 'Common' },
  rare:      { color: '#38bdf8', glow: 'rgba(56,189,248,0.3)',   label: 'Rare' },
  epic:      { color: '#a855f7', glow: 'rgba(168,85,247,0.3)',   label: 'Epic' },
  legendary: { color: '#facc15', glow: 'rgba(250,204,21,0.3)',   label: 'Legendary' },
};

export function getAllCharacterItems() {
  return [...BASE_CHARACTERS, ...HATS, ...FACE_ITEMS, ...AURAS, ...PETS];
}

export function getUnlockedCharacterItems(level) {
  return {
    bases: BASE_CHARACTERS.filter(i => level >= i.levelUnlock),
    hats:  HATS.filter(i => level >= i.levelUnlock),
    face:  FACE_ITEMS.filter(i => level >= i.levelUnlock),
    auras: AURAS.filter(i => level >= i.levelUnlock),
    pets:  PETS.filter(i => level >= i.levelUnlock),
  };
}

export function checkCharacterUnlocks(oldLevel, newLevel) {
  return getAllCharacterItems().filter(
    item => item.levelUnlock > oldLevel && item.levelUnlock <= newLevel
  );
}

export function parseCharacter(characterStr) {
  if (!characterStr) return null;
  try { return JSON.parse(characterStr); } catch { return null; }
}
