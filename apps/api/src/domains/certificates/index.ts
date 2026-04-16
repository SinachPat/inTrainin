import { Hono } from 'hono'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import QRCode from 'qrcode'
import { createServerClient } from '@intrainin/db'
import { ERROR_CODES } from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'
import { awardXp, checkBadges } from '../../lib/gamification.js'

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

  // Expect { roleId } in the JSON body — must be a valid UUID
  let roleId: string | undefined
  try {
    const body = await c.req.json<{ roleId?: string }>()
    roleId = typeof body.roleId === 'string' ? body.roleId : undefined
  } catch {
    // fall through to validation error
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!roleId || !UUID_RE.test(roleId)) {
    return c.json({ success: false, error: 'roleId is required and must be a valid UUID' }, 400)
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

  // Mark enrollment as completed BEFORE issuing the cert so the two states
  // are always consistent — a cert can only exist when enrollment is completed.
  // If this update fails we stop here; no cert is issued and the learner can retry.
  const { error: enrollmentUpdateError } = await db
    .from('enrollments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', enrolment.id)

  if (enrollmentUpdateError) {
    console.error('[certificates/issue] enrollment status update failed:', enrollmentUpdateError.message)
    return c.json({ success: false, error: 'Failed to update enrollment status' }, 500)
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

  if (issueError) {
    // 23505 = unique_violation — another concurrent request already issued the cert
    if (issueError.code === '23505') {
      const { data: race } = await db
        .from('certificates')
        .select('id, verification_code, issued_at')
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .eq('is_revoked', false)
        .maybeSingle()
      if (race) return c.json({ success: true, data: { certificate: race, alreadyIssued: true } })
    }
    // Cert insert failed — revert enrollment back to active so learner can retry
    await db
      .from('enrollments')
      .update({ status: 'active', completed_at: null })
      .eq('id', enrolment.id)
    return c.json({ success: false, error: issueError.message }, 500)
  }

  // Fire-and-forget: gamification failure must never break the response
  Promise.all([
    awardXp(db, userId, 200),
    checkBadges(db, userId),
  ]).catch(console.error)

  return c.json({ success: true, data: { certificate: cert, alreadyIssued: false } }, 201)
})

// ─── GET /certificates/:id/image ─────────────────────────────────────────────
// Protected — generate and return a shareable PNG certificate for the given
// certificate ID. Only the owner can download their own certificate.

