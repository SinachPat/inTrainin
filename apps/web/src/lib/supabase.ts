/**
 * Supabase browser client — used ONLY for Google OAuth flows.
 * All other auth calls go through the API (apps/api).
 *
 * Uses @supabase/ssr createBrowserClient which stores the PKCE code_verifier
 * in cookies, making it survive the cross-site redirect through
 * accounts.google.com regardless of browser privacy settings.
 *
 * detectSessionInUrl is intentionally left at its default (true) so
 * createBrowserClient handles the PKCE code exchange internally.
 * The callback page listens via onAuthStateChange instead of calling
 * exchangeCodeForSession manually — this eliminates the race condition.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

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

  // createBrowserClient handles cookie storage and PKCE correctly in Next.js.
  // Do NOT pass detectSessionInUrl: false — that breaks the internal exchange.
  _client = createBrowserClient(supabaseUrl, supabaseAnon)

  return _client
}

export const supabase = {
  get auth() { return getClient().auth },
}

/**
 * Start Google OAuth sign-in. Redirects the browser to Google, which then
 * redirects to /auth/callback where onAuthStateChange fires with the session.
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

  if (error) throw new Error(error.message)
}
