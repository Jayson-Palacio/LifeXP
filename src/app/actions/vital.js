'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../../lib/authz';
import { lookupFood } from '../../lib/foods';
import {
  MEMBER_ACCENTS,
  ageFromBirthYear,
  birthYearFromAge,
  calorieTarget,
  inferIntent,
  inToCm,
  lbToKg,
  localDateISO,
  macroTargets,
  suggestedWeeklyChangeKg,
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

  const profile = {
    sex,
    birth_year: Math.round(birthYear),
    height_cm: Math.round(heightCm * 10) / 10,
    activity_level: activity,
  };

  let calories = null;
  let macros = { protein: null, carbs: null, fat: null };
  if (currentKg) {
    const tdee = tdeeKcal(profile, currentKg);
    calories = calorieTarget({ tdee, weeklyChangeKg: weekly, sex, age, intent });
    macros = macroTargets({ calories, weightKg: currentKg, age, intent });
  }

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
    start_weight_kg: existing?.start_weight_kg ?? (currentKg != null ? Math.round(currentKg * 10) / 10 : null),
    current_weight_kg: currentKg != null ? Math.round(currentKg * 10) / 10 : null,
    target_weight_kg: targetKg != null ? Math.round(targetKg * 10) / 10 : (intent === 'grow' ? null : currentKg != null ? Math.round(currentKg * 10) / 10 : null),
    weekly_change_kg: Math.round(weekly * 100) / 100,
    calorie_target: calories,
    protein_target_g: macros.protein,
    carbs_target_g: macros.carbs,
    fat_target_g: macros.fat,
    updated_at: new Date().toISOString(),
  };

  const { error: planError } = await supabase.from('vital_plans').upsert(plan, { onConflict: 'member_id' });
  if (planError) return fail(planError.message);

  revalidatePath('/vital');
  return { success: true, data: { calories, macros, intent } };
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

  const catalog = lookupFood(name);
  if (catalog) {
    if (!name) name = catalog.name;
    if (calories == null) calories = catalog.calories;
    if (protein == null) protein = catalog.protein_g;
    if (carbs == null) carbs = catalog.carbs_g;
    if (fat == null) fat = catalog.fat_g;
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
    }
  }

  const meal = ['breakfast', 'lunch', 'dinner', 'snack'].includes(payload.meal)
    ? payload.meal
    : (catalog?.meal || 'snack');
  const loggedOn = /^\d{4}-\d{2}-\d{2}$/.test(payload.logged_on || '') ? payload.logged_on : localDateISO();

  if (name.length < 1 || name.length > 120) return fail('Give this food a name.');
  if (calories == null || calories < 0 || calories > 5000) {
    return fail('Add calories, or pick a food from the kitchen list.');
  }

  const { data, error } = await auth.supabase.from('vital_foods').insert({
    member_id: owned.member.id,
    owner_id: auth.user.id,
    name,
    calories: Math.round(calories),
    protein_g: Math.round((protein ?? 0) * 10) / 10,
    carbs_g: Math.round((carbs ?? 0) * 10) / 10,
    fat_g: Math.round((fat ?? 0) * 10) / 10,
    meal,
    logged_on: loggedOn,
  }).select().single();

  if (error) return fail(error.message);

  await rememberKitchen(auth.supabase, auth.user.id, {
    name,
    calories: Math.round(calories),
    protein_g: Math.round((protein ?? 0) * 10) / 10,
    carbs_g: Math.round((carbs ?? 0) * 10) / 10,
    fat_g: Math.round((fat ?? 0) * 10) / 10,
    barcode: payload.barcode || null,
  });

  revalidatePath('/vital');
  return { success: true, data };
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
    const age = ageFromBirthYear(member.birth_year);
    const tdee = tdeeKcal(member, rounded);
    const calories = calorieTarget({
      tdee,
      weeklyChangeKg: plan.weekly_change_kg,
      sex: member.sex,
      age,
      intent: plan.intent,
    });
    const macros = macroTargets({ calories, weightKg: rounded, age, intent: plan.intent });
    await auth.supabase.from('vital_plans').update({
      current_weight_kg: rounded,
      calorie_target: calories,
      protein_target_g: macros.protein,
      carbs_target_g: macros.carbs,
      fat_target_g: macros.fat,
      updated_at: new Date().toISOString(),
    }).eq('member_id', member.id).eq('owner_id', auth.user.id);
  } else if (plan) {
    await auth.supabase.from('vital_plans').update({
      current_weight_kg: rounded,
      updated_at: new Date().toISOString(),
    }).eq('member_id', member.id);
  }

  revalidatePath('/vital');
  return { success: true, data };
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
    barcode: payload.barcode || null,
  });
  if (kitchenError) {
    if (/does not exist|schema cache/i.test(kitchenError.message || '')) {
      return fail('Run vital_schema.sql so your kitchen can save custom foods.');
    }
    return fail(kitchenError.message);
  }
  revalidatePath('/vital');
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

