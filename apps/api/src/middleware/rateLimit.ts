import type { Context, MiddlewareHandler, Next } from 'hono'
import { createMiddleware } from 'hono/factory'

interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit: number
  /** Window duration in seconds. */
  windowSec: number
}

/** How often to sweep expired entries from the store (ms). */
const SWEEP_INTERVAL_MS = 60_000

/**
 * In-memory rate limiter (dev/test). Replace with Redis-backed limiter in production.
 * TODO Layer 5: implement with Upstash Redis rate limiting.
 *
 * Key resolution order:
 *   1. cf-connecting-ip  — set by Cloudflare, cannot be spoofed
 *   2. x-forwarded-for   — only the LAST (rightmost) value is taken, which is
 *                          the address added by the first trusted proxy; earlier
 *                          hops in the header can be forged by the client.
 *   3. Reject with 400   — no identifiable source IP means we cannot rate-limit
 *                          safely, so we refuse rather than bucket under 'unknown'.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const { limit, windowSec } = options
  const store = new Map<string, { count: number; resetAt: number }>()

  // Periodically purge expired entries to prevent unbounded memory growth.
  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, SWEEP_INTERVAL_MS)
  // Allow Node to exit even if this interval is still pending.
  if (sweep.unref) sweep.unref()

  return createMiddleware(async (c: Context, next: Next) => {
    // cf-connecting-ip is injected by Cloudflare and is always the true client IP.
    // x-forwarded-for may contain a comma-separated chain; we take only the last
    // entry (appended by our own trusted reverse proxy) to prevent spoofing.
    const cfIp  = c.req.header('cf-connecting-ip')
    const xffRaw = c.req.header('x-forwarded-for')
    const xffLast = xffRaw
      ? xffRaw.split(',').at(-1)?.trim()
      : undefined

    const key = cfIp ?? xffLast

    if (!key) {
      return c.json({ success: false, error: 'Unable to identify request origin' }, 400)
    }

    const now   = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowSec * 1000 })
      await next()
      return
    }

    if (entry.count >= limit) {
      return c.json({ success: false, error: 'Too many requests' }, 429)
    }

    entry.count++
    await next()
  })
}

/** Standard limits — import and apply per-router as needed. */
export const defaultLimit = rateLimit({ limit: 100, windowSec: 60 })
export const strictLimit = rateLimit({ limit: 10, windowSec: 60 })
export const verifyLimit = rateLimit({ limit: 30, windowSec: 60 })