certificates.get('/:id/image', authMiddleware, async (c) => {
  const certId = c.req.param('id')
  const userId = c.get('userId')
  const db     = createServerClient()

  const { data: cert, error } = await db
    .from('certificates')
    .select(`
      id, verification_code, issued_at, is_revoked,
      users ( full_name ),
      roles ( title )
    `)
    .eq('id', certId)
    .eq('user_id', userId)
    .eq('is_revoked', false)
    .maybeSingle()

  if (error || !cert) {
    return c.json(
      { success: false, error: 'Certificate not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const learnerName = (cert.users as { full_name: string } | null)?.full_name ?? 'Learner'
  const roleTitle   = (cert.roles as { title: string } | null)?.title ?? 'Role'
  const issuedDate  = new Date(cert.issued_at).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const verifyUrl = `${process.env.APP_URL ?? 'https://intrainin.com'}/verify/${cert.verification_code}`

  // ── Canvas setup ─────────────────────────────────────────────────────────────
  const W = 1200
  const H = 800
  const canvas = createCanvas(W, H)
  const ctx    = canvas.getContext('2d')

  // Background — deep dark
  ctx.fillStyle = '#0c0c0c'
  ctx.fillRect(0, 0, W, H)

  // Subtle noise texture via a fine dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.015)'
  for (let x = 0; x < W; x += 8) {
    for (let y = 0; y < H; y += 8) {
      ctx.fillRect(x, y, 1, 1)
    }
  }

  // Top accent bar (brand orange)
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0,   '#f97316')
  grad.addColorStop(0.5, '#fb923c')
  grad.addColorStop(1,   '#f97316')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, 6)

  // Bottom accent bar (faint)
  ctx.fillStyle = 'rgba(249,115,22,0.35)'
  ctx.fillRect(0, H - 4, W, 4)

  // Border frame
  ctx.strokeStyle = 'rgba(249,115,22,0.18)'
  ctx.lineWidth   = 1.5
  ctx.strokeRect(24, 18, W - 48, H - 36)

  // Inner border (double-frame effect)
  ctx.strokeStyle = 'rgba(249,115,22,0.08)'
  ctx.lineWidth   = 1
  ctx.strokeRect(30, 24, W - 60, H - 48)

  // ── Brand wordmark ───────────────────────────────────────────────────────────
  ctx.font         = 'bold 22px sans-serif'
  ctx.fillStyle    = '#f97316'
  ctx.letterSpacing = '4px'
  ctx.fillText('INTRAININ', 60, 68)

  ctx.font         = '13px sans-serif'
  ctx.fillStyle    = 'rgba(255,255,255,0.4)'
  ctx.letterSpacing = '0px'
  ctx.fillText('Nigeria\'s #1 Practical Skills Platform', 60, 92)

  // Decorative divider under brand
  ctx.strokeStyle = 'rgba(249,115,22,0.25)'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(60, 108)
  ctx.lineTo(W - 60, 108)
  ctx.stroke()

  // ── Certificate heading ───────────────────────────────────────────────────────
  ctx.font      = '18px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.textAlign = 'center'
  ctx.fillText('CERTIFICATE OF COMPLETION', W / 2, 178)

  // Decorative dots flanking heading
  ctx.fillStyle = '#f97316'
  for (let i = 0; i < 5; i++) {
    const x = W / 2 - 120 + i * 10
    ctx.beginPath()
    ctx.arc(x, 178, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(W / 2 + 80 + i * 10, 178, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── "This certifies that" ─────────────────────────────────────────────────────
  ctx.font      = '16px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText('This certifies that', W / 2, 230)

  // ── Learner name ──────────────────────────────────────────────────────────────
  ctx.font      = 'bold 56px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(learnerName, W / 2, 305)

  // Underline beneath name
  const nameWidth = ctx.measureText(learnerName).width
  ctx.strokeStyle = 'rgba(249,115,22,0.6)'
  ctx.lineWidth   = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - nameWidth / 2, 318)
  ctx.lineTo(W / 2 + nameWidth / 2, 318)
  ctx.stroke()

  // ── "has successfully completed" ─────────────────────────────────────────────
  ctx.font      = '16px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText('has successfully completed', W / 2, 365)

  // ── Role title ────────────────────────────────────────────────────────────────
  ctx.font      = 'bold 34px sans-serif'
  ctx.fillStyle = '#f97316'
  ctx.fillText(roleTitle, W / 2, 420)

  // ── Issued date ───────────────────────────────────────────────────────────────
  ctx.font      = '14px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText(`Issued on ${issuedDate}`, W / 2, 470)

  // Divider before footer
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(60, 510)
  ctx.lineTo(W - 60, 510)
  ctx.stroke()

  // ── QR code (bottom-right) ────────────────────────────────────────────────────
  const QR_SIZE = 120
  const qrBuffer  = await QRCode.toBuffer(verifyUrl, {
    type:   'png',
    width:  QR_SIZE,
    margin: 1,
    color:  { dark: '#f97316', light: '#0c0c0c' },
  })
  const qrImage = await loadImage(qrBuffer)

  const qrX = W - 60 - QR_SIZE
  const qrY = 535

  // QR background square
  ctx.fillStyle = '#0c0c0c'
  ctx.fillRect(qrX - 4, qrY - 4, QR_SIZE + 8, QR_SIZE + 8)
  ctx.strokeStyle = 'rgba(249,115,22,0.3)'
  ctx.lineWidth   = 1
  ctx.strokeRect(qrX - 4, qrY - 4, QR_SIZE + 8, QR_SIZE + 8)
  ctx.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE)

  ctx.font      = '11px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.textAlign = 'center'
  ctx.fillText('Scan to verify', qrX + QR_SIZE / 2, qrY + QR_SIZE + 18)

  // ── Verification code (bottom-left) ──────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.font      = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText('Verification ID', 60, 558)

  ctx.font      = '13px monospace'
  ctx.fillStyle = 'rgba(249,115,22,0.85)'
  ctx.fillText(cert.verification_code.toUpperCase(), 60, 580)

  ctx.font      = '12px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fillText('Verify at intrainin.com/verify', 60, 615)

  // ── Seal / badge (center-bottom) ─────────────────────────────────────────────
  const sealX = W / 2
  const sealY = 598
  const sealR = 38

  // Outer ring
  ctx.strokeStyle = 'rgba(249,115,22,0.4)'
  ctx.lineWidth   = 2
  ctx.beginPath()
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2)
  ctx.stroke()

  // Inner fill
  ctx.fillStyle = 'rgba(249,115,22,0.08)'
  ctx.beginPath()
  ctx.arc(sealX, sealY, sealR - 4, 0, Math.PI * 2)
  ctx.fill()

  // Checkmark
  ctx.strokeStyle = '#f97316'
  ctx.lineWidth   = 3
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.beginPath()
  ctx.moveTo(sealX - 14, sealY)
  ctx.lineTo(sealX - 4,  sealY + 12)
  ctx.lineTo(sealX + 16, sealY - 12)
  ctx.stroke()

  // ── Render ─────────────────────────────────────────────────────────────────────
  const png = canvas.toBuffer('image/png')

  const safeName = learnerName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
  // Buffer is Uint8Array, not ArrayBuffer — extract the exact slice so we
  // don't accidentally include data from a shared backing ArrayBuffer.
  const pngAb = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer
  c.header('Content-Type',        'image/png')
  c.header('Content-Disposition', `attachment; filename="intrainin-certificate-${safeName}.png"`)
  c.header('Cache-Control',       'private, max-age=3600')
  return c.body(pngAb)
})

// ─── GET /certificates/verify/:code ──────────────────────────────────────────
// Public — anyone can verify a certificate by its code (e.g. QR scan).

certificates.get('/verify/:code', async (c) => {
  const code = c.req.param('code')

  // Reject clearly invalid codes early to avoid unnecessary DB queries
  if (!code || code.length > 64) {
    return c.json(
      { success: false, error: 'Certificate not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  const db = createServerClient()

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
      { success: false, error: 'Certificate has been revoked', code: 'CERTIFICATE_REVOKED' },
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
