import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createServerClient } from '@intrainin/db'
import {
  UpdateJobHubProfileSchema,
  RespondToMatchSchema,
  PostHireRequestSchema,
  UpdateHireRequestSchema,
  ERROR_CODES,
} from '@intrainin/shared'
import { authMiddleware, requireRole } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const jobhub = new Hono<{ Variables: AuthVariables }>()

// ─── GET /jobhub/credits ─────────────────────────────────────────────────────
// Protected (learner) — current credit balance derived from the ledger.

jobhub.get('/credits', authMiddleware, requireRole('learner'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data, error } = await db
    .from('job_hub_credits')
    .select('amount')
    .eq('user_id', userId)

  if (error) return c.json({ success: false, error: error.message }, 500)

  const balance = (data ?? []).reduce((sum, row) => sum + row.amount, 0)
  return c.json({ success: true, data: { balance } })
})

// ─── POST /jobhub/credits/cron/monthly-grant ─────────────────────────────────
// Internal — called by a scheduled job (GitHub Actions) on the 1st of each month.
// Protected by a static CRON_SECRET header; not authenticated via JWT.
// Idempotent: skips users who already received a monthly_grant this calendar month.

jobhub.post('/credits/cron/monthly-grant', async (c) => {
  const secret = process.env.CRON_SECRET
  if (!secret || c.req.header('x-cron-secret') !== secret) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const db        = createServerClient()
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const monthStartISO = monthStart.toISOString()

  // All active learner users
  const { data: learners, error: learnersError } = await db
    .from('users')
    .select('id')
    .eq('account_type', 'learner')

  if (learnersError) {
    console.error('[cron/monthly-grant] fetch learners error:', learnersError.message)
    return c.json({ success: false, error: learnersError.message }, 500)
  }

  // Users who already got a grant this month
  const { data: alreadyGranted } = await db
    .from('job_hub_credits')
    .select('user_id')
    .eq('reason', 'monthly_grant')
    .gte('created_at', monthStartISO)

  const alreadyGrantedIds = new Set((alreadyGranted ?? []).map(r => r.user_id))

  const toGrant = (learners ?? []).filter(u => !alreadyGrantedIds.has(u.id))

  if (toGrant.length === 0) {
    return c.json({ success: true, data: { granted: 0, skipped: learners?.length ?? 0 } })
  }

  const { error: insertError } = await db
    .from('job_hub_credits')
    .insert(toGrant.map(u => ({ user_id: u.id, amount: 10, reason: 'monthly_grant' })))

  if (insertError) {
    console.error('[cron/monthly-grant] insert error:', insertError.message)
    return c.json({ success: false, error: insertError.message }, 500)
  }

  console.log(`[cron/monthly-grant] granted 10 credits to ${toGrant.length} learners`)
  return c.json({
    success: true,
    data: { granted: toGrant.length, skipped: alreadyGrantedIds.size },
  })
})

// ─── GET /jobhub/profile ──────────────────────────────────────────────────────
// Protected (learner) — get or lazily create the learner's job hub profile.

jobhub.get('/profile', authMiddleware, requireRole('learner'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: profile, error } = await db
    .from('job_hub_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return c.json({ success: false, error: error.message }, 500)

  // Lazily create profile on first access
  if (!profile) {
    const { data: created, error: createError } = await db
      .from('job_hub_profiles')
      .insert({ user_id: userId })
      .select()
      .single()

    if (createError) return c.json({ success: false, error: createError.message }, 500)

    return c.json({ success: true, data: { profile: created } })
  }

  return c.json({ success: true, data: { profile } })
})

// ─── PUT /jobhub/profile ──────────────────────────────────────────────────────
// Protected (learner) — update job hub preferences.

