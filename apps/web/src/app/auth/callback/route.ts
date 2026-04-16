/**
 * OAuth callback Route Handler — exchanges the PKCE code for a session.
 *
 * Why a Route Handler instead of a client component:
 *   Client components run twice (SSR + hydration) creating timing windows
 *   where Supabase's initialize() races with manual exchangeCodeForSession
 *   calls. A Route Handler runs once, server-side, with direct cookie access —
 *   no race conditions, no browser storage issues.
 *
 * Flow:
 *   1. Supabase redirects here with ?code=... after Google OAuth
 *   2. createServerClient reads the code_verifier cookie written by
 *      createBrowserClient before the redirect (same cookie names by design)
 *   3. exchangeCodeForSession succeeds — session cookies are set
 *   4. We redirect to /auth/finalise which is a thin client page that
 *      reads the session and routes to profile completion or dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  // OAuth provider returned an error (e.g. user denied access)
  if (error) {
    console.error('[auth/callback] OAuth error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/login?error=oauth_denied`)
  }

  if (!code) {
    console.error('[auth/callback] No code in callback URL')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()                { return cookieStore.getAll() },
        setAll(cookiesToSet)    {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Exchange succeeded — redirect to the finalise page which reads the
  // session client-side and routes the user to profile completion or dashboard.
  return NextResponse.redirect(`${origin}/auth/finalise`)
}
