import { lookupFood } from './foods';

const RECIPE_DOMAINS = [
  'budgetbytes.com',
  'seriouseats.com',
  'cookieandkate.com',
  'simplyrecipes.com',
  'skinnytaste.com',
  'loveandlemons.com',
];

export function allowedRecipeUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return RECIPE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function food(name) {
  return lookupFood(name);
}

function itemsFor(recipe) {
  const fromNames = (recipe.logNames || []).map(food).filter(Boolean);
  return [...fromNames, ...(recipe.logItems || [])];
}

export const COOK_RECIPES = [
  {
    id: 'sheet-pan-greek-chicken',
    title: 'Sheet-pan Greek chicken and vegetables',
    meal: 'dinner',
    kidOk: true,
    tags: ['chicken', 'pepper', 'tomato', 'rice', 'broccoli', 'onion'],
    ingredients: ['Chicken breast', 'Bell peppers', 'Tomatoes', 'Onion', 'Rice'],
    recipeUrl: 'https://www.budgetbytes.com/sheet-pan-greek-chicken-and-vegetables/',
    recipeSource: 'Budget Bytes',
    logNames: ['Chicken breast (4 oz)', 'Broccoli (1 cup)', 'White rice (1 cup)'],
  },
  {
    id: 'beef-taco-skillet',
    title: 'Beef taco skillet',
    meal: 'dinner',
    kidOk: true,
    tags: ['beef', 'taco', 'bean', 'tomato', 'cheese', 'tortilla'],
    ingredients: ['Ground beef', 'Black beans', 'Tomatoes', 'Tortilla chips', 'Cheddar'],
    recipeUrl: 'https://www.budgetbytes.com/beef-taco-skillet/',
    recipeSource: 'Budget Bytes',
    logNames: ['Tacos (2)'],
  },
  {
    id: 'baked-beef-tacos',
    title: 'Crispy baked beef tacos',
    meal: 'dinner',
    kidOk: true,
    tags: ['beef', 'taco', 'bean', 'cheese'],
    ingredients: ['Ground beef', 'Black beans', 'Hard taco shells', 'Cheddar'],
    recipeUrl: 'https://www.budgetbytes.com/baked-beef-black-bean-tacos/',
    recipeSource: 'Budget Bytes',
    logNames: ['Tacos (2)'],
  },
  {
    id: 'pan-seared-salmon',
    title: 'Crispy pan-seared salmon',
    meal: 'dinner',
    kidOk: true,
    quiet: true,
    tags: ['salmon', 'fish', 'broccoli'],
    ingredients: ['Salmon fillets', 'Broccoli', 'Lemon'],
    recipeUrl: 'https://www.seriouseats.com/crispy-pan-seared-salmon-fillets-recipe',
    recipeSource: 'Serious Eats',
    logNames: ['Salmon (4 oz)', 'Broccoli (1 cup)'],
  },
  {
    id: 'vegetable-fried-rice',
    title: 'Vegetable fried rice',
    meal: 'dinner',
    meals: ['lunch', 'dinner'],
    kidOk: true,
    tags: ['rice', 'egg', 'carrot', 'pea', 'pepper'],
    ingredients: ['Leftover rice', 'Eggs', 'Carrot', 'Peas', 'Bell pepper'],
    recipeUrl: 'https://www.budgetbytes.com/vegetable-fried-rice/',
    recipeSource: 'Budget Bytes',
    logNames: ['Eggs (2 large)', 'White rice (1 cup)'],
  },
  {
    id: 'lentil-soup',
    title: 'Lentil soup',
    meal: 'dinner',
    meals: ['lunch', 'dinner'],
    kidOk: true,
    quiet: true,
    tags: ['lentil', 'soup', 'carrot', 'tomato', 'kale'],
    ingredients: ['Lentils', 'Carrots', 'Tomatoes', 'Greens'],
    recipeUrl: 'https://cookieandkate.com/best-lentil-soup-recipe/',
    recipeSource: 'Cookie and Kate',
    logItems: [
      { name: 'Lentil soup (bowl)', calories: 320, protein_g: 18, carbs_g: 48, fat_g: 6, fiber_g: 16, meal: 'dinner' },
    ],
  },
  {
    id: 'classic-chili',
    title: 'Classic beef chili',
    meal: 'dinner',
    kidOk: true,
    tags: ['beef', 'chili', 'bean', 'tomato'],
    ingredients: ['Ground beef', 'Beans', 'Tomatoes', 'Chili seasoning'],
    recipeUrl: 'https://www.budgetbytes.com/basic-chili/',
    recipeSource: 'Budget Bytes',
    logNames: ['Lean ground beef (4 oz)', 'White rice (1 cup)'],
  },
  {
    id: 'turkey-chili',
    title: 'Turkey chili',
    meal: 'dinner',
    kidOk: true,
    quiet: true,
    tags: ['turkey', 'chili', 'bean', 'corn'],
    ingredients: ['Ground turkey', 'Beans', 'Corn', 'Poblano'],
    recipeUrl: 'https://www.budgetbytes.com/turkey-chili/',
    recipeSource: 'Budget Bytes',
    logItems: [
      { name: 'Turkey chili (bowl)', calories: 340, protein_g: 28, carbs_g: 32, fat_g: 10, fiber_g: 10, meal: 'dinner' },
    ],
  },
  {
    id: 'black-bean-chili',
    title: 'Weeknight black bean chili',
    meal: 'dinner',
    kidOk: true,
    quiet: true,
    tags: ['bean', 'chili', 'beef', 'tomato'],
    ingredients: ['Black beans', 'Ground beef', 'Tomatoes'],
    recipeUrl: 'https://www.budgetbytes.com/weeknight-black-bean-chili/',
    recipeSource: 'Budget Bytes',
    logItems: [
      { name: 'Black bean chili (bowl)', calories: 310, protein_g: 20, carbs_g: 36, fat_g: 8, fiber_g: 12, meal: 'dinner' },
    ],
  },
  {
    id: 'mac-and-cheese',
    title: 'Homemade mac and cheese',
    meal: 'dinner',
    kidOk: true,
    tags: ['pasta', 'mac', 'cheese', 'milk'],
    ingredients: ['Elbow macaroni', 'Cheddar', 'Milk', 'Butter'],
    recipeUrl: 'https://www.budgetbytes.com/extra-cheesy-homemade-mac-and-cheese/',
    recipeSource: 'Budget Bytes',
    logNames: ['Mac and cheese (1 cup)', 'Broccoli (1 cup)'],
  },
  {
    id: 'broccoli-mac',
    title: 'Bacon broccoli mac and cheese',
    meal: 'dinner',
    kidOk: true,
    tags: ['pasta', 'mac', 'cheese', 'broccoli', 'bacon'],
    ingredients: ['Pasta', 'Broccoli', 'Bacon', 'Cheddar'],
    recipeUrl: 'https://www.budgetbytes.com/one-pot-bacon-broccoli-mac-cheese/',
    recipeSource: 'Budget Bytes',
    logNames: ['Mac and cheese (1 cup)', 'Broccoli (1 cup)'],
  },
  {
    id: 'black-bean-quesadillas',
    title: 'Black bean quesadillas',
    meal: 'lunch',
    meals: ['lunch', 'dinner'],
    kidOk: true,
    tags: ['bean', 'quesadilla', 'cheese', 'tortilla', 'corn'],
    ingredients: ['Black beans', 'Corn', 'Cheddar', 'Tortillas'],
    recipeUrl: 'https://www.budgetbytes.com/hearty-black-bean-quesadillas/',
    recipeSource: 'Budget Bytes',
    logNames: ['Cheese quesadilla'],
  },
  {
    id: 'quinoa-black-bean-tacos',
    title: 'Quinoa black bean tacos',
    meal: 'lunch',
    meals: ['lunch', 'dinner'],
    kidOk: true,
    quiet: true,
    tags: ['taco', 'bean', 'quinoa', 'avocado'],
    ingredients: ['Quinoa', 'Black beans', 'Corn tortillas', 'Avocado'],
    recipeUrl: 'https://www.budgetbytes.com/quinoa-black-bean-tacos/',
    recipeSource: 'Budget Bytes',
    logNames: ['Tacos (2)'],
  },
  {
    id: 'shakshuka',
    title: 'Shakshuka',
    meal: 'breakfast',
    meals: ['breakfast', 'dinner'],
    kidOk: true,
    quiet: true,
    tags: ['egg', 'tomato', 'pepper', 'onion'],
    ingredients: ['Eggs', 'Tomatoes', 'Bell pepper', 'Onion'],
    recipeUrl: 'https://www.budgetbytes.com/shakshuka/',
    recipeSource: 'Budget Bytes',
    logNames: ['Eggs (2 large)', 'Whole wheat toast (2 slices)'],
  },
  {
    id: 'white-bean-shakshuka',
    title: 'Smoky white bean shakshuka',
    meal: 'breakfast',
    meals: ['breakfast', 'dinner'],
    kidOk: true,
    quiet: true,
    tags: ['egg', 'bean', 'tomato', 'feta'],
    ingredients: ['Eggs', 'White beans', 'Tomatoes', 'Feta'],
    recipeUrl: 'https://www.budgetbytes.com/smoky-white-bean-shakshuka/',
    recipeSource: 'Budget Bytes',
    logNames: ['Eggs (2 large)'],
  },
  {
    id: 'baked-eggs-tomatoes',
    title: 'Baked eggs on roasted tomatoes',
    meal: 'breakfast',
    kidOk: true,
    quiet: true,
    tags: ['egg', 'tomato', 'toast'],
    ingredients: ['Eggs', 'Cherry tomatoes', 'Parmesan', 'Toast'],
    recipeUrl: 'https://cookieandkate.com/baked-eggs-on-roasted-cherry-tomatoes/',
    recipeSource: 'Cookie and Kate',
    logNames: ['Eggs (2 large)', 'Whole wheat toast (2 slices)'],
  },
  {
    id: 'rotisserie-plate',
    title: 'Rotisserie chicken, potato, and broccoli',
    meal: 'dinner',
    kidOk: true,
    tags: ['chicken', 'potato', 'broccoli', 'rotisserie'],
    ingredients: ['Rotisserie chicken', 'Sweet potato', 'Broccoli'],
    recipeUrl: 'https://www.budgetbytes.com/sheet-pan-greek-chicken-and-vegetables/',
    recipeSource: 'Budget Bytes',
    logNames: ['Rotisserie chicken (4 oz)', 'Sweet potato (medium)', 'Broccoli (1 cup)'],
  },
  {
    id: 'tomato-spinach-pasta',
    title: 'Creamy tomato and spinach pasta',
    meal: 'dinner',
    kidOk: true,
    tags: ['pasta', 'tomato', 'spinach', 'sauce'],
    ingredients: ['Pasta', 'Crushed tomatoes', 'Spinach', 'Cream'],
    recipeUrl: 'https://www.budgetbytes.com/creamy-tomato-spinach-pasta/',
    recipeSource: 'Budget Bytes',
    logNames: ['Pasta with sauce (2 cups)'],
  },
  {
    id: 'sausage-pasta',
    title: 'Cheesy sausage spinach pasta',
    meal: 'dinner',
    kidOk: true,
    tags: ['pasta', 'sausage', 'spinach', 'cheese'],
    ingredients: ['Smoked sausage', 'Egg noodles', 'Spinach', 'Tomatoes'],
    recipeUrl: 'https://www.budgetbytes.com/creamy-spinach-sausage-pasta/',
    recipeSource: 'Budget Bytes',
    logNames: ['Pasta with sauce (2 cups)'],
  },
  {
    id: 'tomato-soup',
    title: 'Tomato and roasted red pepper soup',
    meal: 'lunch',
    meals: ['lunch', 'dinner'],
    kidOk: true,
    quiet: true,
    tags: ['tomato', 'soup', 'pepper', 'bread'],
    ingredients: ['Tomatoes', 'Roasted red peppers', 'Onion'],
    recipeUrl: 'https://www.budgetbytes.com/roasted-red-pepper-tomato-soup/',
    recipeSource: 'Budget Bytes',
    logItems: [
      { name: 'Tomato soup (bowl)', calories: 180, protein_g: 5, carbs_g: 24, fat_g: 7, fiber_g: 4, meal: 'lunch' },
    ],
  },
  {
    id: 'grilled-cheese',
    title: 'Grilled cheese',
    meal: 'lunch',
    kidOk: true,
    tags: ['cheese', 'bread', 'sandwich'],
    ingredients: ['Bread', 'Cheddar', 'Butter'],
    recipeUrl: 'https://www.simplyrecipes.com/recipes/how_to_make_a_grilled_cheese_sandwich/',
    recipeSource: 'Simply Recipes',
    logItems: [
      { name: 'Grilled cheese', calories: 400, protein_g: 18, carbs_g: 32, fat_g: 22, fiber_g: 2, meal: 'lunch' },
    ],
  },
  {
    id: 'oatmeal',
    title: 'Oatmeal bowl',
    meal: 'breakfast',
    kidOk: true,
    quiet: true,
    tags: ['oatmeal', 'oat', 'banana', 'berries', 'yogurt', 'milk'],
    ingredients: ['Rolled oats', 'Milk', 'Banana'],
    recipeUrl: 'https://cookieandkate.com/best-oatmeal-recipe/',
    recipeSource: 'Cookie and Kate',
    logNames: ['Oatmeal (1 cup cooked)', 'Banana'],
  },
];

