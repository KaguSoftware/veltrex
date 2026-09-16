import { defineRouting } from 'next-intl/routing'

/**
 * The single source of truth for the shape of every URL on this site.
 *
 * Slugs are ASCII-folded on purpose. The correct Turkish spellings are
 * "İş Kolları", "Yatırım" and "İletişim", but percent-encoded URLs are hostile
 * to share, to log and to read aloud. Visible copy always uses the correct
 * Turkish characters; only the slug is folded.
 */
export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',

  /**
   * Turkish is served unprefixed at the root, English is prefixed.
   *
   * Verified against the published 4.14.5 bundle rather than assumed: an
   * unprefixed default-locale path is REWRITTEN, so /is-kollari/teknoloji stays
   * visible in the address bar, while a superfluous /tr prefix REDIRECTS with
   * 307 or 308. That redirect is what prevents duplicate content.
   */
  localePrefix: 'as-needed',

  /**
   * Off on purpose. With detection on, any visitor sending an English
   * accept-language would be bounced off the Turkish root, and that includes
   * Googlebot, which crawls from the US. For a Turkish company whose canonical
   * entry point is "/", the root must always serve Turkish.
   */
  localeDetection: false,

  /**
   * With detection off the cookie has no job left. Dropping it also removes a
   * KVKK consent question and the "sticky locale" surprise where "/" silently
   * serves English because of an earlier visit. See docs/decisions/0001.
   */
  localeCookie: false,

  /**
   * Off deliberately, and this is a change from the default.
   *
   * When enabled, next-intl emits hreflang as an HTTP `Link:` RESPONSE HEADER
   * rather than as HTML tags. A header is invisible in view-source, never gets
   * code reviewed, and is the first thing a CDN rule strips. Google also says
   * there is no benefit to running more than one hreflang method.
   *
   * So `metadata.alternates` in each page is the single authoritative
   * implementation, and the sitemap is generated from the same helper so the
   * two cannot drift. The URL matrix asserts that no `link:` header is present.
   */
  alternateLinks: false,

  /**
   * Localized pathnames. The KEY is the internal route, which is the folder
   * name under app/[locale]. The value is the public URL per locale.
   *
   * v4 allows partial records, where an omitted locale falls back to the key,
   * but both locales are written out for every entry so this map reads as
   * documentation of the whole site.
   *
   * The key is also the only thing the two locales of a page have in common:
   * /is-kollari/teknoloji and /en/divisions/technology share no segment, no
   * prefix and no depth. Never derive one from the other by string surgery.
   */
  pathnames: {
    '/': '/',
    '/divisions': { tr: '/is-kollari', en: '/divisions' },
    '/divisions/technology': { tr: '/is-kollari/teknoloji', en: '/divisions/technology' },
    '/divisions/investment': { tr: '/is-kollari/yatirim', en: '/divisions/investment' },
    '/divisions/trading': { tr: '/is-kollari/ticaret', en: '/divisions/trading' },
    '/about': { tr: '/kurumsal', en: '/about' },
    '/contact': { tr: '/iletisim', en: '/contact' },
    '/privacy': { tr: '/gizlilik-politikasi', en: '/privacy-policy' },
    '/data-protection': { tr: '/kvkk-aydinlatma-metni', en: '/data-protection-notice' },
  },
})

/** Every internal route id, derived so it can never drift from the map above. */
export type InternalHref = keyof typeof routing.pathnames

/** The locale union, derived the same way. */
export type Locale = (typeof routing.locales)[number]

/**
 * Compile-time tripwire. The site is designed around exactly two locales: the
 * language switcher is a single link rather than a menu, and the footer and
 * hreflang helpers assume one alternate. Adding a third locale must be a
 * deliberate change with those pieces revisited, not a quiet edit to the array
 * above, so this fails the typecheck rather than shipping a broken switcher.
 */
type ExactlyTwoLocales = typeof routing.locales extends { length: 2 } ? true : never
export const __exactlyTwoLocales: ExactlyTwoLocales = true
