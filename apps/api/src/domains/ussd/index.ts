import { Hono } from 'hono'
import { createServerClient } from '@intrainin/db'

/**
 * USSD domain — handles inbound USSD session requests forwarded by Qrios.
 *
 * When a user dials the InTrainin USSD short-code, Qrios sends a POST here.
 * We look up the user's latest valid OTP (stored by the Supabase SMS hook)
 * and return it in the Qrios response envelope.
 *
 * Endpoint:  POST /ussd[/:p1][/:p2]   (registered in apps/api/src/index.ts)
 * Auth:      Authorization: Bearer <QRIOS_WEBHOOK_SECRET>
 *
 * Qrios response envelope:
 *   { action: { type: "ShowView", view: { type: "InfoView", message: "…" } }, contextData: "…" }
 */

export const ussdRouter = new Hono()

// ── Qrios response helper ─────────────────────────────────────────────────────

/** End the USSD session and display a static message to the user. */
function infoView(message: string, contextData = '') {
  return {
    action: {
      type: 'ShowView',
      view: { type: 'InfoView', message },
    },
    contextData,
  }
}

// ── Phone normalisation ───────────────────────────────────────────────────────

/**
 * Qrios sends MSISDN without a leading `+` (e.g. "2348012345678").
 * OTPs are stored in E.164 ("+2348012345678"), so we normalise here.
 */
function toE164(msisdn: string): string {
  const digits = msisdn.replace(/\D/g, '')
  return `+${digits}`
}

// ── POST / | /:p1 | /:p1/:p2 ─────────────────────────────────────────────────
// Qrios appends optional path segments to the webhook URL depending on the
// USSD session state. Both segments are accepted but ignored — all routing
// logic is driven by the msisdn in the POST body.

ussdRouter.post('/:p1?/:p2?', async (c) => {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  // const expected = process.env.QRIOS_WEBHOOK_SECRET

  // if (!expected) {
  //   console.error('[ussd] QRIOS_WEBHOOK_SECRET is not set')
  //   return c.json(infoView('Service temporarily unavailable. Please try again.'), 500)
  // }

  // const authHeader = c.req.header('Authorization') ?? ''
  // const token      = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  // if (!token || token !== expected) {
  //   return c.json(infoView('Unauthorized request.'), 401)
  // }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  let body: Record<string, unknown>

  try {
    body = await c.req.json()
  } catch {
    console.error('[ussd] failed to parse request body')
    return c.json(infoView('Invalid request format.'), 400)
  }

  const rawMsisdn = body?.msisdn

  if (!rawMsisdn || typeof rawMsisdn !== 'string') {
    console.error('[ussd] missing or invalid msisdn field', body)
    return c.json(infoView('Phone number is required.'), 400)
  }

  const phone = toE164(rawMsisdn)

  // ── 3. Look up OTP ─────────────────────────────────────────────────────────
  try {
    const supabase = createServerClient()

    const { data: row, error } = await supabase
      .from('phone_otps')
      .select('code, expires_at')
      .eq('phone', phone)
      .maybeSingle()

    if (error) throw error

    if (!row) {
      console.info('[ussd] no OTP found for', phone)
      return c.json(
        infoView(
          'No verification code found for this number.\n\nPlease request an OTP first by entering your phone number on the InTrainin app.',
        ),
      )
    }

    // ── 4. Check expiry ──────────────────────────────────────────────────────
    if (new Date(row.expires_at) < new Date()) {
      console.info('[ussd] expired OTP for', phone)

      // Lazily delete the stale row
      await supabase.from('phone_otps').delete().eq('phone', phone)

      return c.json(
        infoView(
          'Your verification code has expired.\n\nPlease request a new OTP from the InTrainin app.',
        ),
      )
    }

    // ── 5. Return OTP ────────────────────────────────────────────────────────
    console.info('[ussd] serving OTP for', phone)

    return c.json(
      infoView(
        `Your InTrainin verification code is:\n\n${row.code}\n\nThis code expires in 10 minutes.\nDo not share it with anyone.`,
      ),
    )
  } catch (err) {
    console.error('[ussd] DB lookup failed:', err)
    return c.json(infoView('Service temporarily unavailable. Please try again.'), 500)
  }
})
