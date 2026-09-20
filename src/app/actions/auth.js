"use server"

import { revalidatePath } from 'next/cache';
import { createClient } from '../../utils/supabase/server';
import { createAdminClient } from '../../utils/supabase/admin';
import { verifyPin, hashPin } from '../../utils/pin';
import { grantParentSession, hasParentSession } from '../../lib/parent-session';
import { normalizeHiddenApps } from '../../lib/apps';

export async function verifyParentPin(pin) {
  if (!/^\d{4}$/.test(pin)) return false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .eq('user_id', user.id)
    .order('setup_complete', { ascending: false })
    .limit(1)
    .single();
    
  if (error || !data || !verifyPin(pin, data.parent_pin)) return false;
  await grantParentSession(user.id);
  return true;
}

export async function changeParentPin(currentPin, newPin) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  if (!/^\d{4}$/.test(newPin)) return { success: false, error: 'PIN must be four digits.' };

  const { data } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .eq('user_id', user.id)
    .order('setup_complete', { ascending: false })
    .limit(1)
    .single();

  if (!data?.parent_pin || !verifyPin(currentPin, data.parent_pin)) {
    return { success: false, error: 'Current PIN is incorrect.' };
  }

  const { error } = await createAdminClient()
    .from('app_settings')
    .update({ parent_pin: hashPin(newPin) })
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  await grantParentSession(user.id);
  return { success: true };
}

export async function updateAppSettings(settings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  if (!await hasParentSession(user.id)) return { success: false, error: 'Parent verification required.' };

  // Whitelist: only these fields may be updated via this action
  const ALLOWED_FIELDS = ['require_approval', 'family_name'];
  const safe = Object.fromEntries(
    Object.entries(settings).filter(([k]) => ALLOWED_FIELDS.includes(k))
  );
  if (Object.keys(safe).length === 0) {
    return { success: false, error: 'No valid fields to update.' };
  }

  const { error } = await supabase
    .from('app_settings')
    .update(safe)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateHouseholdSettings(settings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const safe = {};
  if (typeof settings?.family_name === 'string') {
    const name = settings.family_name.trim();
    if (!name || name.length > 80) return { success: false, error: 'Family name must be 1–80 characters.' };
    safe.family_name = name;
  }
  if (settings?.hidden_apps !== undefined) {
    safe.hidden_apps = normalizeHiddenApps(settings.hidden_apps);
  }
  if (Object.keys(safe).length === 0) {
    return { success: false, error: 'No valid fields to update.' };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('app_settings')
    .update(safe)
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/apps');
  return { success: true };
}

export async function verifyAccountPassword(password) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password
  });

  if (authError) {
    return { success: false, error: 'Incorrect account password.' };
  }

  return { success: true };
}

export async function resetParentPinWithPassword(password, newPin) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  if (!/^\d{4}$/.test(newPin)) return { success: false, error: 'PIN must be four digits.' };

  // Verify password again on the server (defence in depth)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password
  });

  if (authError) {
    return { success: false, error: 'Incorrect account password.' };
  }

  // Update PIN using the hashing utility
  const { error: updateError } = await supabase
    .from('app_settings')
    .update({ parent_pin: hashPin(newPin) })
    .eq('user_id', user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await grantParentSession(user.id);
  return { success: true };
}
