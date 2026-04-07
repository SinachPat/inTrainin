/**
 * Session helpers — thin wrappers over Supabase auth.
 * TODO Layer 3: swap localStorage mock for real @intrainin/db browser client.
 */

export type SessionUser = {
  id: string
  email: string
  role: 'learner' | 'business_owner' | 'admin'
}

const SESSION_KEY = 'intrainin_session'

/** Returns the current session user from localStorage. */
export async function getSession(): Promise<SessionUser | null> {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
  // TODO Layer 3: replace with supabase.auth.getSession()
}

/** Redirects to /login if no session exists. Use in page-level guards. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')
  return session
}

/**
 * Clears the session and performs a hard navigation to /login.
 *
 * Uses window.location.replace() intentionally — a soft router.push() would
 * keep the React component tree mounted and allow Back-button access to
 * protected pages. A hard navigation wipes all in-memory state and replaces
 * the history entry, so the user cannot navigate back to the dashboard.
 *
 * TODO Layer 3: call supabase.auth.signOut() before clearing localStorage.
 */
export async function signOut(): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  // Remove any other keys the app stores on behalf of the session
  localStorage.removeItem('intrainin_fcm_token')
  sessionStorage.clear()
  window.location.replace('/login')
}
