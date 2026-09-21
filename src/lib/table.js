import { localYmd } from './time';
import { addShopItem, formatShopNeed, parseShopLine } from './tableShop';
import { COOK_RECIPES, cookTonight, isKitchenRecipe, kitchenRecipeMeta, plateForRecipe, searchCookRecipes } from './vitalSuggest';

export const TABLE_SLOTS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

export const TABLE_AISLES = ['Produce', 'Meat & fish', 'Dairy & eggs', 'Bread', 'Frozen', 'Pantry', 'Other'];

export const TABLE_LABELS = [
  { id: 'crockpot', label: 'Crockpot' },
  { id: 'easy', label: 'Easy' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'beef', label: 'Beef' },
  { id: 'pork', label: 'Pork' },
  { id: 'turkey', label: 'Turkey' },
  { id: 'veg', label: 'Veg' },
  { id: 'soup', label: 'Soup' },
  { id: 'pasta', label: 'Pasta' },
  { id: 'taco', label: 'Tacos' },
  { id: 'chili', label: 'Chili' },
];

const LABEL_TAGS = {
  crockpot: ['crockpot', 'slow-cooker'],
  easy: ['easy'],
  chicken: ['chicken'],
  beef: ['beef'],
  pork: ['pork'],
  turkey: ['turkey'],
  veg: ['veg', 'vegetarian', 'lentil', 'tofu'],
  soup: ['soup', 'stew'],
  pasta: ['pasta'],
  taco: ['taco'],
  chili: ['chili'],
};

const MEAT_TAGS = ['chicken', 'beef', 'pork', 'turkey', 'sausage', 'shrimp', 'fish', 'meatball'];

export function recipeLabels(tags = []) {
  const hay = new Set((tags || []).map((tag) => String(tag || '').trim().toLowerCase()).filter(Boolean));
  const meat = MEAT_TAGS.some((tag) => hay.has(tag));
  const out = [];
  for (const row of TABLE_LABELS) {
    if (row.id === 'veg' && meat) continue;
    const keys = LABEL_TAGS[row.id] || [row.id];
    if (keys.some((key) => hay.has(key) || hay.has(row.label.toLowerCase()))) {
      out.push(row.label);
    }
  }
  return out.slice(0, 4);
}

const AISLE_RULES = [
  { aisle: 'Meat & fish', re: /\b(chicken|beef|pork|turkey|salmon|shrimp|tuna|sausage|bacon|ham|meatballs?|kielbasa|fish|ground)\b/i },
  { aisle: 'Dairy & eggs', re: /\b(milk|cheese|yogurt|egg|butter|cream|ricotta|mozzarella|cheddar|parmesan|feta|swiss|queso)\b/i },
  { aisle: 'Produce', re: /\b(lettuces?|tomatoes?|onions?|peppers?|broccoli|spinach|carrots?|cucumbers?|avocados?|bananas?|apples?|berr\w*|potatoes?|zucchini|garlic|limes?|lemons?|cilantro|cabbage|corn|peas?|kale|mushrooms?|ginger|scallions?|pineapple|herbs?|greens?)\b/i },
  { aisle: 'Bread', re: /\b(bread|tortillas?|buns?|rolls?|bagel|muffins?|hoagie|baguette|biscuits?|pizza dough)\b/i },
  { aisle: 'Frozen', re: /\b(frozen|ravioli)\b/i },
  { aisle: 'Pantry', re: /\b(rice|pasta|bean|chip|oat|flour|noodle|orzo|ramen|sauce|broth|spice|oil|peanut|macaroni|gnocchi|salsa|marinara)\b/i },
];

export function shiftYmd(ymd, days) {
  const [year, month, day] = String(ymd).split('-').map(Number);
  return localYmd(new Date(year, month - 1, day + days));
}

export function weekStartOn(ymd = localYmd()) {
  const [year, month, day] = String(ymd).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - date.getDay());
  return localYmd(date);
}

export function weekDays(weekStart) {
  return Array.from({ length: 7 }, (_, index) => shiftYmd(weekStart, index));
}

export const TABLE_LOCAL_KEY = 'kaeluma.table.v1';

export function emptyMeals(weekStart) {
  const meals = {};
  for (const ymd of weekDays(weekStart)) {
    meals[ymd] = { breakfast: null, lunch: null, dinner: null };
  }
  return meals;
}

export function mergeMeals(weekStart, meals) {
  const next = emptyMeals(weekStart);
  for (const ymd of weekDays(weekStart)) {
    const day = meals?.[ymd] || {};
    next[ymd] = {
      breakfast: day.breakfast || null,
      lunch: day.lunch || null,
      dinner: day.dinner || null,
    };
  }
  return next;
}

export function dayPlates(plans = [], ymd, local = {}) {
  const empty = { breakfast: null, lunch: null, dinner: null };
  if (!ymd) return empty;
  const start = weekStartOn(ymd);
  const saved = local?.[start];
  const source = saved?.meals
    || (plans || []).find((item) => String(item.week_start).slice(0, 10) === start)?.meals;
  if (!source) return empty;
  return mergeMeals(start, source)[ymd] || empty;
}

