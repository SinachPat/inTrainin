import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createServerClient } from '@intrainin/db'
import {
  RequestOtpSchema,
  VerifyOtpSchema,
  CompleteProfileSchema,
  UpdateNotificationPrefsSchema,
  EmailLoginSchema,
  EmailRegisterSchema,
  ERROR_CODES,
  type AccountType,
} from '@intrainin/shared'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const auth = new Hono<{ Variables: AuthVariables }>()

// ─── POST /auth/otp/send ──────────────────────────────────────────────────────
// Step 1 of login/signup — request a 6-digit OTP sent via SMS.
// Supabase handles OTP generation + delivery (swap to Termii in Layer 8
// via Supabase custom SMS hook).

auth.post('/otp/send', zValidator('json', RequestOtpSchema), async (c) => {
  const { phone } = c.req.valid('json')
  const db = createServerClient()

  // Normalise to E.164 (+234XXXXXXXXXX) regardless of input format
  const e164 = phone.startsWith('+')     ? phone
             : phone.startsWith('0')   ? `+234${phone.slice(1)}`
             : phone.startsWith('234') ? `+${phone}`
             : `+234${phone}`

  const { error } = await db.auth.signInWithOtp({ phone: e164 })

  if (error) {
    if (error.message.toLowerCase().includes('rate')) {
      return c.json(
        { success: false, error: 'Too many requests. Try again shortly.', code: ERROR_CODES.OTP_MAX_ATTEMPTS },
        429,
      )
    }
    return c.json({ success: false, error: error.message }, 400)
  }

  return c.json({ success: true, data: { message: 'OTP sent' } })
})

// ─── POST /auth/otp/verify ────────────────────────────────────────────────────
// Step 2 — verify the 6-digit code. On success Supabase returns a session.
// We upsert the user row in public.users and return the tokens plus a flag
// indicating whether the profile still needs to be completed.

auth.post('/otp/verify', zValidator('json', VerifyOtpSchema), async (c) => {
  const { phone, code } = c.req.valid('json')
  const db = createServerClient()

  const e164 = phone.startsWith('+')     ? phone
             : phone.startsWith('0')   ? `+234${phone.slice(1)}`
             : phone.startsWith('234') ? `+${phone}`
             : `+234${phone}`

  const { data, error } = await db.auth.verifyOtp({
    phone: e164,
    token: code,
    type:  'sms',
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('expired') || msg.includes('invalid') || msg.includes('not found')) {
      return c.json(
        { success: false, error: 'Invalid or expired OTP', code: ERROR_CODES.OTP_INVALID },
        400,
      )
    }
    return c.json({ success: false, error: error.message }, 400)
  }

  const authUser = data.user
  if (!authUser || !data.session) {
    return c.json({ success: false, error: 'Verification failed — no session returned' }, 400)
  }

  // Upsert into public.users — creates on first login, preserves data on re-login
  const rawType     = authUser.user_metadata?.account_type as string | undefined
  const accountType = (rawType === 'business' || rawType === 'admin' ? rawType : 'learner') as AccountType
  const { error: upsertError } = await db.from('users').upsert(
    {
      id:           authUser.id,
      phone:        e164,
      account_type: accountType,
      full_name:    (authUser.user_metadata?.full_name  as string | undefined) ?? '',
    },
    { onConflict: 'id', ignoreDuplicates: false },
  )

  if (upsertError) {
    console.error('[auth/otp/verify] users upsert error:', upsertError.message)
  }

  // Determine whether the user still needs to complete their profile
  const { data: profile } = await db
    .from('users')
    .select('full_name, location_city, account_type')
    .eq('id', authUser.id)
    .single()

  const profileComplete = Boolean(profile?.full_name?.trim() && profile?.location_city)

  // If the upsert failed and profile is null, fall back to auth metadata
  // so a new business signup isn't misrouted to the learner dashboard.
  const returnedAccountType = profile?.account_type
    ?? (rawType === 'business' || rawType === 'admin' ? rawType : 'learner')

  return c.json({
    success: true,
    data: {
      accessToken:     data.session.access_token,
      refreshToken:    data.session.refresh_token,
      expiresIn:       data.session.expires_in,
      profileComplete,
      accountType:     returnedAccountType,
    },
  })
})

// ─── POST /auth/profile/complete ─────────────────────────────────────────────
// Step 3 (first login only) — save full name, city, account type, and optional
// career goal role or business name. Protected by JWT.

