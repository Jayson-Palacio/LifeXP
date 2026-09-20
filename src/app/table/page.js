import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import TableDashboardClient from '../../components/TableDashboardClient';
import { localYmd } from '../../lib/time';
import { weekStartOn } from '../../lib/table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Table — Kaeluma',
  description: 'Household meals: plan the week, then shop from one grocery list.',
};

function query(builder) {
  return Promise.race([
    builder,
    new Promise((resolve) => {
      setTimeout(() => resolve({ data: null, error: { message: 'Timed out talking to the database.' } }), 8000);
    }),
  ]);
}

export default async function TablePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = localYmd();
  const weekStart = weekStartOn(today);
  const since = new Date();
  since.setDate(since.getDate() - 28);

  const [plansRes, kitchenRes] = await Promise.all([
    query(
      supabase
        .from('table_plans')
        .select('*')
        .gte('week_start', since.toISOString().slice(0, 10))
        .order('week_start', { ascending: false })
    ),
    query(supabase.from('vital_kitchen').select('*').order('times_logged', { ascending: false })),
  ]);

  const isMissing = (res) => res.error && /does not exist|schema cache|timed out/i.test(res.error.message || '');
  const tableMissing = isMissing(plansRes);

  return (
    <TableDashboardClient
      plans={plansRes.error ? [] : (plansRes.data || [])}
      kitchen={kitchenRes.error ? [] : (kitchenRes.data || [])}
      tableMissing={tableMissing}
      initialToday={today}
      initialWeek={weekStart}
    />
  );
}
