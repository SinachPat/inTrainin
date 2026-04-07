import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/** Server-side client — uses service role key, bypasses RLS. Never expose to browser. */
export function createServerClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** Browser / public client — uses anon key, respects RLS policies. */
export function createBrowserClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  )
}

export type { Database }
