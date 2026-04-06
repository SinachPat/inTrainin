import Link from "next/link";
import {
  ArrowRight,
  Check,
  BookOpen,
  Award,
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  CheckCircle2,
  Lock,
  MapPin,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeatureTabs } from "@/components/marketing/feature-tabs";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const CITIES = ["Lagos", "Abuja", "Enugu", "Kano", "Port Harcourt"];

const STATS = [
  { value: "15+", label: "Roles available at launch" },
  { value: "7", label: "Industry categories" },
  { value: "40+", label: "Curricula planned" },
  { value: "5", label: "Cities in Phase 1" },
];

const TESTIMONIALS = [
  {
    quote:
      "I applied for five jobs with no luck. After I got my InTrainin certificate for Cashier, the next employer asked me zero experience questions — they just checked the link. I started the following Monday.",
    name: "Amara O.",
    title: "Cashier · Lagos",
  },
  {
    quote:
      "My new hires used to need two weeks of hand-holding before they could work a shift alone. Now I assign them the curriculum before Day 1. They arrive knowing the job. The difference is real.",
    name: "Chukwudi A.",
    title: "Supermarket Owner · Abuja",
  },
  {
    quote:
      "I have worked in hospitality for seven years with nothing to show for it on paper. The Waiter/Waitress certificate from InTrainin got me into an interview at a hotel chain I had applied to three times before.",
    name: "Fatima M.",
    title: "Waitress · Kano",
  },
];