auth.post(
  '/profile/complete',
  authMiddleware,
  zValidator('json', CompleteProfileSchema),
  async (c) => {
    const userId = c.get('userId')
    const body   = c.req.valid('json')
    const db     = createServerClient()

    // Resolve career goal: prefer explicit UUID, fall back to looking up by slug
    let careerGoalRoleId = body.careerGoalRoleId ?? null
    if (!careerGoalRoleId && body.careerGoalRoleSlug && body.careerGoalRoleSlug !== 'other') {
      const { data: roleRow } = await db
        .from('roles')
        .select('id')
        .eq('slug', body.careerGoalRoleSlug)
        .single()
      careerGoalRoleId = roleRow?.id ?? null
    }

    // Resolve the phone from Supabase auth so the upsert's INSERT path never
    // creates a row with phone = NULL (race: otp/verify may not have committed yet).
    const { data: { user: authUser } } = await db.auth.admin.getUserById(userId)
    const phone = authUser?.phone ?? null

    // Upsert (not update) — ensures the row exists even if the otp/verify upsert
    // silently failed (e.g. DB schema not yet migrated). Update would be a no-op
    // on a missing row without returning an error, leaving user as null below.
    const { error: userError } = await db
      .from('users')
      .upsert(
        {
          id:                  userId,
          phone,
          ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
          full_name:           body.fullName.trim(),
          location_city:       body.locationCity,
          account_type:        body.accountType,
          career_goal_role_id: careerGoalRoleId,
          ...(body.jobLocationPref ? { job_location_pref: body.jobLocationPref } : {}),
        },
        { onConflict: 'id' },
      )

    if (userError) {
      return c.json({ success: false, error: userError.message }, 500)
    }

    // Business accounts: ensure a businesses row exists.
    // Use insert (not upsert) so this works even before migration 005 applies the
    // owner_user_id unique constraint. Unique-violation (23505) means the row
    // already exists — that's fine. Any other error is a real problem.
    if (body.accountType === 'business' && body.businessName) {
      const { error: bizError } = await db.from('businesses').insert(
        { owner_user_id: userId, name: body.businessName.trim() },
      )
      if (bizError && bizError.code !== '23505') {
        console.error('[auth/profile/complete] businesses insert error:', bizError.message)
      }
    }

    // Persist account_type (and email if provided) into Supabase auth so JWT claims
    // and the auth.users row stay consistent with public.users.
    await db.auth.admin.updateUserById(userId, {
      ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
      user_metadata: {
        account_type: body.accountType,
        full_name:    body.fullName.trim(),
      },
    })

    const { data: user, error: selectError } = await db
      .from('users')
      .select('id, full_name, location_city, account_type, career_goal_role_id, created_at')
      .eq('id', userId)
      .single()

    if (selectError || !user) {
      console.error('[auth/profile/complete] user select failed:', selectError?.message)
      return c.json({ success: false, error: 'Profile saved but user record not found — check DB migration' }, 500)
    }

    // Grant 10 free credits on first-ever profile completion (idempotent — only if
    // the user has no credit rows yet, so re-submitting the form doesn't re-grant).
    const { count } = await db
      .from('job_hub_credits')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) === 0) {
      await db
        .from('job_hub_credits')
        .insert({ user_id: userId, amount: 10, reason: 'monthly_grant' })
        .then(({ error: e }) => {
          if (e) console.error('[auth/profile/complete] credits grant error:', e.message)
        })
    }

    return c.json({ success: true, data: { user } })
  },
)

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const [{ data: user, error }, { data: authUserData }] = await Promise.all([
    db.from('users').select(`
      id, phone, email, full_name, location_city, location_state,
      account_type, avatar_url, xp_total, streak_current,
      streak_last_activity_date, notification_prefs, job_location_pref,
      resume_url, created_at
    `).eq('id', userId).single(),
    db.auth.admin.getUserById(userId),
  ])

  if (error || !user) {
    return c.json(
      { success: false, error: 'User not found', code: ERROR_CODES.NOT_FOUND },
      404,
    )
  }

  // public.users.phone may be null if profile/complete ran before the OTP upsert
  // committed. The phone is always canonical in auth.users, so fall back there.
  const phone = user.phone ?? authUserData.user?.phone ?? null

  return c.json({ success: true, data: { user: { ...user, phone } } })
})

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
// Unauthenticated — exchanges a valid refresh token for a new access+refresh pair.
// Called automatically by api.ts when a request returns 401.

