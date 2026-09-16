// Fails the build if a dash that is not a plain hyphen appears in tracked text.
//
// The characters are written as ESCAPES, never as literals, so that this file is
// itself inside the gate. A detector containing the character it bans needs a
// self-exemption list, and a self-exemption list is how the rule quietly dies.
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const BANNED = new Map([
  ['\u2014', 'em dash'],
  ['\u2013', 'en dash'],
  ['\u2012', 'figure dash'],
  ['\u2015', 'horizontal bar'],
  ['\u2212', 'minus sign'],
  ['\u2E3A', 'two-em dash'],
  ['\u2E3B', 'three-em dash'],
])

const TEXT = /\.(md|ts|tsx|js|jsx|mjs|cjs|css|json|html|txt|yml|yaml)$/i

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && TEXT.test(f))
  .filter((f) => existsSync(f))

let bad = 0
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    for (const [ch, name] of BANNED) {
      let col = line.indexOf(ch)
      while (col !== -1) {
        console.error(`${file}:${i + 1}:${col + 1}  ${name} (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')})`)
        console.error(`  ${line.trim().slice(0, 100)}`)
        bad++
        col = line.indexOf(ch, col + 1)
      }
    }
  })
}

if (bad > 0) {
  console.error(`\ncheck-dashes: ${bad} banned dash${bad === 1 ? '' : 'es'} in ${files.length} files. Use a comma, colon, period or parentheses.`)
  process.exit(1)
}
console.log(`check-dashes: clean (${files.length} files scanned)`)
