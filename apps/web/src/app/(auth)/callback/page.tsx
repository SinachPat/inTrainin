'use client'

/**
 * OAuth callback page — handles Google sign-in redirect from Supabase.
 *
 * Flow:
 *   1. Supabase redirects here with ?code=... after Google OAuth
 *   2. We call supabase.auth.exchangeCodeForSession() to get a session
 *   3. We extract access/refresh tokens and call /auth/me to get the user profile
 *   4. We set our own session format in localStorage (same shape as OTP login)
 *   5. If the profile is incomplete (new Google user), we redirect to /login?method=profile
 *      so the user completes their name/city before continuing
 *   6. If profile is complete, we route to /dashboard or /admin
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { setSession } from '@/lib/auth'
import { api } from '@/lib/api'

function CallbackContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')

      if (!code) {
        // Might be hash-fragment based (implicit flow) — let Supabase handle it
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
        if (sessionErr || !session) {
          setError('Sign-in failed. No session was returned.')
          return
        }
        await finaliseSession(session.access_token, session.refresh_token, session.expires_in)
        return
      }

      // PKCE flow: exchange code for session
      const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeErr || !data.session) {
        setError(exchangeErr?.message ?? 'Sign-in failed. Please try again.')
        return
      }

      await finaliseSession(
        data.session.access_token,
        data.session.refresh_token,
        data.session.expires_in,
      )
    }

    async function finaliseSession(accessToken: string, refreshToken: string, expiresIn: number) {
      try {
        // Fetch profile from our API (this also upserts the users row if needed)
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
          // New Google user — send to login page in profile-completion mode
          // We pass the tokens via sessionStorage so the login page can pick them up
          sessionStorage.setItem('pending_access_token',  accessToken)
          sessionStorage.setItem('pending_refresh_token', refreshToken)
          router.replace('/login?method=google_profile')
        } else {
          const dest = user.account_type === 'business' || user.account_type === 'admin' ? '/admin' : '/dashboard'
          router.replace(dest)
        }
      } catch {
        // /auth/me failed — most likely a new Google user whose row doesn't exist yet
        // Send to profile completion with tokens stashed in sessionStorage
        sessionStorage.setItem('pending_access_token',  accessToken)
        sessionStorage.setItem('pending_refresh_token', refreshToken)
        router.replace('/login?method=google_profile')
      }
    }

    handleCallback()
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

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  )
}
