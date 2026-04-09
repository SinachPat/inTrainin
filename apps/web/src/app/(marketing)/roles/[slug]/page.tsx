import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Award,
  Lock,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROLES, getRoleBySlug, getTotalTopics } from "@/lib/roles";

export function generateStaticParams() {
  return ROLES.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) return {};
  return {
    title: `${role.title} | InTrainin`,
    description: role.description,
  };
}

export default async function PublicRolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) notFound();

  const totalTopics = getTotalTopics(role);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10 md:px-8">

      {/* Back link */}
      <Link
        href="/roles"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 mb-5 text-muted-foreground")}
      >
        <ArrowLeft className="mr-1.5 size-3.5" />
        All roles
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px] lg:gap-10">

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:gap-10">

          {/* Role header */}
          <div className="border-b border-border pb-6 md:pb-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl leading-none md:text-4xl">{role.icon}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/70">
                {role.category}
              </span>
            </div>
            <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {role.title}
            </h1>
            <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {role.about}
            </p>
            {/* Stats bar */}
            <div className="flex flex-wrap gap-3 sm:gap-5">
              {[
                { icon: BookOpen, label: `${role.modules.length} modules` },
                { icon: CheckCircle2, label: `${totalTopics} topics` },
                { icon: Award, label: "Certificate on completion" },
                { icon: Zap, label: "XP & streak rewards" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <Icon className="size-3.5 shrink-0 text-primary sm:size-4" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* What you'll learn */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-foreground">What you&apos;ll learn</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {role.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          {/* Curriculum */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-foreground">Curriculum</h2>
            <div className="flex flex-col gap-3">
              {role.modules.map((mod, i) => {
                const isFree = i === 0;
                const isLocked = i > 1;
                return (
                  <div
                    key={mod.num}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4",
                      isFree
                        ? "border-primary/30 bg-card shadow-card"
                        : "border-border bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isFree
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {mod.num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-semibold", isLocked ? "text-muted-foreground" : "text-foreground")}>
                        {mod.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{mod.topics} topics</p>
                    </div>
                    {isFree ? (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground">
                        Free preview
                      </span>
                    ) : isLocked ? (
                      <Lock className="size-4 shrink-0 text-muted-foreground" />
                    ) : null}
                  </div>
                );
              })}

              {/* Final exam row */}
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Award className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Final Certification Exam</p>
                  <p className="text-xs text-muted-foreground">
                    Unlocks after all module tests are passed · 75% pass mark required
                  </p>
                </div>
                <Lock className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Certificate section */}
          <div className="rounded-xl border border-border bg-muted px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card shadow-card">
                <Award className="size-5 text-primary" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-foreground">
                  Earn a verifiable certificate
                </p>
                <p className="text-sm text-muted-foreground">
                  Pass the Final Exam and your{" "}
                  <strong className="text-foreground">{role.title}</strong> certificate is generated
                  instantly — with a unique verification ID that employers can check at{" "}
                  <span className="font-mono text-xs">intrainin.com/verify</span>. Share via
                  WhatsApp, LinkedIn, or direct link.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Sticky sidebar CTA ───────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-xl bg-card shadow-card">
            <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
              <div className="mb-1 flex items-end gap-1.5">
                <span className="text-2xl font-bold text-foreground sm:text-3xl">{role.price}</span>
                <span className="mb-1 text-sm text-muted-foreground">one-time</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full curriculum · module tests · certificate
              </p>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">
              <Link
                href={`/signup`}
                className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
              >
                Enroll — {role.price}
                <ArrowRight className="ml-1 size-4" />
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}
              >
                Try Module 1 free
              </Link>
              <p className="text-center text-xs text-muted-foreground">
                No subscription · one payment · access forever
              </p>
            </div>

            <div className="border-t border-border px-4 py-4 sm:px-6 sm:py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                This course includes
              </p>
              <ul className="flex flex-col gap-2.5">
                {[
                  `${role.modules.length} modules, ${totalTopics} topics`,
                  "Module tests with 70% pass mark",
                  "Final Certification Exam",
                  "Verifiable digital certificate",
                  "Audio read-aloud (English)",
                  "Progress saved — resume anytime",
                  "XP points and streak rewards",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Related roles */}
      <div className="mt-10 border-t border-border pt-8 md:mt-16 md:pt-10">
        <h2 className="mb-4 text-lg font-bold text-foreground md:mb-6 md:text-xl">More roles to explore</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.filter((r) => r.slug !== slug)
            .slice(0, 3)
            .map((r) => (
              <Link
                key={r.slug}
                href={`/roles/${r.slug}`}
                className="group flex items-center gap-3 rounded-xl bg-card p-4 shadow-card transition-shadow hover:shadow-md"
              >
                <span className="text-2xl leading-none">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                    {r.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.category}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
        </div>
      </div>

    </div>
  );
}
