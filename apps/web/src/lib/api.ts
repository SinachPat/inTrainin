/**
 * Typed API client — thin fetch wrapper for all calls to apps/api.
 * Auto-injects the stored JWT as an Authorization header on every request.
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
  ) {
    super(message)
    this.name = 'ApiError'
  }
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
    // Eagerly clear stale session so the middleware redirects on next navigation
    if (typeof window !== 'undefined') {
      ['intrainin_access_token', 'intrainin_refresh_token', 'intrainin_session_user'].forEach(k => {
        try { localStorage.removeItem(k) } catch {}
      })
      try { document.cookie = 'intrainin_has_session=; path=/; max-age=0' } catch {}
    }
    throw new ApiError(401, 'Session expired — please sign in again.', 'UNAUTHORIZED')
  }

  if (!res.ok) {
    let errMsg = res.statusText
    let code: string | undefined
    try {
      const body = await res.json() as { error?: string; code?: string }
      errMsg = body.error ?? errMsg
      code   = body.code
    } catch {
      errMsg = await res.text().catch(() => errMsg)
    }
    throw new ApiError(res.status, errMsg, code)
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
