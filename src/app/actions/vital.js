'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../../lib/authz';
import { lookupFood } from '../../lib/foods';
import { barcodeVariants, foodFromProduct, ilikeSafe } from '../../lib/vitalProducts';
import {
  MEMBER_ACCENTS,
  LEGACY_MOVE_KINDS,
  MOVE_KINDS,
  activityKcal,
  ageFromBirthYear,
  applyPlanNumbers,
  birthYearFromAge,
  calorieTarget,
  defaultMethod,
  fiberTargetG,
  inferIntent,
  inToCm,
  lbToKg,
  localDateISO,
  macroTargets,
  MEAL_IDS,
  minutesFromSteps,
  scaleServing,
  suggestedWeeklyChangeKg,
  tdeeKcal,
} from '../../lib/nutrition';

function fail(error) {
  return { success: false, error };
}

function num(value) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function foodFromOff(product) {
  const n = product?.nutriments || {};
  const perServing = n['energy-kcal_serving'];
  const per100 = n['energy-kcal_100g'] ?? n['energy-kcal'];
  const calories = Math.round(Number(perServing ?? per100 ?? 0));
  if (!calories) return null;
  const name = String(product.product_name || product.generic_name || '').trim().slice(0, 120);
  if (!name) return null;
  return {
    name,
    calories,
    protein_g: Math.round(Number(n.proteins_serving ?? n.proteins_100g ?? 0) * 10) / 10,
    carbs_g: Math.round(Number(n.carbohydrates_serving ?? n.carbohydrates_100g ?? 0) * 10) / 10,
    fat_g: Math.round(Number(n.fat_serving ?? n.fat_100g ?? 0) * 10) / 10,
    fiber_g: Math.round(Number(n.fiber_serving ?? n.fiber_100g ?? 0) * 10) / 10,
    barcode: product.code || null,
    source: 'search',
    serving: perServing != null ? 'serving' : '100g',
  };
}

async function vitalUser() {
  const { user, supabase } = await requireUser();
  if (!user) return { error: 'Please log in.' };
  return { user, supabase };
}

async function ownedMember(supabase, userId, memberId) {
  if (!memberId) return { error: 'Pick someone in the household first.' };
  const { data, error } = await supabase
    .from('vital_members')
    .select('*')
    .eq('id', memberId)
    .eq('owner_id', userId)
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: 'That person is not in your household.' };
  return { member: data };
}

export async function saveVitalMember(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const { user, supabase } = auth;

  const displayName = String(payload.display_name || '').trim();
  if (displayName.length < 1 || displayName.length > 40) {
    return fail('Give them a name (40 characters or fewer).');
  }

  const kind = payload.kind === 'child' ? 'child' : 'adult';
  const units = payload.units === 'metric' ? 'metric' : 'us';
  const sex = payload.sex === 'female' || payload.sex === 'male' ? payload.sex : null;
  const birthYear = payload.birth_year != null && payload.birth_year !== ''
    ? num(payload.birth_year)
    : birthYearFromAge(payload.age);

  if (birthYear && (birthYear < 1920 || birthYear > 2025)) {
    return fail('Age looks off — double-check it.');
  }

  const { count } = await supabase
    .from('vital_members')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  const accent = MEMBER_ACCENTS[(count || 0) % MEMBER_ACCENTS.length];

  const row = {
    owner_id: user.id,
    display_name: displayName,
    kind,
    sex,
    birth_year: birthYear ? Math.round(birthYear) : null,
    units,
    accent: payload.accent || accent,
    updated_at: new Date().toISOString(),
  };

  if (payload.id) {
    const owned = await ownedMember(supabase, user.id, payload.id);
    if (owned.error) return fail(owned.error);
    const { data, error } = await supabase
      .from('vital_members')
      .update(row)
      .eq('id', payload.id)
      .eq('owner_id', user.id)
      .select()
      .single();
    if (error) return fail(error.message);
    revalidatePath('/vital');
    return { success: true, data };
  }

  const { data, error } = await supabase.from('vital_members').insert(row).select().single();
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true, data };
}

