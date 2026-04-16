import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createServerClient } from '@intrainin/db'
import { InviteMemberSchema, ERROR_CODES, BUSINESS_PLANS } from '@intrainin/shared'
import { authMiddleware, requireRole } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'
import { paystack } from '../../lib/paystack.js'
import type { PaystackVerifyData } from '../../lib/paystack.js'

const UpdateBusinessProfileSchema = z.object({
  name:           z.string().min(1, 'Name cannot be empty').max(200).optional(),
  category:       z.string().max(100).optional(),
  size_range:     z.string().max(50).optional(),
  location_city:  z.string().max(100).optional(),
  location_state: z.string().max(100).optional(),
})

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

business.put(
  '/profile',
  authMiddleware,
  requireRole('business'),
  zValidator('json', UpdateBusinessProfileSchema),
  async (c) => {
    const userId = c.get('userId')
    const input  = c.req.valid('json')
    const db     = createServerClient()

    // Only include keys that were explicitly provided — no accidental nulling of
    // fields the caller didn't mention.
    const update: Record<string, unknown> = {}
    if (input.name           !== undefined) update.name           = input.name
    if (input.category       !== undefined) update.category       = input.category
    if (input.size_range     !== undefined) update.size_range     = input.size_range
    if (input.location_city  !== undefined) update.location_city  = input.location_city
    if (input.location_state !== undefined) update.location_state = input.location_state

    if (Object.keys(update).length === 0) {
      return c.json({ success: false, error: 'No fields provided to update' }, 400)
    }

    const { data: profile, error } = await db
      .from('businesses')
      .update(update)
      .eq('owner_user_id', userId)
      .select()
      .maybeSingle()

    if (error) return c.json({ success: false, error: error.message }, 500)

    if (!profile) {
      return c.json(
        { success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    return c.json({ success: true, data: { profile } })
  },
)

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

  const { data: removed, error } = await db
    .from('business_members')
    .update({ status: 'removed' })
    .eq('id', memberId)
    .eq('business_id', biz.id)
    .select('id')
    .single()

  if (error || !removed) {
    return c.json(
      { success: false, error: 'Member not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

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

const AssignRoleSchema = z.object({
  memberId: z.string().uuid(),
  roleId:   z.string().uuid(),
})

business.post(
  '/assignments',
  authMiddleware,
  requireRole('business'),
  zValidator('json', AssignRoleSchema),
  async (c) => {
    const userId             = c.get('userId')
    const { memberId, roleId } = c.req.valid('json')
    const db                 = createServerClient()

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

    // Verify the member belongs to this business and return updated row
    const { data: updated, error } = await db
      .from('business_members')
      .update({ assigned_role_id: roleId })
      .eq('id', memberId)
      .eq('business_id', biz.id)
      .select('id')
      .maybeSingle()

    if (error) return c.json({ success: false, error: error.message }, 500)

    if (!updated) {
      return c.json(
        { success: false, error: 'Member not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    return c.json({ success: true })
  },
)

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
// Protected (business) — verify a Paystack payment then activate the subscription.
// The client initialises the transaction on Paystack directly (via the web SDK),
// then POSTs the resulting reference here for server-side verification.

const SubscribeSchema = z.object({
  plan:             z.enum(['starter', 'growth', 'business', 'enterprise_plus']),
  paymentReference: z.string().min(1).optional(),
})

business.post(
  '/subscribe',
  authMiddleware,
  requireRole('business'),
  zValidator('json', SubscribeSchema),
  async (c) => {
    const userId = c.get('userId')
    const { plan, paymentReference } = c.req.valid('json')
    const db = createServerClient()

    if (plan === 'enterprise_plus') {
      return c.json(
        { success: false, error: 'Enterprise+ requires custom pricing. Contact sales@intrainin.com.', code: 'CONTACT_SALES' },
        402,
      )
    }

    if (!paymentReference) {
      return c.json({ success: false, error: 'Payment reference required' }, 400)
    }

    const planInfo = BUSINESS_PLANS.find(p => p.key === plan)!  // enum ensures this exists

    // Verify payment with Paystack — must happen before any DB writes
    let txData: PaystackVerifyData
    try {
      const result = await paystack.verifyTransaction(paymentReference) as { status: boolean; data: PaystackVerifyData }
      txData = result.data
    } catch (err) {
      console.error('[business/subscribe] paystack verify error:', err)
      return c.json({ success: false, error: 'Payment verification failed', code: ERROR_CODES.PAYMENT_FAILED }, 402)
    }

    if (txData.status !== 'success') {
      return c.json(
        { success: false, error: 'Payment was not successful', code: ERROR_CODES.PAYMENT_FAILED },
        402,
      )
    }

    // Amount check — Paystack amounts are in kobo (1 NGN = 100 kobo)
    const expectedKobo = planInfo.priceNgn * 100
    if (txData.amount !== expectedKobo) {
      return c.json(
        { success: false, error: 'Payment amount does not match plan price', code: ERROR_CODES.PAYMENT_FAILED },
        402,
      )
    }

    // Idempotency — if this reference already activated a subscription, return success
    const { data: alreadyActivated } = await db
      .from('businesses')
      .select('id')
      .eq('owner_user_id', userId)
      .eq('payment_reference', paymentReference)
      .maybeSingle()

    if (alreadyActivated) {
      return c.json({ success: true, data: { message: 'Subscription already active' } })
    }

    // Activate for 1 year from now
    const now       = new Date()
    const expiresAt = new Date(now)
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    // Atomic guard: only update if payment_reference is still null.
    // If two requests race past the idempotency check, only one UPDATE wins.
    const { data: updated, error } = await db
      .from('businesses')
      .update({
        subscription_plan:       plan,
        subscription_starts_at:  now.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
        seat_limit:              planInfo.seats as number,
        payment_reference:       paymentReference,
      })
      .eq('owner_user_id', userId)
      .is('payment_reference', null)
      .select('id')

    if (error) return c.json({ success: false, error: error.message }, 500)

    // data=[] (zero rows updated) means another request already set payment_reference
    if (!updated || updated.length === 0) {
      return c.json({ success: true, data: { message: 'Subscription already active' } })
    }

    return c.json({
      success: true,
      data: {
        plan,
        expiresAt:  expiresAt.toISOString(),
        seatLimit:  planInfo.seats as number,
      },
    })
  },
)

// ─── GET /business/analytics ─────────────────────────────────────────────────
// Protected (business) — completion rates, at-risk members, top performers.

business.get('/analytics', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: biz } = await db
    .from('businesses')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json({ success: false, error: 'Business profile not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  // Fetch active members with their user + assigned role
  const { data: members } = await db
    .from('business_members')
    .select('user_id, users ( id, full_name, xp_total ), roles ( id, title )')
    .eq('business_id', biz.id)
    .eq('status', 'active')
    .not('user_id', 'is', null)

  if (!members || members.length === 0) {
    return c.json({
      success: true,
      data: {
        overallCompletionRate: 0,
        perRoleStats:   [],
        atRiskMembers:  [],
        topPerformers:  [],
      },
    })
  }

  const userIds = members.map(m => m.user_id).filter(Boolean) as string[]

  // All completed topic counts per user
  const { data: completions } = await db
    .from('topic_progress')
    .select('user_id, topic_id')
    .in('user_id', userIds)
    .eq('status', 'completed')

  const completionsByUser = (completions ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.user_id] = (acc[r.user_id] ?? 0) + 1
    return acc
  }, {})

  // Most recent topic activity per user (for at-risk detection)
  // Use completed_at as the last-activity signal — topic_progress doesn't have
  // an updated_at column; completed_at records when the learner marked it done.
  const { data: recentActivity } = await db
    .from('topic_progress')
    .select('user_id, completed_at')
    .in('user_id', userIds)
    .order('completed_at', { ascending: false })

  const lastActivityByUser: Record<string, string> = {}
  for (const row of recentActivity ?? []) {
    if (!lastActivityByUser[row.user_id] && row.completed_at) {
      lastActivityByUser[row.user_id] = row.completed_at
    }
  }

  // Total topics per assigned role (for completion %)
  const roleIds = [...new Set(members.map(m => (m.roles as { id: string } | null)?.id).filter(Boolean))] as string[]

  const { data: roleTotals } = roleIds.length > 0
    ? await db
        .from('topics')
        .select('modules ( role_id )')
        .in('modules.role_id', roleIds)
        .eq('is_published', true)
    : { data: [] }

  // Count topics per role_id
  const topicCountByRole: Record<string, number> = {}
  for (const t of roleTotals ?? []) {
    const rId = (t.modules as { role_id: string } | null)?.role_id
    if (rId) topicCountByRole[rId] = (topicCountByRole[rId] ?? 0) + 1
  }

  // Completed enrollments per role
  const { data: completedEnrollments } = roleIds.length > 0
    ? await db
        .from('enrollments')
        .select('user_id, role_id')
        .in('user_id', userIds)
        .in('role_id', roleIds)
        .eq('status', 'completed')
    : { data: [] }

  const completedByRole: Record<string, number> = {}
  const enrolledByRole:  Record<string, number> = {}
  const roleTitleMap:    Record<string, string>  = {}
  for (const m of members) {
    const role = m.roles as { id: string; title: string } | null
    if (role) {
      enrolledByRole[role.id]  = (enrolledByRole[role.id]  ?? 0) + 1
      roleTitleMap[role.id]    = role.title
    }
  }
  for (const e of completedEnrollments ?? []) {
    completedByRole[e.role_id] = (completedByRole[e.role_id] ?? 0) + 1
  }

  const perRoleStats = Object.entries(enrolledByRole).map(([roleId, enrolledCount]) => ({
    roleTitle:      roleTitleMap[roleId] ?? roleId,
    enrolledCount,
    completedCount: completedByRole[roleId] ?? 0,
    completionRate: Math.round(((completedByRole[roleId] ?? 0) / enrolledCount) * 100),
  }))

  // Overall completion rate = avg of per-member (completedTopics / totalTopics for their role)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const memberStats = members.map(m => {
    const uid      = m.user_id as string
    const role     = m.roles as { id: string; title: string } | null
    const user     = m.users as { id: string; full_name: string; xp_total: number } | null
    const total    = role ? (topicCountByRole[role.id] ?? 0) : 0
    const done     = completionsByUser[uid] ?? 0
    const pct      = total > 0 ? Math.round((done / total) * 100) : 0
    const lastAct  = lastActivityByUser[uid] ?? null
    const isAtRisk = !lastAct || lastAct < sevenDaysAgo
    return { uid, name: user?.full_name ?? uid, role: role?.title, pct, done, xp: user?.xp_total ?? 0, isAtRisk, lastActivity: lastAct }
  })

  const overallCompletionRate = memberStats.length
    ? Math.round(memberStats.reduce((s, m) => s + m.pct, 0) / memberStats.length)
    : 0

  const atRiskMembers = memberStats
    .filter(m => m.isAtRisk && m.pct < 100)
    .map(m => ({ name: m.name, role: m.role, completionPct: m.pct, lastActivity: m.lastActivity }))

  const topPerformers = [...memberStats]
    .sort((a, b) => b.pct - a.pct || b.xp - a.xp)
    .slice(0, 5)
    .map(m => ({ name: m.name, role: m.role, completionPct: m.pct, xp: m.xp }))

  return c.json({
    success: true,
    data: {
      overallCompletionRate,
      perRoleStats,
      atRiskMembers,
      topPerformers,
    },
  })
})

export { business as businessRouter }
