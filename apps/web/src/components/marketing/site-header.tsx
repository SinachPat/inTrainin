"use client";

import Link from "next/link";
import { Menu, X, ChevronDown, GraduationCap, Building2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { marketingNavLinks } from "@/components/marketing/nav-links";
import { cn } from "@/lib/utils";

// ── Login dropdown ─────────────────────────────────────────────────────────────

function LoginDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1 text-muted-foreground hover:text-foreground",
          open && "bg-accent text-foreground",
        )}
      >
        Log in
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {/* Dropdown panel */}
      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full mt-1.5 w-56 origin-top-right rounded-xl border border-border bg-background shadow-lg transition-all duration-150",
          open ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <div className="p-1.5">
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sign in as
          </p>
          <Link
            href="/login"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Learner</p>
              <p className="text-[11px] text-muted-foreground">Job seeker &amp; student</p>
            </div>
          </Link>
          <Link
            href="/login?type=business"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Business</p>
              <p className="text-[11px] text-muted-foreground">Owner &amp; manager</p>
            </div>
          </Link>
        </div>
        <div className="border-t border-border px-3 py-2.5">
          <p className="text-center text-[11px] text-muted-foreground">
            No account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Site header ────────────────────────────────────────────────────────────────

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo height={32} />
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {marketingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right — desktop */}
          <div className="hidden items-center gap-1 md:flex">
            <ThemeToggle />
            <LoginDropdown />
            <Link href="/signup" className={cn(buttonVariants({ size: "sm" }))}>
              Get started
            </Link>
          </div>

          {/* Right — mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 md:hidden"
          style={{ top: headerHeight }}
        />
      )}

      <div
        className={cn(
          "fixed left-0 right-0 z-40 w-full border-b border-border bg-background shadow-md transition-all duration-200 ease-out md:hidden",
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        )}
        style={{ top: headerHeight || undefined }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <nav className="flex flex-col gap-0.5">
            {marketingNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "justify-start text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {/* Mobile sign-in options */}
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sign in as</p>
            <div className="flex gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center gap-1.5")}
                onClick={() => setOpen(false)}
              >
                <GraduationCap className="h-3.5 w-3.5" /> Learner
              </Link>
              <Link
                href="/login?type=business"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center gap-1.5")}
                onClick={() => setOpen(false)}
              >
                <Building2 className="h-3.5 w-3.5" /> Business
              </Link>
            </div>
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
              onClick={() => setOpen(false)}
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
