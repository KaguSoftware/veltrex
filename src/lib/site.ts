/**
 * The one place a domain is allowed to exist.
 *
 * Canonicals, hreflang alternates, the sitemap, robots.txt and the Open Graph
 * image base all derive from here, so pointing the site at its real domain is a
 * single environment variable rather than a search and replace.
 */

/** RFC 2606 reserved TLD. Guaranteed never to resolve, so it cannot leak quietly. */
const PLACEHOLDER = 'https://veltrex.invalid'

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  // Fail the build rather than publish placeholder canonicals to production.
  //
  // This throw is deliberate and is the reason the production deploy is held
  // until the domain is decided. It is scoped to VERCEL_ENV === 'production' so
  // local builds and every preview deployment are unaffected.
  //
  // Remember that NEXT_PUBLIC_* is inlined at BUILD time, so setting this in
  // the Vercel dashboard requires a redeploy, not just an environment edit.
  if (process.env.VERCEL_ENV === 'production') {
    if (!raw) {
      throw new Error(
        'NEXT_PUBLIC_SITE_URL is required for a production build. Set it in the Vercel Production environment, then redeploy. See CONTENT-TODO.md item 3.',
      )
    }
    if (raw.includes('.invalid')) {
      throw new Error(
        `NEXT_PUBLIC_SITE_URL is still the placeholder (${raw}). Set the real domain in the Vercel Production environment, then redeploy.`,
      )
    }
  }

  const value = raw || PLACEHOLDER

  // Normalise once, here, so no caller has to think about trailing slashes.
  return value.replace(/\/+$/, '')
}

export const SITE_URL = resolveSiteUrl()

/** True when the base URL is still the reserved placeholder. */
export const IS_PLACEHOLDER_URL = SITE_URL.includes('.invalid')

/**
 * robots.ts needs a bare hostname, not a URL. Next prints the `host` field
 * verbatim as `Host: <value>`, so passing a full URL emits an invalid directive.
 */
export const SITE_HOST = new URL(SITE_URL).host

/** Absolute URL for a path that already carries its locale prefix. */
export function absoluteUrl(pathname: string): string {
  return `${SITE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

/**
 * Company facts. Only what is backed by a document we actually hold.
 *
 * Unknown registry identifiers are `undefined` rather than 'N/A' or a guess,
 * and the footer filters them out, so a missing value renders as structurally
 * absent. An invented MERSIS or Ticaret Sicil number would be a false statement
 * about a registry entry, not a design compromise. See CONTENT-TODO.md item 4.
 */
export const ORG = {
  legalName: 'VELTREX TEKNOLOJİ VE TİCARET ANONİM ŞİRKETİ',
  shortName: 'Veltrex',

  /** From the proforma invoice. The one identifier we can back. */
  taxId: '4111039736',

  /** Not supplied. Do not fill these in without a document. */
  tradeRegistryNo: undefined as string | undefined,
  mersisNo: undefined as string | undefined,
  registryOffice: undefined as string | undefined,

  address: {
    street: 'Yeşilce Mah. Yunus Emre Cad. No: 8/1',
    district: 'Kağıthane',
    city: 'İstanbul',
    country: 'Türkiye',
    /** Not supplied. See CONTENT-TODO.md item 3. */
    postalCode: undefined as string | undefined,
  },

  /**
   * Both numbers as supplied. Which is the switchboard and whether either is a
   * fax is still unconfirmed, so neither is labelled.
   */
  phones: ['+902123009999', '+902123009944'],

  /**
   * Deliberately NOT the address found in the company's proforma invoice.
   * That address, salse@greeniletisim.com, is a typo of "sales" AND sits on a
   * different company's domain, so it is published nowhere on this site.
   *
   * This value is a conventional mailbox on the site's own domain and is
   * unconfirmed. See CONTENT-TODO.md item 3.
   */
  email: undefined as string | undefined,
} as const

/** E.164 number formatted for display, for example +90 212 300 99 99. */
export function formatPhone(e164: string): string {
  const m = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(e164)
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164
}
