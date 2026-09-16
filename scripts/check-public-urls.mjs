/**
 * Runtime proof, as ONE command on Windows.
 *
 * This script starts the production server itself, waits for it, asserts, then
 * kills the whole process tree. That matters because `next start & curl` is two
 * shells, which means `npm run verify` would not actually be one command on
 * Windows. Port 3111 avoids colliding with a stray dev server on 3000.
 *
 * Set CHECK_BASE to run the same assertions against a deployed preview instead
 * of starting a local server:
 *   CHECK_BASE=https://veltrex-abc123.vercel.app node scripts/check-public-urls.mjs
 */
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

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

/** Fetch without following redirects, so a 3xx is observable. */
async function head(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' })
  return {
    status: res.status,
    location: res.headers.get('location'),
    link: res.headers.get('link'),
    contentType: res.headers.get('content-type'),
    cacheControl: res.headers.get('cache-control'),
  }
}

async function body(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' })
  return { status: res.status, html: await res.text() }
}

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/`, { redirect: 'manual' })
      if (res.status > 0) return true
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

/* ------------------------------------------------------------------------- */

/** The unprefixed Turkish URLs and the prefixed English ones. */
const TR_PATHS = ['/']
const EN_PATHS = ['/en']

async function run() {
  console.log(`\nchecking ${BASE}\n`)

  console.log('1. every public URL returns 200')
  for (const p of [...TR_PATHS, ...EN_PATHS]) {
    const r = await head(p)
    if (r.status === 200) ok(p, '200')
    else fail(p, `expected 200, got ${r.status}${r.location ? ` -> ${r.location}` : ''}`)
  }

  console.log('\n2. the Turkish root serves Turkish, and the casing is locale aware')
  {
    const r = await body('/')
    if (r.html.includes('lang="tr"')) ok('/ has lang="tr"')
    else fail('/', 'expected lang="tr" in the HTML')

    // Turkish copy with a diacritic that only appears if the right catalogue loaded.
    if (r.html.includes('Üç iş kolu')) ok('/ renders Turkish copy', 'Üç iş kolu')
    else fail('/', 'Turkish copy with real diacritics not found')

    /*
     * The strongest available proof that casing is locale aware, and the whole
     * reason lib/text.ts exists.
     *
     * "Teknoloji" uppercased the Turkish way gives TEKNOLOJİ with a DOTTED
     * capital. A bare toUpperCase(), or a CSS text-transform in any browser
     * other than Firefox, gives TEKNOLOJI with a dotless capital. Asserting the
     * dotted form present AND the dotless form absent catches a regression in
     * either direction.
     */
    if (r.html.includes('TEKNOLOJİ,')) ok('/ uppercases Turkish correctly', 'dotted İ present')
    else fail('/', 'expected TEKNOLOJİ with a dotted capital I, which is what toLocaleUpperCase("tr") produces')

    if (!r.html.includes('TEKNOLOJI,')) ok('/ has no dotless capital I', 'bare toUpperCase not used')
    else fail('/', 'found TEKNOLOJI with a DOTLESS capital I, so something used toUpperCase() or CSS text-transform')
  }

  console.log('\n3. a superfluous /tr prefix redirects (307 or 308)')
  for (const p of ['/tr']) {
    const r = await head(p)
    if (r.status === 307 || r.status === 308) ok(p, `${r.status} -> ${r.location}`)
    else fail(p, `expected 307 or 308, got ${r.status}. A 200 here means duplicate content.`)
  }

  console.log('\n4. no hreflang Link response header (metadata.alternates must be the only source)')
  for (const p of ['/', '/en']) {
    const r = await head(p)
    if (!r.link) ok(`${p} has no link: header`)
    else fail(p, `unexpected link: header, so alternateLinks is not false: ${r.link}`)
  }

  console.log('\n5. metadata image conventions resolve rather than redirect')
  console.log('   (the Turkish one is the one that silently breaks behind the proxy)')
  for (const p of ['/favicon.ico']) {
    const r = await head(p)
    if (r.status === 200) ok(p, '200')
    else fail(p, `expected 200, got ${r.status}${r.location ? ` -> ${r.location}` : ''}`)
  }

  console.log('\n6. unknown paths 404, and the STATUS is checked before the body')
  console.log('   (a soft 404 renders correctly and still returns 200, see docs/decisions/0002)')
  for (const p of ['/bilinmeyen', '/a/b/c', '/en/nope']) {
    const r = await head(p)
    if (r.status === 404) ok(p, '404')
    else fail(p, `expected 404, got ${r.status}. 200 means a SOFT 404.`)
  }

  console.log('\n7. recorded, not asserted: cache-control on the Turkish root')
  console.log('   (absence is the documented trigger for Plan B, next-intl issue 2037)')
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

let passed = false
try {
  if (!(await waitForServer())) {
    console.error(`server did not come up on ${BASE} within the timeout`)
    process.exitCode = 1
  } else {
    passed = await run()
    process.exitCode = passed ? 0 : 1
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
