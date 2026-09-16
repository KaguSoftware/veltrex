import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * Locale routing. In Next 16 this file convention is `proxy`, not `middleware`.
 *
 * The import path is still 'next-intl/middleware' on purpose: next-intl 4.14.5
 * ships no './proxy' entrypoint, so only the FILENAME changed, not the import.
 *
 * Two things about the runtime, both verified: a proxy runs on the Node.js
 * runtime only and that cannot be reconfigured (setting a `runtime` export here
 * throws), and a proxy does NOT force dynamic rendering. It rewrites and
 * redirects in front of prerendered output, which is why this site is both
 * statically generated and served from an unprefixed default locale.
 */
export default createMiddleware(routing)

export const config = {
  /**
   * The matcher is not optional in practice. Without one, this proxy would run
   * on every request including _next/static and _next/image, which
   * intermittently breaks CSS, JS and image loading.
   *
   * Read the negative lookahead carefully, because the last clause is the
   * subtle one and the four image conventions after it exist to fix a real,
   * undocumented bug:
   *
   *   Next builds metadata image URLs from the INTERNAL route, so the Turkish
   *   Open Graph image is requested at /tr/opengraph-image-<hash>. That path
   *   contains no dot, so the generic `.*\..*` escape clause does NOT exclude
   *   it. It therefore reaches this proxy, and because localePrefix is
   *   'as-needed' the proxy redirects the superfluous /tr prefix away to a path
   *   that does not exist.
   *
   *   English at /en/opengraph-image-<hash> resolves fine, so ONLY the default
   *   locale's social card breaks, which is the one nobody thinks to test.
   *
   * The URL matrix asserts both locales return 200 rather than 3xx for these.
   * Do not remove these four clauses.
   */
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*|.*opengraph-image|.*twitter-image|.*apple-icon|.*icon-).*)',
  ],
}
