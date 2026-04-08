import { supabase } from '../../../../lib/supabase';
import { redirect } from 'next/navigation';
import RewardShopClient from '../../../../components/RewardShopClient';

export default async function RewardShopPage({ params }) {
  const { id } = await params;

  // Fetch child
  const { data: child } = await supabase.from('children').select('*').eq('id', id).single();
  
  if (!child) {
    redirect('/');
  }

  // Fetch rewards
  const { data: rewards } = await supabase.from('rewards').select('*').order('cost');

  return (
    <RewardShopClient 
      initialChild={child}
      rewards={rewards || []}
    />
  );
}
