import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export const metadata = {
  title: 'Kaeluma Admin',
  robots: 'noindex, nofollow',
}

/**
 * Admin layout — server component that gates all /admin/* routes.
 * Checks the signed-in user's email against the ADMIN_EMAILS env var.
 * Anyone not on the list is redirected to /login.
 */
export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const allowedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)

  if (!allowedEmails.includes(user.email.toLowerCase())) {
    // Return a bare 404-style response — don't reveal admin exists
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'var(--font-outfit, system-ui, sans-serif)' }}>
      {children}
    </div>
  )
}
