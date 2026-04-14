'use client'

import { use, useState, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Volume2,
  ChevronRight, AlertTriangle, BookOpen,
  Play, Pause, RotateCcw, RotateCw, Loader2,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

// ── API types ─────────────────────────────────────────────────────────────────

interface ContentSection { heading: string; body: string }
interface ContentStep    { step: number; title: string; description: string }
interface ContentBody {
  sections?:         ContentSection[]
  key_points?:       string[]
  steps?:            ContentStep[]
  scenario?:         string
  what_went_wrong?:  string
  correct_response?: Record<string, string>
  what_not_to_do?:   string[]
  learning_outcome?: string
}

interface ApiTopic {
  id: string
  title: string
  content_type: 'text' | 'guide' | 'workflow' | 'case_study'
  content_body: ContentBody
  estimated_minutes: number | null
}

interface NavTopic { id: string; title: string }

interface Props {
  params: Promise<{ roleSlug: string; topicId: string }>
}

// ── Content renderers ─────────────────────────────────────────────────────────

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
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">The Scenario</p>
        </div>
        <p className="text-sm leading-relaxed text-foreground">{body.scenario}</p>
      </div>
      {body.what_went_wrong && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-destructive">What went wrong</p>
          <p className="text-sm leading-relaxed text-foreground">{body.what_went_wrong}</p>
        </div>
      )}
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
      {body.what_not_to_do && body.what_not_to_do.length > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-card p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-destructive">What NOT to do</p>
          <ul className="space-y-2">
            {body.what_not_to_do.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 h-4 w-4 shrink-0 text-center font-bold text-destructive">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
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

// ── Text extractor (for speech synthesis) ────────────────────────────────────

function extractText(body: ContentBody): string {
  const parts: string[] = []
  body.sections?.forEach(s => { parts.push(s.heading + '. ' + s.body) })
  body.key_points?.forEach(p => { parts.push(p) })
  body.steps?.forEach(s => { parts.push(`Step ${s.step}. ${s.title}. ${s.description}`) })
  if (body.scenario)         parts.push('The scenario. ' + body.scenario)
  if (body.what_went_wrong)  parts.push('What went wrong. ' + body.what_went_wrong)
  if (body.correct_response) {
    Object.entries(body.correct_response).forEach(([k, v]) => parts.push(k + '. ' + v))
  }
  if (body.what_not_to_do)   parts.push('What not to do. ' + body.what_not_to_do.join('. '))
  if (body.learning_outcome) parts.push('Learning outcome. ' + body.learning_outcome)
  return parts.join('. ')
}

// ── Dispatcher ───────────────────────────────────────────────────────────────
// Prefer content_type as a hint but fall back based on the actual data shape.
// This guards against mismatches between the DB label and the JSON structure
// (e.g. a 'guide' whose JSON actually uses sections instead of steps).

function TopicContentRenderer({ topic }: { topic: ApiTopic }) {
  const body = topic.content_body
  const hasSteps    = Array.isArray(body.steps)    && body.steps.length    > 0
  const hasSections = Array.isArray(body.sections) && body.sections.length > 0
  const hasScenario = Boolean(body.scenario)

  if (hasScenario || topic.content_type === 'case_study') {
    return <CaseStudyContent body={body} />
  }
  if (topic.content_type === 'workflow' && hasSteps) {
    return <WorkflowContent body={body} />
  }
  if (topic.content_type === 'guide' && hasSteps) {
    return <GuideContent body={body} />
  }
  // Fallback: TextContent renders sections + key_points and always shows
  // something even if content_type is mismatched with the actual JSON.
  if (hasSections || (body.key_points?.length ?? 0) > 0) {
    return <TextContent body={body} />
  }
  // Last resort: steps exist but type wasn't matched above
  if (hasSteps) {
    return topic.content_type === 'workflow'
      ? <WorkflowContent body={body} />
      : <GuideContent    body={body} />
  }
  return (
    <p className="text-sm text-muted-foreground">No content available for this topic.</p>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TopicPage({ params }: Props) {
  const { roleSlug, topicId } = use(params)

  const [topic, setTopic]             = useState<ApiTopic | null>(null)
  const [marked, setMarked]           = useState(false)
  const [markingDone, setMarkingDone] = useState(false)
  const [navTopics, setNavTopics]     = useState<NavTopic[]>([])
  const [loading, setLoading]         = useState(true)
  const [gone, setGone]               = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [topicRes, roleRes] = await Promise.all([
          api.get<{ success: boolean; data: { topic: ApiTopic; progress: { status: string } } }>(
            `/learning/topics/${topicId}`,
          ),
          api.get<{
            success: boolean
            data: { role: { modules: { order_index: number; topics: { id: string; title: string; order_index: number }[] }[] } }
          }>(`/learning/roles/${roleSlug}`).catch(() => null),
        ])

        setTopic(topicRes.data.topic)
        setMarked(topicRes.data.progress.status === 'completed')

        if (roleRes) {
          const flat = [...roleRes.data.role.modules]
            .sort((a, b) => a.order_index - b.order_index)
            .flatMap(m => [...m.topics].sort((a, b) => a.order_index - b.order_index))
          setNavTopics(flat)
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
        else if (e instanceof ApiError && (e.status === 404 || e.status === 403)) setGone(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [roleSlug, topicId])

  // ── Audio player ─────────────────────────────────────────────────────────────
  // Primary: Google Cloud TTS via API endpoint — high-quality, deterministic.
  // Fallback: window.speechSynthesis — used when the API returns 503 (not
  //   configured) or any other non-200 status.
  //
  // When the API succeeds we use an <audio> element for native seek + speed
  // control. The blob URL is cached in audioUrlRef so play/pause doesn't
  // re-fetch.

  const SPEEDS = [0.75, 1, 1.25, 1.5] as const
  type Speed = typeof SPEEDS[number]

  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioTime,    setAudioTime]    = useState(0)
  const [audioDur,     setAudioDur]     = useState((topic?.estimated_minutes ?? 5) * 60)
  const [speed,        setSpeed]        = useState<Speed>(1)
  const [audioLoading, setAudioLoading] = useState(false)

  // Refs for the <audio> element path
  const audioRef    = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)   // cached blob URL
  const usingApi    = useRef(false)                 // true = <audio>, false = speechSynthesis

  // Web Speech fallback refs (same pattern as before)
  const fullTextRef   = useRef('')
  const charOffsetRef = useRef(0)
  const speechActive  = useRef(false)

  // Pre-extract text when topic loads (used by both paths)
  useEffect(() => {
    if (topic) {
      fullTextRef.current = extractText(topic.content_body)
      setAudioDur((topic.estimated_minutes ?? 5) * 60)
    }
  }, [topic])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  // ── Fetch audio from API and create blob URL (called once on first play) ─────
  async function loadApiAudio(): Promise<string | null> {
    if (audioUrlRef.current) return audioUrlRef.current  // already fetched
    try {
      const token = localStorage.getItem('intrainin_access_token') ?? ''
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/learning/topics/${topicId}/audio`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) return null
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      audioUrlRef.current = url
      return url
    } catch {
      return null
    }
  }

  // ── Web Speech fallback helpers ───────────────────────────────────────────────
  function startSpeechFrom(charOffset: number, currentSpeed: Speed) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const remaining = fullTextRef.current.slice(charOffset)
    if (!remaining.trim()) return

    const utt = new SpeechSynthesisUtterance(remaining)
    utt.rate  = currentSpeed
    utt.lang  = 'en-GB'

    utt.onboundary = (e) => {
      charOffsetRef.current = charOffset + e.charIndex
      const pct = fullTextRef.current.length > 0
        ? charOffsetRef.current / fullTextRef.current.length : 0
      setAudioTime(Math.round(pct * audioDur))
    }
    utt.onend = () => {
      if (!speechActive.current) return
      charOffsetRef.current = fullTextRef.current.length
      setAudioTime(audioDur)
      setAudioPlaying(false)
    }
    speechActive.current = true
    window.speechSynthesis.speak(utt)
  }

  // ── Toggle play / pause ───────────────────────────────────────────────────────
  async function togglePlay() {
    if (audioPlaying) {
      // Pause
      if (usingApi.current && audioRef.current) {
        audioRef.current.pause()
      } else {
        speechActive.current = false
        if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      }
      setAudioPlaying(false)
      return
    }

    // Play — try API first
    setAudioLoading(true)
    const url = await loadApiAudio()
    setAudioLoading(false)

    if (url) {
      // ── API path: use <audio> element ─────────────────────────────────────────
      usingApi.current = true
      if (!audioRef.current) {
        const el = new Audio()
        el.ontimeupdate = () => setAudioTime(Math.round(el.currentTime))
        el.ondurationchange = () => setAudioDur(Math.round(el.duration))
        el.onended = () => { setAudioPlaying(false); setAudioTime(Math.round(el.duration)) }
        el.onpause = () => setAudioPlaying(false)
        el.onplay  = () => setAudioPlaying(true)
        audioRef.current = el
      }
      const el = audioRef.current
      if (el.src !== url) el.src = url
      el.playbackRate = speed
      el.currentTime  = audioRef.current.currentTime  // preserve position
      el.play().catch(() => {
        // Autoplay blocked or error — fall through to speech
        usingApi.current = false
        audioRef.current = null
        startSpeechFrom(charOffsetRef.current, speed)
        setAudioPlaying(true)
      })
    } else {
      // ── Fallback: Web Speech API ───────────────────────────────────────────────
      usingApi.current = false
      startSpeechFrom(charOffsetRef.current, speed)
      setAudioPlaying(true)
    }
  }

  function seekBy(delta: number) {
    if (usingApi.current && audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.duration || audioDur, audioRef.current.currentTime + delta),
      )
    } else {
      const next = Math.max(0, Math.min(audioDur, audioTime + delta))
      const pct  = audioDur > 0 ? next / audioDur : 0
      charOffsetRef.current = Math.round(pct * fullTextRef.current.length)
      setAudioTime(next)
      if (audioPlaying) startSpeechFrom(charOffsetRef.current, speed)
    }
  }

  function changeSpeed(s: Speed) {
    setSpeed(s)
    if (usingApi.current && audioRef.current) {
      audioRef.current.playbackRate = s
    } else if (audioPlaying) {
      startSpeechFrom(charOffsetRef.current, s)
    }
  }

  const totalSeconds = audioDur

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  async function handleMarkComplete() {
    setMarkingDone(true)
    try {
      await api.post(`/learning/topics/${topicId}/complete`, { timeSpentSeconds: Math.round(audioTime) })
      setMarked(true)
    } catch {
      // leave topic as incomplete so the user can retry
    } finally {
      setMarkingDone(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-10">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (gone || !topic) return notFound()

  const currentIndex = navTopics.findIndex(t => t.id === topicId)
  const prevTopic    = currentIndex > 0 ? navTopics[currentIndex - 1] : null
  const nextTopic    = currentIndex < navTopics.length - 1 ? navTopics[currentIndex + 1] : null

  const TYPE_LABEL: Record<string, string> = {
    text: 'Reading', guide: 'Step-by-Step Guide', case_study: 'Case Study', workflow: 'Workflow',
  }
  const TYPE_COLOR: Record<string, string> = {
    text: 'bg-blue-500/10 text-blue-600', guide: 'bg-green-500/10 text-green-600',
    case_study: 'bg-amber-500/10 text-amber-600', workflow: 'bg-purple-500/10 text-purple-600',
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-10">
      <Link
        href={`/learn/${roleSlug}`}
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to curriculum
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-heading text-xl font-bold leading-tight text-foreground">{topic.title}</h1>
          {marked && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', TYPE_COLOR[topic.content_type])}>
            {TYPE_LABEL[topic.content_type]}
          </span>
          {topic.estimated_minutes && (
            <span className="text-xs text-muted-foreground">{topic.estimated_minutes} min read</span>
          )}
        </div>
      </div>

      {/* Audio player */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <Volume2 className="h-3.5 w-3.5 text-primary" />
          <p className="flex-1 text-[13px] font-medium text-foreground">Read aloud</p>
          <p className="text-[11px] text-muted-foreground">
            {formatTime(audioTime)} / {formatTime(totalSeconds)}
          </p>
        </div>
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${Math.min((audioTime / totalSeconds) * 100, 100)}%` }}
          />
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => seekBy(-10)}
              disabled={audioLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <Button
              size="sm"
              variant={audioPlaying ? 'default' : 'outline'}
              onClick={togglePlay}
              disabled={audioLoading}
              className="h-9 w-9 rounded-full p-0"
            >
              {audioLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : audioPlaying
                  ? <Pause className="h-4 w-4" />
                  : <Play className="h-4 w-4" />}
            </Button>
            <button
              onClick={() => seekBy(10)}
              disabled={audioLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-1">
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
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
        <Button className="w-full" size="lg" onClick={handleMarkComplete} disabled={markingDone}>
          {markingDone
            ? 'Saving…'
            : <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Mark as complete</span>}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 py-3">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-700">Topic completed</span>
        </div>
      )}

      {/* Prev / Next */}
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
