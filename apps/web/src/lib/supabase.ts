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
      detectSessionInUrl: true,
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
