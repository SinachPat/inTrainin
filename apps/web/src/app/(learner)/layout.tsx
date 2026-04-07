// Learner app shell — persistent nav + content area.
// TODO Layer 6: replace placeholder with LearnerNav component.
export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <span className="text-sm font-semibold text-primary">InTrainin</span>
        {/* TODO Layer 6: LearnerNav */}
      </div>
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  )
}
