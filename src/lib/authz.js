import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';
import { hasParentSession } from './parent-session';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, supabase };
  return { user, supabase };
}

export async function requireParent() {
  const { user, supabase } = await requireUser();
  if (!user || !await hasParentSession(user.id)) {
    redirect('/dashboard');
  }
  return { user, supabase };
}

export async function isParentVerified() {
  const { user } = await requireUser();
  return Boolean(user && await hasParentSession(user.id));
}
