const FRACTIONS = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
};

const UNIT_ALIAS = {
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  gal: 'gal',
  gallon: 'gal',
  gallons: 'gal',
  qt: 'qt',
  quart: 'qt',
  quarts: 'qt',
  pint: 'pint',
  pints: 'pint',
  dozen: 'dozen',
  bunch: 'bunch',
  bunches: 'bunch',
  can: 'can',
  cans: 'can',
  jar: 'jar',
  jars: 'jar',
  box: 'box',
  boxes: 'box',
  bag: 'bag',
  bags: 'bag',
  loaf: 'loaf',
  loaves: 'loaf',
  pack: 'pack',
  packs: 'pack',
  package: 'pack',
  bottle: 'bottle',
  bottles: 'bottle',
  carton: 'carton',
  cartons: 'carton',
  cup: 'cup',
  cups: 'cup',
  each: 'each',
  ct: 'each',
  count: 'each',
  large: 'each',
};

const PLURAL = {
  bunch: 'bunches',
  can: 'cans',
  jar: 'jars',
  box: 'boxes',
  bag: 'bags',
  loaf: 'loaves',
  pack: 'packs',
  bottle: 'bottles',
  carton: 'cartons',
  pint: 'pints',
  gal: 'gal',
  qt: 'qt',
  lb: 'lb',
  oz: 'oz',
  dozen: 'dozen',
  each: '',
  tub: 'tubs',
};

