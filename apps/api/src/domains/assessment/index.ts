import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createServerClient } from '@intrainin/db'
import {
  SubmitTestSchema,
  ERROR_CODES,
  ASSESSMENT_COOLDOWN_HOURS,
  FINAL_EXAM_COOLDOWN_HOURS,
} from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'
import { onTestPass } from '../../lib/gamification.js'

const assessment = new Hono<{ Variables: AuthVariables }>()

// ─── GET /assessment/tests/:testId ───────────────────────────────────────────
// Returns test metadata + questions WITHOUT the correct answer index.
// The `correct` field is stripped here so the client never sees the answers.

assessment.get('/tests/:testId', authMiddleware, async (c) => {
  const testId = c.req.param('testId')
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: test, error } = await db
    .from('tests')
    .select('id, title, test_type, pass_mark_pct, time_limit_minutes, cooldown_hours, questions, module_id, role_id')
    .eq('id', testId)
    .single()

  if (error || !test) {
    return c.json({ success: false, error: 'Test not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  // Verify enrolment in the parent role
  const roleId = test.role_id ?? (
    test.module_id
      ? (await db.from('modules').select('role_id').eq('id', test.module_id).single()).data?.role_id
      : null
  )

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

  // Check active cooldown
  const cooldown = await getActiveCooldown(db, userId, testId, test.cooldown_hours)
  if (cooldown) {
    return c.json(
      {
        success: false,
        error:   'Test is on cooldown',
        code:    ERROR_CODES.COOLDOWN_ACTIVE,
        data:    { cooldownEndsAt: cooldown.endsAt, attemptNumber: cooldown.attemptNumber },
      },
      429,
    )
  }

  // Strip `correct` from each question before sending to client
  const safeQuestions = (test.questions ?? []).map(({ correct: _correct, ...q }) => q)

  return c.json({
    success: true,
    data: {
      test: {
        id:               test.id,
        title:            test.title,
        testType:         test.test_type,
        passMark:         test.pass_mark_pct,
        timeLimitMinutes: test.time_limit_minutes,
        questions:        safeQuestions,
      },
    },
  })
})

// ─── POST /assessment/tests/:testId/submit ────────────────────────────────────
// Scores answers server-side, enforces cooldown, records attempt.

assessment.post(
  '/tests/:testId/submit',
  authMiddleware,
  zValidator('json', SubmitTestSchema),
  async (c) => {
    const testId  = c.req.param('testId')
    const userId  = c.get('userId')
    const { answers } = c.req.valid('json')
    const db      = createServerClient()

    const { data: test, error } = await db
      .from('tests')
      .select('id, test_type, questions, pass_mark_pct, cooldown_hours, module_id, role_id')
      .eq('id', testId)
      .single()

    if (error || !test) {
      return c.json({ success: false, error: 'Test not found', code: ERROR_CODES.NOT_FOUND }, 404)
    }

    // Enforce cooldown before accepting a submission
    const cooldownHours = test.test_type === 'final'
      ? FINAL_EXAM_COOLDOWN_HOURS
      : (test.cooldown_hours ?? ASSESSMENT_COOLDOWN_HOURS)

    const cooldown = await getActiveCooldown(db, userId, testId, cooldownHours)
    if (cooldown) {
      return c.json(
        {
          success: false,
          error:   'Test is on cooldown',
          code:    ERROR_CODES.COOLDOWN_ACTIVE,
          data:    { cooldownEndsAt: cooldown.endsAt },
        },
        429,
      )
    }

    // Verify enrolment — same check as GET /tests/:testId but re-applied here
    // so a direct POST cannot bypass the enrollment gate.
    const submitRoleId = test.role_id ?? (
      test.module_id
        ? (await db.from('modules').select('role_id').eq('id', test.module_id).single()).data?.role_id
        : null
    )

    if (submitRoleId) {
      const { data: enrolment } = await db
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', submitRoleId)
        .eq('status', 'active')
        .maybeSingle()

      if (!enrolment) {
        return c.json(
          { success: false, error: 'Not enrolled in this role', code: ERROR_CODES.NOT_ENROLLED },
          403,
        )
      }
    }

    // ── Score the attempt ─────────────────────────────────────────────────────
    const questions = test.questions ?? []
    const totalQuestions = questions.length

    if (totalQuestions === 0) {
      return c.json({ success: false, error: 'Test has no questions' }, 500)
    }

    // Build a map of questionId → correct index for O(1) lookup
    const answerKey = new Map<string, number>(
      questions.map(q => [q.id, q.correct])
    )

    let correct = 0
    const scoredAnswers = answers.map(a => {
      const isCorrect = answerKey.get(a.questionId) === a.selected
      if (isCorrect) correct++
      return {
        question_id:   a.questionId,
        selected:      a.selected,
        selected_text: a.selectedText,
      }
    })

    const scorePct = Math.round((correct / totalQuestions) * 100)
    const passed   = scorePct >= test.pass_mark_pct

    // ── Determine attempt number ──────────────────────────────────────────────
    const { count: priorAttempts } = await db
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('test_id', testId)

    const attemptNumber = (priorAttempts ?? 0) + 1

    // ── Persist attempt ───────────────────────────────────────────────────────
    const { data: attempt, error: insertError } = await db
      .from('test_attempts')
      .insert({
        user_id:        userId,
        test_id:        testId,
        score_pct:      scorePct,
        passed,
        attempt_number: attemptNumber,
        answers:        scoredAnswers,
      })
      .select()
      .single()

    if (insertError) {
      return c.json({ success: false, error: insertError.message }, 500)
    }

    // Fire-and-forget: gamification failure must never break the response
    if (passed) {
      onTestPass(db, userId, test.test_type as 'module' | 'final').catch(console.error)
    }

    // ── Check if final exam is now unlocked for this role ─────────────────────
    const roleId = test.role_id ?? (
      test.module_id
        ? (await db.from('modules').select('role_id').eq('id', test.module_id).single()).data?.role_id
        : null
    )

    let finalExamUnlocked = false
    if (passed && roleId) {
      finalExamUnlocked = await checkFinalExamUnlocked(db, userId, roleId)
    }

    return c.json({
      success: true,
      data: {
        attempt: {
          id:            attempt.id,
          scorePct,
          passed,
          passMark:      test.pass_mark_pct,
          attemptNumber,
          correctCount:  correct,
          totalCount:    totalQuestions,
        },
        finalExamUnlocked,
      },
    }, 201)
  },
)

// ─── GET /assessment/tests/:testId/attempts ───────────────────────────────────
// Returns all past attempts for the user on a given test (no questions/answers).

assessment.get('/tests/:testId/attempts', authMiddleware, async (c) => {
  const testId = c.req.param('testId')
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: attempts, error } = await db
    .from('test_attempts')
    .select('id, score_pct, passed, attempt_number, taken_at')
    .eq('user_id', userId)
    .eq('test_id', testId)
    .order('attempt_number', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { attempts: attempts ?? [] } })
})

