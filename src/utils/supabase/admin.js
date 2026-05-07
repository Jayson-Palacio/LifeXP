import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service-role key.
 * This bypasses Row Level Security (RLS) and can read ALL data.
 * NEVER import this in a client component or expose to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local to use the admin portal.'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
