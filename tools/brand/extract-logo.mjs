/**
 * Extracts the Veltrex logo from the supplied Illustrator PDF into grouped SVG.
 *
 * Zero dependencies, fs and zlib only. That is possible because this particular
 * PDF is unusually simple, and each of those facts was verified before relying
 * on it: no /Font and no /FontFile (all type is outlined to paths), no
 * /Subtype /Image, no shadings, no patterns, no strokes, FlateDecode streams
 * only, and RGB fills only.
 *
 * Every off-the-shelf converter was rejected: mupdf and pdf2svg are AGPL,
 * pdfjs-dist 2.16's SVG backend needs a domstubs.js that ships in the repo
 * rather than the npm package, and pdf-to-svg is an empty stub. See
 * docs/decisions/0003.
 *
 * The reason to hand-roll rather than shell out is that this emits
 * SEMANTICALLY GROUPED paths (mark-over, mark-under, wordmark, tagline,
 * tagline-comma). A generic converter returns one undifferentiated blob, and
 * the grouping is exactly what lets a single React component theme the logo
 * and gate the tagline behind a prop.
 *
 * Usage: node tools/brand/extract-logo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { inflateSync } from 'node:zlib'

const SRC = 'assets/brand/source/veltrex-Logo-Final.pdf'
const OUT = 'assets/brand/dist'

const BRAND = {
  '#0065EA': 'blue',
  '#082358': 'navy',
  '#6D6E71': 'grey',
  '#FFFFFF': 'white',
}

/* ---------------------------------------------------------------- PDF layer */

const raw = readFileSync(SRC)
const latin = raw.toString('latin1')

/** Every `N 0 obj ... endobj` body, keyed by object number. */
function indexObjects(src) {
  const objects = new Map()
  const re = /(\d+)\s+0\s+obj\b/g
  let m
  while ((m = re.exec(src)) !== null) {
    const num = Number(m[1])
    const start = m.index + m[0].length
    const end = src.indexOf('endobj', start)
    if (end !== -1) objects.set(num, { start, end, body: src.slice(start, end) })
  }
  return objects
}

const objects = indexObjects(latin)

/** Page objects in document order, with their content stream object numbers. */
function findPages() {
  const kids = /\/Kids\s*\[([^\]]+)\]/.exec(latin)
  if (!kids) throw new Error('no /Kids array found, cannot enumerate pages')
  const nums = [...kids[1].matchAll(/(\d+)\s+0\s+R/g)].map((x) => Number(x[1]))

  return nums.map((num) => {
    const obj = objects.get(num)
    if (!obj) throw new Error(`page object ${num} not found`)
    const contents = /\/Contents\s+(\d+)\s+0\s+R/.exec(obj.body)
    const mediaBox = /\/MediaBox\s*\[\s*([\d.\s-]+)\]/.exec(obj.body)
    return {
      page: num,
      contents: contents ? Number(contents[1]) : null,
      mediaBox: mediaBox ? mediaBox[1].trim().split(/\s+/).map(Number) : [0, 0, 3439.35, 1254],
    }
  })
}

/** Inflate one content stream. Thumbnails and the Illustrator block are skipped. */
function streamOf(objNum) {
  const obj = objects.get(objNum)
  if (!obj) throw new Error(`content object ${objNum} not found`)
  const sIdx = latin.indexOf('stream', obj.start)
  if (sIdx === -1 || sIdx > obj.end) throw new Error(`object ${objNum} has no stream`)

  let begin = sIdx + 'stream'.length
  if (latin[begin] === '\r') begin++
  if (latin[begin] === '\n') begin++
  const endIdx = latin.indexOf('endstream', begin)

  const bytes = raw.subarray(begin, endIdx)
  return inflateSync(bytes).toString('latin1')
}

/* ------------------------------------------------------- content stream VM */

/** Apply a 2x3 matrix to a point. */
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
/** Matrix multiply, a then b. */
const mul = (a, b) => [
  a[0] * b[0] + a[1] * b[2],
  a[0] * b[1] + a[1] * b[3],
  a[2] * b[0] + a[3] * b[2],
  a[2] * b[1] + a[3] * b[3],
  a[4] * b[0] + a[5] * b[2] + b[4],
  a[4] * b[1] + a[5] * b[3] + b[5],
]

