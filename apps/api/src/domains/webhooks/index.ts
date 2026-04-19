import { Hono } from 'hono'
import { createServerClient } from '@intrainin/db'

/**
 * Webhooks domain — inbound callbacks from trusted external services.
 *
 * Routes:
 *   POST /webhooks/supabase/sms  — Supabase "Send SMS" auth hook
 *
 * Authentication:
 *   Every route validates `Authorization: Bearer <secret>` against an env var
 *   before touching any business logic.
 */

export const webhooksRouter = new Hono()

// ── POST /webhooks/supabase/sms ───────────────────────────────────────────────

/**
 * Supabase "Send SMS" auth hook.
 *
 * Supabase calls this endpoint instead of sending an SMS when a user requests
 * an OTP. We capture the raw code and upsert it into `phone_otps` so the
 * USSD handler at POST /ussd can serve it when the user dials in via Qrios.
 *
 * Supabase hook payload:
 *   { "user": { "phone": "+2348012345678", … }, "sms": { "otp": "123456" } }
 *
 * Expected response: `{}` with HTTP 200 — Supabase treats any non-2xx as a
 * failure and will block the sign-in attempt.
 *
 * Docs: https://supabase.com/docs/guides/auth/auth-hooks#send-sms-hook
 */
webhooksRouter.post('/supabase/sms', async (c) => {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const expected = process.env.SUPABASE_SMS_HOOK_SECRET

  if (!expected) {
    console.error('[webhooks/supabase/sms] SUPABASE_SMS_HOOK_SECRET is not set')
    // Return 200 to avoid blocking Supabase auth; the OTP just won't be stored
    return c.json({})
  }

  const authHeader = c.req.header('Authorization') ?? ''
  const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token || token !== expected) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let body: { user?: { phone?: string }; sms?: { otp?: string } }

  try {
    body = await c.req.json()
  } catch {
    console.error('[webhooks/supabase/sms] failed to parse request body')
    return c.json({}) // soft-fail: don't block auth
  }

  const phone = body?.user?.phone
  const otp   = body?.sms?.otp

  if (!phone || !otp) {
    console.error('[webhooks/supabase/sms] missing phone or otp', { phone: !!phone, otp: !!otp })
    return c.json({})
  }

  // Normalise to E.164 — Supabase always sends E.164 but be defensive
  const normalised = phone.startsWith('+') ? phone : `+${phone}`

  // OTP expires in 10 minutes (Supabase default OTP TTL)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // ── 3. Upsert OTP ──────────────────────────────────────────────────────────
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from('phone_otps')
      .upsert(
        { phone: normalised, code: otp, expires_at: expiresAt, created_at: new Date().toISOString() },
        { onConflict: 'phone' },
      )

    if (error) throw error

    console.info('[webhooks/supabase/sms] OTP stored for', normalised)
  } catch (err) {
    // Log but still return 200 to not block Supabase auth flow
    console.error('[webhooks/supabase/sms] DB upsert failed:', err)
  }

  return c.json({})
})
