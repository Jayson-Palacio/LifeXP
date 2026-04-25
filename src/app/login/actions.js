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

  // After successful login, check if this email has any pending invites
  if (data?.user) {
    const { data: invites } = await supabase
      .from('family_invites')
      .select('family_owner_id')
      .eq('invited_email', data.user.email)

    if (invites && invites.length > 0) {
      for (const invite of invites) {
        // Link as family member
        await supabase.from('family_members').insert([
          { family_owner_id: invite.family_owner_id, member_user_id: data.user.id }
        ]).then(() => {}).catch(() => {})

        // Ensure app_settings exists and setup is complete
        const { data: existingSettings } = await supabase
          .from('app_settings')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!existingSettings) {
          await supabase.from('app_settings').insert([
            { user_id: data.user.id, setup_complete: true, family_name: 'Our Family' }
          ]).then(() => {}).catch(() => {})
        } else {
          await supabase.from('app_settings')
            .update({ setup_complete: true })
            .eq('user_id', data.user.id)
            .then(() => {}).catch(() => {})
        }

        // Remove the invite
        await supabase.from('family_invites')
          .delete()
          .eq('invited_email', data.user.email)
          .eq('family_owner_id', invite.family_owner_id)
      }
    }
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

    const { error, data: authData } = await supabase.auth.signUp({ email, password })

    if (error) {
      return { error: error.message }
    }

    // Check if email confirmation is required and no session was created
    if (authData?.user && !authData?.session) {
      return { message: "Success! Please check your email inbox to verify your account." }
    }

    // Save profile with name
    if (authData?.user) {
      await supabase.from('profiles').insert([
        { user_id: authData.user.id, first_name: firstName, last_name: lastName }
      ]).then(() => {}).catch(() => {})

      // Check if this email was invited to a family
      const { data: invite } = await supabase
        .from('family_invites')
        .select('family_owner_id')
        .eq('invited_email', email)
        .maybeSingle()

      if (invite) {
        // Link as family member
        await supabase.from('family_members').insert([
          { family_owner_id: invite.family_owner_id, member_user_id: authData.user.id }
        ]).then(() => {}).catch(() => {})

        // Create app_settings with setup_complete so they skip the setup wizard
        await supabase.from('app_settings').insert([
          { user_id: authData.user.id, setup_complete: true, family_name: 'Our Family' }
        ]).then(() => {}).catch(() => {})

        // Remove the invite since it's been consumed
        await supabase.from('family_invites')
          .delete()
          .eq('invited_email', email)
          .eq('family_owner_id', invite.family_owner_id)
      }
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