export async function saveVitalPlan(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const { user, supabase } = auth;

  const owned = await ownedMember(supabase, user.id, payload.member_id);
  if (owned.error) return fail(owned.error);
  const member = owned.member;

  const units = payload.units === 'metric' ? 'metric' : member.units || 'us';
  const sex = payload.sex === 'female' || payload.sex === 'male' ? payload.sex : member.sex;
  const birthYear = payload.age != null && payload.age !== ''
    ? birthYearFromAge(payload.age)
    : (num(payload.birth_year) ?? member.birth_year);
  const activity = ['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(payload.activity_level)
    ? payload.activity_level
    : member.activity_level || 'moderate';

  if (!sex) return fail('Sex is used only to estimate energy needs. Pick male or female.');
  if (!birthYear || birthYear < 1920 || birthYear > 2025) return fail('Add an age so we can estimate needs.');

  const heightCm = units === 'metric' ? num(payload.height) : inToCm(num(payload.height));
  const currentKg = payload.current_weight === '' || payload.current_weight == null
    ? null
    : units === 'metric' ? num(payload.current_weight) : lbToKg(num(payload.current_weight));
  const targetKg = payload.target_weight === '' || payload.target_weight == null
    ? null
    : units === 'metric' ? num(payload.target_weight) : lbToKg(num(payload.target_weight));

  if (!heightCm || heightCm < 70 || heightCm > 250) return fail('Height looks off — double-check it.');
  if (currentKg != null && (currentKg < 10 || currentKg > 400)) return fail('Weight looks off — double-check it.');
  if (targetKg != null && (targetKg < 10 || targetKg > 400)) return fail('Goal weight looks off — double-check it.');

  const age = ageFromBirthYear(birthYear);
  const kind = member.kind;
  const intent = ['lose', 'maintain', 'gain', 'grow'].includes(payload.intent)
    ? payload.intent
    : inferIntent({ kind, currentKg, targetKg, age });

  if ((intent === 'lose' || intent === 'gain') && age < 18 && payload.confirm_child_goal !== true) {
    return fail('For anyone under 18 we default to growing, not a diet. Confirm if a clinician asked you to set a weight goal.');
  }

  const weekly = intent === 'lose' || intent === 'gain'
    ? (num(payload.weekly_change) != null
      ? (units === 'metric' ? num(payload.weekly_change) : lbToKg(num(payload.weekly_change)))
      : suggestedWeeklyChangeKg(currentKg || 70, targetKg || currentKg || 70, intent))
    : 0;

  if (weekly < 0 || weekly > 1.2) return fail('Weekly change should stay under about 2.5 lb (1.2 kg).');

  const method = ['high_protein', 'balanced', 'simple', 'custom'].includes(payload.method)
    ? payload.method
    : defaultMethod(intent);
  const childPlan = kind === 'child' || age < 18;
  const resolvedMethod = childPlan ? (method === 'custom' ? 'custom' : 'simple') : method;

  const profile = {
    sex,
    birth_year: Math.round(birthYear),
    height_cm: Math.round(heightCm * 10) / 10,
    activity_level: activity,
  };

  let computed = { calories: null, protein: null, carbs: null, fat: null };
  if (currentKg) {
    const tdee = tdeeKcal(profile, currentKg);
    const calories = calorieTarget({ tdee, weeklyChangeKg: weekly, sex, age, intent });
    const macros = macroTargets({ calories, weightKg: currentKg, age, intent, method: resolvedMethod });
    computed = { calories, ...macros };
  }

  const overrides = {
    calories: num(payload.calorie_override),
    protein: num(payload.protein_override),
    carbs: num(payload.carbs_override),
    fat: num(payload.fat_override),
  };
  if (resolvedMethod !== 'custom') {
    if (payload.calorie_override === '' || payload.calorie_override == null) overrides.calories = null;
    if (payload.protein_override === '' || payload.protein_override == null) overrides.protein = null;
    if (payload.carbs_override === '' || payload.carbs_override == null) overrides.carbs = null;
    if (payload.fat_override === '' || payload.fat_override == null) overrides.fat = null;
  }
  const numbers = applyPlanNumbers({ method: resolvedMethod, computed, overrides });
  const fiber = fiberTargetG({
    method: resolvedMethod,
    sex,
    explicit: payload.fiber_target_g,
  });

  const { error: memberError } = await supabase.from('vital_members').update({
    sex,
    birth_year: Math.round(birthYear),
    height_cm: Math.round(heightCm * 10) / 10,
    activity_level: activity,
    units,
    updated_at: new Date().toISOString(),
  }).eq('id', member.id).eq('owner_id', user.id);
  if (memberError) return fail(memberError.message);

  const { data: existing } = await supabase.from('vital_plans').select('start_weight_kg').eq('member_id', member.id).maybeSingle();

  const plan = {
    member_id: member.id,
    owner_id: user.id,
    intent,
    method: resolvedMethod,
    start_weight_kg: existing?.start_weight_kg ?? (currentKg != null ? Math.round(currentKg * 10) / 10 : null),
    current_weight_kg: currentKg != null ? Math.round(currentKg * 10) / 10 : null,
    target_weight_kg: targetKg != null ? Math.round(targetKg * 10) / 10 : (intent === 'grow' ? null : currentKg != null ? Math.round(currentKg * 10) / 10 : null),
    weekly_change_kg: Math.round(weekly * 100) / 100,
    calorie_target: numbers.calories,
    protein_target_g: numbers.protein,
    carbs_target_g: numbers.carbs,
    fat_target_g: numbers.fat,
    calorie_override: numbers.locked ? numbers.calories : null,
    protein_override: numbers.locked ? numbers.protein : null,
    carbs_override: numbers.locked ? numbers.carbs : null,
    fat_override: numbers.locked ? numbers.fat : null,
    fiber_target_g: fiber,
    eat_back: 'off',
    step_goal: Math.round(num(payload.step_goal) || (intent === 'grow' ? 6000 : 8000)),
    updated_at: new Date().toISOString(),
  };

  const { error: planError } = await supabase.from('vital_plans').upsert(plan, { onConflict: 'member_id' });
  if (planError) {
    const slim = { ...plan };
    delete slim.step_goal;
    delete slim.method;
    delete slim.fiber_target_g;
    delete slim.calorie_override;
    delete slim.protein_override;
    delete slim.carbs_override;
    delete slim.fat_override;
    delete slim.eat_back;
    const retry = await supabase.from('vital_plans').upsert(slim, { onConflict: 'member_id' });
    if (retry.error) return fail(retry.error.message);
  }

  revalidatePath('/vital');
  return { success: true, data: { calories: numbers.calories, macros: { protein: numbers.protein, carbs: numbers.carbs, fat: numbers.fat }, intent, method: resolvedMethod } };
}

async function rememberKitchen(supabase, ownerId, item) {
  const name = String(item.name || '').trim();
  if (!name) return;
  const { data: existing } = await supabase
    .from('vital_kitchen')
    .select('id, times_logged')
    .eq('owner_id', ownerId)
    .ilike('name', name)
    .maybeSingle();

  const row = {
    owner_id: ownerId,
    name,
    calories: item.calories,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    fiber_g: item.fiber_g ?? 0,
    barcode: item.barcode || null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { error } = await supabase.from('vital_kitchen').update({
      ...row,
      times_logged: (existing.times_logged || 1) + 1,
    }).eq('id', existing.id);
    return error;
  }

  const { error } = await supabase.from('vital_kitchen').insert({ ...row, times_logged: 1 });
  return error;
}

export async function logVitalFood(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);

  const owned = await ownedMember(auth.supabase, auth.user.id, payload.member_id);
  if (owned.error) return fail(owned.error);

  let name = String(payload.name || '').trim();
  let calories = num(payload.calories);
  let protein = num(payload.protein_g);
  let carbs = num(payload.carbs_g);
  let fat = num(payload.fat_g);
  let fiber = num(payload.fiber_g);
  const servings = num(payload.servings) || 1;

  const catalog = lookupFood(name);
  if (catalog) {
    if (!name) name = catalog.name;
    if (calories == null) calories = catalog.calories;
    if (protein == null) protein = catalog.protein_g;
    if (carbs == null) carbs = catalog.carbs_g;
    if (fat == null) fat = catalog.fat_g;
    if (fiber == null) fiber = catalog.fiber_g;
  }

  if (calories == null && name) {
    const { data: kitchenItem } = await auth.supabase
      .from('vital_kitchen')
      .select('*')
      .eq('owner_id', auth.user.id)
      .ilike('name', name)
      .maybeSingle();
    if (kitchenItem) {
      name = kitchenItem.name;
      calories = Number(kitchenItem.calories);
      protein = protein ?? Number(kitchenItem.protein_g);
      carbs = carbs ?? Number(kitchenItem.carbs_g);
      fat = fat ?? Number(kitchenItem.fat_g);
      fiber = fiber ?? Number(kitchenItem.fiber_g || 0);
    }
  }

  const scaled = scaleServing({
    calories,
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    fiber_g: fiber,
  }, servings);
  calories = scaled.calories;
  protein = scaled.protein_g;
  carbs = scaled.carbs_g;
  fat = scaled.fat_g;
  fiber = scaled.fiber_g;

  const meal = MEAL_IDS.includes(payload.meal)
    ? payload.meal
    : (catalog?.meal || 'snack');
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();

  if (name.length < 1 || name.length > 120) return fail('Give this food a name.');
  if (calories == null || calories < 0 || calories > 5000) {
    return fail('Add calories, or pick a food from the kitchen list.');
  }

  const foodRow = {
    member_id: owned.member.id,
    owner_id: auth.user.id,
    name,
    calories: Math.round(calories),
    protein_g: Math.round((protein ?? 0) * 10) / 10,
    carbs_g: Math.round((carbs ?? 0) * 10) / 10,
    fat_g: Math.round((fat ?? 0) * 10) / 10,
    fiber_g: Math.round((fiber ?? 0) * 10) / 10,
    meal,
    logged_on: loggedOn,
  };

  let { data, error } = await auth.supabase.from('vital_foods').insert(foodRow).select().single();
  if (error && /fiber_g/i.test(error.message || '')) {
    const fallback = { ...foodRow };
    delete fallback.fiber_g;
    ({ data, error } = await auth.supabase.from('vital_foods').insert(fallback).select().single());
  }
  if (error && meal === 'drink' && /meal|check constraint|invalid/i.test(error.message || '')) {
    const fallback = { ...foodRow, meal: 'snack' };
    ({ data, error } = await auth.supabase.from('vital_foods').insert(fallback).select().single());
  }

  if (error) return fail(error.message);

  if (!payload.once) {
    await rememberKitchen(auth.supabase, auth.user.id, {
      name,
      calories: Math.round((calories || 0) / servings),
      protein_g: Math.round(((protein ?? 0) / servings) * 10) / 10,
      carbs_g: Math.round(((carbs ?? 0) / servings) * 10) / 10,
      fat_g: Math.round(((fat ?? 0) / servings) * 10) / 10,
      fiber_g: Math.round(((fiber ?? 0) / servings) * 10) / 10,
      barcode: payload.barcode || null,
    });
  }

  revalidatePath('/vital');
  return { success: true, data };
}

