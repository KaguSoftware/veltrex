import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Paints the navy ground, which also re-points the focus ring via [data-ground]. */
  ground?: 'paper' | 'brand' | 'sunken'
  className?: string
  id?: string
}

const grounds = {
  paper: '',
  sunken: 'bg-[var(--surface-sunken)]',
  brand: 'bg-[var(--color-brand-900)]',
}

export function SectionShell({ children, ground = 'paper', className = '', id }: Props) {
  return (
    <section
      id={id}
      // data-ground is what swaps the focus ring to a step that actually
      // contrasts with navy. Without it a keyboard user gets a 2.91:1 ring,
      // which fails WCAG 1.4.11. See globals.css.
      data-ground={ground === 'brand' ? 'brand' : undefined}
      className={`${grounds[ground]} ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 lg:py-28">{children}</div>
    </section>
  )
}
