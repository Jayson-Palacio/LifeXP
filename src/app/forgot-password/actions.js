'use server'

import { headers } from 'next/headers'
import { createClient } from '../../utils/supabase/server'

/**
 * Triggers a password reset request via Supabase Auth.
 * Automatically constructs the callback redirect URL dynamically using request headers.
 * 
 * @param {string} email - The email to send the reset instructions to
 * @returns {Promise<{success: boolean, error?: string}>} The status of the request
 */
export async function requestPasswordReset(email) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  try {
    const supabase = await createClient()
    
    // Get protocol and host to dynamically construct site origin
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    const origin = `${protocol}://${host}`

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${origin}/auth/callback?next=/update-password`
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
