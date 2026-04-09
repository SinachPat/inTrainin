/**
 * Session helpers — thin wrappers around the API auth endpoints.
 * Stores the Supabase JWT in localStorage and attaches it to API requests.
 *
 * TODO Layer 6: replace localStorage with httpOnly cookie session once the
 * Next.js middleware layer is set up, for better XSS protection.
 */

import type { AccountType } from '@intrainin/shared'

export interface SessionUser {
  id:          string
  fullName:    string
  accountType: AccountType // 'learner' | 'business' | 'admin'
  phone:       string | null
}

const ACCESS_TOKEN_KEY  = 'intrainin_access_token'
const REFRESH_TOKEN_KEY = 'intrainin_refresh_token'
const SESSION_USER_KEY  = 'intrainin_session_user'

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(ACCESS_TOKEN_KEY) } catch { return null }
}

export function setSession(params: {
  accessToken:  string
  refreshToken: string
  user:         SessionUser
}): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY,  params.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken)
    localStorage.setItem(SESSION_USER_KEY,  JSON.stringify(params.user))
    // Set a non-sensitive cookie so Next.js middleware can check session without
    // reading localStorage (which is browser-only and unavailable on the edge).
    document.cookie = 'intrainin_has_session=1; path=/; max-age=2592000; SameSite=Strict'
  } catch {}
}

// ─── Session read ─────────────────────────────────────────────────────────────

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

/**
 * Updates only the user fields in the stored session without touching tokens.
 * Use after profile mutations (name change, etc.) so the sidebar stays in sync.
 */
export function patchSessionUser(patch: Partial<SessionUser>): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY)
    if (!raw) return
    const current = JSON.parse(raw) as SessionUser
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {}
}

/** Throws if no session — use in page-level guards. */
export function requireSession(): SessionUser {
  const session = getSession()
  if (!session) throw new Error('Unauthenticated')
  return session
}

// ─── Fetch with auth ──────────────────────────────────────────────────────────

/**
 * Returns the Authorization header value for the current session.
 * Pass this into API requests that require authentication.
 */
export function authHeader(): Record<string, string> {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

/**
 * Clears the session and performs a hard navigation to /login.
 *
 * Uses window.location.replace() so the user cannot navigate Back to a
 * protected page — a soft router.push() would leave state in memory.
 */
export async function signOut(): Promise<void> {
  if (typeof window === 'undefined') return

  // Best-effort server-side invalidation — ignore errors
  const token = getAccessToken()
  if (token) {
    fetch('/api/proxy/auth/logout', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }

  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(SESSION_USER_KEY)
    localStorage.removeItem('intrainin_fcm_token')
    localStorage.removeItem('learner-sidebar-collapsed')
    localStorage.removeItem('business-sidebar-collapsed')
    sessionStorage.clear()
    // Clear the middleware-readable session cookie
    document.cookie = 'intrainin_has_session=; path=/; max-age=0'
  } catch {}

  window.location.replace('/login')
}