export async function logVitalPlate(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);

  const owned = await ownedMember(auth.supabase, auth.user.id, payload.member_id);
  if (owned.error) return fail(owned.error);

  const meal = MEAL_IDS.includes(payload.meal) ? payload.meal : 'snack';
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();
  const servings = num(payload.servings) || 1;
  const source = Array.isArray(payload.items) ? payload.items.slice(0, 12) : [];
  const inserts = [];

  for (const item of source) {
    const name = String(item?.name || '').trim();
    if (name.length < 1 || name.length > 120) continue;
    const scaled = scaleServing({
      calories: num(item.calories) ?? 0,
      protein_g: num(item.protein_g) ?? 0,
      carbs_g: num(item.carbs_g) ?? 0,
      fat_g: num(item.fat_g) ?? 0,
      fiber_g: num(item.fiber_g) ?? 0,
    }, servings);
    if (scaled.calories < 0 || scaled.calories > 5000) continue;
    inserts.push({
      member_id: owned.member.id,
      owner_id: auth.user.id,
      name,
      calories: Math.round(scaled.calories),
      protein_g: Math.round((scaled.protein_g || 0) * 10) / 10,
      carbs_g: Math.round((scaled.carbs_g || 0) * 10) / 10,
      fat_g: Math.round((scaled.fat_g || 0) * 10) / 10,
      fiber_g: Math.round((scaled.fiber_g || 0) * 10) / 10,
      meal: MEAL_IDS.includes(item.meal) ? item.meal : meal,
      logged_on: loggedOn,
    });
  }

  if (!inserts.length) return fail('Nothing to log on that plate.');

  let { error } = await auth.supabase.from('vital_foods').insert(inserts);
  if (error && /fiber_g/i.test(error.message || '')) {
    ({ error } = await auth.supabase.from('vital_foods').insert(inserts.map((row) => {
      const copy = { ...row };
      delete copy.fiber_g;
      return copy;
    })));
  }
  if (error) return fail(error.message);

  revalidatePath('/vital');
  return { success: true, data: { count: inserts.length } };
}