auth.post('/refresh', async (c) => {
  let body: { refreshToken?: string }
  try { body = await c.req.json() } catch { body = {} }

  if (!body.refreshToken) {
    return c.json({ success: false, error: 'refreshToken is required' }, 400)
  }

  const db = createServerClient()
  const { data, error } = await db.auth.refreshSession({ refresh_token: body.refreshToken })

  if (error || !data.session) {
    return c.json({ success: false, error: 'Invalid or expired refresh token' }, 401)
  }

  return c.json({
    success: true,
    data: {
      accessToken:  data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn:    data.session.expires_in,
    },
  })
})

// ─── POST /auth/logout ────────────────────────────────────────────────────────

auth.post('/logout', authMiddleware, async (c) => {
  const db    = createServerClient()
  const token = c.req.header('Authorization')!.slice(7)

  const { error } = await db.auth.admin.signOut(token)
  if (error) console.error('[auth/logout] signOut error:', error.message)

  return c.json({ success: true, data: { message: 'Logged out' } })
})

// ─── PUT /auth/notifications ──────────────────────────────────────────────────

auth.put(
  '/notifications',
  authMiddleware,
  zValidator('json', UpdateNotificationPrefsSchema),
  async (c) => {
    const userId = c.get('userId')
    const prefs  = c.req.valid('json')
    const db     = createServerClient()

    const { error } = await db
      .from('users')
      .update({ notification_prefs: prefs })
      .eq('id', userId)

    if (error) {
      return c.json({ success: false, error: error.message }, 500)
    }

    return c.json({ success: true, data: { notificationPrefs: prefs } })
  },
)

// ─── POST /auth/profile/resume/upload-url ────────────────────────────────────
// Protected — returns a short-lived signed upload URL for the user's CV/resume.
// The client uploads directly to Supabase Storage; only the resulting public
// path is stored on public.users.resume_url.

auth.post('/profile/resume/upload-url', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  // File lives at resumes/{userId}/cv.pdf — overwrites on re-upload
  const path = `${userId}/cv.pdf`

  const { data, error } = await db.storage
    .from('resumes')
    .createSignedUploadUrl(path)

  if (error || !data) {
    return c.json({ success: false, error: error?.message ?? 'Could not create upload URL' }, 500)
  }

  // After the client uploads, it should call PATCH /auth/profile/resume to
  // persist the storage path on the user's record.
  return c.json({
    success: true,
    data: {
      signedUrl: data.signedUrl,
      token:     data.token,
      path,
    },
  })
})

// ─── PATCH /auth/profile/resume ───────────────────────────────────────────────
// Protected — called after a successful direct upload to confirm the path and
// persist it on public.users.resume_url.

auth.patch('/profile/resume', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  let body: { path?: string }
  try { body = await c.req.json() } catch { body = {} }

  if (!body.path) {
    return c.json({ success: false, error: 'path is required' }, 400)
  }

  // Verify the path belongs to this user and contains no traversal sequences
  const hasTraversal = body.path.includes('..') || body.path.includes('%2e%2e') || body.path.includes('%2E%2E')
  if (hasTraversal || !body.path.startsWith(`${userId}/`)) {
    return c.json({ success: false, error: 'Forbidden' }, 403)
  }

  const { error } = await db
    .from('users')
    .update({ resume_url: body.path })
    .eq('id', userId)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { resumeUrl: body.path } })
})

// ─── DELETE /auth/profile/resume ─────────────────────────────────────────────
// Protected — removes the stored CV from Storage and clears resume_url.

auth.delete('/profile/resume', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  const path = `${userId}/cv.pdf`

  // Remove from storage (best-effort — don't block on not-found)
  await db.storage.from('resumes').remove([path])

  const { error } = await db
    .from('users')
    .update({ resume_url: null })
    .eq('id', userId)

  if (error) return c.json({ success: false, error: error.message }, 500)

  return c.json({ success: true, data: { message: 'Resume removed' } })
})

// ─── GET /auth/users/:id/public ──────────────────────────────────────────────
// Unauthenticated — returns name, city, role, and earned certificates for a
// learner's shareable public profile. Only exposes what the user has made public.

