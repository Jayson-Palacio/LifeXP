import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import PlayDashboardClient from '../../components/PlayDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Play — Kaeluma',
  description: 'Build a planet, or hop a chicken across the road.',
};

export default async function PlayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return <PlayDashboardClient />;
}
