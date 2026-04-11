"use server"

import { supabase } from '../../lib/supabase';

export async function submitSetupData(pin, childName, childAvatar, missionName, missionIcon) {
  try {
    // 1. Update App Settings
    const { error: settingsError } = await supabase
      .from('app_settings')
      .update({ parent_pin: pin, setup_complete: true })
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (settingsError) {
      await supabase.from('app_settings').insert([{ parent_pin: pin, setup_complete: true }]);
    }
    
    // 2. Add Child
    await supabase.from('children').insert([{ 
      name: childName, 
      avatar: childAvatar, 
      xp: 0, 
      total_xp_earned: 0, 
      coins: 0, 
      theme: 'seedling' 
    }]);
    
    // 3. Add Mission
    await supabase.from('missions').insert([{
      name: missionName,
      icon: missionIcon,
      xp_reward: 10,
      coin_reward: 5,
      frequency: 'daily',
      max_completions: 1,
      max_completions_per_period: 1
    }]);

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
