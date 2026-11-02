import type { InternalHref } from '@/i18n/routing'

/**
 * The four divisions, as data.
 *
 * Order is deliberate and matches the reading order used on the home page and
 * in the header: Technology, Startup, Investment, Trading.
 *
 * `accent` is a position on the single brand ramp, never a new hue, which is
 * how four very different businesses stay visibly one company. The actual
 * values live in globals.css under [data-division].
 */
export const DIVISIONS = [
  { slug: 'technology', href: '/divisions/technology' },
  { slug: 'startup', href: '/divisions/startup' },
  { slug: 'investment', href: '/divisions/investment' },
  { slug: 'trading', href: '/divisions/trading' },
] as const satisfies ReadonlyArray<{ slug: string; href: InternalHref }>

export type DivisionSlug = (typeof DIVISIONS)[number]['slug']
