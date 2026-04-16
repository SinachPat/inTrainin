'use client'

/**
 * Post-OAuth finalise page.
 *
 * The Route Handler at /auth/callback has already exchanged the PKCE code
 * for a session and set the session cookies. This page reads that session,
 * calls /auth/me, and routes the user appropriately:
 *
 *   profileComplete + no type mismatch  → /dashboard or /admin
 *   profileComplete + pending=business
 *     but account is learner            → /login?method=google_convert  (convert banner)
 *   profile incomplete                  → /login?method=google_profile  (onboarding)
 *   /auth/me 404 + pending_account_type → /login?method=google_profile  (new signup)
 *   /auth/me 404 + no pending type      → error: no account found        (sign-in with unknown Google account)
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { setSession } from '@/lib/auth'
import { api } from '@/lib/api'

function FinaliseContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Surface errors forwarded from the Route Handler
    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError(
        oauthError === 'oauth_denied'    ? 'Google sign-in was cancelled.' :
        oauthError === 'exchange_failed' ? 'Sign-in failed. Please try again.' :
        'Something went wrong. Please try again.',
      )
      return
    }

    async function finalise() {
      // The session was set by the Route Handler — just read it
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

      if (sessionErr || !session) {
        setError('Session not found. Please sign in again.')
        return
      }

      const { access_token: accessToken, refresh_token: refreshToken } = session

      // Read the account type stashed before the Google redirect.
      // Signup page always stashes it (learner or business).
      // Login page only stashes it for ?type=business.
      // Absence means the user came from the plain /login page (sign-in intent).
      const pendingAccountType = sessionStorage.getItem('pending_account_type') as 'learner' | 'business' | null

      try {
        const meRes = await api.get<{
          success: boolean
          data: { user: { id: string; full_name: string; account_type: string; phone: string | null; location_city: string | null } }
        }>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })

        const user = meRes.data.user
        const profileComplete = Boolean(user.full_name?.trim() && user.location_city)

        setSession({
          accessToken,
          refreshToken,
          user: {
            id:          user.id,
            fullName:    user.full_name,
            accountType: user.account_type as 'learner' | 'business' | 'admin',
            phone:       user.phone,
          },
        })

        if (profileComplete) {
          // Account-type mismatch: user tried to sign in/up as business but their
          // Google account is registered to a learner account.
          if (pendingAccountType === 'business' && user.account_type === 'learner') {
            // Leave pending_account_type in sessionStorage — login page will consume it
            sessionStorage.setItem('pending_access_token',  accessToken)
            sessionStorage.setItem('pending_refresh_token', refreshToken)
            router.replace('/login?method=google_convert')
            return
          }

          // Happy path — clean up and route to dashboard
          sessionStorage.removeItem('pending_account_type')
          router.replace(
            user.account_type === 'business' || user.account_type === 'admin'
              ? '/admin'
              : '/dashboard',
          )
        } else {
          // Profile incomplete — send to onboarding.
          // Leave pending_account_type so the login page can pick it up.
          sessionStorage.setItem('pending_access_token',  accessToken)
          sessionStorage.setItem('pending_refresh_token', refreshToken)
          router.replace('/login?method=google_profile')
        }
      } catch {
        // /auth/me returned an error (most likely 404 — no InTrainin account yet)

        if (pendingAccountType) {
          // Came from signup page (always stashes account type) — new user, go to onboarding.
          // Leave pending_account_type for the login page to consume.
          sessionStorage.setItem('pending_access_token',  accessToken)
          sessionStorage.setItem('pending_refresh_token', refreshToken)
          router.replace('/login?method=google_profile')
        } else {
          // Came from the login page with no stashed account type — this Google account
          // has no InTrainin account. Show a clear error rather than silently
          // creating a new account.
          setError('no_account')
        }
      }
    }

    finalise()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── No account found (sign-in attempt with unregistered Google account) ──────
  if (error === 'no_account') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-destructive">
          No InTrainin account found for this Google account.
        </p>
        <p className="text-sm text-muted-foreground">
          Would you like to sign up instead?
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.replace('/signup')}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create an account
          </button>
          <button
            onClick={() => router.replace('/login')}
            className="text-sm text-primary hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  // ── Generic error (oauth_denied, exchange_failed, session missing) ────────────
  if (error) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-destructive">{error}</p>
        <button
          onClick={() => router.replace('/login')}
          className="text-sm text-primary hover:underline"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  )
}

export default function FinalisePage() {
  return (
    <Suspense>
      <FinaliseContent />
    </Suspense>
  )
}
