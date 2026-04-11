import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Ensure app_settings exists for OAuth users just like email signups
      await supabase.from('app_settings').insert([
        { user_id: data.user.id, setup_complete: false, family_name: "Our Family" }
      ]).select().single().then(() => {}).catch(() => {}); // silent catch if already exists
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