// Family-dinner shop amounts. Specific names first. Staples stay at one bottle/jar.
const SHOP_DEFAULTS = [
  { re: /rotisserie chicken/i, name: 'Rotisserie chicken', qty: 1, unit: 'each' },
  { re: /chicken breast|chicken tenders|shredded chicken/i, name: 'Chicken breast', qty: 1.5, unit: 'lb' },
  { re: /chicken thighs/i, name: 'Chicken thighs', qty: 1.5, unit: 'lb' },
  { re: /chicken sausage/i, name: 'Chicken sausage', qty: 1, unit: 'pack' },
  { re: /chicken broth/i, name: 'Chicken broth', qty: 1, unit: 'carton' },
  { re: /\bchicken\b/i, name: 'Chicken', qty: 1.5, unit: 'lb' },
  { re: /ground turkey/i, name: 'Ground turkey', qty: 1, unit: 'lb' },
  { re: /ground beef/i, name: 'Ground beef', qty: 1, unit: 'lb' },
  { re: /ground chicken/i, name: 'Ground chicken', qty: 1, unit: 'lb' },
  { re: /ground pork/i, name: 'Ground pork', qty: 1, unit: 'lb' },
  { re: /italian sausage/i, name: 'Italian sausage', qty: 1, unit: 'lb' },
  { re: /smoked sausage|kielbasa/i, name: 'Smoked sausage', qty: 1, unit: 'pack' },
  { re: /\bsausage\b/i, name: 'Sausage', qty: 1, unit: 'pack' },
  { re: /pork chops/i, name: 'Pork chops', qty: 1.5, unit: 'lb' },
  { re: /pork shoulder|pulled pork/i, name: 'Pork shoulder', qty: 2, unit: 'lb' },
  { re: /\bpork\b/i, name: 'Pork', qty: 1.5, unit: 'lb' },
  { re: /salmon/i, name: 'Salmon', qty: 1.25, unit: 'lb' },
  { re: /white fish|\bfish\b/i, name: 'White fish', qty: 1.25, unit: 'lb' },
  { re: /shrimp/i, name: 'Shrimp', qty: 1, unit: 'lb' },
  { re: /canned tuna|\btuna\b/i, name: 'Canned tuna', qty: 2, unit: 'can' },
  { re: /meatballs/i, name: 'Meatballs', qty: 1, unit: 'bag' },
  { re: /pepperoni/i, name: 'Pepperoni', qty: 1, unit: 'pack' },
  { re: /bacon/i, name: 'Bacon', qty: 1, unit: 'pack' },
  { re: /\bham\b/i, name: 'Ham', qty: 0.75, unit: 'lb' },
  { re: /\bbeef\b/i, name: 'Beef', qty: 1, unit: 'lb' },
  { re: /\bturkey\b/i, name: 'Turkey', qty: 1.25, unit: 'lb' },

  { re: /bell peppers?|roasted red peppers|\bpoblano\b|\bpeppers\b/i, name: 'Bell peppers', qty: 3, unit: 'each' },
  { re: /cherry tomatoes/i, name: 'Cherry tomatoes', qty: 1, unit: 'pint' },
  { re: /sun-dried tomatoes|crushed tomatoes|\btomatoes\b|\btomato\b/i, name: 'Tomatoes', qty: 1, unit: 'lb' },
  { re: /sweet potato/i, name: 'Sweet potatoes', qty: 2, unit: 'lb' },
  { re: /potatoes/i, name: 'Potatoes', qty: 2, unit: 'lb' },
  { re: /carrots?|pickled carrot/i, name: 'Carrots', qty: 1, unit: 'lb' },
  { re: /broccoli/i, name: 'Broccoli', qty: 1, unit: 'bunch' },
  { re: /spinach|kale|greens|romaine|\blettuce\b/i, name: 'Greens', qty: 1, unit: 'bunch' },
  { re: /cabbage slaw|\bcabbage\b/i, name: 'Cabbage', qty: 1, unit: 'each' },
  { re: /mushrooms/i, name: 'Mushrooms', qty: 8, unit: 'oz' },
  { re: /zucchini/i, name: 'Zucchini', qty: 2, unit: 'each' },
  { re: /celery/i, name: 'Celery', qty: 1, unit: 'bunch' },
  { re: /cucumber/i, name: 'Cucumbers', qty: 2, unit: 'each' },
  { re: /avocado/i, name: 'Avocados', qty: 2, unit: 'each' },
  { re: /\bonion\b|green onion|scallions/i, name: 'Onions', qty: 2, unit: 'each' },
  { re: /garlic/i, name: 'Garlic', qty: 1, unit: 'each', staple: true },
  { re: /ginger/i, name: 'Ginger', qty: 1, unit: 'each' },
  { re: /cilantro|parsley|basil|herbs/i, name: 'Fresh herbs', qty: 1, unit: 'bunch' },
  { re: /lime/i, name: 'Limes', qty: 3, unit: 'each' },
  { re: /lemon/i, name: 'Lemons', qty: 2, unit: 'each' },
  { re: /orange/i, name: 'Oranges', qty: 3, unit: 'each' },
  { re: /banana/i, name: 'Bananas', qty: 1, unit: 'bunch' },
  { re: /berries|fruit/i, name: 'Berries', qty: 1, unit: 'pint' },
  { re: /pineapple/i, name: 'Pineapple', qty: 1, unit: 'each' },
  { re: /green beans/i, name: 'Green beans', qty: 1, unit: 'lb' },
  { re: /\bcorn\b/i, name: 'Corn', qty: 1, unit: 'bag' },
  { re: /\bpeas\b/i, name: 'Peas', qty: 1, unit: 'bag' },
  { re: /artichokes?/i, name: 'Artichokes', qty: 1, unit: 'jar' },
  { re: /kimchi/i, name: 'Kimchi', qty: 1, unit: 'jar' },
  { re: /frozen vegetables|stir-fry vegetables|mixed vegetables|seasonal vegetables|roasted vegetables|cauliflower rice|vegetables/i, name: 'Frozen vegetables', qty: 1, unit: 'bag' },

  { re: /cottage cheese/i, name: 'Cottage cheese', qty: 16, unit: 'oz' },
  { re: /cream cheese/i, name: 'Cream cheese', qty: 8, unit: 'oz' },
  { re: /sour cream/i, name: 'Sour cream', qty: 1, unit: 'pint' },
  { re: /swiss cheese/i, name: 'Swiss cheese', qty: 8, unit: 'oz' },
  { re: /queso fresco/i, name: 'Queso fresco', qty: 8, unit: 'oz' },
  { re: /mozzarella/i, name: 'Mozzarella', qty: 8, unit: 'oz' },
  { re: /parmesan/i, name: 'Parmesan', qty: 4, unit: 'oz' },
  { re: /cheddar/i, name: 'Cheddar', qty: 8, unit: 'oz' },
  { re: /feta/i, name: 'Feta', qty: 6, unit: 'oz' },
  { re: /ricotta/i, name: 'Ricotta', qty: 15, unit: 'oz' },
  { re: /\bcheese\b/i, name: 'Cheese', qty: 8, unit: 'oz' },
  { re: /\beggs?\b/i, name: 'Eggs', qty: 6, unit: 'each' },
  { re: /\bmilk\b/i, name: 'Milk', qty: 0.5, unit: 'gal' },
  { re: /yogurt/i, name: 'Yogurt', qty: 32, unit: 'oz' },
  { re: /butter/i, name: 'Butter', qty: 1, unit: 'pack' },
  { re: /\bcream\b|alfredo|white sauce|cream sauce|cream soup/i, name: 'Heavy cream', qty: 1, unit: 'pint' },

  { re: /english muffins/i, name: 'English muffins', qty: 1, unit: 'pack' },
  { re: /hawaiian rolls|\brolls\b|\bbuns\b/i, name: 'Buns', qty: 1, unit: 'pack' },
  { re: /hoagie/i, name: 'Hoagie rolls', qty: 4, unit: 'each' },
  { re: /baguette|\bbread\b|\btoast\b/i, name: 'Bread', qty: 1, unit: 'loaf' },
  { re: /corn tortillas/i, name: 'Corn tortillas', qty: 1, unit: 'pack' },
  { re: /hard taco shells|taco shells|tostada/i, name: 'Taco shells', qty: 1, unit: 'box' },
  { re: /tortilla chips|\bchips\b/i, name: 'Tortilla chips', qty: 1, unit: 'bag' },
  { re: /tortillas?/i, name: 'Tortillas', qty: 1, unit: 'pack' },
  { re: /biscuits/i, name: 'Biscuits', qty: 1, unit: 'can' },
  { re: /pizza dough/i, name: 'Pizza dough', qty: 1, unit: 'each' },
  { re: /pie crust/i, name: 'Pie crust', qty: 1, unit: 'each' },

  { re: /black beans|pinto beans|white beans|refried beans|chickpeas|lentils|\bbeans\b/i, name: 'Beans', qty: 2, unit: 'can' },
  { re: /coconut milk/i, name: 'Coconut milk', qty: 1, unit: 'can' },
  { re: /brown rice|leftover rice|\brice\b|quinoa|grits|rolled oats/i, name: 'Rice', qty: 1, unit: 'bag' },
  { re: /lasagna noodles|egg noodles|fideo|soba|fettuccine|spaghetti|penne|orzo|ziti|macaroni|elbow|pasta shells|\bpasta\b|\bnoodles\b|\bramen\b/i, name: 'Pasta', qty: 1, unit: 'box' },
  { re: /frozen ravioli/i, name: 'Frozen ravioli', qty: 1, unit: 'bag' },
  { re: /flour/i, name: 'Flour', qty: 1, unit: 'bag', staple: true },
  { re: /breadcrumbs/i, name: 'Breadcrumbs', qty: 1, unit: 'can', staple: true },
  { re: /broth/i, name: 'Broth', qty: 1, unit: 'carton' },
  { re: /granola/i, name: 'Granola', qty: 1, unit: 'bag' },
  { re: /walnuts|peanuts/i, name: 'Nuts', qty: 1, unit: 'bag' },
  { re: /hominy/i, name: 'Hominy', qty: 1, unit: 'can' },
  { re: /olives/i, name: 'Olives', qty: 1, unit: 'jar' },
  { re: /pickles|relish|capers/i, name: 'Pickles', qty: 1, unit: 'jar', staple: true },
  { re: /green chiles/i, name: 'Green chiles', qty: 1, unit: 'can' },

  { re: /bbq sauce/i, name: 'BBQ sauce', qty: 1, unit: 'bottle', staple: true },
  { re: /soy sauce/i, name: 'Soy sauce', qty: 1, unit: 'bottle', staple: true },
  { re: /enchilada sauce/i, name: 'Enchilada sauce', qty: 1, unit: 'can' },
  { re: /salsa verde|\bsalsa\b/i, name: 'Salsa', qty: 1, unit: 'jar' },
  { re: /marinara|pizza sauce|tomato sauce|pasta sauce/i, name: 'Pasta sauce', qty: 1, unit: 'jar' },
  { re: /\bsauce\b/i, name: 'Pasta sauce', qty: 1, unit: 'jar' },
  { re: /teriyaki/i, name: 'Teriyaki sauce', qty: 1, unit: 'bottle', staple: true },
  { re: /hoisin/i, name: 'Hoisin', qty: 1, unit: 'jar', staple: true },
  { re: /pesto/i, name: 'Pesto', qty: 1, unit: 'jar' },
  { re: /hummus/i, name: 'Hummus', qty: 1, unit: 'tub' },
  { re: /peanut butter|peanut sauce|peanut dressing/i, name: 'Peanut butter', qty: 1, unit: 'jar', staple: true },
  { re: /mayonnaise|\bmayo\b/i, name: 'Mayonnaise', qty: 1, unit: 'jar', staple: true },
  { re: /honey mustard|\bmustard\b|dijon/i, name: 'Mustard', qty: 1, unit: 'bottle', staple: true },
  { re: /ketchup/i, name: 'Ketchup', qty: 1, unit: 'bottle', staple: true },
  { re: /olive oil|sesame oil|\boil\b/i, name: 'Oil', qty: 1, unit: 'bottle', staple: true },
  { re: /chili garlic|chili oil|gochujang|red curry|curry paste|curry powder|curry spices|\bcurry\b/i, name: 'Curry paste', qty: 1, unit: 'jar', staple: true },
  { re: /taco seasoning|chili seasoning|chili spices|cajun|smoked paprika|paprika|cumin|oregano|rosemary|cinnamon|spices|seasoning|chili flakes|chipotle|\bchili\b|\bpepper\b/i, name: 'Spices', qty: 1, unit: 'jar', staple: true },
  { re: /brown sugar|\bhoney\b/i, name: 'Honey', qty: 1, unit: 'bottle', staple: true },
  { re: /balsamic/i, name: 'Balsamic vinegar', qty: 1, unit: 'bottle', staple: true },
  { re: /sofrito/i, name: 'Sofrito', qty: 1, unit: 'jar' },
  { re: /sesame/i, name: 'Sesame seeds', qty: 1, unit: 'jar', staple: true },
];

