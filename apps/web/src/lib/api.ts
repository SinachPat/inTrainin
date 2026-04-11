/**
 * Typed API client — thin fetch wrapper for all calls to apps/api.
 * Auto-injects the stored JWT as an Authorization header on every request.
 * On a 401, attempts a silent token refresh before giving up and clearing
 * the session. All requests that arrive during a refresh are queued and
 * retried once the new token is available.
 * Callers can override by passing { headers: { Authorization: '...' } } in init.
 */

import { getAccessToken } from './auth'

const BASE_URL =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Token refresh (singleton) ─────────────────────────────────────────────────
// Only one refresh in-flight at a time. Concurrent 401s share the same promise.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const refreshToken = localStorage.getItem('intrainin_refresh_token')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const json = await res.json() as { data?: { accessToken?: string; refreshToken?: string } }
    const newAccess  = json.data?.accessToken
    const newRefresh = json.data?.refreshToken
    if (!newAccess) return null

    localStorage.setItem('intrainin_access_token', newAccess)
    if (newRefresh) localStorage.setItem('intrainin_refresh_token', newRefresh)
    return newAccess
  } catch {
    return null
  }
}

function clearSession() {
  if (typeof window === 'undefined') return
  ;['intrainin_access_token', 'intrainin_refresh_token', 'intrainin_session_user'].forEach(k => {
    try { localStorage.removeItem(k) } catch {}
  })
  try { document.cookie = 'intrainin_has_session=; path=/; max-age=0' } catch {}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers, // caller-provided headers always win
    },
  })

  if (res.status === 401) {
    // Auth routes (login, otp, refresh) must not be retried — that causes loops.
    const isAuthRoute = path.startsWith('/auth/')
    if (!isAuthRoute) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
      }
      const newToken = await refreshPromise

      if (newToken) {
        // Retry original request with the fresh token
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
            ...init.headers,
          },
        })
        if (retryRes.ok) return retryRes.json() as Promise<T>
      }
    }

    // Refresh failed or was an auth route — clear session and bail
    clearSession()
    throw new ApiError(401, 'Session expired — please sign in again.', 'UNAUTHORIZED')
  }

  if (!res.ok) {
    let errMsg = res.statusText
    let code: string | undefined
    let data: unknown
    try {
      const body = await res.json() as { error?: unknown; code?: string; data?: unknown }
      // Guard: body.error must be a string — objects would render as "[object Object]"
      if (typeof body.error === 'string') errMsg = body.error
      else if (body.error)               errMsg = JSON.stringify(body.error)
      code = body.code
      data = body.data
    } catch {
      errMsg = await res.text().catch(() => errMsg)
    }
    throw new ApiError(res.status, errMsg, code, data)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
}

export { ApiError }