export function copyMeals(fromMeals, fromWeek, toWeek) {
  const next = emptyMeals(toWeek);
  const fromDays = weekDays(fromWeek);
  const toDays = weekDays(toWeek);
  fromDays.forEach((ymd, index) => {
    const day = fromMeals?.[ymd] || {};
    next[toDays[index]] = {
      breakfast: day.breakfast || null,
      lunch: day.lunch || null,
      dinner: day.dinner || null,
    };
  });
  return next;
}

export function plateSnapshot(idea) {
  if (!idea) return null;
  const ingredients = Array.isArray(idea.ingredients)
    ? idea.ingredients.map((part) => String(part || '').trim()).filter(Boolean).slice(0, 16)
    : [];
  const labels = recipeLabels([...(idea.tags || []), ...(idea.labels || [])]);
  return {
    id: idea.id || null,
    title: String(idea.title || '').trim().slice(0, 120),
    ingredients,
    recipeUrl: idea.recipeUrl || null,
    recipeSource: idea.recipeSource || null,
    notes: String(idea.notes || '').trim().slice(0, 400) || null,
    labels,
    kcal: Math.round(Number(idea.kcal) || 0),
    protein: Math.round(Number(idea.protein) || 0),
    saved: Boolean(idea.saved),
  };
}

export function aisleFor(name) {
  const hay = String(name || '');
  for (const rule of AISLE_RULES) {
    if (rule.re.test(hay)) return rule.aisle;
  }
  return 'Other';
}

function groceryRow(row, prior, extra = false) {
  return {
    key: extra ? `extra:${row.key}` : row.key,
    name: row.name,
    qty: row.qty,
    unit: row.unit,
    staple: Boolean(row.staple),
    need: formatShopNeed(row),
    count: row.uses || row.qty || 1,
    aisle: row.aisle || aisleFor(row.name),
    from: [...(row.from || [])].slice(0, 4),
    done: Boolean(prior?.done),
    extra,
  };
}

export function groceryFromMeals(meals, extras = [], previous = []) {
  const counts = new Map();
  for (const day of Object.values(meals || {})) {
    for (const slot of TABLE_SLOTS) {
      const plate = day?.[slot.id];
      if (!plate?.title) continue;
      for (const raw of plate.ingredients || []) {
        addShopItem(counts, raw, plate.title);
      }
    }
  }

  const extraOnly = new Set();
  for (const extra of extras || []) {
    const parsed = parseShopLine(String(extra.name || extra).trim().slice(0, 80));
    if (!parsed?.name) continue;
    const key = parsed.name.toLowerCase();
    if (!counts.has(key)) extraOnly.add(key);
    addShopItem(counts, extra.name || extra);
  }

  const prev = new Map((previous || []).map((row) => [String(row.key || row.name || '').toLowerCase().replace(/^extra:/, ''), row]));
  const items = [...counts.values()].map((row) => {
    const prior = prev.get(row.key) || prev.get(`extra:${row.key}`);
    return groceryRow(row, prior, extraOnly.has(row.key));
  });

  const aisleRank = new Map(TABLE_AISLES.map((name, index) => [name, index]));
  items.sort((a, b) => {
    const aisle = (aisleRank.get(a.aisle) ?? 99) - (aisleRank.get(b.aisle) ?? 99);
    if (aisle) return aisle;
    return a.name.localeCompare(b.name);
  });
  return items;
}

export function extrasFromGrocery(grocery) {
  return (grocery || [])
    .filter((row) => row.extra && String(row.name || '').trim())
    .map((row) => ({
      name: String(row.need || row.name).trim().slice(0, 80),
      aisle: row.aisle || aisleFor(row.name),
      done: Boolean(row.done),
    }));
}

function weekSeed(weekStart) {
  return String(weekStart).split('-').reduce((sum, part) => sum * 31 + Number(part), 7);
}

