"use server"

import { createClient } from '../../utils/supabase/server';

export async function verifyParentPin(pin) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .single();
    
  if (error || !data) return false;
  return data.parent_pin === pin;
}

export async function changeParentPin(currentPin, newPin) {
  const supabase = createClient();
  const { data } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .single();

  if (!data || data.parent_pin !== currentPin) {
    return { success: false, error: 'Current PIN is incorrect.' };
  }

  const { error } = await supabase
    .from('app_settings')
    .update({ parent_pin: newPin })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateAppSettings(settings) {
  const supabase = createClient();
  const { error } = await supabase
    .from('app_settings')
    .update(settings)
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) return { success: false, error: error.message };
  return { success: true };
}