auth.get('/users/:id/public', async (c) => {
  const profileUserId = c.req.param('id')
  const db = createServerClient()

  const [userRes, certsRes] = await Promise.all([
    db.from('users')
      .select('id, full_name, location_city, account_type, avatar_url, created_at, career_goal_role_id')
      .eq('id', profileUserId)
      .maybeSingle(),
    db.from('certificates')
      .select('id, issued_at, verification_code, roles(title, slug, icon)')
      .eq('user_id', profileUserId)
      .order('issued_at', { ascending: false }),
  ])

  if (!userRes.data) {
    return c.json({ success: false, error: 'Profile not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  // Don't expose business accounts on public profiles
  if (userRes.data.account_type !== 'learner') {
    return c.json({ success: false, error: 'Profile not found', code: ERROR_CODES.NOT_FOUND }, 404)
  }

  return c.json({
    success: true,
    data: {
      user: {
        id:           userRes.data.id,
        fullName:     userRes.data.full_name,
        locationCity: userRes.data.location_city,
        joinedAt:     userRes.data.created_at,
      },
      certificates: (certsRes.data ?? []).map(cert => ({
        id:               cert.id,
        issuedAt:         cert.issued_at,
        verificationCode: cert.verification_code,
        role:             cert.roles,
      })),
    },
  })
})

// ─── POST /auth/email/login ───────────────────────────────────────────────────
// Email + password login. Returns the same session shape as /auth/otp/verify
// so the frontend can use a single post-auth handler.

auth.post('/email/login', zValidator('json', EmailLoginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const db = createServerClient()

  const { data, error } = await db.auth.signInWithPassword({ email, password })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('not found')) {
      return c.json({ success: false, error: 'Invalid email or password', code: ERROR_CODES.OTP_INVALID }, 400)
    }
    if (msg.includes('email not confirmed')) {
      return c.json({ success: false, error: 'Please confirm your email address before signing in.' }, 400)
    }
    return c.json({ success: false, error: error.message }, 400)
  }

  if (!data.session || !data.user) {
    return c.json({ success: false, error: 'Login failed — no session returned' }, 400)
  }

  // Upsert public.users row (handles case where Google OAuth created the user
  // but profile/complete was never called)
  const rawType     = data.user.user_metadata?.account_type as string | undefined
  const accountType = (rawType === 'business' || rawType === 'admin' ? rawType : 'learner') as AccountType

  await db.from('users').upsert(
    {
      id:           data.user.id,
      email:        email.toLowerCase(),
      account_type: accountType,
      full_name:    (data.user.user_metadata?.full_name as string | undefined) ?? '',
    },
    { onConflict: 'id', ignoreDuplicates: false },
  ).then(({ error: e }) => {
    if (e) console.error('[auth/email/login] users upsert error:', e.message)
  })

  const { data: profile } = await db
    .from('users')
    .select('full_name, location_city, account_type')
    .eq('id', data.user.id)
    .single()

  const profileComplete   = Boolean(profile?.full_name?.trim() && profile?.location_city)
  const returnedAccType   = profile?.account_type ?? accountType

  return c.json({
    success: true,
    data: {
      accessToken:     data.session.access_token,
      refreshToken:    data.session.refresh_token,
      expiresIn:       data.session.expires_in,
      profileComplete,
      accountType:     returnedAccType,
    },
  })
})

// ─── POST /auth/email/register ────────────────────────────────────────────────
// Create a new account with email + password.
// Profile setup (name, city, account type) is handled by /auth/profile/complete
// so new users always land on the onboarding flow.

auth.post('/email/register', zValidator('json', EmailRegisterSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const db = createServerClient()

  // Check if an account already exists for this email
  const { data: existing } = await db.auth.admin.listUsers()
  const alreadyExists = existing?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase())

  if (alreadyExists) {
    return c.json({
      success: false,
      error: 'An account with this email already exists. Please sign in.',
      code: 'EMAIL_TAKEN',
    }, 409)
  }

  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip confirmation email — user is signing up directly
  })

  if (error || !data.user) {
    return c.json({ success: false, error: error?.message ?? 'Registration failed' }, 400)
  }

  // Sign in immediately to get a session
  const { data: signInData, error: signInErr } = await db.auth.signInWithPassword({ email, password })

  if (signInErr || !signInData.session) {
    return c.json({ success: false, error: 'Account created but sign-in failed. Please try signing in manually.' }, 500)
  }

  // Create a stub users row — profile/complete will fill in name, city, etc.
  await db.from('users').upsert(
    { id: data.user.id, email: email.toLowerCase(), account_type: 'learner', full_name: '' },
    { onConflict: 'id', ignoreDuplicates: true },
  ).then(({ error: e }) => {
    if (e) console.error('[auth/email/register] users upsert error:', e.message)
  })

  return c.json({
    success: true,
    data: {
      accessToken:     signInData.session.access_token,
      refreshToken:    signInData.session.refresh_token,
      expiresIn:       signInData.session.expires_in,
      profileComplete: false, // always — new user must complete onboarding
      accountType:     'learner' as AccountType,
    },
  })
})

export { auth as authRouter }
