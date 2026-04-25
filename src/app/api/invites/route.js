import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';

export async function POST(req) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await req.json();

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Don't allow inviting yourself
  if (normalizedEmail === session.user.email.toLowerCase()) {
    return NextResponse.json({ error: "You can't invite yourself!" }, { status: 400 });
  }

  // Check if this email already has a pending invite from this owner
  const { data: existing } = await supabase
    .from('family_invites')
    .select('id')
    .eq('family_owner_id', session.user.id)
    .eq('invited_email', normalizedEmail)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'This email has already been invited.' }, { status: 400 });
  }

  // Save the invite
  const { error } = await supabase.from('family_invites').insert([
    { family_owner_id: session.user.id, invited_email: normalizedEmail }
  ]);

  if (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, email: normalizedEmail });
}

// GET: list current invites and members
export async function GET(req) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: invites } = await supabase
    .from('family_invites')
    .select('id, invited_email, created_at')
    .eq('family_owner_id', session.user.id)
    .order('created_at', { ascending: false });

  // Fetch members with their profile names
  const { data: members } = await supabase
    .from('family_members')
    .select('id, member_user_id, role, created_at, profiles!member_user_id(first_name, last_name)')
    .eq('family_owner_id', session.user.id);

  // Flatten profile data
  const formattedMembers = (members || []).map(m => ({
    id: m.id,
    member_user_id: m.member_user_id,
    role: m.role,
    created_at: m.created_at,
    first_name: m.profiles?.first_name || '',
    last_name: m.profiles?.last_name || '',
  }));

  return NextResponse.json({ invites: invites || [], members: formattedMembers });
}

// DELETE: remove an invite or a member
export async function DELETE(req) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, type } = await req.json();

  if (type === 'member') {
    await supabase
      .from('family_members')
      .delete()
      .eq('id', id)
      .eq('family_owner_id', session.user.id);
  } else {
    await supabase
      .from('family_invites')
      .delete()
      .eq('id', id)
      .eq('family_owner_id', session.user.id);
  }

  return NextResponse.json({ success: true });
}

