import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createServerClient } from '@intrainin/db'
import { UpdateNotificationPrefsSchema, ERROR_CODES, BUSINESS_PLANS, CREDITS_PACKS } from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import { paystackWebhookVerify } from '../../middleware/webhookVerify.js'
import type { AuthVariables } from '../../middleware/auth.js'
import type { WebhookVariables } from '../../middleware/webhookVerify.js'

const notifications = new Hono<{ Variables: AuthVariables }>()

// ─── POST /notifications/devices ──────────────────────────────────────────────
// Protected — register a FCM device token for push notifications.

notifications.post(
  '/devices',
  authMiddleware,
  zValidator('json', z.object({ token: z.string().min(1) })),
  async (c) => {
    const userId = c.get('userId')
    const { token } = c.req.valid('json')
    const db     = createServerClient()

    const { error } = await db
      .from('users')
      .update({ fcm_token: token })
      .eq('id', userId)

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true })
  },
)

// ─── DELETE /notifications/devices/:token ────────────────────────────────────
// Protected — remove a FCM device token (on logout / permission revoked).

notifications.delete('/devices/:token', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const token  = c.req.param('token')
  const db     = createServerClient()

  // Only clear if the token matches what's stored — prevents clearing another user's token
  const { error } = await db
    .from('users')
    .update({ fcm_token: null })
    .eq('id', userId)
    .eq('fcm_token', token)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true })
})

// ─── GET /notifications/preferences ──────────────────────────────────────────
// Protected — get the user's notification preferences.

notifications.get('/preferences', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: user, error } = await db
    .from('users')
    .select('notification_prefs')
    .eq('id', userId)
    .single()

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { preferences: user.notification_prefs ?? null } })
})

// ─── PUT /notifications/preferences ──────────────────────────────────────────
// Protected — update notification preferences (merged, not replaced).

notifications.put(
  '/preferences',
  authMiddleware,
  zValidator('json', UpdateNotificationPrefsSchema),
  async (c) => {
    const userId = c.get('userId')
    const prefs  = c.req.valid('json')
    const db     = createServerClient()

    const { data: user, error: fetchError } = await db
      .from('users')
      .select('notification_prefs')
      .eq('id', userId)
      .single()

    if (fetchError) return c.json({ success: false, error: fetchError.message }, 500)

    // Deep-merge with existing preferences so partial updates work
    const existing = user.notification_prefs ?? {}
    const merged   = { ...existing, ...prefs }

    const { error } = await db
      .from('users')
      .update({ notification_prefs: merged })
      .eq('id', userId)

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { preferences: merged } })
  },
)

// ─── GET /notifications ────────────────────────────────────────────────────────
// Protected — paginated in-app notifications for the user.

notifications.get('/', authMiddleware, async (c) => {
  const userId  = c.get('userId')
  const db      = createServerClient()
  const unreadOnly = c.req.query('unread') === 'true'

  let query = db
    .from('notifications')
    .select('id, type, title, body, data, is_read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { notifications: data ?? [] } })
})

// ─── POST /notifications/read ─────────────────────────────────────────────────
// Protected — mark one or all notifications as read.

notifications.post(
  '/read',
  authMiddleware,
  zValidator('json', z.object({ ids: z.array(z.string()).optional() })),
  async (c) => {
    const userId = c.get('userId')
    const { ids } = c.req.valid('json')
    const db     = createServerClient()

    let query = db
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)

    if (ids && ids.length > 0) {
      query = query.in('id', ids)
    }

    const { error } = await query

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true })
  },
)

// ─── POST /notifications/webhooks/paystack ────────────────────────────────────
// Public (HMAC-verified) — Paystack payment event webhook.
// Handles charge.success events to activate enrolments / subscriptions.

const webhookApp = new Hono<{ Variables: AuthVariables & WebhookVariables }>()

