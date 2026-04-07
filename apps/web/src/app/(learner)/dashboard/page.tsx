import Link from 'next/link'
import {
  ArrowRight, BookOpen, Award,
  Clock, CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MOCK_USER, MOCK_ENROLLMENTS, MOCK_CERTIFICATES, MOCK_BADGES,
  getRoleBySlug, computeRoleProgress, getNextTopic,
} from '@/lib/mock-data'

const MOCK_SUGGESTED_ROLES = [
  { slug: 'delivery-rider',     title: 'Delivery Rider',    category: 'Logistics',   priceNgn: 2000, estimatedHours: 3.5 },
  { slug: 'store-keeper',       title: 'Store Keeper',      category: 'Retail',      priceNgn: 2500, estimatedHours: 4.0 },
  { slug: 'hotel-receptionist', title: 'Hotel Receptionist', category: 'Hospitality', priceNgn: 3000, estimatedHours: 5.0 },
]

// ─── Progress ring SVG ────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const r    = size / 2 - 6
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="5" className="stroke-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round"
        className="stroke-primary transition-all duration-700"
      />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnerDashboardPage() {
  const firstName = MOCK_USER.fullName.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Hero enrollment — most recently active (first enrolled)
  const heroEnrollment = MOCK_ENROLLMENTS[0] ?? null
  const heroRole       = heroEnrollment ? getRoleBySlug(heroEnrollment.roleSlug) : null
  const heroProgress   = heroRole && heroEnrollment ? computeRoleProgress(heroRole, heroEnrollment) : null
  const heroPct        = heroProgress ? Math.round((heroProgress.completedTopics / heroProgress.totalTopics) * 100) : 0
  const heroNextTopic  = heroRole && heroEnrollment ? getNextTopic(heroRole, heroEnrollment) : null

  return (
    <div className="space-y-7">

      {/* ── Greeting ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {heroRole
            ? `Keep going — you're ${heroPct}% through ${heroRole.title}.`
            : 'Choose a role below to begin your first training.'}
        </p>
      </div>

      {/* ── Hero: Continue Learning ──────────────────────────────────────── */}
      {heroRole && heroEnrollment && (
        <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/7 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <ProgressRing pct={heroPct} size={68} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {heroPct}%
                </span>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">{heroRole.category}</Badge>
                </div>
                <h2 className="mt-1 font-heading text-xl font-bold">{heroRole.title}</h2>
                {heroNextTopic && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">Up next: {heroNextTopic.title}</p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {heroProgress?.completedTopics} of {heroProgress?.totalTopics} topics complete
                </p>
              </div>
            </div>
            <Link
              href={`/learn/${heroRole.slug}`}
              className={cn(buttonVariants({ size: 'sm' }), 'mt-4 w-full gap-1.5')}
            >
              Continue Learning <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Roles Enrolled', value: `${MOCK_ENROLLMENTS.length}`, icon: <BookOpen className="h-4 w-4 text-blue-500" /> },
          { label: 'Certificates',   value: `${MOCK_CERTIFICATES.length}`, icon: <Award className="h-4 w-4 text-yellow-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-2.5 px-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                {icon}
              </div>
              <div>
                <p className="font-heading text-sm font-bold leading-tight">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── All Roles ───────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">My Roles</h2>
          <Link href="/roles" className="text-xs font-medium text-primary hover:underline">
            Explore more →
          </Link>
        </div>
        <div className="space-y-2">
          {MOCK_ENROLLMENTS.map((enr) => {
            const role = getRoleBySlug(enr.roleSlug)
            if (!role) return null
            const { completedTopics, totalTopics } = computeRoleProgress(role, enr)
            const pct = Math.round((completedTopics / totalTopics) * 100)
            return (
              <Link key={enr.id} href={`/learn/${enr.roleSlug}`}>
                <Card size="sm" className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <div className="relative shrink-0">
                      <ProgressRing pct={pct} size={44} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {pct}%
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg leading-none">{role.icon}</span>
                        <p className="text-sm font-medium">{enr.roleTitle}</p>
                        {pct === 100 && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {completedTopics}/{totalTopics} topics · {role.category}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Recent Badges ───────────────────────────────────────────────── */}
      {MOCK_BADGES.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold">Recent Badges</h2>
          <div className="flex flex-wrap gap-2">
            {MOCK_BADGES.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5"
              >
                <span className="text-base">{badge.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Suggested Roles ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 font-heading text-base font-semibold">Expand Your Skills</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SUGGESTED_ROLES.map((role) => (
            <Link key={role.slug} href={`/roles/${role.slug}`}>
              <Card size="sm" className="h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2 text-[10px]">{role.category}</Badge>
                  <p className="text-sm font-medium">{role.title}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{role.estimatedHours}h</span>
                    <span>₦{role.priceNgn.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
