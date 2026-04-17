'use client'

/**
 * Post-OAuth finalise page.
 *
 * The Route Handler at /auth/callback has already:
 *   1. Exchanged the PKCE code for a session (cookies set)
 *   2. Called /auth/me server-to-server and stashed the result in _itnn_ps cookie
 *
 * This page reads the cookie, calls setSession, and routes — no API call needed.
 * If the cookie is missing (pre-fetch timed out, etc.) it falls back to calling
 * /auth/me itself so the flow is always correct.
 *
 * Routing decisions:
 *   profileComplete + no mismatch        → /dashboard or /admin
 *   profileComplete + pending=business
 *     but account is learner             → /login?method=google_convert
 *   profile incomplete                   → /login?method=google_profile  (name pre-filled)
 *   notFound + pending_account_type set  → /login?method=google_profile  (new signup, name pre-filled)
 *   notFound + no pending_account_type   → /login?method=google_profile  (new user from login page, type picker shown first)
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { setSession } from '@/lib/auth'
import { api } from '@/lib/api'

// ── Session hint helpers ──────────────────────────────────────────────────────

type PendingSession =
  | { notFound: true; googleName?: string | null; googleEmail?: string | null }
  | {
      notFound?: false
      id: string
      fullName: string
      accountType: string
      phone: string | null
      profileComplete: boolean
    }

/**
 * Fetch the pre-resolved session hint from the Route Handler at
 * /auth/finalise/data. The cookie is httpOnly so it cannot be read directly
 * by client JS — this same-origin fetch is the secure bridge (~5ms).
 */
async function fetchPendingSession(): Promise<PendingSession | null> {
  try {
    const res = await fetch('/auth/finalise/data', { credentials: 'same-origin' })
    if (!res.ok) return null
    return await res.json() as PendingSession | null
  } catch {
    return null
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

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
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()

      if (sessionErr || !session) {
        setError('Session not found. Please sign in again.')
        return
      }

      const { access_token: accessToken, refresh_token: refreshToken } = session

      // Intent signal stashed before the OAuth redirect.
      // Signup page always stashes it; login page only stashes it for ?type=business.
      // Absence means the user came from the plain /login page (sign-in intent).
      const pendingAccountType = sessionStorage.getItem('pending_account_type') as 'learner' | 'business' | null

      // ── Fast path: use the pre-fetched data from the Route Handler cookie ───
      const cached = await fetchPendingSession()

      if (cached) {
        await route(accessToken, refreshToken, pendingAccountType, cached)
        return
      }

      // ── Fallback: Route Handler prefetch failed — fetch /auth/me ourselves ──
      try {
        const meRes = await api.get<{
          success: boolean
          data: { user: { id: string; full_name: string; account_type: string; phone: string | null; location_city: string | null } }
        }>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })

        const u = meRes.data.user
        await route(accessToken, refreshToken, pendingAccountType, {
          id:              u.id,
          fullName:        u.full_name,
          accountType:     u.account_type,
          phone:           u.phone,
          profileComplete: Boolean(u.full_name?.trim() && u.location_city),
        })
      } catch {
        // /auth/me 404 — treat as notFound
        await route(accessToken, refreshToken, pendingAccountType, { notFound: true })
      }
    }

    finalise()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Routing logic ─────────────────────────────────────────────────────────
  async function route(
    accessToken:         string,
    refreshToken:        string,
    pendingAccountType:  'learner' | 'business' | null,
    ps:                  PendingSession,
  ) {
    if (ps.notFound) {
      // Brand-new Google user — no public.users row yet.
      // Route to onboarding regardless of which page they came from.
      // If pendingAccountType is set (came from signup), keep it so the login
      // page skips the type picker. If not (came from login), leave it unset
      // so the type picker shows first — Google sign-in works as sign-in OR sign-up.
      sessionStorage.setItem('pending_access_token',  accessToken)
      sessionStorage.setItem('pending_refresh_token', refreshToken)
      if (pendingAccountType) {
        // pending_account_type already in sessionStorage — login page will read it
      } else {
        // Leave pending_account_type unset — type picker will show
        sessionStorage.removeItem('pending_account_type')
      }
      // Stash Google name/email so the profile form can be pre-filled
      if (ps.googleName)  sessionStorage.setItem('pending_google_name',  ps.googleName)
      if (ps.googleEmail) sessionStorage.setItem('pending_google_email', ps.googleEmail)
      router.replace('/login?method=google_profile')
      return
    }

    if (ps.profileComplete) {
      // Account-type mismatch: user signed up as business but account is learner
      if (pendingAccountType === 'business' && ps.accountType === 'learner') {
        sessionStorage.setItem('pending_access_token',  accessToken)
        sessionStorage.setItem('pending_refresh_token', refreshToken)
        // Leave pending_account_type for login page to consume
        router.replace('/login?method=google_convert')
        return
      }

      // Happy path — profile is complete, set session and go to dashboard
      sessionStorage.removeItem('pending_account_type')
      setSession({
        accessToken,
        refreshToken,
        user: {
          id:          ps.id,
          fullName:    ps.fullName,
          accountType: ps.accountType as 'learner' | 'business' | 'admin',
          phone:       ps.phone,
        },
      })
      router.replace(
        ps.accountType === 'business' || ps.accountType === 'admin'
          ? '/admin'
          : '/dashboard',
      )
    } else {
      // Profile exists but is incomplete (has auth row, missing name/city).
      // Do NOT call setSession here — the middleware cookie would let an
      // incomplete profile straight into /dashboard. setSession is called by
      // handleProfileSubmit in the login page after completion.
      sessionStorage.setItem('pending_access_token',  accessToken)
      sessionStorage.setItem('pending_refresh_token', refreshToken)
      // Stash Google name so the profile form can be pre-filled
      if (ps.fullName?.trim()) sessionStorage.setItem('pending_google_name', ps.fullName.trim())
      // Leave pending_account_type for login page
      router.replace('/login?method=google_profile')
    }
  }

  // ── Error states ─────────────────────────────────────────────────────────
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
      <p className="text-sm text-muted-foreground">Signing you in…</p>
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