webhookApp.post(
  '/paystack',
  paystackWebhookVerify,
  async (c) => {
    const rawBody = c.get('rawBody')

    let event: { event: string; data: Record<string, unknown> }
    try {
      event = JSON.parse(rawBody)
    } catch {
      return c.json({ success: false, error: 'Invalid JSON body' }, 400)
    }

    // Only handle charge.success — other events are ignored (200 to acknowledge)
    if (event.event !== 'charge.success') {
      return c.json({ success: true, data: { received: true } })
    }

    const reference  = event.data?.reference as string | undefined
    const amountKobo = event.data?.amount    as number | undefined

    if (!reference) {
      return c.json({ success: false, error: 'Missing payment reference' }, 400)
    }

    const db = createServerClient()

    // Metadata is set by the client when initialising the Paystack transaction.
    // Shape: { type: 'enrollment'|'subscription'|'credits', user_id: string,
    //          role_id?: string (enrollment), plan?: string (subscription) }
    const metadata = event.data?.metadata as {
      type?:    string
      user_id?: string
      role_id?: string
      plan?:    string
    } | undefined

    const paymentType = metadata?.type

    // Derive the authoritative user ID from the Paystack customer email.
    // All InTrainin payments use {userId}@users.intrainin.com as the email so
    // we can extract the real payer's ID from the webhook payload itself, which
    // cannot be forged by client-side metadata. If the email doesn't match our
    // pattern we fall back to metadata.user_id (e.g. legacy or business payments).
    const customerEmail = event.data?.customer as { email?: string } | undefined
    const emailParts    = customerEmail?.email?.match(/^([^@]+)@users\.intrainin\.com$/)
    const verifiedUserId = emailParts ? emailParts[1] : metadata?.user_id

    // ── Enrollment activation ────────────────────────────────────────────────
    if (!paymentType || paymentType === 'enrollment') {
      const { data: enrollment } = await db
        .from('enrollments')
        .select('id, status')
        .eq('payment_reference', reference)
        .maybeSingle()

      if (enrollment && enrollment.status !== 'active') {
        await db
          .from('enrollments')
          .update({ status: 'active' })
          .eq('id', enrollment.id)
          .then(({ error: e }) => {
            if (e) console.error('[webhook] enrollment activate error:', e.message)
          })
      }
    }

    // ── Business subscription activation ─────────────────────────────────────
    if (paymentType === 'subscription' && verifiedUserId && metadata?.plan) {
      const planInfo = BUSINESS_PLANS.find(p => p.key === metadata.plan)
      const amountNgn = amountKobo != null ? amountKobo / 100 : null

      if (planInfo && planInfo.priceNgn > 0 && amountNgn === planInfo.priceNgn) {
        const now       = new Date()
        const expiresAt = new Date(now)
        expiresAt.setFullYear(expiresAt.getFullYear() + 1)

        // Only activate if not already activated (payment_reference not yet set)
        await db
          .from('businesses')
          .update({
            subscription_plan:       planInfo.key,
            subscription_starts_at:  now.toISOString(),
            subscription_expires_at: expiresAt.toISOString(),
            seat_limit:              planInfo.seats as number,
            payment_reference:       reference,
          })
          .eq('owner_user_id', verifiedUserId)
          .is('payment_reference', null)
          .then(({ error: e }) => {
            if (e) console.error('[webhook] subscription activate error:', e.message)
          })
      }
    }

    // ── Credits purchase ──────────────────────────────────────────────────────
    if (paymentType === 'credits' && verifiedUserId && amountKobo != null) {
      const amountNgn = amountKobo / 100
      const pack = CREDITS_PACKS.find(p => p.priceNgn === amountNgn)

      if (pack) {
        // Idempotent — skip if credits already granted for this reference
        const { data: existing } = await db
          .from('job_hub_credits')
          .select('id')
          .eq('user_id', verifiedUserId)
          .eq('reference', reference)
          .eq('reason', 'purchase')
          .maybeSingle()

        if (!existing) {
          await db
            .from('job_hub_credits')
            .insert({ user_id: verifiedUserId, amount: pack.credits, reason: 'purchase', reference })
            .then(({ error: e }) => {
              if (e) console.error('[webhook] credits insert error:', e.message)
            })
        }
      }
    }

    return c.json({ success: true, data: { received: true } })
  },
)

// Mount the webhook sub-router under /webhooks
notifications.route('/webhooks', webhookApp)

export { notifications as notificationsRouter }
