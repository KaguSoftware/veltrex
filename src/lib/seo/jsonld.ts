import { ORG, SITE_URL } from '@/lib/site'
import { HREFLANG } from './alternates'
import type { Locale } from '@/i18n/routing'

/**
 * Organization plus its three divisions.
 *
 * Type choice: `Organization` with `department`, not `LocalBusiness` and not
 * `ProfessionalService`. The divisions are internal structure rather than
 * separate legal entities, and `department` is the property that says exactly
 * that. `subOrganization` would imply separate entities.
 *
 * Two properties are deliberately OMITTED, and both omissions are honest rather
 * than lazy:
 *
 * - `hasOfferCatalog` needs Offer entities with an itemOffered, normally priced.
 *   With zero confirmed products, services or traded goods, populating it would
 *   mean inventing checkable facts.
 * - `knowsAbout` would either restate `department`, making it redundant, or
 *   assert expertise we cannot substantiate.
 *
 * There is also no WebSite `potentialAction` / SearchAction, because there is no
 * site search. Advertising a search endpoint that does not exist is the most
 * commonly fabricated piece of JSON-LD on corporate sites.
 *
 * Both omissions are tracked in CONTENT-TODO.md.
 */
export function organizationJsonLd(locale: Locale) {
  const departments = (['Technology', 'Investment', 'Trading'] as const).map((name) => ({
    '@type': 'Organization',
    name,
  }))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORG.legalName,
    alternateName: ORG.shortName,
    url: SITE_URL,
    inLanguage: HREFLANG[locale],
    taxID: ORG.taxId,
    department: departments,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.address.street,
      addressLocality: ORG.address.district,
      addressRegion: ORG.address.city,
      addressCountry: 'TR',
      // postalCode omitted: not supplied. See CONTENT-TODO.md item 3.
      ...(ORG.address.postalCode ? { postalCode: ORG.address.postalCode } : {}),
    },
    contactPoint: ORG.phones.map((telephone) => ({
      '@type': 'ContactPoint',
      telephone,
      contactType: 'business',
      areaServed: 'TR',
      availableLanguage: ['tr', 'en'],
    })),
  }
}

/**
 * Serialises JSON-LD for a script tag.
 *
 * `<` is escaped so a value can never terminate the script element early, which
 * is the one real injection risk in this pattern. A script tag with
 * dangerouslySetInnerHTML is still the documented approach in the App Router.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
