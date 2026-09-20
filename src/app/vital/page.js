import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import VitalDashboardClient from '../../components/VitalDashboardClient';
import { localYmd } from '../../lib/time';
import { weekStartOn } from '../../lib/table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vital — Kaeluma',
  description: 'Household health: meals, weight, movement, and a calm plan for everyone under your roof.',
};

function query(builder) {
  return Promise.race([
    builder,
    new Promise((resolve) => {
      setTimeout(() => resolve({ data: null, error: { message: 'Timed out talking to the database.' } }), 8000);
    }),
  ]);
}

export default async function VitalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const since = new Date();
  since.setDate(since.getDate() - 60);
  const sinceDay = since.toISOString().slice(0, 10);
  const weekStart = weekStartOn(localYmd());

  const [membersRes, plansRes, foodsRes, weightsRes, childrenRes, kitchenRes, activityRes, movesRes, tableRes] = await Promise.all([
    query(supabase.from('vital_members').select('*').order('created_at', { ascending: true })),
    query(supabase.from('vital_plans').select('*')),
    query(supabase.from('vital_foods').select('*').gte('logged_on', sinceDay).order('created_at', { ascending: false })),
    query(supabase.from('vital_weights').select('*').gte('logged_on', sinceDay).order('logged_on', { ascending: true })),
    query(supabase.from('children').select('id, name').order('name')),
    query(supabase.from('vital_kitchen').select('*').order('times_logged', { ascending: false })),
    query(supabase.from('vital_activity').select('*').gte('logged_on', sinceDay).order('created_at', { ascending: false })),
    query(supabase.from('vital_moves').select('*').order('times_logged', { ascending: false })),
    query(supabase.from('table_plans').select('week_start, meals').eq('week_start', weekStart).maybeSingle()),
  ]);

  const isMissing = (res) => res.error && /does not exist|schema cache|timed out/i.test(res.error.message || '');
  const tableMissing = [membersRes, plansRes, foodsRes, weightsRes].some(isMissing);
  const kitchenMissing = isMissing(kitchenRes);
  const activityMissing = isMissing(activityRes) || isMissing(movesRes);

  const members = membersRes.data || [];
  const known = new Set(members.map((row) => row.display_name.trim().toLowerCase()));
  const suggestedKids = (childrenRes.data || []).filter(
    (child) => child.name && !known.has(child.name.trim().toLowerCase())
  );

  return (
    <VitalDashboardClient
      members={members}
      plans={plansRes.data || []}
      foods={foodsRes.data || []}
      weighIns={weightsRes.data || []}
      kitchen={kitchenRes.error ? [] : (kitchenRes.data || [])}
      activities={activityRes.error ? [] : (activityRes.data || [])}
      moves={movesRes.error ? [] : (movesRes.data || [])}
      tableWeek={tableRes.error ? null : (tableRes.data || null)}
      suggestedKids={suggestedKids}
      tableMissing={tableMissing}
      kitchenMissing={kitchenMissing && !tableMissing}
      activityMissing={activityMissing && !tableMissing}
      firstName={user.user_metadata?.first_name || ''}
    />
  );
}
