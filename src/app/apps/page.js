import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import AppLauncherClient from '../../components/AppLauncherClient';
import { normalizeHiddenApps } from '../../lib/apps';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Family apps — Kaeluma',
};

export default async function AppsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let settings = null;
  const withHidden = await supabase
    .from('app_settings')
    .select('setup_complete, family_name, hidden_apps')
    .order('setup_complete', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (withHidden.error) {
    const fallback = await supabase
      .from('app_settings')
      .select('setup_complete, family_name')
      .order('setup_complete', { ascending: false })
      .limit(1)
      .maybeSingle();
    settings = fallback.data;
  } else {
    settings = withHidden.data;
  }

  const { count: vitalCount } = await supabase
    .from('vital_members')
    .select('id', { count: 'exact', head: true });

  const { count: ledgerCount } = await supabase
    .from('ledger_settings')
    .select('id', { count: 'exact', head: true });

  return (
    <AppLauncherClient
      familyName={settings?.family_name || 'your family'}
      hiddenApps={normalizeHiddenApps(settings?.hidden_apps)}
      questsReady={Boolean(settings?.setup_complete)}
      vitalReady={Boolean(vitalCount)}
      ledgerReady={Boolean(ledgerCount)}
    />
  );
}
