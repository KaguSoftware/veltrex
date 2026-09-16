import type { ReactNode } from 'react'

type Tone = 'navy' | 'void' | 'paper' | 'deep'

type Props = {
  children: ReactNode
  tone?: Tone
  className?: string
  id?: string
  'aria-labelledby'?: string
}

/**
 * A full-width band. The page alternates navy and paper bands, the way a
 * curtain wall alternates glass and slab.
 *
 * data-ground is what re-points every text, rule and focus role for the dark
 * grounds. Without it a keyboard user gets a 2.91:1 focus ring on navy, which
 * fails WCAG 1.4.11. See globals.css.
 */
export function Band({ children, tone = 'paper', className = '', id, ...rest }: Props) {
  const dark = tone === 'navy' || tone === 'void'
  return (
    <section
      id={id}
      data-ground={dark ? tone : undefined}
      className={`band ${tone === 'deep' ? 'band--deep' : ''} ${className}`}
      {...rest}
    >
      {children}
    </section>
  )
}
