'use client'

import { useEffect, useState } from 'react'
import { X, Share, Download } from 'lucide-react'

type Platform = 'android' | 'ios' | null

// Detect iOS Safari (not Chrome on iOS — Chrome on iOS can't install PWAs)
function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null
  const ua = navigator.userAgent

  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  if (isIOS && isSafari) return 'ios'

  // Android / Desktop Chrome — wait for beforeinstallprompt instead
  return null
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

const DISMISSED_KEY = 'intrainin_pwa_dismissed'

export function PWAInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => Promise<void> } | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Already installed or previously dismissed — don't show
    if (isStandalone()) return
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return
    } catch {}

    // Android / Chrome — capture the native install event
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as Event & { prompt: () => Promise<void> })
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS Safari — show manual instructions
    const p = detectPlatform()
    if (p === 'ios') {
      // Delay slightly so the page has painted before the banner slides in
      setTimeout(() => setVisible(true), 1500)
      setPlatform('ios')
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function dismiss() {
    setVisible(false)
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch {}
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    dismiss()
  }

  if (!visible) return null

  return (
    <div
      role="banner"
      aria-live="polite"
      className="fixed bottom-[4.5rem] inset-x-0 z-[60] px-3 pb-1 md:bottom-4 md:left-auto md:right-4 md:px-0 md:w-80"
    >
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/10 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            {/* App icon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" width={36} height={36} className="rounded-lg" />
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">Install InTrainin</p>
              <p className="text-[11px] text-muted-foreground">Add to your home screen</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="mt-0.5 shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* iOS instructions */}
        {platform === 'ios' && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tap <Share className="inline h-3.5 w-3.5 mb-0.5 text-foreground" /> <strong className="text-foreground font-medium">Share</strong>, then{' '}
            <strong className="text-foreground font-medium">Add to Home Screen</strong> to install the app.
          </p>
        )}

        {/* Android / Chrome — install button */}
        {deferredPrompt && (
          <button
            onClick={install}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80"
          >
            <Download className="h-4 w-4" />
            Install app
          </button>
        )}
      </div>
    </div>
  )
}
