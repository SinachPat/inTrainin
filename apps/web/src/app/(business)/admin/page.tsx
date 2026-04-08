'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, Award, Briefcase, TrendingUp, UserPlus,
  ChevronRight, ArrowRight,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

interface BizProfile {
  name: string
  subscription_plan: string | null
  seat_limit: number
}

interface Member {
  id: string
  status: string
  job_title: string | null
  invited_phone: string | null
  users: { id: string; full_name: string; phone: string | null } | null
  roles: { id: string; slug: string; title: string } | null
}

interface ProgressEntry {
  member: { id: string; full_name: string } | null
  assignedRole: { id: string; slug: string; title: string } | null
  completedTopics: number
}

export default function BusinessAdminPage() {
  const [profile, setProfile]   = useState<BizProfile | null>(null)
  const [members, setMembers]   = useState<Member[]>([])
  const [progress, setProgress] = useState<ProgressEntry[]>([])
  const [seatUsed, setSeatUsed] = useState(0)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, membersRes, progressRes] = await Promise.all([
          api.get<{ success: boolean; data: { profile: BizProfile } }>('/business/profile').catch(() => null),
          api.get<{ success: boolean; data: { members: Member[]; seatLimit: number; seatUsed: number } }>('/business/members').catch(() => null),
          api.get<{ success: boolean; data: { progress: ProgressEntry[] } }>('/business/progress').catch(() => null),
        ])
        if (profileRes)  setProfile(profileRes.data.profile)
        if (membersRes)  { setMembers(membersRes.data.members); setSeatUsed(membersRes.data.seatUsed) }
        if (progressRes) setProgress(progressRes.data.progress)
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const activeMembers    = members.filter(m => m.status === 'active')
  const seatsTotal       = profile?.seat_limit ?? 10
  const seatsPct         = Math.round((seatUsed / seatsTotal) * 100)
  const avgProgress      = progress.length
    ? Math.round(progress.reduce((s, p) => s + p.completedTopics, 0) / progress.length)
    : 0

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.name ?? '…'} · {profile?.subscription_plan ?? 'Free'} plan
          </p>
        </div>
        <Link href="/team" className={cn(buttonVariants({ size: 'sm' }), 'shrink-0 gap-1.5')}>
          <UserPlus className="h-3.5 w-3.5" /> Invite Staff
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Stats grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Team Members',
                value: seatUsed,
                sub: `${seatsTotal - seatUsed} seats free`,
                icon: <Users className="h-4 w-4 text-blue-500" />,
                accent: 'bg-blue-500/10',
              },
              {
                label: 'Avg. Topics Done',
                value: avgProgress,
                sub: 'across active staff',
                icon: <TrendingUp className="h-4 w-4 text-primary" />,
                accent: 'bg-primary/10',
              },
              {
                label: 'Active Staff',
                value: activeMembers.length,
                sub: 'currently active',
                icon: <Award className="h-4 w-4 text-yellow-500" />,
                accent: 'bg-yellow-500/10',
              },
              {
                label: 'Seat Limit',
                value: seatsTotal,
                sub: `${seatUsed} used`,
                icon: <Briefcase className="h-4 w-4 text-green-500" />,
                accent: 'bg-green-500/10',
              },
            ].map(({ label, value, sub, icon, accent }) => (
              <Card key={label} size="sm">
                <CardContent className="p-4">
                  <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-lg', accent)}>
                    {icon}
                  </div>
                  <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
                  <p className="mt-0.5 text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Seat usage bar ────────────────────────────────────────────── */}
          <Card size="sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Seat usage</p>
                    <span className="text-xs font-semibold text-foreground">{seatUsed} / {seatsTotal} seats</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn('h-full rounded-full transition-all', seatsPct >= 90 ? 'bg-destructive' : 'bg-primary')}
                      style={{ width: `${seatsPct}%` }}
                    />
                  </div>
                  {seatsPct >= 80 && (
                    <p className="mt-1.5 text-[11px] text-destructive">
                      {seatsTotal - seatUsed} seat{seatsTotal - seatUsed !== 1 ? 's' : ''} remaining — consider upgrading
                    </p>
                  )}
                </div>
                <Link href="/account" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0')}>
                  Upgrade
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ── Team progress ─────────────────────────────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold">Team Progress</h2>
              <Link href="/team" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Manage team <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {members.filter(m => m.status !== 'removed').length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No team members yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Invite staff to start tracking progress.</p>
                <Link href="/team" className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>Invite staff</Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="hidden grid-cols-[1fr_1fr_80px] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 sm:grid">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Staff member</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned role</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Status</p>
                </div>
                <div className="divide-y divide-border/60">
                  {members.filter(m => m.status !== 'removed').map((member) => {
                    const displayName = member.users?.full_name ?? member.invited_phone ?? '—'
                    const initials    = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    return (
                      <div key={member.id} className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[1fr_1fr_80px] sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                            {member.job_title && <p className="text-[11px] text-muted-foreground">{member.job_title}</p>}
                          </div>
                        </div>
                        <div>
                          {member.roles ? (
                            <p className="text-sm text-foreground">{member.roles.title}</p>
                          ) : (
                            <Link href="/team" className="text-xs font-medium text-primary hover:underline">Assign role →</Link>
                          )}
                        </div>
                        <div className="sm:text-right">
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                            {member.status === 'invited' ? 'Pending' : member.status === 'active' ? 'Active' : member.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          <section className="grid gap-3 sm:grid-cols-2">
            <Link href="/team" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Invite staff member</p>
                <p className="text-xs text-muted-foreground">Add to your team and assign a training role</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link href="/hire" className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Post a hire request</p>
                <p className="text-xs text-muted-foreground">Find certified candidates from the job hub</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </section>
        </>
      )}

    </div>
  )
}
