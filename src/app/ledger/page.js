import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import LedgerDashboardClient from '../../components/LedgerDashboardClient';
import { localYmd } from '../../lib/time';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ledger — Kaeluma',
  description: 'Household money: monthly spending and the yearly savings you are on pace for.',
};

function query(builder) {
  return Promise.race([
    builder,
    new Promise((resolve) => {
      setTimeout(() => resolve({ data: null, error: { message: 'Timed out talking to the database.' } }), 8000);
    }),
  ]);
}

export default async function LedgerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const sinceDay = since.toISOString().slice(0, 10);

  const [settingsRes, entriesRes] = await Promise.all([
    query(supabase.from('ledger_settings').select('*').maybeSingle()),
    query(
      supabase
        .from('ledger_entries')
        .select('*')
        .gte('logged_on', sinceDay)
        .order('logged_on', { ascending: false })
        .order('created_at', { ascending: false })
    ),
  ]);

  const isMissing = (res) => res.error && /does not exist|schema cache|timed out/i.test(res.error.message || '');
  const tableMissing = [settingsRes, entriesRes].some(isMissing);

  return (
    <LedgerDashboardClient
      settings={settingsRes.error ? null : (settingsRes.data || null)}
      entries={entriesRes.error ? [] : (entriesRes.data || [])}
      tableMissing={tableMissing}
      firstName={user.user_metadata?.first_name || ''}
      initialToday={localYmd()}
    />
  );
}