jobhub.put(
  '/profile',
  authMiddleware,
  requireRole('learner'),
  zValidator('json', UpdateJobHubProfileSchema),
  async (c) => {
    const userId = c.get('userId')
    const input  = c.req.valid('json')
    const db     = createServerClient()

    // Upsert so even first-time callers can set preferences
    const { data: profile, error } = await db
      .from('job_hub_profiles')
      .upsert(
        {
          user_id:              userId,
          ...(input.availability       !== undefined && { availability:        input.availability }),
          ...(input.employmentTypePref !== undefined && { employment_type_pref: input.employmentTypePref }),
          ...(input.preferredRoles     !== undefined && { preferred_roles:      input.preferredRoles }),
          ...(input.locationCity       !== undefined && { location_city:        input.locationCity }),
          ...(input.locationState      !== undefined && { location_state:       input.locationState }),
          ...(input.isVisible          !== undefined && { is_visible:           input.isVisible }),
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { profile } })
  },
)

// ─── GET /jobhub/matches ──────────────────────────────────────────────────────
// Protected (learner) — job matches for the authenticated learner.

jobhub.get('/matches', authMiddleware, requireRole('learner'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: matches, error } = await db
    .from('job_matches')
    .select(`
      id, match_score, status, worker_notified_at, created_at,
      hire_requests (
        id, location_city, location_state, positions_count,
        pay_min, pay_max, start_date, requirements, certification_required,
        roles ( id, slug, title )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { matches: matches ?? [] } })
})

// ─── PATCH /jobhub/matches/:id ────────────────────────────────────────────────
// Protected (learner) — accept or decline a match.

jobhub.patch(
  '/matches/:id',
  authMiddleware,
  requireRole('learner'),
  zValidator('json', RespondToMatchSchema),
  async (c) => {
    const matchId = c.req.param('id')
    const userId  = c.get('userId')
    const { status } = c.req.valid('json')
    const db      = createServerClient()

    const { data: match } = await db
      .from('job_matches')
      .select('id, status')
      .eq('id', matchId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!match) {
      return c.json(
        { success: false, error: 'Match not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    if (match.status !== 'pending') {
      return c.json(
        { success: false, error: 'Match has already been responded to', code: ERROR_CODES.VALIDATION_ERROR },
        409,
      )
    }

    // Accepting costs 5 credits — check balance first
    if (status === 'accepted') {
      const { data: ledger } = await db
        .from('job_hub_credits')
        .select('amount')
        .eq('user_id', userId)

      const balance = (ledger ?? []).reduce((sum, row) => sum + row.amount, 0)
      if (balance < 5) {
        return c.json(
          { success: false, error: 'Not enough credits to accept this match', code: 'INSUFFICIENT_CREDITS' },
          402,
        )
      }

      // Deduct 5 credits
      const { error: deductError } = await db
        .from('job_hub_credits')
        .insert({ user_id: userId, amount: -5, reason: 'apply' })

      if (deductError) return c.json({ success: false, error: deductError.message }, 500)
    }

    const { data: updated, error } = await db
      .from('job_matches')
      .update({ status })
      .eq('id', matchId)
      .select('id, status')
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { match: updated } })
  },
)

// ─── GET /jobhub/jobs ─────────────────────────────────────────────────────────
// Protected (learner) — public job listings the learner can browse.

jobhub.get('/jobs', authMiddleware, async (c) => {
  const db = createServerClient()

  const { data: jobs, error } = await db
    .from('hire_requests')
    .select(`
      id, location_city, location_state, positions_count,
      pay_min, pay_max, start_date, requirements, certification_required, posted_at,
      roles ( id, slug, title ),
      businesses ( id, name, location_city )
    `)
    .eq('status', 'open')
    .order('posted_at', { ascending: false })
    .limit(50)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { jobs: jobs ?? [] } })
})

// ─── POST /jobhub/hire-requests ───────────────────────────────────────────────
// Protected (business) — post a new hire request.

jobhub.post(
  '/hire-requests',
  authMiddleware,
  requireRole('business'),
  zValidator('json', PostHireRequestSchema),
  async (c) => {
    const userId = c.get('userId')
    const input  = c.req.valid('json')
    const db     = createServerClient()

    // Look up the business owned by this user. If it's missing (can happen when
    // migration 005 wasn't applied yet and the upsert in profile/complete silently
    // failed), auto-create it using the owner's name as a placeholder.
    let { data: biz } = await db
      .from('businesses')
      .select('id')
      .eq('owner_user_id', userId)
      .maybeSingle()

    if (!biz) {
      const { data: owner } = await db
        .from('users')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()

      const { data: created } = await db
        .from('businesses')
        .insert({ owner_user_id: userId, name: owner?.full_name ?? 'My Business' })
        .select('id')
        .single()

      if (!created) {
        return c.json(
          { success: false, error: 'No business profile found', code: ERROR_CODES.NOT_FOUND },
          404,
        )
      }
      biz = created
    }

    const { data: request, error } = await db
      .from('hire_requests')
      .insert({
        business_id:            biz.id,
        role_id:                input.roleId,
        location_city:          input.locationCity,
        location_state:         input.locationState ?? null,
        positions_count:        input.positionsCount,
        pay_min:                input.payMin ?? null,
        pay_max:                input.payMax ?? null,
        start_date:             input.startDate ?? null,
        requirements:           input.requirements ?? null,
        certification_required: input.certificationRequired,
      })
      .select()
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { request } }, 201)
  },
)

// ─── GET /jobhub/hire-requests ────────────────────────────────────────────────
// Protected (business) — all hire requests from this business.

jobhub.get('/hire-requests', authMiddleware, requireRole('business'), async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: biz } = await db
    .from('businesses')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle()

  if (!biz) {
    return c.json({ success: true, data: { requests: [] } })
  }

  const { data: requests, error } = await db
    .from('hire_requests')
    .select(`
      id, status, positions_count, pay_min, pay_max, location_city,
      location_state, start_date, posted_at, expires_at,
      roles ( id, slug, title )
    `)
    .eq('business_id', biz.id)
    .order('posted_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { requests: requests ?? [] } })
})

// ─── PATCH /jobhub/hire-requests/:id ─────────────────────────────────────────
// Protected (business) — update a hire request (e.g. close, change status).

jobhub.patch(
  '/hire-requests/:id',
  authMiddleware,
  requireRole('business'),
  zValidator('json', UpdateHireRequestSchema),
  async (c) => {
    const requestId = c.req.param('id')
    const userId    = c.get('userId')
    const input     = c.req.valid('json')
    const db        = createServerClient()

    const { data: biz } = await db
      .from('businesses')
      .select('id')
      .eq('owner_user_id', userId)
      .maybeSingle()

    if (!biz) {
      return c.json(
        { success: false, error: 'No business profile found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    // Verify ownership
    const { data: existing } = await db
      .from('hire_requests')
      .select('id')
      .eq('id', requestId)
      .eq('business_id', biz.id)
      .maybeSingle()

    if (!existing) {
      return c.json(
        { success: false, error: 'Hire request not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    const update: Record<string, unknown> = {}
    if (input.roleId          !== undefined) update.role_id             = input.roleId
    if (input.locationCity    !== undefined) update.location_city       = input.locationCity
    if (input.locationState   !== undefined) update.location_state      = input.locationState
    if (input.positionsCount  !== undefined) update.positions_count     = input.positionsCount
    if (input.payMin          !== undefined) update.pay_min             = input.payMin
    if (input.payMax          !== undefined) update.pay_max             = input.payMax
    if (input.startDate       !== undefined) update.start_date          = input.startDate
    if (input.requirements    !== undefined) update.requirements        = input.requirements
    if (input.certificationRequired !== undefined) update.certification_required = input.certificationRequired
    if (input.status          !== undefined) update.status              = input.status

    const { data: updated, error } = await db
      .from('hire_requests')
      .update(update)
      .eq('id', requestId)
      .select()
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { request: updated } })
  },
)

// ─── GET /jobhub/hire-requests/:id/candidates ───────────────────────────────
// Protected (business) — matched candidates for a specific hire request.

jobhub.get(
  '/hire-requests/:id/candidates',
  authMiddleware,
  requireRole('business'),
  async (c) => {
    const requestId = c.req.param('id')
    const userId    = c.get('userId')
    const db        = createServerClient()

    // Verify ownership
    const { data: biz } = await db
      .from('businesses')
      .select('id')
      .eq('owner_user_id', userId)
      .maybeSingle()

    if (!biz) {
      return c.json(
        { success: false, error: 'No business profile found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    const { data: request } = await db
      .from('hire_requests')
      .select('id, role_id')
      .eq('id', requestId)
      .eq('business_id', biz.id)
      .maybeSingle()

    if (!request) {
      return c.json(
        { success: false, error: 'Hire request not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    const { data: matches, error } = await db
      .from('job_matches')
      .select(`
        id, match_score, status, created_at,
        users ( id, full_name, phone )
      `)
      .eq('hire_request_id', requestId)
      .order('match_score', { ascending: false })

    if (error) return c.json({ success: false, error: error.message }, 500)

    // Enrich with job hub profile + certification status per candidate
    const userIds = (matches ?? []).map(m => (m.users as { id: string } | null)?.id).filter(Boolean) as string[]

    const [profilesRes, certsRes] = await Promise.all([
      userIds.length
        ? db.from('job_hub_profiles').select('user_id, location_city, availability').in('user_id', userIds)
        : Promise.resolve({ data: [] }),
      userIds.length && request.role_id
        ? db.from('certificates')
            .select('user_id')
            .eq('role_id', request.role_id)
            .eq('is_revoked', false)
            .in('user_id', userIds)
        : Promise.resolve({ data: [] }),
    ])

    const profileMap = new Map((profilesRes.data ?? []).map(p => [p.user_id, p]))
    const certifiedSet = new Set((certsRes.data ?? []).map(c => c.user_id))

    const candidates = (matches ?? []).map(m => {
      const uid = (m.users as { id: string } | null)?.id
      const profile = uid ? profileMap.get(uid) : null
      return {
        ...m,
        locationCity: profile?.location_city ?? null,
        availability: profile?.availability ?? null,
        certified: uid ? certifiedSet.has(uid) : false,
      }
    })

    return c.json({ success: true, data: { candidates } })
  },
)

// ─── PATCH /jobhub/candidates/:id ────────────────────────────────────────────
// Protected (business) — update a candidate match status (shortlist, hire, reject).

jobhub.patch(
  '/candidates/:id',
  authMiddleware,
  requireRole('business'),
  async (c) => {
    const matchId = c.req.param('id')
    const userId  = c.get('userId')
    const db      = createServerClient()

    let body: { status?: string }
    try { body = await c.req.json() } catch { body = {} }

    const validStatuses = ['shortlisted', 'hired', 'rejected']
    if (!body.status || !validStatuses.includes(body.status)) {
      return c.json({ success: false, error: 'Invalid status — must be shortlisted, hired, or rejected' }, 400)
    }

    // Verify the match belongs to a hire request owned by this business
    const { data: biz } = await db
      .from('businesses')
      .select('id')
      .eq('owner_user_id', userId)
      .maybeSingle()

    if (!biz) {
      return c.json(
        { success: false, error: 'No business profile found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    // Join through hire_requests to verify ownership
    const { data: match } = await db
      .from('job_matches')
      .select('id, hire_requests!inner ( business_id )')
      .eq('id', matchId)
      .maybeSingle()

    if (!match) {
      return c.json(
        { success: false, error: 'Match not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    // Verify the hire request belongs to this business
    const hireReq = match.hire_requests as { business_id: string }
    if (hireReq.business_id !== biz.id) {
      return c.json(
        { success: false, error: 'Match not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    const { data: updated, error } = await db
      .from('job_matches')
      .update({ status: body.status as 'shortlisted' | 'hired' | 'rejected' })
      .eq('id', matchId)
      .select('id, status')
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { match: updated } })
  },
)

export { jobhub as jobhubRouter }
