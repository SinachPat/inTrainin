// Public route — no auth required.
// Anyone with a shareable certificate link lands here.
import Link from 'next/link'
import { Award, CheckCircle2, XCircle, ExternalLink, Share2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface CertificateData {
  verificationCode: string
  issuedAt: string
  learner: { id: string; full_name: string } | null
  role: { id: string; slug: string; title: string } | null
}

interface Props {
  params: Promise<{ code: string }>
}

async function fetchCertificate(code: string): Promise<CertificateData | null> {
  try {
    const res = await fetch(`${API_URL}/certificates/verify/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json() as { success: boolean; data?: { certificate: CertificateData } }
    return json.success ? json.data!.certificate : null
  } catch {
    return null
  }
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { code } = await params
  const cert = await fetchCertificate(code)

  if (!cert) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Certificate not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The verification code <span className="font-mono text-xs">{code.slice(0, 12)}…</span> did not match any issued certificate.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-left space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Possible reasons</p>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>The link or code was copied incorrectly</li>
              <li>The certificate has been revoked</li>
              <li>The code has not been issued by InTrainin</li>
            </ul>
          </div>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            Back to InTrainin
          </Link>
        </div>
      </div>
    )
  }

  const holderName = cert.learner?.full_name ?? 'Unknown'
  const roleTitle  = cert.role?.title ?? 'Unknown Role'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Verified banner */}
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
          <p className="text-sm font-medium text-green-700">Verified certificate</p>
        </div>

        {/* Certificate card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">

          {/* Visual preview */}
          <div className="relative flex h-52 items-center justify-center bg-linear-to-br from-primary/12 via-primary/6 to-transparent px-8 py-8">
            {/* Decorative corner rings */}
            <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-br-full border-b border-r border-primary/10" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-tl-full border-l border-t border-primary/10" />

            <div className="text-center relative z-10">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/30 bg-card shadow-sm">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                InTrainin Certificate of Completion
              </p>
              <p className="mt-2 font-heading text-lg font-bold text-foreground">{roleTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">awarded to</p>
              <p className="mt-0.5 font-heading text-xl font-bold text-foreground">{holderName}</p>
            </div>
          </div>

          {/* Details */}
          <div className="divide-y divide-border/60 px-6 py-4 space-y-0">
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-muted-foreground">Role</p>
              <Badge variant="secondary" className="text-[10px]">{roleTitle}</Badge>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-muted-foreground">Date issued</p>
              <p className="text-sm font-medium">{formatDate(cert.issuedAt)}</p>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-muted-foreground">Verification ID</p>
              <p className="font-mono text-xs text-muted-foreground">
                {cert.verificationCode.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center justify-between py-3">
              <p className="text-xs text-muted-foreground">Issued by</p>
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[9px] font-bold text-primary-foreground">
                  IT
                </span>
                <p className="text-sm font-medium">InTrainin</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border px-6 py-4">
            <button className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 gap-1.5 justify-center')}>
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 gap-1.5 justify-center')}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Visit InTrainin
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          This certificate was issued by InTrainin and can be shared publicly.
          The verification code confirms its authenticity.
        </p>
      </div>
    </div>
  )
}
