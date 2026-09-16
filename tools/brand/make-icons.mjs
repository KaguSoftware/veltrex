/**
 * Derives the icon set from the extracted logo SVG.
 *
 * Run once locally, outputs committed. NEVER wired into `build`: Vercel must
 * not need sharp or the source PDF in order to deploy.
 *
 * Usage: npm run brand:icons   (after npm run brand:extract)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const PAPER = '#FCFBF8' // paper-50. Never #ffffff, and apple-icon must be opaque.
const OUT_APP = 'src/app'
const OUT_PUBLIC = 'public/icons'

mkdirSync(OUT_PUBLIC, { recursive: true })

/* ------------------------------------------------- isolate the V mark only */

const svg = readFileSync('assets/brand/dist/horizontal-duotone.svg', 'utf8')

/** Pull one role's path element out of the extracted SVG. */
function role(name) {
  const re = new RegExp(`<path data-role="${name}" fill="([^"]*)" d="([^"]*)"/>`)
  const m = re.exec(svg)
  if (!m) throw new Error(`role ${name} not found in the extracted SVG`)
  return { fill: m[1], d: m[2] }
}

/**
 * CURVE-ACCURATE bounding box.
 *
 * Naively taking the min and max of every number in the path is wrong, and
 * measurably so: Bezier control points lie OUTSIDE the curve they describe, so
 * that approach reported the mark as 675.25 tall against a true 665.74, making
 * the ratio 1.2867 instead of 1.3050. For an icon that is about 1.4 percent of
 * spurious padding, and it would quietly corrupt the maskable safe-zone
 * arithmetic, which is computed against the true ratio.
 *
 * So each cubic is solved for the t where its derivative is zero, per axis, and
 * only on-curve points are considered. The extractor emits only M, L, C and Z.
 */
function bbox(d) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  const include = (x, y) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  /** Cubic extrema on one axis, plus both endpoints. */
  const cubicExtrema = (p0, p1, p2, p3) => {
    const values = [p0, p3]
    // Derivative of a cubic Bezier is a quadratic: at^2 + bt + c
    const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3)
    const b = 6 * (p0 - 2 * p1 + p2)
    const c = 3 * (p1 - p0)
    const at = (t) => {
      const u = 1 - t
      return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    }
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) > 1e-12) {
        const t = -c / b
        if (t > 0 && t < 1) values.push(at(t))
      }
    } else {
      const disc = b * b - 4 * a * c
      if (disc >= 0) {
        const root = Math.sqrt(disc)
        for (const t of [(-b + root) / (2 * a), (-b - root) / (2 * a)]) {
          if (t > 0 && t < 1) values.push(at(t))
        }
      }
    }
    return values
  }

  const tokens = d.match(/[MLCZ]|-?[\d.]+/gi) ?? []
  let i = 0
  let cx = 0
  let cy = 0
  let sx = 0
  let sy = 0

  while (i < tokens.length) {
    const cmd = tokens[i++]
    if (cmd === 'M' || cmd === 'L') {
      cx = Number(tokens[i++])
      cy = Number(tokens[i++])
      if (cmd === 'M') {
        sx = cx
        sy = cy
      }
      include(cx, cy)
    } else if (cmd === 'C') {
      const x1 = Number(tokens[i++]),
        y1 = Number(tokens[i++]),
        x2 = Number(tokens[i++]),
        y2 = Number(tokens[i++]),
        x3 = Number(tokens[i++]),
        y3 = Number(tokens[i++])
      for (const x of cubicExtrema(cx, x1, x2, x3)) include(x, cy)
      for (const y of cubicExtrema(cy, y1, y2, y3)) include(cx, y)
      include(x3, y3)
      cx = x3
      cy = y3
    } else if (cmd === 'Z' || cmd === 'z') {
      cx = sx
      cy = sy
    }
  }

  return { minX, minY, maxX, maxY }
}

const under = role('mark-under')
const over = role('mark-over')

const a = bbox(under.d)
const b = bbox(over.d)
const mark = {
  minX: Math.min(a.minX, b.minX),
  minY: Math.min(a.minY, b.minY),
  maxX: Math.max(a.maxX, b.maxX),
  maxY: Math.max(a.maxY, b.maxY),
}
mark.w = mark.maxX - mark.minX
mark.h = mark.maxY - mark.minY

console.log(
  `mark box: x ${mark.minX.toFixed(2)} y ${mark.minY.toFixed(2)} w ${mark.w.toFixed(2)} h ${mark.h.toFixed(2)}  ratio ${(mark.w / mark.h).toFixed(4)}`,
)

/**
 * Compose a square SVG containing only the mark, centred, at a chosen fill
 * fraction of the canvas.
 *
 * Centred on the MEASURED mark box, never on the source canvas. The source
 * padding is asymmetric (left 294, right 548, top 323, bottom 264 in a
 * 3439x1254 frame), so a canvas-centred crop would land on the wordmark and
 * miss the mark almost entirely. See docs/decisions/0003.
 */
