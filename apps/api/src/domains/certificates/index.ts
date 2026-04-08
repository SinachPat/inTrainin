import { Hono } from 'hono'
import { createServerClient } from '@intrainin/db'
import { ERROR_CODES } from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const certificates = new Hono<{ Variables: AuthVariables }>()

// ─── GET /certificates ────────────────────────────────────────────────────────
// Protected — all certificates earned by the authenticated user.

certificates.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data, error } = await db
    .from('certificates')
    .select(`
      id, verification_code, issued_at, image_url, is_revoked,
      roles ( id, slug, title )
    `)
    .eq('user_id', userId)
    .eq('is_revoked', false)
    .order('issued_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { certificates: data ?? [] } })
})

// ─── POST /certificates/issue ─────────────────────────────────────────────────
// Protected — issue a certificate once the learner has passed the final exam.
// Called from the assessment domain after a final exam pass, or by the client
// explicitly after the user finishes their final exam.

certificates.post('/issue', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  // Expect { roleId } in the JSON body
  let roleId: string | undefined
  try {
    const body = await c.req.json<{ roleId?: string }>()
    roleId = body.roleId
  } catch {
    // fall through to validation error
  }

  if (!roleId) {
    return c.json({ success: false, error: 'roleId is required' }, 400)
  }

  // Verify active enrolment
  const { data: enrolment } = await db
    .from('enrollments')
    .select('id, status')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .maybeSingle()

  if (!enrolment || enrolment.status !== 'active') {
    return c.json(
      { success: false, error: 'Not enrolled in this role', code: ERROR_CODES.NOT_ENROLLED },
      403,
    )
  }

  // Idempotent — return existing certificate if one already exists
  const { data: existing } = await db
    .from('certificates')
    .select('id, verification_code, issued_at')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .eq('is_revoked', false)
    .maybeSingle()

  if (existing) {
    return c.json({ success: true, data: { certificate: existing, alreadyIssued: true } })
  }

  // Verify the learner has actually passed the final exam for this role
  const { data: finalTest } = await db
    .from('tests')
    .select('id')
    .eq('role_id', roleId)
    .eq('test_type', 'final')
    .maybeSingle()

  if (!finalTest) {
    return c.json(
      { success: false, error: 'No final exam found for this role', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const { data: passingAttempt } = await db
    .from('test_attempts')
    .select('id')
    .eq('user_id', userId)
    .eq('test_id', finalTest.id)
    .eq('passed', true)
    .limit(1)
    .maybeSingle()

  if (!passingAttempt) {
    return c.json(
      {
        success: false,
        error:   'Final exam not yet passed',
        code:    ERROR_CODES.TEST_NOT_UNLOCKED,
      },
      403,
    )
  }

  // Issue the certificate
  const { data: cert, error: issueError } = await db
    .from('certificates')
    .insert({
      user_id:       userId,
      role_id:       roleId,
      enrollment_id: enrolment.id,
    })
    .select('id, verification_code, issued_at')
    .single()

  if (issueError) return c.json({ success: false, error: issueError.message }, 500)

  // Mark enrollment as completed
  await db
    .from('enrollments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', enrolment.id)

  return c.json({ success: true, data: { certificate: cert, alreadyIssued: false } }, 201)
})

// ─── GET /certificates/verify/:code ──────────────────────────────────────────
// Public — anyone can verify a certificate by its code (e.g. QR scan).

certificates.get('/verify/:code', async (c) => {
  const code = c.req.param('code')
  const db   = createServerClient()

  const { data: cert, error } = await db
    .from('certificates')
    .select(`
      id, verification_code, issued_at, is_revoked,
      users ( id, full_name ),
      roles ( id, slug, title )
    `)
    .eq('verification_code', code)
    .single()

  if (error || !cert) {
    return c.json(
      { success: false, error: 'Certificate not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  if (cert.is_revoked) {
    return c.json(
      { success: false, error: 'Certificate has been revoked', code: ERROR_CODES.UNAUTHORIZED },
      410,
    )
  }

  return c.json({
    success: true,
    data: {
      certificate: {
        verificationCode: cert.verification_code,
        issuedAt:         cert.issued_at,
        learner:          cert.users,
        role:             cert.roles,
      },
    },
  })
})

export { certificates as certificatesRouter }
