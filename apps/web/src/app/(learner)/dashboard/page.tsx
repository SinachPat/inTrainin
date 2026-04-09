'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Award, ChevronRight, Briefcase } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'
import { ROLES } from '@/lib/roles'

// Pick 3 representative roles from the real catalog for the "Explore" section
const SUGGESTED_ROLES = ROLES.filter(r =>
  ['dispatch-rider', 'store-attendant', 'front-desk-agent'].includes(r.slug)
)

interface ApiUser {
  id: string
  full_name: string
  phone: string | null
  xp_total: number
  streak_current: number
  notification_prefs: { push: boolean; sms: boolean; email: boolean } | null
}

interface Enrolment {
  id: string
  status: string
  enrolled_at: string
  roles: {
    id: string
    slug: string
    title: string
    estimated_hours: number | null
    categories: { name: string } | null
  }
  progress: { completedTopics: number; totalTopics: number }
}

export default function LearnerDashboardPage() {
  const [user, setUser]           = useState<ApiUser | null>(null)
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [userRes, enrRes] = await Promise.all([
          api.get<{ success: boolean; data: { user: ApiUser } }>('/auth/me'),
          api.get<{ success: boolean; data: { enrolments: Enrolment[] } }>('/learning/enrolments'),
        ])
        setUser(userRes.data.user)
        setEnrolments(enrRes.data.enrolments)
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const firstName = user?.full_name.split(' ')[0] ?? '…'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const heroEnrolment = enrolments[0] ?? null
  const heroPct       = heroEnrolment
    ? heroEnrolment.progress.totalTopics > 0
      ? Math.round((heroEnrolment.progress.completedTopics / heroEnrolment.progress.totalTopics) * 100)
      : 0
    : 0

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:space-y-10 md:py-8 md:px-10">

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-[13px] text-muted-foreground">{greeting}</p>
        <h1 className="font-heading text-[24px] font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
      </div>

      {/* ── Loading skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Continue Learning card ──────────────────────────────────────── */}
          {heroEnrolment && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="h-[2px] w-full bg-primary" />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl leading-none">
                    📚
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Continue learning
                      </p>
                      <span className="text-[13px] font-semibold tabular-nums text-foreground">{heroPct}%</span>
                    </div>
                    <p className="mt-0.5 text-[16px] font-semibold text-foreground">{heroEnrolment.roles.title}</p>
                    {heroEnrolment.roles.categories?.name && (
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{heroEnrolment.roles.categories.name}</p>
                    )}
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${heroPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {heroEnrolment.progress.completedTopics} of {heroEnrolment.progress.totalTopics} topics complete
                    </p>
                  </div>
                </div>
                <Link
                  href={`/learn/${heroEnrolment.roles.slug}`}
                  className={cn(buttonVariants({ size: 'sm' }), 'mt-5 w-full justify-center gap-1.5 text-[13px]')}
                >
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ── Stats strip ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Roles enrolled',
                value: enrolments.length,
                icon: BookOpen,
                iconClass: 'text-blue-500',
                bgClass: 'bg-blue-500/8',
              },
              {
                label: 'XP earned',
                value: user?.xp_total ?? 0,
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

          {/* ── Job Hub status ─────────────────────────────────────────────── */}
          <section>
            <div className="rounded-xl border bg-card px-4 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-foreground">Job Hub</p>
                  <p className="text-[11px] text-muted-foreground">Subscribe to get matched to employers passively</p>
                </div>
                <Link
                  href="/job-hub"
                  className={cn(buttonVariants({ size: 'xs', variant: 'default' }), 'shrink-0')}
                >
                  Subscribe
                  <ChevronRight className="ml-0.5 h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>

          {/* ── My Roles ──────────────────────────────────────────────────── */}
          {enrolments.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-foreground">My Roles</h2>
                <Link href="/explore" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
                  Browse all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {enrolments.map((enr) => {
                  const pct  = enr.progress.totalTopics > 0
                    ? Math.round((enr.progress.completedTopics / enr.progress.totalTopics) * 100)
                    : 0
                  const done = pct === 100

                  return (
                    <Link key={enr.id} href={`/learn/${enr.roles.slug}`} className="block group">
                      <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-150 hover:border-foreground/15 hover:shadow-md">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl leading-none">
                          📚
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-medium text-foreground">{enr.roles.title}</p>
                            <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">{pct}%</span>
                          </div>
                          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn('h-full rounded-full transition-all duration-500', done ? 'bg-green-500' : 'bg-primary')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            {enr.progress.completedTopics}/{enr.progress.totalTopics} topics
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-150 group-hover:text-muted-foreground group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── Explore ───────────────────────────────────────────────────── */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-foreground">Explore roles</h2>
              <Link href="/explore" className="flex items-center gap-0.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
                See all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {SUGGESTED_ROLES.map((role) => (
                <Link key={role.slug} href={`/explore/${role.slug}`} className="group block">
                  <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:border-foreground/15 hover:shadow-md">
                    <span className="text-2xl leading-none">{role.icon}</span>
                    <p className="mt-3 text-[13px] font-medium text-foreground">{role.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{role.category}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <BookOpen className="h-3 w-3" /> {role.modules.length} modules
                      </span>
                      <span className="text-[11px] font-medium text-foreground">{role.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  )
}
