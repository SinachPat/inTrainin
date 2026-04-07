import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Context, MiddlewareHandler, Next } from 'hono'
import { createMiddleware } from 'hono/factory'

/**
 * Paystack HMAC webhook verification.
 * Validates the x-paystack-signature header against the raw request body.
 * Must be applied BEFORE body parsing on the /webhooks/paystack route.
 */
export const paystackWebhookVerify: MiddlewareHandler = createMiddleware(
  async (c: Context, next: Next) => {
    const signature = c.req.header('x-paystack-signature')
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET

    if (!secret) {
      console.error('PAYSTACK_WEBHOOK_SECRET is not set')
      return c.json({ status: 'error', message: 'Webhook secret not configured' }, 500)
    }

    if (!signature) {
      return c.json({ status: 'error', message: 'Missing webhook signature' }, 400)
    }

    const rawBody = await c.req.text()
    const expected = createHmac('sha512', secret).update(rawBody).digest('hex')

    const sigBuffer = Buffer.from(signature, 'hex')
    const expBuffer = Buffer.from(expected, 'hex')

    if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
      return c.json({ status: 'error', message: 'Invalid webhook signature' }, 401)
    }

    // Re-attach body for downstream handlers
    c.set('rawBody' as never, rawBody)
    await next()
  },
)
