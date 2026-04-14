'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Lock, ArrowRight, Award,
  ChevronRight, MapPin, Loader2, RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'

// =============================================================================
// Types — mirror the API response shape from GET /roadmap/me
// =============================================================================

interface SpineRole {
  id: string; slug: string; title: string
  price_ngn: number; estimated_hours: number | null; category: string | null
}

interface SpineItem {
  role:          SpineRole
  level:         1 | 2 | 3
  status:        'completed' | 'in_progress' | 'locked'
  completionPct: number
  isNext:        boolean
  certificate:   { verificationCode: string; issuedAt: string } | null
  enrollment:    { status: string; completionPct: number } | null
}

interface AdjacentRole {
  role:                 SpineRole
  connectedToRoleTitle: string | null
  status:               'completed' | 'in_progress' | 'locked'
  isNext:               boolean
}

interface CareerPath { id: string; slug: string; title: string; description: string | null }
interface DiscoveryPath {
  id: string; slug: string; title: string; description: string | null
  spine: { level: number; role: SpineRole | null }[]
}

type RoadmapData =
  | { mode: 'discovery'; paths: DiscoveryPath[] }
  | { mode: 'path'; careerPath: CareerPath | null; spine: SpineItem[]; adjacentRoles: AdjacentRole[]; allSpineComplete: boolean }

// =============================================================================
// Helpers
// =============================================================================

