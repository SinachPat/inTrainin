// Public route — no auth required.
// Anyone with a certificate link lands here.
interface Props {
  params: Promise<{ code: string }>
}

export default async function VerifyCertificatePage({ params }: Props) {
  const { code } = await params
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="h-1.5 rounded-full bg-primary" />
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          InTrainin Certificate
        </p>
        <h1 className="text-2xl font-bold text-foreground">Verification</h1>
        <p className="text-sm text-muted-foreground">Code: {code}</p>
        {/* TODO Layer 6: fetch cert from API, show holder name + role */}
      </div>
    </div>
  )
}
