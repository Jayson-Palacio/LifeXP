/** Kitchen-list foods. Values are per typical home serving, not restaurant plates. */
export const FOODS = [
  { name: 'Eggs (2 large)', calories: 140, protein_g: 12, carbs_g: 1, fat_g: 10, fiber_g: 0, meal: 'breakfast' },
  { name: 'Greek yogurt (1 cup)', calories: 130, protein_g: 22, carbs_g: 8, fat_g: 0, fiber_g: 0, meal: 'breakfast' },
  { name: 'Oatmeal (1 cup cooked)', calories: 160, protein_g: 6, carbs_g: 28, fat_g: 3, fiber_g: 4, meal: 'breakfast' },
  { name: 'Cereal + milk', calories: 250, protein_g: 9, carbs_g: 42, fat_g: 5, fiber_g: 3, meal: 'breakfast' },
  { name: 'Banana', calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0, fiber_g: 3, meal: 'snack' },
  { name: 'Apple', calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0, fiber_g: 4, meal: 'snack' },
  { name: 'Berries (1 cup)', calories: 70, protein_g: 1, carbs_g: 17, fat_g: 0, fiber_g: 8, meal: 'snack' },
  { name: 'Peanut butter toast', calories: 280, protein_g: 11, carbs_g: 28, fat_g: 14, fiber_g: 4, meal: 'breakfast' },
  { name: 'Whole wheat toast (2 slices)', calories: 160, protein_g: 8, carbs_g: 28, fat_g: 2, fiber_g: 4, meal: 'breakfast' },
  { name: 'Avocado (½)', calories: 120, protein_g: 1, carbs_g: 6, fat_g: 11, fiber_g: 5, meal: 'breakfast' },
  { name: 'Black coffee', calories: 5, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, meal: 'breakfast' },
  { name: 'Latte', calories: 150, protein_g: 8, carbs_g: 12, fat_g: 6, fiber_g: 0, meal: 'breakfast' },
  { name: 'Milk (1 cup)', calories: 150, protein_g: 8, carbs_g: 12, fat_g: 8, fiber_g: 0, meal: 'snack' },
  { name: 'Orange juice (1 cup)', calories: 110, protein_g: 2, carbs_g: 26, fat_g: 0, fiber_g: 0.5, meal: 'breakfast' },
  { name: 'Chicken breast (4 oz)', calories: 185, protein_g: 35, carbs_g: 0, fat_g: 4, fiber_g: 0, meal: 'lunch' },
  { name: 'Rotisserie chicken (4 oz)', calories: 190, protein_g: 28, carbs_g: 0, fat_g: 8, fiber_g: 0, meal: 'dinner' },
  { name: 'Salmon (4 oz)', calories: 230, protein_g: 25, carbs_g: 0, fat_g: 14, fiber_g: 0, meal: 'dinner' },
  { name: 'Lean ground beef (4 oz)', calories: 220, protein_g: 22, carbs_g: 0, fat_g: 14, fiber_g: 0, meal: 'dinner' },
  { name: 'Turkey sandwich', calories: 320, protein_g: 24, carbs_g: 32, fat_g: 9, fiber_g: 3, meal: 'lunch' },
  { name: 'PB&J', calories: 370, protein_g: 12, carbs_g: 48, fat_g: 16, fiber_g: 4, meal: 'lunch' },
  { name: 'Cheese quesadilla', calories: 400, protein_g: 18, carbs_g: 32, fat_g: 22, fiber_g: 2, meal: 'lunch' },
  { name: 'Pasta with sauce (2 cups)', calories: 420, protein_g: 14, carbs_g: 72, fat_g: 8, fiber_g: 6, meal: 'dinner' },
  { name: 'Mac and cheese (1 cup)', calories: 310, protein_g: 12, carbs_g: 32, fat_g: 14, fiber_g: 2, meal: 'dinner' },
  { name: 'Chicken nuggets (6)', calories: 280, protein_g: 14, carbs_g: 16, fat_g: 16, fiber_g: 1, meal: 'lunch' },
  { name: 'Cheese pizza (2 slices)', calories: 530, protein_g: 22, carbs_g: 60, fat_g: 22, fiber_g: 4, meal: 'dinner' },
  { name: 'Burger (homemade)', calories: 450, protein_g: 26, carbs_g: 32, fat_g: 22, fiber_g: 2, meal: 'dinner' },
  { name: 'Tacos (2)', calories: 380, protein_g: 22, carbs_g: 28, fat_g: 18, fiber_g: 4, meal: 'dinner' },
  { name: 'White rice (1 cup)', calories: 205, protein_g: 4, carbs_g: 45, fat_g: 0, fiber_g: 1, meal: 'lunch' },
  { name: 'Brown rice (1 cup)', calories: 215, protein_g: 5, carbs_g: 45, fat_g: 2, fiber_g: 4, meal: 'lunch' },
  { name: 'Sweet potato (medium)', calories: 110, protein_g: 2, carbs_g: 26, fat_g: 0, fiber_g: 4, meal: 'dinner' },
  { name: 'Broccoli (1 cup)', calories: 55, protein_g: 4, carbs_g: 11, fat_g: 0, fiber_g: 5, meal: 'dinner' },
  { name: 'Mixed salad + vinaigrette', calories: 150, protein_g: 3, carbs_g: 8, fat_g: 12, fiber_g: 2, meal: 'lunch' },
  { name: 'Almonds (1 oz)', calories: 170, protein_g: 6, carbs_g: 6, fat_g: 15, fiber_g: 4, meal: 'snack' },
  { name: 'Cheese stick', calories: 80, protein_g: 7, carbs_g: 1, fat_g: 6, fiber_g: 0, meal: 'snack' },
  { name: 'Granola bar', calories: 190, protein_g: 4, carbs_g: 26, fat_g: 8, fiber_g: 2, meal: 'snack' },
  { name: 'Protein shake', calories: 150, protein_g: 25, carbs_g: 6, fat_g: 2, fiber_g: 1, meal: 'snack' },
  { name: 'Apple slices + peanut butter', calories: 220, protein_g: 7, carbs_g: 24, fat_g: 12, fiber_g: 5, meal: 'snack' },
  { name: 'Ice cream (½ cup)', calories: 140, protein_g: 2, carbs_g: 17, fat_g: 7, fiber_g: 0, meal: 'snack' },
  { name: 'Chocolate chip cookie', calories: 160, protein_g: 2, carbs_g: 22, fat_g: 8, fiber_g: 1, meal: 'snack' },
  { name: 'Chipotle chicken bowl', calories: 720, protein_g: 48, carbs_g: 70, fat_g: 24, fiber_g: 12, meal: 'lunch' },
  { name: 'Chipotle burrito', calories: 1050, protein_g: 45, carbs_g: 98, fat_g: 42, fiber_g: 12, meal: 'lunch' },
  { name: 'Big Mac', calories: 550, protein_g: 25, carbs_g: 45, fat_g: 30, fiber_g: 3, meal: 'lunch' },
  { name: 'French fries (medium)', calories: 365, protein_g: 4, carbs_g: 48, fat_g: 17, fiber_g: 4, meal: 'lunch' },
  { name: 'Pad thai', calories: 700, protein_g: 28, carbs_g: 80, fat_g: 28, fiber_g: 4, meal: 'dinner' },
  { name: 'Sushi roll (8 pc)', calories: 300, protein_g: 14, carbs_g: 42, fat_g: 8, fiber_g: 2, meal: 'lunch' },
  { name: 'Protein smoothie', calories: 250, protein_g: 28, carbs_g: 22, fat_g: 4, fiber_g: 3, meal: 'breakfast' },
  { name: 'Beer (12 oz)', calories: 150, protein_g: 2, carbs_g: 13, fat_g: 0, fiber_g: 0, meal: 'drink' },
  { name: 'Light beer (12 oz)', calories: 100, protein_g: 1, carbs_g: 6, fat_g: 0, fiber_g: 0, meal: 'drink' },
  { name: 'Wine (5 oz)', calories: 125, protein_g: 0, carbs_g: 4, fat_g: 0, fiber_g: 0, meal: 'drink' },
  { name: 'Cocktail', calories: 180, protein_g: 0, carbs_g: 14, fat_g: 0, fiber_g: 0, meal: 'drink' },
  { name: 'Whiskey (1.5 oz)', calories: 100, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, meal: 'drink' },
  { name: 'Hard seltzer', calories: 100, protein_g: 0, carbs_g: 2, fat_g: 0, fiber_g: 0, meal: 'drink' },
];

