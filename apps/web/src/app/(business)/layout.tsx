'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Briefcase, ChevronRight,
  Menu, X, Building2, LogOut,
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

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-[18px]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-sm text-primary-foreground">
          {MOCK_BIZ.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">
            {MOCK_BIZ.name}
          </p>
          <Badge variant="secondary" className="mt-0.5 h-4 px-1.5 text-[10px]">
            {MOCK_BIZ.plan}
          </Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {!active && <ChevronRight className="ml-auto h-3 w-3 opacity-30" />}
            </Link>
          )
        })}
      </nav>

      {/* Plan footer */}
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
    </div>
  )
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background md:flex-row">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-56 lg:w-64 md:flex-col md:shrink-0 h-screen border-r border-sidebar-border bg-sidebar">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile overlay drawer ────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent pathname={pathname} onNav={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Mobile top bar ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
            aria-label="Open menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-heading text-sm font-semibold truncate">
              {MOCK_BIZ.name}
            </span>
          </div>
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {MOCK_BIZ.plan}
          </Badge>
        </header>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
