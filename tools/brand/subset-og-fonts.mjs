/**
 * Subsets the display and body faces into small TTFs for the Open Graph image.
 *
 * This step is NOT optional, for two independent reasons:
 *
 * 1. next/font downloads woff2, and Satori (which renders ImageResponse) cannot
 *    read woff2. So the OG image needs its own font file regardless.
 * 2. The full Source Serif 4 variable TTF is about 1.2MB, and the documented
 *    ImageResponse bundle cap is 500KB.
 *
 * And the reason the character set below is explicit rather than "latin":
 * Satori does not subset and does not fall back per glyph across your own
 * faces. It renders with the exact file handed to it, so a font missing
 * U+011E, U+0130 or U+015E renders Turkish copy as tofu in the social card
 * while looking perfect on the page itself.
 *
 * Note that testing with only the dotless i passes FALSELY, because U+0131 sits
 * inside Google's `latin` range by an explicit carve-out. Test with real
 * strings that need the other four.
 *
 * Usage: npm run brand:og-fonts
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import subsetFont from 'subset-font'

/** Every character the OG image can render, plus the Turkish set in full. */
const CHARS = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  ' .,:;!?()[]{}<>/\\|-_+=&%#@*"’“”',
  // Turkish, both cases. These are the ones that turn to tofu if dropped.
  'Çç', // C cedilla
  'Ğğ', // G breve
  'İı', // dotted capital I, dotless lowercase i
  'Öö', // O diaeresis
  'Şş', // S cedilla
  'Üü', // U diaeresis
  'âîû', // circumflexes, occasionally used in Turkish
].join('')

/*
 * Both sources are VARIABLE fonts, and that is what dominated the size before
 * this: subsetting Source Serif 4 to 108 characters still left 320KB, because
 * the opsz and wght variation tables survive a glyph subset untouched.
 *
 * Pinning each axis to a single value instantiates a static instance and drops
 * that machinery. The OG image only ever renders one weight per face, so
 * nothing is lost.
 */
const FACES = [
  { name: 'SourceSerif4', label: 'display', axes: { opsz: 60, wght: 400 } },
  { name: 'PlusJakartaSans', label: 'body', axes: { wght: 500 } },
]

/*
 * The real constraint is the documented 500KB ImageResponse bundle cap, which
 * both fonts share with the route's own code. 120KB per face keeps the pair
 * near 100KB and leaves generous headroom, while still failing loudly if a
 * future font swap reintroduces variation tables (unpinned, Source Serif 4
 * subsets to 320KB rather than 71KB, which would eat most of the budget).
 */
const MAX_BYTES = 120 * 1024
const MAX_COMBINED = 200 * 1024

let failed = 0
let combined = 0
console.log(`subsetting to ${new Set(CHARS).size} unique characters\n`)

for (const face of FACES) {
  const src = `assets/fonts/${face.name}-full.ttf`
  const out = `assets/fonts/${face.name}-og.ttf`

  const before = statSync(src).size
  // targetFormat 'sfnt' is TTF. Satori cannot read woff or woff2.
  const buffer = await subsetFont(readFileSync(src), CHARS, {
    targetFormat: 'sfnt',
    variationAxes: face.axes,
  })
  writeFileSync(out, buffer)

  const pct = ((1 - buffer.length / before) * 100).toFixed(1)
  console.log(`${face.name} (${face.label})`)
  console.log(`  ${before} -> ${buffer.length} bytes  (${pct}% smaller)`)

  combined += buffer.length
  if (buffer.length <= MAX_BYTES) console.log(`  pass  under ${MAX_BYTES} bytes`)
  else {
    console.error(`  FAIL  ${buffer.length} bytes exceeds the ${MAX_BYTES} budget`)
    failed++
  }
}

if (combined <= MAX_COMBINED) console.log(`
combined ${combined} bytes, under the ${MAX_COMBINED} budget`)
else {
  console.error(`
FAIL combined ${combined} bytes exceeds ${MAX_COMBINED}`)
  failed++
}

/*
 * Prove the Turkish glyphs actually survived, by checking the subset font's
 * cmap rather than trusting the subsetter. This is the assertion that would
 * have caught tofu before it shipped.
 */
console.log('\nverifying the Turkish glyphs survived')
const REQUIRED = [
  ['Ğ', 'G breve, capital'],
  ['ğ', 'g breve'],
  ['İ', 'I with dot, capital'],
  ['ı', 'dotless i'],
  ['Ş', 'S cedilla, capital'],
  ['ş', 's cedilla'],
  ['Ç', 'C cedilla, capital'],
  ['Ü', 'U diaeresis, capital'],
]

for (const face of FACES) {
  const buf = readFileSync(`assets/fonts/${face.name}-og.ttf`)
  const codepoints = readCmap(buf)
  const missing = REQUIRED.filter(([ch]) => !codepoints.has(ch.codePointAt(0)))
  if (missing.length === 0) {
    console.log(`  pass  ${face.name} has all ${REQUIRED.length} required Turkish glyphs`)
  } else {
    console.error(
      `  FAIL  ${face.name} is MISSING: ${missing.map(([ch, n]) => `${n} (U+${ch.codePointAt(0).toString(16).toUpperCase()})`).join(', ')}`,
    )
    failed++
  }
}

/** Minimal cmap reader: returns the set of mapped codepoints (formats 4 and 12). */
function readCmap(buf) {
  const out = new Set()
  const numTables = buf.readUInt16BE(4)
  let cmapOffset = null
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16
    if (buf.toString('latin1', rec, rec + 4) === 'cmap') cmapOffset = buf.readUInt32BE(rec + 8)
  }
  if (cmapOffset === null) return out

  const n = buf.readUInt16BE(cmapOffset + 2)
  for (let i = 0; i < n; i++) {
    const sub = cmapOffset + buf.readUInt32BE(cmapOffset + 4 + i * 8 + 4)
    const format = buf.readUInt16BE(sub)

    if (format === 4) {
      const segX2 = buf.readUInt16BE(sub + 6)
      const ends = sub + 14
      const starts = ends + segX2 + 2
      for (let s = 0; s < segX2 / 2; s++) {
        const end = buf.readUInt16BE(ends + s * 2)
        const start = buf.readUInt16BE(starts + s * 2)
        if (start === 0xffff) continue
        for (let c = start; c <= end && c !== 0xffff; c++) out.add(c)
      }
    } else if (format === 12) {
      const groups = buf.readUInt32BE(sub + 12)
      for (let g = 0; g < groups; g++) {
        const o = sub + 16 + g * 12
        const start = buf.readUInt32BE(o)
        const end = buf.readUInt32BE(o + 4)
        for (let c = start; c <= end; c++) out.add(c)
      }
    }
  }
  return out
}

if (failed) {
  console.error(`\n${failed} problem(s)`)
  process.exit(1)
}
console.log('\nog fonts ok')
