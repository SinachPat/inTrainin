'use client'

/**
 * OAuth callback page — handles Google sign-in redirect from Supabase.
 *
 * Flow:
 *   1. Supabase redirects here with ?code=... after Google OAuth
 *   2. createBrowserClient detects the code in the URL and exchanges it
 *      internally (PKCE) — we do NOT call exchangeCodeForSession manually
 *   3. We listen via onAuthStateChange for SIGNED_IN / INITIAL_SESSION
 *   4. On session, we call /auth/me to get the user profile
 *   5. If profile incomplete → stash tokens → /login?method=google_profile
 *   6. If profile complete → /dashboard or /admin
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { setSession } from '@/lib/auth'
import { api } from '@/lib/api'

function CallbackContent() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Let createBrowserClient handle the PKCE exchange internally.
    // SIGNED_IN fires once the exchange succeeds; INITIAL_SESSION fires
    // immediately if a session was already established (handles the case
    // where initialize() finishes before this listener is registered).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          subscription.unsubscribe()
          await finaliseSession(
            session.access_token,
            session.refresh_token,
            session.expires_in,
          )
        }
      },
    )

    // Safety timeout — if neither event fires within 15s something went wrong
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      setError('Sign-in timed out. Please try again.')
    }, 15_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function finaliseSession(accessToken: string, refreshToken: string, expiresIn: number) {
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
        const dest = user.account_type === 'business' || user.account_type === 'admin'
          ? '/admin'
          : '/dashboard'
        router.replace(dest)
      }
    } catch {
      // /auth/me 404 — new Google user, no profile yet
      sessionStorage.setItem('pending_access_token',  accessToken)
      sessionStorage.setItem('pending_refresh_token', refreshToken)
      router.replace('/login?method=google_profile')
    }
  }

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
