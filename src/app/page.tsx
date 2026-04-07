import Link from "next/link";
import Image from "next/image";
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
  { value: "15+", label: "Roles at launch" },
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
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
  },
  {
    quote:
      "My new hires used to need two weeks of hand-holding before they could work a shift alone. Now I assign them the curriculum before Day 1. They arrive knowing the job. The difference is real.",
    name: "Chukwudi A.",
    title: "Supermarket Owner · Abuja",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
  },
  {
    quote:
      "I have worked in hospitality for seven years with nothing to show for it on paper. The Waiter/Waitress certificate from InTrainin got me into an interview at a hotel chain I had applied to three times before.",
    name: "Fatima M.",
    title: "Waitress · Kano",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b06b4985?w=200&h=200&fit=crop&q=80",
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
  { icon: "🏨", label: "Hospitality" },
  { icon: "📋", label: "Admin & Office" },
  { icon: "🚚", label: "Logistics" },
  { icon: "✂️", label: "Beauty & Wellness" },
];

const ROLES = [
  { slug: "cashier-retail", title: "Cashier (Retail)", category: "Retail & Store Ops", icon: "🛒", modules: 5, topics: 28, price: "₦2,500", description: "Master POS systems, cash handling, customer service, and end-of-day reconciliation." },
  { slug: "waiter-waitress", title: "Waiter / Waitress", category: "Food & Beverage", icon: "🍽️", modules: 5, topics: 25, price: "₦2,500", description: "Table service, menu knowledge, food safety, upselling, and shift procedures." },
  { slug: "store-attendant", title: "Store Attendant", category: "Retail & Store Ops", icon: "🧾", modules: 4, topics: 22, price: "₦2,500", description: "Stock management, customer handling, display standards, and security protocols." },
  { slug: "barista", title: "Barista", category: "Food & Beverage", icon: "☕", modules: 5, topics: 24, price: "₦2,500", description: "Espresso techniques, milk frothing, beverage recipes, hygiene, and equipment care." },
  { slug: "customer-service-rep", title: "Customer Service Rep", category: "Sales & Marketing", icon: "📣", modules: 5, topics: 26, price: "₦2,500", description: "Complaint handling, communication, product knowledge, CRM basics, and follow-up." },
  { slug: "dispatch-rider", title: "Dispatch Rider", category: "Logistics", icon: "🚚", modules: 4, topics: 20, price: "₦2,500", description: "Route optimization, safety protocols, delivery SOPs, and customer interaction." },
  { slug: "receptionist", title: "Receptionist", category: "Admin & Office", icon: "📋", modules: 5, topics: 24, price: "₦2,500", description: "Front desk operations, scheduling, communication etiquette, and office software basics." },
  { slug: "hairdresser", title: "Hairdresser", category: "Beauty & Wellness", icon: "✂️", modules: 5, topics: 26, price: "₦2,500", description: "Haircut techniques, client consultation, chemical treatments, and salon hygiene." },
  { slug: "security-guard", title: "Security Guard", category: "Admin & Office", icon: "🛡️", modules: 4, topics: 18, price: "₦2,500", description: "Access control, emergency response, report writing, and legal boundaries of duty." },
];

