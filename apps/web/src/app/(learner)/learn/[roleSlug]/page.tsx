'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lock,
  Clock, Award, Play, ChevronRight, XCircle,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

interface ApiTopic {
  id: string
  title: string
  content_type: string
  estimated_minutes: number | null
  order_index: number
}

interface ApiModuleTest {
  id: string
  title: string
  test_type: string
  pass_mark_pct: number
  time_limit_minutes: number | null
}

interface ApiModule {
  id: string
  title: string
  order_index: number
  topics: ApiTopic[]
  tests: ApiModuleTest[]
}

interface ApiRole {
  id: string
  slug: string
  title: string
  description: string | null
  price_ngn: number
  estimated_hours: number | null
  categories: { name: string } | null
  modules: ApiModule[]
  tests: ApiModuleTest[]
}

interface ApiProgress {
  completedTopics: string[]
  passedTests: string[]
  totalTopics: number
  progressPct: number
  finalExamUnlocked: boolean
}

interface TestAttempt {
  id: string
  test_id: string
  score_pct: number
  passed: boolean
  attempt_number: number
  taken_at: string
  tests: { title: string; test_type: string } | null
}

const TYPE_LABEL: Record<string, string> = {
  text: 'Reading', guide: 'Guide', case_study: 'Case Study', workflow: 'Workflow',
}

