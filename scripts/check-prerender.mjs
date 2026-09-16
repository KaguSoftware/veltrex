/**
 * Asserts every page really is prerendered, and that nothing has silently gone
 * dynamic.
 *
 * Reads .next/prerender-manifest.json rather than scraping the console table,
 * because Next 16 removed the size and First Load JS columns and the symbol
 * legend moves between versions. The manifest shape
 * {version, routes, dynamicRoutes, notFoundRoutes, preview} is stable.
 */
import { readFileSync } from 'node:fs'
import { routing } from '../src/i18n/routing.ts'
import { ALL_HREFS } from '../src/lib/pages.ts'

const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8'))
const routes = Object.keys(manifest.routes)
const dynamicRoutes = Object.keys(manifest.dynamicRoutes ?? {})

let failures = 0
const ok = (m) => console.log(`  pass  ${m}`)
const fail = (m) => {
  console.error(`  FAIL  ${m}`)
  failures++
}

console.log('\nprerender manifest')
console.log(`  version ${manifest.version}, ${routes.length} routes, ${dynamicRoutes.length} dynamic\n`)

/*
 * The INTERNAL route paths, which is what the manifest keys are. The public
 * Turkish URLs are unprefixed, but internally every page lives under its locale
 * segment, so /is-kollari/teknoloji is prerendered as /tr/divisions/technology.
 */
const expected = routing.locales.flatMap((locale) =>
  ALL_HREFS.map((href) => (href === '/' ? `/${locale}` : `/${locale}${href}`)),
)

/*
 * Asserted as a SUBSET, not an exact list. Whether cached metadata routes such
 * as /favicon.ico appear in the manifest is an internal detail a Next patch can
 * change, and an exact assertion would fail the build on a true statement.
 */
const missing = expected.filter((r) => !routes.includes(r))
if (missing.length === 0) ok(`all ${expected.length} page routes are prerendered`)
else fail(`not prerendered: ${missing.join(', ')}`)

/*
 * The negative half, and the reason this gate exists at all.
 *
 * Read the two manifests carefully, because the naming is misleading and an
 * earlier version of this check asserted the opposite of the truth:
 *
 *   routes-manifest.dynamicRoutes     every route template with a dynamic
 *                                     segment. Says nothing about rendering.
 *   prerender-manifest.dynamicRoutes  the subset of those templates that
 *                                     HAVE prerendered instances. Appearing
 *                                     here is GOOD.
 *
 * So a page that starts reading cookies, headers or an uncached fetch drops OUT
 * of the prerender manifest while staying in the routes manifest. The set
 * difference between the two is therefore exactly the set of genuinely
 * on-demand routes.
 *
 * EVERY route must be prerendered. There is no allowed exception, because the
 * 404 is a real prerendered page reached by a proxy rewrite rather than a
 * catch-all route calling notFound(). See docs/decisions/0002.
 */
const routesManifest = JSON.parse(readFileSync('.next/routes-manifest.json', 'utf8'))
const allTemplates = (routesManifest.dynamicRoutes ?? []).map((r) => r.page)
const onDemand = allTemplates.filter((r) => !dynamicRoutes.includes(r))

if (onDemand.length === 0) {
  ok('zero routes are server rendered on demand')
} else {
  fail(
    `these routes are rendered ON DEMAND and should be prerendered: ${onDemand.join(', ')}\n        A page probably started using cookies(), headers(), searchParams or an uncached fetch.`,
  )
}

/* The 404 page must itself be prerendered, in both locales. */
for (const locale of routing.locales) {
  const path = `/${locale}/404`
  if (routes.includes(path)) ok(`${path} is prerendered`)
  else fail(`${path} is not prerendered, so the proxy rewrite would hit a missing page`)
}

/* Second, independent proof: the HTML actually exists on disk. */
const sample = ['tr/divisions/technology', 'en/divisions/technology', 'tr/privacy', 'en/about']
for (const s of sample) {
  try {
    readFileSync(`.next/server/app/${s}.html`)
    ok(`.next/server/app/${s}.html exists`)
  } catch {
    fail(`.next/server/app/${s}.html is missing, so that page did not prerender`)
  }
}

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'}: check-prerender\n`)
process.exit(failures === 0 ? 0 : 1)
