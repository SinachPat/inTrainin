import { createMiddleware } from 'hono/factory'
import type { MiddlewareHandler } from 'hono'
import { jwtVerify, createRemoteJWKSet } from 'jose'
import type { AccountType } from '@intrainin/shared'

export type AuthVariables = {
  userId:   string
  userRole: AccountType // 'learner' | 'business' | 'admin'
}

/**
 * Verify a Supabase-issued JWT.
 *
 * Supabase signs JWTs with SUPABASE_JWT_SECRET (HS256). We verify locally
 * without a network call — fast and avoids Supabase rate limits.
 * The JWT payload contains: sub (user UUID), role (postgres role, not app role).
 * The app-level role ('learner' | 'business' | 'admin') is stored in the
 * user_metadata.account_type claim that Supabase embeds on signup.
 */
async function verifySupabaseJwt(token: string): Promise<{ userId: string; userRole: AccountType }> {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('SUPABASE_JWT_SECRET must be set')

  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret),
    { algorithms: ['HS256'] },
  )

  const userId   = payload.sub
  const metadata = payload.user_metadata as Record<string, unknown> | undefined
  const userRole = (metadata?.account_type ?? 'learner') as AccountType

  if (!userId) throw new Error('JWT missing sub claim')

  return { userId, userRole }
}

/**
 * Auth middleware — validates Bearer JWT, attaches userId + userRole to context.
 * Apply to any route that requires authentication.
 */
export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = createMiddleware(
  async (c, next) => {
    const authorization = c.req.header('Authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Missing or invalid Authorization header' }, 401)
    }

    const token = authorization.slice(7)

    try {
      const { userId, userRole } = await verifySupabaseJwt(token)
      c.set('userId',   userId)
      c.set('userRole', userRole)
    } catch {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401)
    }

    await next()
  },
)

/**
 * Role guard — use after authMiddleware to restrict a route to specific roles.
 *
 * Usage:
 *   app.get('/admin/stats', authMiddleware, requireRole('admin'), handler)
 */
export function requireRole(...allowed: AccountType[]): MiddlewareHandler<{ Variables: AuthVariables }> {
  return createMiddleware(async (c, next) => {
    const role = c.get('userRole')
    if (!allowed.includes(role)) {
      return c.json({ success: false, error: 'Forbidden' }, 403)
    }
    await next()
  })
}
