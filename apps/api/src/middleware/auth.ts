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

    // Read account_type from public.users — the canonical source of truth.
    // Never fall back to JWT metadata: metadata is writable by the client and
    // trusting it would allow role escalation (learner → admin).
    let userRow: { account_type: string } | null = null
    try {
      const { data, error: dbError } = await db
        .from('users')
        .select('account_type')
        .eq('id', user.id)
        .maybeSingle()

      if (dbError) {
        console.error('[auth] users lookup error:', dbError.message)
        return c.json({ success: false, error: 'Authentication error' }, 500)
      }

      userRow = data
    } catch (err) {
      console.error('[auth] unexpected DB error:', err)
      return c.json({ success: false, error: 'Authentication error' }, 500)
    }

    if (!userRow) {
      // User authenticated with Supabase but has no row in public.users —
      // this is an incomplete signup; treat as unauthorised.
      return c.json({ success: false, error: 'User profile not found' }, 401)
    }

    const userRole = userRow.account_type as AccountType

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
