'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Compass, Award, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV = [
  { href: '/dashboard',    label: 'Home',    icon: LayoutDashboard },
  { href: '/roles',        label: 'Explore', icon: Compass },
  { href: '/certificates', label: 'Certs',   icon: Award },
  { href: '/profile',      label: 'Profile', icon: User },
]

// TODO: replace with real session from auth context (Layer 3)
const MOCK_SESSION = { fullName: 'Emeka Johnson', initials: 'EJ' }

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background md:flex-row">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:shrink-0 h-screen border-r border-border bg-card transition-[width] duration-200',
          collapsed ? 'md:w-14' : 'md:w-56 lg:w-60',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
            IT
          </span>
          <span
            className={cn(
              'flex-1 font-heading text-sm font-semibold tracking-tight text-foreground overflow-hidden whitespace-nowrap transition-[opacity,width] duration-200',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            InTrainin
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {collapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft  className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className={cn('flex-1 py-3 space-y-0.5', collapsed ? 'px-1' : 'px-2')}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'group relative flex items-center rounded-lg transition-colors duration-150',
                  collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2',
                  active
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-normal',
                )}
              >
                {/* Active pill — only when expanded */}
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-[opacity,width] duration-200',
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        {collapsed ? (
          <div className="border-t border-border px-1 py-3 flex flex-col items-center gap-1">
            <ThemeToggle iconOnly />
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="border-t border-border px-3 py-3 space-y-0.5">
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {MOCK_SESSION.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{MOCK_SESSION.fullName}</p>
                <p className="text-[10px] text-muted-foreground">Learner</p>
              </div>
            </div>
            <ThemeToggle />
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/8 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
            IT
          </span>
          <span className="font-heading text-sm font-semibold tracking-tight">InTrainin</span>
        </Link>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
          {MOCK_SESSION.initials}
        </div>
      </header>

      {/* ── Main content — only this element scrolls ─────────────────────── */}
      <main className="min-w-0 flex-1 overflow-y-auto pb-24 md:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'stroke-[2]' : 'stroke-[1.5]')} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
