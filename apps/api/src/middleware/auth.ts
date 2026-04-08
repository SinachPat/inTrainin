import type { Context, MiddlewareHandler, Next } from 'hono'
import { createMiddleware } from 'hono/factory'
import type { AccountType } from '@intrainin/shared'

export type AuthVariables = {
  userId: string
  userRole: AccountType // 'learner' | 'business' | 'admin'
}

/**
 * JWT verification middleware.
 * Validates Bearer token from Authorization header, attaches userId + userRole to context.
 * TODO Layer 5: implement with jose + JWT_SECRET env var.
 *
 * SECURITY NOTE: Until Layer 5 is complete this middleware rejects requests
 * with no Authorization header, but does NOT verify the token signature.
 * Do NOT deploy to production without completing the TODO below.
 */
export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = createMiddleware(
  async (c: Context, next: Next) => {
    const authorization = c.req.header('Authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Missing or invalid Authorization header' }, 401)
    }

    // TODO Layer 5: verify JWT, decode payload, set variables
    // const token = authorization.slice(7)
    // const { sub: userId, role: userRole } = await verifyJwt(token, process.env.JWT_SECRET!)
    // c.set('userId', userId)
    // c.set('userRole', userRole as AccountType)

    await next()
  },
)
