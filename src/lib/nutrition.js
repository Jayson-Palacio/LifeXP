export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Mostly sitting', hint: 'Desk day, little movement', multiplier: 1.2, child: 1.3 },
  { id: 'light', label: 'Lightly active', hint: 'Walks or 1–2 workouts a week', multiplier: 1.375, child: 1.45 },
  { id: 'moderate', label: 'On the move', hint: '3–4 workouts, or an active job', multiplier: 1.55, child: 1.6 },
  { id: 'active', label: 'Training often', hint: '5–6 workouts a week', multiplier: 1.725, child: 1.75 },
  { id: 'very_active', label: 'Heavy training', hint: 'Daily training or physical work', multiplier: 1.9, child: 1.9 },
];

export const MEMBER_ACCENTS = ['#2f5d50', '#b8734a', '#5c4d7a', '#3d5a80', '#8a5a44'];

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

export function macroTargets({ calories, weightKg, age, intent }) {
  if (!calories) return { protein: null, carbs: null, fat: null };
  const proteinPerLb = age != null && age < 18 ? 0.55 : intent === 'lose' ? 0.9 : 0.75;
  const protein = Math.round(Math.max(age != null && age < 14 ? 30 : 60, kgToLb(weightKg) * proteinPerLb));
  const fat = Math.round((calories * (age != null && age < 18 ? 0.3 : 0.25)) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, carbs, fat };
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
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function rollingAvg(weights, n = 7) {
  if (!weights.length) return null;
  const slice = weights.slice(-n);
  return slice.reduce((sum, row) => sum + Number(row.weight_kg), 0) / slice.length;
}
