import { supabase } from '../../../lib/supabase';
import { redirect } from 'next/navigation';
import ChildDashboardClient from '../../../components/ChildDashboardClient';

export default async function ChildDashboardPage({ params }) {
  const { id } = await params;

  // Fetch child
  const { data: child } = await supabase.from('children').select('*').eq('id', id).single();
  
  if (!child) {
    redirect('/');
  }

  // Fetch missions
  const { data: missions } = await supabase.from('missions').select('*').order('name');
  
  // Fetch today's completions for this child by getting all completions and filtering (or just querying)
  const todayStart = new Date();
  todayStart.setUTCHours(0,0,0,0);
  
  const { data: completions } = await supabase
    .from('completions')
    .select('*')
    .eq('child_id', id)
    .gte('submitted_at', todayStart.toISOString());

  return (
    <ChildDashboardClient 
      initialChild={child}
      missions={missions || []}
      initialCompletions={completions || []}
    />
  );
}
