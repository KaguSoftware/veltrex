/**
 * Runtime proof, as ONE command on Windows.
 *
 * This script starts the production server itself, waits for it, asserts, then
 * kills the whole process tree. That matters because `next start & curl` is two
 * shells, which would make `npm run verify` not actually one command on
 * Windows. Port 3111 avoids colliding with a stray dev server on 3000.
 *
 * Set CHECK_BASE to run the same assertions against a deployed preview instead
 * of starting a local server:
 *   CHECK_BASE=https://veltrex-abc123.vercel.app node scripts/check-public-urls.mjs
 */
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { routing } from '../src/i18n/routing.ts'
import { ALL_HREFS } from '../src/lib/pages.ts'
import { publicPath } from '../src/lib/paths.ts'

const PORT = 3111
const EXTERNAL = process.env.CHECK_BASE?.replace(/\/+$/, '')
const BASE = EXTERNAL || `http://127.0.0.1:${PORT}`

let failures = 0
let checks = 0

function ok(label, detail = '') {
  checks++
  console.log(`  pass  ${label}${detail ? `  ${detail}` : ''}`)
}
function fail(label, detail) {
  checks++
  failures++
  console.error(`  FAIL  ${label}\n        ${detail}`)
}

const URLS = routing.locales.flatMap((locale) =>
  ALL_HREFS.map((href) => ({ href, locale, path: publicPath(href, locale) })),
)

async function head(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' })
  return {
    status: res.status,
    location: res.headers.get('location'),
    link: res.headers.get('link'),
    cacheControl: res.headers.get('cache-control'),
  }
}
async function body(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' })
  return { status: res.status, html: await res.text() }
}

