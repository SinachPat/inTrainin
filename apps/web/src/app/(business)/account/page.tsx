'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, User, Bell, BellOff, LogOut,
  ExternalLink, ChevronRight, Check, Edit3,
  CreditCard, Shield, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'

// TODO: replace with real session (Layer 3)
const MOCK_BIZ = {
  name: 'Sunshine Supermart',
  type: 'Retail store',
  city: 'Lagos',
  initials: 'SS',
  plan: 'Starter',
  planExpiry: '2026-12-31',
  memberCount: 4,
  maxMembers: 5,
}

const MOCK_OWNER = {
  fullName: 'Tunde Adeyemi',
  phone: '+234 801 234 5678',
  role: 'Owner',
  initials: 'TA',
}

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

const PLAN_FEATURES: Record<string, string[]> = {
  Starter: [
    'Up to 5 team members',
    'Role enrolments for all members',
    'Team progress dashboard',
    'Job Hub matching (5 slots)',
    'Certificate verification page',
  ],
  Growth: [
    'Up to 20 team members',
    'Priority job matching',
    'Custom branding on certificates',
    'API access',
    'Dedicated support',
  ],
}

export default function BusinessAccountPage() {
  const [bizName, setBizName] = useState(MOCK_BIZ.name)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState(MOCK_BIZ.name)
  const [city, setCity] = useState(MOCK_BIZ.city)
  const [signingOut, setSigningOut] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({ push: true, sms: true, email: false })

  function saveName() {
    setBizName(draftName.trim() || bizName)
    setEditingName(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  const planExpiry = new Date(MOCK_BIZ.planExpiry).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-0">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your business profile and subscription</p>
      </div>

      {/* ── Business identity ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-card sm:p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
          {MOCK_BIZ.initials}
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
              <Button size="xs" onClick={saveName}><Check className="h-3.5 w-3.5" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-bold text-foreground">{bizName}</p>
              <button
                onClick={() => { setDraftName(bizName); setEditingName(true) }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{MOCK_BIZ.type}</p>
          <Badge variant="secondary" className="mt-1 text-[11px]">{MOCK_BIZ.plan} plan</Badge>
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
              <p className="text-sm font-medium">{MOCK_BIZ.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Team size</p>
              <p className="text-sm font-medium">
                {MOCK_BIZ.memberCount} of {MOCK_BIZ.maxMembers} members used
              </p>
            </div>
            <div className="flex h-6 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(MOCK_BIZ.memberCount / MOCK_BIZ.maxMembers) * 100}%` }}
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
                onChange={e => setCity(e.target.value)}
                className="h-7 w-full appearance-none bg-transparent text-sm font-medium text-foreground outline-none"
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
              {MOCK_OWNER.initials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{MOCK_OWNER.fullName}</p>
              <p className="text-xs text-muted-foreground">{MOCK_OWNER.phone} · {MOCK_OWNER.role}</p>
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
            <Badge variant="secondary" className="text-[10px]">{MOCK_BIZ.plan}</Badge>
          </div>
        </CardHeader>
        <CardContent className="mt-3 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Renews</span>
            <span className="font-medium text-foreground">{planExpiry}</span>
          </div>
          <ul className="space-y-2">
            {(PLAN_FEATURES[MOCK_BIZ.plan] ?? []).map(f => (
              <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs font-semibold text-foreground">Upgrade to Growth</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              20 members, priority job matching, and custom certificates.
            </p>
            <Link
              href="/business/upgrade"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <CreditCard className="h-3 w-3" /> See pricing
            </Link>
          </div>
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
                onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
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
