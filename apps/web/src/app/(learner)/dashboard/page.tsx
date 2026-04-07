import Link from 'next/link'
import { ArrowRight, BookOpen, Award, Clock, CheckCircle2, ChevronRight, Play } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MOCK_USER, MOCK_ENROLLMENTS, MOCK_CERTIFICATES, MOCK_BADGES,
  getRoleBySlug, computeRoleProgress, getNextTopic,
} from '@/lib/mock-data'

const MOCK_SUGGESTED_ROLES = [
  { slug: 'delivery-rider',     title: 'Delivery Rider',     category: 'Logistics',   priceNgn: 2000, estimatedHours: 3.5, icon: '🛵' },
  { slug: 'store-keeper',       title: 'Store Keeper',       category: 'Retail',      priceNgn: 2500, estimatedHours: 4.0, icon: '🧾' },
  { slug: 'hotel-receptionist', title: 'Hotel Receptionist', category: 'Hospitality', priceNgn: 3000, estimatedHours: 5.0, icon: '🏨' },
]

export default function LearnerDashboardPage() {
  const firstName = MOCK_USER.fullName.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const heroEnrollment = MOCK_ENROLLMENTS[0] ?? null
  const heroRole       = heroEnrollment ? getRoleBySlug(heroEnrollment.roleSlug) : null
  const heroProgress   = heroRole && heroEnrollment ? computeRoleProgress(heroRole, heroEnrollment) : null
  const heroPct        = heroProgress ? Math.round((heroProgress.completedTopics / heroProgress.totalTopics) * 100) : 0
  const heroNextTopic  = heroRole && heroEnrollment ? getNextTopic(heroRole, heroEnrollment) : null

  return (
    <div className="space-y-10">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border px-5 py-6"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 0% 50%, var(--color-background) 40%, transparent 100%)' }}
        />
        <div className="relative z-10">
          <p className="text-xs font-medium text-muted-foreground">{greeting}</p>
          <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {heroRole
              ? `You're ${heroPct}% through ${heroRole.title}. Keep the momentum going.`
              : 'Pick a role below to begin your first training.'}
          </p>
        </div>
      </div>

      {/* ── Hero: Continue Learning ──────────────────────────────────────── */}
      {heroRole && heroEnrollment && heroProgress && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/8 via-primary/4 to-transparent p-5">
          {/* Decorative ring */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-primary/10" />
          <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full border border-primary/10" />

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-2xl">
              {heroRole.icon}
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="secondary" className="mb-1.5 text-[10px]">{heroRole.category}</Badge>
              <h2 className="font-heading text-lg font-bold leading-tight text-foreground">{heroRole.title}</h2>
              {heroNextTopic && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  Up next — {heroNextTopic.title}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{heroProgress.completedTopics} of {heroProgress.totalTopics} topics</span>
              <span className="font-semibold text-foreground">{heroPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${heroPct}%` }}
              />
            </div>
          </div>

          <Link
            href={`/learn/${heroRole.slug}`}
            className={cn(buttonVariants({ size: 'sm' }), 'mt-4 w-full gap-1.5')}
          >
            <Play className="h-3.5 w-3.5" /> Continue Learning
          </Link>
        </div>
      )}

      {/* ── Quick stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{MOCK_ENROLLMENTS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Roles enrolled</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
            <Award className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{MOCK_CERTIFICATES.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Certificates earned</p>
        </div>
      </div>

      {/* ── My Roles ─────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">My Roles</h2>
          <Link href="/roles" className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
            Explore more <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {MOCK_ENROLLMENTS.map((enr) => {
            const role = getRoleBySlug(enr.roleSlug)
            if (!role) return null
            const { completedTopics, totalTopics } = computeRoleProgress(role, enr)
            const pct = Math.round((completedTopics / totalTopics) * 100)
            const done = pct === 100

            return (
              <Link key={enr.id} href={`/learn/${enr.roleSlug}`} className="block">
                <div className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-foreground/20 hover:shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                    {role.icon}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{enr.roleTitle}</p>
                      <span className="shrink-0 text-xs font-semibold text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', done ? 'bg-green-500' : 'bg-primary')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {completedTopics}/{totalTopics} topics · {role.category}
                    </p>
                  </div>
                  {done
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    : <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Badges ───────────────────────────────────────────────────────── */}
      {MOCK_BADGES.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent Badges</h2>
          <div className="flex flex-wrap gap-2">
            {MOCK_BADGES.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm"
              >
                <span className="text-xl leading-none">{badge.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Expand Your Skills ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Expand Your Skills</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {MOCK_SUGGESTED_ROLES.map((role) => (
            <Link key={role.slug} href={`/roles/${role.slug}`} className="group block">
              <div className="h-full rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm">
                <span className="text-2xl leading-none">{role.icon}</span>
                <p className="mt-2.5 text-sm font-semibold text-foreground">{role.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{role.category}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />{role.estimatedHours}h
                  </span>
                  <span className="text-[11px] font-medium text-foreground">₦{role.priceNgn.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
