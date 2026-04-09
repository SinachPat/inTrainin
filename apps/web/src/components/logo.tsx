import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * The InTrainin logo mark — two stacked rectangles from the brand identity.
 * Rendered as inline SVG so it scales perfectly and requires no image request.
 *
 * Usage:
 *   <LogoMark size={28} />               — icon only, fills with currentColor
 *   <LogoMark size={28} className="..." />
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  // Proportions derived from the brand identity sheet
  const w = size
  const topH    = Math.round(size * 0.58)   // ~58% of height for the main block
  const barH    = Math.round(size * 0.21)   // ~21% for the bottom bar
  const barW    = Math.round(size * 0.72)   // bar is slightly narrower than full width
  const gap     = Math.round(size * 0.12)   // gap between block and bar
  const totalH  = topH + gap + barH

  return (
    <svg
      width={w}
      height={totalH}
      viewBox={`0 0 ${w} ${totalH}`}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Main block */}
      <rect x={0} y={0} width={w} height={topH} rx={Math.round(size * 0.08)} />
      {/* Bottom bar */}
      <rect x={0} y={topH + gap} width={barW} height={barH} rx={Math.round(size * 0.06)} />
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