function mealSlot(hour) {
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  return 'dinner';
}

function sourceFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('budgetbytes')) return 'Budget Bytes';
    if (host.includes('seriouseats')) return 'Serious Eats';
    if (host.includes('cookieandkate')) return 'Cookie and Kate';
    if (host.includes('simplyrecipes')) return 'Simply Recipes';
    if (host.includes('skinnytaste')) return 'Skinnytaste';
    if (host.includes('loveandlemons')) return 'Love and Lemons';
  } catch { /* ignore */ }
  return null;
}

function kickerFor(slot) {
  if (slot === 'breakfast') return 'Cook this morning';
  if (slot === 'lunch') return 'Cook for lunch';
  return 'Cook tonight';
}

function kitchenHay(kitchen) {
  return kitchen.map((row) => String(row.name || '').toLowerCase()).join(' | ');
}

function hitTags(recipe, hay) {
  return (recipe.tags || []).filter((tag) => hay.includes(tag));
}

function scoreRecipe(recipe, ctx) {
  const items = itemsFor(recipe);
  const kcal = items.reduce((sum, row) => sum + (Number(row.calories) || 0), 0);
  const protein = items.reduce((sum, row) => sum + (Number(row.protein_g) || 0), 0);
  let score = 0;
  if (recipe.meal === ctx.slot) score += 20;
  else if ((recipe.meals || []).includes(ctx.slot)) score += 16;
  else if (ctx.slot === 'dinner' && recipe.meal === 'lunch') score += 4;
  else score -= 8;
  score += hitTags(recipe, ctx.hay).length * 10;
  if (ctx.child) return recipe.kidOk ? score + 8 : score - 50;
  if (ctx.remainingKcal != null) {
    if (ctx.remainingKcal < -80) score += recipe.quiet ? 18 : -12;
    else {
      const target = Math.min(Math.max(ctx.remainingKcal, 280), 720);
      score += Math.max(0, 24 - Math.abs(kcal - target) / 28);
    }
    if (ctx.remainingProtein > 20) score += Math.min(12, protein / 4);
  }
  return score;
}