async function waitForServer(timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/`, { redirect: 'manual' })
      if (res.status > 0) return true
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

/* ------------------------------------------------------------------------- */

async function run() {
  console.log(`\nchecking ${BASE}  (${URLS.length} public URLs)\n`)

  console.log(`1. every public URL returns 200`)
  for (const u of URLS) {
    const r = await head(u.path)
    if (r.status === 200) ok(u.path, '200')
    else fail(u.path, `expected 200, got ${r.status}${r.location ? ` -> ${r.location}` : ''}`)
  }

  console.log('\n2. the Turkish root serves Turkish, and the casing is locale aware')
  {
    const r = await body('/')
    if (r.html.includes('lang="tr"')) ok('/ has lang="tr"')
    else fail('/', 'expected lang="tr"')
    if (r.html.includes('Üç iş kolu')) ok('/ renders Turkish copy', 'Üç iş kolu')
    else fail('/', 'Turkish copy with real diacritics not found')

    /*
     * The strongest available proof that casing is locale aware.
     * "Teknoloji" uppercased the Turkish way is TEKNOLOJİ with a DOTTED capital.
     * A bare toUpperCase(), or CSS text-transform outside Firefox, gives the
     * dotless TEKNOLOJI. Asserting the dotted form present AND the dotless form
     * absent catches a regression in either direction.
     */
    if (r.html.includes('TEKNOLOJİ,')) ok('/ uppercases Turkish correctly', 'dotted İ')
    else fail('/', 'expected TEKNOLOJİ with a dotted capital I')
    if (!r.html.includes('TEKNOLOJI,')) ok('/ has no dotless capital I')
    else fail('/', 'found the dotless TEKNOLOJI, so toUpperCase() or text-transform was used')
  }

  console.log('\n3. a superfluous default-locale prefix redirects rather than duplicating')
  for (const p of ['/tr', '/tr/kurumsal', '/tr/is-kollari']) {
    const r = await head(p)
    if (r.status === 307 || r.status === 308) ok(p, `${r.status} -> ${r.location}`)
    else fail(p, `expected 307 or 308, got ${r.status}. A 200 here is duplicate content.`)
  }

  console.log('\n4. hreflang: reciprocal, x-default on Turkish, and no competing header')
  for (const u of URLS) {
    const r = await body(u.path)
    const trUrl = publicPath(u.href, 'tr')
    const enUrl = publicPath(u.href, 'en')

    const hasTr = /hreflang="tr-TR"/i.test(r.html) && r.html.includes(`${trUrl}"`)
    const hasEn = /hreflang="en"/i.test(r.html) && r.html.includes(`${enUrl}"`)
    const hasDefault = /hreflang="x-default"/i.test(r.html)

    if (hasTr && hasEn && hasDefault) ok(`${u.path} hreflang set complete`)
    else
      fail(
        u.path,
        `hreflang incomplete: tr-TR ${hasTr ? 'ok' : 'MISSING'}, en ${hasEn ? 'ok' : 'MISSING'}, x-default ${hasDefault ? 'ok' : 'MISSING'}`,
      )
  }
  for (const p of ['/', '/en']) {
    const r = await head(p)
    if (!r.link) ok(`${p} has no competing link: header`)
    else fail(p, `unexpected link: header, so alternateLinks is not false: ${r.link}`)
  }

  console.log('\n5. the canonical on each page is its OWN url, never the homepage')
  for (const u of URLS) {
    const r = await body(u.path)
    const expected = `${u.path === '/' ? '' : u.path}`
    const m = /<link rel="canonical" href="([^"]+)"/.exec(r.html)
    if (!m) {
      fail(u.path, 'no canonical link found')
      continue
    }
    const canonicalPath = new URL(m[1]).pathname
    const want = u.path
    if (canonicalPath === want) ok(`${u.path} canonical is self`)
    else
      fail(
        u.path,
        `canonical points at ${canonicalPath} instead of ${want}. A layout-level alternates would do exactly this.`,
      )
    void expected
  }

  console.log('\n6. the language switcher lands on the EQUIVALENT page, not the home page')
  for (const u of URLS) {
    const r = await body(u.path)
    const other = routing.locales.find((l) => l !== u.locale)
    const want = publicPath(u.href, other)
    // The switcher is the only link carrying hreflang in the body.
    const re = new RegExp(`<a[^>]*hrefLang="${other}"[^>]*href="([^"]+)"|<a[^>]*href="([^"]+)"[^>]*hreflang="${other}"`, 'i')
    const m = re.exec(r.html)
    const got = m?.[1] ?? m?.[2]
    if (got === want) ok(`${u.path} switches to ${want}`)
    else fail(u.path, `switcher points at ${got ?? '(not found)'} but the equivalent page is ${want}`)
  }

  console.log('\n7. unknown paths 404, and the STATUS is checked before the body')
  console.log('   (a soft 404 renders correctly and still returns 200, see docs/decisions/0002)')
  for (const p of [
    '/bilinmeyen',
    '/a/b/c',
    '/is-kollari/yok',
    '/en/nope',
    '/en/divisions/nope',
    '/veltrex.pdf',
  ]) {
    const r = await head(p)
    if (r.status === 404) ok(p, '404')
    else fail(p, `expected 404, got ${r.status}. 200 means a SOFT 404.`)
  }

  console.log('\n8. the 404 is a REAL page: chrome, stylesheet, and copy in the initial HTML')
  console.log('   (measured on 16.3.5: a not-found boundary under a dynamic root layout renders')
  console.log('    an EMPTY body outside the layout, so the copy only arrives after hydration)')
  for (const [p, lang, needle, otherHome] of [
    ['/bilinmeyen', 'tr', 'bulunamad', '/en'],
    ['/en/nope', 'en', 'not found', '/'],
    ['/is-kollari/yok', 'tr', 'bulunamad', '/en'],
  ]) {
    const r = await body(p)
    // Strip the RSC flight payload: copy that only appears there is NOT rendered.
    const clean = r.html.replace(/<script>self\.__next_f[\s\S]*?<\/script>/g, '')

    if (r.status === 404) ok(`${p} status 404`)
    else fail(p, `expected 404, got ${r.status}`)

    if (clean.includes(`lang="${lang}"`)) ok(`${p} is in ${lang}`)
    else fail(p, `expected lang="${lang}" on the 404`)

    if (clean.toLowerCase().includes(needle)) ok(`${p} 404 copy is server rendered`)
    else fail(p, 'the 404 copy is missing from the server-rendered HTML, so it needs JS to display')

    if (clean.includes('<header') && clean.includes('<footer'))
      ok(`${p} keeps the header and footer`)
    else fail(p, 'the 404 lost the layout chrome, so it rendered outside the layout')

    if (/rel="stylesheet"/.test(r.html)) ok(`${p} has a stylesheet`)
    else fail(p, 'no stylesheet on the 404, so it renders unstyled')

    if (clean.includes(`href="${otherHome}"`)) ok(`${p} switcher falls back to ${otherHome}`)
    else fail(p, `expected the switcher to fall back to ${otherHome} on an unmatched path`)
  }

  console.log('\n9. robots and sitemap')
  {
    const s = await body('/sitemap.xml')
    const count = (s.html.match(/<url>/g) ?? []).length
    if (count === URLS.length) ok(`sitemap has ${count} urls`)
    else fail('/sitemap.xml', `expected ${URLS.length} <url> entries, found ${count}`)
    if (/hreflang="x-default"/i.test(s.html)) ok('sitemap carries x-default alternates')
    else fail('/sitemap.xml', 'no x-default alternate in the sitemap')

    const rob = await body('/robots.txt')
    // Local builds have no VERCEL_ENV, so they are treated as production.
    if (rob.html.includes('Sitemap:')) ok('robots.txt advertises the sitemap')
    else fail('/robots.txt', 'no Sitemap line')
  }

  console.log('\n10. recorded, not asserted: cache-control on the Turkish root')
  console.log('    (absence is the documented trigger for Plan B, next-intl issue 2037)')
  {
    const r = await head('/')
    console.log(`  note  / cache-control: ${r.cacheControl ?? '(absent)'}`)
  }

  console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'}: ${checks - failures}/${checks} checks passed\n`)
  return failures === 0
}

/* ------------------------------------------------------------------------- */

let child = null

if (!EXTERNAL) {
  /*
   * Spawn Next's JS entrypoint with the current node binary.
   *
   * Not `npx next`, and not node_modules/.bin/next.cmd either. Node 24 refuses
   * to spawn a .cmd without a shell (EINVAL), and passing args WITH a shell
   * concatenates rather than escapes them, which Node warns about as DEP0190.
   * Going straight to the .js file avoids both, on every platform.
   */
  const bin = fileURLToPath(import.meta.resolve('next/dist/bin/next'))
  child = spawn(process.execPath, [bin, 'start', '-p', String(PORT)], {
    stdio: 'ignore',
    shell: false,
  })
}

try {
  if (!(await waitForServer())) {
    console.error(`server did not come up on ${BASE} within the timeout`)
    process.exitCode = 1
  } else {
    process.exitCode = (await run()) ? 0 : 1
  }
} finally {
  if (child?.pid) {
    if (process.platform === 'win32') {
      // child.kill() leaves the `next start` grandchild holding the port.
      spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    } else {
      child.kill()
    }
  }
}