const PRICING = [
  {
    name: "Individual Course",
    price: "₦2,500",
    period: "per role",
    description: "Full curriculum access for one role — modules, tests, and your certificate.",
    cta: "Browse roles",
    href: "/roles",
    features: [
      "Complete role curriculum",
      "Module tests + Final Exam",
      "Verifiable digital certificate",
      "Audio read-aloud",
      "Progress saved forever",
    ],
    highlight: false,
  },
  {
    name: "Job Hub",
    price: "₦1,000",
    period: "per month",
    description: "Passive job matching. Get alerts when employers post roles that fit your profile.",
    cta: "Start matching",
    href: "/job-hub",
    features: [
      "Passive job match alerts",
      "Push + SMS notifications",
      "Accept or decline from phone",
      "Certified candidates ranked first",
      "Annual plan: ₦8,000/yr",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₦15,000",
    period: "per month",
    description: "Train your entire team. Bulk enroll, track progress, and hire from one dashboard.",
    cta: "Talk to us",
    href: "/business",
    features: [
      "5 seats included (Starter)",
      "Assign curricula to workers",
      "CSV bulk enrollment",
      "Per-worker progress tracking",
      "Lagging worker alerts",
    ],
    highlight: false,
  },
];

const ROLE_CATEGORIES = [
  { icon: "🛒", label: "Retail & Store Ops" },
  { icon: "🍽️", label: "Food & Beverage" },
  { icon: "📣", label: "Sales & Marketing" },
  { icon: "🏨", label: "Hospitality & Facilities" },
  { icon: "📋", label: "Admin & Office Support" },
  { icon: "🚚", label: "Logistics & Delivery" },
  { icon: "✂️", label: "Beauty & Wellness" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden border-b border-border px-4 py-24 text-center md:py-32"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* Fade mask — removes dot grid at edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, var(--color-background) 100%)",
          }}
        />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          {/* Announcement badge */}
          <Link
            href="/roles"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-foreground" />
            Now live in Lagos, Abuja, Enugu, Kano & Port Harcourt
            <ChevronRight className="size-3" />
          </Link>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Get trained.{" "}
            <span className="text-muted-foreground">Get certified.</span>
            <br />
            Get hired.
          </h1>

          {/* Subheadline */}
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            InTrainin is the role-based learning platform for informal sector workers across
            Nigeria. Structured training, verifiable certificates, and direct job matching —
            built for the roles that matter.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/roles"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-foreground text-background hover:bg-foreground/90 px-6"
              )}
            >
              Start learning free
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link
              href="/roles"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "px-6"
              )}
            >
              View all roles
            </Link>
          </div>

          {/* Trust note */}
          <p className="text-xs text-muted-foreground">
            Free trial on Module 1 of any role. No card required.
          </p>
        </div>
      </section>

      {/* ── 2. CITY BAR ──────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-8 py-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Available in
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {CITIES.map((city) => (
              <span key={city} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3" />
                {city}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Phase 1 · Nigeria</p>
        </div>
      </section>

      {/* ── 3. FEATURE TABS ──────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="border-b border-border px-8 py-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              The Platform
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Three pillars. One outcome.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Every feature is built around the same goal: getting informal sector workers trained,
              certified, and into better employment faster.
            </p>
          </div>
          <FeatureTabs />
        </div>
      </section>

      {/* ── 4. ROLE CATEGORIES ───────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-8 py-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            7 categories · 40+ roles planned
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
            {ROLE_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background px-3 py-4 text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <p className="text-[11px] font-medium leading-snug text-muted-foreground">
                  {cat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. VISION QUOTE ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-foreground">
        <div className="mx-auto max-w-4xl px-8 py-20 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-background/50">
            Our Mission
          </p>
          <blockquote className="mt-6 text-xl font-medium leading-relaxed text-background md:text-2xl">
            "Every cashier, waiter, cleaner, and store attendant deserves structured training,
            portable proof of competence, and a fair shot at better employment — regardless of
            where they started."
          </blockquote>
        </div>
      </section>

      {/* ── 6. FEATURE: LEARNING ENGINE ──────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 md:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-8 border-b border-border px-8 py-16 md:border-b-0 md:border-r md:px-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Learning Engine
              </p>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
                It starts with a role
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Each role has a purpose-built curriculum: Modules → Topics → Guides → Case Studies
                → Workflows → Tests. Learners progress in sequence — nothing can be skipped, nothing
                is left to chance. Every piece of content is CMS-driven, so roles stay current
                without a code deployment.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: BookOpen,
                  title: "Structured progression",
                  desc: "Topics unlock in sequence within each module. Module tests unlock only after all topics are done.",
                },
                {
                  icon: Zap,
                  title: "Gamified motivation",
                  desc: "XP points, daily streaks, and milestone badges keep learners moving through the material.",
                },
                {
                  icon: TrendingUp,
                  title: "Resume anywhere",
                  desc: "Progress is saved at the topic level. Learners can close and return from exactly where they left off.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/roles"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-fit"
              )}
            >
              Explore role curricula <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>

          {/* Right — course progression visual */}
          <div className="flex items-center justify-center bg-muted/40 px-8 py-16 md:px-12">
            <div className="w-full max-w-sm space-y-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Cashier (Retail) · Curriculum
              </p>
              {[
                { num: 1, title: "Customer Service Foundations", topics: 5, done: true },
                { num: 2, title: "POS Systems & Payments", topics: 6, done: true },
                { num: 3, title: "Cash Handling & Reconciliation", topics: 6, active: true },
                { num: 4, title: "Store Policy & Compliance", topics: 4, locked: true },
                { num: 5, title: "Shift Operations & Handover", topics: 5, locked: true },
              ].map((mod) => (
                <div
                  key={mod.num}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                    mod.active
                      ? "border-foreground/20 bg-background shadow-sm"
                      : mod.done
                      ? "border-border bg-background"
                      : "border-border bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      mod.done
                        ? "bg-foreground text-background"
                        : mod.active
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {mod.done ? <Check className="size-3" /> : mod.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[12px] font-medium truncate",
                        mod.locked ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {mod.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{mod.topics} topics</p>
                  </div>
                  {mod.locked ? (
                    <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : mod.active ? (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-[9px] font-bold text-background">
                      In Progress
                    </span>
                  ) : null}
                </div>
              ))}
              <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  Final Certification Exam
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Unlocks after all module tests passed · 75% pass mark
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FEATURE: CERTIFICATION ────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 md:grid-cols-2">
          {/* Left — certificate visual */}
          <div className="flex items-center justify-center border-b border-border bg-muted/40 px-8 py-16 md:border-b-0 md:border-r md:px-12">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              {/* Certificate top */}
              <div className="flex flex-col items-center gap-3 px-8 py-10 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  InTrainin
                </p>
                <div className="h-px w-10 bg-border" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Certificate of Completion
                </p>
                <div className="mt-2">
                  <p className="text-[11px] text-muted-foreground">This certifies that</p>
                  <p className="mt-1 text-xl font-bold text-foreground">Amara Okafor</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    has successfully completed
                  </p>
                  <p className="mt-1 text-base font-bold text-foreground">Cashier (Retail)</p>
                </div>
              </div>

              {/* Certificate footer */}
              <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3">
                <div>
                  <p className="text-[9px] text-muted-foreground">Issued</p>
                  <p className="text-[11px] font-semibold text-foreground">April 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground">Verification ID</p>
                  <p className="font-mono text-[11px] font-semibold text-foreground">
                    IT-2026-84921
                  </p>
                </div>
              </div>

              {/* Verification note */}
              <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                <Shield className="size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">
                  Publicly verifiable at intrainin.com/verify/IT-2026-84921
                </p>
              </div>
            </div>
          </div>

          {/* Right — copy */}
          <div className="flex flex-col justify-center gap-8 px-8 py-16 md:px-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Certification System
              </p>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
                Proof that speaks for itself
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pass the Final Exam and a verifiable digital certificate is generated instantly.
                No admin approval, no waiting. Share it on WhatsApp with a job application, post
                it on LinkedIn, or give an employer the verification link to confirm it in seconds.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Award,
                  title: "Auto-generated on exam pass",
                  desc: "No manual step needed. The certificate is created the moment the final exam is passed.",
                },
                {
                  icon: Shield,
                  title: "Publicly verifiable",
                  desc: "Every certificate has a unique ID and a public URL. Employers verify in seconds.",
                },
                {
                  icon: Users,
                  title: "Share everywhere",
                  desc: "WhatsApp (primary), LinkedIn, direct link copy, or download as PNG to your device.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/roles"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
            >
              See available certifications <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. FEATURE: JOB HUB ──────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 md:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-8 border-b border-border px-8 py-16 md:border-b-0 md:border-r md:px-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Job Hub
              </p>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
                Grow with passive matching
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Job Hub connects certified workers with employers who have posted hiring requests.
                Workers subscribe and set their profile once — location, role preference,
                availability. When a match is posted, an alert arrives via push notification and
                SMS. Accept or decline from your phone.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Zap,
                  title: "Certified candidates ranked first",
                  desc: "Employers see InTrainin-certified candidates at the top of the match list, ranked by relevance score.",
                },
                {
                  icon: Briefcase,
                  title: "Two-sided marketplace",
                  desc: "Workers accept or decline matches. Employers shortlist, message, and request interviews — all from one dashboard.",
                },
                {
                  icon: TrendingUp,
                  title: "Upskill to unlock more matches",
                  desc: "The more roles you certify in, the broader your match pool. The career roadmap shows you exactly which role to take next.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/job-hub"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
            >
              Learn about Job Hub <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>

          {/* Right — job hub mock */}
          <div className="flex items-center justify-center bg-muted/40 px-8 py-16 md:px-12">
            <div className="w-full max-w-sm space-y-3">
              {/* Profile card */}
              <div className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Your Job Hub Profile</p>
                  <span className="rounded-full bg-foreground px-2 py-0.5 text-[9px] font-bold text-background">
                    Active
                  </span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Role preference</span>
                    <span className="font-medium text-foreground">Cashier, Store Attendant</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-medium text-foreground">Lagos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability</span>
                    <span className="font-medium text-foreground">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certification</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <CheckCircle2 className="size-3" /> Cashier (Retail)
                    </span>
                  </div>
                </div>
              </div>

              {/* Match cards */}
              <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                3 new matches
              </p>
              {[
                {
                  employer: "Shoprite Supermarket",
                  role: "Cashier",
                  location: "Ikeja, Lagos",
                  pay: "₦45,000/mo",
                  certified: true,
                },
                {
                  employer: "Chicken Republic",
                  role: "Cashier (F&B)",
                  location: "Lekki, Lagos",
                  pay: "₦38,000/mo",
                  certified: true,
                },
              ].map((match) => (
                <div
                  key={match.employer}
                  className="rounded-xl border border-border bg-background px-4 py-3 shadow-sm"
                >
                  <div className="mb-1.5 flex items-start justify-between">
                    <p className="text-[11px] font-semibold text-foreground">{match.employer}</p>
                    {match.certified && (
                      <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-foreground">
                        <CheckCircle2 className="size-2.5" /> Certified
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-[11px] text-muted-foreground">
                    {match.role} · {match.location} · {match.pay}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg bg-foreground py-1.5 text-[10px] font-semibold text-background">
                      Accept
                    </button>
                    <button className="flex-1 rounded-lg border border-border py-1.5 text-[10px] font-semibold text-foreground">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. STATS ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-border px-8 py-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              By the numbers
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Built to scale</h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1 px-8 py-10">
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-center text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. BUSINESS SECTION ─────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 md:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-8 border-b border-border px-8 py-16 md:border-b-0 md:border-r md:px-12">
            <div>
              <Badge variant="outline" className="mb-4">
                For businesses
              </Badge>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
                Train your team before Day 1
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                New hires cost ₦150,000 or more in supervisor time before they can work a shift
                independently. With the Enterprise Package, you assign curricula before they start.
                They arrive trained. You track every step.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "Assign role curricula to individual workers",
                "Bulk enroll via CSV upload",
                "Track module completion and test scores per worker",
                "Alert when a worker falls behind",
                "Post hire requests and access the certified candidate pool",
                "Manage seats, billing, and renewal in one dashboard",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Link
                href="/business"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                View Enterprise plans
              </Link>
              <Link
                href="/business"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Talk to us
              </Link>
            </div>
          </div>

          {/* Right — business dashboard mock */}
          <div className="flex items-center justify-center bg-muted/40 px-8 py-16 md:px-12">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              {/* Dashboard header */}
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-semibold text-foreground">Business Dashboard</p>
                <p className="text-[10px] text-muted-foreground">Chukwudi's Supermarket · Abuja</p>
              </div>

              {/* Team overview */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {[
                  { label: "Team members", value: "11" },
                  { label: "Enrolled", value: "9" },
                  { label: "Certified", value: "4" },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-4 text-center">
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Worker list */}
              <div className="divide-y divide-border">
                {[
                  { name: "Ngozi A.", role: "Cashier", progress: 100, certified: true },
                  { name: "Emeka B.", role: "Store Attendant", progress: 72, certified: false },
                  { name: "Aisha C.", role: "Cashier", progress: 45, certified: false },
                  { name: "Tunde D.", role: "Cashier", progress: 20, certified: false },
                ].map((worker) => (
                  <div key={worker.name} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {worker.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-semibold text-foreground truncate">
                          {worker.name}
                        </p>
                        {worker.certified && (
                          <CheckCircle2 className="size-3 shrink-0 text-foreground" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{worker.role}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] font-semibold text-foreground">
                        {worker.progress}%
                      </p>
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground"
                          style={{ width: `${worker.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border px-4 py-3">
                <p className="text-[10px] text-muted-foreground">
                  Starter plan · 5 seats · Renews June 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. TESTIMONIALS ─────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Real outcomes
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Trusted by workers and employers
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-3.5 fill-foreground text-foreground"
                    />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. PRICING ──────────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-8 py-16">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pricing
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Pay for what you need
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Individual courses from ₦2,500. Job matching from ₦1,000/month. Enterprise plans
              starting at ₦15,000/month.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-xl border p-6",
                  plan.highlight
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background"
                )}
              >
                <div className="mb-4">
                  <p
                    className={cn(
                      "mb-1 text-xs font-semibold uppercase tracking-widest",
                      plan.highlight ? "text-background/60" : "text-muted-foreground"
                    )}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span
                      className={cn(
                        "text-3xl font-bold",
                        plan.highlight ? "text-background" : "text-foreground"
                      )}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={cn(
                        "mb-1 text-sm",
                        plan.highlight ? "text-background/60" : "text-muted-foreground"
                      )}
                    >
                      /{plan.period}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-sm",
                      plan.highlight ? "text-background/70" : "text-muted-foreground"
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "mb-6 justify-center",
                    plan.highlight
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {plan.cta}
                </Link>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          plan.highlight ? "text-background/60" : "text-muted-foreground"
                        )}
                      />
                      <span className={plan.highlight ? "text-background/80" : "text-muted-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. FINAL CTA ────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-b border-border px-4 py-24 text-center"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, var(--color-background) 100%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
            Your career starts
            <br />
            with the right training.
          </h2>
          <p className="max-w-lg text-base text-muted-foreground">
            Join thousands of workers across Nigeria building verifiable skills and landing
            better jobs with InTrainin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/roles"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-foreground px-8 text-background hover:bg-foreground/90"
              )}
            >
              Start learning free
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link
              href="/business"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8")}
            >
              Enterprise enquiry
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Free trial on Module 1 · No card required · Cancel Job Hub anytime
          </p>
        </div>
      </section>
    </main>
  );
}
