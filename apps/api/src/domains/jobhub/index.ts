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

    // Look up the business owned by this user
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

export { jobhub as jobhubRouter }
