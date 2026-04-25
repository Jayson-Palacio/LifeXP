import { createClient } from '../../../utils/supabase/server';
import Link from 'next/link';

export default async function InvitePage({ params }) {
  const { token } = await params;
  const supabase = await createClient();

  // Look up the invite token directly
  const { data: invite, error } = await supabase
    .from('family_invites')
    .select('family_owner_id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error || !invite) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0814', color: 'white', padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Invalid Invite ❌</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>This invite link is invalid or has already been used.</p>
        <Link href="/" className="btn btn-primary">Go to Home</Link>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0814', color: 'white', padding: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Invite Expired ⏰</h1>
        <p style={{ color: '#94a3b8', marginBottom: 32 }}>This invite link has expired. Please ask for a new one.</p>
        <Link href="/" className="btn btn-primary">Go to Home</Link>
      </div>
    );
  }

  // Fetch family name
  const { data: settings } = await supabase
    .from('app_settings')
    .select('family_name')
    .eq('user_id', invite.family_owner_id)
    .single();

  const familyName = settings?.family_name || 'a Family';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0814', color: 'white', padding: 20, textAlign: 'center' }}>
      <script dangerouslySetInnerHTML={{ __html: `document.cookie = "lifexp_invite_token=${token}; path=/; max-age=86400";` }} />
      <div className="kaeluma-bg" style={{ opacity: 0.2, position: 'absolute', inset: 0, zIndex: 0 }} />
      
      <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.03)', padding: 40, borderRadius: 24, border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(20px)', maxWidth: 400, width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>💌</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 12 }}>You've been invited!</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: 32, lineHeight: 1.5 }}>
          You have been invited to help manage <strong>{familyName}</strong> on LifeXP.
        </p>
        
        <Link href="/login" className="btn btn-primary" style={{ display: 'block', width: '100%', padding: 16, fontSize: '1.2rem' }}>
          Accept &amp; Sign In
        </Link>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 16 }}>
          You can sign in with Google or create a new account with your email.
        </p>
      </div>
    </div>
  );
}

