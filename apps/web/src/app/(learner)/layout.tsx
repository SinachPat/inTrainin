'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Compass, Award, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',    label: 'Home',    icon: LayoutDashboard },
  { href: '/roles',        label: 'Explore', icon: Compass },
  { href: '/certificates', label: 'Certs',   icon: Award },
  { href: '/profile',      label: 'Profile', icon: User },
]

// TODO: replace with real session from auth context (Layer 3)
const MOCK_SESSION = { firstName: 'Emeka' }

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-56 lg:w-64 md:flex-col md:shrink-0 border-r border-sidebar-border bg-sidebar">

        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-[18px]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-[11px] text-primary-foreground">
            IT
          </span>
          <span className="font-heading font-semibold tracking-tight text-sidebar-foreground">
            InTrainin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(href)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
            Signed in as
          </p>
          <p className="mt-0.5 text-sm font-medium text-sidebar-foreground">
            {MOCK_SESSION.firstName}
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-[10px] text-primary-foreground">
            IT
          </span>
          <span className="font-heading text-sm font-semibold">InTrainin</span>
        </Link>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom tab bar ────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card md:hidden">
        <div className="flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive(href) ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive(href) && 'stroke-[2.2]')} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
