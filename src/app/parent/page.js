import { redirect } from 'next/navigation';
import { requireParent } from '../../lib/authz';
import ParentDashboardClient from '../../components/ParentDashboardClient';

export default async function ParentDashboardPage() {
  const { supabase } = await requireParent();
  
  const [
    { data: appSettings },
    { data: children },
    { data: missions },
    { data: rewards },
    { data: completions },
    { data: redemptions }
  ] = await Promise.all([
    supabase.from('app_settings').select('setup_complete, require_approval, family_name').order('setup_complete', { ascending: false }).limit(1).single(),
    supabase.from('children').select('*').order('name'),
    supabase.from('missions').select('*').order('name'),
    supabase.from('rewards').select('*').order('cost'),
    supabase.from('completions').select('*').eq('status', 'pending').order('submitted_at', { ascending: false }).limit(80),
    supabase.from('redemptions').select('*').eq('status', 'pending').order('redeemed_at', { ascending: false }).limit(80)
  ]);

  if (!appSettings?.setup_complete) {
    redirect('/setup');
  }

  const { data: { user } } = await supabase.auth.getUser();
  const parentEmail = user?.email || '';

  return (
    <ParentDashboardClient 
      initialChildren={children || []}
      initialMissions={missions || []}
      initialRewards={rewards || []}
      initialPending={completions || []}
      initialPendingRedemptions={redemptions || []}
      initialSettings={appSettings || {}}
      parentEmail={parentEmail}
    />
  );
}
