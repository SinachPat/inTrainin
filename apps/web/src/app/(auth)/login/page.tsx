'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, Shield, ChevronLeft,
  User, MapPin, Briefcase, GraduationCap, Building2,
  Mail, Phone, Eye, EyeOff, Loader2, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { setSession } from '@/lib/auth'
import { signInWithGoogle } from '@/lib/supabase'
import { LogoMark } from '@/components/logo'

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMethod = 'phone' | 'email'
// phone flow:   phone → otp → (new) type → profile
// email flow:   email → (new) type → profile
// google flow:  → (auto) type → profile  (tokens from sessionStorage)
type Step = 'method' | 'phone' | 'otp' | 'email' | 'type' | 'profile'
type AccountType = 'learner' | 'business'

const CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City',
  'Kaduna', 'Enugu', 'Aba', 'Jos', 'Ilorin', 'Onitsha', 'Warri',
  'Owerri', 'Calabar', 'Uyo', 'Asaba', 'Abeokuta', 'Akure', 'Maiduguri',
]

const CAREER_GOAL_ROLES = [
  { slug: 'cashier-retail',    label: 'Cashier',              icon: '🛒' },
  { slug: 'waiter-waitress',   label: 'Waiter / Waitress',    icon: '🍽️' },
  { slug: 'front-desk-agent',  label: 'Hotel Receptionist',   icon: '🏨' },
  { slug: 'dispatch-rider',    label: 'Delivery Rider',       icon: '🚚' },
  { slug: 'sales-rep',         label: 'Sales Representative', icon: '🤝' },
  { slug: 'receptionist',      label: 'Receptionist',         icon: '📋' },
  { slug: 'security-guard',    label: 'Security Guard',       icon: '🛡️' },
  { slug: 'barber',            label: 'Barber / Hair Stylist', icon: '💈' },
  { slug: 'cook-kitchen-hand', label: 'Kitchen Assistant',    icon: '🍳' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0'))   return '+234' + digits.slice(1)
  if (digits.startsWith('234')) return '+' + digits
  return '+234' + digits
}

function formatPhoneDisplay(raw: string) {
  const digits = raw.replace(/\D/g, '')
  return '+234 ' + (digits.startsWith('0') ? digits.slice(1) : digits)
}

// ─── Google sign-in button ─────────────────────────────────────────────────────

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-card',
        'h-10 px-4 text-sm font-medium text-foreground transition-colors',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
        /* Google "G" logo */
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )}
      Continue with Google
    </button>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('next')
  const methodParam  = searchParams.get('method')    // 'google_profile' = coming back from OAuth
  const typeHint     = searchParams.get('type') === 'business' ? 'business' : 'learner'

  // Determine initial step
  const initialStep: Step = methodParam === 'google_profile' ? 'type' : 'method'

  const [step,        setStep]        = useState<Step>(initialStep)
  const [authMethod,  setAuthMethod]  = useState<AuthMethod>('phone')

  // Phone state
  const [phone,      setPhone]      = useState('')
  const [otp,        setOtp]        = useState(['', '', '', '', '', ''])
  const [countdown,  setCountdown]  = useState(0)

  // Email state
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [isNewUser,   setIsNewUser]   = useState(false)

  // Shared
  const [accountType, setAccType]     = useState<AccountType>('learner')
  const [profile,     setProfile]     = useState({ fullName: '', city: '', careerGoalSlug: '' })
  const [otherRole,   setOtherRole]   = useState('')
  const [bizName,     setBizName]     = useState('')
  const [tokens,      setTokens]      = useState<{ accessToken: string; refreshToken: string } | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Pick up tokens and account type stashed by the callback/signup pages for Google sign-in
  useEffect(() => {
    if (methodParam === 'google_profile') {
      const at       = sessionStorage.getItem('pending_access_token')
      const rt       = sessionStorage.getItem('pending_refresh_token')
      const accType  = sessionStorage.getItem('pending_account_type') as AccountType | null
      if (at && rt) {
        setTokens({ accessToken: at, refreshToken: rt })
        sessionStorage.removeItem('pending_access_token')
        sessionStorage.removeItem('pending_refresh_token')
      }
      if (accType) {
        setAccType(accType)
        sessionStorage.removeItem('pending_account_type')
      }
      // If account type was pre-selected (from signup page or URL hint), skip straight to profile.
      // This applies to both learner AND business — no reason to show the type-picker again.
      const resolvedType = accType ?? (typeHint === 'business' ? 'business' : null)
      if (resolvedType) {
        setAccType(resolvedType)
        setStep('profile')
      } else {
        setStep('type')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startCountdown() {
    setCountdown(60)
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
  }

  // ─── After auth: route or continue onboarding ──────────────────────────────
  async function handlePostAuth(accessToken: string, refreshToken: string, profileComplete: boolean, returnedAccountType: string) {
    if (profileComplete) {
      const meRes = await api.get<{
        data: { user: { id: string; full_name: string; account_type: string; phone: string | null } }
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
      setTokens({ accessToken, refreshToken })
      if (typeHint === 'business' || returnedAccountType === 'business') {
        setAccType('business')
        setStep('profile')
      } else {
        setStep('type')
      }
    }
  }

  // ─── Phone: request OTP ────────────────────────────────────────────────────
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

  // ─── Phone: verify OTP ─────────────────────────────────────────────────────
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
      const res = await api.post<{
        success: boolean
        data: { accessToken: string; refreshToken: string; profileComplete: boolean; accountType: string }
      }>('/auth/otp/verify', { phone: normalizePhone(phone), code })
      await handlePostAuth(res.data.accessToken, res.data.refreshToken, res.data.profileComplete, res.data.accountType)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Email: login or register ──────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim())    { setError('Enter your email address'); return }
    if (!password.trim()) { setError('Enter your password'); return }
    if (isNewUser && password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const endpoint = isNewUser ? '/auth/email/register' : '/auth/email/login'
      const res = await api.post<{
        success: boolean
        data: { accessToken: string; refreshToken: string; profileComplete: boolean; accountType: string }
      }>(endpoint, { email: email.trim().toLowerCase(), password })

      await handlePostAuth(res.data.accessToken, res.data.refreshToken, res.data.profileComplete, res.data.accountType)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Try again.'
      // Suggest switching to register if the credentials were wrong and we're in login mode
      if (!isNewUser && (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('not found'))) {
        setError(`${msg} Don't have an account?`)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Google ────────────────────────────────────────────────────────────────
  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      // Stash account type only when it was explicitly set via ?type=business.
      // A plain /login visitor hasn't picked a type yet, so don't assume 'learner'
      // — the type picker will show instead. The signup page always stashes because
      // the user has already chosen a type before reaching the Google button.
      if (typeHint === 'business') {
        sessionStorage.setItem('pending_account_type', 'business')
      }
      await signInWithGoogle()
      // signInWithGoogle triggers a full page redirect — execution stops here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Try again.')
      setGoogleLoading(false)
    }
  }

  // ─── Profile submit (shared by all methods) ────────────────────────────────
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.fullName.trim())                          { setError('Enter your full name'); return }
    if (!profile.city)                                     { setError('Select your city'); return }
    if (accountType === 'business' && !bizName.trim())     { setError('Enter your business name'); return }
    if (!tokens)                                           { setError('Session expired — please start over.'); setStep('method'); return }
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        fullName:     profile.fullName.trim(),
        accountType,
        locationCity: profile.city,
        ...(accountType === 'business' && { businessName: bizName.trim() }),
        ...(authMethod === 'email' && email ? { email: email.trim().toLowerCase() } : {}),
        ...(accountType === 'learner' && profile.careerGoalSlug && profile.careerGoalSlug !== 'other'
          && { careerGoalRoleSlug: profile.careerGoalSlug }),
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
          phone:       meRes?.data.user.phone ?? null,
        },
      })
      router.push(accountType === 'business' ? '/admin' : '/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Profile setup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const title: Record<Step, string> = {
    method:  typeHint === 'business' ? 'Business sign in'   : 'Welcome back',
    phone:   'Enter your number',
    otp:     'Check your phone',
    email:   isNewUser ? 'Create account'  : 'Sign in with email',
    type:    'One more thing',
    profile: 'Almost done',
  }
  const subtitle: Record<Step, string> = {
    method:  typeHint === 'business' ? 'Sign in to your business dashboard' : 'Sign in or create a new account',
    phone:   'We\'ll send a one-time code via SMS',
    otp:     `Code sent to ${formatPhoneDisplay(phone)}`,
    email:   isNewUser ? 'You\'ll be set up in seconds' : 'Use your email and password',
    type:    'How will you be using InTrainin?',
    profile: 'Tell us a bit about yourself',
  }

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LogoMark size={26} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{title[step]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle[step]}</p>
      </div>

      {/* ── Method selector ─────────────────────────────────────────────────── */}
      {step === 'method' && (
        <div className="space-y-4">
          {/* Phone */}
          <button
            onClick={() => { setAuthMethod('phone'); setStep('phone'); setError('') }}
            className="w-full flex items-center gap-3 rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-sm text-foreground">Continue with phone</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Get a one-time code via SMS</p>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={() => { setAuthMethod('email'); setStep('email'); setError('') }}
            className="w-full flex items-center gap-3 rounded-xl border-2 border-border bg-background p-4 text-left transition-all hover:border-primary hover:bg-primary/5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-sm text-foreground">Continue with email</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Use email and password</p>
            </div>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Google */}
          <GoogleButton loading={googleLoading} onClick={handleGoogle} />

          {error && <p className="text-center text-xs text-destructive">{error}</p>}

          {/* Sign-up CTA — visible to both learner and business visitors */}
          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href={typeHint === 'business' ? '/signup?type=business' : '/signup'}
              className="font-medium text-primary hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      )}

      {/* ── Phone step ─────────────────────────────────────────────────────── */}
      {step === 'phone' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <button type="button" onClick={() => { setStep('method'); setError('') }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="space-y-1.5">
            <label htmlFor="login-phone" className="text-sm font-medium text-foreground">Phone number</label>
            <div className={cn(
              'flex h-10 w-full items-center rounded-lg border bg-card text-sm transition-colors',
              error ? 'border-destructive' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            )}>
              <span className="shrink-0 border-r border-border px-3 text-sm text-muted-foreground">+234</span>
              <input
                id="login-phone" type="tel" inputMode="numeric" placeholder="801 234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                className="h-full flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending code…' : <span className="flex items-center gap-1.5">Get OTP code <ArrowRight className="h-4 w-4" /></span>}
          </Button>
        </form>
      )}

      {/* ── OTP step ───────────────────────────────────────────────────────── */}
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
                  'h-12 w-10 rounded-lg border bg-card text-center text-xl font-bold outline-none transition-all',
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

      {/* ── Email step ─────────────────────────────────────────────────────── */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <button type="button" onClick={() => { setStep('method'); setError('') }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email address</label>
            <div className={cn(
              'flex h-10 items-center rounded-lg border bg-card text-sm transition-colors',
              error ? 'border-destructive' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            )}>
              <Mail className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-full flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Password</label>
            <div className={cn(
              'flex h-10 items-center rounded-lg border bg-card text-sm transition-colors',
              error ? 'border-destructive' : 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            )}>
              <input
                type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-full flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground/50"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="mr-3 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {isNewUser && (
              <p className="text-[11px] text-muted-foreground">Minimum 8 characters</p>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Please wait…' : (
              <span className="flex items-center gap-1.5">
                {isNewUser ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          {/* Toggle between login and register */}
          <p className="text-center text-xs text-muted-foreground">
            {isNewUser ? 'Already have an account? ' : 'New to InTrainin? '}
            <button type="button" onClick={() => { setIsNewUser(p => !p); setError('') }}
              className="font-medium text-primary hover:underline">
              {isNewUser ? 'Sign in instead' : 'Create an account'}
            </button>
          </p>

          {/* Google as alternate */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>
          <GoogleButton loading={googleLoading} onClick={handleGoogle} />
        </form>
      )}

      {/* ── Account type (new users) ─────────────────────────────────────── */}
      {step === 'type' && (
        <div className="space-y-3">
          <button
            onClick={() => { setAccType('learner'); setStep('profile') }}
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
            onClick={() => { setAccType('business'); setStep('profile') }}
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
          <p className="text-center text-xs text-muted-foreground">
            Wrong details?{' '}
            <button onClick={() => { setStep('method'); setError('') }} className="font-medium text-primary hover:underline">Start over</button>
          </p>
        </div>
      )}

      {/* ── Profile (new users) ──────────────────────────────────────────── */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {methodParam !== 'google_profile' && typeHint !== 'business' && (
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
              <input type="text" placeholder="Amara Okafor" value={profile.fullName}
                onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          {/* Business name (business accounts only) */}
          {accountType === 'business' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Business name</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Sunshine Supermart" value={bizName}
                  onChange={e => setBizName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          )}

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your city</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">Select your city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Career goal (learners only) */}
          {accountType === 'learner' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">What role are you aiming for?</label>
              <p className="text-xs text-muted-foreground">We&apos;ll tailor your learning path. You can change this later.</p>
              <div className="grid grid-cols-2 gap-2">
                {CAREER_GOAL_ROLES.map(role => (
                  <button key={role.slug} type="button"
                    onClick={() => setProfile(p => ({ ...p, careerGoalSlug: role.slug }))}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all',
                      profile.careerGoalSlug === role.slug
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:border-foreground/30',
                    )}>
                    <span>{role.icon}</span>
                    <span>{role.label}</span>
                    {profile.careerGoalSlug === role.slug && <Check className="ml-auto h-3 w-3 shrink-0" />}
                  </button>
                ))}
                <button type="button"
                  onClick={() => setProfile(p => ({ ...p, careerGoalSlug: 'other' }))}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all',
                    profile.careerGoalSlug === 'other'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:border-foreground/30',
                  )}>
                  <span>✏️</span><span>Other</span>
                  {profile.careerGoalSlug === 'other' && <Check className="ml-auto h-3 w-3 shrink-0" />}
                </button>
              </div>
              {profile.careerGoalSlug === 'other' && (
                <input autoFocus type="text" placeholder="e.g. Security Guard, Nurse Assistant…"
                  value={otherRole} onChange={e => setOtherRole(e.target.value)}
                  className="h-10 w-full rounded-lg border border-primary bg-primary/5 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              )}
            </div>
          )}

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
            Wrong details?{' '}
            <button type="button" onClick={() => { setStep('method'); setError('') }} className="font-medium text-primary hover:underline">Start over</button>
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
