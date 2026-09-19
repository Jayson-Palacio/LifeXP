import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import VitalDashboardClient from '../../components/VitalDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Vital — Kaeluma',
};

export default async function VitalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const since = new Date();
  since.setDate(since.getDate() - 60);
  const sinceDay = since.toISOString().slice(0, 10);

  const [profileRes, goalsRes, foodsRes, weightsRes] = await Promise.all([
    supabase.from('vital_profiles').select('*').maybeSingle(),
    supabase.from('vital_goals').select('*').maybeSingle(),
    supabase.from('vital_food_logs').select('*').gte('logged_on', sinceDay).order('created_at', { ascending: false }),
    supabase.from('vital_weigh_ins').select('*').gte('logged_on', sinceDay).order('logged_on', { ascending: true }),
  ]);

  const tableMissing = [profileRes, goalsRes, foodsRes, weightsRes].some(
    (res) => res.error && /does not exist|schema cache/i.test(res.error.message || '')
  );

  return (
    <VitalDashboardClient
      profile={profileRes.data}
      goals={goalsRes.data}
      foods={foodsRes.data || []}
      weighIns={weightsRes.data || []}
      tableMissing={tableMissing}
    />
  );
}
