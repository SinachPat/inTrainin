'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, XCircle, Award, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiQuestion {
  id: string
  question: string
  options: string[]
  // `correct` is stripped server-side — scoring happens via the submit endpoint
}

interface ApiTest {
  id: string
  title: string
  testType: string
  passMark: number
  timeLimitMinutes: number | null
  questions: ApiQuestion[]
}

interface SubmitResult {
  scorePct: number
  passed: boolean
  passMark: number
  attemptNumber: number
  correctCount: number
  totalCount: number
}

interface Props {
  params: Promise<{ roleSlug: string; testId: string }>
}

type TestState = 'loading' | 'cooldown' | 'intro' | 'active' | 'result' | 'error'

// ── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question, index, total, selected, onSelect,
}: {
  question: ApiQuestion; index: number; total: number
  selected: number | null; onSelect: (i: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Question {index + 1} of {total}</p>
        <p className="text-base font-semibold leading-snug text-foreground">{question.question}</p>
      </div>
      <div className="space-y-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left text-sm transition-all',
              selected === i
                ? 'border-primary bg-primary/10 font-medium text-primary'
                : 'border-border bg-card hover:border-foreground/30 hover:bg-muted/50',
            )}
          >
            <span className={cn('mr-2.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold', selected === i ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')}>
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TestPage({ params }: Props) {
  const { roleSlug, testId } = use(params)

  const [testState, setTestState]   = useState<TestState>('loading')
  const [test, setTest]             = useState<ApiTest | null>(null)
  const [cooldownEndsAt, setCooldown] = useState<string | null>(null)
  const [currentQ, setCurrentQ]     = useState(0)
  const [answers, setAnswers]       = useState<(number | null)[]>([])
  const [result, setResult]         = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ success: boolean; data: { test: ApiTest } }>(
          `/assessment/tests/${testId}`,
        )
        setTest(res.data.test)
        setAnswers(Array(res.data.test.questions.length).fill(null))
        setTestState('intro')
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          window.location.replace('/login')
        } else if (e instanceof ApiError && e.status === 429) {
          const body = e.message  // cooldown info comes through the error
          // Try to parse cooldownEndsAt from the error code context
          setCooldown(null)
          setTestState('cooldown')
        } else if (e instanceof ApiError && (e.status === 404 || e.status === 403)) {
          setTestState('error')
        } else {
          setTestState('error')
        }
      }
    }
    load()
  }, [testId])

  async function handleSubmit() {
    if (!test) return
    setSubmitting(true)
    try {
      const payload = answers.map((selected, i) => ({
        questionId:   test.questions[i].id,
        selected:     selected ?? 0,
        selectedText: test.questions[i].options[selected ?? 0] ?? '',
      }))
      const res = await api.post<{ success: boolean; data: { attempt: SubmitResult } }>(
        `/assessment/tests/${testId}/submit`,
        { answers: payload },
      )
      setResult(res.data.attempt)
      setTestState('result')
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        setTestState('cooldown')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleSelect(optionIndex: number) {
    const next = [...answers]
    next[currentQ] = optionIndex
    setAnswers(next)
  }

  function handleNext() {
    if (!test) return
    if (currentQ < test.questions.length - 1) {
      setCurrentQ(q => q + 1)
    } else {
      handleSubmit()
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (testState === 'loading') {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 md:px-10">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  // ── Error / not found ─────────────────────────────────────────────────────────
  if (testState === 'error' || !test) return notFound()

  const isFinalExam    = test.testType === 'final'
  const answeredCount  = answers.filter(a => a !== null).length

  // ── Cooldown ─────────────────────────────────────────────────────────────────
  if (testState === 'cooldown') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-10">
        <Link href={`/learn/${roleSlug}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to curriculum
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-heading text-lg font-bold">Test on cooldown</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You must wait {isFinalExam ? '48 hours' : '24 hours'} before retrying.
              {cooldownEndsAt && ` Available again: ${new Date(cooldownEndsAt).toLocaleString('en-NG')}`}
            </p>
          </div>
          <Link href={`/learn/${roleSlug}`} className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-center')}>
            Back to curriculum
          </Link>
        </div>
      </div>
    )
  }

  // ── Intro screen ──────────────────────────────────────────────────────────────
  if (testState === 'intro') {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-10">
        <Link href={`/learn/${roleSlug}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground')}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to curriculum
        </Link>
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            {isFinalExam
              ? <Award className="h-7 w-7 text-primary" />
              : <CheckCircle2 className="h-7 w-7 text-primary" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {isFinalExam ? 'Certification Exam' : 'Module Test'}
            </p>
            <h1 className="mt-1 font-heading text-xl font-bold">{test.title}</h1>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
            {[
              { label: 'Questions', value: test.questions.length },
              { label: 'Pass mark', value: `${test.passMark}%` },
              { label: 'Time limit', value: test.timeLimitMinutes ? `${test.timeLimitMinutes} min` : 'None' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-muted py-3">
                <p className="font-heading text-base font-bold text-foreground sm:text-lg">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-muted p-3 text-left">
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Read each question carefully before selecting</li>
              <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> You can go back to previous questions before submitting</li>
              <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {isFinalExam ? '48-hour' : '24-hour'} cooldown if you do not pass</li>
              {isFinalExam && <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Certificate generated instantly on passing</li>}
            </ul>
          </div>
          <Button className="w-full" size="lg" onClick={() => setTestState('active')}>
            Start {isFinalExam ? 'exam' : 'test'} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Active test ───────────────────────────────────────────────────────────────
  if (testState === 'active') {
    const progressPct = ((currentQ + 1) / test.questions.length) * 100
    return (
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 md:px-10">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{test.title}</p>
            {test.timeLimitMinutes && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {test.timeLimitMinutes} min
              </div>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{answeredCount} of {test.questions.length} answered</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <QuestionCard
            question={test.questions[currentQ]}
            index={currentQ}
            total={test.questions.length}
            selected={answers[currentQ]}
            onSelect={handleSelect}
          />
        </div>

        <div className="flex gap-3">
          {currentQ > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCurrentQ(q => q - 1)} className="flex-1">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Previous
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            onClick={handleNext}
            disabled={answers[currentQ] === null || submitting}
          >
            {submitting
              ? 'Submitting…'
              : currentQ === test.questions.length - 1 ? 'Submit test' : 'Next'}
            {!submitting && <ChevronRight className="ml-1.5 h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap justify-center gap-1 pt-1 sm:gap-1.5">
          {test.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'h-7 w-7 rounded-full text-[11px] font-bold transition-all',
                i === currentQ
                  ? 'scale-110 bg-primary text-primary-foreground'
                  : answers[i] !== null
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Result screen ─────────────────────────────────────────────────────────────
  if (testState === 'result' && result) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-10">
        <div className={cn(
          'rounded-xl border p-6 text-center space-y-4',
          result.passed ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5',
        )}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background">
            {result.passed
              ? <CheckCircle2 className="h-8 w-8 text-green-500" />
              : <XCircle className="h-8 w-8 text-destructive" />}
          </div>
          <div>
            <p className={cn('font-heading text-2xl font-bold sm:text-3xl', result.passed ? 'text-green-600' : 'text-destructive')}>
              {result.scorePct}%
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {result.passed
                ? isFinalExam ? '🎉 You passed! Certificate generated.' : '✅ Test passed!'
                : `Not passed — ${result.passMark}% required`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {result.correctCount} of {result.totalCount} correct
              {!result.passed && ` · ${isFinalExam ? '48' : '24'}-hour cooldown before retry`}
            </p>
          </div>

          {result.passed && isFinalExam && (
            <Link href="/certificates" className={cn(buttonVariants(), 'w-full justify-center')}>
              <Award className="mr-1.5 h-4 w-4" /> View my certificate
            </Link>
          )}
          {result.passed && !isFinalExam && (
            <Link href={`/learn/${roleSlug}`} className={cn(buttonVariants(), 'w-full justify-center')}>
              Continue learning <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          )}
          {!result.passed && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setAnswers(Array(test.questions.length).fill(null))
                  setCurrentQ(0)
                  setResult(null)
                  setTestState('intro')
                }}
              >
                Try again later
              </Button>
              <Link
                href={`/learn/${roleSlug}`}
                className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-center text-muted-foreground')}
              >
                Back to curriculum
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