// Shared section wrapper — centers and constrains width consistently
function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("w-full border-b border-border", className)}>
      <div className="mx-auto w-full max-w-6xl">
        {children}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative border-b border-border overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      >
        {/* Fade mask — fades dots toward center-right */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 90% 100% at 25% 50%, transparent 30%, var(--color-background) 75%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">

            {/* Left: headline + CTAs */}
            <div className="flex flex-col items-start gap-6">
              <Link
                href="/roles"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                Now live in Lagos, Abuja, Enugu, Kano &amp; Port Harcourt
                <ChevronRight className="size-3 shrink-0" />
              </Link>

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Get trained.<br />
                <span className="text-muted-foreground">Get certified.</span><br />
                Get hired.
              </h1>

              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                InTrainin is the role-based learning platform for informal sector workers across
                Nigeria. Structured training, verifiable certificates, and direct job matching —
                built for the roles that matter.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "px-8")}>
                  Start learning free
                  <ArrowRight className="ml-1 size-4" />
                </Link>
                <Link href="/roles" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8")}>
                  View all roles
                </Link>
              </div>

              <p className="text-xs text-muted-foreground">
                Free trial on Module 1 of any role. No card required.
              </p>
            </div>

            {/* Right: photo + floating card */}
            <div className="relative hidden md:block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1573497491207-618cc224f243?w=800&h=1000&fit=crop&q=80"
                  alt="Nigerian professional handling payment at work"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Floating learner card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      AO
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground">Amara Okafor</p>
                      <p className="text-[10px] text-muted-foreground">Cashier (Retail) · Certified</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary">
                      <CheckCircle2 className="size-3.5" /> Verified
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating XP badge */}
              <div className="absolute -left-4 top-1/3 rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Zap className="size-3.5 text-primary" /> 340 XP earned
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. CITY BAR ──────────────────────────────────────────────────── */}
      <section className="w-full border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Available in
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {CITIES.map((city) => (
                <span key={city} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {city}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Phase 1 · Nigeria</p>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURE TABS ──────────────────────────────────────────────── */}
      <Section>
        <div className="border-b border-border px-4 py-8 text-center md:px-8">
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
      </Section>

      {/* ── 4. ROLE CATEGORIES ───────────────────────────────────────────── */}
      <Section>
        <div className="px-4 py-8 md:px-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
      </Section>

      {/* ── 4b. ROLE CARDS ───────────────────────────────────────────────── */}
      <Section>
        <div className="px-4 py-10 md:px-8 md:py-14">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Browse Courses
              </p>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Find your role, start learning today
              </h2>
            </div>
            <Link href="/roles" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden shrink-0 sm:flex")}>
              View all 15+ roles <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>

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
                <h3 className="mb-1.5 text-[15px] font-semibold text-foreground transition-colors group-hover:text-primary">
                  {role.title}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {role.description}
                </p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <BookOpen className="size-3" />
                    {role.modules} modules · {role.topics} topics
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

          <div className="mt-6 sm:hidden">
            <Link href="/roles" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>
              View all 15+ roles <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 5. VISION QUOTE ──────────────────────────────────────────────── */}
      <section className="w-full border-b border-border bg-primary">
        <div className="mx-auto w-full max-w-4xl px-4 py-14 text-center md:px-8 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/60">
            Our Mission
          </p>
          <blockquote className="mt-5 text-lg font-medium leading-relaxed text-primary-foreground md:text-2xl">
            &ldquo;Every cashier, waiter, cleaner, and store attendant deserves structured training,
            portable proof of competence, and a fair shot at better employment — regardless of
            where they started.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* ── 6. FEATURE: LEARNING ENGINE ──────────────────────────────────── */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Copy */}
          <div className="flex flex-col justify-center gap-7 border-b border-border px-4 py-10 md:border-b-0 md:border-r md:px-10 md:py-14">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Learning Engine
              </p>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground md:text-3xl">
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
                { icon: BookOpen, title: "Structured progression", desc: "Topics unlock in sequence within each module. Module tests unlock only after all topics are done." },
                { icon: Zap, title: "Gamified motivation", desc: "XP points, daily streaks, and milestone badges keep learners moving through the material." },
                { icon: TrendingUp, title: "Resume anywhere", desc: "Progress is saved at the topic level. Learners can close and return from exactly where they left off." },
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
            <Link href="/roles" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}>
              Explore role curricula <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>

          {/* Mock */}
          <div className="flex items-center justify-center bg-muted/40 px-4 py-8 md:px-10 md:py-14">
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
                    mod.active ? "border-foreground/20 bg-background shadow-sm"
                    : mod.done ? "border-border bg-background"
                    : "border-border bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    mod.done ? "bg-muted text-foreground"
                    : mod.active ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  )}>
                    {mod.done ? <Check className="size-3" /> : mod.num}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-[12px] font-medium", mod.locked ? "text-muted-foreground" : "text-foreground")}>
                      {mod.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{mod.topics} topics</p>
                  </div>
                  {mod.locked ? (
                    <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : mod.active ? (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                      In Progress
                    </span>
                  ) : null}
                </div>
              ))}
              <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-3 text-center">
                <p className="text-[11px] font-semibold text-muted-foreground">Final Certification Exam</p>
                <p className="text-[10px] text-muted-foreground">Unlocks after all module tests passed · 75% pass mark</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. FEATURE: CERTIFICATION ────────────────────────────────────── */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Certificate mock — LEFT on desktop */}
          <div className="flex items-center justify-center border-b border-border bg-muted/40 px-4 py-8 md:border-b-0 md:border-r md:px-10 md:py-14">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">InTrainin</p>
                <div className="h-px w-10 bg-border" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Certificate of Completion</p>
                <div className="mt-2">
                  <p className="text-[11px] text-muted-foreground">This certifies that</p>
                  <p className="mt-1 text-xl font-bold text-foreground">Amara Okafor</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">has successfully completed</p>
                  <p className="mt-1 text-base font-bold text-foreground">Cashier (Retail)</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3">
                <div>
                  <p className="text-[9px] text-muted-foreground">Issued</p>
                  <p className="text-[11px] font-semibold text-foreground">April 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground">Verification ID</p>
                  <p className="font-mono text-[11px] font-semibold text-foreground">IT-2026-84921</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                <Shield className="size-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">
                  Publicly verifiable at intrainin.com/verify/IT-2026-84921
                </p>
              </div>
            </div>
          </div>

          {/* Copy — RIGHT on desktop */}
          <div className="flex flex-col justify-center gap-7 px-4 py-10 md:px-10 md:py-14">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Certification System
              </p>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground md:text-3xl">
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
                { icon: Award, title: "Auto-generated on exam pass", desc: "No manual step needed. The certificate is created the moment the final exam is passed." },
                { icon: Shield, title: "Publicly verifiable", desc: "Every certificate has a unique ID and a public URL. Employers verify in seconds." },
                { icon: Users, title: "Share everywhere", desc: "WhatsApp (primary), LinkedIn, direct link copy, or download as PNG to your device." },
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
            <Link href="/roles" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}>
              See available certifications <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── 8. FEATURE: JOB HUB ──────────────────────────────────────────── */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Copy */}
          <div className="flex flex-col justify-center gap-7 border-b border-border px-4 py-10 md:border-b-0 md:border-r md:px-10 md:py-14">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Job Hub</p>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground md:text-3xl">
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
                { icon: Zap, title: "Certified candidates ranked first", desc: "Employers see InTrainin-certified candidates at the top of the match list, ranked by relevance score." },
                { icon: Briefcase, title: "Two-sided marketplace", desc: "Workers accept or decline matches. Employers shortlist, message, and request interviews — all from one dashboard." },
                { icon: TrendingUp, title: "Upskill to unlock more matches", desc: "The more roles you certify in, the broader your match pool. The career roadmap shows you exactly which role to take next." },
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
            <Link href="/job-hub" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}>
              Learn about Job Hub <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </div>

          {/* Mock */}
          <div className="flex items-center justify-center bg-muted/40 px-4 py-8 md:px-10 md:py-14">
            <div className="w-full max-w-sm space-y-3">
              <div className="rounded-xl border border-border bg-background px-4 py-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Your Job Hub Profile</p>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">Active</span>
                </div>
                <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
                  {[
                    { label: "Role preference", value: "Cashier, Store Attendant" },
                    { label: "Location", value: "Lagos" },
                    { label: "Availability", value: "Immediate" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-2">
                      <span className="shrink-0">{row.label}</span>
                      <span className="truncate text-right font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-2">
                    <span className="shrink-0">Certification</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <CheckCircle2 className="size-3 shrink-0" /> Cashier (Retail)
                    </span>
                  </div>
                </div>
              </div>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">3 new matches</p>
              {[
                { employer: "Shoprite Supermarket", role: "Cashier", location: "Ikeja, Lagos", pay: "₦45,000/mo", certified: true },
                { employer: "Chicken Republic", role: "Cashier (F&B)", location: "Lekki, Lagos", pay: "₦38,000/mo", certified: true },
              ].map((match) => (
                <div key={match.employer} className="rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold text-foreground">{match.employer}</p>
                    {match.certified && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-foreground">
                        <CheckCircle2 className="size-2.5" /> Certified
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-[11px] text-muted-foreground">{match.role} · {match.location} · {match.pay}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg bg-primary py-1.5 text-[10px] font-semibold text-primary-foreground">Accept</button>
                    <button className="flex-1 rounded-lg border border-border py-1.5 text-[10px] font-semibold text-foreground">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9. STATS ─────────────────────────────────────────────────────── */}
      <Section>
        <div className="border-b border-border px-4 py-8 text-center md:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">By the numbers</p>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Built to scale</h2>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-8 md:px-8">
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-center text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 10. BUSINESS SECTION ─────────────────────────────────────────── */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Copy */}
          <div className="flex flex-col justify-center gap-7 border-b border-border px-4 py-10 md:border-b-0 md:border-r md:px-10 md:py-14">
            <div>
              <Badge variant="outline" className="mb-4">For businesses</Badge>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-foreground md:text-3xl">
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
            <div className="flex flex-wrap gap-3">
              <Link href="/business" className={cn(buttonVariants({ size: "sm" }))}>
                View Enterprise plans
              </Link>
              <Link href="/business" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Talk to us
              </Link>
            </div>
          </div>

          {/* Dashboard mock */}
          <div className="flex items-center justify-center bg-muted/40 px-4 py-8 md:px-10 md:py-14">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <p className="text-xs font-semibold text-foreground">Business Dashboard</p>
                <p className="text-[10px] text-muted-foreground">Chukwudi&apos;s Supermarket · Abuja</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {[{ label: "Team members", value: "11" }, { label: "Enrolled", value: "9" }, { label: "Certified", value: "4" }].map((s) => (
                  <div key={s.label} className="px-3 py-4 text-center">
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[11px] font-semibold text-foreground">{worker.name}</p>
                        {worker.certified && <CheckCircle2 className="size-3 shrink-0 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{worker.role}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-[10px] font-semibold text-foreground">{worker.progress}%</p>
                      <div className="h-1 w-14 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${worker.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="text-[10px] text-muted-foreground">Starter plan · 5 seats · Renews June 2026</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 11. TESTIMONIALS ─────────────────────────────────────────────── */}
      <Section>
        <div className="px-4 py-10 md:px-8 md:py-14">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Real outcomes</p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Trusted by workers and employers
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border">
                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 12. PRICING ──────────────────────────────────────────────────── */}
      <Section>
        <div className="px-4 py-10 md:px-8 md:py-14">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pricing</p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Pay for what you need</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Individual courses from ₦2,500. Job matching from ₦1,000/month. Enterprise plans starting at ₦15,000/month.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "flex flex-col rounded-xl border p-5",
                  plan.highlight ? "border-primary bg-primary" : "border-border bg-background"
                )}
              >
                <div className="mb-4">
                  <p className={cn("mb-1 text-xs font-semibold uppercase tracking-widest", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className={cn("text-3xl font-bold", plan.highlight ? "text-primary-foreground" : "text-foreground")}>
                      {plan.price}
                    </span>
                    <span className={cn("mb-1 text-sm", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={cn("mt-2 text-sm", plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {plan.description}
                  </p>
                </div>
                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "mb-5 justify-center",
                    plan.highlight ? "bg-background text-primary hover:bg-background/90" : ""
                  )}
                >
                  {plan.cta}
                </Link>
                <ul className="flex flex-col gap-2.5">
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
        </div>
      </Section>

      {/* ── 13. FINAL CTA ────────────────────────────────────────────────── */}
      <section
        className="relative w-full border-b border-border"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, var(--color-background) 100%)" }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
          <h2 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
            Your career starts<br />with the right training.
          </h2>
          <p className="max-w-lg text-base text-muted-foreground">
            Join thousands of workers across Nigeria building verifiable skills and landing
            better jobs with InTrainin.
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/roles" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto px-8")}>
              Start learning free
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link href="/business" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto px-8")}>
              Enterprise enquiry
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Free trial on Module 1 · No card required · Cancel Job Hub anytime
          </p>
        </div>
      </section>

    </>
  );
}
