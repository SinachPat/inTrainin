import type { Context, MiddlewareHandler, Next } from 'hono'
import { createMiddleware } from 'hono/factory'

export type AuthVariables = {
  userId: string
  userRole: 'learner' | 'business_owner' | 'admin'
}

/**
 * JWT verification middleware.
 * Validates Bearer token from Authorization header, attaches userId + userRole to context.
 * TODO Layer 5: implement with jose or jsonwebtoken + JWT_SECRET env var.
 */
export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = createMiddleware(
  async (c: Context, next: Next) => {
    const authorization = c.req.header('Authorization')

    if (!authorization?.startsWith('Bearer ')) {
      return c.json({ status: 'error', message: 'Missing or invalid Authorization header' }, 401)
    }

    // TODO Layer 5: verify JWT, decode payload, set variables
    // const token = authorization.slice(7)
    // const payload = await verifyJwt(token)
    // c.set('userId', payload.sub)
    // c.set('userRole', payload.role)

    await next()
  },
)
