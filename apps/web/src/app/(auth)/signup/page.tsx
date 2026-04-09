'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Phone, Shield, ChevronLeft, User, MapPin, Briefcase, Check, GraduationCap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { setSession } from '@/lib/auth'
import { LogoMark } from '@/components/logo'

type Step = 'type' | 'phone' | 'otp' | 'profile'
type AccountType = 'learner' | 'business'

// Slugs match lib/roles.ts ROLES array exactly
const CAREER_GOAL_ROLES = [
  { slug: 'cashier-retail',      label: 'Cashier',              icon: '🛒' },
  { slug: 'waiter-waitress',     label: 'Waiter / Waitress',    icon: '🍽️' },
  { slug: 'front-desk-agent',    label: 'Hotel Receptionist',   icon: '🏨' },
  { slug: 'dispatch-rider',      label: 'Delivery Rider',       icon: '🚚' },
  { slug: 'sales-rep',           label: 'Sales Representative', icon: '🤝' },
  { slug: 'receptionist',        label: 'Receptionist',         icon: '📋' },
  { slug: 'security-guard',      label: 'Security Guard',       icon: '🛡️' },
  { slug: 'barber',              label: 'Barber / Hair Stylist', icon: '💈' },
  { slug: 'cook-kitchen-hand',   label: 'Kitchen Assistant',    icon: '🍳' },
]

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+234' + digits.slice(1)
  if (digits.startsWith('234')) return '+' + digits
  return digits
}

function SignupContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ?type=business pre-selects business and skips the type selector
  const typeParam = searchParams.get('type') as AccountType | null

  const [step, setStep]             = useState<Step>(typeParam === 'business' ? 'phone' : 'type')
  const [accountType, setAccountType] = useState<AccountType>(typeParam === 'business' ? 'business' : 'learner')
  const [phone, setPhone]           = useState('')
  const [otp, setOtp]               = useState(['', '', '', '', '', ''])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [countdown, setCountdown]   = useState(0)
  const [profile, setProfile]       = useState({ fullName: '', city: '', careerGoalSlug: '' })
  const [otherRole, setOtherRole]   = useState('')
  const [bizName, setBizName]       = useState('')
  const [pendingTokens, setPendingTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)

  // If ?type changed after mount (e.g. back navigation), sync state
  useEffect(() => {
    if (typeParam === 'business') {
      setAccountType('business')
      if (step === 'type') setStep('phone')
    }
  }, [typeParam]) // eslint-disable-line react-hooks/exhaustive-deps

  function startCountdown() {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0 } return c - 1 })
    }, 1000)
  }

  function formatPhoneDisplay(raw: string) {
    const digits = raw.replace(/\D/g, '')
    return '+234 ' + (digits.startsWith('0') ? digits.slice(1) : digits)
  }

  function handleTypeSelect(type: AccountType) {
    setAccountType(type)
    setStep('phone')
  }

  // ── Step: request OTP ──────────────────────────────────────────────────────

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid Nigerian phone number'); return }
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { phone: normalizePhone(phone) })
      setStep('otp')
      startCountdown()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step: verify OTP ───────────────────────────────────────────────────────

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]; next[index] = value; setOtp(next)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus()
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length < 6) { setError('Enter the complete 6-digit code'); return }
    setError('')
    setLoading(true)
    try {
      const verifyRes = await api.post<{
        success: boolean
        data: {
          accessToken: string
          refreshToken: string
          profileComplete: boolean
          accountType: string
        }
      }>('/auth/otp/verify', { phone: normalizePhone(phone), code: otpString })

      const { accessToken, refreshToken, profileComplete, accountType: returnedType } = verifyRes.data

      if (profileComplete) {
        // Returning user at the signup page — log them in and route home
        const meRes = await api.get<{
          data: { user: { id: string; full_name: string; account_type: string; phone: string } }
        }>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })

        const user = meRes.data.user
        setSession({
          accessToken, refreshToken,
          user: {
            id:          user.id,
            fullName:    user.full_name,
            accountType: user.account_type as 'learner' | 'business' | 'admin',
            phone:       user.phone,
          },
        })
        router.push(returnedType === 'business' || returnedType === 'admin' ? '/admin' : '/dashboard')
      } else {
        // New user — advance to profile step
        setPendingTokens({ accessToken, refreshToken })
        setStep('profile')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step: submit profile ──────────────────────────────────────────────────

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.fullName.trim()) { setError('Enter your full name'); return }
    if (!profile.city) { setError('Select your city'); return }
    if (accountType === 'business' && !bizName.trim()) { setError('Enter your business name'); return }
    if (!pendingTokens) { setError('Session expired. Please start over.'); setStep('phone'); return }
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        fullName:     profile.fullName.trim(),
        accountType,
        locationCity: profile.city,
        ...(accountType === 'business' && { businessName: bizName.trim() }),
        ...(accountType === 'learner' && profile.careerGoalSlug && profile.careerGoalSlug !== 'other'
          && { careerGoalRoleSlug: profile.careerGoalSlug }),
      }

      const profileRes = await api.post<{
        success: boolean
        data: { user: { id: string; full_name: string; account_type: string } }
      }>('/auth/profile/complete', body, {
        headers: { Authorization: `Bearer ${pendingTokens.accessToken}` },
      })

      const user = profileRes.data.user
      if (!user) throw new Error('Profile setup failed — please try again.')

      const meRes = await api.get<{ data: { user: { phone: string | null } } }>(
        '/auth/me', { headers: { Authorization: `Bearer ${pendingTokens.accessToken}` } },
      ).catch(() => null)

      setSession({
        accessToken:  pendingTokens.accessToken,
        refreshToken: pendingTokens.refreshToken,
        user: {
          id:          user.id,
          fullName:    user.full_name,
          accountType: user.account_type as 'learner' | 'business' | 'admin',
          phone:       (meRes?.data.user.phone ?? normalizePhone(phone)) || null,
        },
      })

      router.push(accountType === 'business' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profile setup failed. Try again.')
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const stepIndex  = { type: 0, phone: 1, otp: 2, profile: 3 }[step]
  const totalSteps = 3

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LogoMark size={26} />
        </div>
        {step === 'type' ? (
          <>
            <h1 className="font-heading text-2xl font-bold text-foreground">Get started</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start learning free — no credit card needed</p>
          </>
        ) : step === 'phone' ? (
          <>
            <h1 className="font-heading text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {accountType === 'learner' ? 'For job seekers & learners' : 'For business owners & managers'}
            </p>
          </>
        ) : step === 'otp' ? (
          <>
            <h1 className="font-heading text-2xl font-bold">Check your phone</h1>
            <p className="mt-1 text-sm text-muted-foreground">We sent a code to {formatPhoneDisplay(phone)}</p>
          </>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold">Almost done</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tell us a bit about yourself</p>
          </>
        )}
      </div>

      {/* Progress dots (steps 1–3, only after type selection) */}
      {step !== 'type' && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i < stepIndex ? 'w-6 bg-primary' : i === stepIndex - 1 ? 'w-6 bg-primary' : 'w-3 bg-muted',
              )}
            />
          ))}
        </div>
      )}

      {/* ── Account type selector ────────────────────────────────────────── */}
      {step === 'type' && (
        <div className="space-y-3">
          <button
            onClick={() => handleTypeSelect('learner')}
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
            onClick={() => handleTypeSelect('business')}
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
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-center text-xs text-muted-foreground">Already have an account?</p>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <GraduationCap className="h-3.5 w-3.5" /> Learner sign in
              </Link>
              <Link
                href="/login?type=business"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                <Building2 className="h-3.5 w-3.5" /> Business sign in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Phone step ──────────────────────────────────────────────────── */}
      {step === 'phone' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          {/* Only show back button if type wasn't pre-selected via URL param */}
          {!typeParam && (
            <button
              type="button"
              onClick={() => setStep('type')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="phone" type="tel" inputMode="numeric" placeholder="0801 234 5678"
                value={phone} onChange={e => setPhone(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors',
                  'placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20',
                  error ? 'border-destructive' : 'border-border',
                )}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-[11px] text-muted-foreground">Nigerian numbers only. We&apos;ll send an OTP to verify.</p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending code…' : <span className="flex items-center gap-1.5">Continue <ArrowRight className="h-4 w-4" /></span>}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              href={accountType === 'business' ? '/login?type=business' : '/login'}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* ── OTP step ────────────────────────────────────────────────────── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <button
            type="button"
            onClick={() => { setStep('phone'); setError(''); setOtp(['', '', '', '', '', '']) }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Change number
          </button>
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className={cn(
                  'h-12 w-10 rounded-lg border bg-background text-center text-xl font-bold outline-none transition-all',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  digit ? 'border-primary bg-primary/5' : 'border-border',
                  error ? 'border-destructive' : '',
                )}
              />
            ))}
          </div>
          {error && <p className="text-center text-xs text-destructive">{error}</p>}
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">Code expires in 10 minutes. Never share it.</p>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify number'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t get it?{' '}
            <button
              type="button"
              disabled={countdown > 0}
              onClick={async () => {
                setOtp(['', '', '', '', '', ''])
                startCountdown()
                try { await api.post('/auth/otp/send', { phone: normalizePhone(phone) }) } catch {}
              }}
              className={cn('font-medium', countdown > 0 ? 'cursor-not-allowed text-muted-foreground' : 'text-primary hover:underline')}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </p>
        </form>
      )}

      {/* ── Profile step ────────────────────────────────────────────────── */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" placeholder="Amara Okafor" value={profile.fullName}
                onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Business name (business only) */}
          {accountType === 'business' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Business name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" placeholder="Sunshine Supermart" value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                className="h-10 w-full appearance-none rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select your city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Career goal (learner only) */}
          {accountType === 'learner' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">What role are you aiming for?</label>
              <p className="text-xs text-muted-foreground">We&apos;ll tailor your learning path. You can change this later.</p>
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
                    {profile.careerGoalSlug === role.slug && <Check className="ml-auto h-3 w-3 shrink-0" />}
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
                  <span>✏️</span>
                  <span>Other</span>
                  {profile.careerGoalSlug === 'other' && <Check className="ml-auto h-3 w-3 shrink-0" />}
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
            {loading ? 'Creating account…' : (
              <span className="flex items-center gap-1.5">
                {accountType === 'learner' ? 'Get started' : 'Set up my dashboard'}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            By continuing you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  )
}
