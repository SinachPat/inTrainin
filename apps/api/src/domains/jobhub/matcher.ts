/**
 * Job Hub matching algorithm.
 * Scores certified workers against a hire request and upserts job_matches.
 *
 * Scoring (max 100):
 *   +40  Role exact match (preferred_roles contains hire_request.role_id)
 *   +20  Role adjacent match (role is a progression of a preferred role)
 *   +25  Same city as hire request
 *   +10  Same state only (no city match)
 *   +25  Has a valid InTrainin certificate for the exact role
 *   +10  Availability = 'immediate'
 *   min 30 to appear in matches
 */

import { createServerClient } from '@intrainin/db'

export async function runMatchingForHireRequest(hireRequestId: string): Promise<void> {
  const db = createServerClient()

  // ── 1. Fetch the hire request ────────────────────────────────────────────────
  const { data: req } = await db
    .from('hire_requests')
    .select('id, role_id, location_city, location_state, certification_required, status')
    .eq('id', hireRequestId)
    .single()

  if (!req || req.status !== 'open') return

  // ── 2. Find adjacent roles via role_progressions ─────────────────────────────
  const { data: progressions } = await db
    .from('role_progressions')
    .select('from_role_id')
    .eq('to_role_id', req.role_id)

  const adjacentFromIds = (progressions ?? []).map(p => p.from_role_id)

  // ── 3. Find certified workers for this role ──────────────────────────────────
  const { data: certHolders } = await db
    .from('certificates')
    .select('user_id')
    .eq('role_id', req.role_id)
    .eq('is_revoked', false)

  const certifiedUserIds = new Set((certHolders ?? []).map(c => c.user_id))

  // ── 4. Query visible job hub profiles ────────────────────────────────────────
  // Include profiles that prefer the exact role OR an adjacent role
  const allRelevantRoles = [req.role_id, ...adjacentFromIds]

  const { data: profiles } = await db
    .from('job_hub_profiles')
    .select('user_id, preferred_roles, location_city, location_state, availability, is_visible')
    .eq('is_visible', true)

  if (!profiles || profiles.length === 0) return

  // ── 5. Score each candidate ──────────────────────────────────────────────────
  const candidates: { userId: string; score: number }[] = []

  for (const profile of profiles) {
    const prefs = (profile.preferred_roles ?? []) as string[]
    const hasExact    = prefs.includes(req.role_id)
    const hasAdjacent = !hasExact && adjacentFromIds.some(id => prefs.includes(id))

    // Must prefer at least one relevant role to be eligible
    if (!hasExact && !hasAdjacent) continue

    let score = 0

    // Role match
    if (hasExact)    score += 40
    if (hasAdjacent) score += 20

    // Location
    const sameCity  = profile.location_city?.toLowerCase() === req.location_city?.toLowerCase()
    const sameState = profile.location_state?.toLowerCase() === req.location_state?.toLowerCase()
    if (sameCity)       score += 25
    else if (sameState) score += 10

    // Certificate
    if (certifiedUserIds.has(profile.user_id)) score += 25

    // Availability bonus
    if (profile.availability === 'immediate') score += 10

    // Cap
    score = Math.min(score, 100)

    if (score >= 30) {
      candidates.push({ userId: profile.user_id, score })
    }
  }

  if (candidates.length === 0) return

  // Sort and take top 50
  candidates.sort((a, b) => b.score - a.score)
  const top50 = candidates.slice(0, 50)

  // ── 6. Upsert job_matches ────────────────────────────────────────────────────
  const now = new Date().toISOString()
  const rows = top50.map(c => ({
    hire_request_id:    hireRequestId,
    user_id:            c.userId,
    match_score:        c.score,
    status:             'pending' as const,
    worker_notified_at: now,
  }))

  // Supabase upsert on (hire_request_id, user_id) — refreshes score if candidate re-matches
  await db
    .from('job_matches')
    .upsert(rows, { onConflict: 'hire_request_id,user_id', ignoreDuplicates: false })
    .then(({ error }) => {
      if (error) console.error('[matcher] upsert error:', error.message)
    })
}
