import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createServerClient } from '@intrainin/db'
import {
  InitiateCoursePaymentSchema,
  InitiateJobHubCreditsSchema,
  InitiateHireRequestPaymentSchema,
  InitiateEnterprisePaymentSchema,
  ERROR_CODES,
} from '@intrainin/shared'
import { CREDITS_PACKS } from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import { paystackWebhookVerify } from '../../middleware/webhookVerify.js'
import { paystack } from '../../lib/paystack.js'
import type { AuthVariables } from '../../middleware/auth.js'
import type { WebhookVariables } from '../../middleware/webhookVerify.js'

const payments = new Hono<{ Variables: AuthVariables & WebhookVariables }>()

// ─── Pricing helpers ───────────────────────────────────────────────────────────

const ENTERPRISE_MONTHLY_KOBO = {
  starter:  1_500_000,  // ₦15,000
  growth:   4_000_000,  // ₦40,000
  business: 8_000_000,  // ₦80,000
} as const

const ENTERPRISE_DISCOUNTS: Record<number, number> = {
  1:  0,
  3:  0.05,
  6:  0.10,
  12: 0.15,
}

/** ₦3,000/position up to ₦10,000 cap for hire-request payments */
function hireRequestAmountKobo(positionsCount: number): number {
  const perPosition = 300_000  // ₦3,000 in kobo
  const cap         = 1_000_000 // ₦10,000 in kobo
  return Math.min(positionsCount * perPosition, cap)
}

/** Generate a payment-type scoped unique reference */
function makeReference(type: string, ...parts: string[]): string {
  return `IT-${type.toUpperCase()}-${parts.join('-')}-${Date.now()}`
}

/** Resolve or synthesise a Paystack-acceptable email for a user */
function userEmail(rawEmail: string | null | undefined, userId: string): string {
  return rawEmail?.trim() ? rawEmail.trim() : `${userId}@users.intrainin.com`
}

// ─── POST /payments/course/initiate ───────────────────────────────────────────

payments.post(
  '/course/initiate',
  authMiddleware,
  zValidator('json', InitiateCoursePaymentSchema),
  async (c) => {
    const userId    = c.get('userId')
    const { role_id } = c.req.valid('json')
    const db        = createServerClient()
    const appUrl    = process.env.APP_URL ?? 'http://localhost:3000'

    // Validate role exists and has a price
    const { data: role, error: roleErr } = await db
      .from('roles')
      .select('id, title, price_ngn')
      .eq('id', role_id)
      .single()

    if (roleErr || !role) {
      return c.json({ success: false, error: 'Role not found', code: ERROR_CODES.NOT_FOUND }, 404)
    }
    if (!role.price_ngn || role.price_ngn <= 0) {
      return c.json({ success: false, error: 'This course is free — enrol directly.', code: ERROR_CODES.VALIDATION_ERROR }, 400)
    }

    // Check not already enrolled
    const { data: existing } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', role_id)
      .in('status', ['active', 'completed'])
      .maybeSingle()

    if (existing) {
      return c.json({ success: false, error: 'Already enrolled in this course.', code: ERROR_CODES.ALREADY_EXISTS }, 409)
    }

    // Fetch user email for Paystack
    const { data: user } = await db.from('users').select('email').eq('id', userId).single()

    const reference   = makeReference('COURSE', userId.slice(0, 8), role_id.slice(0, 8))
    const amountKobo  = role.price_ngn * 100

    // Initialise Paystack transaction
    let authUrl: string
    try {
      const res = await paystack.initializeTransaction({
        email:        userEmail(user?.email, userId),
        amount:       amountKobo,
        reference,
        callback_url: `${appUrl}/payment/callback`,
        metadata:     { user_id: userId, role_id, payment_type: 'course', role_title: role.title },
      })
      authUrl = res.data.authorization_url
    } catch (err) {
      console.error('[payments/course] Paystack init error:', err)
      return c.json({ success: false, error: 'Payment provider error. Please try again.' }, 502)
    }

    // Persist pending payment record
    const { error: insertErr } = await db.from('payments').insert({
      reference,
      user_id:      userId,
      payment_type: 'course',
      amount_kobo:  amountKobo,
      status:       'pending',
      metadata:     { user_id: userId, role_id, payment_type: 'course' },
    })

    if (insertErr) {
      console.error('[payments/course] DB insert error:', insertErr.message)
      return c.json({ success: false, error: 'Failed to create payment record.' }, 500)
    }

    return c.json({ success: true, data: { authorization_url: authUrl, reference } })
  },
)

