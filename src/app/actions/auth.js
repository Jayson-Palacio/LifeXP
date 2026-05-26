"use server"

import { createClient } from '../../utils/supabase/server';
import { verifyPin, hashPin } from '../../utils/pin';

export async function verifyParentPin(pin) {
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
    
  if (error || !data) return false;
  return verifyPin(pin, data.parent_pin);
}

export async function changeParentPin(currentPin, newPin) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .eq('user_id', user.id)
    .order('setup_complete', { ascending: false })
    .limit(1)
    .single();

  if (!data || !verifyPin(currentPin, data.parent_pin)) {
    return { success: false, error: 'Current PIN is incorrect.' };
  }

  const { error } = await supabase
    .from('app_settings')
    .update({ parent_pin: hashPin(newPin) })
    .eq('user_id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateAppSettings(settings) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

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

  return { success: true };
}
