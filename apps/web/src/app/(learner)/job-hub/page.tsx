'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Briefcase, MapPin, CheckCircle2, XCircle, Clock,
  ArrowRight, Star, ChevronRight,
  Bell, Check, Coins, Plus, Loader2,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'
import { getSession } from '@/lib/auth'

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobHubProfile {
  id: string
  availability: string | null
  employment_type_pref: string | null
}

interface HireRequest {
  id: string
  location_city: string | null
  pay_min: number | null
  pay_max: number | null
  start_date: string | null
  requirements: string | null
  certification_required: boolean
  roles: { id: string; slug: string; title: string } | null
}

interface Match {
  id: string
  match_score: number
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  hire_requests: HireRequest | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVAILABILITY_OPTIONS = [
  { value: 'immediate',   label: 'Immediately' },
  { value: 'two_weeks',   label: 'Within 2 weeks' },
  { value: 'one_month',   label: 'Within 1 month' },
]

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time',  label: 'Full-time' },
  { value: 'part_time',  label: 'Part-time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'any',        label: 'Any' },
]

const CREDIT_PACKAGES = [
  { credits: 20,  priceNgn: 2_000, price: '₦2,000',  label: 'Starter pack' },
  { credits: 50,  priceNgn: 4_500, price: '₦4,500',  label: 'Popular', highlight: true },
  { credits: 100, priceNgn: 8_000, price: '₦8,000',  label: 'Best value' },
]

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function formatPay(min: number | null, max: number | null) {
  if (!min && !max) return 'Negotiable'
  if (min && max) return `₦${min.toLocaleString()} – ₦${max.toLocaleString()}/mo`
  if (min) return `From ₦${min.toLocaleString()}/mo`
  return `Up to ₦${max!.toLocaleString()}/mo`
}

// ── Credit balance pill ───────────────────────────────────────────────────────

function CreditPill({ balance, onBuy }: { balance: number; onBuy: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
        balance > 0
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}>
        <Coins className="h-3.5 w-3.5" />
        {balance} credit{balance !== 1 ? 's' : ''}
      </div>
      <button
        onClick={onBuy}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-3 w-3" /> Buy more
      </button>
    </div>
  )
}

// ── Buy credits modal ─────────────────────────────────────────────────────────

type PaystackPopInstance = { openIframe: () => void }
type PaystackPopSetup = (opts: Record<string, unknown>) => PaystackPopInstance

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as Window & { PaystackPop?: unknown }).PaystackPop) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload  = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Paystack'))
    document.head.appendChild(script)
  })
}

