'use client'

import { use, useState, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Volume2, VolumeX,
  ChevronRight, AlertTriangle, BookOpen,
  Play, Pause, RotateCcw, RotateCw,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MOCK_ROLES, getRoleBySlug, getEnrollmentBySlug,
  getTopicById, getModuleForTopic,
  type MockTopic, type ContentBody,
} from '@/lib/mock-data'

interface Props {
  params: Promise<{ roleSlug: string; topicId: string }>
}

// ─── Content renderers ────────────────────────────────────────────────────────

function TextContent({ body }: { body: ContentBody }) {
  return (
    <div className="space-y-6">
      {body.sections?.map((section, i) => (
        <div key={i} className="space-y-2">
          <h3 className="font-heading text-base font-semibold text-foreground">{section.heading}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
        </div>
      ))}
      {body.key_points && body.key_points.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Key points</p>
          <ul className="space-y-2">
            {body.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function GuideContent({ body }: { body: ContentBody }) {
  return (
    <div className="space-y-3">
      {body.steps?.map((step) => (
        <div key={step.step} className="flex gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {step.step}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function WorkflowContent({ body }: { body: ContentBody }) {
  return (
    <div className="relative space-y-0">
      {body.steps?.map((step, i) => (
        <div key={step.step} className="relative flex gap-4 pb-4 last:pb-0">
          {/* Vertical connector */}
          {i < (body.steps?.length ?? 0) - 1 && (
            <div className="absolute left-4 top-8 h-full w-0.5 bg-border" />
          )}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
            {step.step}
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-3">
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CaseStudyContent({ body }: { body: ContentBody }) {
  return (
    <div className="space-y-4">
      {/* Scenario */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">The Scenario</p>
        </div>
        <p className="text-sm leading-relaxed text-foreground">{body.scenario}</p>
      </div>

      {/* What went wrong */}
      {body.what_went_wrong && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-destructive">What went wrong</p>
          <p className="text-sm leading-relaxed text-foreground">{body.what_went_wrong}</p>
        </div>
      )}

      {/* Correct response */}
      {body.correct_response && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600">The correct response</p>
          {Object.entries(body.correct_response).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <p className="mb-1 text-xs font-semibold text-green-700">{key}</p>
              <p className="text-sm leading-relaxed text-foreground">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* What NOT to do */}
      {body.what_not_to_do && body.what_not_to_do.length > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-destructive">What NOT to do</p>
          <ul className="space-y-2">
            {body.what_not_to_do.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 h-4 w-4 shrink-0 text-center text-destructive font-bold">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Learning outcome */}
      {body.learning_outcome && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Learning outcome</p>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{body.learning_outcome}</p>
        </div>
      )}
    </div>
  )
}

function TopicContentRenderer({ topic }: { topic: MockTopic }) {
  switch (topic.contentType) {
    case 'text': return <TextContent body={topic.contentBody} />
    case 'guide': return <GuideContent body={topic.contentBody} />
    case 'workflow': return <WorkflowContent body={topic.contentBody} />
    case 'case_study': return <CaseStudyContent body={topic.contentBody} />
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopicPage({ params }: Props) {
  const { roleSlug, topicId } = use(params)
  const role = getRoleBySlug(roleSlug)
  if (!role) return notFound()

  const topic = getTopicById(role, topicId)
  if (!topic) return notFound()

  const mod = getModuleForTopic(role, topicId)
  const enrollment = getEnrollmentBySlug(roleSlug)
  const isCompleted = enrollment?.completedTopicIds.includes(topicId) ?? false

  // Find prev / next topics across all modules
  const allTopics = role.modules.flatMap(m => m.topics)
  const currentIndex = allTopics.findIndex(t => t.id === topicId)
  const prevTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null

  // Audio player state
  const SPEEDS = [0.75, 1, 1.25, 1.5] as const
  type Speed = typeof SPEEDS[number]
  const totalSeconds = (topic.estimatedMinutes ?? 5) * 60
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioTime, setAudioTime] = useState(0)
  const [speed, setSpeed] = useState<Speed>(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (audioPlaying) {
      intervalRef.current = setInterval(() => {
        setAudioTime(t => {
          if (t >= totalSeconds) { setAudioPlaying(false); return totalSeconds }
          return t + speed
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [audioPlaying, speed, totalSeconds])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const [markingDone, setMarkingDone] = useState(false)
  const [marked, setMarked] = useState(isCompleted)

  const TYPE_LABEL: Record<string, string> = {
    text: 'Reading',
    guide: 'Step-by-Step Guide',
    case_study: 'Case Study',
    workflow: 'Workflow',
  }
  const TYPE_COLOR: Record<string, string> = {
    text: 'bg-blue-500/10 text-blue-600',
    guide: 'bg-green-500/10 text-green-600',
    case_study: 'bg-amber-500/10 text-amber-600',
    workflow: 'bg-purple-500/10 text-purple-600',
  }

  function handleMarkComplete() {
    setMarkingDone(true)
    setTimeout(() => {
      setMarked(true)
      setMarkingDone(false)
    }, 600)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-10">
      {/* Back */}
      <Link
        href={`/learn/${roleSlug}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> {role.title}
      </Link>

      {/* Header */}
      <div className="space-y-2">
        {mod && (
          <p className="text-xs font-medium text-muted-foreground">{mod.title}</p>
        )}
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-xl font-bold leading-tight text-foreground">{topic.title}</h1>
          {marked && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', TYPE_COLOR[topic.contentType])}>
            {TYPE_LABEL[topic.contentType]}
          </span>
          <span className="text-xs text-muted-foreground">{topic.estimatedMinutes} min read</span>
        </div>
      </div>

      {/* ── Audio player ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header row */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <Volume2 className="h-3.5 w-3.5 text-primary" />
          <p className="flex-1 text-[13px] font-medium text-foreground">Read aloud</p>
          <p className="text-[11px] text-muted-foreground">
            {formatTime(audioTime)} / {formatTime(totalSeconds)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${Math.min((audioTime / totalSeconds) * 100, 100)}%` }}
          />
        </div>

        {/* Controls — two rows to fit 320px screens */}
        <div className="px-4 py-3 space-y-2">
          {/* Row 1: transport controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAudioTime(t => Math.max(0, t - 10))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Back 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <Button
              size="sm"
              variant={audioPlaying ? 'default' : 'outline'}
              onClick={() => setAudioPlaying(p => !p)}
              className="h-9 w-9 rounded-full p-0"
            >
              {audioPlaying
                ? <Pause className="h-4 w-4" />
                : <Play className="h-4 w-4" />}
            </Button>

            <button
              onClick={() => setAudioTime(t => Math.min(totalSeconds, t + 10))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Forward 10s"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          {/* Row 2: speed selector */}
          <div className="flex items-center justify-center gap-1">
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors',
                  speed === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <TopicContentRenderer topic={topic} />
      </div>

      {/* Mark complete */}
      {!marked ? (
        <Button
          className="w-full"
          size="lg"
          onClick={handleMarkComplete}
          disabled={markingDone}
        >
          {markingDone ? (
            'Saving…'
          ) : (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Mark as complete
            </span>
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 py-3">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-700">Topic completed</span>
        </div>
      )}

      {/* Prev / Next navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {prevTopic && (
          <Link
            href={`/learn/${roleSlug}/${prevTopic.id}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-start sm:flex-1')}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{prevTopic.title}</span>
          </Link>
        )}
        {nextTopic && (
          <Link
            href={`/learn/${roleSlug}/${nextTopic.id}`}
            className={cn(buttonVariants({ variant: marked ? 'default' : 'outline', size: 'sm' }), 'w-full justify-between sm:flex-1 sm:justify-end')}
          >
            <span className="truncate">{nextTopic.title}</span>
            <ChevronRight className="ml-1.5 h-3.5 w-3.5 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}
