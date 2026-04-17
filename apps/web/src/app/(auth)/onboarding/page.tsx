'use client'

/**
 * Onboarding — profile completion step, shared by all signup paths.
 *
 * All signup flows (email, Google, phone) redirect here after authentication
 * succeeds and profileComplete is false. Tokens and pre-known details are
 * passed via sessionStorage keys so nothing sensitive appears in the URL.
 *
 * sessionStorage keys consumed (all cleared on mount):
 *   pending_access_token   — JWT from the auth step
 *   pending_refresh_token  — refresh token from the auth step
 *   pending_account_type   — 'learner' | 'business' (optional — shows type picker if absent)
 *   pending_google_name    — name from Google profile (optional pre-fill)
 *   pending_google_email   — email from Google (optional, sent to /auth/profile/complete)
 *   pending_email          — email from email/password signup
 *   pending_convert        — 'true' if the user is converting a learner → business account
 */

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, ChevronLeft, User, MapPin, Briefcase,
  Check, GraduationCap, Building2, AlertTriangle, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'
import { setSession } from '@/lib/auth'
import { LogoMark } from '@/components/logo'
import { NG_CITIES } from '@intrainin/shared'

type Step = 'loading' | 'type' | 'profile' | 'convert'
type AccountType = 'learner' | 'business'

const CITIES = NG_CITIES

const CAREER_GOAL_ROLES = [
  { slug: 'cashier-retail',    label: 'Cashier',               icon: '🛒' },
  { slug: 'waiter-waitress',   label: 'Waiter / Waitress',     icon: '🍽️' },
  { slug: 'front-desk-agent',  label: 'Hotel Receptionist',    icon: '🏨' },
  { slug: 'dispatch-rider',    label: 'Delivery Rider',        icon: '🚚' },
  { slug: 'sales-rep',         label: 'Sales Representative',  icon: '🤝' },
  { slug: 'receptionist',      label: 'Receptionist',          icon: '📋' },
  { slug: 'security-guard',    label: 'Security Guard',        icon: '🛡️' },
  { slug: 'barber',            label: 'Barber / Hair Stylist',  icon: '💈' },
  { slug: 'cook-kitchen-hand', label: 'Kitchen Assistant',     icon: '🍳' },
]

