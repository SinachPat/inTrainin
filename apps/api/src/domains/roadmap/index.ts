import { Hono } from 'hono'
import { createServerClient } from '@intrainin/db'
import { authMiddleware } from '../../middleware/auth.js'
import type { AuthVariables } from '../../middleware/auth.js'

const roadmap = new Hono<{ Variables: AuthVariables }>()

// ─── GET /roadmap/me ──────────────────────────────────────────────────────────
// Protected — personalised roadmap: enrolled roles with progress + suggested
// next steps sourced from the role_progressions table.

roadmap.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const db     = createServerClient()

  // Enrollments with role + category + module/topic structure for progress calc
  const { data: enrolments, error } = await db
    .from('enrollments')
    .select(`
      id, status, enrolled_at, completed_at,
      roles (
        id, slug, title, price_ngn, estimated_hours,
        categories ( name ),
        modules ( id, topics ( id ) )
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  if (error) return c.json({ success: false, error: error.message }, 500)

  type RoleShape = {
    id: string; slug: string; title: string; price_ngn: number; estimated_hours: number | null
    categories: { name: string } | null
    modules: { id: string; topics: { id: string }[] }[]
  } | null

  // Collect all topic IDs in a single pass for an efficient completion query
  const enrolTopicIds: string[][] = (enrolments ?? []).map(e =>
    ((e.roles as RoleShape)?.modules ?? []).flatMap(m => m.topics.map(t => t.id))
  )
  const allTopicIds = enrolTopicIds.flat()

  const { data: completedRows } = allTopicIds.length > 0
    ? await db
        .from('topic_progress')
        .select('topic_id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('topic_id', allTopicIds)
    : { data: [] }

  const completedSet = new Set((completedRows ?? []).map(r => r.topic_id))

  // Certificates earned (to show on completed roles)
  const { data: certs } = await db
    .from('certificates')
    .select('role_id, verification_code, issued_at')
    .eq('user_id', userId)
    .eq('is_revoked', false)

  const certByRole: Record<string, { verificationCode: string; issuedAt: string }> = {}
  for (const cert of certs ?? []) {
    certByRole[cert.role_id] = { verificationCode: cert.verification_code, issuedAt: cert.issued_at }
  }

  const enrolledRoleIds = (enrolments ?? [])
    .map(e => (e.roles as RoleShape)?.id)
    .filter(Boolean) as string[]

  // Next roles from role_progressions (roles that follow an enrolled role)
  const { data: progressions } = enrolledRoleIds.length > 0
    ? await db
        .from('role_progressions')
        .select(`
          progression_type,
          to_roles:to_role_id (
            id, slug, title, price_ngn, estimated_hours,
            categories ( name )
          )
        `)
        .in('from_role_id', enrolledRoleIds)
        .order('display_order', { ascending: true })
    : { data: [] }

  // Deduplicate next roles — exclude already-enrolled ones
  const enrolledSet = new Set(enrolledRoleIds)
  const seen        = new Set<string>()
  const nextRoles: {
    id: string; slug: string; title: string; price_ngn: number
    estimated_hours: number | null; category: string | null; progressionType: string
  }[] = []

  for (const p of progressions ?? []) {
    const r = p.to_roles as { id: string; slug: string; title: string; price_ngn: number; estimated_hours: number | null; categories: { name: string } | null } | null
    if (!r || enrolledSet.has(r.id) || seen.has(r.id)) continue
    seen.add(r.id)
    nextRoles.push({
      id:              r.id,
      slug:            r.slug,
      title:           r.title,
      price_ngn:       r.price_ngn,
      estimated_hours: r.estimated_hours,
      category:        r.categories?.name ?? null,
      progressionType: p.progression_type,
    })
  }

  const withProgress = (enrolments ?? []).map((e, idx) => {
    const role     = e.roles as RoleShape
    const topicIds = enrolTopicIds[idx]
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
      },
      progress: { completedTopics: completed, totalTopics: total, pct },
      certificate: role?.id ? (certByRole[role.id] ?? null) : null,
    }
  })

  return c.json({
    success: true,
    data: {
      enrollments: withProgress,
      nextRoles,
    },
  })
})

export { roadmap as roadmapRouter }
