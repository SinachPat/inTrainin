"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { marketingNavLinks } from "@/components/marketing/nav-links";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-sm font-bold tracking-tight text-foreground">InTrainin</span>
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

        {/* CTAs — desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground hover:text-foreground"
            )}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            Get started
          </Link>
        </div>

        {/* Hamburger — mobile */}
        <Button
          className="md:hidden"
          variant="outline"
          size="icon"
          aria-label="Toggle menu"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile nav drawer */}
      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
          {marketingNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "justify-start text-muted-foreground")}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-border pt-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 justify-center")}
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "flex-1 justify-center bg-foreground text-background hover:bg-foreground/90"
              )}
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
