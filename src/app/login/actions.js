'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '../../utils/supabase/server'

export async function login(formData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email').toLowerCase().trim()
    const password = formData.get('password')
    const firstName = (formData.get('first_name') || '').trim()
    const lastName = (formData.get('last_name') || '').trim()

    const { error, data: authData } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    })

    if (error) {
      return { error: error.message }
    }

    // Check if email confirmation is required and no session was created
    if (authData?.user && !authData?.session) {
      return { message: "Success! Please check your email inbox to verify your account." }
    }

  } catch (err) {
    return { error: err.message || "An unexpected error occurred during signup." }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData) {
  const supabase = await createClient()
  const email = formData.get('email')
  
  const origin = headers().get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData) {
  const supabase = await createClient()
  const password = formData.get('password')
  
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
