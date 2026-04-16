import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge proxy — redirects unauthenticated users to /login.
 *
 * Reads the `intrainin_has_session` cookie, which is written client-side by
 * setSession() in lib/auth.ts. The cookie carries no sensitive data — it is
 * purely a signal for this proxy. The actual JWT lives in localStorage.
 */
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.has('intrainin_has_session')
  if (!hasSession) {
    const login = new URL('/login', req.url)
    // Preserve the intended destination so we can redirect back after login
    login.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(login)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/explore/:path*',
    '/learn/:path*',
    '/certificates/:path*',
    '/profile/:path*',
    '/job-hub/:path*',
    '/admin/:path*',
    '/team/:path*',
    '/hire/:path*',
    '/account/:path*',
    '/roadmap/:path*',
  ],
}
