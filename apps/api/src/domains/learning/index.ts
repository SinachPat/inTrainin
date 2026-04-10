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
import { onTopicComplete, onEnrolment } from '../../lib/gamification.js'
import { paystack } from '../../lib/paystack.js'
import type { PaystackVerifyData } from '../../lib/paystack.js'
import { runMatchingForHireRequest } from '../jobhub/matcher.js'

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

    // Enterprise enrollments (business paying for a worker) must always carry a reference
    if (paymentType === 'enterprise' && !paymentReference) {
      return c.json(
        { success: false, error: 'Enterprise enrollments require a payment reference', code: ERROR_CODES.PAYMENT_FAILED },
        402,
      )
    }

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

    // Verify payment with Paystack before creating the enrollment.
    // Skipped for free-tier enrolments (no reference) so the free-first-course path still works.
    if (isPaid && paymentReference) {
      let txData: PaystackVerifyData
      try {
        const result = await paystack.verifyTransaction(paymentReference) as { status: boolean; data: PaystackVerifyData }
        txData = result.data
      } catch (err) {
        console.error('[learning/enrol] paystack verify error:', err)
        return c.json(
          { success: false, error: 'Payment verification failed', code: ERROR_CODES.PAYMENT_FAILED },
          402,
        )
      }

      if (txData.status !== 'success') {
        return c.json(
          { success: false, error: 'Payment was not successful', code: ERROR_CODES.PAYMENT_FAILED },
          402,
        )
      }

      // Amount check — Paystack returns kobo (1 NGN = 100 kobo)
      const expectedKobo = role.price_ngn * 100
      if (txData.amount !== expectedKobo) {
        return c.json(
          { success: false, error: 'Payment amount does not match role price', code: ERROR_CODES.PAYMENT_FAILED },
          402,
        )
      }
    }

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

    // Fire-and-forget: gamification + job matching must never break the response
    onEnrolment(db, userId).catch(console.error)

    // Re-run matching for any open hire requests targeting this role
    db.from('hire_requests')
      .select('id')
      .eq('role_id', roleId)
      .eq('status', 'open')
      .then(({ data: openReqs }) => {
        for (const r of openReqs ?? []) {
          runMatchingForHireRequest(r.id).catch(e =>
            console.error('[learning/enrol] re-matching failed for', r.id, e)
          )
        }
      })
      .catch(console.error)

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

  // Collect all topic IDs across every enrollment in a single pass, then
  // fetch completions in ONE query rather than one-per-enrollment (N+1 → 2).
  type RoleWithModules = { modules: { topics: { id: string }[] }[] } | null
  const enrolmentTopicIds: string[][] = (enrolments ?? []).map(enr =>
    ((enr.roles as RoleWithModules)?.modules ?? []).flatMap(mod => mod.topics.map(t => t.id))
  )
  const allTopicIds = enrolmentTopicIds.flat()

  const { data: completedRows } = allTopicIds.length > 0
    ? await db
        .from('topic_progress')
        .select('topic_id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('topic_id', allTopicIds)
    : { data: [] }

  const completedSet = new Set((completedRows ?? []).map(r => r.topic_id))

  const withProgress = (enrolments ?? []).map((enr, idx) => {
    const topicIds = enrolmentTopicIds[idx]
    return {
      ...enr,
      progress: {
        completedTopics: topicIds.filter(id => completedSet.has(id)).length,
        totalTopics:     topicIds.length,
      },
    }
  })

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

  // roleId must always be present — a null means a DB integrity problem
  if (!roleId) {
    return c.json(
      { success: false, error: 'Topic configuration error', code: ERROR_CODES.NOT_FOUND },
      500,
    )
  }

  const { data: enrolment } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .in('status', ['active', 'completed'])  // completed learners can still re-read content
    .maybeSingle()

  if (!enrolment) {
    return c.json(
      { success: false, error: 'Not enrolled in this role', code: ERROR_CODES.NOT_ENROLLED },
      403,
    )
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

    if (!roleId) {
      return c.json(
        { success: false, error: 'Topic configuration error', code: ERROR_CODES.NOT_FOUND },
        500,
      )
    }

    const { data: enrolment } = await db
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .eq('status', 'active')  // completed/paused enrollments cannot mark new topics
      .maybeSingle()

    if (!enrolment) {
      return c.json(
        { success: false, error: 'Not enrolled in this role', code: ERROR_CODES.NOT_ENROLLED },
        403,
      )
    }

    // If already completed, return the existing row unchanged — preserve the
    // original completed_at and time_spent_seconds from the first completion.
    const { data: existing } = await db
      .from('topic_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('status', 'completed')
      .maybeSingle()

    if (existing) {
      return c.json({ success: true, data: { progress: existing } })
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

    // Fire-and-forget: gamification failure must never break the response
    onTopicComplete(db, userId).catch(console.error)

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

// ─── GET /learning/topics/:id/audio ──────────────────────────────────────────
// Protected — synthesise the topic's text content to MP3 using Google Cloud TTS
// and stream the result back. The client fetches this with its auth token and
// creates a blob URL for an <audio> element.
//
// Requires GOOGLE_TTS_API_KEY env var (or GOOGLE_APPLICATION_CREDENTIALS for
// the service-account flow). Returns 503 if Google TTS is not configured so
// the frontend can fall back gracefully to Web Speech API.

learning.get('/topics/:id/audio', authMiddleware, async (c) => {
  const userId  = c.get('userId')
  const topicId = c.req.param('id')
  const db      = createServerClient()

  // ── Verify enrolment (same check as GET /topics/:id) ─────────────────────────
  const { data: topic } = await db
    .from('topics')
    .select('title, content_body, modules ( role_id )')
    .eq('id', topicId)
    .eq('is_published', true)
    .maybeSingle()

  if (!topic) {
    return c.json({ success: false, error: 'Topic not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  const roleId = (topic.modules as { role_id: string } | null)?.role_id
  if (!roleId) {
    return c.json({ success: false, error: 'Topic configuration error' }, 500)
  }

  const { data: enrolment } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .in('status', ['active', 'completed'])
    .maybeSingle()

  if (!enrolment) {
    return c.json({ success: false, error: 'Not enrolled', code: ERROR_CODES.NOT_ENROLLED }, 403)
  }

  // ── Extract readable text from topic content ──────────────────────────────────
  type ContentSection = { heading: string; body: string }
  type ContentStep    = { step: number; title: string; description: string }
  type ContentBody = {
    sections?:         ContentSection[]
    key_points?:       string[]
    steps?:            ContentStep[]
    scenario?:         string
    what_went_wrong?:  string
    correct_response?: Record<string, string>
    what_not_to_do?:   string[]
    learning_outcome?: string
  }

  const body  = topic.content_body as ContentBody
  const parts: string[] = [`${topic.title}.`]
  body.sections?.forEach(s => parts.push(`${s.heading}. ${s.body}`))
  body.key_points?.forEach(p => parts.push(p))
  body.steps?.forEach(s => parts.push(`Step ${s.step}. ${s.title}. ${s.description}`))
  if (body.scenario)         parts.push('The scenario. ' + body.scenario)
  if (body.what_went_wrong)  parts.push('What went wrong. ' + body.what_went_wrong)
  if (body.correct_response) {
    Object.entries(body.correct_response).forEach(([k, v]) => parts.push(`${k}. ${v}`))
  }
  if (body.what_not_to_do)   parts.push('What not to do. ' + body.what_not_to_do.join('. '))
  if (body.learning_outcome) parts.push('Learning outcome. ' + body.learning_outcome)
  const text = parts.join(' ')

  // ── Google Cloud TTS ──────────────────────────────────────────────────────────
  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    // Not configured — frontend should fall back to Web Speech API
    return c.json({ success: false, error: 'TTS not configured' }, 503)
  }

  try {
    // Use the REST API directly (avoids the need for a service account keyfile
    // in serverless/container environments — just an API key in env vars).
    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'en-NG',
            name:         'en-NG-Standard-A',  // Nigerian English
            ssmlGender:   'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate:  1.0,
            pitch:         0,
          },
        }),
      },
    )

    if (!ttsRes.ok) {
      // Try falling back to en-GB if en-NG voice is not available on this project
      const fallbackRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-GB', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
          }),
        },
      )

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text()
        console.error('[learning/audio] Google TTS fallback error:', errText)
        return c.json({ success: false, error: 'TTS synthesis failed' }, 502)
      }

      const fallbackJson = await fallbackRes.json() as { audioContent: string }
      const audioBytes   = Buffer.from(fallbackJson.audioContent, 'base64')
      return new Response(audioBytes as unknown as BodyInit, {
        headers: {
          'Content-Type':  'audio/mpeg',
          'Cache-Control': 'private, max-age=3600',
        },
      })
    }

    const json       = await ttsRes.json() as { audioContent: string }
    const audioBytes = Buffer.from(json.audioContent, 'base64')

    return new Response(audioBytes as unknown as BodyInit, {
      headers: {
        'Content-Type':  'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[learning/audio] unexpected error:', err)
    return c.json({ success: false, error: 'TTS synthesis failed' }, 502)
  }
})

export { learning as learningRouter }
