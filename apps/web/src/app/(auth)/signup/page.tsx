'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Phone, Shield, ChevronLeft, User, MapPin, Briefcase, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Step = 'type' | 'phone' | 'otp' | 'profile'
type AccountType = 'learner' | 'business'

const CAREER_GOAL_ROLES = [
  { slug: 'cashier', label: 'Cashier', icon: '🛒' },
  { slug: 'waiter-waitress', label: 'Waiter / Waitress', icon: '🍽️' },
  { slug: 'hotel-receptionist', label: 'Hotel Receptionist', icon: '🏨' },
  { slug: 'delivery-rider', label: 'Delivery Rider', icon: '🛵' },
  { slug: 'sales-representative', label: 'Sales Representative', icon: '💼' },
  { slug: 'office-assistant', label: 'Office Assistant', icon: '🗂️' },
  { slug: 'cleaner', label: 'Cleaner / Janitor', icon: '🧹' },
  { slug: 'hair-stylist', label: 'Hair Stylist / Barber', icon: '✂️' },
  { slug: 'kitchen-assistant', label: 'Kitchen Assistant', icon: '🍳' },
]

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

export default function SignupPage() {
  const [step, setStep] = useState<Step>('type')
  const [accountType, setAccountType] = useState<AccountType>('learner')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [profile, setProfile] = useState({ fullName: '', city: '', careerGoalSlug: '' })
  const [otherRole, setOtherRole] = useState('')
  const [bizName, setBizName] = useState('')

  function startCountdown() {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timer); return 0 } return c - 1 })
    }, 1000)
  }

  function formatPhoneDisplay(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return '+234 ' + digits.slice(1)
    return '+234 ' + digits
  }

  function handleTypeSelect(type: AccountType) {
    setAccountType(type)
    setStep('phone')
  }

  function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) { setError('Enter a valid Nigerian phone number'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('otp'); startCountdown() }, 1200)
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus()
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.join('').length < 6) { setError('Enter the complete 6-digit code'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('profile') }, 900)
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.fullName.trim()) { setError('Enter your full name'); return }
    if (accountType === 'business' && !bizName.trim()) { setError('Enter your business name'); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      window.location.href = accountType === 'business' ? '/admin' : '/dashboard'
    }, 1000)
  }

  const stepIndex = { type: 0, phone: 1, otp: 2, profile: 3 }[step]
  const totalSteps = 3

  return (
    <div className="space-y-8">
      {/* Brand */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <span className="font-heading text-lg font-bold text-primary-foreground">IT</span>
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

      {/* Progress dots (steps 1-3) */}
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

      {/* ── Account type selector ─────────────────────────────────────────── */}
      {step === 'type' && (
        <div className="space-y-3">
          <button
            onClick={() => handleTypeSelect('learner')}
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
            onClick={() => handleTypeSelect('business')}
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
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      )}

      {/* ── Phone step ───────────────────────────────────────────────────── */}
      {step === 'phone' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <button
            type="button"
            onClick={() => setStep('type')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="0801 234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={cn(
                  'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition-colors',
                  'placeholder:text-muted-foreground/50',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
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
        </form>
      )}

      {/* ── OTP step ─────────────────────────────────────────────────────── */}
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
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
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
              onClick={() => { setOtp(['', '', '', '', '', '']); startCountdown() }}
              disabled={countdown > 0}
              className={cn('font-medium', countdown > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline')}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </p>
        </form>
      )}

      {/* ── Profile step ─────────────────────────────────────────────────── */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Amara Okafor"
                value={profile.fullName}
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
                  type="text"
                  placeholder="Sunshine Supermart"
                  value={bizName}
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
                    key={role.slug}
                    type="button"
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
                {/* Other option */}
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
                  {profile.careerGoalSlug === 'other' && (
                    <Check className="ml-auto h-3 w-3 shrink-0" />
                  )}
                </button>
              </div>

              {/* Expanded input when Other is selected */}
              {profile.careerGoalSlug === 'other' && (
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Security Guard, Nurse Assistant…"
                    value={otherRole}
                    onChange={e => setOtherRole(e.target.value)}
                    className="h-10 w-full rounded-lg border border-primary bg-primary/5 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating account…' : (
              <span className="flex items-center gap-1.5">
                {accountType === 'learner' ? 'Start learning free' : 'Set up my dashboard'}
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
