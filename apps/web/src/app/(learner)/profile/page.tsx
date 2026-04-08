'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Phone, MapPin, Briefcase, Bell, BellOff,
  ChevronRight, LogOut, Edit3, Check, ExternalLink,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'
import { signOut } from '@/lib/auth'

interface ApiUser {
  id: string
  full_name: string
  phone: string | null
  location_city: string | null
  account_type: string
  xp_total: number
  streak_current: number
  notification_prefs: { push: boolean; sms: boolean; email: boolean } | null
}

const DEFAULT_PREFS = { push: true, sms: true, email: false }

export default function ProfilePage() {
  const [user, setUser]             = useState<ApiUser | null>(null)
  const [loading, setLoading]       = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [name, setName]             = useState('')
  const [draftName, setDraftName]   = useState('')
  const [notifPrefs, setNotifPrefs] = useState(DEFAULT_PREFS)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    api.get<{ success: boolean; data: { user: ApiUser } }>('/auth/me')
      .then(res => {
        const u = res.data.user
        setUser(u)
        setName(u.full_name)
        setDraftName(u.full_name)
        setNotifPrefs(u.notification_prefs ?? DEFAULT_PREFS)
      })
      .catch(e => { if (e instanceof ApiError && e.status === 401) window.location.replace('/login') })
      .finally(() => setLoading(false))
  }, [])

  async function saveName() {
    const trimmed = draftName.trim() || name
    setName(trimmed)
    setEditingName(false)
    // Best-effort update — fire and forget
    api.post('/auth/profile/complete', { fullName: trimmed, accountType: user?.account_type ?? 'learner', locationCity: user?.location_city ?? '' }).catch(() => {})
  }

  async function toggleNotif(key: keyof typeof notifPrefs) {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(next)
    api.put('/notifications/preferences', next).catch(() => {})
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-10">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-6 md:py-8 md:px-10">
      <h1 className="font-heading text-2xl font-bold">Profile</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card sm:gap-4 sm:p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
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
              <Button size="xs" onClick={saveName}><Check className="h-3.5 w-3.5" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-heading text-lg font-bold text-foreground">{name}</p>
              <button onClick={() => { setDraftName(name); setEditingName(true) }} className="text-muted-foreground hover:text-foreground">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{user?.phone ?? '—'}</p>
          <Badge variant="secondary" className="mt-1 text-[11px]">
            {user?.account_type === 'business' ? 'Business' : 'Learner'}
          </Badge>
        </div>
      </div>

      {/* Personal details */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Personal details</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{user?.phone ?? '—'}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">Verified</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">City</p>
              <p className="text-sm font-medium">{user?.location_city ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">XP earned</p>
              <p className="text-sm font-medium">{user?.xp_total ?? 0} XP · {user?.streak_current ?? 0} day streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          {([
            { key: 'push' as const, label: 'Push notifications', desc: 'Course reminders and updates' },
            { key: 'sms'  as const, label: 'SMS', desc: 'Job alerts and account activity' },
            { key: 'email' as const, label: 'Email', desc: 'Weekly progress summary (opt-in)' },
          ]).map(({ key, label, desc }) => (
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

      {/* Account actions */}
      <Card size="sm">
        <CardContent className="divide-y divide-border/60 p-0">
          {[
            { label: 'Terms of Service', href: '/terms', icon: ExternalLink },
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
            <span className="text-sm font-medium">
              {signingOut ? 'Signing out…' : 'Sign out'}
            </span>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
