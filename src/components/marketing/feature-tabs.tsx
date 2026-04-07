"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  Award,
  Briefcase,
  Check,
  Lock,
  Flame,
  Zap,
  ChevronRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export function FeatureTabs() {
  return (
    <Tabs defaultValue="learning" className="w-full">
      {/* Tab triggers — horizontal scroll on mobile so they never cause overflow */}
      <div className="border-b border-border">
        <div className="overflow-x-auto">
          <TabsList
            variant="line"
            className="h-auto w-full min-w-max gap-0 rounded-none bg-transparent p-0"
          >
            <TabsTrigger
              value="learning"
              className="flex shrink-0 items-center gap-1.5 rounded-none px-4 py-3 text-sm font-medium sm:px-5"
            >
              <BookOpen className="hidden size-4 sm:block" />
              Learning Engine
            </TabsTrigger>
            <TabsTrigger
              value="certification"
              className="flex shrink-0 items-center gap-1.5 rounded-none px-4 py-3 text-sm font-medium sm:px-5"
            >
              <Award className="hidden size-4 sm:block" />
              Certification
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="flex shrink-0 items-center gap-1.5 rounded-none px-4 py-3 text-sm font-medium sm:px-5"
            >
              <Briefcase className="hidden size-4 sm:block" />
              Job Hub
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* ── Learning Engine tab ──────────────────────────────────────────── */}
      <TabsContent value="learning" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-6 border-b border-border px-4 py-8 md:border-b-0 md:border-r md:px-10 md:py-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Learning Engine
              </p>
              <h3 className="mb-3 text-2xl font-bold leading-snug text-foreground">
                Master your role,<br />step by step
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every role has a structured curriculum: Modules, Topics, Guides, Case Studies,
                Workflows — all in sequence. Linear progression means nothing is skipped.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "15 roles across 7 industry categories",
                "Module Tests with 70% pass mark",
                "Final Certification Exam per role",
                "Audio read-aloud in English",
                "Progress saved at topic level — resume anytime",
                "XP points and streak rewards",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — product UI mock */}
          <div className="flex items-center justify-center bg-muted/40 p-4 sm:p-8">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Cashier (Retail)</p>
                  <p className="text-[11px] text-muted-foreground">Module 3 of 5</p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground">
                  60% complete
                </span>
              </div>

              <div className="px-4 py-3">
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Cash Handling</span>
                  <span>4 / 6 topics</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[67%] rounded-full bg-primary" />
                </div>
              </div>

              <div className="divide-y divide-border">
                {[
                  { label: "Introduction to Cash Management", done: true },
                  { label: "Counting and Sorting Currency", done: true },
                  { label: "POS Machine Operations", done: true },
                  { label: "Processing Card Payments", done: true },
                  { label: "Handling Shortages & Discrepancies", done: false, active: true },
                  { label: "End-of-Day Cash Reconciliation", done: false, locked: true },
                ].map((topic) => (
                  <div
                    key={topic.label}
                    className={`flex items-center gap-2.5 px-4 py-2.5 ${topic.active ? "bg-muted/60" : ""}`}
                  >
                    {topic.done ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    ) : topic.locked ? (
                      <Lock className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-3.5 shrink-0 text-primary" />
                    )}
                    <span className={`text-[11px] leading-snug ${
                      topic.locked ? "text-muted-foreground"
                      : topic.active ? "font-medium text-foreground"
                      : "text-muted-foreground line-through"
                    }`}>
                      {topic.label}
                    </span>
                    {topic.active && (
                      <span className="ml-auto shrink-0 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
                        Open
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-border px-4 py-3">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Flame className="size-3 text-primary" /> 5-day streak
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Zap className="size-3 text-primary" /> 340 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ── Certification tab ────────────────────────────────────────────── */}
      <TabsContent value="certification" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-6 border-b border-border px-4 py-8 md:border-b-0 md:border-r md:px-10 md:py-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Certification System
              </p>
              <h3 className="mb-3 text-2xl font-bold leading-snug text-foreground">
                Proof that follows<br />you everywhere
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pass the Final Exam and a verifiable digital certificate is generated instantly —
                no admin approval needed. Share it on WhatsApp, LinkedIn, or send the link
                directly to employers.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "Auto-generated on Final Exam pass",
                "Unique verification ID for every certificate",
                "Public verification at intrainin.com/verify/[ID]",
                "Share via WhatsApp, LinkedIn, or direct link",
                "Download as PNG to your device",
                "Permanent — never revoked on re-attempt",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — certificate mock */}
          <div className="flex items-center justify-center bg-muted/40 p-4 sm:p-8">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="h-1.5 w-full bg-primary" />
              <div className="flex flex-col items-center gap-3 border-b border-border px-6 py-8 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  InTrainin
                </p>
                <div className="my-1 h-px w-12 bg-border" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Certificate of Completion
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">This certifies that</p>
                <p className="text-xl font-bold text-foreground">Amara Okafor</p>
                <p className="text-[11px] text-muted-foreground">has successfully completed the curriculum for</p>
                <p className="text-base font-bold text-foreground">Cashier (Retail)</p>
                <p className="text-[11px] text-muted-foreground">with a score of 82% on the Final Exam</p>
              </div>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Issued</p>
                  <p className="text-[11px] font-semibold text-foreground">April 2026</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Verification ID</p>
                  <p className="font-mono text-[11px] font-semibold text-foreground">IT-2026-84921</p>
                </div>
              </div>
              <div className="flex gap-2 px-4 py-3">
                <button className="flex-1 rounded-lg bg-primary py-2 text-[10px] font-semibold text-primary-foreground">
                  WhatsApp
                </button>
                <button className="flex-1 rounded-lg border border-border py-2 text-[10px] font-semibold text-foreground hover:bg-muted">
                  LinkedIn
                </button>
                <button className="flex-1 rounded-lg border border-border py-2 text-[10px] font-semibold text-foreground hover:bg-muted">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ── Job Hub tab ──────────────────────────────────────────────────── */}
      <TabsContent value="jobs" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center gap-6 border-b border-border px-4 py-8 md:border-b-0 md:border-r md:px-10 md:py-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Job Hub
              </p>
              <h3 className="mb-3 text-2xl font-bold leading-snug text-foreground">
                Your next job,<br />without the search
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Subscribe to Job Hub and get matched passively. When an employer posts a role
                that fits your certification, location, and availability — you get an alert.
                Accept or decline from your phone.
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                "Open to all users, not just certified learners",
                "Certification improves your match ranking",
                "Push notification + SMS when a match is posted",
                "Accept or decline from your dashboard",
                "Employers post hire requests with pay ranges",
                "₦1,000/month or ₦8,000/year subscription",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — job match mock */}
          <div className="flex items-center justify-center bg-muted/40 p-4 sm:p-8">
            <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-background shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-xs font-semibold text-foreground">Job Hub</p>
                <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                  3 new matches
                </span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { employer: "Shoprite Supermarket", role: "Cashier", location: "Ikeja, Lagos", pay: "₦45,000/mo", certified: true },
                  { employer: "Chicken Republic", role: "Cashier (F&B)", location: "Wuse, Abuja", pay: "₦38,000/mo", certified: true },
                  { employer: "QuickMart Store", role: "Store Attendant", location: "Enugu", pay: "₦35,000/mo", certified: false },
                ].map((match) => (
                  <div key={match.employer} className="px-4 py-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-foreground">{match.employer}</p>
                        <p className="text-[11px] text-muted-foreground">{match.role}</p>
                      </div>
                      {match.certified && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                          <CheckCircle2 className="size-2.5" /> Certified
                        </span>
                      )}
                    </div>
                    <div className="mb-2.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-2.5" /> {match.location}
                      </span>
                      <span>{match.pay} · Full-time</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-lg bg-primary py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90">
                        Accept
                      </button>
                      <button className="flex-1 rounded-lg border border-border py-1.5 text-[10px] font-semibold text-foreground hover:bg-muted">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="text-[10px] text-muted-foreground">Job Hub Active · ₦1,000/month</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
