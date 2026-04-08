'use client'

import { useState } from 'react'
import {
  Briefcase, MapPin, CheckCircle2, Star,
  Clock, ChevronRight, Plus, X, Check,
  Award, Users,
} from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_HIRE_REQUESTS, MOCK_CANDIDATES, MOCK_ROLES, type MockCandidate } from '@/lib/mock-data'

const CITIES = ['Lagos', 'Abuja', 'Enugu', 'Kano', 'Port Harcourt', 'Ibadan', 'Benin City', 'Kaduna']

const AVAILABILITY_LABEL: Record<string, string> = {
  immediate: 'Immediately',
  two_weeks: '2 weeks notice',
  one_month: '1 month notice',
}

// ─── Post request modal ───────────────────────────────────────────────────────

function PostRequestModal({ onClose }: { onClose: () => void }) {
  const [roleSlug, setRoleSlug]       = useState('')
  const [city, setCity]               = useState('Abuja')
  const [positions, setPositions]     = useState('1')
  const [payMin, setPayMin]           = useState('')
  const [payMax, setPayMax]           = useState('')
  const [certRequired, setCertRequired] = useState(true)
  const [submitted, setSubmitted]     = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold">Hire request posted!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We're matching certified candidates. You'll be notified when matches are ready.
              </p>
            </div>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Post a hire request</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Role *</label>
                <select
                  value={roleSlug}
                  onChange={e => setRoleSlug(e.target.value)}
                  className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Select a role…</option>
                  {MOCK_ROLES.map(r => <option key={r.slug} value={r.slug}>{r.title}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">City *</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="h-9 w-full appearance-none rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Positions needed *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={positions}
                  onChange={e => setPositions(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Min pay (₦/month, optional)</label>
                <input
                  type="number"
                  value={payMin}
                  onChange={e => setPayMin(e.target.value)}
                  placeholder="45000"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Max pay (₦/month, optional)</label>
                <input
                  type="number"
                  value={payMax}
                  onChange={e => setPayMax(e.target.value)}
                  placeholder="60000"
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <div
                    onClick={() => setCertRequired(p => !p)}
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      certRequired ? 'bg-primary' : 'bg-muted',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                      certRequired ? 'translate-x-4' : 'translate-x-0.5',
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Certified candidates only</p>
                    <p className="text-xs text-muted-foreground">Only show candidates who passed their InTrainin exam</p>
                  </div>
                </label>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => setSubmitted(true)}
              disabled={!roleSlug}
            >
              Post hire request
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Candidate card ───────────────────────────────────────────────────────────

function CandidateCard({ candidate }: { candidate: MockCandidate }) {
  const [status, setStatus] = useState<MockCandidate['status']>(candidate.status)

  const matchColor =
    candidate.matchScore >= 90 ? 'text-green-600' :
    candidate.matchScore >= 75 ? 'text-amber-600' :
    'text-muted-foreground'

  return (
    <Card size="sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {candidate.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{candidate.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {candidate.locationCity}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className={cn('h-3.5 w-3.5', matchColor)} />
            <span className={cn('text-sm font-bold', matchColor)}>{candidate.matchScore}%</span>
            <span className="text-[10px] text-muted-foreground">match</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px]">
          {candidate.certified && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 font-medium text-green-700">
              <Award className="h-3 w-3" /> Certified
            </span>
          )}
          {candidate.testScore && (
            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-muted-foreground">
              Score: {candidate.testScore}%
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-muted-foreground">
            <Clock className="h-3 w-3" /> {AVAILABILITY_LABEL[candidate.availability]}
          </span>
        </div>

        {/* Action row */}
        <div className="flex gap-2">
          {status === 'pending' && (
            <>
              <Button
                size="xs"
                className="flex-1"
                onClick={() => setStatus('shortlisted')}
              >
                Shortlist
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="flex-1"
                onClick={() => setStatus('rejected')}
              >
                Pass
              </Button>
            </>
          )}
          {status === 'shortlisted' && (
            <>
              <Button size="xs" className="flex-1 gap-1" onClick={() => setStatus('hired')}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Hire
              </Button>
              <Button size="xs" variant="outline" className="flex-1" onClick={() => setStatus('rejected')}>
                Remove
              </Button>
            </>
          )}
          {status === 'hired' && (
            <div className="flex flex-1 items-center gap-1.5 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Hired
            </div>
          )}
          {status === 'rejected' && (
            <button
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setStatus('pending')}
            >
              Undo
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HirePage() {
  const [showPost, setShowPost]   = useState(false)
  const [activeReq, setActiveReq] = useState(MOCK_HIRE_REQUESTS.find(r => r.status === 'open')?.id ?? null)

  const openRequests   = MOCK_HIRE_REQUESTS.filter(r => r.status === 'open')
  const closedRequests = MOCK_HIRE_REQUESTS.filter(r => r.status !== 'open')

  const activeCandidates = activeReq
    ? MOCK_CANDIDATES
    : []

  return (
    <>
      {showPost && <PostRequestModal onClose={() => setShowPost(false)} />}

      <div className="space-y-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Hire</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Post a role and find certified candidates from the InTrainin job hub.
            </p>
          </div>
          <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setShowPost(true)}>
            <Plus className="h-3.5 w-3.5" /> Post role
          </Button>
        </div>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <Card size="sm" className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { step: '1', title: 'Post a role', desc: 'Specify the position, city, and whether certification is required.' },
                { step: '2', title: 'Review matches', desc: 'We surface certified candidates ranked by match score.' },
                { step: '3', title: 'Hire directly', desc: 'Shortlist, contact, and hire — no middlemen.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Open requests ─────────────────────────────────────────────── */}
        {openRequests.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold">Open Hire Requests</h2>
            {openRequests.map(req => (
              <Card
                key={req.id}
                size="sm"
                className={cn(
                  'cursor-pointer transition-all',
                  activeReq === req.id ? 'border-primary ring-1 ring-primary/20' : 'hover:border-foreground/20',
                )}
                onClick={() => setActiveReq(activeReq === req.id ? null : req.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{req.roleTitle}</p>
                        <Badge variant="default" className="text-[10px]">Open</Badge>
                        {req.certificationRequired && (
                          <Badge variant="secondary" className="text-[10px]">Certified only</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.locationCity}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{req.positionsCount} position{req.positionsCount !== 1 ? 's' : ''}</span>
                        {req.payMin && <span>₦{req.payMin.toLocaleString()}{req.payMax ? `–₦${req.payMax.toLocaleString()}` : '+'}/mo</span>}
                        <span className="font-medium text-primary">{req.matchCount} candidates matched</span>
                      </div>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', activeReq === req.id && 'rotate-90')} />
                  </div>

                  {/* Expanded candidates */}
                  {activeReq === req.id && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4" onClick={e => e.stopPropagation()}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Matched candidates ({MOCK_CANDIDATES.length})
                      </p>
                      {MOCK_CANDIDATES.map(c => (
                        <CandidateCard key={c.id} candidate={c} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* ── Past requests ─────────────────────────────────────────────── */}
        {closedRequests.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-heading text-base font-semibold">Past Requests</h2>
            {closedRequests.map(req => (
              <Card key={req.id} size="sm" className="opacity-70">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{req.roleTitle}</p>
                      <Badge variant="secondary" className="text-[10px] capitalize">{req.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {req.locationCity} · {req.positionsCount} position{req.positionsCount !== 1 ? 's' : ''}
                      · Posted {new Date(req.postedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {openRequests.length === 0 && closedRequests.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Briefcase className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-base font-semibold">No hire requests yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Post your first role to start receiving certified candidate matches.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowPost(true)}>
              <Plus className="h-3.5 w-3.5" /> Post a role
            </Button>
          </div>
        )}

      </div>
    </>
  )
}
