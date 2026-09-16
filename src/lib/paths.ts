import { routing, type InternalHref, type Locale } from '../i18n/routing.ts'

/**
 * The public pathname for an internal route in a given locale.
 *
 * The import below is RELATIVE rather than using the @/ alias, on purpose: the
 * verification gates load this file with plain node, which does not resolve
 * tsconfig path aliases.
 *
 * Pure data, derived from routing.pathnames, with no next-intl runtime
 * involved. That matters for two reasons: it can be imported by a plain Node
 * script (the verification gates use it, so the assertions cannot drift from
 * the implementation), and it is usable in a Client Component.
 *
 * The default locale is UNPREFIXED, everything else is prefixed. This is the
 * one place that rule is expressed.
 */
export function publicPath(href: InternalHref, locale: Locale): string {
  const entry = routing.pathnames[href]
  const localised = typeof entry === 'string' ? entry : entry[locale]

  if (locale === routing.defaultLocale) return localised
  return localised === '/' ? `/${locale}` : `/${locale}${localised}`
}
