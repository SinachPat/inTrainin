"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { marketingNavLinks } from "@/components/marketing/nav-links";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  // Measure the real header height so the drawer sits flush below it
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setHeaderHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  // Close drawer when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Topbar ───────────────────────────────────────────────────────── */}
      <header
        ref={headerRef}
        className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm"
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
            <span className="text-base font-bold tracking-tight text-foreground">InTrainin</span>
          </Link>

          {/* Nav — desktop only */}
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
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground"
              )}
            >
              Log in
            </Link>
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

      {/* ── Mobile drawer — fixed below the header, never inside it ─────── */}

      {/* Tap-to-close backdrop */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 md:hidden"
          style={{ top: headerHeight }}
        />
      )}

      {/* Drawer panel */}
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
          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "sm" }), "flex-1 justify-center")}
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
