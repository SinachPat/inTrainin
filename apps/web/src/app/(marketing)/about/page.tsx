import Link from "next/link";
import { ArrowRight, Check, Users, BookOpen, Award, Briefcase, MapPin, Target, Lightbulb, Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/marketing/page-shell";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About InTrainin"
      title="Training that translates to employment outcomes"
      description="InTrainin is a role-based learning platform purpose-built for informal sector workers and the employers who hire them. We turn the gap between raw talent and verifiable skill into a bridge — one structured curriculum at a time."
    >

      {/* ── The Problem ──────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Why InTrainin exists
        </p>
        <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground">
          Nigeria&apos;s largest workforce has no proof of skill.
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Nigeria&apos;s informal sector employs over <strong className="text-foreground">60 million people</strong> — cashiers, store attendants, waiters, dispatch riders, receptionists, and more. These workers show up every day and do the job. Many have been doing it for years.
            </p>
            <p>
              But there is no standard way to prove it. When a cashier who has handled a POS machine for three years applies for a better job, they present nothing but a verbal claim. The employer either spends weeks discovering the truth on the job — or passes on the candidate entirely.
            </p>
            <p>
              For employers, every new hire is a gamble. Onboarding costs ₦100,000–₦200,000 in supervisor time before a worker can operate independently. Turnover makes the problem worse.
            </p>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Formal training institutions exist, but they are expensive, location-dependent, and disconnected from the specific operational procedures of real jobs. A waiter at a fast-food chain and a waiter at a hotel are trained to different standards — classroom curricula don&apos;t capture that.
            </p>
            <p>
              The result: millions of capable workers are invisible to the labour market, and thousands of employers burn money training people who could have arrived ready.
            </p>
            <p className="font-medium text-foreground">
              InTrainin is the infrastructure that fixes this.
            </p>
          </div>
        </div>
      </section>

      {/* ── What We Do ───────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          The platform
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Three things. One outcome.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              step: "01",
              title: "Structured learning",
              desc: "Every role has a purpose-built curriculum: Modules, Topics, Guides, Case Studies, and Workflows — all in a fixed learning sequence. Nothing can be skipped. Progress is saved at the topic level so learners can return exactly where they left off, even on a slow mobile connection.",
            },
            {
              icon: Award,
              step: "02",
              title: "Verifiable certification",
              desc: "Complete all modules and pass the Final Exam, and a digital certificate is generated instantly. Every certificate has a unique verification ID and a public URL. Employers confirm it in seconds — no calls to anyone, no admin steps needed.",
            },
            {
              icon: Briefcase,
              step: "03",
              title: "Passive job matching",
              desc: "Certified workers subscribe to Job Hub and set their profile once — role preference, location, availability. When an employer posts a matching hire request, an alert arrives by push notification and SMS. Accept or decline from your phone.",
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                  {step}
                </div>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="mb-1.5 text-base font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who We Serve ─────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Who we serve
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Built for two sides of the same market.
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <Users className="size-5 text-muted-foreground" />
              <p className="font-semibold text-foreground">Workers</p>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Anyone in or entering a service-sector role — cashiers, waiters, store attendants, baristas, dispatch riders, receptionists, security guards, hairdressers, and more. People who have the skills but no way to prove it, or people who want to break into a new role and need a clear path.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "Pick a role and start learning — Module 1 is always free",
                "Complete the curriculum at your own pace, on your phone",
                "Pass the Final Exam and earn a verifiable digital certificate",
                "Subscribe to Job Hub to get matched with employers passively",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <Briefcase className="size-5 text-muted-foreground" />
              <p className="font-semibold text-foreground">Employers &amp; Businesses</p>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              SMEs, restaurant chains, supermarkets, hotels, logistics companies, and any business that hires service-sector workers at scale. Businesses that want new hires to arrive ready, and want to stop paying for the same induction training repeatedly.
            </p>
            <ul className="flex flex-col gap-2">
              {[
                "Assign role curricula to workers before they start",
                "Track progress, module completion, and test scores per worker",
                "Get alerts when a worker falls behind schedule",
                "Post hire requests and access the certified candidate pool",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Our Approach ─────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Our approach
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Designed for the real conditions of the market.
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Role-specific, not generic",
              desc: "Every curriculum is built around a specific job title with its specific operational requirements — not general \"customer service\" principles that don't translate to a shift at a fast-food counter.",
            },
            {
              icon: Lightbulb,
              title: "Mobile-first, low-bandwidth",
              desc: "Learners access InTrainin on entry-level Android phones, often on unstable data connections. Content is text-light, progress is saved at every step, and audio read-aloud reduces literacy barriers.",
            },
            {
              icon: BookOpen,
              title: "Linear progression by design",
              desc: "Topics unlock in sequence. You can't skip to the Final Exam without completing the work. This isn't a restriction — it's what makes the certificate mean something.",
            },
            {
              icon: Award,
              title: "Certification with real weight",
              desc: "A certificate is only as valuable as the standard it represents. Our pass marks, exam design, and revocation policy are intentionally strict so that employers trust what they see.",
            },
            {
              icon: Users,
              title: "Two-sided marketplace",
              desc: "We serve workers and employers simultaneously. This means our content quality is held accountable by the employers who use the certificates, and our job matching is powered by real demand.",
            },
            {
              icon: MapPin,
              title: "Nigeria first, then West Africa",
              desc: "Phase 1 covers Lagos, Abuja, Enugu, Kano, and Port Harcourt. Phase 2 expands nationally. International expansion into Ghana, Kenya, and Uganda follows product-market fit in Nigeria.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What we believe
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Our operating principles.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Proof over promise",
              desc: "We don't give out certificates to everyone who shows up. The pass mark is the pass mark. A certificate from InTrainin means something because we refuse to inflate it.",
            },
            {
              title: "Access over prestige",
              desc: "The platform should work for a dispatch rider in Kano on a ₦5,000 Nokia as well as it does for a manager in Lagos on a MacBook. If it doesn't, we haven't done our job.",
            },
            {
              title: "Outcomes, not completion",
              desc: "A learner who finishes a course and gets a job has succeeded. A learner who finishes a course and doesn't have better opportunities has not. We measure employment outcomes, not completion rates.",
            },
            {
              title: "Employer trust is earned",
              desc: "Businesses pay us to surface ready candidates. That trust is only worth something if our standards are real. We are accountable to both sides of this market, which is the hardest thing to maintain — and the most important.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-background p-5">
              <div className="mb-2 flex items-center gap-2">
                <Heart className="size-4 shrink-0 text-primary" />
                <p className="text-sm font-semibold text-foreground">{title}</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roadmap ──────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Where we&apos;re headed
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Phased expansion into the full employment lifecycle.
        </h2>
        <div className="flex flex-col gap-0">
          {[
            {
              phase: "Phase 1 — Now live",
              label: "Core platform",
              items: [
                "15 roles across 7 industry categories",
                "Full learning engine with module tests and final exams",
                "Verifiable digital certificate system",
                "Job Hub — passive matching for workers and hire requests for employers",
                "5 cities: Lagos, Abuja, Enugu, Kano, Port Harcourt",
              ],
              active: true,
            },
            {
              phase: "Phase 2",
              label: "Depth and engagement",
              items: [
                "XP system, streaks, and advanced badge mechanics",
                "In-app messaging between matched workers and employers",
                "Career roadmap — role progression paths and suggested next certifications",
                "National rollout across all 36 states",
              ],
              active: false,
            },
            {
              phase: "Phase 3",
              label: "Ecosystem expansion",
              items: [
                "Employer-customisable curricula for specific operational standards",
                "B2B2C: employers fund learner access as part of pre-employment process",
                "Ghana, Kenya, Uganda market entry",
                "API for third-party HR tools and ATS integration",
              ],
              active: false,
            },
          ].map((item, i) => (
            <div key={item.phase} className={cn("relative ml-4 flex gap-5 pb-8 last:pb-0", i < 2 && "border-l border-border")}>
              <div className={cn(
                "absolute -left-2.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold",
                item.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
              )}>
                {i + 1}
              </div>
              <div className="ml-6">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{item.phase}</p>
                  {item.active && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                      Live
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">· {item.label}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {item.items.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className={cn("mt-0.5 size-3.5 shrink-0", item.active ? "text-primary" : "text-muted-foreground/50")} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-primary p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
          Get started today
        </p>
        <h2 className="mb-3 text-2xl font-bold text-primary-foreground">
          Ready to train, certify, and get hired?
        </h2>
        <p className="mb-6 max-w-lg text-sm text-primary-foreground/80">
          Module 1 of every role is free — no payment, no account needed to start. See for yourself what structured role-based learning feels like.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/roles" className={cn(buttonVariants({ size: "sm" }), "bg-foreground text-background hover:bg-foreground/80")}>
            Browse roles <ArrowRight className="ml-1 size-3.5" />
          </Link>
          <Link href="/business" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/20 hover:border-primary-foreground/80")}>
            For businesses
          </Link>
        </div>
      </section>

    </PageShell>
  );
}