export const QUICK_FOODS = FOODS.filter((item) =>
  ['Eggs (2 large)', 'Greek yogurt (1 cup)', 'Banana', 'Chicken breast (4 oz)', 'Apple', 'Protein shake', 'Milk (1 cup)', 'Cheese stick'].includes(item.name)
);

export function searchFoods(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return QUICK_FOODS;
  const words = q.split(/\s+/).filter(Boolean);
  return FOODS.filter((item) => {
    const hay = item.name.toLowerCase();
    return words.every((word) => hay.includes(word));
  }).slice(0, 8);
}

export function lookupFood(name) {
  const q = String(name || '').trim().toLowerCase();
  if (!q) return null;
  return FOODS.find((item) => item.name.toLowerCase() === q)
    || FOODS.find((item) => item.name.toLowerCase().includes(q))
    || null;
}

export function searchKitchen(query, kitchen = []) {
  const q = String(query || '').trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const custom = (kitchen || []).map((item) => ({
    ...item,
    source: 'kitchen',
  }));
  if (!q) {
    const top = [...custom].sort((a, b) => (b.times_logged || 0) - (a.times_logged || 0)).slice(0, 8);
    return top.length ? top : QUICK_FOODS.map((item) => ({ ...item, source: 'list' }));
  }
  const fromKitchen = custom.filter((item) => words.every((word) => item.name.toLowerCase().includes(word)));
  const fromList = FOODS.filter((item) => words.every((word) => item.name.toLowerCase().includes(word))).map((item) => ({ ...item, source: 'list' }));
  const seen = new Set();
  const merged = [];
  for (const item of [...fromKitchen, ...fromList]) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= 10) break;
  }
  return merged;
}