function parseNumber(raw) {
  const text = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!text) return NaN;
  const bits = text.split(' ');
  let total = 0;
  for (const bit of bits) {
    if (FRACTIONS[bit]) {
      total += FRACTIONS[bit];
      continue;
    }
    const mixed = bit.match(/^(\d+)([½¼¾⅓⅔])$/);
    if (mixed) {
      total += Number(mixed[1]) + FRACTIONS[mixed[2]];
      continue;
    }
    if (bit.includes('/')) {
      const [a, b] = bit.split('/').map(Number);
      if (a && b) total += a / b;
      continue;
    }
    const n = Number(bit);
    if (Number.isFinite(n)) total += n;
  }
  return total || NaN;
}

function niceNumber(value) {
  const n = Math.round(Number(value) * 4) / 4;
  if (!n) return '1';
  const whole = Math.floor(n);
  const frac = n - whole;
  const glyph = frac === 0.25 ? '¼' : frac === 0.5 ? '½' : frac === 0.75 ? '¾' : '';
  if (glyph && whole) return `${whole}${glyph}`;
  if (glyph) return glyph;
  return String(whole || n);
}

function titleName(name) {
  return String(name || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function defaultShop(name) {
  const hay = String(name || '').trim();
  if (!hay) return null;
  for (const row of SHOP_DEFAULTS) {
    if (row.re.test(hay)) {
      return {
        name: row.name,
        qty: row.qty,
        unit: row.unit,
        staple: Boolean(row.staple),
      };
    }
  }
  return { name: titleName(hay), qty: 1, unit: 'each', staple: false };
}

export function parseShopLine(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const match = text.match(/^((?:\d+\s*)?(?:\d+\/\d+|[0-9.]+|[½¼¾⅓⅔]|[0-9]+[½¼¾⅓⅔]))\s+([a-zA-Z]+)?\s*(.*)$/);
  if (match) {
    const qty = parseNumber(match[1]);
    const unit = UNIT_ALIAS[String(match[2] || '').toLowerCase()] || '';
    const rest = String(match[3] || match[2] || '').trim();
    if (Number.isFinite(qty) && unit && rest) {
      const base = defaultShop(rest);
      return {
        name: base?.name || titleName(rest),
        qty,
        unit,
        staple: Boolean(base?.staple),
      };
    }
    if (Number.isFinite(qty) && !unit) {
      const named = titleName(String(match[2] ? `${match[2]} ${match[3]}` : match[3] || '').trim());
      const base = defaultShop(named);
      return {
        name: base?.name || named,
        qty,
        unit: base?.unit === 'each' ? 'each' : (base?.unit || 'each'),
        staple: Boolean(base?.staple),
      };
    }
  }
  return defaultShop(text);
}

function toOz(item) {
  if (item.unit === 'lb') return item.qty * 16;
  if (item.unit === 'oz') return item.qty;
  return null;
}

function mergePair(current, next) {
  if (current.staple || next.staple) {
    return {
      ...current,
      staple: true,
      qty: Math.max(current.qty || 1, next.qty || 1, 1),
      unit: current.unit || next.unit,
    };
  }
  if (current.unit === next.unit) {
    return { ...current, qty: current.qty + next.qty };
  }
  const oz = toOz(current);
  const other = toOz(next);
  if (oz != null && other != null) {
    const total = oz + other;
    if (total >= 16) return { ...current, qty: total / 16, unit: 'lb' };
    return { ...current, qty: total, unit: 'oz' };
  }
  if (current.unit === 'each' && next.unit === 'dozen') {
    return { ...current, qty: current.qty + next.qty * 12, unit: 'each' };
  }
  if (current.unit === 'dozen' && next.unit === 'each') {
    return { ...current, qty: current.qty * 12 + next.qty, unit: 'each', name: current.name || next.name };
  }
  return { ...current, qty: current.qty + next.qty, unit: current.unit };
}

export function formatShopNeed(item) {
  if (!item) return '';
  let qty = Number(item.qty) || 1;
  let unit = item.unit || 'each';
  let name = item.name;

  if (unit === 'oz' && qty >= 16) {
    qty /= 16;
    unit = 'lb';
  }
  if ((/^eggs?$/i.test(name) || unit === 'dozen') && unit !== 'dozen') {
    if (qty >= 12) {
      const dozens = Math.round((qty / 12) * 4) / 4;
      return `${niceNumber(dozens)} dozen eggs`;
    }
    return `${niceNumber(qty)} eggs`;
  }
  if (unit === 'dozen') return `${niceNumber(qty)} dozen ${name.toLowerCase()}`;

  const amount = niceNumber(qty);
  if (unit === 'each') {
    return `${amount} ${name.toLowerCase()}`;
  }
  const label = qty === 1 ? unit : (PLURAL[unit] || unit);
  return `${amount} ${label} ${name.toLowerCase()}`;
}

export function shopKey(item) {
  return String(item?.name || '').toLowerCase();
}

export function addShopItem(map, raw, fromTitle) {
  const item = parseShopLine(raw);
  if (!item?.name) return;
  const key = shopKey(item);
  const current = map.get(key);
  if (!current) {
    map.set(key, {
      ...item,
      key,
      from: new Set(fromTitle ? [fromTitle] : []),
      uses: 1,
    });
    return;
  }
  const merged = mergePair(current, item);
  if (fromTitle) merged.from = new Set(current.from).add(fromTitle);
  else merged.from = current.from;
  merged.uses = current.uses + 1;
  merged.key = key;
  map.set(key, merged);
}
