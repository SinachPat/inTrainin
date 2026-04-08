import Link from 'next/link'
import { ArrowRight, BookOpen, Award, CheckCircle2, ChevronRight, Lock, Briefcase } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  MOCK_USER, MOCK_ENROLLMENTS, MOCK_CERTIFICATES, MOCK_BADGES, MOCK_ROADMAPS,
  MOCK_TEST_ATTEMPTS, MOCK_JOB_MATCHES,
  getRoleBySlug, computeRoleProgress, getNextTopic, getTestById,
} from '@/lib/mock-data'
import { ROLES } from '@/lib/roles'

// Pick 3 representative roles from the real catalog for the "Explore" section
const SUGGESTED_ROLES = ROLES.filter(r =>
  ['dispatch-rider', 'store-attendant', 'front-desk-agent'].includes(r.slug)
)

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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:space-y-10 md:py-8 md:px-10">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-[13px] text-muted-foreground">{greeting}</p>
        <h1 className="font-heading text-[24px] font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
      </div>

      {/* ── Badges ───────────────────────────────────────────────────────────── */}
      {MOCK_BADGES.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">Your badges</h2>
            <span className="text-[11px] text-muted-foreground">{MOCK_BADGES.length} earned</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {MOCK_BADGES.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-2.5 rounded-xl bg-card px-3.5 py-2.5 shadow-card"
              >
                <span className="text-xl leading-none">{badge.icon}</span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{badge.name}</p>
                  <p className="text-[11px] text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Continue Learning card ───────────────────────────────────────── */}
      {heroRole && heroEnrollment && heroProgress && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Orange top-bar accent */}
          <div className="h-[2px] w-full bg-primary" />

          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl leading-none">
                {heroRole.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Continue learning
                  </p>
                  <span className="text-[13px] font-semibold tabular-nums text-foreground">{heroPct}%</span>
                </div>
                <p className="mt-0.5 text-[16px] font-semibold text-foreground">{heroRole.title}</p>
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
              className={cn(buttonVariants({ size: 'sm' }), 'mt-5 w-full justify-center gap-1.5 text-[13px]')}
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
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
          <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className={cn('mb-3 flex h-8 w-8 items-center justify-center rounded-md', bgClass)}>
              <Icon className={cn('h-4 w-4', iconClass)} />
            </div>
            <p className="font-heading text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Job Hub status ───────────────────────────────────────────────────── */}
      <section>
        <div className="rounded-xl border bg-card px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', MOCK_USER.jobHubSubscribed ? 'bg-green-500/10' : 'bg-muted')}>
              <Briefcase className={cn('h-4 w-4', MOCK_USER.jobHubSubscribed ? 'text-green-600' : 'text-muted-foreground')} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">Job Hub</p>
              <p className="text-[11px] text-muted-foreground">
                {MOCK_USER.jobHubSubscribed
                  ? `Active · ${MOCK_JOB_MATCHES.filter(m => m.status === 'pending').length} new match${MOCK_JOB_MATCHES.filter(m => m.status === 'pending').length !== 1 ? 'es' : ''} waiting`
                  : 'Subscribe to get matched to employers passively'}
              </p>
            </div>
            <Link
              href="/job-hub"
              className={cn(buttonVariants({ size: 'xs', variant: MOCK_USER.jobHubSubscribed ? 'outline' : 'default' }), 'shrink-0')}
            >
              {MOCK_USER.jobHubSubscribed ? 'View' : 'Subscribe'}
              <ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Test history ─────────────────────────────────────────────────────── */}
      {MOCK_TEST_ATTEMPTS.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-foreground">Test history</h2>
            <Link href="/certificates" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
              All certs <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {[...MOCK_TEST_ATTEMPTS].reverse().map(attempt => {
              let testTitle = attempt.testId
              for (const enr of MOCK_ENROLLMENTS) {
                const role = getRoleBySlug(enr.roleSlug)
                if (!role) continue
                const test = getTestById(role, attempt.testId)
                if (test) { testTitle = test.title; break }
              }
              const takenDate = new Date(attempt.takenAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
              return (
                <div key={attempt.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    attempt.passed ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive',
                  )}>
                    {attempt.passed ? '✓' : '✗'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{testTitle}</p>
                    <p className="text-[11px] text-muted-foreground">{takenDate} · Attempt #{attempt.attemptNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-[13px] font-semibold tabular-nums', attempt.passed ? 'text-green-600' : 'text-destructive')}>
                      {attempt.scorePct}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">{attempt.passed ? 'Passed' : 'Failed'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Career Roadmaps ──────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">Career roadmaps</h2>
          <span className="text-[11px] text-muted-foreground">{MOCK_ROADMAPS.length} tracks</span>
        </div>

        <div className="space-y-3">
          {MOCK_ROADMAPS.map((roadmap) => {
            const doneCount = roadmap.steps.filter(s => s.status === 'completed').length
            const activeStep = roadmap.steps.find(s => s.status === 'in_progress')

            return (
              <div key={roadmap.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold text-foreground">{roadmap.title}</p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                      {roadmap.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{roadmap.description}</p>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-0">
                  {roadmap.steps.map((step, i) => (
                    <div key={step.roleSlug} className="flex flex-1 items-center">
                      {/* Step node */}
                      <div className="flex flex-1 flex-col items-center gap-1.5">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full border-2 text-base leading-none transition-all',
                          step.status === 'completed'
                            ? 'border-green-500 bg-green-500/10'
                            : step.status === 'in_progress'
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-muted/50',
                        )}>
                          {step.status === 'completed'
                            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                            : step.status === 'locked'
                              ? <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                              : <span>{step.icon}</span>}
                        </div>
                        <p className={cn(
                          'text-center text-[10px] font-medium leading-tight',
                          step.status === 'locked' ? 'text-muted-foreground/60' : 'text-foreground',
                        )}>
                          {step.roleTitle}
                        </p>
                      </div>

                      {/* Connector */}
                      {i < roadmap.steps.length - 1 && (
                        <div className={cn(
                          'h-[2px] w-full max-w-[32px] shrink-0 rounded-full',
                          roadmap.steps[i + 1].status !== 'locked' ? 'bg-primary/40' : 'bg-border',
                        )} />
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {activeStep && (
                  <div className="mt-4 border-t border-border/60 pt-4">
                    <Link
                      href={`/learn/${activeStep.roleSlug}`}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                    >
                      Continue with {activeStep.roleTitle} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── My Roles ─────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">My Roles</h2>
          <Link href="/roles" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
            Browse all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {MOCK_ENROLLMENTS.map((enr) => {
            const role = getRoleBySlug(enr.roleSlug)
            if (!role) return null
            const { completedTopics, totalTopics } = computeRoleProgress(role, enr)
            const pct = Math.round((completedTopics / totalTopics) * 100)
            const done = pct === 100

            return (
              <Link key={enr.id} href={`/learn/${enr.roleSlug}`} className="block group">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-150 hover:border-foreground/15 hover:shadow-md">
                  {/* Emoji avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl leading-none">
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

      {/* ── Explore ──────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">Explore roles</h2>
          <Link href="/roles" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SUGGESTED_ROLES.map((role) => (
            <Link key={role.slug} href={`/roles/${role.slug}`} className="group block">
              <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:border-foreground/15 hover:shadow-md">
                <span className="text-2xl leading-none">{role.icon}</span>
                <p className="mt-3 text-[13px] font-medium text-foreground">{role.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{role.category}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <BookOpen className="h-3 w-3" /> {role.modules.length} modules
                  </span>
                  <span className="text-[11px] font-medium text-foreground">
                    {role.price}
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