const IDENTITY = [1, 0, 0, 1, 0, 0]
const hex = (r, g, b) =>
  '#' +
  [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

/**
 * Walks one content stream and returns filled subpaths.
 *
 * Only the operators this PDF actually contains are implemented, and anything
 * unrecognised throws rather than being skipped, so a different source file
 * fails loudly instead of silently losing artwork.
 */
function parseContent(src, height) {
  const tokens = src.split(/\s+/).filter(Boolean)
  const stack = []
  let ctm = IDENTITY
  let fill = '#000000'
  const operands = []
  const paths = []

  let current = []
  let segments = []
  let startPt = null
  let cursor = null

  // PDF origin is bottom-left, SVG top-left.
  const toSvg = (x, y) => {
    const [px, py] = apply(ctm, x, y)
    return [px, height - py]
  }
  const n = (v) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(3))))

  function flushSubpath() {
    if (segments.length) current.push(segments.join(' '))
    segments = []
  }

  for (const tok of tokens) {
    if (/^[-+]?[\d.]+$/.test(tok)) {
      operands.push(Number(tok))
      continue
    }

    switch (tok) {
      case 'q':
        stack.push({ ctm, fill })
        break
      case 'Q': {
        const s = stack.pop()
        if (s) {
          ctm = s.ctm
          fill = s.fill
        }
        break
      }
      case 'cm':
        ctm = mul(operands.slice(-6), ctm)
        break
      case 'rg':
        fill = hex(...operands.slice(-3))
        break

      case 'm': {
        flushSubpath()
        const [x, y] = operands.slice(-2)
        cursor = [x, y]
        startPt = [x, y]
        const [sx, sy] = toSvg(x, y)
        segments.push(`M${n(sx)} ${n(sy)}`)
        break
      }
      case 'l': {
        const [x, y] = operands.slice(-2)
        cursor = [x, y]
        const [sx, sy] = toSvg(x, y)
        segments.push(`L${n(sx)} ${n(sy)}`)
        break
      }
      case 'c': {
        const [x1, y1, x2, y2, x3, y3] = operands.slice(-6)
        const a = toSvg(x1, y1)
        const b = toSvg(x2, y2)
        const c = toSvg(x3, y3)
        cursor = [x3, y3]
        segments.push(`C${n(a[0])} ${n(a[1])} ${n(b[0])} ${n(b[1])} ${n(c[0])} ${n(c[1])}`)
        break
      }
      case 'v': {
        // First control point is the current point.
        const [x2, y2, x3, y3] = operands.slice(-4)
        const a = toSvg(cursor[0], cursor[1])
        const b = toSvg(x2, y2)
        const c = toSvg(x3, y3)
        cursor = [x3, y3]
        segments.push(`C${n(a[0])} ${n(a[1])} ${n(b[0])} ${n(b[1])} ${n(c[0])} ${n(c[1])}`)
        break
      }
      case 'y': {
        // Second control point is the endpoint.
        const [x1, y1, x3, y3] = operands.slice(-4)
        const a = toSvg(x1, y1)
        const c = toSvg(x3, y3)
        cursor = [x3, y3]
        segments.push(`C${n(a[0])} ${n(a[1])} ${n(c[0])} ${n(c[1])} ${n(c[0])} ${n(c[1])}`)
        break
      }
      case 'h':
        if (segments.length) segments.push('Z')
        if (startPt) cursor = startPt
        break
      case 're': {
        flushSubpath()
        const [x, y, w, h] = operands.slice(-4)
        const p0 = toSvg(x, y)
        const p1 = toSvg(x + w, y)
        const p2 = toSvg(x + w, y + h)
        const p3 = toSvg(x, y + h)
        segments.push(
          `M${n(p0[0])} ${n(p0[1])}L${n(p1[0])} ${n(p1[1])}L${n(p2[0])} ${n(p2[1])}L${n(p3[0])} ${n(p3[1])}Z`,
        )
        break
      }

      case 'f':
      case 'f*':
      case 'F': {
        flushSubpath()
        if (current.length) paths.push({ fill, d: current.join(' ') })
        current = []
        break
      }
      case 'n':
        flushSubpath()
        current = []
        break

      // Present in this file and safely ignorable: marked content, clipping,
      // and graphics state (which only carries /ca 1.0 /op false here).
      case 'BDC':
      case 'EMC':
      case 'BMC':
      case 'gs':
      case 'W':
      case 'W*':
      case 'MP':
      case 'DP':
        break

      default:
        if (tok.startsWith('/')) break // a name operand, for example /OC or /GS0
        throw new Error(`unimplemented PDF operator: ${tok}`)
    }

    if (!/^[-+]?[\d.]+$/.test(tok)) operands.length = 0
  }

  return paths
}

/* ------------------------------------------------------------- bbox helper */

