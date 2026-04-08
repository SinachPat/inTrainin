'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'intrainin-dark'

/**
 * Dark / light mode toggle.
 *
 * Reads from and writes to localStorage['intrainin-dark'], which is the same
 * key read by /public/theme-init.js on first paint. Toggling applies/removes
 * the `.dark` class on <html> immediately without a page reload.
 */
export function ThemeToggle({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const [dark, setDark] = useState(false)

  // Sync initial state from the DOM (theme-init.js may have already set it)
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch {}
  }

  if (iconOnly) {
    return (
      <button
        onClick={toggle}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={dark ? 'Light mode' : 'Dark mode'}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
          className,
        )}
      >
        {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors',
        'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      {dark
        ? <Sun  className="h-3.5 w-3.5 shrink-0" />
        : <Moon className="h-3.5 w-3.5 shrink-0" />}
      {dark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
