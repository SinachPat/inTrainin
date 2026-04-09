'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { LayoutDashboard, Compass, Award, User, Briefcase, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV = [
  { href: '/dashboard',    label: 'Home',    icon: LayoutDashboard },
  { href: '/explore',      label: 'Explore', icon: Compass },
  { href: '/certificates', label: 'Certs',   icon: Award },
  { href: '/job-hub',      label: 'Jobs',    icon: Briefcase },
  { href: '/profile',      label: 'Profile', icon: User },
]

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const [session, setSessionState] = useState<{ fullName: string; initials: string } | null>(null)

  useEffect(() => {
    // Dynamically import to avoid SSR issues with localStorage
    import('@/lib/auth').then(({ getSession }) => {
      const s = getSession()
      if (s) {
        const initials = s.fullName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
        setSessionState({ fullName: s.fullName, initials })
      }
    })
  }, [])

  // Restore sidebar state from localStorage on first client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('learner-sidebar-collapsed')
      if (saved !== null) setCollapsed(saved === 'true')
    } catch {}
  }, [])

  // Persist sidebar state on every change
  function setCollapsedPersisted(val: boolean) {
    setCollapsed(val)
    try { localStorage.setItem('learner-sidebar-collapsed', String(val)) } catch {}
  }

  // Close avatar menu on route change
  useEffect(() => { setAvatarOpen(false) }, [pathname])

  // Close avatar menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    if (avatarOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background md:flex-row">

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:shrink-0 h-screen border-r border-border bg-card transition-[width] duration-200',
          collapsed ? 'md:w-14' : 'md:w-56 lg:w-60',
        )}
      >
        {/* Logo — whole row is the expand button when collapsed */}
        {collapsed ? (
          <button
            onClick={() => setCollapsedPersisted(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="group flex h-14 w-full shrink-0 items-center justify-center border-b border-border transition-colors hover:bg-muted/50"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
              <span className="transition-opacity duration-150 group-hover:opacity-0">IT</span>
              <ChevronRight className="absolute h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
            </span>
          </button>
        ) : (
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
              IT
            </span>
            <span className="flex-1 font-heading text-sm font-semibold tracking-tight text-foreground">
              InTrainin
            </span>
            <button
              onClick={() => setCollapsedPersisted(true)}
              aria-label="Collapse sidebar"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

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
                {session?.initials ?? '?'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{session?.fullName ?? '…'}</p>
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

        {/* Theme + Avatar */}
        <div className="flex items-center gap-1">
          <ThemeToggle iconOnly />
          {/* Avatar with dropdown */}
          <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen(o => !o)}
            aria-label="Account menu"
            aria-expanded={avatarOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary ring-2 ring-transparent transition-all hover:ring-primary/30"
          >
            {session?.initials ?? '?'}
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-10 z-50 min-w-[192px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {/* User info header */}
              <div className="border-b border-border px-4 py-3">
                <p className="text-[13px] font-semibold text-foreground">{session?.fullName ?? '…'}</p>
                <p className="text-[11px] text-muted-foreground">Learner</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                onClick={() => setAvatarOpen(false)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                View profile
              </Link>
              <div className="border-t border-border">
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </header>

      {/* ── Main content — only this element scrolls ─────────────────────── */}
      <main className="min-w-0 flex-1 overflow-x-clip overflow-y-auto md:pb-0" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="grid grid-cols-5">
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
