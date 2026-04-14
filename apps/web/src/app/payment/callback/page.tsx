'use client'

/**
 * Payment callback page — Paystack redirects here after a transaction attempt.
 *
 * Flow:
 *  1. Read ?reference= from URL
 *  2. Poll GET /payments/status/:reference every 2 s (up to 30 s)
 *  3. On 'completed' → redirect to the payment-type-specific destination
 *  4. On 'failed'    → show error with retry / dashboard CTAs
 *  5. On timeout     → show manual refresh prompt (webhook may still arrive)
 */

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { getSession, getAccessToken } from '@/lib/auth'

type PollState = 'polling' | 'completed' | 'failed' | 'timeout'

const POLL_INTERVAL_MS = 2_000
const MAX_POLLS        = 15  // 30 s total

function PaymentCallbackContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const reference    = searchParams.get('reference')

  const [state, setState]     = useState<PollState>('polling')
  const [redirectTo, setRedirectTo] = useState<string>('/dashboard')
  const pollCount = useRef(0)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!reference) {
      setState('failed')
      return
    }

    const session = getSession()
    const token   = getAccessToken()
    if (!session || !token) {
      router.replace('/login')
      return
    }

    async function poll() {
      pollCount.current += 1

      try {
        const res = await api.get<{
          success: boolean
          data: { status: 'pending' | 'completed' | 'failed'; redirect_to?: string }
        }>(`/payments/status/${reference}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const { status, redirect_to } = res.data

        if (status === 'completed') {
          setState('completed')
          setRedirectTo(redirect_to ?? '/dashboard')
          // Give the user a brief success flash before navigating
          setTimeout(() => router.replace(redirect_to ?? '/dashboard'), 1_500)
          return
        }

        if (status === 'failed') {
          setState('failed')
          return
        }

        // Still pending — schedule next poll or give up
        if (pollCount.current >= MAX_POLLS) {
          setState('timeout')
          return
        }

        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
      } catch {
        // Network error — keep trying until timeout
        if (pollCount.current >= MAX_POLLS) {
          setState('timeout')
          return
        }
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference])

  // ── Polling / loading ───────────────────────────────────────────────────────
  if (state === 'polling') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-base font-medium text-foreground">Confirming your payment…</p>
        <p className="text-sm text-muted-foreground">This usually takes a few seconds.</p>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (state === 'completed') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="text-lg font-semibold text-foreground">Payment confirmed!</p>
        <p className="text-sm text-muted-foreground">Taking you there now…</p>
      </div>
    )
  }

  // ── Timed out ───────────────────────────────────────────────────────────────
  if (state === 'timeout') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <RefreshCw className="h-10 w-10 text-amber-500" />
        <p className="text-base font-semibold text-foreground">Still processing…</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your payment is being verified. If you paid successfully, access will be
          granted within a few minutes.
        </p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              pollCount.current = 0
              setState('polling')
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check again
          </Button>
          <Button size="sm" onClick={() => router.replace('/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ── Failed ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <XCircle className="h-12 w-12 text-destructive" />
      <p className="text-base font-semibold text-foreground">Payment unsuccessful</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your payment was not completed. No charge was made.
      </p>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Try again
        </Button>
        <Button size="sm" onClick={() => router.replace('/dashboard')}>
          Go to dashboard
        </Button>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          }
        >
          <PaymentCallbackContent />
        </Suspense>
      </div>
    </div>
  )
}