export async function deleteVitalFood(id) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof id !== 'string') return fail('Invalid entry.');
  const { error } = await auth.supabase.from('vital_foods').delete().eq('id', id).eq('owner_id', auth.user.id);
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true };
}

export async function updateVitalFood(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof payload.id !== 'string') return fail('Invalid entry.');
  const scale = num(payload.scale) || 1;
  if (scale < 0.25 || scale > 4) return fail('Keep the serving between 0.25× and 4×.');
  const { data: row, error: loadError } = await auth.supabase
    .from('vital_foods')
    .select('*')
    .eq('id', payload.id)
    .eq('owner_id', auth.user.id)
    .maybeSingle();
  if (loadError) return fail(loadError.message);
  if (!row) return fail('That log is gone.');
  const next = {
    calories: Math.round((Number(row.calories) || 0) * scale),
    protein_g: Math.round((Number(row.protein_g) || 0) * scale * 10) / 10,
    carbs_g: Math.round((Number(row.carbs_g) || 0) * scale * 10) / 10,
    fat_g: Math.round((Number(row.fat_g) || 0) * scale * 10) / 10,
    fiber_g: Math.round((Number(row.fiber_g) || 0) * scale * 10) / 10,
  };
  const { error } = await auth.supabase.from('vital_foods').update(next).eq('id', row.id).eq('owner_id', auth.user.id);
  if (error && /fiber_g/i.test(error.message || '')) {
    delete next.fiber_g;
    const retry = await auth.supabase.from('vital_foods').update(next).eq('id', row.id).eq('owner_id', auth.user.id);
    if (retry.error) return fail(retry.error.message);
  } else if (error) {
    return fail(error.message);
  }
  revalidatePath('/vital');
  return { success: true };
}

