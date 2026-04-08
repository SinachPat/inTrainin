import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROLES, getTotalTopics } from "@/lib/roles";

const CATEGORIES = [...new Set(ROLES.map((r) => r.category))];

export default function RolesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-8">

      {/* Header */}
      <div className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Role Catalogue
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {ROLES.length} roles. One platform.
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Every curriculum is structured into modules, topics, and a final certification exam.
          Pick your role, complete Module 1 free, and enrol for the full course when you&apos;re ready.
        </p>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        <span className="rounded-full border border-primary bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
          All categories
        </span>
        {CATEGORIES.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Link
            key={role.slug}
            href={`/roles/${role.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-background p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <span className="text-2xl leading-none">{role.icon}</span>
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                {role.category}
              </span>
            </div>
            <h2 className="mb-1.5 text-[15px] font-semibold text-foreground transition-colors group-hover:text-primary">
              {role.title}
            </h2>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
              {role.description}
            </p>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <BookOpen className="size-3 shrink-0" />
                {role.modules.length} modules · {getTotalTopics(role)} topics
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{role.price}</span>
                <span className="rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                  Enroll
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-xl border border-border bg-muted/40 px-6 py-8 text-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Coming soon
        </p>
        <p className="mb-4 text-lg font-bold text-foreground">
          40+ roles planned across 7 categories
        </p>
        <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
          New role curricula are added regularly. Module 1 of every role is always free —
          no account required to preview.
        </p>
        <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
          Get notified when new roles launch
        </Link>
      </div>

    </div>
  );
}
