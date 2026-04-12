import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import ChildDashboardClient from '../../../components/ChildDashboardClient';

export default async function ChildDashboardPage({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch child
  const { data: child } = await supabase.from('children').select('*').eq('id', id).single();
  
  if (!child) {
    redirect('/');
  }

  // Fetch missions
  const { data: allMissions } = await supabase.from('missions').select('*').order('name');
  const missions = (allMissions || []).filter(m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(id));
  
  // Fetch rewards
  const { data: rewards } = await supabase.from('rewards').select('*').order('cost');

  // Fetch global settings for require_approval
  const { data: appSettings } = await supabase.from('app_settings').select('require_approval').single();
  const requireApproval = appSettings?.require_approval !== false;
  
  // Fetch today's completions for this child by getting all completions and filtering (or just querying)
  const todayStart = new Date();
  todayStart.setUTCHours(0,0,0,0);
  
  const { data: completions } = await supabase
    .from('completions')
    .select('*')
    .eq('child_id', id)
    .gte('submitted_at', todayStart.toISOString());

  // Fetch all redemptions for this child to compute limits
  const { data: allRedemptions } = await supabase
    .from('redemptions')
    .select('*')
    .eq('child_id', id);

  return (
    <ChildDashboardClient 
      initialChild={child}
      missions={missions || []}
      initialCompletions={completions || []}
      rewards={rewards || []}
      initialRedemptions={allRedemptions || []}
      requireApproval={requireApproval}
    />
  );
}
