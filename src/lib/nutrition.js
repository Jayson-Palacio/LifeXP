export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Mostly sitting', hint: 'Desk day, little movement', multiplier: 1.2, child: 1.3 },
  { id: 'light', label: 'Lightly active', hint: 'Walks or 1–2 workouts a week', multiplier: 1.375, child: 1.45 },
  { id: 'moderate', label: 'On the move', hint: '3–4 workouts, or an active job', multiplier: 1.55, child: 1.6 },
  { id: 'active', label: 'Training often', hint: '5–6 workouts a week', multiplier: 1.725, child: 1.75 },
  { id: 'very_active', label: 'Heavy training', hint: 'Daily training or physical work', multiplier: 1.9, child: 1.9 },
];

export const MEMBER_ACCENTS = ['#2f5d50', '#b8734a', '#5c4d7a', '#3d5a80', '#8a5a44'];

export const PLAN_METHODS = [
  { id: 'high_protein', label: 'High protein', hint: 'Best for a cut. Protein first, modest deficit.' },
  { id: 'balanced', label: 'Balanced', hint: 'Same calories, more carbs, a little less protein.' },
  { id: 'simple', label: 'Simple', hint: 'About 30g protein a meal, fiber, and 30 minutes of movement.' },
  { id: 'custom', label: 'Custom', hint: 'You set the numbers. We will not overwrite them on weigh-in.' },
];

export const MOVE_KINDS = [
  { id: 'walk', label: 'Walk', met: { easy: 3, moderate: 3.5, hard: 4.3 }, vigorous: false, strength: false },
  { id: 'run', label: 'Run', met: { easy: 7, moderate: 9.8, hard: 11.5 }, vigorous: true, strength: false },
  { id: 'bike', label: 'Bike', met: { easy: 4, moderate: 6.8, hard: 8.5 }, vigorous: true, strength: false },
  { id: 'lift', label: 'Lift', met: { easy: 3.5, moderate: 5, hard: 6 }, vigorous: false, strength: true },
  { id: 'swim', label: 'Swim', met: { easy: 6, moderate: 8, hard: 10 }, vigorous: true, strength: false },
  { id: 'hiit', label: 'HIIT', met: { easy: 8, moderate: 10, hard: 12 }, vigorous: true, strength: false },
  { id: 'yoga', label: 'Yoga', met: { easy: 2.5, moderate: 3.3, hard: 4.5 }, vigorous: false, strength: false },
  { id: 'sport', label: 'Sport', met: { easy: 5, moderate: 7, hard: 9 }, vigorous: true, strength: false },
  { id: 'play', label: 'Play', met: { easy: 3, moderate: 5, hard: 7 }, vigorous: false, strength: false },
  { id: 'steps', label: 'Steps', met: { easy: 3, moderate: 3.5, hard: 4.3 }, vigorous: false, strength: false, hidden: true },
  { id: 'other', label: 'Other', met: { easy: 3, moderate: 4.5, hard: 6 }, vigorous: false, strength: false },
];

export const LEGACY_MOVE_KINDS = ['walk', 'run', 'bike', 'lift', 'play', 'other'];
export const WORKOUT_KINDS = MOVE_KINDS.filter((item) => !item.hidden);

export const SERVING_OPTIONS = [0.5, 1, 2];
export const FAMILY_SERVINGS = [0.5, 1, 1.5, 2];

export const FOOD_MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
  { id: 'drink', label: 'Drink' },
];

export const DEFAULT_MOVES = [
  { label: '30 min walk', kind: 'walk', minutes: 30, effort: 'moderate' },
  { label: '45 min lift', kind: 'lift', minutes: 45, effort: 'moderate' },
  { label: '20 min HIIT', kind: 'hiit', minutes: 20, effort: 'hard' },
];

export const MEAL_IDS = FOOD_MEALS.map((item) => item.id);

export function kgToLb(kg) {
  return kg * 2.2046226218;
}

export function lbToKg(lb) {
  return lb / 2.2046226218;
}

export function cmToIn(cm) {
  return cm / 2.54;
}

export function inToCm(inches) {
  return inches * 2.54;
}

