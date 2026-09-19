'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../../lib/authz';
import {
  calorieTarget,
  inToCm,
  lbToKg,
  localDateISO,
  macroTargets,
  tdeeKcal,
} from '../../lib/nutrition';

function fail(error) {
  return { success: false, error };
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function vitalUser() {
  const { user, supabase } = await requireUser();
  if (!user) return { error: 'Please log in.' };
  return { user, supabase };
}

export async function saveVitalPlan(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const { user, supabase } = auth;

  const units = payload.units === 'metric' ? 'metric' : 'us';
  const sex = payload.sex === 'female' ? 'female' : payload.sex === 'male' ? 'male' : null;
  const birthYear = num(payload.birth_year);
  const activity = ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(payload.activity_level)
    ? payload.activity_level
    : 'moderate';

  if (!sex) return fail('Choose male or female so we can estimate your calorie needs.');
  if (!birthYear || birthYear < 1920 || birthYear > 2013) return fail('Enter a valid birth year.');

  const heightCm = units === 'metric' ? num(payload.height) : inToCm(num(payload.height));
  const currentKg = units === 'metric' ? num(payload.current_weight) : lbToKg(num(payload.current_weight));
  const targetKg = units === 'metric' ? num(payload.target_weight) : lbToKg(num(payload.target_weight));
  const weeklyLossKg = units === 'metric' ? num(payload.weekly_loss) : lbToKg(num(payload.weekly_loss));

  if (!heightCm || heightCm < 80 || heightCm > 250) return fail('Height looks off — double-check it.');
  if (!currentKg || currentKg < 20 || currentKg > 400) return fail('Current weight looks off — double-check it.');
  if (!targetKg || targetKg < 20 || targetKg > 400) return fail('Goal weight looks off — double-check it.');
  if (weeklyLossKg == null || weeklyLossKg < 0 || weeklyLossKg > 1.2) {
    return fail('Weekly change should be between 0 and about 2.5 lb (1.2 kg).');
  }

  const profile = {
    user_id: user.id,
    sex,
    birth_year: Math.round(birthYear),
    height_cm: Math.round(heightCm * 10) / 10,
    activity_level: activity,
    units,
    updated_at: new Date().toISOString(),
  };

  const tdee = tdeeKcal(profile, currentKg);
  const calories = calorieTarget({ tdee, weeklyLossKg, sex });
  const macros = macroTargets({ calories, weightKg: currentKg });

  const { data: existing } = await supabase.from('vital_goals').select('start_weight_kg').maybeSingle();

  const goals = {
    user_id: user.id,
    start_weight_kg: existing?.start_weight_kg ?? Math.round(currentKg * 10) / 10,
    current_weight_kg: Math.round(currentKg * 10) / 10,
    target_weight_kg: Math.round(targetKg * 10) / 10,
    weekly_loss_kg: Math.round(weeklyLossKg * 100) / 100,
    calorie_target: calories,
    protein_target_g: macros.protein,
    carbs_target_g: macros.carbs,
    fat_target_g: macros.fat,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase.from('vital_profiles').upsert(profile, { onConflict: 'user_id' });
  if (profileError) return fail(profileError.message);

  const { error: goalError } = await supabase.from('vital_goals').upsert(goals, { onConflict: 'user_id' });
  if (goalError) return fail(goalError.message);

  revalidatePath('/vital');
  return { success: true, data: { calories, macros, tdee } };
}

export async function logVitalFood(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);

  const name = String(payload.name || '').trim();
  const calories = num(payload.calories);
  const protein = num(payload.protein_g) ?? 0;
  const carbs = num(payload.carbs_g) ?? 0;
  const fat = num(payload.fat_g) ?? 0;
  const meal = ['breakfast', 'lunch', 'dinner', 'snack'].includes(payload.meal) ? payload.meal : 'snack';
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();

  if (name.length < 1 || name.length > 120) return fail('Give this food a name (120 characters or fewer).');
  if (calories == null || calories < 0 || calories > 5000) return fail('Calories must be between 0 and 5,000.');
  if ([protein, carbs, fat].some((value) => value < 0 || value > 800)) return fail('Macro values look off.');

  const { data, error } = await auth.supabase.from('vital_food_logs').insert({
    user_id: auth.user.id,
    name,
    calories: Math.round(calories),
    protein_g: Math.round(protein * 10) / 10,
    carbs_g: Math.round(carbs * 10) / 10,
    fat_g: Math.round(fat * 10) / 10,
    meal,
    logged_on: loggedOn,
  }).select().single();

  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true, data };
}

export async function deleteVitalFood(id) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof id !== 'string') return fail('Invalid entry.');
  const { error } = await auth.supabase.from('vital_food_logs').delete().eq('id', id).eq('user_id', auth.user.id);
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true };
}

export async function logVitalWeight(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);

  const { data: profile } = await auth.supabase.from('vital_profiles').select('units, sex, birth_year, height_cm, activity_level').maybeSingle();
  const { data: goals } = await auth.supabase.from('vital_goals').select('*').maybeSingle();
  if (!profile || !goals) return fail('Set up your plan first.');

  const units = profile.units === 'metric' ? 'metric' : 'us';
  const weightKg = units === 'metric' ? num(payload.weight) : lbToKg(num(payload.weight));
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();

  if (!weightKg || weightKg < 20 || weightKg > 400) return fail('Weight looks off — double-check it.');

  const rounded = Math.round(weightKg * 10) / 10;
  const { data, error } = await auth.supabase.from('vital_weigh_ins').upsert({
    user_id: auth.user.id,
    logged_on: loggedOn,
    weight_kg: rounded,
  }, { onConflict: 'user_id,logged_on' }).select().single();
  if (error) return fail(error.message);

  const tdee = tdeeKcal(profile, rounded);
  const calories = calorieTarget({ tdee, weeklyLossKg: goals.weekly_loss_kg, sex: profile.sex });
  const macros = macroTargets({ calories, weightKg: rounded });

  await auth.supabase.from('vital_goals').update({
    current_weight_kg: rounded,
    calorie_target: calories,
    protein_target_g: macros.protein,
    carbs_target_g: macros.carbs,
    fat_target_g: macros.fat,
    updated_at: new Date().toISOString(),
  }).eq('user_id', auth.user.id);

  revalidatePath('/vital');
  return { success: true, data };
}
