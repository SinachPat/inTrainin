import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Users,
  BookOpen,
  Award,
  Briefcase,
  TrendingUp,
  Bell,
  Shield,
  Star,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/marketing/page-shell";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ENTERPRISE_FEATURES = [
  {
    icon: BookOpen,
    title: "Assign curricula before Day 1",
    desc: "Send workers a link to their role curriculum before they step through the door. They arrive having already worked through the fundamentals — your floor time goes to practice, not explanation.",
  },
  {
    icon: Users,
    title: "Bulk enrollment via CSV",
    desc: "Upload a spreadsheet of names and phone numbers and enrol your entire team into the right curriculum in one step. No manual account creation, no individual invitations.",
  },
  {
    icon: TrendingUp,
    title: "Per-worker progress tracking",
    desc: "See exactly which module each worker is on, their test scores, their completion percentage, and when they last logged in — from one dashboard view.",
  },
  {
    icon: Bell,
    title: "Lagging worker alerts",
    desc: "Set a pace threshold and get notified when a worker falls behind. Catch slow learners early — before they become a liability on the floor.",
  },
  {
    icon: Award,
    title: "Hire from the certified candidate pool",
    desc: "Post a hire request with your role, location, pay range, and requirements. Certified candidates who match are surfaced instantly, ranked by relevance score and certification status.",
  },
  {
    icon: Shield,
    title: "Seat management & billing",
    desc: "Add or remove team members as you hire and offboard. Billing adjusts automatically. Track renewals, usage, and cost per seat from the account dashboard.",
  },
];

