'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Phone, MapPin, Briefcase, Bell, BellOff,
  ChevronRight, LogOut, Edit3, Check, ExternalLink,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_USER, MOCK_ENROLLMENTS, MOCK_CERTIFICATES, MOCK_BADGES, getRoleBySlug } from '@/lib/mock-data'

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

export default function ProfilePage() {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(MOCK_USER.fullName)
  const [draftName, setDraftName] = useState(MOCK_USER.fullName)
  const [city, setCity] = useState(MOCK_USER.locationCity)
  const [notifPrefs, setNotifPrefs] = useState(MOCK_USER.notificationPrefs)

  function saveName() {
    setName(draftName.trim() || name)
    setEditingName(false)
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Profile</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
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
          <p className="text-sm text-muted-foreground">{MOCK_USER.phone}</p>
          <Badge variant="secondary" className="mt-1 text-[10px]">Learner</Badge>
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
              <p className="text-sm font-medium">{MOCK_USER.phone}</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">Verified</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
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

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Career goal</p>
              <p className="text-sm font-medium">{getRoleBySlug(MOCK_USER.careerGoalRoleSlug)?.title ?? '—'}</p>
            </div>
            <button className="text-xs font-medium text-primary hover:underline">Change</button>
          </div>
        </CardContent>
      </Card>

      {/* Learning stats */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Learning stats</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: 'Enrolled', value: MOCK_ENROLLMENTS.length },
            { label: 'Certificates', value: MOCK_CERTIFICATES.length },
            { label: 'Badges', value: MOCK_BADGES.length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-muted/40 py-3 text-center">
              <p className="font-heading text-xl font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Badges */}
      {MOCK_BADGES.length > 0 && (
        <Card size="sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Badges earned</CardTitle>
          </CardHeader>
          <CardContent className="mt-3 flex flex-wrap gap-2">
            {MOCK_BADGES.map(badge => (
              <div key={badge.slug} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                <span className="text-base">{badge.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Job Hub */}
      <Card size="sm">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Job Hub</p>
            <p className="text-xs text-muted-foreground">
              {MOCK_USER.jobHubSubscribed ? 'Active — receiving job matches' : 'Not subscribed — subscribe to get job alerts'}
            </p>
          </div>
          {MOCK_USER.jobHubSubscribed ? (
            <Badge variant="secondary" className="text-[10px] shrink-0">Active</Badge>
          ) : (
            <Link href="/job-hub" className={cn(buttonVariants({ size: 'xs' }), 'shrink-0')}>
              Subscribe
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card size="sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="mt-3 space-y-3">
          {([
            { key: 'push', label: 'Push notifications', desc: 'Course reminders and updates' },
            { key: 'sms', label: 'SMS', desc: 'Job alerts and account activity' },
            { key: 'email', label: 'Email', desc: 'Weekly progress summary (opt-in)' },
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
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors',
                  notifPrefs[key] ? 'bg-primary' : 'bg-muted',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  notifPrefs[key] ? 'translate-x-4' : 'translate-x-0.5',
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
            { label: 'Privacy Policy', href: '/privacy', icon: ExternalLink },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <button className="flex w-full items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/5">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
