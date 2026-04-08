import { createHmac, timingSafeEqual } from 'node:crypto'
import { createMiddleware } from 'hono/factory'
import type { MiddlewareHandler } from 'hono'

/** Context variables set by paystackWebhookVerify for downstream handlers. */
export type WebhookVariables = {
  rawBody: string
}

/**
 * Paystack HMAC webhook verification middleware.
 * Validates the x-paystack-signature header against the raw request body using
 * a timing-safe comparison to prevent timing attacks.
 *
 * Must be applied BEFORE any body-parsing middleware on the /webhooks/paystack route.
 * Downstream handlers access the verified body via: c.get('rawBody')
 */
export const paystackWebhookVerify: MiddlewareHandler<{ Variables: WebhookVariables }> =
  createMiddleware(async (c, next) => {
    const signature = c.req.header('x-paystack-signature')
    const secret    = process.env.PAYSTACK_WEBHOOK_SECRET

    if (!secret) {
      console.error('PAYSTACK_WEBHOOK_SECRET is not set')
      return c.json({ success: false, error: 'Webhook secret not configured' }, 500)
    }

    if (!signature) {
      return c.json({ success: false, error: 'Missing webhook signature' }, 400)
    }

    const rawBody  = await c.req.text()
    const expected = createHmac('sha512', secret).update(rawBody).digest('hex')

    // Paystack sends the signature as a hex string — both buffers must be equal length
    // before timingSafeEqual can compare them (otherwise it throws)
    const sigBuffer = Buffer.from(signature, 'hex')
    const expBuffer = Buffer.from(expected,  'hex')

    if (sigBuffer.length !== expBuffer.length || !timingSafeEqual(sigBuffer, expBuffer)) {
      return c.json({ success: false, error: 'Invalid webhook signature' }, 401)
    }

    c.set('rawBody', rawBody)
    await next()
  })
