'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, Phone, Shield, ChevronLeft,
  User, MapPin, Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { setSession } from '@/lib/auth'
import { LogoMark } from '@/components/logo'

// Steps:
//   phone  → otp  → (existing user) done
//                 → (new user)      type → profile → done

type Step = 'phone' | 'otp' | 'type' | 'profile'
type AccountType = 'learner' | 'business'

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+234' + digits.slice(1)
  if (digits.startsWith('234')) return '+' + digits
  return digits
}

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('next')

  // ?type=business shows a business-specific heading — purely cosmetic, routing
  // is always determined by account_type from the DB after OTP verify.
  const typeHint = searchParams.get('type') === 'business' ? 'business' : 'learner'

  const [step, setStep]         = useState<Step>('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [accountType, setType]  = useState<AccountType>('learner')
  const [profile, setProfile]   = useState({ fullName: '', city: '' })
  const [bizName, setBizName]   = useState('')
  const [tokens, setTokens]     = useState<{ accessToken: string; refreshToken: string } | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [countdown, setCountdown] = useState(0)

  function startCountdown() {
    setCountdown(60)
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
  }

  function formatPhoneDisplay(raw: string) {
    const digits = raw.replace(/\D/g, '')
    return '+234 ' + (digits.startsWith('0') ? digits.slice(1) : digits)
  }

  // ── Step 1: request OTP ──────────────────────────────────────────────────────

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (phone.replace(/\D/g, '').length < 10) { setError('Enter a valid Nigerian phone number'); return }
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

  // ── Step 2: verify OTP ───────────────────────────────────────────────────────

  function handleOtpChange(i: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]; next[i] = value; setOtp(next)
    if (value && i < 5) document.getElementById(`login-otp-${i + 1}`)?.focus()
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`login-otp-${i - 1}`)?.focus()
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the complete 6-digit code'); return }
    setError('')
    setLoading(true)
    try {
      const verifyRes = await api.post<{
        success: boolean
        data: { accessToken: string; refreshToken: string; profileComplete: boolean; accountType: string }
      }>('/auth/otp/verify', { phone: normalizePhone(phone), code })

      const { accessToken, refreshToken, profileComplete, accountType: verifiedType } = verifyRes.data

      if (profileComplete) {
        // Existing user — fetch full profile and route
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
        const dest = redirectTo ?? (
          user.account_type === 'business' || user.account_type === 'admin' ? '/admin' : '/dashboard'
        )
        router.push(dest)
      } else {
        // New user — collect account type + profile before finalising
        setTokens({ accessToken, refreshToken })
        setStep('type')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Check the code and try again.')
      setLoading(false)
    }
  }

  // ── Step 4: submit profile ───────────────────────────────────────────────────

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.fullName.trim()) { setError('Enter your full name'); return }
    if (!profile.city)            { setError('Select your city'); return }
    if (accountType === 'business' && !bizName.trim()) { setError('Enter your business name'); return }
    if (!tokens) { setError('Session expired — please start over.'); setStep('phone'); return }
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        fullName:     profile.fullName.trim(),
        accountType,
        locationCity: profile.city,
        ...(accountType === 'business' && { businessName: bizName.trim() }),
      }
      const profileRes = await api.post<{
        success: boolean
        data: { user: { id: string; full_name: string; account_type: string } }
      }>('/auth/profile/complete', body, { headers: { Authorization: `Bearer ${tokens.accessToken}` } })

      const user = profileRes.data.user
      if (!user) throw new Error('Profile setup failed.')

      const meRes = await api.get<{ data: { user: { phone: string | null } } }>(
        '/auth/me', { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
      ).catch(() => null)

      setSession({
        accessToken:  tokens.accessToken,
        refreshToken: tokens.refreshToken,
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

  // ── Render ───────────────────────────────────────────────────────────────────

  const headings: Record<Step, { title: string; sub: string }> = {
    phone:   {
      title: 'Welcome back',
      sub: typeHint === 'business'
        ? 'Sign in to your business dashboard'
        : 'Sign in with your phone number',
    },
    otp:     { title: 'Check your phone',  sub: `We sent a code to ${formatPhoneDisplay(phone)}` },
    type:    { title: 'One more thing',    sub: 'How will you be using InTrainin?' },
    profile: { title: 'Almost done',       sub: 'Tell us a bit about yourself' },
  }

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LogoMark size={26} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{headings[step].title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{headings[step].sub}</p>
      </div>

      {/* ── Phone ─────────────────────────────────────────────────────────────── */}
      {step === 'phone' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-phone" className="text-sm font-medium text-foreground">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="login-phone" type="tel" inputMode="numeric" placeholder="0801 234 5678"
                value={phone} onChange={e => setPhone(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors',
                  'placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20',
                  error ? 'border-destructive' : 'border-border',
                )}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending code…' : <span className="flex items-center gap-1.5">Get OTP code <ArrowRight className="h-4 w-4" /></span>}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">Sign up free</Link>
          </p>
        </form>
      )}

      {/* ── OTP ───────────────────────────────────────────────────────────────── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <button type="button" onClick={() => { setStep('phone'); setError(''); setOtp(['','','','','','']) }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" /> Change number
          </button>
          <div className="flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i} id={`login-otp-${i}`} type="text" inputMode="numeric" maxLength={1}
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
            {loading ? 'Verifying…' : 'Verify and sign in'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t get it?{' '}
            <button type="button"
              disabled={countdown > 0}
              onClick={async () => { setOtp(['','','','','','']); startCountdown(); try { await api.post('/auth/otp/send', { phone: normalizePhone(phone) }) } catch {} }}
              className={cn('font-medium', countdown > 0 ? 'cursor-not-allowed text-muted-foreground' : 'text-primary hover:underline')}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </p>
        </form>
      )}

      {/* ── Account type (new users only) ─────────────────────────────────────── */}
      {step === 'type' && (
        <div className="space-y-3">
          <button
            onClick={() => { setType('learner'); setStep('profile') }}
            className="w-full rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="font-semibold text-foreground">I&apos;m a learner / job seeker</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Get trained, certified, and matched to jobs</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setType('business'); setStep('profile') }}
            className="w-full rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏢</span>
              <div>
                <p className="font-semibold text-foreground">I&apos;m a business owner / manager</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Train your team and hire certified workers</p>
              </div>
            </div>
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in instead</Link>
          </p>
        </div>
      )}

      {/* ── Profile (new users only) ──────────────────────────────────────────── */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <button type="button" onClick={() => setStep('type')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Amara Okafor" value={profile.fullName}
                onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          {/* Business name */}
          {accountType === 'business' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Business name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Sunshine Supermart" value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          )}
          {/* City */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your city</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">Select your city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating account…' : (
              <span className="flex items-center gap-1.5">
                {accountType === 'business' ? 'Set up my dashboard' : 'Get started'}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in instead</Link>
          </p>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
