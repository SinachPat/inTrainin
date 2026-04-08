'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Briefcase, MapPin, CheckCircle2, XCircle, Clock,
  Lock, Zap, ArrowRight, Building2, Star, ChevronRight,
  Bell, Check,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobHubProfile {
  id: string
  is_subscribed: boolean
  subscription_expires_at: string | null
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

const PLANS = [
  { label: 'Monthly', price: '₦1,000', sub: '/month', billing: 'Billed monthly' },
  { label: 'Annual',  price: '₦8,000', sub: '/year',  billing: 'Save ₦4,000 vs monthly', highlight: true },
]

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

// ── Match card ────────────────────────────────────────────────────────────────

function MatchCard({ match, onAccept, onDecline }: {
  match: Match
  onAccept: (id: string) => void
  onDecline: (id: string) => void
}) {
  const req      = match.hire_requests
  const pending  = match.status === 'pending'
  const accepted = match.status === 'accepted'

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
              <span className="flex items-center gap-1 text-[11px] text-amber-600">
                <CheckCircle2 className="h-3 w-3" /> Cert required
              </span>
            )}
          </div>
        )}

        {req?.requirements && (
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{req.requirements}</p>
        )}

        {pending && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => onAccept(match.id)}>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept match
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => onDecline(match.id)}>
              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Subscribed view ───────────────────────────────────────────────────────────

function SubscribedView({
  profile, initialMatches,
}: {
  profile: JobHubProfile
  initialMatches: Match[]
}) {
  const [matches, setMatches]         = useState(initialMatches)
  const [availability, setAvail]      = useState(profile.availability ?? 'immediate')
  const [employmentType, setEmpType]  = useState(profile.employment_type_pref ?? 'full_time')
  const [savingPrefs, setSavingPrefs] = useState(false)

  const pending   = matches.filter(m => m.status === 'pending')
  const responded = matches.filter(m => m.status !== 'pending')

  async function respondToMatch(id: string, status: 'accepted' | 'declined') {
    setMatches(ms => ms.map(m => m.id === id ? { ...m, status } : m))
    api.patch(`/jobhub/matches/${id}`, { status }).catch(() => {
      // Revert on failure
      setMatches(ms => ms.map(m => m.id === id ? { ...m, status: 'pending' } : m))
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

  const expiryDate = profile.subscription_expires_at
    ? new Date(profile.subscription_expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Job Hub Active</p>
          <p className="text-xs text-muted-foreground">
            Receiving matches{expiryDate ? ` · Expires ${expiryDate}` : ''}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 border-green-500/30 bg-green-500/10 text-[10px] text-green-700">Active</Badge>
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
          <Button size="sm" variant="outline" onClick={savePreferences} disabled={savingPrefs}>
            {savingPrefs ? 'Saving…' : 'Save preferences'}
          </Button>
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
              key={m.id} match={m}
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
              key={m.id} match={m}
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
            We'll notify you when an employer posts a role matching your profile.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Unsubscribed view ─────────────────────────────────────────────────────────

function UnsubscribedView() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual')

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 text-center shadow-card">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Briefcase className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-heading text-lg font-bold text-foreground">Get matched to jobs passively</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Subscribe once. Employers search for you. Get notified when a certified, location-matched role is posted.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-foreground">How it works</p>
        {[
          { icon: CheckCircle2, label: 'Subscribe to activate your job profile' },
          { icon: Bell,         label: 'Employers post hiring requests for your role + location' },
          { icon: Star,         label: "You're ranked by certification, test scores & location" },
          { icon: ArrowRight,   label: 'Accept a match → employer sees your profile' },
        ].map(({ icon: Icon, label }, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
              {i + 1}
            </div>
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-foreground">Choose a plan</p>
        <div className="grid grid-cols-2 gap-3">
          {PLANS.map(plan => {
            const key = plan.label.toLowerCase() as 'monthly' | 'annual'
            return (
              <button
                key={plan.label}
                onClick={() => setSelectedPlan(key)}
                className={cn(
                  'relative flex flex-col items-center rounded-xl border p-4 text-center transition-all',
                  selectedPlan === key ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border bg-card hover:border-foreground/20',
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                    Best value
                  </span>
                )}
                <p className="text-xs font-medium text-muted-foreground">{plan.label}</p>
                <p className="mt-1 font-heading text-xl font-bold text-foreground">
                  {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.sub}</span>
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{plan.billing}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Payments via Paystack — coming in Layer 8 */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Payments coming soon</p>
        </div>
        <p className="text-xs text-muted-foreground">Paystack checkout is being set up. Check back shortly.</p>
      </div>

      <Link
        href="/profile"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
      >
        <span>Update your profile to improve match quality</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobHubPage() {
  const [profile, setProfile]   = useState<JobHubProfile | null>(null)
  const [matches, setMatches]   = useState<Match[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await api.get<{ success: boolean; data: { profile: JobHubProfile } }>('/jobhub/profile')
        setProfile(profileRes.data.profile)

        if (profileRes.data.profile.is_subscribed) {
          const matchRes = await api.get<{ success: boolean; data: { matches: Match[] } }>('/jobhub/matches')
            .catch(() => null)
          if (matchRes) setMatches(matchRes.data.matches)
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Job Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile?.is_subscribed
            ? 'Employers are searching for your profile. Respond to matches quickly.'
            : 'Get matched to jobs passively — no searching required.'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : profile?.is_subscribed ? (
        <SubscribedView profile={profile} initialMatches={matches} />
      ) : (
        <UnsubscribedView />
      )}
    </div>
  )
}
