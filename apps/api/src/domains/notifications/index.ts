import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createServerClient } from '@intrainin/db'
import { UpdateNotificationPrefsSchema, ERROR_CODES } from '@intrainin/shared'
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

    const reference = event.data?.reference as string | undefined

    if (!reference) {
      return c.json({ success: false, error: 'Missing payment reference' }, 400)
    }

    const db = createServerClient()

    // Check enrollments first, then business subscriptions
    const { data: enrollment } = await db
      .from('enrollments')
      .select('id, user_id, role_id, status')
      .eq('payment_reference', reference)
      .maybeSingle()

    if (enrollment && enrollment.status !== 'active') {
      await db
        .from('enrollments')
        .update({ status: 'active' })
        .eq('id', enrollment.id)
    }

    // Log the raw event for auditing — best effort, don't fail the webhook
    // TODO Layer 8: also update business subscription on plan payment events

    return c.json({ success: true, data: { received: true } })
  },
)

// Mount the webhook sub-router under /webhooks
notifications.route('/webhooks', webhookApp)

export { notifications as notificationsRouter }
