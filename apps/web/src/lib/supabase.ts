/**
 * Supabase browser client — used ONLY for OAuth flows (Google sign-in).
 * All other auth calls go through the API (apps/api) for a single source
 * of truth. This client is never used for data queries.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnon) {
  // Development warning only — don't throw, so the app still builds without env vars
  if (typeof window !== 'undefined') {
    console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. OAuth will not work.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Persist the Supabase session so the callback page can read it after redirect
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
})

/**
 * Start Google OAuth sign-in. Redirects to Google, which then redirects
 * to /auth/callback where we extract the session and set our own session format.
 */
export async function signInWithGoogle(): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        // Request offline access so we get a refresh token
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