// ─── POST /payments/jobhub-credits/initiate ───────────────────────────────────
// Initiate purchase of a Job Hub credits pack (20 / 50 / 100 credits).
// The pack price is resolved server-side from CREDITS_PACKS — the client only
// sends the credit amount it wants; we never trust a price from the client.

payments.post(
  '/jobhub-credits/initiate',
  authMiddleware,
  zValidator('json', InitiateJobHubCreditsSchema),
  async (c) => {
    const userId    = c.get('userId')
    const { credits } = c.req.valid('json')
    const db        = createServerClient()
    const appUrl    = process.env.APP_URL ?? 'http://localhost:3000'

    const pack = CREDITS_PACKS.find(p => p.credits === credits)
    if (!pack) {
      return c.json({ success: false, error: 'Invalid credits pack.', code: ERROR_CODES.VALIDATION_ERROR }, 400)
    }

    const { data: user } = await db.from('users').select('email').eq('id', userId).single()

    const reference  = makeReference('CREDITS', userId.slice(0, 8), String(credits))
    const amountKobo = pack.priceNgn * 100

    let authUrl: string
    try {
      const res = await paystack.initializeTransaction({
        email:        userEmail(user?.email, userId),
        amount:       amountKobo,
        reference,
        callback_url: `${appUrl}/payment/callback`,
        metadata:     { user_id: userId, credits: String(credits), payment_type: 'jobhub_credits' },
      })
      authUrl = res.data.authorization_url
    } catch (err) {
      console.error('[payments/jobhub-credits] Paystack init error:', err)
      return c.json({ success: false, error: 'Payment provider error. Please try again.' }, 502)
    }

    const { error: insertErr } = await db.from('payments').insert({
      reference,
      user_id:      userId,
      payment_type: 'jobhub_credits',
      amount_kobo:  amountKobo,
      status:       'pending',
      metadata:     { user_id: userId, credits: String(credits), payment_type: 'jobhub_credits' },
    })

    if (insertErr) {
      console.error('[payments/jobhub-credits] DB insert error:', insertErr.message)
      return c.json({ success: false, error: 'Failed to create payment record.' }, 500)
    }

    return c.json({ success: true, data: { authorization_url: authUrl, reference } })
  },
)

// ─── POST /payments/hire-request/initiate ─────────────────────────────────────

payments.post(
  '/hire-request/initiate',
  authMiddleware,
  zValidator('json', InitiateHireRequestPaymentSchema),
  async (c) => {
    const userId           = c.get('userId')
    const { hire_request_id } = c.req.valid('json')
    const db               = createServerClient()
    const appUrl           = process.env.APP_URL ?? 'http://localhost:3000'

    // Resolve business_id for this user
    const { data: business } = await db
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle()

    if (!business) {
      return c.json({ success: false, error: 'Business account required.', code: ERROR_CODES.FORBIDDEN }, 403)
    }

    // Validate hire_request belongs to this business and is in draft
    const { data: hireReq } = await db
      .from('hire_requests')
      .select('id, business_id, positions_count, status')
      .eq('id', hire_request_id)
      .maybeSingle()

    if (!hireReq || hireReq.business_id !== business.id) {
      return c.json({ success: false, error: 'Hire request not found.', code: ERROR_CODES.NOT_FOUND }, 404)
    }
    if (hireReq.status !== 'draft') {
      return c.json({ success: false, error: 'Only draft hire requests can be activated via payment.', code: ERROR_CODES.VALIDATION_ERROR }, 400)
    }

    const { data: user } = await db.from('users').select('email').eq('id', userId).single()

    const reference  = makeReference('HIRE', business.id.slice(0, 8), hire_request_id.slice(0, 8))
    const amountKobo = hireRequestAmountKobo(hireReq.positions_count ?? 1)

    let authUrl: string
    try {
      const res = await paystack.initializeTransaction({
        email:        userEmail(user?.email, userId),
        amount:       amountKobo,
        reference,
        callback_url: `${appUrl}/payment/callback`,
        metadata:     { business_id: business.id, hire_request_id, payment_type: 'hire_request' },
      })
      authUrl = res.data.authorization_url
    } catch (err) {
      console.error('[payments/hire-request] Paystack init error:', err)
      return c.json({ success: false, error: 'Payment provider error. Please try again.' }, 502)
    }

    const { error: insertErr } = await db.from('payments').insert({
      reference,
      user_id:      userId,
      business_id:  business.id,
      payment_type: 'hire_request',
      amount_kobo:  amountKobo,
      status:       'pending',
      metadata:     { business_id: business.id, hire_request_id, payment_type: 'hire_request' },
    })

    if (insertErr) {
      console.error('[payments/hire-request] DB insert error:', insertErr.message)
      return c.json({ success: false, error: 'Failed to create payment record.' }, 500)
    }

    return c.json({ success: true, data: { authorization_url: authUrl, reference } })
  },
)

