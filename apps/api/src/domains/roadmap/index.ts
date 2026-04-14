import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createServerClient } from '@intrainin/db'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const roadmap = new Hono<{ Variables: AuthVariables }>()

// ─── Shared types ─────────────────────────────────────────────────────────────

type RoleShape = {
  id: string; slug: string; title: string
  price_ngn: number; estimated_hours: number | null
  categories: { name: string } | null
} | null

// ─── GET /roadmap/paths ───────────────────────────────────────────────────────
// Public — all career paths with their spine roles.
// Used on marketing/onboarding so prospective learners can see tracks before
// signing up. Cached for 30 minutes at the CDN level via Cache-Control.

roadmap.get('/paths', async (c) => {
  const db = createServerClient()

  const { data: paths, error } = await db
    .from('career_paths')
    .select(`
      id, slug, title, description, entry_role_id,
      career_path_roles (
        level, display_order,
        roles (
          id, slug, title, price_ngn, estimated_hours,
          categories ( name )
        )
      )
    `)
    .order('title', { ascending: true })

  if (error) return c.json({ success: false, error: error.message }, 500)

  const result = (paths ?? []).map(path => ({
    id:          path.id,
    slug:        path.slug,
    title:       path.title,
    description: path.description,
    spine: ((path.career_path_roles ?? []) as unknown as Array<{
      level: number; display_order: number
      roles: RoleShape
    }>)
      .sort((a, b) => a.display_order - b.display_order)
      .map(cpr => ({
        level: cpr.level,
        role:  cpr.roles ? {
          id:             cpr.roles.id,
          slug:           cpr.roles.slug,
          title:          cpr.roles.title,
          price_ngn:      cpr.roles.price_ngn,
          estimated_hours: cpr.roles.estimated_hours,
          category:       cpr.roles.categories?.name ?? null,
        } : null,
      }))
      .filter(item => item.role !== null),
  }))

  c.header('Cache-Control', 'public, max-age=1800, stale-while-revalidate=300')
  return c.json({ success: true, data: { paths: result } })
})

// ─── GET /roadmap/paths/:slug ─────────────────────────────────────────────────
// Public — single career path detail.

