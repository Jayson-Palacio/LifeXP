import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import AppLauncherClient from '../../components/AppLauncherClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Family apps — Kaeluma',
};

export default async function AppsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: settings } = await supabase
    .from('app_settings')
    .select('setup_complete, family_name')
    .order('setup_complete', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: vitalCount } = await supabase
    .from('vital_members')
    .select('id', { count: 'exact', head: true });

  return (
    <AppLauncherClient
      familyName={settings?.family_name || 'your family'}
      questsReady={Boolean(settings?.setup_complete)}
      vitalReady={Boolean(vitalCount)}
    />
  );
}