function BuyCreditsSheet({ userId, onCreditsPurchased, onClose }: {
  userId: string
  onCreditsPurchased: (added: number) => void
  onClose: () => void
}) {
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [error, setError]           = useState<string | null>(null)

  async function handleBuy(pkg: typeof CREDIT_PACKAGES[number]) {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    if (!publicKey) {
      setError('Payment not configured — please contact support.')
      return
    }
    setPurchasing(pkg.credits)
    setError(null)

    try {
      await loadPaystackScript()
    } catch {
      setPurchasing(null)
      setError('Could not load payment widget — check your connection and try again.')
      return
    }

    const PaystackPop = (window as Window & { PaystackPop: { setup: PaystackPopSetup } }).PaystackPop

    const handler = PaystackPop.setup({
      key:      publicKey,
      email:    `${userId}@users.intrainin.com`,
      amount:   pkg.priceNgn * 100,
      currency: 'NGN',
      metadata: { type: 'credits', user_id: userId },
      onSuccess: async (response: { reference: string }) => {
        try {
          const res = await api.post<{ success: boolean; data: { creditsAdded: number } }>(
            '/jobhub/credits/purchase',
            { paymentReference: response.reference },
          )
          onCreditsPurchased(res.data.creditsAdded)
          onClose()
        } catch {
          setError('Payment succeeded but credits could not be applied — contact support@intrainin.com.')
        } finally {
          setPurchasing(null)
        }
      },
      onCancel: () => { setPurchasing(null) },
    })

    handler.openIframe()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-foreground">Buy credits</p>
          <button onClick={onClose} disabled={purchasing !== null} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Each job application costs <strong className="text-foreground">5 credits</strong>. Credits never expire and roll over monthly.
        </p>
        <div className="space-y-2">
          {CREDIT_PACKAGES.map(pkg => (
            <button
              key={pkg.credits}
              onClick={() => handleBuy(pkg)}
              disabled={purchasing !== null}
              className={cn(
                'relative w-full rounded-xl border px-4 py-3 text-left transition-all hover:border-primary/50 disabled:opacity-60',
                pkg.highlight ? 'border-primary bg-primary/5' : 'border-border bg-background',
              )}
            >
              {pkg.highlight && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {pkg.label}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{pkg.credits} credits</p>
                  <p className="text-xs text-muted-foreground">{!pkg.highlight && pkg.label}</p>
                </div>
                {purchasing === pkg.credits
                  ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  : <p className="text-base font-bold text-foreground">{pkg.price}</p>}
              </div>
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        <p className="mt-3 text-center text-[11px] text-muted-foreground">Secured by Paystack · Credits applied instantly on payment</p>
      </div>
    </div>
  )
}

// ── Match card ────────────────────────────────────────────────────────────────

function MatchCard({ match, creditBalance, onAccept, onDecline }: {
  match: Match
  creditBalance: number
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}) {
  const req      = match.hire_requests
  const pending  = match.status === 'pending'
  const accepted = match.status === 'accepted'
  const canAccept = creditBalance >= 5

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', accepted ? 'border-green-500/30' : 'border-border')}>
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
        <Star className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-primary">{match.match_score}% match</span>
        <div className="ml-1 h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${match.match_score}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground">{timeAgo(match.created_at)}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-semibold text-foreground">{req?.roles?.title ?? 'Role'}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {req?.location_city && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{req.location_city}
                </span>
              )}
            </div>
          </div>
          {accepted && (
            <Badge variant="secondary" className="shrink-0 border-green-500/30 bg-green-500/10 text-[10px] text-green-700">
              <Check className="mr-1 h-3 w-3" /> Accepted
            </Badge>
          )}
          {match.status === 'declined' && (
            <Badge variant="secondary" className="shrink-0 text-[10px] text-muted-foreground">Declined</Badge>
          )}
        </div>

        {req && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-xs font-medium text-foreground">{formatPay(req.pay_min, req.pay_max)}</span>
            {req.start_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Start {new Date(req.start_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {req.certification_required && (
              <span className="flex items-center gap-1 text[11px] text-amber-600">
                <CheckCircle2 className="h-3 w-3" /> Cert required
              </span>
            )}
          </div>
        )}

        {req?.requirements && (
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{req.requirements}</p>
        )}

        {pending && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm" className="flex-1"
                onClick={() => onAccept(match.id)}
                disabled={!canAccept}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept — 5 credits
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => onDecline(match.id)}>
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
              </Button>
            </div>
            {!canAccept && (
              <p className="text-center text-[11px] text-muted-foreground">
                Not enough credits to apply. <span className="font-medium text-primary">Buy more credits</span> to accept this match.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main view (always shown — credits replace the subscription gate) ───────────

function JobHubView({
  profile, initialMatches, initialBalance, userId,
}: {
  profile: JobHubProfile
  initialMatches: Match[]
  initialBalance: number
  userId: string
}) {
  const [matches, setMatches]         = useState(initialMatches)
  const [balance, setBalance]         = useState(initialBalance)
  const [availability, setAvail]      = useState(profile.availability ?? 'immediate')
  const [employmentType, setEmpType]  = useState(profile.employment_type_pref ?? 'full_time')
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [showBuy, setShowBuy]         = useState(false)

  const pending   = matches.filter(m => m.status === 'pending')
  const responded = matches.filter(m => m.status !== 'pending')

  async function respondToMatch(id: string, status: 'accepted' | 'declined') {
    const costCredits = status === 'accepted' ? 5 : 0
    // Optimistic update
    setMatches(ms => ms.map(m => m.id === id ? { ...m, status } : m))
    if (costCredits > 0) setBalance(b => b - costCredits)

    api.patch(`/jobhub/matches/${id}`, { status }).catch(() => {
      // Revert on failure
      setMatches(ms => ms.map(m => m.id === id ? { ...m, status: 'pending' } : m))
      if (costCredits > 0) setBalance(b => b + costCredits)
    })
  }

  async function savePreferences() {
    setSavingPrefs(true)
    try {
      await api.put('/jobhub/profile', { availability, employmentTypePref: employmentType })
    } catch {
      // best-effort
    } finally {
      setSavingPrefs(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Credit balance bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Your credits</p>
          <p className="text-[11px] text-muted-foreground">5 credits per application · 10 free every month</p>
        </div>
        <CreditPill balance={balance} onBuy={() => setShowBuy(true)} />
      </div>

      {/* Preferences */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Your matching preferences</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Availability</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAvail(opt.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    availability === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/30',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">Employment type</p>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setEmpType(opt.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    employmentType === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/30',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={savePreferences} disabled={savingPrefs}>
              {savingPrefs ? 'Saving…' : 'Save preferences'}
            </Button>
            <Link href="/profile" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-muted-foreground')}>
              Edit profile <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Pending matches */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-semibold text-foreground">New matches</h2>
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {pending.length}
            </span>
          </div>
          {pending.map(m => (
            <MatchCard
              key={m.id} match={m} creditBalance={balance}
              onAccept={id => respondToMatch(id, 'accepted')}
              onDecline={id => respondToMatch(id, 'declined')}
            />
          ))}
        </section>
      )}

      {responded.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[13px] font-semibold text-muted-foreground">Previous responses</h2>
          {responded.map(m => (
            <MatchCard
              key={m.id} match={m} creditBalance={balance}
              onAccept={id => respondToMatch(id, 'accepted')}
              onDecline={id => respondToMatch(id, 'declined')}
            />
          ))}
        </section>
      )}

      {pending.length === 0 && responded.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold">No matches yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            We&apos;ll notify you when an employer posts a role matching your profile and location.
          </p>
          <Link href="/profile" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4')}>
            Complete your profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {showBuy && (
        <BuyCreditsSheet
          userId={userId}
          onCreditsPurchased={(added) => setBalance(b => b + added)}
          onClose={() => setShowBuy(false)}
        />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobHubPage() {
  const [profile, setProfile]   = useState<JobHubProfile | null>(null)
  const [matches, setMatches]   = useState<Match[]>([])
  const [balance, setBalance]   = useState(0)
  const [loading, setLoading]   = useState(true)
  const userId = getSession()?.id ?? ''

  useEffect(() => {
    if (!userId) { window.location.replace('/login'); return }
    async function load() {
      try {
        const [profileRes, matchRes, creditsRes] = await Promise.allSettled([
          api.get<{ success: boolean; data: { profile: JobHubProfile } }>('/jobhub/profile'),
          api.get<{ success: boolean; data: { matches: Match[] } }>('/jobhub/matches'),
          api.get<{ success: boolean; data: { balance: number } }>('/jobhub/credits'),
        ])

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.profile)
        if (matchRes.status === 'fulfilled')   setMatches(matchRes.value.data.matches)
        if (creditsRes.status === 'fulfilled') setBalance(creditsRes.value.data.balance)
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Job Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Employers find you. Accept matches using your credits.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Coins className="h-3.5 w-3.5" />
          {loading ? '…' : balance} credits
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : profile ? (
        <JobHubView profile={profile} initialMatches={matches} initialBalance={balance} userId={userId} />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold">Set up your Job Hub profile</p>
          <p className="mt-1 text-xs text-muted-foreground">Complete your profile to start receiving job matches.</p>
          <Link href="/profile" className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>
            Complete profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