// ─── GET /assessment/tests/:testId/cooldown ───────────────────────────────────
// Returns current cooldown state so the UI can render a countdown.

assessment.get('/tests/:testId/cooldown', authMiddleware, async (c) => {
  const testId = c.req.param('testId')
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: test } = await db
    .from('tests')
    .select('cooldown_hours, test_type')
    .eq('id', testId)
    .single()

  if (!test) {
    return c.json({ success: false, error: 'Test not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  const cooldownHours = test.test_type === 'final'
    ? FINAL_EXAM_COOLDOWN_HOURS
    : (test.cooldown_hours ?? ASSESSMENT_COOLDOWN_HOURS)

  const cooldown = await getActiveCooldown(db, userId, testId, cooldownHours)

  return c.json({
    success: true,
    data: {
      onCooldown:    !!cooldown,
      cooldownEndsAt: cooldown?.endsAt ?? null,
      attemptNumber:  cooldown?.attemptNumber ?? null,
    },
  })
})

// ─── GET /assessment/roles/:roleSlug/history ─────────────────────────────────
// Returns the most recent attempt per test for the user across all tests in
// the role — used to render the "Test history" section on the curriculum page.

assessment.get('/roles/:roleSlug/history', authMiddleware, async (c) => {
  const roleSlug = c.req.param('roleSlug')
  const userId   = c.get('userId')
  const db       = createServerClient()

  // Resolve role id from slug
  const { data: role } = await db
    .from('roles')
    .select('id')
    .eq('slug', roleSlug)
    .single()

  if (!role) {
    return c.json({ success: false, error: 'Role not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  // All tests belonging to this role (module tests + final exam)
  const { data: modules } = await db
    .from('modules')
    .select('tests ( id )')
    .eq('role_id', role.id)

  const { data: finalTests } = await db
    .from('tests')
    .select('id')
    .eq('role_id', role.id)
    .eq('test_type', 'final')

  const moduleTestIds = (modules ?? []).flatMap(m =>
    ((m.tests as { id: string }[] | null) ?? []).map(t => t.id)
  )
  const allTestIds = [...moduleTestIds, ...(finalTests ?? []).map(t => t.id)]

  if (allTestIds.length === 0) {
    return c.json({ success: true, data: { attempts: [] } })
  }

  // All attempts, enriched with test title — most recent first
  const { data: attempts, error } = await db
    .from('test_attempts')
    .select('id, test_id, score_pct, passed, attempt_number, taken_at, tests ( title, test_type )')
    .eq('user_id', userId)
    .in('test_id', allTestIds)
    .order('taken_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { attempts: attempts ?? [] } })
})

// =============================================================================
// Helpers
// =============================================================================

type DbClient = ReturnType<typeof createServerClient>

/** Returns cooldown info if the user must wait before retrying, null otherwise. */
async function getActiveCooldown(
  db: DbClient,
  userId: string,
  testId: string,
  cooldownHours: number,
): Promise<{ endsAt: string; attemptNumber: number } | null> {
  const { data: lastAttempt } = await db
    .from('test_attempts')
    .select('taken_at, attempt_number')
    .eq('user_id', userId)
    .eq('test_id', testId)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!lastAttempt) return null

  const takenAt  = new Date(lastAttempt.taken_at)
  const endsAt   = new Date(takenAt.getTime() + cooldownHours * 60 * 60 * 1000)

  if (endsAt > new Date()) {
    return { endsAt: endsAt.toISOString(), attemptNumber: lastAttempt.attempt_number }
  }

  return null
}

/**
 * Final exam is unlocked when all module-level tests for the role have been
 * passed at least once. Returns true if the final exam should now be available.
 */
async function checkFinalExamUnlocked(
  db: DbClient,
  userId: string,
  roleId: string,
): Promise<boolean> {
  // Get all module tests for this role
  const { data: modules } = await db
    .from('modules')
    .select('id')
    .eq('role_id', roleId)
    .eq('is_published', true)

  if (!modules || modules.length === 0) return false

  const moduleIds = modules.map(m => m.id)

  const { data: moduleTests } = await db
    .from('tests')
    .select('id')
    .in('module_id', moduleIds)
    .eq('test_type', 'module')

  if (!moduleTests || moduleTests.length === 0) return true // no module tests → already unlocked

  // Check whether the user has a passing attempt for every module test
  const testIds = moduleTests.map(t => t.id)

  const { data: passedAttempts } = await db
    .from('test_attempts')
    .select('test_id')
    .eq('user_id', userId)
    .eq('passed', true)
    .in('test_id', testIds)

  const passedIds = new Set((passedAttempts ?? []).map(a => a.test_id))

  return testIds.every(id => passedIds.has(id))
}

export { assessment as assessmentRouter }