export async function serveVitalFood(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof payload.food_id !== 'string') return fail('Pick a food first.');
  const { data: row, error: loadError } = await auth.supabase
    .from('vital_foods')
    .select('*')
    .eq('id', payload.food_id)
    .eq('owner_id', auth.user.id)
    .maybeSingle();
  if (loadError) return fail(loadError.message);
  if (!row) return fail('That log is gone.');

  const portions = Array.isArray(payload.portions) ? payload.portions : [];
  const inserts = [];
  for (const item of portions.slice(0, 8)) {
    if (item.member_id === row.member_id) continue;
    const owned = await ownedMember(auth.supabase, auth.user.id, item.member_id);
    if (owned.error) continue;
    const scaled = scaleServing(row, num(item.servings) || 1);
    inserts.push({
      member_id: owned.member.id,
      owner_id: auth.user.id,
      name: row.name,
      calories: scaled.calories,
      protein_g: scaled.protein_g,
      carbs_g: scaled.carbs_g,
      fat_g: scaled.fat_g,
      fiber_g: scaled.fiber_g,
      meal: row.meal,
      logged_on: row.logged_on,
    });
  }
  if (!inserts.length) return fail('Pick at least one other person.');
  let { error } = await auth.supabase.from('vital_foods').insert(inserts);
  if (error && /fiber_g/i.test(error.message || '')) {
    ({ error } = await auth.supabase.from('vital_foods').insert(inserts.map((item) => {
      const copy = { ...item };
      delete copy.fiber_g;
      return copy;
    })));
  }
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true, data: { count: inserts.length } };
}

export async function nudgeVitalCalories(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const owned = await ownedMember(auth.supabase, auth.user.id, payload.member_id);
  if (owned.error) return fail(owned.error);
  const calories = Math.round(num(payload.calories) || 0);
  if (calories < 800 || calories > 6000) return fail('That calorie target looks off.');
  const { data: plan } = await auth.supabase.from('vital_plans').select('*').eq('member_id', owned.member.id).maybeSingle();
  if (!plan) return fail('Set a plan first.');
  const age = ageFromBirthYear(owned.member.birth_year);
  const macros = macroTargets({
    calories,
    weightKg: plan.current_weight_kg || 80,
    age,
    intent: payload.mode === 'hold' ? 'maintain' : plan.intent,
    method: plan.method,
  });
  const update = {
    calorie_target: calories,
    calorie_override: calories,
    protein_target_g: macros.protein,
    carbs_target_g: macros.carbs,
    fat_target_g: macros.fat,
    updated_at: new Date().toISOString(),
  };
  if (payload.mode === 'hold') update.intent = 'maintain';
  const { error } = await auth.supabase.from('vital_plans').update(update).eq('member_id', owned.member.id).eq('owner_id', auth.user.id);
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true };
}

export async function logVitalWeight(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);

  const owned = await ownedMember(auth.supabase, auth.user.id, payload.member_id);
  if (owned.error) return fail(owned.error);
  const member = owned.member;

  const units = member.units === 'metric' ? 'metric' : 'us';
  const weightKg = units === 'metric' ? num(payload.weight) : lbToKg(num(payload.weight));
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();

  if (!weightKg || weightKg < 10 || weightKg > 400) return fail('Weight looks off — double-check it.');

  const rounded = Math.round(weightKg * 10) / 10;
  const { data, error } = await auth.supabase.from('vital_weights').upsert({
    member_id: member.id,
    owner_id: auth.user.id,
    logged_on: loggedOn,
    weight_kg: rounded,
  }, { onConflict: 'member_id,logged_on' }).select().single();
  if (error) return fail(error.message);

  const { data: plan } = await auth.supabase.from('vital_plans').select('*').eq('member_id', member.id).maybeSingle();
  if (plan && member.sex && member.birth_year && member.height_cm) {
    const locked = plan.method === 'custom' || plan.calorie_override != null || plan.protein_override != null;
    if (locked) {
      await auth.supabase.from('vital_plans').update({
        current_weight_kg: rounded,
        updated_at: new Date().toISOString(),
      }).eq('member_id', member.id).eq('owner_id', auth.user.id);
    } else {
      const age = ageFromBirthYear(member.birth_year);
      const tdee = tdeeKcal(member, rounded);
      const calories = calorieTarget({
        tdee,
        weeklyChangeKg: plan.weekly_change_kg,
        sex: member.sex,
        age,
        intent: plan.intent,
      });
      const macros = macroTargets({ calories, weightKg: rounded, age, intent: plan.intent, method: plan.method });
      await auth.supabase.from('vital_plans').update({
        current_weight_kg: rounded,
        calorie_target: calories,
        protein_target_g: macros.protein,
        carbs_target_g: macros.carbs,
        fat_target_g: macros.fat,
        updated_at: new Date().toISOString(),
      }).eq('member_id', member.id).eq('owner_id', auth.user.id);
    }
  } else if (plan) {
    await auth.supabase.from('vital_plans').update({
      current_weight_kg: rounded,
      updated_at: new Date().toISOString(),
    }).eq('member_id', member.id);
  }

  revalidatePath('/vital');
  return { success: true, data };
}

