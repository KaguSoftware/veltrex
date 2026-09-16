import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { publicPath } from './lib/paths'
import { ALL_HREFS } from './lib/pages'

/**
 * Locale routing, plus a real 404 for unknown paths.
 *
 * In Next 16 this file convention is `proxy`, not `middleware`. The import path
 * is still 'next-intl/middleware' on purpose: next-intl 4.14.5 ships no
 * './proxy' entrypoint, so only the FILENAME changed, not the import.
 *
 * Two things about the runtime, both verified: a proxy runs on the Node.js
 * runtime only and that cannot be reconfigured (setting a `runtime` export here
 * throws), and a proxy does NOT force dynamic rendering. It rewrites and
 * redirects in front of prerendered output, which is why this site is both
 * statically generated and served from an unprefixed default locale.
 */
const intlProxy = createMiddleware(routing)

/** Every valid public pathname, in every locale. Built once at module load. */
const KNOWN = new Set(
  routing.locales.flatMap((locale) => [
    ...ALL_HREFS.map((href) => publicPath(href, locale)),
    // The 404 page itself is a real route and must not 404 recursively.
    locale === routing.defaultLocale ? '/404' : `/${locale}/404`,
  ]),
)

/**
 * Paths that carry a SUPERFLUOUS default-locale prefix, for example
 * /tr/kurumsal when Turkish is already served unprefixed at /kurumsal.
 *
 * These must be handed to next-intl rather than 404'd, because it redirects
 * them 307 to the canonical unprefixed form, and that redirect is what stops
 * the same page being reachable at two URLs. An earlier version of this file
 * checked only KNOWN and so returned 404 for every /tr/... path, which the URL
 * matrix caught.
 */
const REDIRECTABLE = new Set(
  ALL_HREFS.map((href) => {
    const canonical = publicPath(href, routing.defaultLocale)
    return canonical === '/' ? `/${routing.defaultLocale}` : `/${routing.defaultLocale}${canonical}`
  }),
)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  /*
   * Unknown paths get a REWRITE to the prerendered 404 page, carrying a 404
   * status. Not a redirect, because the URL the visitor typed should stay in
   * the address bar, and not React's notFound(), because with the root layout
   * under a dynamic segment that renders an empty body outside the layout.
   * See src/app/[locale]/404/page.tsx for the measurements.
   *
   * Checked before handing over to next-intl, so a bad path never becomes a
   * locale redirect first.
   */
  if (!KNOWN.has(pathname) && !REDIRECTABLE.has(pathname)) {
    const isPrefixed = routing.locales.some(
      (l) => l !== routing.defaultLocale && (pathname === `/${l}` || pathname.startsWith(`/${l}/`)),
    )
    const locale = isPrefixed
      ? pathname.split('/')[1]
      : routing.defaultLocale

    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/404`
    return NextResponse.rewrite(url, { status: 404 })
  }

  return intlProxy(request)
}

export const config = {
  /**
   * The matcher is not optional in practice. Without one, this proxy would run
   * on every request including _next/static and _next/image, which
   * intermittently breaks CSS, JS and image loading.
   *
   * Read the negative lookahead carefully, because the last clauses are the
   * subtle ones and the four image conventions exist to fix a real,
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
   * Do not remove those four clauses.
   *
   * Note that `.*\..*` also excludes dotted paths such as /veltrex.pdf from the
   * proxy, so those reach the filesystem and get Next's own 404 rather than the
   * branded one. That is an accepted trade: narrowing it would mean listing
   * every real asset extension, and a request for a non-existent file is not a
   * page view worth branding.
   */
  matcher: [
    '/((?!api|trpc|_next|_vercel|.*\\..*|.*opengraph-image|.*twitter-image|.*apple-icon|.*icon-).*)',
  ],
}
