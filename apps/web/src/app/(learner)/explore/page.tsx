import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ROLES, getTotalTopics } from "@/lib/roles";

const CATEGORIES = [...new Set(ROLES.map((r) => r.category))];

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 md:px-8">

      {/* Header */}
      <div className="mb-8 border-b border-border pb-6 md:mb-10 md:pb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Role Catalogue
        </p>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {ROLES.length} roles. One platform.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
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
            className="rounded-full border border-foreground/20 px-3.5 py-1.5 text-xs font-medium text-foreground/70 hover:border-foreground/30 hover:text-foreground transition-colors cursor-pointer"
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
            href={`/explore/${role.slug}`}
            className="group flex flex-col rounded-xl bg-card p-5 shadow-card transition-shadow hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <span className="text-2xl leading-none">{role.icon}</span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground/70">
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
      <div className="mt-8 rounded-xl border border-border bg-muted px-4 py-6 text-center md:mt-12 md:px-6 md:py-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Coming soon
        </p>
        <p className="mb-4 text-lg font-bold text-foreground">
          40+ roles planned across 7 categories
        </p>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          New role curricula are added regularly. Module 1 of every role is always free.
        </p>
      </div>

    </div>
  );
}
