import Link from 'next/link'
import { ArrowRight, BookOpen, Award, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
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
    <div className="space-y-8">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-[13px] text-muted-foreground">{greeting}</p>
        <h1 className="font-heading text-[22px] font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
      </div>

      {/* ── Continue Learning card ───────────────────────────────────────── */}
      {heroRole && heroEnrollment && heroProgress && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Orange top-bar accent — 2px, razor thin */}
          <div className="h-[2px] w-full bg-primary" />

          <div className="p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl leading-none">
                {heroRole.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Continue learning
                  </p>
                  <span className="text-[13px] font-semibold tabular-nums text-foreground">{heroPct}%</span>
                </div>
                <p className="mt-0.5 text-[15px] font-semibold text-foreground">{heroRole.title}</p>
                {heroNextTopic && (
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    Next — {heroNextTopic.title}
                  </p>
                )}

                {/* Progress bar */}
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${heroPct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {heroProgress.completedTopics} of {heroProgress.totalTopics} topics complete
                </p>
              </div>
            </div>

            <Link
              href={`/learn/${heroRole.slug}`}
              className={cn(buttonVariants({ size: 'sm' }), 'mt-4 w-full justify-center gap-1.5 text-[13px]')}
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Roles enrolled',
            value: MOCK_ENROLLMENTS.length,
            icon: BookOpen,
            iconClass: 'text-blue-500',
            bgClass: 'bg-blue-500/8',
          },
          {
            label: 'Certificates',
            value: MOCK_CERTIFICATES.length,
            icon: Award,
            iconClass: 'text-amber-500',
            bgClass: 'bg-amber-500/8',
          },
        ].map(({ label, value, icon: Icon, iconClass, bgClass }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className={cn('mb-2.5 flex h-7 w-7 items-center justify-center rounded-md', bgClass)}>
              <Icon className={cn('h-3.5 w-3.5', iconClass)} />
            </div>
            <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* ── My Roles ─────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">My Roles</h2>
          <Link href="/roles" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
            Browse all <ChevronRight className="h-3.5 w-3.5" />
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
              <Link key={enr.id} href={`/learn/${enr.roleSlug}`} className="block group">
                <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-all duration-150 hover:border-foreground/15 hover:shadow-md">
                  {/* Emoji avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg leading-none">
                    {role.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-foreground">{enr.roleTitle}</p>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                        {pct}%
                      </span>
                    </div>
                    {/* Thin progress track */}
                    <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          done ? 'bg-green-500' : 'bg-primary',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {completedTopics}/{totalTopics} topics
                    </p>
                  </div>

                  {/* Right icon */}
                  {done
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    : <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-150 group-hover:text-muted-foreground group-hover:translate-x-0.5" />}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Badges ───────────────────────────────────────────────────────── */}
      {MOCK_BADGES.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-semibold text-foreground">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {MOCK_BADGES.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 shadow-sm"
              >
                <span className="text-lg leading-none">{badge.icon}</span>
                <div>
                  <p className="text-[12px] font-medium text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Explore ──────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">Explore roles</h2>
          <Link href="/roles" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {MOCK_SUGGESTED_ROLES.map((role) => (
            <Link key={role.slug} href={`/roles/${role.slug}`} className="group block">
              <div className="h-full rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-150 hover:border-foreground/15 hover:shadow-md">
                <span className="text-2xl leading-none">{role.icon}</span>
                <p className="mt-3 text-[13px] font-medium text-foreground">{role.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{role.category}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {role.estimatedHours}h
                  </span>
                  <span className="text-[11px] font-medium text-foreground">
                    ₦{role.priceNgn.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
