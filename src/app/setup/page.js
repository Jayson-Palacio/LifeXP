import { redirect } from 'next/navigation';
import SetupClient from '../../components/SetupClient';
import { createClient } from '../../utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('app_settings').select('setup_complete').maybeSingle();
  const setupComplete = data?.setup_complete;

  if (setupComplete) {
    redirect('/dashboard');
  }

  return <SetupClient />;
}
