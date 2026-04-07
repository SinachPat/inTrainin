'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, XCircle, Award, ChevronRight } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getRoleBySlug, getTestById, type MockTest, type Question } from '@/lib/mock-data'

interface Props {
  params: Promise<{ roleSlug: string; testId: string }>
}

type TestState = 'intro' | 'active' | 'result'

function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: {
  question: Question
  index: number
  total: number
  selected: number | null
  onSelect: (i: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          Question {index + 1} of {total}
        </p>
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

function ReviewCard({ question, selected, index }: { question: Question; selected: number; index: number }) {
  const isCorrect = selected === question.correct
  return (
    <div className={cn('rounded-xl border p-4 space-y-3', isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5')}>
      <div className="flex items-start gap-2">
        {isCorrect
          ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
          : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
        <p className="text-sm font-medium text-foreground">Q{index + 1}. {question.question}</p>
      </div>
      <div className="ml-6 space-y-1 text-xs">
        {!isCorrect && (
          <p className="text-destructive">
            Your answer: <span className="font-medium">{question.options[selected]}</span>
          </p>
        )}
        <p className={isCorrect ? 'text-green-700' : 'text-foreground'}>
          Correct: <span className="font-medium">{question.options[question.correct]}</span>
        </p>
        <p className="mt-1 text-muted-foreground">{question.explanation}</p>
      </div>
    </div>
  )
}

export default function TestPage({ params }: Props) {
  const { roleSlug, testId } = use(params)
  const role = getRoleBySlug(roleSlug)
  if (!role) return notFound()

  const testOrNull = getTestById(role, testId)
  if (!testOrNull) return notFound()
  const test: MockTest = testOrNull   // narrow to non-optional for closures

  const isFinalExam = test.testType === 'final'
  const [testState, setTestState] = useState<TestState>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(test.questions.length).fill(null))
  const [score, setScore] = useState<{ correct: number; pct: number; passed: boolean } | null>(null)

  function handleSelect(optionIndex: number) {
    const next = [...answers]
    next[currentQ] = optionIndex
    setAnswers(next)
  }

  function handleNext() {
    if (currentQ < test.questions.length - 1) {
      setCurrentQ(q => q + 1)
    } else {
      submitTest()
    }
  }

  function handlePrev() {
    setCurrentQ(q => Math.max(0, q - 1))
  }

  function submitTest() {
    const correct = test.questions.filter((q, i) => answers[i] === q.correct).length
    const pct = Math.round((correct / test.questions.length) * 100)
    const passed = pct >= test.passMarkPct
    setScore({ correct, pct, passed })
    setTestState('result')
  }

  const answeredCount = answers.filter(a => a !== null).length

  // ── Intro screen ────────────────────────────────────────────────────────────
  if (testState === 'intro') {
    return (
      <div className="space-y-6">
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

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Questions', value: test.questions.length },
              { label: 'Pass mark', value: `${test.passMarkPct}%` },
              { label: 'Time limit', value: test.timeLimitMinutes ? `${test.timeLimitMinutes} min` : 'None' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-muted/40 py-3">
                <p className="font-heading text-lg font-bold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-left">
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Read each question carefully before selecting your answer</li>
              <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> You can go back to previous questions before submitting</li>
              <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {isFinalExam ? '48-hour' : '24-hour'} cooldown applies if you do not pass</li>
              {isFinalExam && <li className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> Your certificate is generated instantly on passing</li>}
            </ul>
          </div>

          <Button className="w-full" size="lg" onClick={() => setTestState('active')}>
            Start {isFinalExam ? 'exam' : 'test'} <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Active test ─────────────────────────────────────────────────────────────
  if (testState === 'active') {
    const progress = ((currentQ + 1) / test.questions.length) * 100

    return (
      <div className="space-y-5">
        {/* Header */}
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
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{answeredCount} of {test.questions.length} answered</p>
        </div>

        {/* Question */}
        <div className="rounded-xl border border-border bg-card p-5">
          <QuestionCard
            question={test.questions[currentQ]}
            index={currentQ}
            total={test.questions.length}
            selected={answers[currentQ]}
            onSelect={handleSelect}
          />
        </div>

        {/* Nav */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <Button variant="outline" size="sm" onClick={handlePrev} className="flex-1">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Previous
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            onClick={handleNext}
            disabled={answers[currentQ] === null}
          >
            {currentQ === test.questions.length - 1 ? 'Submit test' : 'Next'}
            <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          {test.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={cn(
                'h-6 w-6 rounded-full text-[10px] font-bold transition-all',
                i === currentQ
                  ? 'bg-primary text-primary-foreground scale-110'
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

  // ── Result screen ───────────────────────────────────────────────────────────
  if (testState === 'result' && score) {
    return (
      <div className="space-y-6">
        {/* Result card */}
        <div className={cn(
          'rounded-xl border p-6 text-center space-y-4',
          score.passed ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5',
        )}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background">
            {score.passed
              ? <CheckCircle2 className="h-8 w-8 text-green-500" />
              : <XCircle className="h-8 w-8 text-destructive" />}
          </div>
          <div>
            <p className={cn('font-heading text-3xl font-bold', score.passed ? 'text-green-600' : 'text-destructive')}>
              {score.pct}%
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {score.passed ? (isFinalExam ? '🎉 You passed! Certificate generated.' : '✅ Test passed!') : `Not passed — ${test.passMarkPct}% required`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {score.correct} of {test.questions.length} correct
              {!score.passed && ` · ${isFinalExam ? '48' : '24'}-hour cooldown before retry`}
            </p>
          </div>

          {score.passed && isFinalExam && (
            <Link href="/certificates" className={cn(buttonVariants(), 'w-full justify-center')}>
              <Award className="mr-1.5 h-4 w-4" /> View my certificate
            </Link>
          )}
          {score.passed && !isFinalExam && (
            <Link href={`/learn/${roleSlug}`} className={cn(buttonVariants(), 'w-full justify-center')}>
              Continue learning <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          )}
          {!score.passed && (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => { setAnswers(Array(test.questions.length).fill(null)); setCurrentQ(0); setTestState('intro') }}>
                Try again later
              </Button>
              <Link href={`/learn/${roleSlug}`} className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-center text-muted-foreground')}>
                Back to curriculum
              </Link>
            </div>
          )}
        </div>

        {/* Answer review */}
        <div className="space-y-3">
          <h2 className="font-heading text-base font-semibold">Answer review</h2>
          {test.questions.map((q, i) => (
            <ReviewCard key={q.id} question={q} selected={answers[i] ?? 0} index={i} />
          ))}
        </div>
      </div>
    )
  }

  return null
}
