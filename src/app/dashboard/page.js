import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import RoleSelectClient from '../../components/RoleSelectClient';

export const dynamic = 'force-dynamic';

export default async function RoleSelectPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Check for pending invite token
  const cookieStore = await cookies();
  const inviteToken = cookieStore.get('lifexp_invite_token')?.value;

  if (inviteToken) {
    // Look up token
    const { data: invite } = await supabase.rpc('get_invite_by_token', { invite_token: inviteToken }).maybeSingle();
    
    if (invite && new Date(invite.expires_at) > new Date()) {
      // Create member link
      await supabase.from('family_members').insert([
        { family_owner_id: invite.family_owner_id, member_user_id: session.user.id }
      ]).select().single().then(() => {}).catch(() => {}); // silent catch for unique constraint
    }
    // Also mark setup complete for the new user so they bypass setup
    await supabase.from('app_settings').update({ setup_complete: true }).eq('user_id', session.user.id);
  }

  // Fetch settings. Because of family sharing, the user might have access to multiple app_settings rows.
  // We prioritize the one where setup_complete is true (the owner's settings).
  const { data: settingsArray } = await supabase
    .from('app_settings')
    .select('setup_complete, parent_pin')
    .order('setup_complete', { ascending: false })
    .limit(1);

  const settings = settingsArray?.[0];
  const setupComplete = settings?.setup_complete;
  
  if (!setupComplete) {
    redirect('/setup');
  }

  const { data: children } = await supabase.from('children').select('*').order('name');
  const { data: missions } = await supabase.from('missions').select('*').eq('is_active', true);
  const { data: completions } = await supabase.from('completions').select('*');

  return (
    <>
      {inviteToken && <script dangerouslySetInnerHTML={{ __html: `document.cookie = "lifexp_invite_token=; path=/; max-age=0";` }} />}
      <RoleSelectClient childrenData={children} missions={missions} completions={completions} parentPin={settings?.parent_pin} />
    </>
  );
}
