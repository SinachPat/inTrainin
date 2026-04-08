import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createServerClient } from '@intrainin/db'
import { InviteMemberSchema, ERROR_CODES } from '@intrainin/shared'
import { authMiddleware, requireRole } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const business = new Hono<{ Variables: AuthVariables }>()

// ─── GET /business/profile ────────────────────────────────────────────────────
// Protected (business) — retrieve the business profile.

business.get('/profile', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: profile, error } = await db
    .from('businesses')
    .select('*')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (error) return c.json({ success: false, error: error.message }, 500)

  if (!profile) {
    return c.json(
      { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  return c.json({ success: true, data: { profile } })
})

// ─── PUT /business/profile ────────────────────────────────────────────────────
// Protected (business) — update business profile fields.

business.put('/profile', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const allowedFields = ['name', 'category', 'size_range', 'location_city', 'location_state']
  const update: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) update[field] = body[field]
  }

  const { data: profile, error } = await db
    .from('businesses')
    .update(update)
    .eq('owner_user_id', userId)
    .select()
    .single()

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { profile } })
})

// ─── GET /business/members ────────────────────────────────────────────────────
// Protected (business) — list all team members.

business.get('/members', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: biz } = await db
    .from('businesses')
    .select('id, seat_limit')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json(
      { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const { data: members, error } = await db
    .from('business_members')
    .select(`
      id, status, job_title, invited_at, joined_at, invited_phone, invited_email,
      users ( id, full_name, phone ),
      roles ( id, slug, title )
    `)
    .eq('business_id', biz.id)
    .order('invited_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({
    success: true,
    data: {
      members:   members ?? [],
      seatLimit: biz.seat_limit,
      seatUsed:  (members ?? []).filter(m => m.status !== 'removed').length,
    },
  })
})

// ─── POST /business/members/invite ───────────────────────────────────────────
// Protected (business) — invite a new team member by phone number.

business.post(
  '/members/invite',
  authMiddleware,
  requireRole('business'),
  zValidator('json', InviteMemberSchema),
  async (c) => {
    const userId = c.get('userId')
    const input  = c.req.valid('json')
    const db     = createServerClient()

    const { data: biz } = await db
      .from('businesses')
      .select('id, seat_limit')
      .eq('owner_user_id', userId)
      .maybeSingle()

    if (!biz) {
      return c.json(
        { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    // Enforce seat limit
    const { count: activeCount } = await db
      .from('business_members')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', biz.id)
      .neq('status', 'removed')

    if ((activeCount ?? 0) >= biz.seat_limit) {
      return c.json(
        { success: false, error: 'Seat limit reached', code: ERROR_CODES.SEAT_LIMIT_REACHED },
        402,
      )
    }

    // Check if this phone is already an active member
    const { data: existing } = await db
      .from('business_members')
      .select('id, status')
      .eq('business_id', biz.id)
      .eq('invited_phone', input.phone)
      .maybeSingle()

    if (existing && existing.status !== 'removed') {
      return c.json(
        { success: false, error: 'Member with this phone already exists', code: ERROR_CODES.VALIDATION_ERROR },
        409,
      )
    }

    // Look up existing user by phone
    const { data: existingUser } = await db
      .from('users')
      .select('id')
      .eq('phone', input.phone)
      .maybeSingle()

    const { data: member, error } = await db
      .from('business_members')
      .insert({
        business_id:      biz.id,
        user_id:          existingUser?.id ?? null,
        invited_phone:    input.phone,
        job_title:        input.jobTitle,
        assigned_role_id: input.assignedRoleId ?? null,
        status:           existingUser ? 'active' : 'invited',
      })
      .select()
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    // TODO Layer 8: send invite SMS via Termii if user doesn't exist yet

    return c.json({ success: true, data: { member } }, 201)
  },
)

// ─── DELETE /business/members/:id ────────────────────────────────────────────
// Protected (business) — revoke a member's access.

business.delete('/members/:id', authMiddleware, requireRole('business'), async (c) => {
  const memberId = c.req.param('id')
  const userId   = c.get('userId')
  const db       = createServerClient()

  const { data: biz } = await db
    .from('businesses')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json(
      { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const { error } = await db
    .from('business_members')
    .update({ status: 'removed' })
    .eq('id', memberId)
    .eq('business_id', biz.id)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true })
})

// ─── GET /business/progress ───────────────────────────────────────────────────
// Protected (business) — team-wide learning progress summary.

business.get('/progress', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: biz } = await db
    .from('businesses')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json(
      { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const { data: members } = await db
    .from('business_members')
    .select('user_id, users ( id, full_name ), roles ( id, slug, title )')
    .eq('business_id', biz.id)
    .eq('status', 'active')
    .not('user_id', 'is', null)

  if (!members || members.length === 0) {
    return c.json({ success: true, data: { progress: [] } })
  }

  const userIds = (members.map(m => m.user_id).filter(Boolean)) as string[]

  // Fetch completed topic counts per user in one query
  const { data: completions } = await db
    .from('topic_progress')
    .select('user_id')
    .in('user_id', userIds)
    .eq('status', 'completed')

  const completionsByUser = (completions ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.user_id] = (acc[row.user_id] ?? 0) + 1
    return acc
  }, {})

  const progress = members.map(m => ({
    member:          m.users,
    assignedRole:    m.roles,
    completedTopics: m.user_id ? (completionsByUser[m.user_id] ?? 0) : 0,
  }))

  return c.json({ success: true, data: { progress } })
})

// ─── POST /business/assignments ────────────────────────────────────────────────
// Protected (business) — assign a role to a member.

business.post('/assignments', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  let body: { memberId?: string; roleId?: string }
  try { body = await c.req.json() } catch { body = {} }

  if (!body.memberId || !body.roleId) {
    return c.json({ success: false, error: 'memberId and roleId are required' }, 400)
  }

  const { data: biz } = await db
    .from('businesses')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json(
      { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const { error } = await db
    .from('business_members')
    .update({ assigned_role_id: body.roleId })
    .eq('id', body.memberId)
    .eq('business_id', biz.id)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true })
})

