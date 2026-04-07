import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lock,
  Clock, Award, Play, ChevronRight,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  MOCK_ROLES, getRoleBySlug, getEnrollmentBySlug, computeRoleProgress, getNextTopic,
} from '@/lib/mock-data'

export function generateStaticParams() {
  return MOCK_ROLES.map(r => ({ roleSlug: r.slug }))
}

interface Props {
  params: Promise<{ roleSlug: string }>
}

export default async function RoleCurriculumPage({ params }: Props) {
  const { roleSlug } = await params
  const role = getRoleBySlug(roleSlug)
  if (!role) return notFound()

  const enrollment = getEnrollmentBySlug(roleSlug)

  if (!enrollment) {
    return (
      <div className="space-y-6">
        <Link href="/roles" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> All roles
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <span className="text-4xl">{role.icon}</span>
          <h1 className="mt-3 font-heading text-xl font-bold">{role.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
          <Link href={`/roles/${role.slug}`} className={cn(buttonVariants(), 'mt-5 w-full justify-center')}>
            Enroll — ₦{role.priceNgn.toLocaleString()} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const { completedTopics, totalTopics } = computeRoleProgress(role, enrollment)
  const progressPct = Math.round((completedTopics / totalTopics) * 100)
  const nextTopic = getNextTopic(role, enrollment)
  const allTopicsDone = completedTopics === totalTopics

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}>
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Dashboard
      </Link>

      {/* Role header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{role.icon}</span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{role.category}</p>
            <h1 className="font-heading text-xl font-bold leading-tight">{role.title}</h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{completedTopics} of {totalTopics} topics complete</span>
            <span className="font-semibold text-foreground">{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {[
            { icon: BookOpen, label: `${role.modules.length} modules` },
            { icon: Clock, label: `${role.estimatedHours}h estimated` },
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

      {allTopicsDone && (
        <Card size="sm" className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold">All topics complete!</p>
              <p className="text-xs text-muted-foreground">Take the Final Exam to earn your certificate</p>
            </div>
            <Link href={`/learn/${role.slug}/test/${role.finalExam.id}`} className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>
              Take Exam
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      <div className="space-y-4">
        {role.modules.map((mod, modIndex) => {
          const modTopicsDone = mod.topics.filter(t => enrollment.completedTopicIds.includes(t.id)).length
          const modComplete = modTopicsDone === mod.topics.length
          const testPassed = enrollment.passedTestIds.includes(mod.test.id)
          const testUnlocked = modComplete

          const TYPE_LABEL: Record<string, string> = { text: 'Reading', guide: 'Guide', case_study: 'Case Study', workflow: 'Workflow' }

          return (
            <div key={mod.id} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', modComplete ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground')}>
                  {modComplete ? <CheckCircle2 className="h-4 w-4" /> : modIndex + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{mod.title}</p>
                  <p className="text-xs text-muted-foreground">{modTopicsDone}/{mod.topics.length} topics · {mod.test.passMarkPct}% pass mark</p>
                </div>
                {modComplete && <Badge variant="secondary" className="shrink-0 text-[10px]">Complete</Badge>}
              </div>

              <div className="divide-y divide-border/60">
                {mod.topics.map((topic, topicIndex) => {
                  const isCompleted = enrollment.completedTopicIds.includes(topic.id)
                  const prevDone = topicIndex === 0 || enrollment.completedTopicIds.includes(mod.topics[topicIndex - 1].id)
                  const isLocked = !prevDone && !isCompleted

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
                        <p className={cn('text-sm', isCompleted ? 'text-muted-foreground line-through' : 'font-medium text-foreground')}>{topic.title}</p>
                        <p className="text-[11px] text-muted-foreground">{TYPE_LABEL[topic.contentType]} · {topic.estimatedMinutes} min</p>
                      </div>
                      {!isLocked && (
                        <Link href={`/learn/${role.slug}/${topic.id}`} className={cn('shrink-0', buttonVariants({ variant: isCompleted ? 'ghost' : 'outline', size: 'xs' }))}>
                          {isCompleted ? 'Review' : 'Start'} <ChevronRight className="ml-0.5 h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  )
                })}

                {/* Module test */}
                <div className={cn('flex items-center gap-3 px-4 py-3', !testUnlocked && 'opacity-50')}>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                    {testPassed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : !testUnlocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <div className="h-4 w-4 rounded-full border-2 border-orange-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', testPassed ? 'text-muted-foreground line-through' : 'font-semibold')}>{mod.test.title}</p>
                    <p className="text-[11px] text-muted-foreground">{mod.test.questions.length} questions · {mod.test.passMarkPct}% to pass{mod.test.timeLimitMinutes ? ` · ${mod.test.timeLimitMinutes} min` : ''}</p>
                  </div>
                  {testUnlocked && (
                    <Link href={`/learn/${role.slug}/test/${mod.test.id}`} className={cn('shrink-0', buttonVariants({ variant: testPassed ? 'ghost' : 'default', size: 'xs' }))}>
                      {testPassed ? 'Review' : 'Take Test'} <ChevronRight className="ml-0.5 h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Final exam */}
        <div className={cn('overflow-hidden rounded-xl border border-dashed border-border bg-card', !allTopicsDone && 'opacity-60')}>
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{role.finalExam.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {role.finalExam.questions.length} questions · {role.finalExam.passMarkPct}% to pass · earns certificate
                {role.finalExam.timeLimitMinutes ? ` · ${role.finalExam.timeLimitMinutes} min` : ''}
              </p>
            </div>
            {allTopicsDone
              ? <Link href={`/learn/${role.slug}/test/${role.finalExam.id}`} className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>Start Exam</Link>
              : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
          </div>
        </div>
      </div>
    </div>
  )
}
