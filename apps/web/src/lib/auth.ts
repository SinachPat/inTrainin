/**
 * Session helpers — thin wrappers over Supabase auth.
 * TODO Layer 6: wire up @intrainin/db browser client.
 */

export type SessionUser = {
  id: string
  email: string
  role: 'learner' | 'business_owner' | 'admin'
}

/** Returns the current session user from localStorage/cookie (client-side). */
export async function getSession(): Promise<SessionUser | null> {
  // TODO Layer 6: return supabase.auth.getSession() parsed user
  return null
}

/** Redirects to /login if no session exists. Use in page-level guards. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthenticated')
  }
  return session
}

/** Clears the session and redirects to /login. */
export async function signOut(): Promise<void> {
  // TODO Layer 6: supabase.auth.signOut()
}
