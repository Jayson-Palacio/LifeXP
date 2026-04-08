"use server"

import { supabase } from '../../lib/supabase';

export async function verifyParentPin(pin) {
  const { data, error } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .single();
    
  if (error || !data) return false;
  return data.parent_pin === pin;
}
