'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData) {
  const supabase = createClient()
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
  const supabase = createClient()
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error, data: authData } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Pre-seed an initial app_settings row for their new user account if they don't have one
  // This helps when they first hit the dashboard setup check.
  if (authData?.user) {
     await supabase.from('app_settings').insert([
       { user_id: authData.user.id, setup_complete: false, family_name: "Our Family" }
     ]);
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
