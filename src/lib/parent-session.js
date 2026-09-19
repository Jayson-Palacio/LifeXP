import 'server-only';

import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'kaeluma_parent_session';
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

function getSecret() {
  // A dedicated secret is preferred. The service-role key is a safe server-only
  // fallback for existing deployments while the dedicated secret is rolled out.
  const secret = process.env.PARENT_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('PARENT_SESSION_SECRET must be configured.');
  return secret;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function grantParentSession(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + SESSION_DURATION_MS })).toString('base64url');
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  });
}

export async function hasParentSession(userId) {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [payload, signature] = value.split('.');
  if (!payload || !signature || !timingSafeEqual(sign(payload), signature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.userId === userId && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export async function clearParentSession() {
  (await cookies()).delete(COOKIE_NAME);
}
