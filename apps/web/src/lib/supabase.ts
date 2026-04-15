/**
 * Supabase browser client — used ONLY for OAuth flows (Google sign-in).
 * All other auth calls go through the API (apps/api) for a single source
 * of truth. This client is never used for data queries.
 *
 * The client is created lazily on first call so that importing this module
 * during SSR / static pre-rendering does not throw when the env vars are
 * absent from the build environment.
 */

import { createClient, type SupabaseClient, type GoTrueClient } from '@supabase/supabase-js'

// ─── Cookie-based storage adapter ─────────────────────────────────────────────
//
// localStorage is unreliable across OAuth redirects in privacy-hardened browsers
// (Safari ITP, Firefox ETP): the cross-site hop through accounts.google.com can
// cause the browser to partition or clear it before the callback page loads,
// losing the PKCE code_verifier and throwing "PKCE code verifier not found".
//
// Cookies with SameSite=Lax survive top-level cross-site navigations by design —
// they're sent when the browser returns to our origin after the Google redirect.
// Max-age=600 (10 min) matches the OAuth code lifetime; other Supabase keys
// (session, refresh token) get a longer 7-day TTL.

const cookieStorage = {
  getItem(key: string): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${encodeURIComponent(key)}=`))
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
  },

  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return
    // PKCE verifier needs a short TTL; session tokens get 7 days.
    const isPkce   = key.endsWith('-code-verifier')
    const maxAge   = isPkce ? 600 : 60 * 60 * 24 * 7
    document.cookie = [
      `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      `path=/`,
      `max-age=${maxAge}`,
      `SameSite=Lax`,
      // Omit Secure so it works on http://localhost during development.
      // In production Next.js runs over HTTPS so this is fine.
    ].join('; ')
  },

  removeItem(key: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax`
  },
}

// ─── Lazy client ───────────────────────────────────────────────────────────────

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (_client) return _client

  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!supabaseUrl || !supabaseAnon) {
    throw new Error(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set for Google OAuth.',
    )
  }

  _client = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      // MUST be false: when true, Supabase's fire-and-forget initialize() calls
      // exchangeCodeForSession and deletes the code_verifier before our
      // /auth/callback useEffect runs — causing "PKCE code verifier not found".
      detectSessionInUrl: false,
      flowType:           'pkce',
      storage:            typeof window !== 'undefined' ? cookieStorage : undefined,
    },
  })

  return _client
}

/**
 * The Supabase client — only instantiated on first access (browser-only).
 * Do not call this at module level; use it inside event handlers or effects.
 */
export const supabase: { readonly auth: GoTrueClient } = {
  get auth(): GoTrueClient { return getClient().auth },
}

/**
 * Start Google OAuth sign-in. Redirects to Google, which then redirects
 * to /auth/callback where we extract the session and set our own session format.
 */
export async function signInWithGoogle(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
  const { error } = await getClient().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt:      'consent',
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }
  // signInWithOAuth causes a full page redirect — nothing to return
}
