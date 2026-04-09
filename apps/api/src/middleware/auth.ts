import { createMiddleware } from 'hono/factory'
import type { MiddlewareHandler } from 'hono'
import { createServerClient } from '@intrainin/db'
import type { AccountType } from '@intrainin/shared'

export type AuthVariables = {
  userId:   string
  userRole: AccountType // 'learner' | 'business' | 'admin'
}

/**
 * Auth middleware — validates Bearer JWT via Supabase auth.getUser().
 * Works with any algorithm Supabase is configured to use (HS256 or RS256).
 * Attaches userId + userRole to context for downstream handlers.
 */
export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = createMiddleware(
  async (c, next) => {
    const authorization = c.req.header('Authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Missing or invalid Authorization header' }, 401)
    }

    const token = authorization.slice(7)
    const db    = createServerClient()

    const { data: { user }, error } = await db.auth.getUser(token)

    if (error || !user) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401)
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined
    const userRole = (metadata?.account_type ?? 'learner') as AccountType

    c.set('userId',   user.id)
    c.set('userRole', userRole)

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
