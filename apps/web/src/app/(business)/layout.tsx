'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Briefcase,
  Building2, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { signOut } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/team',  label: 'Team',      icon: Users },
  { href: '/hire',  label: 'Hire',      icon: Briefcase },
]

// TODO: replace with real business session (Layer 3)
const MOCK_BIZ = {
  name: 'Sunshine Supermart',
  plan: 'Starter',
  planExpiry: 'Dec 2026',
  initials: 'SS',
}

function SidebarContent({
  pathname,
  collapsed,
  onNav,
}: {
  pathname: string
  collapsed: boolean
  onNav?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Nav */}
      <nav className={cn('flex-1 space-y-0.5 py-3', collapsed ? 'px-1' : 'px-2')}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              title={collapsed ? label : undefined}
              className={cn(
                'group relative flex items-center rounded-lg transition-colors duration-150',
                collapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2',
                active
                  ? 'bg-muted text-foreground font-medium'
                  : 'font-normal text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
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

      {/* Plan footer */}
      {collapsed ? (
        <div className="border-t border-sidebar-border px-1 py-3 flex flex-col items-center gap-1">
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
        <div className="border-t border-sidebar-border px-3 py-3 space-y-0.5">
          <div className="flex items-center justify-between px-2 py-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
                Plan expires
              </p>
              <p className="mt-0.5 text-xs font-medium text-sidebar-foreground">
                {MOCK_BIZ.planExpiry}
              </p>
            </div>
            <Link
              href="/business"
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Upgrade
            </Link>
          </div>
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-destructive/8 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background md:flex-row">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:shrink-0 h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-200',
          collapsed ? 'md:w-14' : 'md:w-56 lg:w-64',
        )}
      >
        {/* Brand header */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-sm text-primary-foreground">
            {MOCK_BIZ.initials}
          </span>
          <div
            className={cn(
              'flex-1 min-w-0 overflow-hidden transition-[opacity,width] duration-200',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {MOCK_BIZ.name}
            </p>
            <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-[10px]">
              {MOCK_BIZ.plan}
            </Badge>
          </div>
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

        <SidebarContent pathname={pathname} collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Mobile top bar ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
              {MOCK_BIZ.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-foreground">
                {MOCK_BIZ.name}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
            {MOCK_BIZ.plan}
          </Badge>
        </header>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>

      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
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