function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`
}

// =============================================================================
// Sub-components
// =============================================================================

function ProgressRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const r    = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={4} className="fill-none stroke-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="fill-none stroke-primary transition-all duration-700"
      />
    </svg>
  )
}

function TrackSkeleton() {
  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
          <div className="h-10 w-0.5 bg-muted" />
          <div className="mb-3 h-4 w-28 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function SpineNode({ item, isLast }: { item: SpineItem; isLast: boolean }) {
  const isCompleted  = item.status === 'completed'
  const isInProgress = item.status === 'in_progress'
  const isLocked     = item.status === 'locked'

  return (
    <div className="flex flex-col items-center">
      {/* Circle node */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing ring on is_next */}
        {item.isNext && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-ping"
            style={{ animationDuration: '2s' }}
          />
        )}
        <div className={cn(
          'relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[3px] transition-all',
          isCompleted  && 'border-primary bg-primary text-primary-foreground',
          isInProgress && 'border-primary bg-background text-primary',
          isLocked     && 'border-muted bg-muted text-muted-foreground',
        )}>
          {isCompleted && <CheckCircle2 className="h-6 w-6" />}
          {isInProgress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ProgressRing pct={item.completionPct} size={56} />
              <span className="absolute text-[11px] font-bold text-primary">{item.completionPct}%</span>
            </div>
          )}
          {isLocked && <Lock className="h-5 w-5" />}
        </div>
        {/* Level badge */}
        <span className={cn(
          'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
          isCompleted  ? 'bg-primary/20 text-primary' :
          isInProgress ? 'bg-primary/10 text-primary' :
                         'bg-muted-foreground/10 text-muted-foreground',
        )}>
          L{item.level}
        </span>
      </div>

      {/* Label */}
      <div className="mt-2 flex w-64 flex-col items-center text-center">
        <p className={cn('text-sm font-semibold leading-tight', isLocked ? 'text-muted-foreground' : 'text-foreground')}>
          {item.role.title}
        </p>
        {item.role.category && (
          <span className="mt-0.5 text-[11px] text-muted-foreground">{item.role.category}</span>
        )}

        {isCompleted && item.certificate && (
          <Link href="/certificates" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Award className="h-3.5 w-3.5" /> Certified ✓
          </Link>
        )}
        {isCompleted && !item.certificate && (
          <span className="mt-1.5 text-xs text-muted-foreground">Completed</span>
        )}

        {isInProgress && (
          <div className="mt-2 w-full space-y-1.5">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${item.completionPct}%` }} />
            </div>
            <Link href={`/explore/${item.role.slug}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Continue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {isLocked && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {item.role.price_ngn > 0 ? formatNgn(item.role.price_ngn) : 'Free'}
            </span>
            <Link href={`/explore/${item.role.slug}`} className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'h-6 px-2.5 text-xs')}>
              Enrol
            </Link>
          </div>
        )}
      </div>

      {/* Connector to next node */}
      {!isLast && (
        <div className="my-3 flex flex-col items-center">
          {isCompleted
            ? <div className="h-10 w-0.5 bg-primary" />
            : <div className="h-10 w-0" style={{ borderLeft: '2px dashed hsl(var(--muted-foreground)/0.3)' }} />
          }
        </div>
      )}
    </div>
  )
}

function AdjacentCard({ adj }: { adj: AdjacentRole }) {
  return (
    <div className={cn(
      'flex-shrink-0 w-52 rounded-xl border bg-card p-4 space-y-2',
      adj.isNext && 'border-primary/40 ring-1 ring-primary/20',
    )}>
      {adj.connectedToRoleTitle && (
        <p className="text-[10px] text-muted-foreground leading-tight">Because you enrolled in {adj.connectedToRoleTitle}</p>
      )}
      <p className="text-sm font-semibold text-foreground leading-snug">{adj.role.title}</p>
      {adj.role.category && <Badge variant="secondary" className="text-[10px]">{adj.role.category}</Badge>}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {adj.role.price_ngn > 0 ? formatNgn(adj.role.price_ngn) : 'Free'}
        </span>
        <Link href={`/explore/${adj.role.slug}`} className={cn(buttonVariants({ size: 'sm' }), 'h-6 px-2.5 text-xs')}>
          Enrol
        </Link>
      </div>
    </div>
  )
}

function DiscoveryPathCard({
  path, onSelect, disabled,
}: { path: DiscoveryPath; onSelect: (entryRoleId: string) => void; disabled: boolean }) {
  const entryRole  = path.spine[0]?.role
  const totalHours = path.spine.reduce((s, item) => s + (item.role?.estimated_hours ?? 0), 0)

  return (
    <button
      onClick={() => entryRole && onSelect(entryRole.id)}
      disabled={disabled || !entryRole}
      className={cn(
        'w-full rounded-xl border-2 border-border bg-background p-5 text-left transition-all',
        'hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-semibold text-foreground text-sm leading-snug">{path.title}</h3>
          {path.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{path.description}</p>
          )}
          <div className="flex flex-wrap gap-1 pt-1">
            {path.spine.slice(0, 3).map((item, i) => item.role && (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {item.role.title}
              </span>
            ))}
            {path.spine.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                +{path.spine.length - 3} more
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="ml-3 mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-3 flex gap-3 text-[11px] text-muted-foreground">
        <span>{path.spine.length} level{path.spine.length !== 1 ? 's' : ''}</span>
        {totalHours > 0 && <span>~{totalHours.toFixed(0)}h total</span>}
      </div>
    </button>
  )
}

// =============================================================================
// Page
// =============================================================================

export default function RoadmapPage() {
  const [data,        setData]        = useState<RoadmapData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState(false)
  const [goalLoading, setGoalLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const res = await api.get<{ success: boolean; data: RoadmapData }>('/roadmap/me')
      setData(res.data)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) window.location.replace('/login')
      else setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSelectPath(entryRoleId: string) {
    setGoalLoading(true)
    try {
      const res = await api.patch<{ success: boolean; data: RoadmapData }>('/roadmap/goal', { role_id: entryRoleId })
      setData(res.data)
    } catch {
      // keep discovery UI if goal update fails silently
    } finally {
      setGoalLoading(false)
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded bg-muted animate-pulse" />
        </div>
        <TrackSkeleton />
      </div>
    )
  }

  // Error
  if (loadError || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Couldn&apos;t load your roadmap.</p>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </Button>
      </div>
    )
  }

  // ── State A: Discovery ─────────────────────────────────────────────────────
  if (data.mode === 'discovery') {
    return (
      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Choose your career path</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a track to get a personalised roadmap and unlock your career goal.
          </p>
        </div>

        {goalLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Setting your goal…
          </div>
        ) : data.paths.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <MapPin className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No career paths set up yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.paths.map(path => (
              <DiscoveryPathCard key={path.id} path={path} onSelect={handleSelectPath} disabled={goalLoading} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">You can change your path anytime from your profile.</p>
      </div>
    )
  }

  // ── State B / C: Path view ─────────────────────────────────────────────────
  const { careerPath, spine, adjacentRoles, allSpineComplete } = data

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">
            {careerPath?.title ?? 'Your Roadmap'}
          </h1>
          {careerPath?.description && (
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{careerPath.description}</p>
          )}
        </div>
        <button
          onClick={() => setData({ mode: 'discovery', paths: [] })}
          className="ml-3 mt-0.5 shrink-0 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Change path
        </button>
      </div>

      {/* State C: completion banner */}
      {allSpineComplete && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              You&apos;ve completed the {careerPath?.title ?? 'track'}! 🎉
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Explore adjacent roles below to keep growing.
            </p>
          </div>
        </div>
      )}

      {/* Spine track */}
      {spine.length > 0 ? (
        <div className="flex flex-col items-center pt-2">
          {spine.map((item, i) => (
            <SpineNode key={item.role.id} item={item} isLast={i === spine.length - 1} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">No roles on this path yet.</p>
        </div>
      )}

      {/* Also explore */}
      {adjacentRoles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Also explore</h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {adjacentRoles.map(adj => <AdjacentCard key={adj.role.id} adj={adj} />)}
          </div>
        </section>
      )}

      <div className="pt-2 text-center">
        <Link href="/explore" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}>
          Browse all roles <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
