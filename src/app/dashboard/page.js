import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import RoleSelectClient from '../../components/RoleSelectClient';

export const dynamic = 'force-dynamic';

export default async function RoleSelectPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch settings — with family sharing RLS, the user sees both their own
  // and any family owner's rows. Prioritise setup_complete = true.
  const { data: settingsArray } = await supabase
    .from('app_settings')
    .select('setup_complete, parent_pin')
    .order('setup_complete', { ascending: false })
    .limit(1);

  const settings = settingsArray?.[0];
  
  if (!settings?.setup_complete) {
    redirect('/setup');
  }

  const { data: children } = await supabase.from('children').select('*').order('name');
  const { data: missions } = await supabase.from('missions').select('*').eq('is_active', true);
  const { data: completions } = await supabase.from('completions').select('*');

  return <RoleSelectClient childrenData={children} missions={missions} completions={completions} parentPin={settings?.parent_pin} />;
}