export async function copyYesterdayMeals(memberId) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const owned = await ownedMember(auth.supabase, auth.user.id, memberId);
  if (owned.error) return fail(owned.error);

  const today = localDateISO();
  const yesterdayDate = new Date(`${today}T12:00:00`);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateISO(yesterdayDate);

  const { data: existing } = await auth.supabase
    .from('vital_foods')
    .select('id')
    .eq('member_id', owned.member.id)
    .eq('logged_on', today)
    .limit(1);
  if (existing?.length) return fail('Today already has meals. Remove them first if you want a full copy.');

  const { data: rows, error } = await auth.supabase
    .from('vital_foods')
    .select('name, calories, protein_g, carbs_g, fat_g, meal')
    .eq('member_id', owned.member.id)
    .eq('logged_on', yesterday);
  if (error) return fail(error.message);
  if (!rows?.length) return fail('Nothing was logged yesterday to copy.');

  const { error: insertError } = await auth.supabase.from('vital_foods').insert(
    rows.map((row) => ({
      ...row,
      member_id: owned.member.id,
      owner_id: auth.user.id,
      logged_on: today,
    }))
  );
  if (insertError) return fail(insertError.message);
  revalidatePath('/vital');
  return { success: true, data: { count: rows.length } };
}

export async function lookupBarcodeFood(barcode) {
  const auth = await vitalUser();
  if (auth.error) return fail(auth.error);
  const code = String(barcode || '').replace(/\s/g, '');
  if (!/^\d{8,14}$/.test(code)) return fail('That barcode does not look right.');

  const { data: saved } = await auth.supabase
    .from('vital_kitchen')
    .select('*')
    .eq('owner_id', auth.user.id)
    .eq('barcode', code)
    .maybeSingle();
  if (saved) {
    return {
      success: true,
      data: {
        name: saved.name,
        calories: Number(saved.calories),
        protein_g: Number(saved.protein_g),
        carbs_g: Number(saved.carbs_g),
        fat_g: Number(saved.fat_g),
        barcode: code,
        source: 'kitchen',
      },
    };
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
      headers: { 'User-Agent': 'KaelumaVital/1.0 (family health tracker)' },
    });
    if (!response.ok) return fail('Could not reach the food database. Try again.');
    const json = await response.json();
    if (json.status !== 1 || !json.product) return fail('No product for that barcode. Save it to your kitchen instead.');
    const product = json.product;
    const n = product.nutriments || {};
    const perServing = n['energy-kcal_serving'];
    const per100 = n['energy-kcal_100g'] ?? n['energy-kcal'];
    const calories = Math.round(Number(perServing ?? per100 ?? 0));
    if (!calories) return fail('That product has no calorie data. Add it to your kitchen by hand.');
    const protein = Number(n.proteins_serving ?? n.proteins_100g ?? 0);
    const carbs = Number(n.carbohydrates_serving ?? n.carbohydrates_100g ?? 0);
    const fat = Number(n.fat_serving ?? n.fat_100g ?? 0);
    const name = String(product.product_name || product.generic_name || 'Scanned item').slice(0, 120);
    return {
      success: true,
      data: {
        name,
        calories,
        protein_g: Math.round(protein * 10) / 10,
        carbs_g: Math.round(carbs * 10) / 10,
        fat_g: Math.round(fat * 10) / 10,
        barcode: code,
        source: 'scan',
        serving: perServing != null ? 'serving' : '100g',
      },
    };
  } catch {
    return fail('Could not look up that barcode.');
  }
}
