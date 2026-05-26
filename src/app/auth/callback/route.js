import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // 'signup' or 'recovery'
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  const supabase = await createClient()

  // 1. If we received a type and a token hash (passed as code), use verifyOtp
  if (code && type) {
    const { error, data } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: type, // 'signup' or 'recovery'
    })

    if (!error && data?.user) {
      // Ensure app_settings exists for the user
      await supabase.from('app_settings').insert([
        { user_id: data.user.id, setup_complete: false, family_name: "Our Family" }
      ]).select().single().then(() => {}).catch(() => {});
      
      return NextResponse.redirect(new URL(next, request.url))
    }
    
    // If verification failed, redirect to login with error
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || 'Verification failed')}`, request.url))
  }

  // 2. Fallback to standard PKCE code exchange
  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Ensure app_settings exists
      await supabase.from('app_settings').insert([
        { user_id: data.user.id, setup_complete: false, family_name: "Our Family" }
      ]).select().single().then(() => {}).catch(() => {});
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
