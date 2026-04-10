'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Building2, User, Bell, BellOff, LogOut,
  ExternalLink, ChevronRight, Check, Edit3,
  CreditCard, Shield, Zap, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { signOut, getSession } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessProfile {
  id: string
  name: string
  category: string | null
  size_range: string | null
  location_city: string | null
  location_state: string | null
}

interface Subscription {
  plan: string | null
  startsAt: string | null
  expiresAt: string | null
  isActive: boolean
  seatLimit: number
}

interface MembersData {
  seatLimit: number
  seatUsed: number
}

interface NotificationPrefs {
  push: boolean
  sms: boolean
  email: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Up to 10 team members',
    'Role enrolments for all members',
    'Team progress dashboard',
    'Job Hub matching (5 slots)',
    'Certificate verification page',
  ],
  growth: [
    'Up to 30 team members',
    'Priority job matching',
    'Custom branding on certificates',
    'API access',
    'Dedicated support',
  ],
  business: [
    'Up to 100 team members',
    'Everything in Growth',
    'Analytics dashboard',
    'Bulk enrolments',
    'SLA support',
  ],
  enterprise_plus: [
    'Unlimited team members',
    'Custom curriculum',
    'White-label certificates',
    'SLA support',
    'Dedicated account manager',
  ],
}

