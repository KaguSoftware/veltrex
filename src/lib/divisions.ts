import type { InternalHref } from '@/i18n/routing'

/**
 * The three divisions, as data.
 *
 * Order is deliberate and matches the brand tagline reading: Technology and
 * Trading are both named in "Teknoloji, Ticaret", with Investment between them.
 *
 * `accent` is a position on the single brand ramp, never a new hue, which is
 * how three very different businesses stay visibly one company. The actual
 * values live in globals.css under [data-division].
 */
export const DIVISIONS = [
  { slug: 'technology', href: '/divisions/technology' },
  { slug: 'investment', href: '/divisions/investment' },
  { slug: 'trading', href: '/divisions/trading' },
] as const satisfies ReadonlyArray<{ slug: string; href: InternalHref }>

export type DivisionSlug = (typeof DIVISIONS)[number]['slug']