function whyFor(recipe, ctx, items) {
  if (ctx.child) return 'A normal meal.';
  const hits = hitTags(recipe, ctx.hay);
  const kcal = items.reduce((sum, row) => sum + (Number(row.calories) || 0), 0);
  const protein = items.reduce((sum, row) => sum + (Number(row.protein_g) || 0), 0);
  if (ctx.remainingKcal != null && ctx.remainingKcal < -80 && recipe.quiet) {
    return hits.length
      ? `Quieter plate. Uses ${hits.slice(0, 2).join(' and ')}.`
      : 'Quieter plate — the day already ran long.';
  }
  const bits = [];
  if (hits.length) bits.push(`Uses ${hits.slice(0, 2).join(' and ')}.`);
  if (!ctx.simple && ctx.remainingKcal != null && ctx.remainingKcal > 40) {
    bits.push(`${Math.round(kcal)} kcal, ${Math.round(protein)}g protein.`);
  }
  return bits.join(' ');
}

function formatIdea(recipe, ctx) {
  const items = itemsFor(recipe);
  const kcal = items.reduce((sum, row) => sum + (Number(row.calories) || 0), 0);
  const protein = items.reduce((sum, row) => sum + (Number(row.protein_g) || 0), 0);
  const url = allowedRecipeUrl(recipe.recipeUrl) ? recipe.recipeUrl : null;
  return {
    id: recipe.id,
    title: recipe.title,
    why: whyFor(recipe, ctx, items),
    ingredients: recipe.ingredients || [],
    recipeUrl: url,
    recipeSource: url ? (recipe.recipeSource || sourceFromUrl(url)) : null,
    items,
    meal: ctx.slot === 'breakfast' || ctx.slot === 'lunch' ? ctx.slot : (recipe.meal || 'dinner'),
    kcal: Math.round(kcal),
    protein: Math.round(protein),
  };
}

export function cookTonight({
  kitchen = [],
  remainingKcal = null,
  remainingProtein = null,
  child = false,
  hour = 18,
  simple = false,
} = {}) {
  const slot = mealSlot(hour);
  const hay = kitchenHay(kitchen);
  const ctx = { slot, hay, remainingKcal, remainingProtein, child, simple };
  const pool = COOK_RECIPES.filter((recipe) => (child ? recipe.kidOk : true));
  const ranked = [...pool].sort((a, b) => scoreRecipe(b, ctx) - scoreRecipe(a, ctx));
  return {
    kicker: kickerFor(slot),
    slot,
    ideas: ranked.slice(0, 6).map((recipe) => formatIdea(recipe, ctx)),
  };
}

export function suggestNextPlate(args) {
  const cook = cookTonight(args);
  const idea = cook.ideas[0];
  if (!idea) return null;
  return {
    title: idea.title,
    body: idea.why,
    items: idea.items,
  };
}
