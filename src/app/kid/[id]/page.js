import { createClient } from '../../../utils/supabase/server';
import { redirect } from 'next/navigation';
import ChildDashboardClient from '../../../components/ChildDashboardClient';
import { daysAgoIso } from '../../../lib/time';

export default async function ChildDashboardPage({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch child first — needed to validate before proceeding
  const { data: child } = await supabase.from('children').select('*').eq('id', id).single();

  if (!child) {
    redirect('/');
  }

  const since = daysAgoIso(40);
  const [
    { data: allMissions },
    { data: rewards },
    { data: appSettings },
    { data: completions },
    { data: allRedemptions },
  ] = await Promise.all([
    supabase.from('missions').select('*').order('name'),
    supabase.from('rewards').select('*').order('cost'),
    supabase.from('app_settings').select('require_approval, family_name').order('setup_complete', { ascending: false }).limit(1).single(),
    supabase.from('completions').select('*').eq('child_id', id).gte('submitted_at', since),
    supabase.from('redemptions').select('*').eq('child_id', id).gte('redeemed_at', since),
  ]);

  const missions = (allMissions || []).filter(
    m => !m.assigned_to || m.assigned_to.length === 0 || m.assigned_to.includes(id)
  );
  const requireApproval = appSettings?.require_approval !== false;
  const familyName = appSettings?.family_name || 'Our Family';

  return (
    <ChildDashboardClient
      initialChild={child}
      missions={missions}
      initialCompletions={completions || []}
      rewards={rewards || []}
      initialRedemptions={allRedemptions || []}
      requireApproval={requireApproval}
      familyName={familyName}
    />
  );
}