export function suggestDinners(weekStart, count = 7, usedTitles = [], salt = 0) {
  const pool = COOK_RECIPES.filter((recipe) => (
    recipe.kidOk
    && (recipe.meal === 'dinner' || (recipe.meals || []).includes('dinner'))
  ));
  const easy = pool.filter((recipe) => (recipe.tags || []).includes('easy'));
  const source = easy.length >= 14 ? easy : pool;
  const start = Math.abs(weekSeed(weekStart) + Number(salt || 0)) % Math.max(1, source.length);
  const step = Math.max(3, Math.floor(source.length / Math.max(count * 2, 1)));
  const seen = new Set(usedTitles.map((title) => String(title || '').toLowerCase()));
  const picked = [];

  const take = (allowSimilar) => {
    for (let index = 0; index < source.length && picked.length < count; index += 1) {
      const recipe = source[(start + index * step) % source.length];
      const key = String(recipe.title || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      if (!allowSimilar && picked.length) {
        const last = picked[picked.length - 1].title.toLowerCase();
        const words = key.split(/\s+/).filter((word) => word.length > 5);
        if (words.some((word) => last.includes(word))) continue;
      }
      seen.add(key);
      picked.push(plateSnapshot(plateForRecipe(recipe, 'dinner')));
    }
  };

  take(false);
  if (picked.length < count) take(true);
  return picked;
}

export function searchPlates(query, { slot = 'dinner', kitchen = [], label = '' } = {}) {
  const q = String(query || '').trim();
  const tag = String(label || '').trim().toLowerCase();
  const wanted = TABLE_LABELS.find((row) => row.id === tag || row.label.toLowerCase() === tag);
  const hasLabel = (row) => {
    if (!wanted) return true;
    return (row.labels || []).some((name) => String(name).toLowerCase() === wanted.label.toLowerCase());
  };

  if (q.length >= 2) {
    return searchCookRecipes(q, { slot, kitchen, simple: true }).map(plateSnapshot).filter((row) => row?.title && hasLabel(row));
  }

  if (wanted) {
    const pack = COOK_RECIPES
      .filter((recipe) => recipeLabels(recipe.tags).includes(wanted.label))
      .slice(0, 24)
      .map((recipe) => plateSnapshot(plateForRecipe(recipe, slot)));
    const saved = (kitchen || [])
      .filter(isKitchenRecipe)
      .map((row) => {
        const meta = kitchenRecipeMeta(row);
        return plateSnapshot({
          id: row.id,
          title: row.name,
          ingredients: meta.ingredients,
          recipeUrl: meta.url,
          recipeSource: meta.url ? 'Your recipe' : null,
          notes: meta.notes,
          tags: meta.tags,
          kcal: row.calories,
          protein: row.protein_g,
          saved: true,
        });
      })
      .filter((row) => row?.title && hasLabel(row));
    const seen = new Set();
    const out = [];
    for (const row of [...saved, ...pack]) {
      const key = String(row.title || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(row);
      if (out.length >= 16) break;
    }
    return out;
  }

  const hour = slot === 'breakfast' ? 8 : slot === 'lunch' ? 12 : 18;
  return cookTonight({ kitchen, slot, hour, simple: true }).ideas.slice(0, 10).map(plateSnapshot);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function weekLabel(weekStart) {
  const [, month, day] = String(weekStart).split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}`;
}

export function dayLabel(ymd) {
  const [year, month, day] = String(ymd).split('-').map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return `${WEEKDAYS[weekday]}, ${MONTHS[month - 1]} ${day}`;
}

export function weekdayShort(ymd) {
  const [year, month, day] = String(ymd).split('-').map(Number);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
}

export function dayNum(ymd) {
  return String(ymd).split('-')[2].replace(/^0/, '');
}

const MEAL_TONES = ['clay', 'chile', 'gold', 'tomato', 'sea', 'leaf', 'sun', 'ink', 'plum', 'ember', 'dusk', 'copper'];

function hashTone(hay, tones = MEAL_TONES) {
  let hash = 2166136261;
  for (let index = 0; index < hay.length; index += 1) {
    hash = Math.imul(hash ^ hay.charCodeAt(index), 16777619);
  }
  return tones[Math.abs(hash) % tones.length];
}

export function mealTone(title) {
  const hay = String(title || '').toLowerCase();
  if (/taco|burrito|nacho|enchilada|salsa|chili|quesadilla|posole|carnitas|tinga/.test(hay)) return 'chile';
  if (/pasta|lasagna|ravioli|spaghetti|alfredo|orzo|gnocchi|ziti|penne/.test(hay)) return 'gold';
  if (/pizza|macaroni|\bmac\b|grilled cheese|slider/.test(hay)) return 'tomato';
  if (/fish|shrimp|salmon|tuna|cod|tilapia/.test(hay)) return 'sea';
  if (/teriyaki|stir[- ]?fry|ramen|pho|curry|pad thai|korean|miso|dumpling/.test(hay)) return 'dusk';
  if (/bbq|barbecue/.test(hay)) return 'ember';
  if (/salad|soup|veg|bean|lentil|chickpea|tofu/.test(hay)) return 'leaf';
  if (/egg|pancake|breakfast|yogurt|oat|toast/.test(hay)) return 'sun';
  if (/beef|burger|meatloaf|steak|pork|hamburger/.test(hay)) return 'ink';
  if (/chicken|turkey|nugget/.test(hay)) return hashTone(hay, ['clay', 'ember', 'copper', 'plum']);
  return hashTone(hay);
}

export function countSlot(meals, slot) {
  return Object.values(meals || {}).filter((day) => day?.[slot]?.title).length;
}

export function weekProtein(meals) {
  let grams = 0;
  for (const day of Object.values(meals || {})) {
    for (const slot of TABLE_SLOTS) {
      grams += Math.round(Number(day?.[slot.id]?.protein) || 0);
    }
  }
  return grams;
}

export function countPlates(meals) {
  let n = 0;
  for (const day of Object.values(meals || {})) {
    for (const slot of TABLE_SLOTS) {
      if (day?.[slot.id]?.title) n += 1;
    }
  }
  return n;
}

export function groceryLeft(grocery) {
  return (grocery || []).filter((row) => !row.done).length;
}

export function groceryText(grocery) {
  return (grocery || [])
    .filter((row) => !row.done)
    .map((row) => row.need || row.name)
    .join('\n');
}
