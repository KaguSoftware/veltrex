/**
 * Fails the build if pure black or pure white is used as a DESIGN VALUE.
 *
 * Two false-positive directions were found in review and both are handled, so
 * do not "simplify" this into a single regex:
 *
 * 1. A comma-only rgba pattern cannot see `rgb(0 0 0 / .2)`, which is the
 *    modern space-separated syntax and is this codebase's own idiom. Both
 *    syntaxes are matched.
 * 2. A bare /\b(black|white)\b/ fires on the theme file's own prose, which
 *    legitimately says "navy tinted near blacks" and "warm off whites". So the
 *    keywords are only matched in VALUE POSITION, meaning after a colon or
 *    inside a colour function, and comments are stripped first.
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const TARGETS = /\.(css|ts|tsx|js|jsx|mjs|svg|html)$/i

/** Strip CSS and JS comments so prose inside them cannot trigger a match. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + m.slice(p1.length).replace(/./g, ' '))
}

const RULES = [
  {
    name: 'pure white hex',
    // #fff, #ffff, #ffffff, #ffffffff
    re: /#(?:fff|ffff|ffffff|ffffffff)\b/gi,
  },
  {
    name: 'pure black hex',
    re: /#(?:000|0000|000000|000000ff)\b/gi,
  },
  {
    name: 'pure black rgb, either syntax',
    // rgb(0,0,0) / rgba(0, 0, 0, .5) / rgb(0 0 0 / 20%)
    re: /rgba?\(\s*0\s*[, ]\s*0\s*[, ]\s*0\s*(?:[,/][^)]*)?\)/gi,
  },
  {
    name: 'pure white rgb, either syntax',
    re: /rgba?\(\s*255\s*[, ]\s*255\s*[, ]\s*255\s*(?:[,/][^)]*)?\)/gi,
  },
  {
    name: 'hsl pure black or white',
    re: /hsla?\(\s*[\d.]+\s*[, ]\s*0%?\s*[, ]\s*(?:0|100)%\s*(?:[,/][^)]*)?\)/gi,
  },
  {
    name: 'oklch pure black or white',
    re: /oklch\(\s*(?:0|1|0%|100%)\s+0\s+[\d.]+\s*(?:\/[^)]*)?\)/gi,
  },
  {
    name: 'black or white keyword in value position',
    // Only after a colon, or inside a colour function. Never bare prose.
    re: /(?::\s*|,\s*|\(\s*)(black|white)\b/gi,
  },
]

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && TARGETS.test(f))
  // The gate itself necessarily contains the patterns it bans.
  .filter((f) => f !== 'scripts/check-palette.mjs')

let bad = 0
for (const file of files) {
  const raw = readFileSync(file, 'utf8')
  const src = stripComments(raw)
  const lines = src.split('\n')
  const rawLines = raw.split('\n')

  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0
      let m
      while ((m = rule.re.exec(line)) !== null) {
        console.error(`${file}:${i + 1}  ${rule.name}: ${m[0].trim()}`)
        console.error(`  ${rawLines[i].trim().slice(0, 110)}`)
        bad++
      }
    }
  })
}

if (bad > 0) {
  console.error(
    `\ncheck-palette: ${bad} pure black or white value${bad === 1 ? '' : 's'}. Use a paper tint for surfaces, an ink tint for text, and a navy tinted shadow such as rgb(8 35 88 / 0.08).`,
  )
  process.exit(1)
}
console.log(`check-palette: clean (${files.length} files scanned)`)
