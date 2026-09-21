'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../../lib/authz';
import { extrasFromGrocery, groceryFromMeals, mergeMeals, weekStartOn } from '../../lib/table';

function fail(error) {
  return { success: false, error };
}

function tableUser() {
  return requireUser();
}

function cleanPlate(plate) {
  if (!plate || typeof plate !== 'object') return null;
  const title = String(plate.title || '').trim().slice(0, 120);
  if (!title) return null;
  const ingredients = Array.isArray(plate.ingredients)
    ? plate.ingredients.map((part) => String(part || '').trim()).filter(Boolean).slice(0, 16)
    : [];
  return {
    id: plate.id ? String(plate.id).slice(0, 80) : null,
    title,
    ingredients,
    recipeUrl: plate.recipeUrl ? String(plate.recipeUrl).slice(0, 300) : null,
    recipeSource: plate.recipeSource ? String(plate.recipeSource).slice(0, 80) : null,
    notes: plate.notes ? String(plate.notes).trim().slice(0, 400) : null,
    labels: Array.isArray(plate.labels)
      ? plate.labels.map((part) => String(part || '').trim()).filter(Boolean).slice(0, 6)
      : [],
    kcal: Math.max(0, Math.min(4000, Math.round(Number(plate.kcal) || 0))),
    protein: Math.max(0, Math.min(400, Math.round(Number(plate.protein) || 0))),
    saved: Boolean(plate.saved),
  };
}

export async function saveTableWeek(payload) {
  const auth = await tableUser();
  if (!auth.user) return fail('Please log in.');

  const weekStart = weekStartOn(String(payload?.week_start || '').slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return fail('Pick a week.');

  const meals = mergeMeals(weekStart, payload?.meals || {});
  for (const ymd of Object.keys(meals)) {
    meals[ymd] = {
      breakfast: cleanPlate(meals[ymd].breakfast),
      lunch: cleanPlate(meals[ymd].lunch),
      dinner: cleanPlate(meals[ymd].dinner),
    };
  }

  const extras = extrasFromGrocery(payload?.grocery);
  const grocery = groceryFromMeals(meals, extras, payload?.grocery || []);

  const { error } = await auth.supabase.from('table_plans').upsert({
    owner_id: auth.user.id,
    week_start: weekStart,
    meals,
    grocery,
    extras,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'owner_id,week_start' });

  if (error) {
    if (/does not exist|schema cache/i.test(error.message || '')) {
      return fail('Run table_schema.sql in the Supabase SQL editor so Table can save.');
    }
    return fail(error.message);
  }

  revalidatePath('/table');
  revalidatePath('/apps');
  return { success: true, meals, grocery, extras };
}
