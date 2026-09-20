import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import RoleSelectClient from '../../components/RoleSelectClient';
import { daysAgoIso } from '../../lib/time';

export const dynamic = 'force-dynamic';

export default async function RoleSelectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch settings — with family sharing RLS, the user sees both their own
  // and any family owner's rows. Prioritise setup_complete = true.
  const { data: settingsArray } = await supabase
    .from('app_settings')
    .select('setup_complete')
    .order('setup_complete', { ascending: false })
    .limit(1);

  const settings = settingsArray?.[0];
  
  if (!settings?.setup_complete) {
    redirect('/setup');
  }

  const since = daysAgoIso(40);
  const [{ data: children }, { data: missions }, { data: completions }] = await Promise.all([
    supabase.from('children').select('*').order('name'),
    supabase.from('missions').select('*').eq('is_active', true),
    supabase.from('completions').select('id, child_id, mission_id, status, submitted_at').gte('submitted_at', since),
  ]);

  return <RoleSelectClient childrenData={children || []} missions={missions || []} completions={completions || []} />;
}