export default function RoleCurriculumPage() {
  const params   = useParams<{ roleSlug: string }>()
  const roleSlug = params.roleSlug

  const [role, setRole]           = useState<ApiRole | null>(null)
  const [progress, setProgress]   = useState<ApiProgress | null>(null)
  const [enrolled, setEnrolled]   = useState<boolean | null>(null)
  const [history, setHistory]     = useState<TestAttempt[]>([])
  const [loading, setLoading]     = useState(true)
  const [gone, setGone]           = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const roleRes = await api.get<{ success: boolean; data: { role: ApiRole } }>(
          `/learning/roles/${roleSlug}`,
        )
        setRole(roleRes.data.role)

        try {
          const progRes = await api.get<{ success: boolean; data: ApiProgress }>(
            `/learning/progress/${roleSlug}`,
          )
          setProgress(progRes.data)
          setEnrolled(true)
          // Fetch test history in the background — non-critical
          api.get<{ success: boolean; data: { attempts: TestAttempt[] } }>(
            `/assessment/roles/${roleSlug}/history`,
          ).then(r => setHistory(r.data.attempts)).catch(() => {})
        } catch (e) {
          if (e instanceof ApiError && e.status === 403) {
            setEnrolled(false)
          } else {
            throw e
          }
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
        else if (e instanceof ApiError && e.status === 404) setGone(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [roleSlug])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-10">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        {[1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />)}
      </div>
    )
  }

  if (gone || !role) return notFound()

  // ── Not enrolled ──────────────────────────────────────────────────────────
  if (enrolled === false) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-10">
        <Link href="/explore" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> All roles
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <h1 className="font-heading text-xl font-bold">{role.title}</h1>
          {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
          <Link href={`/explore/${role.slug}`} className={cn(buttonVariants(), 'w-full justify-center')}>
            Enroll — ₦{role.price_ngn.toLocaleString()} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  // ── Enrolled ──────────────────────────────────────────────────────────────
  const completedTopicIds = progress?.completedTopics ?? []
  const passedTestIds     = progress?.passedTests ?? []
  const progressPct       = progress?.progressPct ?? 0
  const finalExamUnlocked = progress?.finalExamUnlocked ?? false

  const sortedModules = [...role.modules].sort((a, b) => a.order_index - b.order_index)
  const allTopics     = sortedModules.flatMap(m =>
    [...m.topics].sort((a, b) => a.order_index - b.order_index),
  )
  const nextTopic    = allTopics.find(t => !completedTopicIds.includes(t.id)) ?? null
  const allTopicsDone = allTopics.length > 0 && allTopics.every(t => completedTopicIds.includes(t.id))
  const finalExam    = role.tests.find(t => t.test_type === 'final') ?? null
  const totalTopics  = progress?.totalTopics ?? allTopics.length

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-10">
      <Link href="/dashboard" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}>
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Dashboard
      </Link>

      {/* Role header */}
      <div className="space-y-3">
        <div>
          {role.categories?.name && (
            <p className="text-xs font-medium text-muted-foreground">{role.categories.name}</p>
          )}
          <h1 className="font-heading text-xl font-bold leading-tight">{role.title}</h1>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{completedTopicIds.length} of {totalTopics} topics complete</span>
            <span className="font-semibold text-foreground">{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-4">
          {[
            { icon: BookOpen, label: `${role.modules.length} modules` },
            ...(role.estimated_hours ? [{ icon: Clock, label: `${role.estimated_hours}h estimated` }] : []),
            { icon: Award, label: 'Certificate on completion' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />{label}
            </div>
          ))}
        </div>
      </div>

      {/* Continue CTA */}
      {nextTopic && !allTopicsDone && (
        <Card size="sm" className="border-primary/20 bg-linear-to-br from-primary/6 to-transparent">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Play className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Continue where you left off</p>
              <p className="truncate text-sm font-semibold">{nextTopic.title}</p>
            </div>
            <Link href={`/learn/${role.slug}/${nextTopic.id}`} className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>
              Continue <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      {allTopicsDone && finalExam && (
        <Card size="sm" className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold">All topics complete!</p>
              <p className="text-xs text-muted-foreground">Take the Final Exam to earn your certificate</p>
            </div>
            <Link href={`/learn/${role.slug}/test/${finalExam.id}`} className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>
              Take Exam
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      <div className="space-y-4">
        {sortedModules.map((mod, modIndex) => {
          const sortedTopics  = [...mod.topics].sort((a, b) => a.order_index - b.order_index)
          const modTopicsDone = sortedTopics.filter(t => completedTopicIds.includes(t.id)).length
          const modComplete   = modTopicsDone === sortedTopics.length && sortedTopics.length > 0
          const modTest       = mod.tests.find(t => t.test_type === 'module') ?? null
          const testPassed    = modTest ? passedTestIds.includes(modTest.id) : false
          const testUnlocked  = modComplete

          return (
            <div key={mod.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', modComplete ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground')}>
                  {modComplete ? <CheckCircle2 className="h-4 w-4" /> : modIndex + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{mod.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {modTopicsDone}/{sortedTopics.length} topics
                    {modTest ? ` · ${modTest.pass_mark_pct}% pass mark` : ''}
                  </p>
                </div>
                {modComplete && <Badge variant="secondary" className="shrink-0 text-[10px]">Complete</Badge>}
              </div>

              <div className="divide-y divide-border/60">
                {sortedTopics.map((topic, topicIndex) => {
                  const isCompleted = completedTopicIds.includes(topic.id)
                  const prevDone    = topicIndex === 0 || completedTopicIds.includes(sortedTopics[topicIndex - 1].id)
                  const isLocked    = !prevDone && !isCompleted

                  return (
                    <div key={topic.id} className={cn('flex items-center gap-3 px-4 py-3', isLocked && 'opacity-50')}>
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                        {isCompleted
                          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                          : isLocked
                            ? <Lock className="h-4 w-4 text-muted-foreground" />
                            : <div className="h-4 w-4 rounded-full border-2 border-primary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm', isCompleted ? 'text-muted-foreground line-through' : 'font-medium text-foreground')}>
                          {topic.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {TYPE_LABEL[topic.content_type] ?? topic.content_type}
                          {topic.estimated_minutes ? ` · ${topic.estimated_minutes} min` : ''}
                        </p>
                      </div>
                      {!isLocked && (
                        <Link
                          href={`/learn/${role.slug}/${topic.id}`}
                          className={cn('shrink-0', buttonVariants({ variant: isCompleted ? 'ghost' : 'outline', size: 'xs' }))}
                        >
                          {isCompleted ? 'Review' : 'Start'} <ChevronRight className="ml-0.5 h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  )
                })}

                {modTest && (
                  <div className={cn('flex items-center gap-3 px-4 py-3', !testUnlocked && 'opacity-50')}>
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                      {testPassed
                        ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                        : !testUnlocked
                          ? <Lock className="h-4 w-4 text-muted-foreground" />
                          : <div className="h-4 w-4 rounded-full border-2 border-orange-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm', testPassed ? 'text-muted-foreground line-through' : 'font-semibold')}>
                        {modTest.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {modTest.pass_mark_pct}% to pass
                        {modTest.time_limit_minutes ? ` · ${modTest.time_limit_minutes} min` : ''}
                      </p>
                    </div>
                    {testUnlocked && (
                      <Link
                        href={`/learn/${role.slug}/test/${modTest.id}`}
                        className={cn('shrink-0', buttonVariants({ variant: testPassed ? 'ghost' : 'default', size: 'xs' }))}
                      >
                        {testPassed ? 'Review' : 'Take Test'} <ChevronRight className="ml-0.5 h-3 w-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {finalExam && (
          <div className={cn('overflow-hidden rounded-xl border border-dashed border-border bg-card', !finalExamUnlocked && 'opacity-60')}>
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{finalExam.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {finalExam.pass_mark_pct}% to pass · earns certificate
                  {finalExam.time_limit_minutes ? ` · ${finalExam.time_limit_minutes} min` : ''}
                </p>
              </div>
              {finalExamUnlocked
                ? <Link href={`/learn/${role.slug}/test/${finalExam.id}`} className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>Start Exam</Link>
                : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
          </div>
        )}
      </div>

      {/* Test history */}
      {history.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Test history</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border/60">
            {history.map(attempt => (
              <div key={attempt.id} className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  attempt.passed ? 'bg-green-500/10' : 'bg-destructive/10',
                )}>
                  {attempt.passed
                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                    : <XCircle className="h-4 w-4 text-destructive" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {attempt.tests?.title ?? 'Test'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(attempt.taken_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    {' · '}Attempt #{attempt.attempt_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-bold', attempt.passed ? 'text-green-600' : 'text-destructive')}>
                    {attempt.score_pct}%
                  </p>
                  <p className={cn('text-[11px]', attempt.passed ? 'text-green-600' : 'text-destructive')}>
                    {attempt.passed ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
