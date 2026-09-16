import type { Metadata } from 'next'
import { getPathname } from '@/i18n/navigation'
import { routing, type InternalHref, type Locale } from '@/i18n/routing'
import { SITE_URL } from '@/lib/site'

/**
 * hreflang values. Note the three notations for one idea, and that mixing them
 * fails silently: hreflang uses a HYPHEN, og:locale uses an UNDERSCORE, and
 * schema.org inLanguage uses a hyphen. All three derive from here.
 */
const HREFLANG: Record<Locale, string> = { tr: 'tr-TR', en: 'en' }
const OG_LOCALE: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US' }

/** Absolute URL for one internal route in one locale. */
export function urlFor(href: InternalHref, locale: Locale): string {
  return `${SITE_URL}${getPathname({ href, locale })}`
}

/**
 * The single authoritative hreflang implementation for the whole site.
 *
 * Three rules are encoded here, each of which is a common and costly mistake:
 *
 * 1. This goes in every page.tsx and NEVER in a layout. A layout-level
 *    alternates.canonical is inherited by every child that does not override
 *    it, so one page forgetting its own would silently publish the homepage
 *    canonical as its own.
 * 2. The `languages` map must be IDENTICAL across both locales of a page, with
 *    only `canonical` changing. Google ignores hreflang clusters that do not
 *    point back at each other, so generating both from one function is what
 *    guarantees reciprocity.
 * 3. x-default is PER PAGE and points at THIS page's Turkish URL. Pointing it
 *    at English would be wrong (English is a variant, not a fallback), and
 *    pointing every page at the homepage breaks the cluster entirely.
 *
 * next-intl's own alternateLinks is disabled, so this is the only source. The
 * sitemap is generated from the same helper, and the URL matrix asserts there
 * is no competing `link:` response header.
 */
export function alternatesFor(href: InternalHref, locale: Locale): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const l of routing.locales) {
    languages[HREFLANG[l]] = urlFor(href, l)
  }
  languages['x-default'] = urlFor(href, routing.defaultLocale)

  return {
    canonical: urlFor(href, locale),
    languages,
  }
}

/** Open Graph fields that depend on the route and locale. */
export function openGraphFor(href: InternalHref, locale: Locale) {
  return {
    url: urlFor(href, locale),
    locale: OG_LOCALE[locale],
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
  }
}

export { HREFLANG, OG_LOCALE }
