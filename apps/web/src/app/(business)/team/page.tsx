'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  UserPlus, Search, MoreVertical, CheckCircle2,
  Award, Clock, Trash2, Phone, X, Check,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Member {
  id: string
  status: 'invited' | 'active' | 'removed'
  job_title: string | null
  invited_phone: string | null
  invited_at: string | null
  users: { id: string; full_name: string; phone: string | null } | null
  roles: { id: string; slug: string; title: string } | null
}

interface MembersResponse {
  members: Member[]
  seatLimit: number
  seatUsed: number
}

interface AvailableRole { id: string; slug: string; title: string }

interface MemberProgress {
  completedTopics: number
  member: { id: string; full_name: string } | null
  assignedRole: { id: string; slug: string; title: string } | null
}

// ── Invite modal ──────────────────────────────────────────────────────────────

function InviteModal({
  onClose, onSuccess, availableRoles, seatsLeft,
}: {
  onClose: () => void
  onSuccess: () => void
  availableRoles: AvailableRole[]
  seatsLeft: number
}) {
  const [phone, setPhone]       = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [roleId, setRoleId]     = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  async function handleSend() {
    if (!phone.trim()) return
    setSending(true)
    setError('')
    try {
      await api.post('/business/members', {
        phone:    `+234${phone.trim()}`,
        jobTitle: jobTitle.trim() || undefined,
        roleId:   roleId || undefined,
      })
      setSent(true)
      onSuccess()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to send invite')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl" onClick={e => e.stopPropagation()}>
        {sent ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold">Invite sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">They'll receive an SMS to join your team.</p>
            </div>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Invite staff member</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone number *</label>
                <div className="flex">
                  <span className="flex h-9 items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">+234</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="8012345678"
                    className="h-9 flex-1 rounded-r-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Job title (optional)</label>
                <input
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Cashier"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Assign training role (optional)</label>
                <select
                  value={roleId}
                  onChange={e => setRoleId(e.target.value)}
                  className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Select a role…</option>
                  {availableRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button className="w-full" onClick={handleSend} disabled={!phone.trim() || sending}>
              {sending ? 'Sending…' : 'Send invite via SMS'}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Uses 1 of your {seatsLeft} remaining seats
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Member row menu ───────────────────────────────────────────────────────────

function MemberMenu({
  member, availableRoles, onAssignRole, onRemove,
}: {
  member: Member
  availableRoles: AvailableRole[]
  onAssignRole: (memberId: string, roleId: string) => void
  onRemove: (memberId: string) => void
}) {
  const [open, setOpen]           = useState(false)
  const [showRoles, setShowRoles] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setShowRoles(false) }} />
          <div className="absolute right-0 top-8 z-20 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            {member.users?.phone && (
              <a
                href={`tel:${member.users.phone}`}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Call
              </a>
            )}
            {!member.roles && member.status === 'active' && (
              showRoles ? (
                <div className="border-t border-border/60">
                  <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Assign role</p>
                  {availableRoles.map(r => (
                    <button
                      key={r.id}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => { onAssignRole(member.id, r.id); setOpen(false); setShowRoles(false) }}
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted"
                  onClick={() => setShowRoles(true)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Assign role
                </button>
              )
            )}
            <button
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5"
              onClick={() => { onRemove(member.id); setOpen(false) }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers]         = useState<Member[]>([])
  const [seatLimit, setSeatLimit]     = useState(10)
  const [seatUsed, setSeatUsed]       = useState(0)
  const [availableRoles, setRoles]    = useState<AvailableRole[]>([])
  const [progress, setProgress]       = useState<MemberProgress[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilter]     = useState<'all' | 'active' | 'invited'>('all')
  const [showInvite, setShowInvite]   = useState(false)

  async function load() {
    try {
      const [membersRes, rolesRes, progressRes] = await Promise.all([
        api.get<{ success: boolean; data: MembersResponse }>('/business/members'),
        api.get<{ success: boolean; data: { roles: AvailableRole[] } }>('/learning/roles').catch(() => null),
        api.get<{ success: boolean; data: { progress: MemberProgress[] } }>('/business/progress').catch(() => null),
      ])
      setMembers(membersRes.data.members)
      setSeatLimit(membersRes.data.seatLimit)
      setSeatUsed(membersRes.data.seatUsed)
      if (rolesRes) setRoles(rolesRes.data.roles)
      if (progressRes) setProgress(progressRes.data.progress)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAssignRole(memberId: string, roleId: string) {
    try {
      await api.post('/business/assignments', { memberId, roleId })
      await load()
    } catch {
      // best-effort
    }
  }

  async function handleRemove(memberId: string) {
    setMembers(ms => ms.filter(m => m.id !== memberId))
    try {
      await api.delete(`/business/members/${memberId}`)
    } catch {
      await load()  // revert by re-fetching
    }
  }

  const seatsLeft = seatLimit - seatUsed

  const filtered = members
    .filter(m => m.status !== 'removed')
    .filter(m => filterStatus === 'all' || m.status === filterStatus)
    .filter(m => {
      if (!search.trim()) return true
      const name  = m.users?.full_name ?? ''
      const phone = m.users?.phone ?? m.invited_phone ?? ''
      return name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search)
    })

  // Build a progress lookup by member user id
  const progressByUserId = new Map(
    progress.map(p => [p.member?.id, p])
  )

  return (
    <>
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={() => { setShowInvite(false); load() }}
          availableRoles={availableRoles}
          seatsLeft={seatsLeft}
        />
      )}

      <div className="space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Team</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {seatUsed} of {seatLimit} seats used · {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setShowInvite(true)}
            disabled={seatsLeft <= 0}
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite
          </Button>
        </div>

        {/* Filters + search */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'active', 'invited'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                  filterStatus === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Member list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              {search || filterStatus !== 'all' ? 'No results — try adjusting your search.' : 'No team members yet.'}
            </p>
            {!search && filterStatus === 'all' && (
              <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowInvite(true)}>
                <UserPlus className="h-3.5 w-3.5" /> Invite your first staff member
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(member => {
              const displayName = member.users?.full_name ?? member.invited_phone ?? '—'
              const initials    = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              const memberProg  = member.users ? progressByUserId.get(member.users.id) : undefined

              return (
                <Card key={member.id} size="sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                            {member.users?.phone && (
                              <p className="text-xs text-muted-foreground">{member.users.phone}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                              {member.status === 'invited' ? 'Pending' : 'Active'}
                            </Badge>
                            <MemberMenu
                              member={member}
                              availableRoles={availableRoles}
                              onAssignRole={handleAssignRole}
                              onRemove={handleRemove}
                            />
                          </div>
                        </div>

                        {/* Job title + role */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {member.job_title && <span>{member.job_title}</span>}
                          {member.roles ? (
                            <>
                              {member.job_title && <span>·</span>}
                              <span className="font-medium text-foreground">{member.roles.title}</span>
                            </>
                          ) : member.status === 'active' ? (
                            <button
                              className="font-medium text-primary hover:underline"
                              onClick={() => setShowInvite(false)}
                            >
                              + Assign role
                            </button>
                          ) : null}
                        </div>

                        {/* Progress bar */}
                        {member.roles && member.status === 'active' && memberProg && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">{memberProg.completedTopics} topics completed</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min(memberProg.completedTopics * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Invited at */}
                        {member.status === 'invited' && member.invited_at && (
                          <p className="text-[11px] text-amber-600">
                            Invited {new Date(member.invited_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} — awaiting sign-up
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Upgrade nudge */}
        {seatsLeft <= 2 && !loading && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Running low on seats</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You have {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left. Upgrade to add more staff.
            </p>
            <Link href="/account" className={cn(buttonVariants({ size: 'xs', variant: 'outline' }), 'mt-3')}>
              View plans
            </Link>
          </div>
        )}

      </div>
    </>
  )
}