// ─── GET /business/assignments ────────────────────────────────────────────────
// Protected (business) — list all role assignments.
// Returns the same as /members but filtered to those with an assigned role.

business.get('/assignments', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: biz } = await db
    .from('businesses')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json({ success: true, data: { assignments: [] } })
  }

  const { data: assignments, error } = await db
    .from('business_members')
    .select(`
      id, job_title, status,
      users ( id, full_name ),
      roles ( id, slug, title )
    `)
    .eq('business_id', biz.id)
    .not('assigned_role_id', 'is', null)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { assignments: assignments ?? [] } })
})

// ─── GET /business/subscription ───────────────────────────────────────────────
// Protected (business) — current subscription status.

business.get('/subscription', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: biz, error } = await db
    .from('businesses')
    .select('subscription_plan, subscription_starts_at, subscription_expires_at, seat_limit, payment_reference')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (error) return c.json({ success: false, error: error.message }, 500)

  if (!biz) {
    return c.json(
      { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const now    = new Date()
  const active = biz.subscription_expires_at
    ? new Date(biz.subscription_expires_at) > now
    : false

  return c.json({
    success: true,
    data: {
      plan:       biz.subscription_plan,
      startsAt:   biz.subscription_starts_at,
      expiresAt:  biz.subscription_expires_at,
      isActive:   active,
      seatLimit:  biz.seat_limit,
    },
  })
})

// ─── POST /business/subscribe ──────────────────────────────────────────────────
// Protected (business) — activate a subscription after payment.
// TODO Layer 8: verify Paystack payment reference before activating.

business.post('/subscribe', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  let body: { plan?: string; paymentReference?: string; seats?: number }
  try { body = await c.req.json() } catch { body = {} }

  if (!body.plan || !body.paymentReference) {
    return c.json({ success: false, error: 'plan and paymentReference are required' }, 400)
  }

  const seatsByPlan: Record<string, number> = {
    starter:         10,
    growth:          30,
    business:        50,
    enterprise_plus: 200,
  }

  const seatLimit = seatsByPlan[body.plan] ?? 10
  const now       = new Date()
  const expiresAt = new Date(now)
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { data: biz, error } = await db
    .from('businesses')
    .update({
      subscription_plan:       body.plan as 'starter' | 'growth' | 'business' | 'enterprise_plus',
      subscription_starts_at:  now.toISOString(),
      subscription_expires_at: expiresAt.toISOString(),
      seat_limit:              body.seats ?? seatLimit,
      payment_reference:       body.paymentReference,
    })
    .eq('owner_user_id', userId)
    .select('id, subscription_plan, subscription_expires_at, seat_limit')
    .single()

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { subscription: biz } })
})

export { business as businessRouter }