const PLANS = [
  {
    name: "Starter",
    seats: "5 seats",
    price: "₦15,000",
    period: "/month",
    annual: "₦120,000/yr",
    features: [
      "5 worker seats",
      "Unlimited curriculum assignments",
      "Progress tracking per worker",
      "Lagging worker alerts",
      "1 hire request active at a time",
      "Email support",
    ],
  },
  {
    name: "Growth",
    seats: "20 seats",
    price: "₦45,000",
    period: "/month",
    annual: "₦360,000/yr",
    features: [
      "20 worker seats",
      "CSV bulk enrollment",
      "Full analytics dashboard",
      "Up to 5 active hire requests",
      "Candidate shortlisting & messaging",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Scale",
    seats: "50+ seats",
    price: "Custom",
    period: "",
    annual: "",
    features: [
      "50+ seats (negotiated)",
      "Dedicated account manager",
      "Custom curriculum content",
      "API access for HR integrations",
      "SLA-backed uptime guarantee",
      "Onboarding & training session",
    ],
  },
];

const STEPS = [
  { num: "01", title: "Sign up as a business", desc: "Create your business account at intrainin.com/signup. Profile setup takes under 3 minutes." },
  { num: "02", title: "Add your team", desc: "Manually add workers by phone number, or upload a CSV to bulk-enrol your entire team in one go." },
  { num: "03", title: "Assign curricula", desc: "Choose a role curriculum for each worker. They receive an SMS with their learning link and can start immediately." },
  { num: "04", title: "Track and manage", desc: "Your dashboard updates in real time as workers progress through modules and complete tests." },
  { num: "05", title: "Post hire requests", desc: "When you need to recruit, post a hire request. Certified candidates who match your criteria are surfaced automatically." },
];

const TESTIMONIALS = [
  {
    quote: "My new hires used to need two weeks of hand-holding before they could work a shift alone. Now I assign them the curriculum before Day 1. They arrive knowing the job. The difference is real.",
    name: "Chukwudi A.",
    title: "Supermarket Owner · Abuja",
  },
  {
    quote: "We enrolled 12 cashiers in one afternoon using the CSV upload. Within three weeks, eight of them had completed the curriculum. Our till discrepancies dropped noticeably that month.",
    name: "Ngozi E.",
    title: "Retail Chain Operations Manager · Lagos",
  },
];

const FAQ = [
  {
    q: "Do workers need a smartphone?",
    a: "Any phone with a web browser can access InTrainin. The platform is optimised for basic Android devices and slow mobile connections. Audio read-aloud is available for lower-literacy learners.",
  },
  {
    q: "What happens if a worker I enrolled leaves?",
    a: "You can remove them from your team at any time from the dashboard. Their seat is freed up and can be reassigned to a new hire immediately.",
  },
  {
    q: "Can I create custom curricula for my specific procedures?",
    a: "Custom curriculum content is available on the Scale plan. We work with your operations team to build role-specific modules that reflect your exact standards and workflows.",
  },
  {
    q: "How does Job Hub hiring work?",
    a: "You post a hire request with the role, location, pay range, and any certification or experience requirements. Our system surfaces certified workers who match your criteria. You see their certification status, location, and availability. Workers accept or decline the match — if they accept, you can proceed to interview.",
  },
  {
    q: "Is the Enterprise package separate from individual learning?",
    a: "Yes. Workers you enrol under your Enterprise seat are separate from workers who buy their own access. You pay the Enterprise fee and your workers learn under your team plan at no additional cost to them.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  return (
    <PageShell
      eyebrow="For Businesses"
      title="Train your workforce. Hire with confidence."
      description="InTrainin gives businesses the tools to onboard workers with structured role-based training before Day 1, monitor progress in real time, and hire from a pool of pre-certified candidates — all from one dashboard."
    >

      {/* ── The Cost of Unverified Hiring ────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          The problem we solve
        </p>
        <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground">
          Every unverified hire costs you more than you think.
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              The average Nigerian SME spends <strong className="text-foreground">₦100,000–₦200,000</strong> in supervisor time getting a new service-sector worker to operate independently. That is before accounting for mistakes, till discrepancies, customer complaints, or the cost of re-hiring when the worker leaves.
            </p>
            <p>
              Most of that cost comes from one thing: workers arrive with no verified foundation. You don&apos;t know what they know. You discover the gaps on the floor — with real customers, real products, and real consequences.
            </p>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              InTrainin shifts that cost. Workers complete a structured, tested curriculum for their specific role before they start. By the time they walk in, they have already been through POS procedures, service standards, safety protocols, and shift handover processes — and they have passed a test to prove it.
            </p>
            <p className="font-medium text-foreground">
              Your floor time goes to practice and mentorship, not basic induction.
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What you get
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Everything a growing business needs.
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ENTERPRISE_FEATURES.map(({ icon: Icon, title, desc }) => (
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

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Getting started
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Up and running in under an hour.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <div key={step.num} className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {step.num}
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Pricing
        </p>
        <h2 className="mb-2 text-2xl font-bold leading-tight text-foreground">
          Plans that scale with your team.
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          All plans include full curriculum access, progress tracking, and Job Hub posting. Cancel anytime.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-xl border p-5",
                plan.highlight ? "border-primary bg-primary" : "border-border bg-background"
              )}
            >
              <div className="mb-4">
                {plan.highlight && (
                  <Badge variant="secondary" className="mb-3 bg-background/20 text-primary-foreground">
                    Most popular
                  </Badge>
                )}
                <p className={cn("mb-0.5 text-[10px] font-semibold uppercase tracking-widest", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {plan.name} · {plan.seats}
                </p>
                <div className="flex items-end gap-1">
                  <span className={cn("text-3xl font-bold", plan.highlight ? "text-primary-foreground" : "text-foreground")}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn("mb-1 text-sm", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {plan.period}
                    </span>
                  )}
                </div>
                {plan.annual && (
                  <p className={cn("mt-1 text-xs", plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {plan.annual} billed annually
                  </p>
                )}
              </div>
              <Link
                href="/signup?type=business"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "mb-5 justify-center",
                  plan.highlight ? "bg-background text-primary hover:bg-background/90" : ""
                )}
              >
                {plan.price === "Custom" ? "Talk to us" : "Get started"}
              </Link>
              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={cn("mt-0.5 size-4 shrink-0", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")} />
                    <span className={plan.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Need fewer than 5 seats? Workers can purchase individual role access at ₦2,500 per role — you can reimburse them directly.
        </p>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          What employers say
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Real outcomes from real businesses.
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-primary text-primary" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Job Hub for Businesses ───────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Job Hub
        </p>
        <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground">
          Hire pre-certified candidates — without the search.
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Job Hub flips the traditional hiring process. Instead of posting a job, waiting for applications, and sifting through unverified CVs, you post a hire request with your role requirements — and we surface candidates who have already proven they can do the job.
            </p>
            <p>
              Every candidate in the pool has completed the InTrainin curriculum for their role and passed the Final Exam. Their profile shows their certification, location, availability, and match score against your request. You shortlist, they accept — and you go straight to interview.
            </p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {[
              "Post a hire request in under 2 minutes",
              "Set role, location, pay range, and certification requirements",
              "See ranked candidates instantly — no waiting period",
              "Certified candidates ranked above uncertified ones",
              "Shortlist candidates and request interviews from the dashboard",
              "Included in all Enterprise plans at no extra cost",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Common questions
        </p>
        <h2 className="mb-6 text-2xl font-bold leading-tight text-foreground">
          Frequently asked questions.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-border bg-background p-5">
              <p className="mb-2 text-sm font-semibold text-foreground">{q}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-primary p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
          Ready to start?
        </p>
        <h2 className="mb-3 text-2xl font-bold text-primary-foreground">
          Your next hire arrives trained.
        </h2>
        <p className="mb-6 max-w-lg text-sm text-primary-foreground/80">
          Sign up for a business account in minutes. The Starter plan covers 5 workers and one active hire request. No contract required — cancel anytime.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup?type=business" className={cn(buttonVariants({ size: "sm" }), "bg-background text-primary hover:bg-background/90")}>
            Create business account <ArrowRight className="ml-1 size-3.5" />
          </Link>
          <Link href="/hire" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10")}>
            Post a hire request
          </Link>
        </div>
      </section>

    </PageShell>
  );
}