export function ageFromBirthYear(birthYear, now = new Date()) {
  if (!birthYear) return null;
  return Math.max(1, Math.min(100, now.getFullYear() - Number(birthYear)));
}

export function birthYearFromAge(age, now = new Date()) {
  const years = Number(age);
  if (!Number.isFinite(years) || years < 1 || years > 100) return null;
  return now.getFullYear() - Math.round(years);
}

export function activityMultiplier(level, age = 30) {
  const row = ACTIVITY_LEVELS.find((item) => item.id === level);
  if (!row) return age < 18 ? 1.6 : 1.55;
  return age < 18 ? row.child : row.multiplier;
}

/** Mifflin–St Jeor for adults. Schofield for under 18. */
export function bmrKcal({ kg, cm, age, sex }) {
  if (age < 18) {
    if (age < 10) {
      return sex === 'female' ? 22.5 * kg + 499 : 22.7 * kg + 495;
    }
    return sex === 'female' ? 12.2 * kg + 746 : 17.5 * kg + 651;
  }
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}

export function tdeeKcal(profile, weightKg) {
  const age = ageFromBirthYear(profile.birth_year) ?? 30;
  const height = Number(profile.height_cm) || (age < 18 ? 140 : 170);
  const bmr = bmrKcal({ kg: weightKg, cm: height, age, sex: profile.sex });
  return Math.round(bmr * activityMultiplier(profile.activity_level, age));
}

export function calorieFloor({ sex, age }) {
  if (age == null || age < 9) return null;
  if (age < 14) return sex === 'female' ? 1400 : 1600;
  if (age < 18) return sex === 'female' ? 1600 : 1800;
  return sex === 'female' ? 1200 : 1500;
}

export function inferIntent({ kind, currentKg, targetKg, age }) {
  if (kind === 'child' || (age != null && age < 18)) return 'grow';
  if (!currentKg || !targetKg) return 'maintain';
  if (targetKg < currentKg - 0.4) return 'lose';
  if (targetKg > currentKg + 0.4) return 'gain';
  return 'maintain';
}

/** 1 kg of fat ≈ 7700 kcal. Children never get an aggressive deficit. */
export function calorieTarget({ tdee, weeklyChangeKg, sex, age, intent }) {
  const floor = calorieFloor({ sex, age });
  if (intent === 'grow' || (age != null && age < 18 && intent !== 'gain' && intent !== 'lose')) {
    return Math.round(tdee);
  }
  if (intent === 'maintain' || !weeklyChangeKg) {
    return Math.round(tdee);
  }
  const daily = (Number(weeklyChangeKg) * 7700) / 7;
  if (intent === 'gain') return Math.round(tdee + daily);
  const deficit = age != null && age < 18 ? Math.min(daily, 250) : daily;
  const raw = Math.round(tdee - deficit);
  return floor ? Math.max(floor, raw) : raw;
}

export function defaultMethod(intent) {
  if (intent === 'lose') return 'high_protein';
  if (intent === 'grow') return 'simple';
  return 'balanced';
}

export function fiberTargetG({ method, sex, explicit }) {
  if (explicit != null && explicit !== '') return Number(explicit) || null;
  if (method === 'simple') return sex === 'male' ? 35 : 28;
  return null;
}

export function macroTargets({ calories, weightKg, age, intent, method }) {
  if (!calories) return { protein: null, carbs: null, fat: null };
  const child = age != null && age < 18;
  let proteinPerLb = child ? 0.55 : intent === 'lose' ? 0.9 : 0.75;
  if (method === 'balanced') proteinPerLb = child ? 0.5 : 0.7;
  if (method === 'simple') proteinPerLb = child ? 0.55 : 0.85;
  const proteinFloor = method === 'simple' && !child ? 90 : (age != null && age < 14 ? 30 : 60);
  const protein = Math.round(Math.max(proteinFloor, kgToLb(weightKg) * proteinPerLb));
  const fatShare = child ? 0.3 : method === 'balanced' ? 0.28 : 0.25;
  const fat = Math.round((calories * fatShare) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, carbs, fat };
}

