import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import VitalDashboardClient from '../../components/VitalDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vital — Kaeluma',
  description: 'Household health: meals, weight, and a calm plan for everyone under your roof.',
};

export default async function VitalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const since = new Date();
  since.setDate(since.getDate() - 60);
  const sinceDay = since.toISOString().slice(0, 10);

  const [membersRes, plansRes, foodsRes, weightsRes, childrenRes, kitchenRes] = await Promise.all([
    supabase.from('vital_members').select('*').order('created_at', { ascending: true }),
    supabase.from('vital_plans').select('*'),
    supabase.from('vital_foods').select('*').gte('logged_on', sinceDay).order('created_at', { ascending: false }),
    supabase.from('vital_weights').select('*').gte('logged_on', sinceDay).order('logged_on', { ascending: true }),
    supabase.from('children').select('id, name').order('name'),
    supabase.from('vital_kitchen').select('*').order('times_logged', { ascending: false }),
  ]);

  const isMissing = (res) => res.error && /does not exist|schema cache/i.test(res.error.message || '');
  const tableMissing = [membersRes, plansRes, foodsRes, weightsRes].some(isMissing);
  const kitchenMissing = isMissing(kitchenRes);

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
      suggestedKids={suggestedKids}
      tableMissing={tableMissing}
      kitchenMissing={kitchenMissing && !tableMissing}
    />
  );
}