roadmap.get('/paths/:slug', async (c) => {
  const slug = c.req.param('slug')
  const db   = createServerClient()

  const { data: path, error } = await db
    .from('career_paths')
    .select(`
      id, slug, title, description, entry_role_id,
      career_path_roles (
        level, display_order,
        roles (
          id, slug, title, price_ngn, estimated_hours,
          categories ( name )
        )
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !path) return c.json({ success: false, error: 'Career path not found' }, 404)

  const spine = ((path.career_path_roles ?? []) as unknown as Array<{
    level: number; display_order: number
    roles: RoleShape
  }>)
    .sort((a, b) => a.display_order - b.display_order)
    .map(cpr => ({
      level: cpr.level,
      role:  cpr.roles ? {
        id:             cpr.roles.id,
        slug:           cpr.roles.slug,
        title:          cpr.roles.title,
        price_ngn:      cpr.roles.price_ngn,
        estimated_hours: cpr.roles.estimated_hours,
        category:       cpr.roles.categories?.name ?? null,
      } : null,
    }))
    .filter(item => item.role !== null)

  c.header('Cache-Control', 'public, max-age=1800, stale-while-revalidate=300')
  return c.json({
    success: true,
    data: {
      id:          path.id,
      slug:        path.slug,
      title:       path.title,
      description: path.description,
      spine,
    },
  })
})

// ─── PATCH /roadmap/goal ──────────────────────────────────────────────────────
// Protected — sets or updates users.career_goal_role_id.
// Returns the full /roadmap/me response so the UI re-renders immediately.

roadmap.patch(
  '/goal',
  authMiddleware,
  zValidator('json', z.object({ role_id: z.string().uuid() })),
  async (c) => {
    const userId   = c.get('userId')
    const { role_id } = c.req.valid('json')
    const db       = createServerClient()

    // Validate role exists and is published
    const { data: role, error: roleErr } = await db
      .from('roles')
      .select('id, title')
      .eq('id', role_id)
      .eq('is_published', true)
      .single()

    if (roleErr || !role) {
      return c.json({ success: false, error: 'Role not found or not published' }, 404)
    }

    const { error: updateErr } = await db
      .from('users')
      .update({ career_goal_role_id: role_id })
      .eq('id', userId)

    if (updateErr) return c.json({ success: false, error: updateErr.message }, 500)

    // Return the updated roadmap so the UI can re-render immediately
    return getRoadmapForUser(c, userId, db)
  },
)

// ─── GET /roadmap/me ──────────────────────────────────────────────────────────
// Protected — personalised roadmap.
// Responds with one of two shapes:
//   mode: 'discovery' → no career goal + no enrollments → return all paths
//   mode: 'path'      → career path found → return spine + adjacent + enrollments

roadmap.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()
  return getRoadmapForUser(c, userId, db)
})

// =============================================================================
// Shared roadmap resolver — used by both GET /me and PATCH /goal
// =============================================================================

async function getRoadmapForUser(
  c: Parameters<Parameters<ReturnType<typeof Hono.prototype.get>>[1]>[0],
  userId: string,
  db: ReturnType<typeof createServerClient>,
) {
  // ── 1. Load user goal + enrollments ─────────────────────────────────────
  const [userRes, enrRes] = await Promise.all([
    db.from('users')
      .select('career_goal_role_id')
      .eq('id', userId)
      .single(),
    db.from('enrollments')
      .select(`
        id, status, enrolled_at, completed_at,
        roles (
          id, slug, title, price_ngn, estimated_hours,
          categories ( name ),
          modules ( id, topics ( id ) )
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false }),
  ])

  const goalRoleId   = userRes.data?.career_goal_role_id ?? null
  const enrollments  = enrRes.data ?? []

  // Collect all topic IDs for progress calculation
  type EnrRoleShape = {
    id: string; slug: string; title: string; price_ngn: number
    estimated_hours: number | null
    categories: { name: string } | null
    modules: { id: string; topics: { id: string }[] }[]
  } | null

  const enrTopicIds: string[][] = enrollments.map(e =>
    ((e.roles as EnrRoleShape)?.modules ?? []).flatMap(m => m.topics.map(t => t.id))
  )
  const allTopicIds = enrTopicIds.flat()

  const [progressRes, certsRes] = await Promise.all([
    allTopicIds.length > 0
      ? db.from('topic_progress')
          .select('topic_id')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .in('topic_id', allTopicIds)
      : { data: [] },
    db.from('certificates')
      .select('role_id, verification_code, issued_at')
      .eq('user_id', userId)
      .eq('is_revoked', false),
  ])

  const completedSet = new Set((progressRes.data ?? []).map(r => r.topic_id))
  const certByRole: Record<string, { verificationCode: string; issuedAt: string }> = {}
  for (const cert of certsRes.data ?? []) {
    certByRole[cert.role_id] = { verificationCode: cert.verification_code, issuedAt: cert.issued_at }
  }

  const enrolledRoleIds = enrollments
    .map(e => (e.roles as EnrRoleShape)?.id)
    .filter(Boolean) as string[]

  // Enrolments with progress (used by both path and discovery modes)
  const enrWithProgress = enrollments.map((e, idx) => {
    const role     = e.roles as EnrRoleShape
    const topicIds = enrTopicIds[idx]
    const completed = topicIds.filter(id => completedSet.has(id)).length
    const total     = topicIds.length
    const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      id:         e.id,
      status:     e.status,
      enrolledAt: e.enrolled_at,
      role: {
        id:             role?.id,
        slug:           role?.slug,
        title:          role?.title,
        category:       role?.categories?.name ?? null,
        estimatedHours: role?.estimated_hours ?? null,
        price_ngn:      role?.price_ngn ?? 0,
      },
      progress: { completedTopics: completed, totalTopics: total, pct },
      certificate: role?.id ? (certByRole[role.id] ?? null) : null,
    }
  })

  // ── 2. Discovery mode: no goal + no enrollments ──────────────────────────
  if (!goalRoleId && enrolledRoleIds.length === 0) {
    const { data: allPaths } = await db
      .from('career_paths')
      .select(`
        id, slug, title, description, entry_role_id,
        career_path_roles (
          level, display_order,
          roles ( id, slug, title, price_ngn, estimated_hours, categories ( name ) )
        )
      `)
      .order('title')

    const paths = (allPaths ?? []).map(p => buildPathShape(p))

    return c.json({
      success: true,
      data: {
        mode:       'discovery' as const,
        paths,
        enrollments: enrWithProgress,
        nextRoles:  [],
      },
    })
  }

  // ── 3. Find the best-matching career path ────────────────────────────────
  // Priority: (a) path whose entry_role_id matches user goal,
  //           (b) path that contains user goal in career_path_roles,
  //           (c) path that contains any enrolled role,
  //           (d) any path (first alphabetically).

  let pathId: string | null = null

  if (goalRoleId) {
    // (a) entry role match
    const { data: byEntry } = await db
      .from('career_paths')
      .select('id')
      .eq('entry_role_id', goalRoleId)
      .limit(1)
      .maybeSingle()
    if (byEntry) pathId = byEntry.id

    // (b) any spine match
    if (!pathId) {
      const { data: byCpr } = await db
        .from('career_path_roles')
        .select('career_path_id')
        .eq('role_id', goalRoleId)
        .limit(1)
        .maybeSingle()
      if (byCpr) pathId = byCpr.career_path_id
    }
  }

  // (c) any enrolled role
  if (!pathId && enrolledRoleIds.length > 0) {
    const { data: byCpr } = await db
      .from('career_path_roles')
      .select('career_path_id')
      .in('role_id', enrolledRoleIds)
      .limit(1)
      .maybeSingle()
    if (byCpr) pathId = byCpr.career_path_id
  }

  // (d) fallback: first path
  if (!pathId) {
    const { data: first } = await db
      .from('career_paths')
      .select('id')
      .order('title')
      .limit(1)
      .maybeSingle()
    if (first) pathId = first.id
  }

  // ── 4. Fetch the chosen path's spine ────────────────────────────────────
  let careerPath: { id: string; slug: string; title: string; description: string | null } | null = null
  let spine: SpineItem[] = []

  if (pathId) {
    const { data: pathData } = await db
      .from('career_paths')
      .select(`
        id, slug, title, description,
        career_path_roles (
          level, display_order,
          roles (
            id, slug, title, price_ngn, estimated_hours,
            categories ( name )
          )
        )
      `)
      .eq('id', pathId)
      .single()

    if (pathData) {
      careerPath = { id: pathData.id, slug: pathData.slug, title: pathData.title, description: pathData.description }

      const enrolledSet = new Set(enrolledRoleIds)

      const spineRows = ((pathData.career_path_roles ?? []) as unknown as Array<{
        level: number; display_order: number; roles: RoleShape
      }>).sort((a, b) => a.display_order - b.display_order)

      const spineRoleIds = spineRows.map(r => r.roles?.id).filter(Boolean) as string[]

      // Determine is_next: first non-completed spine role
      let isNextAssigned = false

      spine = spineRows
        .filter(cpr => cpr.roles !== null)
        .map(cpr => {
          const role    = cpr.roles!
          const hasCert = Boolean(certByRole[role.id])
          const isEnr   = enrolledSet.has(role.id)

          const enrEntry  = enrWithProgress.find(e => e.role.id === role.id)
          const completionPct = enrEntry?.progress.pct ?? 0

          let status: 'completed' | 'in_progress' | 'locked'
          if (hasCert)   status = 'completed'
          else if (isEnr) status = 'in_progress'
          else            status = 'locked'

          const isNext = !isNextAssigned && status !== 'completed'
          if (isNext) isNextAssigned = true

          return {
            role: {
              id:             role.id,
              slug:           role.slug,
              title:          role.title,
              price_ngn:      role.price_ngn,
              estimated_hours: role.estimated_hours,
              category:       role.categories?.name ?? null,
            },
            level:          cpr.level,
            status,
            completionPct,
            isNext,
            certificate:    hasCert ? certByRole[role.id] : null,
            enrollment:     enrEntry ? { status: enrEntry.status, completionPct } : null,
          }
        })

      // ── 5. Adjacent roles ─────────────────────────────────────────────────
      // Roles connected via role_progressions.progression_type = 'adjacent'
      // to any role the user has completed or enrolled in, excluding spine.
      const completedOrEnrolledIds = [
        ...enrWithProgress.filter(e => e.certificate || e.status === 'active').map(e => e.role.id).filter(Boolean) as string[],
      ]

      type AdjProgressionRow = {
        progression_type: string
        to_roles: RoleShape
        from_roles: { id: string; title: string } | null
      }

      const { data: adjData } = completedOrEnrolledIds.length > 0
        ? await db
            .from('role_progressions')
            .select(`
              progression_type,
              to_roles:to_role_id ( id, slug, title, price_ngn, estimated_hours, categories ( name ) ),
              from_roles:from_role_id ( id, title )
            `)
            .in('from_role_id', completedOrEnrolledIds)
            .eq('progression_type', 'adjacent')
        : { data: [] }

      const spineRoleSet = new Set(spineRoleIds)
      const seenAdj      = new Set<string>()
      const adjacentRoles: AdjacentRole[] = []

      for (const row of (adjData ?? []) as unknown as AdjProgressionRow[]) {
        const r = row.to_roles
        if (!r || spineRoleSet.has(r.id) || seenAdj.has(r.id)) continue
        seenAdj.add(r.id)

        const hasCert  = Boolean(certByRole[r.id])
        const isEnr    = enrolledSet.has(r.id)
        let status: 'completed' | 'in_progress' | 'locked'
        if (hasCert) status = 'completed'
        else if (isEnr) status = 'in_progress'
        else status = 'locked'

        // If all spine done and no is_next assigned yet, point here
        if (!isNextAssigned && status !== 'completed') {
          isNextAssigned = true
          adjacentRoles.push({
            role: {
              id: r.id, slug: r.slug, title: r.title,
              price_ngn: r.price_ngn, estimated_hours: r.estimated_hours,
              category: r.categories?.name ?? null,
            },
            connectedToRoleTitle: row.from_roles?.title ?? null,
            status,
            isNext: true,
          })
        } else {
          adjacentRoles.push({
            role: {
              id: r.id, slug: r.slug, title: r.title,
              price_ngn: r.price_ngn, estimated_hours: r.estimated_hours,
              category: r.categories?.name ?? null,
            },
            connectedToRoleTitle: row.from_roles?.title ?? null,
            status,
            isNext: false,
          })
        }
      }

      const allComplete = spine.length > 0 && spine.every(s => s.status === 'completed')

      return c.json({
        success: true,
        data: {
          mode:        'path' as const,
          careerPath,
          spine,
          adjacentRoles,
          allSpineComplete: allComplete,
          enrollments: enrWithProgress,
          // legacy nextRoles kept for backwards-compat with existing dashboard code
          nextRoles: adjacentRoles.map(a => ({
            id:             a.role.id,
            slug:           a.role.slug,
            title:          a.role.title,
            price_ngn:      a.role.price_ngn,
            estimated_hours: a.role.estimated_hours,
            category:       a.role.category,
            progressionType: 'adjacent',
          })),
        },
      })
    }
  }

  // Fallback: no paths in DB yet — return simple enrollment list
  return c.json({
    success: true,
    data: {
      mode:            'path' as const,
      careerPath:      null,
      spine:           [],
      adjacentRoles:   [],
      allSpineComplete: false,
      enrollments:     enrWithProgress,
      nextRoles:       [],
    },
  })
}