export async function completeVitalOnboarding(payload) {
  const created = await saveVitalMember({
    id: payload.member_id,
    display_name: payload.display_name,
    kind: payload.kind,
    units: payload.units,
    sex: payload.sex,
    age: payload.age,
  });
  if (!created.success) return created;

  const plan = await saveVitalPlan({
    member_id: created.data.id,
    units: payload.units,
    sex: payload.sex,
    age: payload.age,
    height: payload.height,
    current_weight: payload.current_weight,
    target_weight: payload.target_weight,
    activity_level: payload.activity_level,
    intent: payload.intent,
    method: payload.method,
    weekly_change: payload.weekly_change,
    step_goal: payload.step_goal,
  });
  if (!plan.success) return plan;

  if (!payload.current_weight) return fail('Add a weight so we can start the log.');
  const weigh = await logVitalWeight({
    member_id: created.data.id,
    weight: payload.current_weight,
  });
  if (!weigh.success) return weigh;

  revalidatePath('/apps');
  revalidatePath('/vital');
  return { success: true, data: { member: created.data, plan: plan.data } };
}

export async function saveVitalKitchenItem(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const name = String(payload.name || '').trim();
  const calories = num(payload.calories);
  if (name.length < 1 || name.length > 120) return fail('Give this food a name.');
  if (calories == null || calories < 0 || calories > 5000) return fail('Add calories so we can save it.');
  const kitchenError = await rememberKitchen(auth.supabase, auth.user.id, {
    name,
    calories: Math.round(calories),
    protein_g: Math.round((num(payload.protein_g) ?? 0) * 10) / 10,
    carbs_g: Math.round((num(payload.carbs_g) ?? 0) * 10) / 10,
    fat_g: Math.round((num(payload.fat_g) ?? 0) * 10) / 10,
    fiber_g: Math.round((num(payload.fiber_g) ?? 0) * 10) / 10,
    barcode: payload.barcode || null,
  });
  if (kitchenError) {
    if (/does not exist|schema cache/i.test(kitchenError.message || '')) {
      return fail('Run vital_schema.sql so your kitchen can save custom foods.');
    }
    return fail(kitchenError.message);
  }
  revalidatePath('/vital');
  revalidatePath('/table');
  return { success: true };
}

export async function deleteVitalKitchenItem(id) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof id !== 'string') return fail('Invalid item.');
  const { error } = await auth.supabase.from('vital_kitchen').delete().eq('id', id).eq('owner_id', auth.user.id);
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true };
}

async function lookupCatalogBarcode(supabase, code) {
  const codes = barcodeVariants(code);
  if (!codes.length) return null;
  const { data, error } = await supabase
    .from('vital_products')
    .select('barcode, name, brand, store, calories, protein_g, carbs_g, fat_g, fiber_g, serving')
    .in('barcode', codes)
    .limit(1);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message || '')) return null;
    return null;
  }
  return foodFromProduct(data?.[0]);
}

async function searchCatalogFoods(supabase, query) {
  const q = ilikeSafe(query);
  if (q.length < 2) return [];
  const digits = q.replace(/\D/g, '');
  let request = supabase
    .from('vital_products')
    .select('barcode, name, brand, store, calories, protein_g, carbs_g, fat_g, fiber_g, serving')
    .limit(8);
  if (/^\d{8,14}$/.test(digits)) {
    request = request.in('barcode', barcodeVariants(digits));
  } else {
    request = request.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
  }
  const { data, error } = await request;
  if (error) return [];
  return (data || []).map(foodFromProduct).filter(Boolean);
}

export async function lookupBarcodeFood(barcode) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const code = String(barcode || '').replace(/\s/g, '');
  if (!/^\d{8,14}$/.test(code)) return fail('That barcode does not look right.');

  const codes = barcodeVariants(code);
  const { data: savedRows } = await auth.supabase
    .from('vital_kitchen')
    .select('*')
    .eq('owner_id', auth.user.id)
    .in('barcode', codes)
    .limit(1);
  const saved = savedRows?.[0];
  if (saved) {
    return {
      success: true,
      data: {
        name: saved.name,
        calories: Number(saved.calories),
        protein_g: Number(saved.protein_g),
        carbs_g: Number(saved.carbs_g),
        fat_g: Number(saved.fat_g),
        fiber_g: Number(saved.fiber_g || 0),
        barcode: saved.barcode || code,
        source: 'kitchen',
      },
    };
  }

  const catalog = await lookupCatalogBarcode(auth.supabase, code);
  if (catalog) return { success: true, data: catalog };

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: { 'User-Agent': 'KaelumaVital/1.0 (family health tracker)' },
    });
    if (!response.ok) return fail('Could not reach the food database. Try again.');
    const json = await response.json();
    if (json.status !== 1 || !json.product) return fail('No product for that barcode. Save it to your kitchen instead.');
    const data = foodFromOff(json.product);
    if (!data) return fail('That product has no calorie data. Add it to your kitchen by hand.');
    return {
      success: true,
      data: { ...data, barcode: code, source: 'scan' },
    };
  } catch {
    return fail('Could not look up that barcode.');
  }
}

