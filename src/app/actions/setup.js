"use server"

import { createClient } from '../../utils/supabase/server';

export async function submitSetupData(pin, childName, childAvatar, missionName, missionIcon, familyName = 'Our Family') {
  const supabase = await createClient();
  try {
    // 1. Update App Settings
    const { data: existingSettings } = await supabase.from('app_settings').select('id').maybeSingle();
    
    if (existingSettings) {
      await supabase.from('app_settings')
        .update({ parent_pin: pin, setup_complete: true, family_name: familyName })
        .eq('id', existingSettings.id);
    } else {
      await supabase.from('app_settings').insert([{ 
        parent_pin: pin, 
        setup_complete: true,
        family_name: familyName
      }]);
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