/** Bounding box from an SVG path string. Control points included, so it is an outer bound. */
function bboxOf(d) {
  const nums = d.match(/-?[\d.]+/g)?.map(Number) ?? []
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i])
    maxX = Math.max(maxX, nums[i])
    minY = Math.min(minY, nums[i + 1])
    maxY = Math.max(maxY, nums[i + 1])
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY }
}

/* ----------------------------------------------------------------- classify */

/**
 * Assigns each path a semantic role.
 *
 * Roles come from fill colour plus geometry rather than from layer names,
 * because the PDF carries an Illustrator private block but no editable layer
 * names. The inference is asserted at the end rather than trusted.
 */
function classify(paths, pageW, pageH) {
  let withBox = paths.map((p) => ({ ...p, box: bboxOf(p.d) }))

  /*
   * Drop the full-bleed background rectangle on the mono pages.
   *
   * The -W variants are a white logo on a solid #0065EA rectangle covering the
   * whole MediaBox. Keeping it would paint a blue box behind the mark wherever
   * the SVG is used, which is the exact reason the supplied -W PNGs are
   * unusable on any other ground.
   */
  const isFullBleed = (p) => p.box.w > pageW * 0.98 && p.box.h > pageH * 0.98
  const background = withBox.filter(isFullBleed)
  withBox = withBox.filter((p) => !isFullBleed(p))

  /*
   * The two blades are the two tallest remaining shapes, by a wide margin.
   *
   * Identified by RANK rather than by a height threshold, because the blades
   * are not the same height as each other: the navy under-blade is about 493
   * units against the blue over-blade's 666, so a "within 90 percent of the
   * tallest" test silently classifies the under-blade as a wordmark letter.
   * For scale, the wordmark letters are about 236 units tall, so rank 1 and 2
   * are unambiguous.
   */
  const byHeight = [...withBox].sort((a, b) => b.box.h - a.box.h)
  const blades = new Set(byHeight.slice(0, 2))

  /*
   * Split the type into wordmark and tagline by vertical position.
   *
   * On the duotone this is decidable by colour (the tagline is grey), but on
   * the mono EVERY path is white, so colour tells us nothing. Position does:
   * the wordmark sits above the tagline with a clear band of empty space
   * between them, so the largest gap in the sorted top edges is the split.
   */
  const type = withBox.filter((p) => !blades.has(p))
  const tops = [...new Set(type.map((p) => p.box.minY))].sort((a, b) => a - b)
  let splitY = Infinity
  let widestGap = 0
  for (let i = 1; i < tops.length; i++) {
    const gap = tops[i] - tops[i - 1]
    if (gap > widestGap) {
      widestGap = gap
      splitY = tops[i]
    }
  }
  // Only trust the split if the gap is a real band rather than kerning jitter.
  const hasTagline = widestGap > 40

  const classified = withBox.map((p) => {
    const role = (() => {
      if (blades.has(p)) {
        // On the duotone the blades differ by colour. On the mono both are
        // white, so height rank decides: the over-blade is the taller one.
        if (p.fill === '#0065EA') return 'mark-over'
        if (p.fill === '#082358') return 'mark-under'
        return byHeight[0] === p ? 'mark-over' : 'mark-under'
      }
      const isLower = hasTagline && p.box.minY >= splitY
      // The one blue element that is not a blade is the tagline comma.
      if (p.fill === '#0065EA') return 'tagline-comma'
      if (p.fill === '#6D6E71') return 'tagline'
      return isLower ? 'tagline' : 'wordmark'
    })()
    return { ...p, role }
  })

  return { paths: classified, droppedBackground: background.length }
}

/* -------------------------------------------------------------------- main */

mkdirSync(OUT, { recursive: true })

const pages = findPages()
console.log(`source: ${SRC}`)
console.log(`pages:  ${pages.length}`)

const VARIANTS = ['horizontal-duotone', 'vertical-duotone', 'horizontal-mono', 'vertical-mono']
const summary = []
const pathData = {}
const viewBoxes = {}

