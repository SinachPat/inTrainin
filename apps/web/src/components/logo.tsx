import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * The InTrainin logo mark — two sharp-cornered rectangles from the brand identity.
 * Top: a square block. Bottom: a thin full-width bar. No rounded corners.
 * Rendered as inline SVG — scales perfectly, no image request needed.
 *
 * Usage:
 *   <LogoMark size={28} />
 *   <LogoMark size={16} className="text-primary-foreground" />
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  // Fixed viewBox; scale via the size prop
  // Proportions traced directly from the brand identity sheet:
  //   top block  — full width, ~65% of total height (near-square)
  //   gap        — ~12% of total height
  //   bottom bar — full width, ~23% of total height (thin)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Top block — sharp corners, near-square */}
      <rect x="0" y="0" width="20" height="13" rx="0" />
      {/* Bottom bar — sharp corners, full width, thin */}
      <rect x="0" y="15.5" width="20" height="4.5" rx="0" />
    </svg>
  )
}

/**
 * Full InTrainin wordmark (logo mark + "InTrainin" text) via next/image.
 * Use in marketing header/footer where the full brand name is needed.
 *
 * In light mode the dark logo is shown; in dark mode the white version is shown.
 */
export function Logo({
  height = 32,
  className,
}: {
  height?: number
  className?: string
}) {
  const w = Math.round(height * (140 / 36)) // preserve original aspect ratio

  return (
    <>
      {/* Light mode — dark logo */}
      <Image
        src="/logo.png"
        alt="InTrainin"
        width={w}
        height={height}
        className={cn('dark:hidden', className)}
        style={{ height, width: 'auto' }}
        priority
      />
      {/* Dark mode — white logo */}
      <Image
        src="/logo-white.png"
        alt="InTrainin"
        width={w}
        height={height}
        className={cn('hidden dark:block', className)}
        style={{ height, width: 'auto' }}
        priority
      />
    </>
  )
}
