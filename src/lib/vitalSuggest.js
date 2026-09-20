import { FOODS } from './foods';

const DRINK_NAME = /beer|wine|whiskey|cocktail|ipa|seltzer|margarita/i;

function proteinDensity(row) {
  const kcal = Math.max(1, Number(row.calories) || 0);
  return (Number(row.protein_g) || 0) / kcal;
}

export function suggestNextPlate({
  kitchen = [],
  remainingKcal,
  remainingProtein,
  meal = 'dinner',
  child = false,
  hour = 12,
}) {
  if (child) {
    return {
      title: 'Keep the next meal ordinary.',
      body: 'Eggs, yogurt, chicken, or milk. Kids are not on a leftover-calorie plan.',
      items: [],
    };
  }
  if (remainingKcal == null) return null;

  const seen = new Set();
  const pool = [];
  for (const row of [...kitchen, ...FOODS]) {
    const key = String(row.name || '').trim().toLowerCase();
    if (!key || seen.has(key) || row.meal === 'drink' || DRINK_NAME.test(row.name)) continue;
    seen.add(key);
    pool.push(row);
  }

  if (remainingKcal < -80) {
    return {
      title: 'Make the next plate quieter.',
      body: 'Protein and plants, skip the extra snack. One day does not move the weekly average.',
      items: pool.filter((row) => (Number(row.protein_g) || 0) >= 15 && (Number(row.calories) || 0) <= 250).slice(0, 2),
    };
  }

  const preferred = pool.filter((row) => row.meal === meal);
  const search = preferred.length ? [...preferred, ...pool] : pool;
  const cap = remainingKcal < 120 ? 200 : remainingKcal + 40;
  const fit = search.filter((row) => {
    const kcal = Number(row.calories) || 0;
    return kcal >= 40 && kcal <= cap;
  });

  const ranked = [...fit].sort((a, b) => {
    const proteinNeed = remainingProtein > 20 ? 1 : 0;
    const score = (row) => proteinNeed * proteinDensity(row) * 1000 - (Number(row.calories) || 0) * 0.01;
    return score(b) - score(a);
  });

  const items = [];
  let kcalLeft = remainingKcal;
  let proteinLeft = remainingProtein || 0;
  for (const row of ranked) {
    if (items.length >= 2) break;
    const kcal = Number(row.calories) || 0;
    if (kcal > kcalLeft + 50) continue;
    if (items.some((item) => item.name === row.name)) continue;
    items.push(row);
    kcalLeft -= kcal;
    proteinLeft -= Number(row.protein_g) || 0;
  }

  if (!items.length) {
    return remainingKcal > 400
      ? {
        title: hour >= 17 ? 'Eat a real dinner now.' : 'Plenty of room for a real meal.',
        body: 'Do not save a huge leftover. Sit down for protein and plants.',
        items: [],
      }
      : null;
  }

  const kcal = items.reduce((sum, row) => sum + (Number(row.calories) || 0), 0);
  const protein = items.reduce((sum, row) => sum + (Number(row.protein_g) || 0), 0);
  const names = items.map((row) => row.name).join(' + ');
  return {
    title: hour >= 17 && meal === 'dinner' ? 'Dinner can look like this.' : 'This fits the rest of the day.',
    body: `${names} · ${Math.round(kcal)} kcal · ${Math.round(protein)}g protein.`,
    items,
  };
}
