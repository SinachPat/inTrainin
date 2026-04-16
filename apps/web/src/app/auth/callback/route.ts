/**
 * OAuth callback Route Handler — exchanges the PKCE code for a session,
 * then pre-fetches the user profile so /auth/finalise can route instantly
 * with no client-side API call.
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
 *   4. We call /auth/me server-to-server (no extra round-trip for the browser)
 *      and stash the result in a short-lived _itnn_ps cookie
 *   5. We redirect to /auth/finalise which reads the cookie and routes
 *      immediately — no spinner wait
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const PS_COOKIE   = '_itnn_ps'   // pending-session cookie name
const PS_MAX_AGE  = 30           // seconds — just enough to survive the redirect

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
        getAll()             { return cookieStore.getAll() },
        setAll(cookiesToSet) {
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

  // Build the redirect response first so we can attach the cookie to it.
  const response = NextResponse.redirect(`${origin}/auth/finalise`)

  // Pre-fetch /auth/me server-to-server so the browser never has to make this
  // call itself. The result travels to /auth/finalise via a short-lived cookie.
  // If this fetch fails for any reason, finalise/page.tsx falls back gracefully.
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.access_token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      const meRes  = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        // Don't let a slow API stall the redirect — 4 s is generous
        signal: AbortSignal.timeout(4000),
      })

      if (meRes.ok) {
        type MeUser = { id: string; full_name: string; account_type: string; phone: string | null; location_city: string | null }
        const meData = await meRes.json() as { success: boolean; data: { user: MeUser } }
        const user   = meData.data?.user

        if (user) {
          const profileComplete = Boolean(user.full_name?.trim() && user.location_city)
          response.cookies.set(PS_COOKIE, JSON.stringify({
            id:              user.id,
            fullName:        user.full_name,
            accountType:     user.account_type,
            phone:           user.phone ?? null,
            profileComplete,
          }), { path: '/', maxAge: PS_MAX_AGE, sameSite: 'lax', httpOnly: true })
        }
      } else if (meRes.status === 404) {
        // No InTrainin profile yet — new user or sign-in with no account
        response.cookies.set(PS_COOKIE, JSON.stringify({ notFound: true }), {
          path: '/', maxAge: PS_MAX_AGE, sameSite: 'lax', httpOnly: true,
        })
      }
      // Any other HTTP error: leave cookie unset; finalise/page.tsx will retry
    }
  } catch (prefetchErr) {
    // Non-fatal — timeout, network error, JSON parse failure.
    // finalise/page.tsx detects the missing cookie and falls back to its own fetch.
    console.warn('[auth/callback] /auth/me prefetch failed (non-fatal):', prefetchErr)
  }

  return response
}
