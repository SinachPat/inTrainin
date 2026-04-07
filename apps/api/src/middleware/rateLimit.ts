import type { Context, MiddlewareHandler, Next } from 'hono'
import { createMiddleware } from 'hono/factory'

interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number
  /** Window duration in seconds. */
  windowSec: number
}

/**
 * In-memory rate limiter (dev/test). Replace with Redis-backed limiter in production.
 * TODO Layer 5: implement with Upstash Redis rate limiting.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const { limit, windowSec } = options
  const store = new Map<string, { count: number; resetAt: number }>()

  return createMiddleware(async (c: Context, next: Next) => {
    const key = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown'
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowSec * 1000 })
      await next()
      return
    }

    if (entry.count >= limit) {
      return c.json({ status: 'error', message: 'Too many requests' }, 429)
    }

    entry.count++
    await next()
  })
}

/** Standard limits — import and apply per-router as needed. */
export const defaultLimit = rateLimit({ limit: 100, windowSec: 60 })
export const strictLimit = rateLimit({ limit: 10, windowSec: 60 })
export const verifyLimit = rateLimit({ limit: 30, windowSec: 60 })
