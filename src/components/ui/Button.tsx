import type { ComponentProps, ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { Arrow } from './Arrow'

type Variant = 'solid' | 'ghost'

/*
 * Two variants only. Solid is brand blue and is reserved for the one primary
 * action in a view. Ghost is a hairline outline that takes its colours from the
 * ground it sits on, so the same component works on navy and on paper.
 *
 * Both fill on hover with a sweep cut at the seam angle, defined in globals.css.
 */

type LinkProps = ComponentProps<typeof Link> & {
  variant?: Variant
  arrow?: boolean
  children: ReactNode
}

export function ButtonLink({ variant = 'solid', arrow = true, className = '', children, ...rest }: LinkProps) {
  return (
    <Link className={`btn btn--${variant} ${className}`} {...rest}>
      <span>{children}</span>
      {arrow ? <Arrow className="btn-arrow" /> : null}
    </Link>
  )
}

type AnchorProps = ComponentProps<'a'> & { variant?: Variant; children: ReactNode }

/** For destinations outside the route map, such as tel: links. */
export function ButtonAnchor({ variant = 'ghost', className = '', children, ...rest }: AnchorProps) {
  return (
    <a className={`btn btn--${variant} ${className}`} {...rest}>
      {children}
    </a>
  )
}
