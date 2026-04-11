import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import RoleSelectClient from '../../components/RoleSelectClient';

export const dynamic = 'force-dynamic';

export default async function RoleSelectPage() {
  const supabase = createClient();
  
  const { data: settings } = await supabase.from('app_settings').select('setup_complete').single();
  const setupComplete = settings?.setup_complete;
  
  if (!setupComplete) {
    redirect('/setup');
  }

  const { data: children } = await supabase.from('children').select('*').order('name');

  return <RoleSelectClient childrenData={children} />;
}