// ─── POST /payments/enterprise/initiate ───────────────────────────────────────

payments.post(
  '/enterprise/initiate',
  authMiddleware,
  zValidator('json', InitiateEnterprisePaymentSchema),
  async (c) => {
    const userId      = c.get('userId')
    const { plan, months } = c.req.valid('json')
    const db          = createServerClient()
    const appUrl      = process.env.APP_URL ?? 'http://localhost:3000'

    const { data: business } = await db
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .maybeSingle()

    if (!business) {
      return c.json({ success: false, error: 'Business account required.', code: ERROR_CODES.FORBIDDEN }, 403)
    }

    const { data: user } = await db.from('users').select('email').eq('id', userId).single()

    const monthlyKobo    = ENTERPRISE_MONTHLY_KOBO[plan]
    const discount       = ENTERPRISE_DISCOUNTS[months] ?? 0
    const grossKobo      = monthlyKobo * months
    const discountAmount = Math.floor(grossKobo * discount)
    const totalKobo      = grossKobo - discountAmount

    const reference = makeReference('ENT', business.id.slice(0, 8), plan, String(months))

    let authUrl: string
    try {
      const res = await paystack.initializeTransaction({
        email:        userEmail(user?.email, userId),
        amount:       totalKobo,
        reference,
        callback_url: `${appUrl}/payment/callback`,
        metadata:     { business_id: business.id, plan, months, payment_type: 'enterprise', discount_applied: discount },
      })
      authUrl = res.data.authorization_url
    } catch (err) {
      console.error('[payments/enterprise] Paystack init error:', err)
      return c.json({ success: false, error: 'Payment provider error. Please try again.' }, 502)
    }

    const { error: insertErr } = await db.from('payments').insert({
      reference,
      user_id:      userId,
      business_id:  business.id,
      payment_type: 'enterprise',
      amount_kobo:  totalKobo,
      status:       'pending',
      metadata:     { business_id: business.id, plan, months, payment_type: 'enterprise' },
    })

    if (insertErr) {
      console.error('[payments/enterprise] DB insert error:', insertErr.message)
      return c.json({ success: false, error: 'Failed to create payment record.' }, 500)
    }

    return c.json({
      success: true,
      data: {
        authorization_url: authUrl,
        reference,
        total_amount:     totalKobo,
        discount_applied: discount,
      },
    })
  },
)

// ─── POST /payments/webhook ────────────────────────────────────────────────────
// Public — no auth, but HMAC-verified by paystackWebhookVerify middleware.