export default function BusinessAccountPage() {
  const [loading, setLoading]               = useState(true)
  const [profile, setProfile]               = useState<BusinessProfile | null>(null)
  const [subscription, setSubscription]     = useState<Subscription | null>(null)
  const [membersData, setMembersData]       = useState<MembersData | null>(null)
  const [notifPrefs, setNotifPrefs]         = useState<NotificationPrefs>({ push: true, sms: true, email: false })

  const [editingName, setEditingName]       = useState(false)
  const [draftName, setDraftName]           = useState('')
  const [savingName, setSavingName]         = useState(false)
  const [savingCity, setSavingCity]         = useState(false)
  const [signingOut, setSigningOut]         = useState(false)

  const session = getSession()

  async function load() {
    try {
      const [profileRes, subRes, membersRes, userRes] = await Promise.all([
        api.get<{ success: boolean; data: { profile: BusinessProfile } }>('/business/profile'),
        api.get<{ success: boolean; data: Subscription }>('/business/subscription').catch(() => null),
        api.get<{ success: boolean; data: MembersData }>('/business/members').catch(() => null),
        api.get<{ success: boolean; data: { user: { notification_prefs: NotificationPrefs } } }>('/auth/me').catch(() => null),
      ])

      setProfile(profileRes.data.profile)
      setDraftName(profileRes.data.profile.name)
      if (subRes) setSubscription(subRes.data)
      if (membersRes) setMembersData(membersRes.data)
      if (userRes) setNotifPrefs(userRes.data.user.notification_prefs ?? { push: true, sms: true, email: false })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function saveName() {
    const trimmed = draftName.trim()
    if (!trimmed || !profile || trimmed === profile.name) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    try {
      const res = await api.put<{ success: boolean; data: { profile: BusinessProfile } }>(
        '/business/profile', { name: trimmed },
      )
      setProfile(res.data.profile)
    } catch {
      // revert on failure
      setDraftName(profile.name)
    } finally {
      setSavingName(false)
      setEditingName(false)
    }
  }

  async function saveCity(newCity: string) {
    if (!profile) return
    setSavingCity(true)
    try {
      const res = await api.put<{ success: boolean; data: { profile: BusinessProfile } }>(
        '/business/profile', { location_city: newCity },
      )
      setProfile(res.data.profile)
    } catch {
      // silent — keep previous city visible
    } finally {
      setSavingCity(false)
    }
  }

  async function toggleNotif(key: keyof NotificationPrefs) {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(next)
    try {
      await api.put('/auth/notifications', next)
    } catch {
      // revert on failure
      setNotifPrefs(notifPrefs)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">Business profile not found.</p>
      </div>
    )
  }

  const plan        = subscription?.plan ?? 'starter'
  const planLabel   = plan.charAt(0).toUpperCase() + plan.slice(1).replace('_', ' ')
  const planExpiry  = subscription?.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const memberCount = membersData?.seatUsed ?? 0
  const maxMembers  = membersData?.seatLimit ?? subscription?.seatLimit ?? 5
  const bizType     = profile.category ?? 'Business'
  const city        = profile.location_city ?? 'Lagos'
  const initials    = profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const ownerName     = session?.fullName ?? '—'
  const ownerPhone    = session?.phone ?? '—'
  const ownerInitials = ownerName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-0">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your business profile and subscription</p>
      </div>

      {/* ── Business identity ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card sm:p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                className="h-8 flex-1 rounded-lg border border-primary bg-background px-3 text-sm outline-none"
                onKeyDown={e => { if (e.key === 'Enter') saveName() }}
              />
              <Button size="xs" onClick={saveName} disabled={savingName}>
                {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-bold text-foreground">{profile.name}</p>
              <button
                onClick={() => { setDraftName(profile.name); setEditingName(true) }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{bizType}</p>
          <Badge variant="secondary" className="mt-1 text-[11px]">{planLabel} plan</Badge>
        </div>
      </div>

      {/* ── Business details ──────────────────────────────────────────────── */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Business details</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Business type</p>
              <p className="text-sm font-medium">{bizType}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Team size</p>
              <p className="text-sm font-medium">
                {memberCount} of {maxMembers} members used
              </p>
            </div>
            <div className="flex h-6 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(memberCount / maxMembers) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">City</p>
              <select
                value={city}
                onChange={e => saveCity(e.target.value)}
                disabled={savingCity}
                className="h-7 w-full appearance-none bg-transparent text-sm font-medium text-foreground outline-none disabled:opacity-50"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Account owner ─────────────────────────────────────────────────── */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Account owner</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
              {ownerInitials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{ownerName}</p>
              <p className="text-xs text-muted-foreground">{ownerPhone} · Owner</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[10px]">Owner</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── Subscription ──────────────────────────────────────────────────── */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Subscription</CardTitle>
            <Badge variant="secondary" className="text-[10px]">{planLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent className="mt-3 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Renews</span>
            <span className="font-medium text-foreground">{planExpiry}</span>
          </div>
          <ul className="space-y-2">
            {(PLAN_FEATURES[plan] ?? PLAN_FEATURES.starter ?? []).map(f => (
              <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          {plan === 'starter' && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs font-semibold text-foreground">Upgrade to Growth</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                30 members, priority job matching, and custom certificates.
              </p>
              <Link
                href="/business/upgrade"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <CreditCard className="h-3 w-3" /> See pricing
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          {([
            { key: 'push', label: 'Push notifications', desc: 'Team activity and hire request alerts' },
            { key: 'sms',  label: 'SMS',                desc: 'Urgent alerts and account activity' },
            { key: 'email', label: 'Email',             desc: 'Weekly team progress summary' },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {notifPrefs[key]
                  ? <Bell className="h-4 w-4 text-primary" />
                  : <BellOff className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                aria-checked={notifPrefs[key]}
                role="switch"
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
                  notifPrefs[key] ? 'bg-primary' : 'bg-muted-foreground/25',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  notifPrefs[key] ? 'translate-x-5' : 'translate-x-0',
                )} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Account actions ────────────────────────────────────────────────── */}
      <Card size="sm">
        <CardContent className="divide-y divide-border/60 p-0">
          {[
            { label: 'Terms of Service', href: '/terms',   icon: ExternalLink },
            { label: 'Privacy Policy',   href: '/privacy', icon: ExternalLink },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
          >
            <LogOut className={cn('h-4 w-4', signingOut && 'animate-spin')} />
            <span className="text-sm font-medium">{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