export async function searchVitalFoods(query) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const q = String(query || '').trim();
  if (q.length < 2) return { success: true, data: [] };

  const catalog = await searchCatalogFoods(auth.supabase, q);
  const seen = new Set(catalog.map((item) => item.name.toLowerCase()));
  const data = [...catalog];
  if (data.length >= 8 || q.length < 3) return { success: true, data: data.slice(0, 8) };

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=8`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KaelumaVital/1.0 (family health tracker)' },
    });
    if (!response.ok) return { success: true, data };
    const json = await response.json();
    for (const product of json.products || []) {
      const item = foodFromOff(product);
      if (!item) continue;
      const key = item.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      data.push(item);
      if (data.length >= 8) break;
    }
    return { success: true, data };
  } catch {
    return { success: true, data };
  }
}

export async function updateVitalKitchenItem(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof payload.id !== 'string') return fail('Invalid item.');
  const name = String(payload.name || '').trim();
  const calories = num(payload.calories);
  if (name.length < 1 || name.length > 120) return fail('Give this food a name.');
  if (calories == null || calories < 0 || calories > 5000) return fail('Add calories so we can save it.');
  const { error } = await auth.supabase.from('vital_kitchen').update({
    name,
    calories: Math.round(calories),
    protein_g: Math.round((num(payload.protein_g) ?? 0) * 10) / 10,
    carbs_g: Math.round((num(payload.carbs_g) ?? 0) * 10) / 10,
    fat_g: Math.round((num(payload.fat_g) ?? 0) * 10) / 10,
    fiber_g: Math.round((num(payload.fiber_g) ?? 0) * 10) / 10,
    barcode: payload.barcode || null,
    updated_at: new Date().toISOString(),
  }).eq('id', payload.id).eq('owner_id', auth.user.id);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message || '')) {
      return fail('Run vital_schema.sql so your kitchen can save custom foods.');
    }
    return fail(error.message);
  }
  revalidatePath('/vital');
  return { success: true };
}

export async function pinVitalKitchen(ids) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const list = (Array.isArray(ids) ? ids : [])
    .map((key) => String(key || '').trim())
    .filter(Boolean)
    .slice(0, 12);
  const { error: clearError } = await auth.supabase
    .from('vital_kitchen')
    .update({ pin_rank: null })
    .eq('owner_id', auth.user.id);
  if (clearError && /pin_rank|schema cache|does not exist/i.test(clearError.message || '')) {
    return { success: true, localOnly: true };
  }
  if (clearError) return fail(clearError.message);
  await Promise.all(list.map((key, index) => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
    let query = auth.supabase
      .from('vital_kitchen')
      .update({ pin_rank: index + 1 })
      .eq('owner_id', auth.user.id);
    query = uuid ? query.eq('id', key) : query.ilike('name', key);
    return query;
  }));
  revalidatePath('/vital');
  return { success: true };
}

async function rememberMove(supabase, ownerId, item) {
  const label = String(item.label || '').trim();
  if (!label) return;
  const { data: existing } = await supabase
    .from('vital_moves')
    .select('id, times_logged')
    .eq('owner_id', ownerId)
    .ilike('label', label)
    .maybeSingle();
  const kind = MOVE_KINDS.some((row) => row.id === item.kind) ? item.kind : 'other';
  const row = {
    owner_id: ownerId,
    label,
    kind: LEGACY_MOVE_KINDS.includes(kind) ? kind : 'other',
    minutes: item.minutes,
    effort: item.effort,
    updated_at: new Date().toISOString(),
  };
  if (existing?.id) {
    await supabase.from('vital_moves').update({
      ...row,
      times_logged: (existing.times_logged || 1) + 1,
    }).eq('id', existing.id);
    return;
  }
  const { error } = await supabase.from('vital_moves').insert({ ...row, times_logged: 1, kind });
  if (error && /kind|check/i.test(error.message || '')) {
    await supabase.from('vital_moves').insert({ ...row, times_logged: 1 });
  }
}

async function memberWeightKg(supabase, member) {
  if (member.kind === 'child') return 35;
  const { data: planRow } = await supabase
    .from('vital_plans')
    .select('current_weight_kg')
    .eq('member_id', member.id)
    .maybeSingle();
  return Number(planRow?.current_weight_kg) || 80;
}

async function insertActivity(supabase, row) {
  let { data, error } = await supabase.from('vital_activity').insert(row).select().single();
  if (error && /steps|note|schema cache|does not exist/i.test(error.message || '')) {
    const slim = { ...row };
    delete slim.steps;
    delete slim.note;
    ({ data, error } = await supabase.from('vital_activity').insert(slim).select().single());
  }
  if (error && /kind|check/i.test(error.message || '')) {
    const fallbackKind = row.kind === 'steps' ? 'walk' : 'other';
    const fallback = { ...row, kind: fallbackKind };
    ({ data, error } = await supabase.from('vital_activity').insert(fallback).select().single());
    if (error && /steps|note/i.test(error.message || '')) {
      delete fallback.steps;
      delete fallback.note;
      ({ data, error } = await supabase.from('vital_activity').insert(fallback).select().single());
    }
  }
  return { data, error };
}

export async function logVitalActivity(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const owned = await ownedMember(auth.supabase, auth.user.id, payload.member_id);
  if (owned.error) return fail(owned.error);

  const known = MOVE_KINDS.some((item) => item.id === payload.kind) ? payload.kind : null;
  const effort = ['easy', 'moderate', 'hard'].includes(payload.effort) ? payload.effort : 'moderate';
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();
  const note = String(payload.note || payload.label || '').trim().slice(0, 80) || null;
  let kind = known;
  let steps = num(payload.steps);
  let minutes = num(payload.minutes);

  if (kind === 'steps' || (steps && !kind)) {
    kind = 'steps';
    steps = Math.round(steps || 0);
    if (steps < 100 || steps > 100000) return fail('Steps should be between 100 and 100,000.');
    minutes = minutesFromSteps(steps);
  }
  if (!kind) return fail('Pick a kind of movement.');
  if (!minutes || minutes < 1 || minutes > 480) return fail('Minutes should be between 1 and 480.');

  const weightKg = await memberWeightKg(auth.supabase, owned.member);
  const kcal = activityKcal({ kind: kind === 'steps' ? 'walk' : kind, minutes, effort, weightKg });
  const row = {
    member_id: owned.member.id,
    owner_id: auth.user.id,
    logged_on: loggedOn,
    kind,
    minutes: Math.round(minutes),
    effort,
    kcal_est: kcal,
    note,
    steps: kind === 'steps' ? steps : null,
  };

  if (kind === 'steps') {
    const { data: existing } = await auth.supabase
      .from('vital_activity')
      .select('id')
      .eq('member_id', owned.member.id)
      .eq('logged_on', loggedOn)
      .or('kind.eq.steps,steps.gte.100')
      .maybeSingle();
    if (existing?.id) {
      const { error } = await auth.supabase.from('vital_activity').update({
        minutes: row.minutes,
        effort,
        kcal_est: kcal,
        steps,
        note: note || 'Steps',
      }).eq('id', existing.id).eq('owner_id', auth.user.id);
      if (error) return fail(error.message);
      revalidatePath('/vital');
      return { success: true };
    }
  }

  const { data, error } = await insertActivity(auth.supabase, row);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message || '')) {
      return fail('Run the latest vital_schema.sql so movement can be saved.');
    }
    return fail(error.message);
  }

  if (kind !== 'steps') {
    const label = note
      || `${kind[0].toUpperCase()}${kind.slice(1)} ${Math.round(minutes)}`;
    await rememberMove(auth.supabase, auth.user.id, { label, kind, minutes: Math.round(minutes), effort });
  }

  revalidatePath('/vital');
  return { success: true, data };
}

export async function deleteVitalActivity(id) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof id !== 'string') return fail('Invalid entry.');
  const { error } = await auth.supabase.from('vital_activity').delete().eq('id', id).eq('owner_id', auth.user.id);
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true };
}

export async function saveVitalMove(payload) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const label = String(payload.label || '').trim();
  const kind = MOVE_KINDS.some((item) => item.id === payload.kind) ? payload.kind : null;
  const minutes = num(payload.minutes);
  const effort = ['easy', 'moderate', 'hard'].includes(payload.effort) ? payload.effort : 'moderate';
  if (label.length < 1 || label.length > 80) return fail('Give this move a name.');
  if (!kind) return fail('Pick a kind of movement.');
  if (!minutes || minutes < 1 || minutes > 480) return fail('Minutes should be between 1 and 480.');
  await rememberMove(auth.supabase, auth.user.id, { label, kind, minutes: Math.round(minutes), effort });
  revalidatePath('/vital');
  return { success: true };
}

export async function deleteVitalMove(id) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  if (typeof id !== 'string') return fail('Invalid item.');
  const { error } = await auth.supabase.from('vital_moves').delete().eq('id', id).eq('owner_id', auth.user.id);
  if (error) return fail(error.message);
  revalidatePath('/vital');
  return { success: true };
}