// =============================================================================
// Helpers
// =============================================================================

type SpineItem = {
  role: { id: string; slug: string; title: string; price_ngn: number; estimated_hours: number | null; category: string | null }
  level: number
  status: 'completed' | 'in_progress' | 'locked'
  completionPct: number
  isNext: boolean
  certificate: { verificationCode: string; issuedAt: string } | null
  enrollment: { status: string; completionPct: number } | null
}

type AdjacentRole = {
  role: { id: string; slug: string; title: string; price_ngn: number; estimated_hours: number | null; category: string | null }
  connectedToRoleTitle: string | null
  status: 'completed' | 'in_progress' | 'locked'
  isNext: boolean
}

function buildPathShape(p: {
  id: string; slug: string; title: string; description: string | null
  career_path_roles: unknown[]
}) {
  return {
    id:          p.id,
    slug:        p.slug,
    title:       p.title,
    description: p.description,
    spine: (p.career_path_roles as Array<{
      level: number; display_order: number
      roles: RoleShape
    }>)
      .sort((a, b) => a.display_order - b.display_order)
      .map(cpr => ({
        level: cpr.level,
        role:  cpr.roles ? {
          id: cpr.roles.id, slug: cpr.roles.slug, title: cpr.roles.title,
          price_ngn: cpr.roles.price_ngn, estimated_hours: cpr.roles.estimated_hours,
          category: cpr.roles.categories?.name ?? null,
        } : null,
      }))
      .filter(item => item.role !== null),
  }
}

export { roadmap as roadmapRouter }
