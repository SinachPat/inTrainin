'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Award, Share2, Download, ExternalLink, BookOpen, Check, Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { api, ApiError } from '@/lib/api'
import { getSession } from '@/lib/auth'

interface Certificate {
  id: string
  verification_code: string
  issued_at: string
  is_revoked: boolean
  roles: { id: string; slug: string; title: string } | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

function CertShareActions({ cert, holderName }: { cert: Certificate; holderName: string }) {
  const [copied,       setCopied]       = useState(false)
  const [downloading,  setDownloading]  = useState(false)
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://intrainin.com'}/verify/${cert.verification_code}`

  function shareWhatsApp() {
    const text = `I just earned my ${cert.roles?.title ?? 'InTrainin'} certificate! 🎓\nVerify it here: ${verifyUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = verifyUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fetch the server-generated PNG and trigger a browser file download.
  // We use fetch + blob URL rather than a plain <a href> so we can attach the
  // auth token (the image endpoint is protected) and show a loading indicator.
  async function handleDownload() {
    setDownloading(true)
    try {
      const token = localStorage.getItem('intrainin_access_token') ?? ''
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/certificates/${cert.id}/image`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!res.ok) throw new Error('Download failed')
      const blob    = await res.blob()
      const url     = URL.createObjectURL(blob)
      const a       = document.createElement('a')
      const safeName = (cert.roles?.title ?? 'certificate').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      a.href     = url
      a.download = `intrainin-certificate-${safeName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // silent — user can retry
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/verify/${cert.verification_code}`}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 justify-center gap-1.5')}
      >
        <ExternalLink className="h-3.5 w-3.5" /> Verify
      </Link>
      <button
        onClick={shareWhatsApp}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 justify-center gap-1.5')}
      >
        <Share2 className="h-3.5 w-3.5" /> WhatsApp
      </button>
      <button
        onClick={copyLink}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 justify-center gap-1.5')}
      >
        {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : 'Copy link'}
      </button>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={cn(buttonVariants({ size: 'sm' }), 'flex-1 justify-center gap-1.5')}
      >
        {downloading
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
          : <><Download className="h-3.5 w-3.5" /> Download PNG</>}
      </button>
    </div>
  )
}

export default function CertificatesPage() {
  const [certs, setCerts]   = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const holderName = getSession()?.fullName ?? ''

  useEffect(() => {
    api.get<{ success: boolean; data: { certificates: Certificate[] } }>('/certificates')
      .then(res => setCerts(res.data.certificates))
      .catch(e => { if (e instanceof ApiError && e.status === 401) window.location.replace('/login') })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:space-y-7 md:py-8 md:px-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">My Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass the Final Exam for any role to earn a verifiable certificate.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}
        </div>
      )}

      {!loading && certs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map(cert => (
            <div key={cert.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="relative flex h-40 items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6">
                <div className="text-center">
                  <Award className="mx-auto mb-2 h-10 w-10 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">InTrainin Certificate</p>
                  <p className="mt-1 font-heading text-lg font-bold text-foreground">{cert.roles?.title ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{holderName}</p>
                </div>
                <div className="absolute right-3 top-3">
                  <Badge variant="secondary" className="text-[10px]">Verified</Badge>
                </div>
              </div>

              <div className="border-t border-border px-4 py-3 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Issued {formatDate(cert.issued_at)}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    ID: {cert.verification_code.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <CertShareActions cert={cert} holderName={holderName} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && certs.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Award className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-base font-semibold text-foreground">No certificates yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete all modules and pass the Final Exam for any role to earn your first certificate.
          </p>
        </div>
      )}

      {/* Explore more roles */}
      <section className="rounded-xl border border-border bg-muted px-5 py-5 text-center">
        <BookOpen className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Earn more certificates</p>
        <p className="mt-1 text-xs text-muted-foreground">Explore 15+ roles across 7 categories</p>
        <Link href="/explore" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3')}>
          Browse roles
        </Link>
      </section>
    </div>
  )
}
