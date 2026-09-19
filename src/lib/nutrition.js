export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise', multiplier: 1.2 },
  { id: 'light', label: 'Light', hint: 'Walks or 1–2 workouts / week', multiplier: 1.375 },
  { id: 'moderate', label: 'Moderate', hint: '3–4 workouts / week', multiplier: 1.55 },
  { id: 'active', label: 'Active', hint: '5–6 workouts / week', multiplier: 1.725 },
  { id: 'very_active', label: 'Very active', hint: 'Daily training or physical job', multiplier: 1.9 },
];

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
  return Math.max(13, Math.min(100, now.getFullYear() - Number(birthYear)));
}

export function activityMultiplier(level) {
  return ACTIVITY_LEVELS.find((item) => item.id === level)?.multiplier ?? 1.55;
}

/** Mifflin–St Jeor resting energy, kcal/day. */
export function bmrKcal({ kg, cm, age, sex }) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}

export function tdeeKcal(profile, weightKg) {
  const age = ageFromBirthYear(profile.birth_year);
  const bmr = bmrKcal({ kg: weightKg, cm: Number(profile.height_cm), age, sex: profile.sex });
  return Math.round(bmr * activityMultiplier(profile.activity_level));
}

export function calorieFloor(sex) {
  return sex === 'female' ? 1200 : 1500;
}

/** 1 kg of fat ≈ 7700 kcal. Clamp the deficit so intake never drops below the floor. */
export function calorieTarget({ tdee, weeklyLossKg, sex }) {
  const deficit = (Number(weeklyLossKg) * 7700) / 7;
  return Math.max(calorieFloor(sex), Math.round(tdee - deficit));
}

export function macroTargets({ calories, weightKg }) {
  const protein = Math.round(Math.max(80, kgToLb(weightKg) * 0.9));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, carbs, fat };
}

export function suggestedWeeklyLossKg(currentKg, targetKg) {
  const delta = currentKg - targetKg;
  if (delta <= 0) return 0;
  const conservative = Math.min(0.9, Math.max(0.25, currentKg * 0.0075));
  return Math.round(conservative * 100) / 100;
}

export function localDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatWeight(kg, units) {
  if (units === 'metric') return `${Number(kg).toFixed(1)} kg`;
  return `${kgToLb(kg).toFixed(1)} lb`;
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
