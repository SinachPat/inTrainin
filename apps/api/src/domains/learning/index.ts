import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createServerClient } from '@intrainin/db'
import {
  EnrolRequestSchema,
  CompleteTopicSchema,
  ERROR_CODES,
  FREE_ROLES_LIMIT,
} from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const learning = new Hono<{ Variables: AuthVariables }>()

// ─── GET /learning/roles ──────────────────────────────────────────────────────
// Public — full published role catalogue with category info.

learning.get('/roles', async (c) => {
  const db = createServerClient()

  const { data: roles, error } = await db
    .from('roles')
    .select(`
      id, slug, title, description, price_ngn, estimated_hours,
      free_preview_module_count, phase,
      categories ( id, name, slug, icon_name )
    `)
    .eq('is_published', true)
    .order('phase', { ascending: true })
    .order('title', { ascending: true })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { roles } })
})

// ─── GET /learning/roles/:slug ────────────────────────────────────────────────
// Public — single role with full module/topic/test structure.

learning.get('/roles/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db   = createServerClient()

  const { data: role, error } = await db
    .from('roles')
    .select(`
      id, slug, title, description, price_ngn, estimated_hours,
      free_preview_module_count, phase,
      categories ( id, name, slug ),
      modules (
        id, title, order_index,
        topics ( id, title, content_type, estimated_minutes, order_index, is_published ),
        tests  ( id, title, test_type, pass_mark_pct, time_limit_minutes, cooldown_hours )
      ),
      tests ( id, title, test_type, pass_mark_pct, time_limit_minutes, cooldown_hours )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !role) {
    return c.json(
      { success: false, error: 'Role not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  // Sort modules and their topics by order_index
  const modules = role.modules as Array<{ order_index: number; topics: Array<{ order_index: number }> }> | null
  if (modules) {
    modules.sort((a, b) => a.order_index - b.order_index)
    modules.forEach(mod => {
      if (mod.topics) mod.topics.sort((a, b) => a.order_index - b.order_index)
    })
  }

  return c.json({ success: true, data: { role } })
})

// ─── POST /learning/enrol ─────────────────────────────────────────────────────
// Protected — enrol the authenticated user in a role.
// Free roles and the first FREE_ROLES_LIMIT roles don't need a payment reference.

learning.post(
  '/enrol',
  authMiddleware,
  zValidator('json', EnrolRequestSchema),
  async (c) => {
    const userId = c.get('userId')
    const { roleId, paymentReference, paymentType } = c.req.valid('json')
    const db = createServerClient()

    // Prevent duplicate enrolments
    const { data: existing } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .maybeSingle()

    if (existing) {
      return c.json(
        { success: false, error: 'Already enrolled in this role', code: ERROR_CODES.ALREADY_ENROLLED },
        409,
      )
    }

    const { data: role } = await db
      .from('roles')
      .select('id, price_ngn')
      .eq('id', roleId)
      .single()

    if (!role) {
      return c.json(
        { success: false, error: 'Role not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    const isPaid = role.price_ngn > 0

    if (isPaid && !paymentReference) {
      const { count: enrolCount } = await db
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)

      if ((enrolCount ?? 0) >= FREE_ROLES_LIMIT) {
        return c.json(
          { success: false, error: 'Payment required for this role', code: ERROR_CODES.PAYMENT_FAILED },
          402,
        )
      }
    }

    // TODO Layer 8: verify paymentReference with Paystack before inserting

    const { data: enrolment, error: enrolError } = await db
      .from('enrollments')
      .insert({
        user_id:           userId,
        role_id:           roleId,
        status:            'active',
        payment_reference: paymentReference ?? null,
        payment_type:      paymentType ?? (isPaid ? 'individual' : 'free_trial'),
      })
      .select()
      .single()

    if (enrolError) return c.json({ success: false, error: enrolError.message }, 500)

    return c.json({ success: true, data: { enrolment } }, 201)
  },
)

// ─── GET /learning/enrolments ─────────────────────────────────────────────────
// Protected — all enrolments for the user with per-role progress counts.

learning.get('/enrolments', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: enrolments, error } = await db
    .from('enrollments')
    .select(`
      id, status, enrolled_at, completed_at,
      roles (
        id, slug, title, estimated_hours,
        categories ( name ),
        modules ( id, topics ( id ) )
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  const withProgress = await Promise.all(
    (enrolments ?? []).map(async (enr) => {
      const allTopicIds: string[] = ((enr.roles as { modules: { topics: { id: string }[] }[] } | null)?.modules ?? [])
        .flatMap(mod => mod.topics.map(t => t.id))

      const { count: completedCount } = await db
        .from('topic_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('topic_id', allTopicIds.length > 0 ? allTopicIds : ['__none__'])

      return {
        ...enr,
        progress: { completedTopics: completedCount ?? 0, totalTopics: allTopicIds.length },
      }
    }),
  )

  return c.json({ success: true, data: { enrolments: withProgress } })
})

// ─── GET /learning/topics/:id ─────────────────────────────────────────────────
// Protected — topic content. Verifies enrolment in the parent role.

learning.get('/topics/:id', authMiddleware, async (c) => {
  const userId  = c.get('userId')
  const topicId = c.req.param('id')
  const db      = createServerClient()

  const { data: topic, error } = await db
    .from('topics')
    .select(`
      id, title, content_type, content_body, estimated_minutes, order_index,
      modules ( id, role_id )
    `)
    .eq('id', topicId)
    .eq('is_published', true)
    .single()

  if (error || !topic) {
    return c.json(
      { success: false, error: 'Topic not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const roleId = (topic.modules as { role_id: string } | null)?.role_id

  if (roleId) {
    const { data: enrolment } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .eq('status', 'active')
      .maybeSingle()

    if (!enrolment) {
      return c.json(
        { success: false, error: 'Not enrolled in this role', code: ERROR_CODES.NOT_ENROLLED },
        403,
      )
    }
  }

  const { data: progress } = await db
    .from('topic_progress')
    .select('status, completed_at, time_spent_seconds')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle()

  return c.json({
    success: true,
    data: {
      topic,
      progress: progress ?? { status: 'not_started', completed_at: null, time_spent_seconds: 0 },
    },
  })
})

// ─── POST /learning/topics/:id/complete ───────────────────────────────────────
// Protected — marks a topic complete and records time spent. Idempotent.

learning.post(
  '/topics/:id/complete',
  authMiddleware,
  zValidator('json', CompleteTopicSchema),
  async (c) => {
    const userId               = c.get('userId')
    const topicId              = c.req.param('id')
    const { timeSpentSeconds } = c.req.valid('json')
    const db                   = createServerClient()

    const { data: topic } = await db
      .from('topics')
      .select('id, modules ( role_id )')
      .eq('id', topicId)
      .single()

    if (!topic) {
      return c.json(
        { success: false, error: 'Topic not found', code: ERROR_CODES.NOT_FOUND },
        404,
      )
    }

    const roleId = (topic.modules as { role_id: string } | null)?.role_id

    if (roleId) {
      const { data: enrolment } = await db
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .maybeSingle()

      if (!enrolment) {
        return c.json(
          { success: false, error: 'Not enrolled in this role', code: ERROR_CODES.NOT_ENROLLED },
          403,
        )
      }
    }

    const { data: progress, error } = await db
      .from('topic_progress')
      .upsert(
        {
          user_id:            userId,
          topic_id:           topicId,
          status:             'completed',
          completed_at:       new Date().toISOString(),
          time_spent_seconds: timeSpentSeconds,
        },
        { onConflict: 'user_id,topic_id' },
      )
      .select()
      .single()

    if (error) return c.json({ success: false, error: error.message }, 500)

    return c.json({ success: true, data: { progress } })
  },
)

// ─── GET /learning/progress/:roleSlug ─────────────────────────────────────────
// Protected — full progress summary: completed topics, passed tests, % and
// whether the final exam is unlocked.

learning.get('/progress/:roleSlug', authMiddleware, async (c) => {
  const userId   = c.get('userId')
  const roleSlug = c.req.param('roleSlug')
  const db       = createServerClient()

  const { data: role } = await db
    .from('roles')
    .select(`
      id, slug,
      modules ( id, topics ( id ), tests ( id ) ),
      tests ( id, test_type )
    `)
    .eq('slug', roleSlug)
    .single()

  if (!role) {
    return c.json(
      { success: false, error: 'Role not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const { data: enrolment } = await db
    .from('enrollments')
    .select('id, status')
    .eq('user_id', userId)
    .eq('role_id', role.id)
    .maybeSingle()

  if (!enrolment) {
    return c.json(
      { success: false, error: 'Not enrolled', code: ERROR_CODES.NOT_ENROLLED },
      403,
    )
  }

  type ModuleRow = { topics: { id: string }[]; tests: { id: string }[] }
  const modules = (role.modules as ModuleRow[] | null) ?? []

  const allTopicIds     = modules.flatMap(m => m.topics.map(t => t.id))
  const allModuleTestIds = modules.flatMap(m => m.tests.map(t => t.id))

  const [{ data: completedTopics }, { data: passedAttempts }] = await Promise.all([
    db
      .from('topic_progress')
      .select('topic_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('topic_id', allTopicIds.length > 0 ? allTopicIds : ['__none__']),
    db
      .from('test_attempts')
      .select('test_id')
      .eq('user_id', userId)
      .eq('passed', true)
      .in('test_id', allModuleTestIds.length > 0 ? allModuleTestIds : ['__none__']),
  ])

  const completedTopicIds = (completedTopics ?? []).map(r => r.topic_id)
  const passedTestIds     = (passedAttempts  ?? []).map(r => r.test_id)
  const totalTopics       = allTopicIds.length
  const progressPct       = totalTopics > 0 ? Math.round((completedTopicIds.length / totalTopics) * 100) : 0
  const allTopicsDone     = completedTopicIds.length === totalTopics
  const allModulesDone    = allModuleTestIds.every(id => passedTestIds.includes(id))

  return c.json({
    success: true,
    data: {
      roleId:            role.id,
      roleSlug:          role.slug,
      completedTopics:   completedTopicIds,
      passedTests:       passedTestIds,
      totalTopics,
      progressPct,
      finalExamUnlocked: allTopicsDone && allModulesDone,
      enrollmentStatus:  enrolment.status,
    },
  })
})

export { learning as learningRouter }
