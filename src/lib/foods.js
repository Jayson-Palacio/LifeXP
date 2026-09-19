/** Kitchen-list foods. Values are per typical home serving, not restaurant plates. */
export const FOODS = [
  { name: 'Eggs (2 large)', calories: 140, protein_g: 12, carbs_g: 1, fat_g: 10, meal: 'breakfast' },
  { name: 'Greek yogurt (1 cup)', calories: 130, protein_g: 22, carbs_g: 8, fat_g: 0, meal: 'breakfast' },
  { name: 'Oatmeal (1 cup cooked)', calories: 160, protein_g: 6, carbs_g: 28, fat_g: 3, meal: 'breakfast' },
  { name: 'Cereal + milk', calories: 250, protein_g: 9, carbs_g: 42, fat_g: 5, meal: 'breakfast' },
  { name: 'Banana', calories: 105, protein_g: 1, carbs_g: 27, fat_g: 0, meal: 'snack' },
  { name: 'Apple', calories: 95, protein_g: 0, carbs_g: 25, fat_g: 0, meal: 'snack' },
  { name: 'Berries (1 cup)', calories: 70, protein_g: 1, carbs_g: 17, fat_g: 0, meal: 'snack' },
  { name: 'Peanut butter toast', calories: 280, protein_g: 11, carbs_g: 28, fat_g: 14, meal: 'breakfast' },
  { name: 'Whole wheat toast (2 slices)', calories: 160, protein_g: 8, carbs_g: 28, fat_g: 2, meal: 'breakfast' },
  { name: 'Avocado (½)', calories: 120, protein_g: 1, carbs_g: 6, fat_g: 11, meal: 'breakfast' },
  { name: 'Black coffee', calories: 5, protein_g: 0, carbs_g: 0, fat_g: 0, meal: 'breakfast' },
  { name: 'Latte', calories: 150, protein_g: 8, carbs_g: 12, fat_g: 6, meal: 'breakfast' },
  { name: 'Milk (1 cup)', calories: 150, protein_g: 8, carbs_g: 12, fat_g: 8, meal: 'snack' },
  { name: 'Orange juice (1 cup)', calories: 110, protein_g: 2, carbs_g: 26, fat_g: 0, meal: 'breakfast' },
  { name: 'Chicken breast (4 oz)', calories: 185, protein_g: 35, carbs_g: 0, fat_g: 4, meal: 'lunch' },
  { name: 'Rotisserie chicken (4 oz)', calories: 190, protein_g: 28, carbs_g: 0, fat_g: 8, meal: 'dinner' },
  { name: 'Salmon (4 oz)', calories: 230, protein_g: 25, carbs_g: 0, fat_g: 14, meal: 'dinner' },
  { name: 'Lean ground beef (4 oz)', calories: 220, protein_g: 22, carbs_g: 0, fat_g: 14, meal: 'dinner' },
  { name: 'Turkey sandwich', calories: 320, protein_g: 24, carbs_g: 32, fat_g: 9, meal: 'lunch' },
  { name: 'PB&J', calories: 370, protein_g: 12, carbs_g: 48, fat_g: 16, meal: 'lunch' },
  { name: 'Cheese quesadilla', calories: 400, protein_g: 18, carbs_g: 32, fat_g: 22, meal: 'lunch' },
  { name: 'Pasta with sauce (2 cups)', calories: 420, protein_g: 14, carbs_g: 72, fat_g: 8, meal: 'dinner' },
  { name: 'Mac and cheese (1 cup)', calories: 310, protein_g: 12, carbs_g: 32, fat_g: 14, meal: 'dinner' },
  { name: 'Chicken nuggets (6)', calories: 280, protein_g: 14, carbs_g: 16, fat_g: 16, meal: 'lunch' },
  { name: 'Cheese pizza (2 slices)', calories: 530, protein_g: 22, carbs_g: 60, fat_g: 22, meal: 'dinner' },
  { name: 'Burger (homemade)', calories: 450, protein_g: 26, carbs_g: 32, fat_g: 22, meal: 'dinner' },
  { name: 'Tacos (2)', calories: 380, protein_g: 22, carbs_g: 28, fat_g: 18, meal: 'dinner' },
  { name: 'White rice (1 cup)', calories: 205, protein_g: 4, carbs_g: 45, fat_g: 0, meal: 'lunch' },
  { name: 'Brown rice (1 cup)', calories: 215, protein_g: 5, carbs_g: 45, fat_g: 2, meal: 'lunch' },
  { name: 'Sweet potato (medium)', calories: 110, protein_g: 2, carbs_g: 26, fat_g: 0, meal: 'dinner' },
  { name: 'Broccoli (1 cup)', calories: 55, protein_g: 4, carbs_g: 11, fat_g: 0, meal: 'dinner' },
  { name: 'Mixed salad + vinaigrette', calories: 150, protein_g: 3, carbs_g: 8, fat_g: 12, meal: 'lunch' },
  { name: 'Almonds (1 oz)', calories: 170, protein_g: 6, carbs_g: 6, fat_g: 15, meal: 'snack' },
  { name: 'Cheese stick', calories: 80, protein_g: 7, carbs_g: 1, fat_g: 6, meal: 'snack' },
  { name: 'Granola bar', calories: 190, protein_g: 4, carbs_g: 26, fat_g: 8, meal: 'snack' },
  { name: 'Protein shake', calories: 150, protein_g: 25, carbs_g: 6, fat_g: 2, meal: 'snack' },
  { name: 'Apple slices + peanut butter', calories: 220, protein_g: 7, carbs_g: 24, fat_g: 12, meal: 'snack' },
  { name: 'Ice cream (½ cup)', calories: 140, protein_g: 2, carbs_g: 17, fat_g: 7, meal: 'snack' },
  { name: 'Chocolate chip cookie', calories: 160, protein_g: 2, carbs_g: 22, fat_g: 8, meal: 'snack' },
];

export const QUICK_FOODS = FOODS.filter((item) =>
  ['Eggs (2 large)', 'Greek yogurt (1 cup)', 'Banana', 'Chicken breast (4 oz)', 'Apple', 'Protein shake', 'Milk (1 cup)', 'Cheese stick'].includes(item.name)
);

export function searchFoods(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return QUICK_FOODS;
  return FOODS.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 8);
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
  const custom = (kitchen || []).map((item) => ({
    ...item,
    source: 'kitchen',
  }));
  if (!q) {
    const top = [...custom].sort((a, b) => (b.times_logged || 0) - (a.times_logged || 0)).slice(0, 8);
    return top.length ? top : QUICK_FOODS.map((item) => ({ ...item, source: 'list' }));
  }
  const fromKitchen = custom.filter((item) => item.name.toLowerCase().includes(q));
  const fromList = FOODS.filter((item) => item.name.toLowerCase().includes(q)).map((item) => ({ ...item, source: 'list' }));
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

