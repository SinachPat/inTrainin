import { createServerClient } from '@intrainin/db'

type DbClient = ReturnType<typeof createServerClient>

// ─── XP constants ─────────────────────────────────────────────────────────────
const XP_TOPIC_COMPLETE  = 10
const XP_MODULE_TEST_PASS = 50
const XP_FINAL_EXAM_PASS = 200
const XP_ENROLMENT       = 5

// =============================================================================
// Streak helper
// =============================================================================

/** Updates streak_current and streak_last_activity_date for a user. */
async function updateStreak(db: DbClient, userId: string): Promise<void> {
  const { data: user, error: fetchError } = await db
    .from('users')
    .select('streak_current, streak_last_activity_date')
    .eq('id', userId)
    .single()

  if (fetchError) {
    console.error('[gamification] updateStreak fetch error:', fetchError.message)
    return
  }

  if (!user) return

  const today     = new Date()
  const todayStr  = today.toISOString().slice(0, 10) // YYYY-MM-DD
  const lastDate  = user.streak_last_activity_date

  if (lastDate === todayStr) {
    // Already active today — no change needed
    return
  }

  let newStreak: number

  if (lastDate) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    newStreak = lastDate === yesterdayStr
      ? (user.streak_current ?? 0) + 1  // continued streak
      : 1                                // broken streak — reset
  } else {
    newStreak = 1 // first ever activity
  }

  const { error: updateError } = await db
    .from('users')
    .update({
      streak_current:             newStreak,
      streak_last_activity_date:  todayStr,
    })
    .eq('id', userId)

  if (updateError) {
    console.error('[gamification] updateStreak update error:', updateError.message)
  }
}

// =============================================================================
// Core functions
// =============================================================================

/**
 * Award XP to a user and update their streak.
 * Uses an RPC for an atomic increment — avoids the read-modify-write race
 * condition where two concurrent events (e.g. topic complete + test pass)
 * both read the same stale xp_total and one overwrites the other.
 * The RPC is defined in migration 009.
 * Returns the new XP total.
 */
export async function awardXp(db: DbClient, userId: string, xp: number): Promise<number> {
  // The Supabase generated types don't include increment_user_xp (migration 009
  // custom function). Double-cast via unknown to satisfy TS strict overlap check
  // without casting the whole db client.
  type RpcFn = (fn: string, args: Record<string, unknown>) => Promise<{ data: number | null; error: { message: string } | null }>
  const { data, error } = await (db.rpc as unknown as RpcFn)(
    'increment_user_xp', { p_user_id: userId, p_amount: xp },
  )

  if (error) {
    console.error('[gamification] increment_user_xp RPC error:', error.message)
    // Return -1 (not 0) so callers can distinguish "awarded 0 XP" from "award failed".
    return -1
  }

  // Update streak alongside every XP award
  await updateStreak(db, userId)

  return (data as number | null) ?? 0
}

/**
 * Check all badge triggers for a user and insert any newly earned badges.
 * Badge award is idempotent — existing awards are skipped.
 */
