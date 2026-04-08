'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Phone, Shield, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { setSession } from '@/lib/auth'

type Step = 'phone' | 'otp'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0')) return '+234' + digits.slice(1)
  if (digits.startsWith('234')) return '+' + digits
  return digits
}

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  // Temporarily store tokens between OTP verify and /auth/me
  const [pendingTokens, setPendingTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)

  function formatPhoneDisplay(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return '+234 ' + digits.slice(1)
    return '+234 ' + digits
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Enter a valid Nigerian phone number (e.g. 0801 234 5678)')
      return
    }
    setLoading(true)
    try {
      const e164Phone = normalizePhone(phone)
      await api.post('/auth/otp/send', { phone: e164Phone })
      setStep('otp')
      startCountdown()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function startCountdown() {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); return 0 }
        return c - 1
      })
    }, 1000)
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length < 6) {
      setError('Enter the complete 6-digit code')
      return
    }
    setError('')
    setLoading(true)
    try {
      const e164Phone = normalizePhone(phone)
      const verifyRes = await api.post<{
        success: boolean
        data: {
          accessToken: string
          refreshToken: string
          profileComplete: boolean
          accountType: string
        }
      }>('/auth/otp/verify', { phone: e164Phone, token: otpString })

      const { accessToken, refreshToken, profileComplete, accountType } = verifyRes.data

      if (profileComplete) {
        // Fetch full user profile
        const meRes = await api.get<{
          data: {
            user: {
              id: string
              full_name: string
              account_type: string
              phone: string
            }
          }
        }>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })

        const user = meRes.data.user
        setSession({
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            fullName: user.full_name,
            accountType: user.account_type as 'learner' | 'business' | 'admin',
            phone: user.phone,
          },
        })
        router.push(accountType === 'business' || accountType === 'admin' ? '/admin' : '/dashboard')
      } else {
        // New user — store tokens in sessionStorage and redirect to signup profile step
        setPendingTokens({ accessToken, refreshToken })
        sessionStorage.setItem('intrainin_temp_tokens', JSON.stringify({ accessToken, refreshToken }))
        router.push('/signup?needsProfile=1')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Check the code and try again.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Brand mark */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <span className="font-heading text-lg font-bold text-primary-foreground">IT</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {step === 'phone' ? 'Welcome back' : 'Check your phone'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 'phone'
            ? 'Sign in with your phone number'
            : `We sent a 6-digit code to ${formatPhoneDisplay(phone)}`}
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone number
            </label>
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
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending code…' : <span className="flex items-center gap-1.5">Get OTP code <ArrowRight className="h-4 w-4" /></span>}
          </Button>

          <div className="space-y-2 pt-1 text-center text-xs text-muted-foreground">
            <p>
              No account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up free
              </Link>
            </p>
            <p>
              Signing in as a business?{' '}
              <Link href="/signup?type=business" className="font-medium text-primary hover:underline">
                Business login
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          <button
            type="button"
            onClick={() => { setStep('phone'); setError(''); setOtp(['', '', '', '', '', '']) }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Change number
          </button>

          {/* OTP digit boxes */}
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
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Code expires in 10 minutes. Never share it with anyone.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify and sign in'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Didn&apos;t get it?{' '}
            <button
              type="button"
              onClick={async () => {
                setOtp(['', '', '', '', '', ''])
                startCountdown()
                try {
                  const e164Phone = normalizePhone(phone)
                  await api.post('/auth/otp/send', { phone: e164Phone })
                } catch {}
              }}
              disabled={countdown > 0}
              className={cn(
                'font-medium transition-colors',
                countdown > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline',
              )}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </p>
        </form>
      )}
    </div>
  )
}
