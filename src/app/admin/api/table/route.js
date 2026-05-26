import { createAdminClient } from '../../../../utils/supabase/admin'
import { createClient } from '../../../../utils/supabase/server'

const ALLOWED_TABLES = ['children', 'missions', 'completions', 'rewards', 'redemptions', 'app_settings', 'users', 'support_tickets']

// Simple in-memory rate limiter
const ipRequestCounts = new Map();
const LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

function isRateLimited(ip) {
  const now = Date.now();
  const userData = ipRequestCounts.get(ip) || { count: 0, resetTime: now + LIMIT_WINDOW };
  
  if (now > userData.resetTime) {
    userData.count = 1;
    userData.resetTime = now + LIMIT_WINDOW;
    ipRequestCounts.set(ip, userData);
    return false;
  }
  
  userData.count += 1;
  ipRequestCounts.set(ip, userData);
  
  return userData.count > MAX_REQUESTS;
}

// CSRF validation helper
function isCsrfValid(request) {
  // 1. Content-Type check (must be application/json)
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return false;
  }

  // 2. Origin/Referer check
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  let targetOrigin = origin;
  if (!targetOrigin && referer) {
    try {
      const refUrl = new URL(referer);
      targetOrigin = refUrl.origin;
    } catch (e) {
      // Ignore malformed referer
    }
  }
  
  if (targetOrigin) {
    try {
      const url = new URL(targetOrigin);
      if (url.host !== host) {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  
  return true;
}

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return allowed.includes(user.email.toLowerCase())
}

export async function PATCH(request) {
  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(ip)) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  // CSRF validation
  if (!isCsrfValid(request)) {
    return Response.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id, updates } = await request.json()

  if (!ALLOWED_TABLES.includes(table)) {
    return Response.json({ error: 'Table not allowed' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from(table).update(updates).eq('id', id).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function DELETE(request) {
  // Rate limiting check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  if (isRateLimited(ip)) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  // CSRF validation
  if (!isCsrfValid(request)) {
    return Response.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id } = await request.json()

  if (!ALLOWED_TABLES.includes(table)) {
    return Response.json({ error: 'Table not allowed' }, { status: 400 })
  }

  const admin = createAdminClient()
  let error = null

  if (table === 'users') {
    const res = await admin.auth.admin.deleteUser(id)
    error = res.error
  } else {
    const res = await admin.from(table).delete().eq('id', id)
    error = res.error
  }

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
