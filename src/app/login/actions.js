'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    const { error, data: authData } = await supabase.auth.signUp(data)

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
