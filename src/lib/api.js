import { supabase } from './supabase';

export async function isSetupComplete() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('setup_complete')
    .single();
    
  if (error || !data) return false;
  return data.setup_complete;
}

export async function completeSetup(pin) {
  // Try to update existing, or insert
  const { error } = await supabase
    .from('app_settings')
    .update({ parent_pin: pin, setup_complete: true })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // hacky way to force update all

  if (error) {
    // maybe need to insert if not exists
    await supabase.from('app_settings').insert([{ parent_pin: pin, setup_complete: true }]);
  }
}

export async function verifyPin(pin) {
  const { data, error } = await supabase
    .from('app_settings')
    .select('parent_pin')
    .single();
    
  if (error || !data) return false;
  return data.parent_pin === pin;
}

// CHILDREN
export async function getChildren() {
  const { data, error } = await supabase.from('children').select('*').order('name');
  if (error) return [];
  return data;
}

export async function addChild(name, avatar) {
  const { data, error } = await supabase
    .from('children')
    .insert([{ name, avatar }])
    .select()
    .single();
  return data;
}

// Add the other functions (missions, completions, etc.) later as we navigate to parent dashboard
