'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Award, MapPin, Calendar, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LogoMark } from '@/components/logo'

interface PublicCert {
  id: string
  issuedAt: string
  verificationCode: string
  role: { title: string; slug: string; icon: string } | null
}

interface PublicUser {
  id: string
  fullName: string
  locationCity: string | null
  joinedAt: string
}

interface ProfileData {
  user: PublicUser
  certificates: PublicCert[]
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [data, setData]     = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    fetch(`${base}/auth/users/${userId}/public`)
      .then(async r => {
        if (r.status === 404) { setNotFound(true); return }
        const json = await r.json()
        if (json.success) setData(json.data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [userId])

  const initials = data?.user.fullName
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LogoMark size={26} />
        </div>
        <h1 className="font-heading text-xl font-bold text-foreground">Profile not found</h1>
        <p className="text-sm text-muted-foreground">This profile doesn&apos;t exist or is no longer public.</p>
        <Link href="/" className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
          Go to InTrainin
        </Link>
      </div>
    )
  }

  const joinYear = new Date(data.user.joinedAt).getFullYear()

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LogoMark size={16} />
            </span>
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground">InTrainin</span>
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: 'sm' }))}
          >
            Get started free
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8 md:py-12">

        {/* Profile card */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-xl font-bold text-foreground">{data.user.fullName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {data.user.locationCity && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {data.user.locationCity}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" /> Joined {joinYear}
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                Verified learner
              </span>
            </div>
          </div>
        </div>

        {/* Certificates */}
        <section>
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
            Certificates earned · {data.certificates.length}
          </h2>

          {data.certificates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center">
              <Award className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No certificates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.certificates.map(cert => (
                <div
                  key={cert.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl leading-none">
                    {cert.role?.icon ?? '🎓'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-foreground">{cert.role?.title ?? 'Course'}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Issued {new Date(cert.issuedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold text-green-600">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </div>
                    <Link
                      href={`/verify?code=${cert.verificationCode}`}
                      className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Verify <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-5 text-center">
          <p className="mb-1 font-heading text-base font-semibold text-foreground">
            Get trained and certified like {data.user.fullName.split(' ')[0]}
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Start with Module 1 for free — no payment required.
          </p>
          <Link href="/signup" className={cn(buttonVariants(), 'gap-1.5')}>
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </main>
    </div>
  )
}