pages.forEach((page, i) => {
  const name = VARIANTS[i] ?? `page-${i + 1}`
  const [, , boxW, boxH] = page.mediaBox
  const content = streamOf(page.contents)
  const { paths, droppedBackground } = classify(parseContent(content, boxH), boxW, boxH)

  const counts = {}
  for (const p of paths) counts[p.role] = (counts[p.role] ?? 0) + 1

  const colours = [...new Set(paths.map((p) => p.fill))]
  const ink = paths.filter((p) => p.box.w < boxW * 0.98)
  const box = ink.reduce(
    (a, p) => ({
      minX: Math.min(a.minX, p.box.minX),
      minY: Math.min(a.minY, p.box.minY),
      maxX: Math.max(a.maxX, p.box.maxX),
      maxY: Math.max(a.maxY, p.box.maxY),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  )

  // Group paths by role, preserving paint order within each group.
  const order = ['mark-under', 'mark-over', 'wordmark', 'tagline', 'tagline-comma']
  const groups = order
    .filter((role) => paths.some((p) => p.role === role))
    .map((role) => {
      const members = paths.filter((p) => p.role === role)
      const d = members.map((p) => p.d).join(' ')
      return { role, fill: members[0].fill, d }
    })

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${boxW} ${boxH}" fill="none">`,
    ...groups.map(
      (g) =>
        `  <path data-role="${g.role}" fill="var(--logo-${g.role}, ${g.fill})" d="${g.d}"/>`,
    ),
    '</svg>',
    '',
  ].join('\n')

  writeFileSync(`${OUT}/${name}.svg`, svg)
  pathData[name] = groups.map((g) => ({ role: g.role, fill: g.fill, d: g.d }))
  viewBoxes[name] = { w: boxW, h: boxH }

  summary.push({
    name,
    paths: paths.length,
    roles: counts,
    colours,
    inkBox: {
      x: Number(box.minX.toFixed(2)),
      y: Number(box.minY.toFixed(2)),
      w: Number((box.maxX - box.minX).toFixed(2)),
      h: Number((box.maxY - box.minY).toFixed(2)),
    },
    bytes: svg.length,
    droppedBackground,
  })

  console.log(
    `\n${name}\n  paths: ${paths.length}  colours: ${colours.join(' ')}\n  roles: ${JSON.stringify(counts)}\n  ink box: ${JSON.stringify(summary.at(-1).inkBox)}\n  svg: ${svg.length} bytes`,
  )
})

/* Emit a typed TS module so the React component can inline the paths.
 * No SVGR: Turbopack is the default bundler in Next 16 and does not run a
 * webpack() config, so the official SVGR recipe fails silently. Inlining also
 * gives per-path theming and lets the tagline be gated behind a prop, which
 * matters because the tagline is about 70 percent of the path data.
 * See docs/decisions/0003. */
const tsOut = 'src/components/brand/logo-paths.ts'
mkdirSync('src/components/brand', { recursive: true })
const ts = [
  '// GENERATED by tools/brand/extract-logo.mjs. Do not edit by hand.',
  '// Regenerate with: npm run brand:extract',
  '',
  `export const LOGO_VIEWBOX = ${JSON.stringify(viewBoxes, null, 2)} as const`,
  '',
  `export const LOGO_PATHS = ${JSON.stringify(pathData, null, 2)} as const`,
  '',
  'export type LogoVariant = keyof typeof LOGO_PATHS',
  'export type LogoRole = (typeof LOGO_PATHS)[LogoVariant][number]["role"]',
  '',
].join('\n')
writeFileSync(tsOut, ts)
console.log(`wrote ${tsOut}`)
writeFileSync(`${OUT}/measured.json`, JSON.stringify({ variants: summary }, null, 2) + '\n')

/* --------------------------------------------------------------- assertions */

console.log('\nassertions')
let failed = 0
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  pass  ${label}`)
  else {
    console.error(`  FAIL  ${label}  ${detail}`)
    failed++
  }
}

const duo = summary[0]
check('4 pages found', pages.length === 4, `got ${pages.length}`)
check(
  'duotone uses exactly the three brand colours',
  duo.colours.length === 3 && duo.colours.every((c) => BRAND[c]),
  duo.colours.join(' '),
)
check('duotone has both blades', duo.roles['mark-over'] === 1 && duo.roles['mark-under'] === 1, JSON.stringify(duo.roles))
check('mono drops the full bleed background', summary[2].droppedBackground === 1, String(summary[2].droppedBackground))
check('mono splits wordmark from tagline', summary[2].roles.wordmark === 7, JSON.stringify(summary[2].roles))
check('duotone has a blue tagline comma', duo.roles['tagline-comma'] === 1, JSON.stringify(duo.roles))
check(
  'ink box matches the independently measured pixel bbox',
  Math.abs(duo.inkBox.x - 294.51) < 2 && Math.abs(duo.inkBox.w - 2595.91) < 3,
  JSON.stringify(duo.inkBox),
)

if (failed) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log(`\nwrote ${summary.length} SVGs plus measured.json to ${OUT}/`)