function OnboardingContent() {
  const router = useRouter()

  const [step,         setStep]        = useState<Step>('loading')
  const [tokens,       setTokens]      = useState<{ accessToken: string; refreshToken: string } | null>(null)
  const [accountType,  setAccountType] = useState<AccountType>('learner')
  const [profile,      setProfile]     = useState({ fullName: '', city: '', careerGoalSlug: '' })
  const [otherRole,    setOtherRole]   = useState('')
  const [bizName,      setBizName]     = useState('')
  const [email,        setEmail]       = useState('')
  const [showTypeBack, setShowTypeBack] = useState(false) // true when type picker was shown
  const [loading,      setLoading]     = useState(false)
  const [error,        setError]       = useState('')

  useEffect(() => {
    const at          = sessionStorage.getItem('pending_access_token')
    const rt          = sessionStorage.getItem('pending_refresh_token')
    const accType     = sessionStorage.getItem('pending_account_type') as AccountType | null
    const googleName  = sessionStorage.getItem('pending_google_name')
    const googleEmail = sessionStorage.getItem('pending_google_email')
    const pendingEmail = sessionStorage.getItem('pending_email')
    const isConvert   = sessionStorage.getItem('pending_convert') === 'true'

    // Clear all keys up-front so a back-button revisit doesn't re-use stale data
    sessionStorage.removeItem('pending_access_token')
    sessionStorage.removeItem('pending_refresh_token')
    sessionStorage.removeItem('pending_account_type')
    sessionStorage.removeItem('pending_google_name')
    sessionStorage.removeItem('pending_google_email')
    sessionStorage.removeItem('pending_email')
    sessionStorage.removeItem('pending_convert')

    if (!at || !rt) {
      // No tokens — user navigated here directly without going through auth
      router.replace('/login')
      return
    }

    setTokens({ accessToken: at, refreshToken: rt })

    // Pre-fill name from Google if available
    if (googleName) setProfile(p => ({ ...p, fullName: googleName }))

    // Prefer the Google email over the signup email (both point to same user)
    setEmail(googleEmail ?? pendingEmail ?? '')

    if (isConvert) {
      // Account-type conversion flow: skip type picker, go straight to convert warning
      setAccountType('business')
      setStep('convert')
      return
    }

    if (accType) {
      setAccountType(accType)
      setStep('profile')
    } else {
      // No preset type — show the type picker (e.g. new Google user from login page)
      setShowTypeBack(true)
      setStep('type')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.fullName.trim())                        { setError('Enter your full name'); return }
    if (!profile.city)                                   { setError('Select your city'); return }
    if (accountType === 'business' && !bizName.trim())   { setError('Enter your business name'); return }
    if (!tokens)                                         { setError('Session expired — please start over.'); router.replace('/login'); return }
    setError('')
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        fullName:     profile.fullName.trim(),
        accountType,
        locationCity: profile.city,
        ...(email ? { email: email.trim().toLowerCase() } : {}),
        ...(accountType === 'business' && bizName.trim() && { businessName: bizName.trim() }),
        ...(accountType === 'learner'
          && profile.careerGoalSlug
          && profile.careerGoalSlug !== 'other'
          && { careerGoalRoleSlug: profile.careerGoalSlug }),
      }

      const profileRes = await api.post<{
        success: boolean
        data: { user: { id: string; full_name: string; account_type: string } }
      }>('/auth/profile/complete', body, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      })

      const user = profileRes.data.user
      if (!user) throw new Error('Profile setup failed — please try again.')

      // Fetch phone separately (not returned by profile/complete)
      const meRes = await api.get<{ data: { user: { phone: string | null } } }>(
        '/auth/me',
        { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      ).catch(() => null)

      setSession({
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id:          user.id,
          fullName:    user.full_name,
          accountType: user.account_type as 'learner' | 'business' | 'admin',
          phone:       meRes?.data?.user?.phone ?? null,
        },
      })

      router.push(accountType === 'business' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Profile setup failed. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Headings per step ─────────────────────────────────────────────────────
  const heading = {
    loading: { title: '',                    sub: '' },
    type:    { title: 'One more thing',      sub: 'How will you be using InTrainin?' },
    convert: { title: 'Already a learner?',  sub: 'Your account is linked to a learner profile' },
    profile: {
      title: accountType === 'business' ? 'Set up your business' : 'Almost done',
      sub:   'Tell us a bit about yourself',
    },
  }[step]

  // ── Loading splash ────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Brand header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LogoMark size={26} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{heading.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{heading.sub}</p>
      </div>

      {/* ── Account type picker ─────────────────────────────────────────── */}
      {step === 'type' && (
        <div className="space-y-3">
          <button
            onClick={() => { setAccountType('learner'); setStep('profile') }}
            className="w-full rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">I&apos;m a learner / job seeker</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Get trained, certified, and matched to jobs</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setAccountType('business'); setStep('profile') }}
            className="w-full rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">I&apos;m a business owner / manager</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Train your team and hire certified workers</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── Convert warning ─────────────────────────────────────────────── */}
      {step === 'convert' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  This will convert your learner account
                </p>
                <ul className="space-y-1 text-amber-800 dark:text-amber-300">
                  <li>• Your learner dashboard and training progress will no longer be accessible</li>
                  <li>• Certificates you&apos;ve earned will remain on record</li>
                  <li>• You&apos;ll get a new business dashboard to manage your team</li>
                </ul>
                <p className="text-amber-700 dark:text-amber-400">
                  This action cannot be undone. Use a different account for a separate learner profile.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setStep('profile')}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Yes, convert to business <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.replace('/dashboard')}
            className="flex w-full items-center justify-center rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Keep my learner account
          </button>
        </div>
      )}

      {/* ── Profile form ─────────────────────────────────────────────────── */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">

          {/* Back to type picker — only shown when the type picker was shown */}
          {showTypeBack && (
            <button type="button" onClick={() => setStep('type')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}

          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" placeholder="Amara Okafor" value={profile.fullName}
                onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Business name */}
          {accountType === 'business' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Business name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" placeholder="Sunshine Supermart" value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your city</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={profile.city}
                onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select your city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Career goal — learners only */}
          {accountType === 'learner' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                What role are you aiming for?
              </label>
              <p className="text-xs text-muted-foreground">
                We&apos;ll tailor your learning path. You can change this later.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CAREER_GOAL_ROLES.map(role => (
                  <button
                    key={role.slug} type="button"
                    onClick={() => setProfile(p => ({ ...p, careerGoalSlug: role.slug }))}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all',
                      profile.careerGoalSlug === role.slug
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:border-foreground/30',
                    )}
                  >
                    <span>{role.icon}</span>
                    <span>{role.label}</span>
                    {profile.careerGoalSlug === role.slug && (
                      <Check className="ml-auto h-3 w-3 shrink-0" />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setProfile(p => ({ ...p, careerGoalSlug: 'other' }))}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all',
                    profile.careerGoalSlug === 'other'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:border-foreground/30',
                  )}
                >
                  <span>✏️</span><span>Other</span>
                  {profile.careerGoalSlug === 'other' && (
                    <Check className="ml-auto h-3 w-3 shrink-0" />
                  )}
                </button>
              </div>
              {profile.careerGoalSlug === 'other' && (
                <input
                  autoFocus type="text"
                  placeholder="e.g. Security Guard, Nurse Assistant…"
                  value={otherRole} onChange={e => setOtherRole(e.target.value)}
                  className="h-10 w-full rounded-lg border border-primary bg-primary/5 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Setting up your account…' : (
              <span className="flex items-center gap-1.5">
                {accountType === 'business' ? 'Set up my dashboard' : 'Get started'}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            By continuing you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
          </p>
        </form>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
