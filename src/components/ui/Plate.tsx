import type { ReactNode } from 'react'

/**
 * A raised surface. Square corners and a navy tinted shadow, never a black one.
 * The seam is a 1px top edge cut at the brand angle, which is the cheapest way
 * to carry the logo's fold into the layout.
 */
export function Plate({
  children,
  className = '',
  seam = false,
}: {
  children: ReactNode
  className?: string
  seam?: boolean
}) {
  return (
    <div
      className={`relative bg-[var(--surface-raised)] shadow-(--shadow-plate) ${className}`}
    >
      {seam ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-[var(--division-accent)]"
        />
      ) : null}
      {children}
    </div>
  )
}