export function previewPlanTargets({
  sex,
  age,
  heightCm,
  weightKg,
  activity_level,
  intent,
  weeklyChangeKg,
  method,
  kind,
}) {
  const years = Number(age);
  if (!sex || !years || !heightCm || !weightKg) return null;
  const child = kind === 'child' || years < 18;
  const resolvedIntent = child ? 'grow' : (intent || 'maintain');
  const resolvedMethod = child ? 'simple' : (method || defaultMethod(resolvedIntent));
  const tdee = tdeeKcal({
    sex,
    birth_year: birthYearFromAge(years),
    height_cm: heightCm,
    activity_level: activity_level || 'moderate',
  }, weightKg);
  const calories = calorieTarget({
    tdee,
    weeklyChangeKg: child ? 0 : Number(weeklyChangeKg) || 0,
    sex,
    age: years,
    intent: resolvedIntent,
  });
  const macros = macroTargets({
    calories,
    weightKg,
    age: years,
    intent: resolvedIntent,
    method: resolvedMethod,
  });
  return { tdee, calories, ...macros, intent: resolvedIntent, method: resolvedMethod };
}

export function applyPlanNumbers({ method, computed, overrides = {} }) {
  const locked = method === 'custom'
    || overrides.calories != null
    || overrides.protein != null
    || overrides.carbs != null
    || overrides.fat != null;
  return {
    calories: overrides.calories ?? computed.calories,
    protein: overrides.protein ?? computed.protein,
    carbs: overrides.carbs ?? computed.carbs,
    fat: overrides.fat ?? computed.fat,
    locked,
  };
}

export function minutesFromSteps(steps) {
  return Math.max(1, Math.round((Number(steps) || 0) / 100));
}

export function isStepLog(row) {
  return row?.kind === 'steps' || Number(row?.steps || 0) > 0;
}

export function activityKcal({ kind, minutes, effort, weightKg }) {
  const row = MOVE_KINDS.find((item) => item.id === kind) || MOVE_KINDS[MOVE_KINDS.length - 1];
  const met = row.met[effort] || row.met.moderate;
  const kg = Number(weightKg) || 80;
  const mins = Math.max(1, Number(minutes) || 0);
  return Math.round(met * kg * (mins / 60));
}

export function moderateMinutes({ kind, minutes, effort }) {
  const row = MOVE_KINDS.find((item) => item.id === kind);
  const mins = Number(minutes) || 0;
  if (row?.vigorous || effort === 'hard') return mins * 2;
  return mins;
}

export function isStrength(kind) {
  return MOVE_KINDS.find((item) => item.id === kind)?.strength === true;
}

export function scaleServing(item, servings = 1) {
  const s = Number(servings) || 1;
  const round1 = (value) => Math.round((Number(value) || 0) * s * 10) / 10;
  return {
    ...item,
    calories: Math.round((Number(item.calories) || 0) * s),
    protein_g: round1(item.protein_g),
    carbs_g: round1(item.carbs_g),
    fat_g: round1(item.fat_g),
    fiber_g: round1(item.fiber_g),
    servings: s,
  };
}

export function suggestedWeeklyChangeKg(currentKg, targetKg, intent) {
  if (intent === 'maintain' || intent === 'grow') return 0;
  const delta = Math.abs(currentKg - targetKg);
  if (delta < 0.4) return 0;
  const conservative = Math.min(0.7, Math.max(0.25, currentKg * 0.0065));
  return Math.round(conservative * 100) / 100;
}

export function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDay(iso, days) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDateISO(date);
}

export function formatWeight(kg, units) {
  if (kg == null || kg === '') return '—';
  if (units === 'metric') return `${Number(kg).toFixed(1)} kg`;
  return `${kgToLb(kg).toFixed(1)} lb`;
}

export function defaultMeal(date = new Date()) {
  const hour = date.getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

export function sumMacros(logs) {
  return logs.reduce(
    (acc, row) => ({
      calories: acc.calories + Number(row.calories || 0),
      protein: acc.protein + Number(row.protein_g || 0),
      carbs: acc.carbs + Number(row.carbs_g || 0),
      fat: acc.fat + Number(row.fat_g || 0),
      fiber: acc.fiber + Number(row.fiber_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function rollingAvg(weights, n = 7) {
  if (!weights.length) return null;
  const slice = weights.slice(-n);
  return slice.reduce((sum, row) => sum + Number(row.weight_kg), 0) / slice.length;
}
