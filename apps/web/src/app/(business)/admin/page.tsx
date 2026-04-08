import Link from 'next/link'
import {
  Users, Award, Briefcase, TrendingUp, UserPlus,
  ChevronRight, CheckCircle2, Clock, ArrowRight,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  MOCK_BUSINESS, MOCK_BUSINESS_MEMBERS, MOCK_HIRE_REQUESTS,
} from '@/lib/mock-data'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BusinessAdminPage() {
  const activeMembers    = MOCK_BUSINESS_MEMBERS.filter(m => m.status === 'active')
  const totalCerts       = MOCK_BUSINESS_MEMBERS.reduce((s, m) => s + m.certificates, 0)
  const avgProgress      = activeMembers.length
    ? Math.round(activeMembers.reduce((s, m) => s + (m.totalTopics > 0 ? (m.completedTopics / m.totalTopics) * 100 : 0), 0) / activeMembers.length)
    : 0
  const openHireRequests = MOCK_HIRE_REQUESTS.filter(r => r.status === 'open').length
  const seatsUsed        = MOCK_BUSINESS.seatsUsed
  const seatsTotal       = MOCK_BUSINESS.seatLimit
  const seatsPct         = Math.round((seatsUsed / seatsTotal) * 100)

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_BUSINESS.name} · {MOCK_BUSINESS.plan} plan
          </p>
        </div>
        <Link href="/team" className={cn(buttonVariants({ size: 'sm' }), 'shrink-0 gap-1.5')}>
          <UserPlus className="h-3.5 w-3.5" /> Invite Staff
        </Link>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Team Members',
            value: seatsUsed,
            sub: `${seatsTotal - seatsUsed} seats free`,
            icon: <Users className="h-4 w-4 text-blue-500" />,
            accent: 'bg-blue-500/10',
          },
          {
            label: 'Avg. Progress',
            value: `${avgProgress}%`,
            sub: 'across active staff',
            icon: <TrendingUp className="h-4 w-4 text-primary" />,
            accent: 'bg-primary/10',
          },
          {
            label: 'Certificates',
            value: totalCerts,
            sub: 'total earned',
            icon: <Award className="h-4 w-4 text-yellow-500" />,
            accent: 'bg-yellow-500/10',
          },
          {
            label: 'Open Hire Req.',
            value: openHireRequests,
            sub: 'active listings',
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

      {/* ── Seat usage bar ──────────────────────────────────────────────── */}
      <Card size="sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Seat usage</p>
                <span className="text-xs font-semibold text-foreground">{seatsUsed} / {seatsTotal} seats</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', seatsPct >= 90 ? 'bg-destructive' : 'bg-primary')}
                  style={{ width: `${seatsPct}%` }}
                />
              </div>
              {seatsPct >= 80 && (
                <p className="mt-1.5 text-[11px] text-destructive">
                  {seatsTotal - seatsUsed} seat{seatsTotal - seatsUsed !== 1 ? 's' : ''} remaining — consider upgrading
                </p>
              )}
            </div>
            <Link href="/business" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0')}>
              Upgrade
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── Team progress table ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Team Progress</h2>
          <Link href="/team" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Manage team <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {/* Table header */}
          <div className="hidden grid-cols-[1fr_1fr_120px_80px_80px] gap-4 border-b border-border bg-muted/40 px-4 py-2.5 sm:grid">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Staff member</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned role</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Progress</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Certs</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Status</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/60">
            {MOCK_BUSINESS_MEMBERS.filter(m => m.status !== 'removed').map((member) => {
              const pct = member.totalTopics > 0
                ? Math.round((member.completedTopics / member.totalTopics) * 100)
                : 0

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[1fr_1fr_120px_80px_80px] sm:items-center sm:gap-4"
                >
                  {/* Name + phone */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">{member.phone}</p>
                    </div>
                  </div>

                  {/* Assigned role */}
                  <div className="sm:block">
                    {member.assignedRoleTitle ? (
                      <p className="text-sm text-foreground">{member.assignedRoleTitle}</p>
                    ) : (
                      <Link
                        href="/team"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Assign role →
                      </Link>
                    )}
                    {member.jobTitle && (
                      <p className="text-[11px] text-muted-foreground">{member.jobTitle}</p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="sm:block">
                    {member.assignedRoleTitle ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{member.completedTopics}/{member.totalTopics} topics</span>
                          <span className="font-semibold text-foreground">{pct}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full rounded-full transition-all', pct === 100 ? 'bg-green-500' : 'bg-primary')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Certificates */}
                  <div className="flex items-center gap-1 sm:justify-center">
                    {member.certificates > 0
                      ? <><Award className="h-3.5 w-3.5 text-yellow-500" /><span className="text-sm font-semibold">{member.certificates}</span></>
                      : <span className="text-sm text-muted-foreground">0</span>}
                  </div>

                  {/* Status */}
                  <div className="sm:text-right">
                    <Badge
                      variant={member.status === 'active' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {member.status === 'invited' ? 'Pending' : member.status === 'active' ? 'Active' : member.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Hire requests ────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Hire Requests</h2>
          <Link href="/hire" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {MOCK_HIRE_REQUESTS.length > 0 ? (
          <div className="space-y-2">
            {MOCK_HIRE_REQUESTS.map(req => (
              <Card key={req.id} size="sm">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{req.roleTitle}</p>
                      <Badge
                        variant={req.status === 'open' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {req.locationCity} · {req.positionsCount} position{req.positionsCount !== 1 ? 's' : ''}
                      {req.matchCount > 0 && ` · ${req.matchCount} candidate${req.matchCount !== 1 ? 's' : ''} matched`}
                    </p>
                  </div>
                  {req.status === 'open' && (
                    <Link href="/hire" className={cn(buttonVariants({ size: 'xs', variant: 'outline' }), 'shrink-0')}>
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No hire requests yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Post a role to start finding certified candidates.</p>
            <Link href="/hire" className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>
              Post a role
            </Link>
          </div>
        )}
      </section>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
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
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

    </div>
  )
}
