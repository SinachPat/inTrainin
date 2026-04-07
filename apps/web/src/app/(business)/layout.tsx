// Business admin shell — separate nav from learner shell.
// TODO Layer 6: replace placeholder with BusinessNav component.
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <span className="text-sm font-semibold text-primary">InTrainin Business</span>
        {/* TODO Layer 6: BusinessNav */}
      </div>
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  )
}
