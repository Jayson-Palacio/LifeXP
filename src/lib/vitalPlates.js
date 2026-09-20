import { FOOD_MEALS, shiftDay } from './nutrition';

function foodName(row) {
  return String(row?.name || '').trim();
}

function foodKey(name) {
  return foodName({ name }).toLowerCase().replace(/\s+/g, ' ');
}

export function plateKey(items) {
  return [...new Set(items.map((row) => foodKey(row.name)).filter(Boolean))].sort().join('|');
}

function uniqueItems(rows) {
  const seen = new Set();
  const items = [];
  for (const row of rows) {
    const key = foodKey(row.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push({
      name: foodName(row),
      calories: Number(row.calories) || 0,
      protein_g: Number(row.protein_g) || 0,
      carbs_g: Number(row.carbs_g) || 0,
      fat_g: Number(row.fat_g) || 0,
      fiber_g: Number(row.fiber_g) || 0,
      meal: row.meal,
    });
  }
  return items;
}

export function plateLabel(items) {
  const names = items.map((row) => row.name).filter(Boolean);
  if (!names.length) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} · ${names[1]}`;
  return `${names[0]} · ${names[1]} +${names.length - 2}`;
}

function mealWord(meal) {
  return (FOOD_MEALS.find((row) => row.id === meal)?.label || 'meal').toLowerCase();
}

function mealGroups(foods, meal) {
  const byDay = new Map();
  for (const row of foods) {
    if (row.meal !== meal || !row.logged_on) continue;
    const list = byDay.get(row.logged_on) || [];
    list.push(row);
    byDay.set(row.logged_on, list);
  }
  return [...byDay.entries()]
    .map(([day, rows]) => {
      const ordered = [...rows].sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')));
      const items = uniqueItems(ordered);
      return { day, items, key: plateKey(items) };
    })
    .filter((group) => group.items.length);
}

/**
 * One-tap plates for the selected person and meal.
 * Yesterday’s meal if today is empty; otherwise whatever this person repeats.
 */
export function usualPlates({ foods = [], meal, logDate, today }) {
  if (!meal || meal === 'drink' || !logDate) return [];

  const groups = mealGroups(foods, meal);
  const onLog = groups.find((row) => row.day === logDate);
  const logEmpty = !onLog;
  const priorDay = shiftDay(logDate, -1);
  const prior = groups.find((row) => row.day === priorDay);
  const plates = [];
  const used = new Set();

  if (logEmpty && prior && logDate === today) {
    plates.push({
      id: `prior-${prior.key}`,
      label: `Yesterday’s ${mealWord(meal)}`,
      items: prior.items,
      meal,
    });
    used.add(prior.key);
  }

  const counts = new Map();
  for (const group of groups) {
    if (group.day === logDate) continue;
    const current = counts.get(group.key) || { count: 0, items: group.items, last: group.day };
    current.count += 1;
    if (group.day > current.last) {
      current.last = group.day;
      current.items = group.items;
    }
    counts.set(group.key, current);
  }

  const ranked = [...counts.entries()]
    .filter(([, value]) => value.count >= 2)
    .sort((a, b) => b[1].count - a[1].count || b[1].last.localeCompare(a[1].last));

  for (const [key, value] of ranked) {
    if (used.has(key) || (onLog && onLog.key === key)) continue;
    plates.push({
      id: `usual-${key}`,
      label: plateLabel(value.items),
      items: value.items,
      meal,
    });
    used.add(key);
    if (plates.length >= 4) break;
  }

  if (logEmpty && logDate === today && !prior) {
    const last = groups
      .filter((row) => row.day < logDate)
      .sort((a, b) => b.day.localeCompare(a.day))[0];
    if (last && !used.has(last.key)) {
      plates.push({
        id: `last-${last.key}`,
        label: `Last ${mealWord(meal)}`,
        items: last.items,
        meal,
      });
    }
  }

  return plates.slice(0, 4);
}