export async function checkBadges(db: DbClient, userId: string): Promise<void> {
  // Fetch all badges
  const { data: badges, error: badgesError } = await db
    .from('badges')
    .select('id, trigger_type, trigger_value')

  if (badgesError) {
    console.error('[gamification] checkBadges fetch badges error:', badgesError.message)
    return
  }

  if (!badges || badges.length === 0) return

  // Fetch already-earned badge ids for this user
  const { data: earned, error: earnedError } = await db
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  if (earnedError) {
    console.error('[gamification] checkBadges fetch earned badges error:', earnedError.message)
    return
  }

  const earnedIds = new Set((earned ?? []).map(e => e.badge_id))

  // Gather counts we may need (lazy, per-badge-type)
  let enrollmentCount:    number | null = null
  let modulePassedCount:  number | null = null
  let certificateCount:   number | null = null
  let streakCurrent:      number | null = null

  const getEnrollmentCount = async (): Promise<number> => {
    if (enrollmentCount !== null) return enrollmentCount
    const { count } = await db
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    enrollmentCount = count ?? 0
    return enrollmentCount
  }

  const getModulePassedCount = async (): Promise<number> => {
    if (modulePassedCount !== null) return modulePassedCount
    // test_type lives on the tests table, not test_attempts — join via test_id
    const { data: moduleTests } = await db
      .from('tests')
      .select('id')
      .eq('test_type', 'module')
    const moduleTestIds = (moduleTests ?? []).map(t => t.id)
    if (moduleTestIds.length === 0) {
      modulePassedCount = 0
      return 0
    }
    const { count } = await db
      .from('test_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('passed', true)
      .in('test_id', moduleTestIds)
    modulePassedCount = count ?? 0
    return modulePassedCount
  }

  const getCertificateCount = async (): Promise<number> => {
    if (certificateCount !== null) return certificateCount
    const { count } = await db
      .from('certificates')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    certificateCount = count ?? 0
    return certificateCount
  }

  const getStreakCurrent = async (): Promise<number> => {
    if (streakCurrent !== null) return streakCurrent
    const { data: user } = await db
      .from('users')
      .select('streak_current')
      .eq('id', userId)
      .single()
    streakCurrent = user?.streak_current ?? 0
    return streakCurrent
  }

  const toInsert: Array<{ user_id: string; badge_id: string }> = []

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue  // already earned

    // trigger_value comes from Supabase as unknown/any; narrow to a plain object
    // so we can safely read .count and .days without a TS error.
    const tv = (badge.trigger_value ?? {}) as Record<string, unknown>

    let qualifies = false

    switch (badge.trigger_type) {
      case 'first_enrollment': {
        const count = await getEnrollmentCount()
        qualifies = count >= 1
        break
      }
      case 'module_completed': {
        const required = typeof tv.count === 'number' ? tv.count : 1
        const count    = await getModulePassedCount()
        qualifies      = count >= required
        break
      }
      case 'certificate_issued': {
        const required = typeof tv.count === 'number' ? tv.count : 1
        const count    = await getCertificateCount()
        qualifies      = count >= required
        break
      }
      case 'roles_enrolled': {
        const required = typeof tv.count === 'number' ? tv.count : 1
        const count    = await getEnrollmentCount()
        qualifies      = count >= required
        break
      }
      case 'streak_days': {
        const required = typeof tv.days === 'number' ? tv.days : 1
        const streak   = await getStreakCurrent()
        qualifies      = streak >= required
        break
      }
      default:
        // Unknown trigger — skip
        break
    }

    if (qualifies) {
      toInsert.push({ user_id: userId, badge_id: badge.id })
    }
  }

  if (toInsert.length > 0) {
    // upsert with ignoreDuplicates handles the race where two concurrent
    // checkBadges calls both pass the earnedIds check before either inserts —
    // the second write is silently dropped on unique-violation.
    // Note: ignoreDuplicates was moved to upsert() in Supabase JS v2; insert()
    // no longer accepts it.
    await db.from('user_badges').upsert(toInsert, { onConflict: 'user_id,badge_id', ignoreDuplicates: true })
  }
}

// =============================================================================
// Event hooks — fire-and-forget entry points
// =============================================================================

/**
 * Called after a topic is marked complete.
 * Awards +10 XP, updates streak, checks badges.
 */
export async function onTopicComplete(db: DbClient, userId: string): Promise<void> {
  try {
    await awardXp(db, userId, XP_TOPIC_COMPLETE)
    await checkBadges(db, userId)
  } catch (err) {
    console.error('[gamification] onTopicComplete error:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Called after a test is passed.
 * Awards XP based on test type (module = +50, final = +200).
 */
export async function onTestPass(db: DbClient, userId: string, testType: 'module' | 'final'): Promise<void> {
  try {
    const xp = testType === 'final' ? XP_FINAL_EXAM_PASS : XP_MODULE_TEST_PASS
    await awardXp(db, userId, xp)
    await checkBadges(db, userId)
  } catch (err) {
    console.error('[gamification] onTestPass error:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Called after a user enrols in a role.
 * Awards +5 XP and checks 'first_enrollment' / 'roles_enrolled' badges.
 */
export async function onEnrolment(db: DbClient, userId: string): Promise<void> {
  try {
    await awardXp(db, userId, XP_ENROLMENT)
    await checkBadges(db, userId)
  } catch (err) {
    console.error('[gamification] onEnrolment error:', err instanceof Error ? err.message : String(err))
  }
}
