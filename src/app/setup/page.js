import { redirect } from 'next/navigation';
import SetupClient from '../../components/SetupClient';
import { createClient } from '../../utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('app_settings').select('user_id, setup_complete').maybeSingle();
  const setupComplete = data?.setup_complete;

  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session && data ? (session.user.id === data.user_id) : false;

  const { data: children } = await supabase.from('children').select('id').limit(1);

  if (setupComplete && (!isOwner || (children && children.length > 0))) {
    redirect('/dashboard');
  }

  return <SetupClient />;
}
