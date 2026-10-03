import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import PlayDashboardClient from '../../components/PlayDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Play — Kaeluma',
  description: 'Six short household games. Bests stay on this device.',
};

export default async function PlayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <PlayDashboardClient />;
}
