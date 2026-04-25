import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = uuidv4();
  // Expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error, data } = await supabase.from('family_invites').insert([
    {
      token,
      family_owner_id: session.user.id,
      expires_at: expiresAt.toISOString(),
    }
  ]).select().single();

  if (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
  }

  return NextResponse.json({ token: data.token });
}
