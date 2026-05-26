"use server"

import { createClient } from '../../utils/supabase/server';
import { hashPin } from '../../utils/pin';

export async function submitSetupData(pin, childName, childAvatar, childAgeGroup, missionName, missionIcon, rewardName, rewardCost, rewardIcon, familyName = 'Our Family') {
  const supabase = await createClient();
  try {
    const hashedPin = hashPin(pin);
    // 1. Update App Settings
    const { data: existingSettings, error: selectSettingsError } = await supabase.from('app_settings').select('id').maybeSingle();
    if (selectSettingsError) throw new Error('Failed to check settings: ' + selectSettingsError.message);
    
    if (existingSettings) {
      const { error: updateError } = await supabase.from('app_settings')
        .update({ parent_pin: hashedPin, setup_complete: true, family_name: familyName })
        .eq('id', existingSettings.id);
      if (updateError) throw new Error('Failed to update app settings: ' + updateError.message);
    } else {
      const { error: insertError } = await supabase.from('app_settings').insert([{ 
        parent_pin: hashedPin, 
        setup_complete: true,
        family_name: familyName
      }]);
      if (insertError) throw new Error('Failed to create app settings: ' + insertError.message);
    }
    
    // 2. Add Child
    const { error: childError } = await supabase.from('children').insert([{ 
      name: childName, 
      avatar: childAvatar,
      age_group: childAgeGroup,
      xp: 0, 
      total_xp_earned: 0, 
      coins: 0, 
      theme: 'seedling' 
    }]);
    if (childError) throw new Error('Failed to create child profile: ' + childError.message);
    
    // 3. Add Mission
    const { error: missionError } = await supabase.from('missions').insert([{
      name: missionName,
      icon: missionIcon,
      xp_reward: 10,
      coin_reward: 5,
      frequency: 'daily',
      max_completions: 1,
      max_completions_per_period: 1
    }]);
    if (missionError) throw new Error('Failed to create initial mission: ' + missionError.message);

    // 4. Add Reward
    if (rewardName) {
      const { error: rewardError } = await supabase.from('rewards').insert([{
        name: rewardName,
        icon: rewardIcon,
        cost: rewardCost || 10,
        is_active: true
      }]);
      if (rewardError) throw new Error('Failed to create initial reward: ' + rewardError.message);
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
