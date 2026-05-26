'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

/**
 * Updates the user's password using Supabase Auth.
 * Expects the user to have an active recovery session.
 * 
 * @param {string} password - The new password
 * @returns {Promise<{success: boolean, error?: string}>} The status of the update
 */
export async function updateUserPassword(password) {
  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  try {
    const supabase = await createClient()

    // Verify user is authenticated first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Session expired or invalid. Please request a new reset link.' }
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Password updated successfully
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
