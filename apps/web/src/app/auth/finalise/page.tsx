'use client'

/**
 * Post-OAuth finalise page.
 *
 * The Route Handler at /auth/callback has already exchanged the PKCE code
 * for a session and set the session cookies. This page simply reads that
 * session, calls /auth/me to get the profile, and routes the user to
 * profile completion or their dashboard.
 *
 * Keeping this as a separate client page (rather than doing it all in the
 * Route Handler) means we can use our existing sessionStorage token-stashing
 * pattern for the profile-completion flow without cookies for that part.
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
        oauthError === 'oauth_denied'   ? 'Google sign-in was cancelled.' :
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

      const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = session

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

        if (!profileComplete) {
          sessionStorage.setItem('pending_access_token',  accessToken)
          sessionStorage.setItem('pending_refresh_token', refreshToken)
          router.replace('/login?method=google_profile')
        } else {
          router.replace(
            user.account_type === 'business' || user.account_type === 'admin'
              ? '/admin'
              : '/dashboard',
          )
        }
      } catch {
        // /auth/me 404 — new Google user, no profile yet
        sessionStorage.setItem('pending_access_token',  accessToken)
        sessionStorage.setItem('pending_refresh_token', refreshToken)
        router.replace('/login?method=google_profile')
      }
    }

    finalise()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
