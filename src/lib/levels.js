export function getLevelForXP(xp) {
  const level = Math.floor(xp / 100) + 1;
  const emojis = ['🐣','🐥','🐛','🦋','🐢','🦊','🐯','🦁','🐉','👑'];
  const titles = ['Novice', 'Apprentice', 'Scout', 'Adventurer', 'Ranger', 'Knight', 'Hero', 'Champion', 'Legend', 'Master'];
  
  const idx = Math.min(level - 1, 9);
  return {
    level,
    emoji: emojis[idx],
    title: titles[idx]
  };
}

export function getXPProgress(xp) {
  const currentLevelXP = xp % 100;
  return currentLevelXP / 100;
}

export function getXPDisplay(xp) {
  const currentLevelXP = xp % 100;
  return `${currentLevelXP} / 100`;
}
