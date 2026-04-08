'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  UserPlus, Search, MoreVertical, CheckCircle2,
  Award, Clock, Trash2, Phone, X, Check,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_BUSINESS, MOCK_BUSINESS_MEMBERS, MOCK_ROLES, type MockBusinessMember } from '@/lib/mock-data'

const AVAILABLE_ROLES = MOCK_ROLES.map(r => ({ slug: r.slug, title: r.title }))

// ─── Invite modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone]       = useState('')
  const [name, setName]         = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [roleSlug, setRoleSlug] = useState('')
  const [sent, setSent]         = useState(false)

  function handleSend() {
    if (!phone.trim() || !name.trim()) return
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {sent ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold">Invite sent!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {name} will receive an SMS to join your team.
              </p>
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
                <label className="text-xs font-medium text-muted-foreground">Full name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Amara Nwosu"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

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
                  value={roleSlug}
                  onChange={e => setRoleSlug(e.target.value)}
                  className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Select a role…</option>
                  {AVAILABLE_ROLES.map(r => (
                    <option key={r.slug} value={r.slug}>{r.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSend}
              disabled={!phone.trim() || !name.trim()}
            >
              Send invite via SMS
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Uses 1 of your {MOCK_BUSINESS.seatLimit - MOCK_BUSINESS.seatsUsed} remaining seats
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Member row menu ──────────────────────────────────────────────────────────

function MemberMenu({ member }: { member: MockBusinessMember }) {
  const [open, setOpen] = useState(false)

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
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Contact
            </button>
            {!member.assignedRoleSlug && (
              <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                Assign role
              </button>
            )}
            <button className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5">
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [search, setSearch]       = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'invited'>('all')

  const filtered = MOCK_BUSINESS_MEMBERS
    .filter(m => m.status !== 'removed')
    .filter(m => filterStatus === 'all' || m.status === filterStatus)
    .filter(m =>
      !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search),
    )

  const seatsLeft = MOCK_BUSINESS.seatLimit - MOCK_BUSINESS.seatsUsed

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      <div className="space-y-7">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Team</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {MOCK_BUSINESS.seatsUsed} of {MOCK_BUSINESS.seatLimit} seats used · {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available
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

        {/* ── Filters + search ──────────────────────────────────────────── */}
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
                onClick={() => setFilterStatus(s)}
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

        {/* ── Member list ───────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No results</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(member => {
              const pct = member.totalTopics > 0
                ? Math.round((member.completedTopics / member.totalTopics) * 100)
                : 0
              const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

              return (
                <Card key={member.id} size="sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {initials}
                      </div>

                      {/* Main info */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.phone}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={member.status === 'active' ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {member.status === 'invited' ? 'Pending' : 'Active'}
                            </Badge>
                            <MemberMenu member={member} />
                          </div>
                        </div>

                        {/* Job title + role */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {member.jobTitle && <span>{member.jobTitle}</span>}
                          {member.assignedRoleTitle && (
                            <>
                              {member.jobTitle && <span>·</span>}
                              <span className="font-medium text-foreground">{member.assignedRoleTitle}</span>
                            </>
                          )}
                          {!member.assignedRoleTitle && member.status === 'active' && (
                            <button className="font-medium text-primary hover:underline">+ Assign role</button>
                          )}
                        </div>

                        {/* Progress */}
                        {member.assignedRoleSlug && member.status === 'active' && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">
                                {member.completedTopics}/{member.totalTopics} topics
                              </span>
                              <span className="font-semibold text-foreground">{pct}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  pct === 100 ? 'bg-green-500' : 'bg-primary',
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Certs + time stats */}
                        {member.status === 'active' && (
                          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                            {member.certificates > 0 && (
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3 text-yellow-500" />
                                {member.certificates} cert{member.certificates !== 1 ? 's' : ''}
                              </span>
                            )}
                            {member.joinedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Joined {new Date(member.joinedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                              </span>
                            )}
                          </div>
                        )}

                        {member.status === 'invited' && (
                          <p className="text-[11px] text-amber-600">
                            Invited {new Date(member.invitedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })} — awaiting sign-up
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

        {/* ── Upgrade nudge ─────────────────────────────────────────────── */}
        {seatsLeft <= 2 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
            <p className="text-sm font-semibold text-foreground">Running low on seats</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              You have {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left. Upgrade to add more staff.
            </p>
            <Link href="/business" className={cn(buttonVariants({ size: 'xs', variant: 'outline' }), 'mt-3')}>
              View plans
            </Link>
          </div>
        )}

      </div>
    </>
  )
}
