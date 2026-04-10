'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle2, Circle, Lock, BookOpen,
  Plus, Award, ChevronRight,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'
import { ROLES } from '@/lib/roles'

interface Enrolment {
  id: string
  status: string
  roles: {
    id: string
    slug: string
    title: string
    categories: { name: string } | null
  }
  progress: { completedTopics: number; totalTopics: number }
}

function ProgressRing({ pct, size = 40 }: { pct: number; size?: number }) {
  const r    = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={3} className="stroke-muted fill-none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="fill-none stroke-primary transition-all duration-700"
      />
    </svg>
  )
}

export default function RoadmapPage() {
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get<{ success: boolean; data: { enrolments: Enrolment[] } }>('/learning/enrolments')
      .then(r => setEnrolments(r.data.enrolments))
      .catch(e => { if (e instanceof ApiError && e.status === 401) window.location.replace('/login') })
      .finally(() => setLoading(false))
  }, [])

  // Group enrolled roles by category
  const enrolledSlugs  = new Set(enrolments.map(e => e.roles.slug))
  const enrolledCats   = [...new Set(enrolments.map(e => e.roles.categories?.name).filter(Boolean))] as string[]

  // For each enrolled category build a path: enrolled roles + up to 3 unenrolled next steps
  const paths = enrolledCats.map(cat => {
    const catEnrolments = enrolments.filter(e => e.roles.categories?.name === cat)
    const nextRoles = ROLES
      .filter(r => r.category === cat && !enrolledSlugs.has(r.slug))
      .slice(0, 3)
    return { cat, catEnrolments, nextRoles }
  })

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 md:py-10 md:px-10">

      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Career roadmap
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your learning paths and suggested next steps.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && enrolments.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-heading text-base font-semibold text-foreground">No paths started yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enroll in a role to start building your career roadmap.
          </p>
          <Link href="/explore" className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>
            Browse roles <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Career paths */}
      {!loading && paths.map(({ cat, catEnrolments, nextRoles }) => (
        <section key={cat} className="space-y-4">

          {/* Category header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{cat}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Enrolled roles */}
          <div className="space-y-3">
            {catEnrolments.map(enr => {
              const pct  = enr.progress.totalTopics > 0
                ? Math.round((enr.progress.completedTopics / enr.progress.totalTopics) * 100)
                : 0
              const done = pct === 100

              return (
                <Link key={enr.id} href={`/learn/${enr.roles.slug}`} className="group block">
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all hover:border-foreground/15 hover:shadow-md">
                    <div className="relative flex shrink-0 items-center justify-center">
                      <ProgressRing pct={pct} size={40} />
                      <span className="absolute text-[10px] font-bold text-foreground">{pct}%</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-foreground">{enr.roles.title}</p>
                        {done && (
                          <span className="flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {enr.progress.completedTopics} / {enr.progress.totalTopics} topics
                        {done && ' · Ready for certification'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Next steps */}
          {nextRoles.length > 0 && (
            <div>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Suggested next steps
              </p>
              <div className="space-y-2">
                {nextRoles.map((role) => (
                  <Link key={role.slug} href={`/explore/${role.slug}`} className="group flex items-center gap-4 rounded-xl border border-dashed border-border bg-card/60 px-5 py-4 transition-all hover:border-border hover:bg-card hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground">{role.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {role.modules.length} modules · {role.price} · Module 1 free
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      ))}

      {/* Add another path */}
      {!loading && enrolments.length > 0 && (
        <section className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">Add another career path</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Explore roles in a different category to grow your skills.
              </p>
            </div>
            <Link
              href="/explore"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'shrink-0')}
            >
              Browse <ArrowRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        </section>
      )}

      {/* Certifications prompt */}
      {!loading && enrolments.some(e => {
        const pct = e.progress.totalTopics > 0
          ? Math.round((e.progress.completedTopics / e.progress.totalTopics) * 100)
          : 0
        return pct === 100
      }) && (
        <section className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-5">
          <div className="flex items-center gap-4">
            <Award className="h-8 w-8 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-foreground">You have completed roles</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Take the Final Exam to earn your certificate and unlock Job Hub matching.
              </p>
            </div>
            <Link
              href="/certificates"
              className={cn(buttonVariants({ size: 'xs' }), 'shrink-0')}
            >
              View certs
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}
