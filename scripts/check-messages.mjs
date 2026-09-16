/**
 * Asserts the message catalogues are structurally identical.
 *
 * The AppConfig Messages type is derived from messages/tr.json alone, which is
 * the correct bias for a Turkish-first site: Turkish is the source and English
 * is the translation. But it means the type system is BLIND in one direction.
 * A key present in tr.json and missing from en.json typechecks perfectly and
 * then renders the raw key path to an English visitor at runtime.
 *
 * This gate closes that hole, and also checks two Turkish-specific things that
 * no type can express.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'messages'
const REFERENCE = 'tr'

const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))
const catalogues = new Map(
  files.map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(DIR, f), 'utf8'))]),
)

if (!catalogues.has(REFERENCE)) {
  console.error(`check-messages: the reference catalogue ${DIR}/${REFERENCE}.json is missing`)
  process.exit(1)
}

/** Flatten to dotted paths so nested namespaces compare cleanly. */
function paths(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...paths(v, p))
    else out.push(p)
  }
  return out
}

let bad = 0
const reference = paths(catalogues.get(REFERENCE)).sort()

for (const [locale, cat] of catalogues) {
  if (locale === REFERENCE) continue
  const own = paths(cat).sort()
  const missing = reference.filter((p) => !own.includes(p))
  const extra = own.filter((p) => !reference.includes(p))

  for (const p of missing) {
    console.error(`${DIR}/${locale}.json  MISSING  ${p}`)
    bad++
  }
  for (const p of extra) {
    console.error(`${DIR}/${locale}.json  EXTRA    ${p}  (not in the ${REFERENCE} reference, so it is unreachable and untyped)`)
    bad++
  }
}

/* Empty values, in any catalogue. An empty string renders as nothing at all. */
for (const [locale, cat] of catalogues) {
  for (const p of paths(cat)) {
    const value = p.split('.').reduce((o, k) => o?.[k], cat)
    if (typeof value === 'string' && value.trim() === '') {
      console.error(`${DIR}/${locale}.json  EMPTY    ${p}`)
      bad++
    }
  }
}

/*
 * No pre-cased ALL CAPS values, in any catalogue.
 *
 * The first version of this gate tried to detect a WRONGLY uppercased Turkish
 * string, and that turned out to be undecidable, which is worth recording so
 * nobody tries again. Turkish has two i letters, so given the output "TEKNOLOJI"
 * you cannot tell whether the author meant:
 *
 *   "teknoloji" uppercased correctly, which is TEKNOLOJİ with a dotted capital
 *   "teknolojı" uppercased correctly, which is TEKNOLOJI with a dotless capital
 *
 * Both are legitimate, and real Turkish copy contains both ("Yatırım" genuinely
 * uppercases to YATIRIM with a dotless I). The information needed to judge it
 * is destroyed by the casing itself.
 *
 * So the rule is decidable instead: catalogues store NATURAL CASE only, and any
 * uppercase styling is applied by toLocaleUpperCase(locale) at render time,
 * which is locale-aware and server-side. CSS text-transform stays banned
 * because only Firefox implements Turkic case mapping.
 */
for (const [locale, cat] of catalogues) {
  for (const p of paths(cat)) {
    const value = p.split('.').reduce((o, k) => o?.[k], cat)
    if (typeof value !== 'string') continue

    const letters = value.replace(/[^\p{L}]/gu, '')
    if (letters.length < 3) continue
    if (letters !== letters.toLocaleUpperCase(locale)) continue

    console.error(
      `${DIR}/${locale}.json  ALLCAPS  ${p}\n    value: ${value}\n    Store natural case and uppercase at render time with toLocaleUpperCase(locale). A pre-cased Turkish string cannot be verified, because TEKNOLOJI is a valid uppercase of both "teknoloji" and "teknolojı".`,
    )
    bad++
  }
}

if (bad > 0) {
  console.error(`\ncheck-messages: ${bad} problem${bad === 1 ? '' : 's'} across ${catalogues.size} catalogues.`)
  process.exit(1)
}
console.log(
  `check-messages: clean (${catalogues.size} catalogues, ${reference.length} keys each, reference ${REFERENCE})`,
)
