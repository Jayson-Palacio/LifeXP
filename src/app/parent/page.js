import { supabase } from '../../lib/supabase';
import { redirect } from 'next/navigation';
import ParentDashboardClient from '../../components/ParentDashboardClient';

export default async function ParentDashboardPage() {
  // Fetch everything a parent needs
  const [
    { data: appSettings },
    { data: children },
    { data: missions },
    { data: rewards },
    { data: completions }
  ] = await Promise.all([
    supabase.from('app_settings').select('setup_complete').single(),
    supabase.from('children').select('*').order('name'),
    supabase.from('missions').select('*').order('name'),
    supabase.from('rewards').select('*').order('cost'),
    supabase.from('completions').select('*').eq('status', 'pending').order('submitted_at', { ascending: false })
  ]);

  if (!appSettings?.setup_complete) {
    redirect('/setup');
  }

  // Pass data to client component for tab layout
  return (
    <ParentDashboardClient 
      initialChildren={children || []}
      initialMissions={missions || []}
      initialRewards={rewards || []}
      initialPending={completions || []}
    />
  );
}