payments.post('/webhook', paystackWebhookVerify, async (c) => {
  const rawBody = c.get('rawBody')
  const db      = createServerClient()

  let event: { event: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { event: eventType, data } = event

  // ── charge.success ───────────────────────────────────────────────────────────
  if (eventType === 'charge.success') {
    const reference = data.reference as string
    const paidKobo  = data.amount as number

    // Fetch pending payment record
    const { data: payment, error: payErr } = await db
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .maybeSingle()

    if (payErr || !payment) {
      // Unknown reference — could be a test/duplicate; acknowledge and ignore
      console.warn('[webhook] charge.success for unknown reference:', reference)
      return c.json({ received: true })
    }

    if (payment.status === 'completed') {
      // Idempotency: already processed
      return c.json({ received: true })
    }

    // Guard against amount tampering
    if (paidKobo < payment.amount_kobo) {
      console.error(`[webhook] amount mismatch for ${reference}: expected ${payment.amount_kobo}, got ${paidKobo}`)
      await db.from('payments').update({ status: 'failed', paystack_response: data }).eq('reference', reference)
      return c.json({ received: true })
    }

    // Mark completed
    await db
      .from('payments')
      .update({ status: 'completed', completed_at: new Date().toISOString(), paystack_response: data })
      .eq('reference', reference)

    const meta = payment.metadata as Record<string, string>

    // ── Fulfil based on payment type ──────────────────────────────────────────
    if (meta.payment_type === 'course') {
      const { user_id, role_id } = meta
      const { error: enrolErr } = await db.from('enrollments').upsert(
        {
          user_id,
          role_id,
          status:            'active',
          payment_type:      'individual',
          payment_reference: reference,
          enrolled_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id,role_id', ignoreDuplicates: true },
      )
      if (enrolErr) console.error('[webhook] enrolment upsert error:', enrolErr.message)

    } else if (meta.payment_type === 'jobhub_credits') {
      // Top up the job_hub_credits ledger — use same idempotency key as manual purchase
      const { user_id, credits: creditsStr } = meta
      const credits = Number(creditsStr)

      const pack = CREDITS_PACKS.find(p => p.credits === credits)
      if (!pack) {
        console.error(`[webhook] unknown credits pack size ${credits} for reference ${reference}`)
      } else {
        // Guard against duplicate webhook delivery
        const { data: dup } = await db
          .from('job_hub_credits')
          .select('id')
          .eq('reference', reference)
          .maybeSingle()

        if (!dup) {
          const { error: credErr } = await db
            .from('job_hub_credits')
            .insert({ user_id, amount: pack.credits, reason: 'purchase', reference })
          if (credErr) console.error('[webhook] job_hub_credits insert error:', credErr.message)
        }
      }

    } else if (meta.payment_type === 'hire_request') {
      const { hire_request_id } = meta
      const { error: hrErr } = await db
        .from('hire_requests')
        .update({ status: 'open', payment_reference: reference })
        .eq('id', hire_request_id)
        .eq('status', 'draft') // only move draft → open
      if (hrErr) console.error('[webhook] hire_request update error:', hrErr.message)

    } else if (meta.payment_type === 'enterprise') {
      const { business_id, plan, months: monthsStr } = meta
      const months = Number(monthsStr) || 1
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + months)

      const seatMap: Record<string, number> = { starter: 10, growth: 30, business: 100 }
      const { error: bizErr } = await db
        .from('businesses')
        .update({
          subscription_plan:       plan,
          subscription_expires_at: expiry.toISOString(),
          seat_limit:              seatMap[plan] ?? 10,
        })
        .eq('id', business_id)
      if (bizErr) console.error('[webhook] business update error:', bizErr.message)
    }

    return c.json({ received: true })
  }

  // ── charge.failed ────────────────────────────────────────────────────────────
  if (eventType === 'charge.failed') {
    const reference = data.reference as string
    await db
      .from('payments')
      .update({ status: 'failed', paystack_response: data })
      .eq('reference', reference)
    return c.json({ received: true })
  }

  // All other events acknowledged but not acted on
  return c.json({ received: true })
})

// ─── GET /payments/status/:reference ──────────────────────────────────────────
// Auth required — users can only check their own payments.

payments.get('/status/:reference', authMiddleware, async (c) => {
  const userId    = c.get('userId')
  const reference = c.req.param('reference')
  const db        = createServerClient()

  const { data: payment, error } = await db
    .from('payments')
    .select('status, payment_type, metadata')
    .eq('reference', reference)
    .eq('user_id', userId)  // RLS belt-and-suspenders
    .maybeSingle()

  if (error || !payment) {
    return c.json({ success: false, error: 'Payment not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  // Determine redirect target based on payment type
  let redirectTo: string | undefined
  if (payment.status === 'completed') {
    const meta = payment.metadata as Record<string, string>
    if (meta.payment_type === 'course')               redirectTo = '/dashboard'
    else if (meta.payment_type === 'jobhub_subscription') redirectTo = '/jobs'
    else if (meta.payment_type === 'hire_request')    redirectTo = '/admin/jobs'
    else if (meta.payment_type === 'enterprise')      redirectTo = '/admin'
    else                                               redirectTo = '/dashboard'
  }

  return c.json({
    success: true,
    data: {
      status:      payment.status,
      redirect_to: redirectTo,
    },
  })
})

export { payments as paymentsRouter }
