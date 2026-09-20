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

  const email = (user.email || '').toLowerCase()
  if (!email || !allowedEmails.includes(email)) {
    redirect('/login')
  }

  return children
}
