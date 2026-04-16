import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/** Server-side client — uses service role key, bypasses RLS. Never expose to browser. */
export function createServerClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/** Browser / public client — uses anon key, respects RLS policies. */
export function createBrowserClient() {
  // NEXT_PUBLIC_ prefix is required for these vars to be included in the
  // browser bundle. SUPABASE_URL (no prefix) is undefined in the browser.
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('[db] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
  }
  return createClient<Database>(url, anon)
}

export type { Database }
