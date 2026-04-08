import Link from 'next/link'
import { Award, Share2, Download, ExternalLink, BookOpen } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MOCK_CERTIFICATES, MOCK_ENROLLMENTS, MOCK_ROLES, getRoleBySlug, computeRoleProgress } from '@/lib/mock-data'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function CertificatesPage() {
  const hasCerts = MOCK_CERTIFICATES.length > 0

  // In-progress courses without certs
  const inProgressEnrollments = MOCK_ENROLLMENTS.filter(enr => {
    const alreadyCertified = MOCK_CERTIFICATES.some(c => c.roleSlug === enr.roleSlug)
    return !alreadyCertified
  })

  return (
    <div className="mx-auto max-w-3xl space-y-7 px-4 py-8 md:px-10">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">My Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pass the Final Exam for any role to earn a verifiable certificate.
        </p>
      </div>

      {hasCerts ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCK_CERTIFICATES.map(cert => (
            <div
              key={cert.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              {/* Certificate preview */}
              <div className="relative flex h-40 items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-6">
                <div className="text-center">
                  <Award className="mx-auto mb-2 h-10 w-10 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">InTrainin Certificate</p>
                  <p className="mt-1 font-heading text-lg font-bold text-foreground">{cert.roleTitle}</p>
                  <p className="text-xs text-muted-foreground">{cert.holderName}</p>
                </div>
                <div className="absolute right-3 top-3">
                  <Badge variant="secondary" className="text-[10px]">{cert.roleCategory}</Badge>
                </div>
              </div>

              <div className="border-t border-border px-4 py-3 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Issued {formatDate(cert.issuedAt)}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    ID: {cert.verificationCode.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/verify/${cert.verificationCode}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 justify-center gap-1.5')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Verify
                  </Link>
                  <button className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1 justify-center gap-1.5')}>
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                  <button className={cn(buttonVariants({ size: 'sm' }), 'flex-1 justify-center gap-1.5')}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
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

      {/* Courses in progress */}
      {inProgressEnrollments.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-base font-semibold">Courses in progress</h2>
          {inProgressEnrollments.map(enr => {
            const role = getRoleBySlug(enr.roleSlug)
            if (!role) return null
            const { completedTopics, totalTopics } = computeRoleProgress(role, enr)
            const pct = Math.round((completedTopics / totalTopics) * 100)
            const allModuleTestsPassed = role.modules.every(m => enr.passedTestIds.includes(m.test.id))
            const readyForExam = completedTopics === totalTopics && !allModuleTestsPassed

            return (
              <Card key={enr.id} size="sm">
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <span className="text-2xl leading-none">{role.icon}</span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{role.title}</p>
                      <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {completedTopics}/{totalTopics} topics
                      {readyForExam && ' · Ready for Final Exam!'}
                    </p>
                  </div>
                  <Link
                    href={readyForExam ? `/learn/${enr.roleSlug}/test/${role.finalExam.id}` : `/learn/${enr.roleSlug}`}
                    className={cn(buttonVariants({ size: 'xs', variant: readyForExam ? 'default' : 'outline' }), 'shrink-0')}
                  >
                    {readyForExam ? 'Take Exam' : 'Continue'}
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}

      {/* Explore more roles */}
      <section className="rounded-xl border border-border bg-muted px-5 py-5 text-center">
        <BookOpen className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Earn more certificates</p>
        <p className="mt-1 text-xs text-muted-foreground">Explore 15+ roles across 7 categories</p>
        <Link href="/roles" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-3')}>
          Browse roles
        </Link>
      </section>
    </div>
  )
}
