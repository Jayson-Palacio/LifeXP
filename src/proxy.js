import { updateSession } from './utils/supabase/middleware'

export async function proxy(request) {
  // The screenshot-capture page renders live dashboards with mock data and is
  // for App Store asset generation only. Never serve it in production.
  if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/demo-screenshots')) {
    return new Response('Not Found', { status: 404 })
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