function squareMark({ size = 1024, fill = 0.72, background = null, mono = false }) {
  const scale = (size * fill) / Math.max(mark.w, mark.h)
  const w = mark.w * scale
  const h = mark.h * scale
  const dx = (size - w) / 2 - mark.minX * scale
  const dy = (size - h) / 2 - mark.minY * scale

  const paths = mono
    ? [{ ...under, fill: PAPER }, { ...over, fill: PAPER }]
    : [under, over]

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
${background ? `  <rect width="${size}" height="${size}" fill="${background}"/>\n` : ''}  <g transform="translate(${dx.toFixed(3)} ${dy.toFixed(3)}) scale(${scale.toFixed(6)})">
${paths.map((p) => `    <path fill="${p.fill}" d="${p.d}"/>`).join('\n')}
  </g>
</svg>
`
}

/* ------------------------------------------------------------------ emit */

const results = []

/*
 * icon.svg is the DUOTONE mark, not the monochrome one.
 *
 * The mono artwork's fold is a sub-pixel gap at small sizes (about 3 percent of
 * mark height, so 0.7px at 24px) and it aliases away, fusing the blades into a
 * solid chevron. A colour boundary survives antialiasing where a gap does not.
 */
const iconSvg = squareMark({ size: 1024, fill: 0.74 })
writeFileSync(`${OUT_APP}/icon.svg`, iconSvg)
results.push(['src/app/icon.svg', iconSvg.length])

/*
 * apple-icon must be OPAQUE. iOS composites an alpha channel unpredictably and
 * historically onto a dark ground, so a transparent apple icon shows a navy
 * mark on near-black. Grounded on paper-50, never on #ffffff.
 */
const appleSvg = squareMark({ size: 180, fill: 0.62, background: PAPER })
const apple = await sharp(Buffer.from(appleSvg)).png().toBuffer()
writeFileSync(`${OUT_APP}/apple-icon.png`, apple)
results.push(['src/app/apple-icon.png', apple.length])

/* favicon.ico. Only works at the TOP level of app/, never from app/[locale]/. */
const icoSizes = [16, 32, 48]
const icoBuffers = []
for (const size of icoSizes) {
  const s = squareMark({ size: size * 8, fill: 0.78, background: PAPER })
  icoBuffers.push(await sharp(Buffer.from(s)).resize(size, size).png().toBuffer())
}
const ico = await pngToIco(icoBuffers)
writeFileSync(`${OUT_APP}/favicon.ico`, ico)
results.push(['src/app/favicon.ico', ico.length])

/*
 * Maskable PWA icons. The outer 10 percent may be cropped, so content must sit
 * inside a centred circle of radius 40 percent of the width. Against the
 * measured mark ratio the safe fill fraction is well under half.
 */
for (const size of [192, 512]) {
  const s = squareMark({ size, fill: 0.44, background: PAPER })
  const png = await sharp(Buffer.from(s)).png().toBuffer()
  writeFileSync(`${OUT_PUBLIC}/maskable-${size}.png`, png)
  results.push([`public/icons/maskable-${size}.png`, png.length])
}

/* A white-on-navy mark for dark contexts that cannot use currentColor. */
const monoSvg = squareMark({ size: 512, fill: 0.7, background: '#082358', mono: true })
const mono = await sharp(Buffer.from(monoSvg)).png().toBuffer()
writeFileSync(`${OUT_PUBLIC}/mark-on-navy-512.png`, mono)
results.push(['public/icons/mark-on-navy-512.png', mono.length])

console.log('\nwrote:')
for (const [p, bytes] of results) console.log(`  ${p.padEnd(38)} ${bytes} bytes`)

/* ----------------------------------------------------------- assertions */

console.log('\nassertions')
let failed = 0
const check = (label, cond, detail = '') => {
  if (cond) console.log(`  pass  ${label}`)
  else {
    console.error(`  FAIL  ${label}  ${detail}`)
    failed++
  }
}

check('mark ratio matches the measured 1.3050', Math.abs(mark.w / mark.h - 1.305) < 0.01, (mark.w / mark.h).toFixed(4))

const appleMeta = await sharp(apple).metadata()
check('apple-icon is 180x180', appleMeta.width === 180 && appleMeta.height === 180)
check('apple-icon is OPAQUE', !appleMeta.hasAlpha || (await sharp(apple).stats()).isOpaque, 'iOS composites alpha onto a dark ground')

const m512 = await sharp(readFileSync(`${OUT_PUBLIC}/maskable-512.png`)).metadata()
check('maskable-512 is 512x512', m512.width === 512 && m512.height === 512)

check('icon.svg contains both blades', iconSvg.includes(under.d.slice(0, 40)) && iconSvg.includes(over.d.slice(0, 40)))
check('icon.svg carries no tagline', !iconSvg.includes('tagline'))

if (failed) {
  console.error(`\n${failed} assertion(s) failed`)
  process.exit(1)
}
console.log('\nicons ok')
