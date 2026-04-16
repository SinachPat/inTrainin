/**
 * GET /auth/finalise/data
 *
 * Server-side Route Handler that reads the _itnn_ps cookie (set by
 * /auth/callback) and returns its contents as JSON, then immediately
 * clears the cookie.
 *
 * The cookie is httpOnly so client JavaScript cannot read it directly —
 * this endpoint acts as the secure bridge. It is same-origin only
 * (no external fetch required) so the round-trip is ~5ms.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const PS_COOKIE = '_itnn_ps'

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PS_COOKIE)?.value

  // Clear the cookie regardless of whether we parsed it
  const response = NextResponse.json(raw ? JSON.parse(raw) : null)
  response.cookies.set(PS_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}
