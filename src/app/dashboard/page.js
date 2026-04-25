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

  // Check for pending invite token (set by the /invite/[token] page via client-side cookie)
  const cookieStore = await cookies();
  const inviteToken = cookieStore.get('lifexp_invite_token')?.value;

  if (inviteToken) {
    // Look up the invite directly from the table
    const { data: invite } = await supabase
      .from('family_invites')
      .select('family_owner_id, expires_at')
      .eq('token', inviteToken)
      .maybeSingle();
    
    if (invite && new Date(invite.expires_at) > new Date()) {
      // Link this user as a family member (ignore if already linked)
      await supabase.from('family_members').insert([
        { family_owner_id: invite.family_owner_id, member_user_id: session.user.id }
      ]).then(() => {}).catch(() => {});

      // Ensure this user has an app_settings row with setup_complete = true
      // so they don't get funneled into the new-family setup wizard
      const { data: existing } = await supabase
        .from('app_settings')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('app_settings')
          .update({ setup_complete: true })
          .eq('user_id', session.user.id);
      } else {
        await supabase.from('app_settings').insert([
          { user_id: session.user.id, setup_complete: true, family_name: 'Our Family' }
        ]).then(() => {}).catch(() => {});
      }
    }
  }

  // Fetch settings — with family sharing RLS, the user sees both their own
  // and any family owner's rows. Prioritise setup_complete = true.
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

