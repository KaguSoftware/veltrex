/**
 * The drawn curtain wall.
 *
 * Veltrex has no photography of its own, and a stock tower would be a picture
 * of somebody else's building. So the facade is DRAWN, and it is drawn from
 * the one piece of architecture the company does own: the logo. The knockout
 * seam in the mark runs at exactly 3:5, which is 59.036 degrees from
 * horizontal (see docs/decisions/0003). Every mullion here runs at that angle.
 *
 * Two tower planes are separated by a band of lit sky, the way the two blades
 * of the mark are separated by the fold.
 *
 * Everything is computed at build time. Pages are statically generated, so the
 * browser receives finished path strings and runs no geometry code at all.
 */

/** The seam angle, measured from the artwork rather than chosen. */
export const SEAM_DEG = 59.036

/**
 * rotate(ROTATION) maps the vertical axis onto the seam direction, so inside
 * the rotated group every mullion is a plain vertical line and every pane is
 * an axis-aligned rectangle.
 */
export const ROTATION = -(90 - SEAM_DEG)

/** The drawing's reference frame. Rotation happens about its centre. */
export const VIEW = { w: 1600, h: 1000 } as const
const CX = VIEW.w / 2
const CY = VIEW.h / 2

/**
 * An anchored facade is drawn wider than the reference frame, because it is
 * scaled by height and slid sideways so its lit edge meets the logo's fold.
 * ANCHOR_LEAD is how much drawing sits left of that edge (it covers the page
 * gutter on wide screens); ANCHOR_WIDTH is the whole drawing. The stylesheet
 * reads the same two numbers, so keep them in step with globals.css.
 */
export const ANCHOR_LEAD = 800
export const ANCHOR_WIDTH = 3600

/** How far the drawing extends past what is visible, so parallax never shows an edge. */
const MARGIN = 160

const COS = Math.cos((ROTATION * Math.PI) / 180)
const SIN = Math.sin((ROTATION * Math.PI) / 180)

type TowerSpec = {
  /** Width of the bay touching the sky band, in drawing units. */
  bay: number
  /** Ratio applied per bay moving away from the sky. Below 1 reads as perspective. */
  recede: number
  minBay: number
  /** Floor height, measured along the seam. */
  floor: number
  /** Opaque band at the foot of each floor. 0 draws none. */
  spandrel: number
  /** Offsets the floor grid so the two towers never line up. */
  phase: number
  /** Share of panes that catch light, 0 to 1. */
  lit: number
  /** Every nth mullion is drawn heavier. */
  major: number
  /** How many lanes of lit panes jump along this tower. Omit for a still building. */
  runs?: number
}

export type FacadeSpec = {
  /** Offset of the sky band's centre line from the middle of the view. */
  seam: number
  /** Width of the sky band, measured square to the seam. */
  gap: number
  seed: number
  near: TowerSpec
  far: TowerSpec
}

export type TowerPaths = {
  body: string
  edgeFrom: number
  edgeTo: number
  mullions: string
  majors: string
  floors: string
  spandrels: string
  panes: [string, string, string, string]
  edge: string
  runs: Run[]
}

/** One pane, in rotated drawing space. */
export type Cell = { x: number; y: number; w: number; h: number }

/**
 * A lane of panes that light one after another, in order: along a floor, or
 * down one bay across successive floors. `offset` staggers the lanes against
 * each other, as a share of the cycle from 0 to 1.
 */
export type Run = { offset: number; cells: Cell[] }

/** The horizontal stretch of drawing space that can ever be seen. */
export type Window = { x0: number; w: number }

export type FacadeGeometry = {
  window: Window
  band: { from: number; to: number }
  near: TowerPaths
  far: TowerPaths
}

/** Rotated drawing space to view space. */
function toView(u: number, v: number) {
  const du = u - CX
  const dv = v - CY
  return { x: CX + du * COS - dv * SIN, y: CY + du * SIN + dv * COS }
}

/** Where the vertical line u = edge in drawing space crosses the top of the view. */
function xAtTop(edge: number) {
  const du = edge - CX
  const dv = (-CY - du * SIN) / COS
  return CX + du * COS - dv * SIN
}

/**
 * `lane` is the stretch of view space where a moving pane is worth drawing. On
 * an anchored facade that is the part a screen actually shows beside the lit
 * edge, not the full drawing, which runs far past both sides of any viewport.
 */
type Frame = { win: Window; extent: number; lane: { x0: number; x1: number; y0: number; y1: number } }

function visible(frame: Frame, u: number, v: number) {
  const { x, y } = toView(u, v)
  return (
    x > frame.win.x0 - MARGIN &&
    x < frame.win.x0 + frame.win.w + MARGIN &&
    y > -MARGIN &&
    y < VIEW.h + MARGIN
  )
}

/** The visible stretch of a vertical line in drawing space, or null. */
function spanAlongV(frame: Frame, u: number): [number, number] | null {
  let lo = Infinity
  let hi = -Infinity
  for (let v = CY - frame.extent; v <= CY + frame.extent; v += 40) {
    if (visible(frame, u, v)) {
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
  }
  return lo === Infinity ? null : [lo - 40, hi + 40]
}

/** The visible stretch of a horizontal line in drawing space, clamped to [a, b]. */
function spanAlongU(frame: Frame, v: number, a: number, b: number): [number, number] | null {
  let lo = Infinity
  let hi = -Infinity
  const step = 40
  for (let u = a; u <= b; u += step) {
    if (visible(frame, u, v)) {
      lo = Math.min(lo, u)
      hi = Math.max(hi, u)
    }
  }
  if (lo === Infinity) return null
  return [Math.max(a, lo - step), Math.min(b, hi + step)]
}

/** Deterministic hash to [0, 1). The same inputs always light the same panes. */
function hash(a: number, b: number, c: number): number {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2246822519)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const r = (n: number) => Math.round(n)

function buildTower(frame: Frame, spec: TowerSpec, edge: number, direction: 1 | -1, seed: number): TowerPaths {
  const limit = CX + direction * frame.extent

  // Mullion positions, starting at the sky and receding away from it.
  const lines: number[] = [edge]
  let u = edge
  let bay = spec.bay
  while (direction === 1 ? u < limit : u > limit) {
    u += direction * bay
    lines.push(u)
    bay = Math.max(spec.minBay, bay * spec.recede)
  }

  let mullions = ''
  let majors = ''
  lines.forEach((pos, i) => {
    if (i === 0) return
    const span = spanAlongV(frame, pos)
    if (!span) return
    const seg = `M${r(pos)} ${r(span[0])}V${r(span[1])}`
    if (i % spec.major === 0) majors += seg
    else mullions += seg
  })

  const edgeSpan = spanAlongV(frame, edge)
  const edgePath = edgeSpan ? `M${r(edge)} ${r(edgeSpan[0])}V${r(edgeSpan[1])}` : ''

  const uMin = Math.min(edge, limit)
  const uMax = Math.max(edge, limit)

  let floors = ''
  let spandrels = ''
  const panes: [string, string, string, string] = ['', '', '', '']

  const firstFloor = Math.floor((CY - frame.extent - spec.phase) / spec.floor)
  const lastFloor = Math.ceil((CY + frame.extent - spec.phase) / spec.floor)

  for (let j = firstFloor; j <= lastFloor; j++) {
    const v = spec.phase + j * spec.floor
    const span = spanAlongU(frame, v, uMin, uMax)
    if (!span) continue
    floors += `M${r(span[0])} ${r(v)}H${r(span[1])}`
    if (spec.spandrel > 0) {
      spandrels += `M${r(span[0])} ${r(v)}H${r(span[1])}V${r(v + spec.spandrel)}H${r(span[0])}Z`
    }

    // Some floors are simply busier than others. Without this bias the lit
    // panes read as uniform noise rather than as a building.
    const floorBias = 0.6 + hash(seed, j, 7) * 0.8

    for (let k = 0; k < lines.length - 1; k++) {
      const a = Math.min(lines[k], lines[k + 1])
      const b = Math.max(lines[k], lines[k + 1])
      if (b - a < 6) continue
      const top = v + spec.spandrel + 1.5
      const bottom = v + spec.floor - 1.5
      if (!visible(frame, (a + b) / 2, (top + bottom) / 2)) continue

      // Glass reflects in columns: a whole bay catches the neighbouring tower
      // or the sky, so brightness is mostly decided per column, which draws
      // the long streaks a real curtain wall shows.
      const columnBias = Math.pow(hash(seed, k, 3), 2.2) * 2.1
      const roll = hash(seed, j, k + 1000)
      const threshold = Math.min(0.95, spec.lit * floorBias * columnBias)
      if (roll >= threshold) continue
      const t = roll / threshold
      const tone = t < 0.55 ? 0 : t < 0.85 ? 1 : t < 0.97 ? 2 : 3
      panes[tone] += `M${r(a + 1.5)} ${r(top)}H${r(b - 1.5)}V${r(bottom)}H${r(a + 1.5)}Z`
    }
  }

  const body = `M${r(uMin)} ${r(CY - frame.extent)}H${r(uMax)}V${r(CY + frame.extent)}H${r(uMin)}Z`

  return {
    runs: buildRuns(frame, spec, lines, firstFloor, lastFloor, seed),
    body,
    edgeFrom: edge,
    edgeTo: edge + direction * 900,
    mullions,
    majors,
    floors,
    spandrels,
    panes,
    edge: edgePath,
  }
}

/** Longest lane, in panes. Past this a lane outlasts its share of the cycle. */
const RUN_CELLS = 48
/** Shortest lane worth drawing. */
const RUN_MIN = 8

/**
 * The lanes of lit panes that jump across a tower, the way current runs along
 * the traces of a chip. Two in three run along a floor, the rest down one bay
 * across successive floors, which is a line parallel to the seam. Directions
 * alternate, like traffic. Every choice comes from the same hash as the lit
 * panes, so a building always moves the same way.
 */
function buildRuns(
  frame: Frame,
  spec: TowerSpec,
  lines: number[],
  firstFloor: number,
  lastFloor: number,
  seed: number,
): Run[] {
  const count = spec.runs ?? 0
  if (count === 0) return []

  const pane = (j: number, k: number): Cell | null => {
    if (k < 0 || k >= lines.length - 1) return null
    const a = Math.min(lines[k], lines[k + 1])
    const b = Math.max(lines[k], lines[k + 1])
    if (b - a < 6) return null
    const v = spec.phase + j * spec.floor
    const top = v + spec.spandrel + 1.5
    const bottom = v + spec.floor - 1.5
    const { x, y } = toView((a + b) / 2, (top + bottom) / 2)
    const { lane } = frame
    if (x < lane.x0 || x > lane.x1 || y < lane.y0 || y > lane.y1) return null
    return { x: r(a + 1.5), y: r(top), w: r(b - a - 3), h: r(bottom - top) }
  }

  const runs: Run[] = []
  const floors = lastFloor - firstFloor + 1
  const bays = lines.length - 1

  for (let attempt = 0; runs.length < count && attempt < count * 12; attempt++) {
    const alongFloor = hash(seed, attempt, 9000) < 0.66
    let cells: Cell[] = []

    if (alongFloor) {
      const j = firstFloor + Math.floor(hash(seed, attempt, 9001) * floors)
      for (let k = 0; k < bays; k++) {
        const c = pane(j, k)
        if (c) cells.push(c)
        else if (cells.length > 0) break
      }
    } else {
      // Bays near the sky are the widest, so a column lane stays close to it.
      const k = Math.floor(hash(seed, attempt, 9002) * Math.min(bays, 24))
      for (let j = firstFloor; j <= lastFloor; j++) {
        const c = pane(j, k)
        if (c) cells.push(c)
        else if (cells.length > 0) break
      }
    }

    if (cells.length < RUN_MIN) continue
    if (cells.length > RUN_CELLS) {
      const start = Math.floor(hash(seed, attempt, 9003) * (cells.length - RUN_CELLS))
      cells = cells.slice(start, start + RUN_CELLS)
    }
    if (runs.length % 2 === 1) cells.reverse()

    // Evenly spread across the cycle, with a little jitter so the rhythm never ticks.
    const offset = (runs.length + hash(seed, attempt, 9004) * 0.4) / count
    runs.push({ offset: Math.round(offset * 1000) / 1000, cells })
  }

  return runs
}

/**
 * @param anchored Draw the wide, edge-anchored variant: the window starts
 * ANCHOR_LEAD units left of where the near tower's lit edge meets the top of
 * the view, and runs ANCHOR_WIDTH units. Otherwise the plain 1600 by 1000 frame.
 */
export function buildFacade(spec: FacadeSpec, anchored = false): FacadeGeometry {
  const from = CX + spec.seam - spec.gap / 2
  const to = CX + spec.seam + spec.gap / 2

  const win: Window = anchored ? { x0: Math.round(xAtTop(from)) - ANCHOR_LEAD, w: ANCHOR_WIDTH } : { x0: 0, w: VIEW.w }

  // Rotated space must reach every corner of the window, plus the parallax margin.
  const corners = [
    [win.x0, 0],
    [win.x0 + win.w, 0],
    [win.x0, VIEW.h],
    [win.x0 + win.w, VIEW.h],
  ]
  const extent = Math.ceil(Math.max(...corners.map(([x, y]) => Math.hypot(x - CX, y - CY))) + MARGIN + 80)
  // An anchored drawing is scaled by height, so even a wide screen shows only
  // about twice its height in width to the right of the lit edge. The header
  // covers the top tenth and the hero's foot copy the bottom quarter.
  const lane = anchored
    ? { x0: win.x0 + ANCHOR_LEAD - 80, x1: win.x0 + ANCHOR_LEAD + 2200, y0: 90, y1: 740 }
    : { x0: win.x0, x1: win.x0 + win.w, y0: 0, y1: VIEW.h }
  const frame: Frame = { win, extent, lane }

  return {
    window: win,
    band: { from, to },
    near: buildTower(frame, spec.near, from, -1, spec.seed),
    far: buildTower(frame, spec.far, to, 1, spec.seed + 101),
  }
}

/**
 * The named facades. Each division gets its own building in the same grammar:
 * Technology is fine and dense, Investment is broad panes behind heavy floor
 * slabs, Trading sits between the two.
 */
export const FACADES = {
  home: {
    seam: -40,
    gap: 360,
    seed: 11,
    near: { bay: 34, recede: 0.978, minBay: 8, floor: 104, spandrel: 22, phase: 8, lit: 0.42, major: 3 },
    // Only the far tower moves: the near one sits behind the headline.
    far: { bay: 22, recede: 0.982, minBay: 5, floor: 66, spandrel: 8, phase: 30, lit: 0.38, major: 4, runs: 14 },
  },
  page: {
    seam: 150,
    gap: 340,
    seed: 23,
    near: { bay: 32, recede: 0.978, minBay: 8, floor: 96, spandrel: 20, phase: 20, lit: 0.4, major: 3 },
    far: { bay: 20, recede: 0.982, minBay: 5, floor: 62, spandrel: 6, phase: 4, lit: 0.34, major: 4 },
  },
  statement: {
    seam: -60,
    gap: 480,
    seed: 37,
    near: { bay: 38, recede: 0.975, minBay: 9, floor: 112, spandrel: 24, phase: 12, lit: 0.34, major: 3 },
    far: { bay: 24, recede: 0.98, minBay: 6, floor: 70, spandrel: 8, phase: 26, lit: 0.3, major: 4 },
  },
  technology: {
    seam: 170,
    gap: 280,
    seed: 41,
    near: { bay: 16, recede: 0.99, minBay: 6, floor: 44, spandrel: 0, phase: 6, lit: 0.42, major: 6 },
    far: { bay: 13, recede: 0.99, minBay: 5, floor: 38, spandrel: 0, phase: 18, lit: 0.4, major: 6 },
  },
  investment: {
    seam: 120,
    gap: 380,
    seed: 53,
    near: { bay: 62, recede: 0.97, minBay: 14, floor: 150, spandrel: 40, phase: 30, lit: 0.34, major: 2 },
    far: { bay: 46, recede: 0.972, minBay: 12, floor: 124, spandrel: 34, phase: 64, lit: 0.3, major: 2 },
  },
  trading: {
    seam: 150,
    gap: 320,
    seed: 67,
    near: { bay: 44, recede: 0.974, minBay: 10, floor: 120, spandrel: 28, phase: 14, lit: 0.4, major: 3 },
    far: { bay: 18, recede: 0.986, minBay: 5, floor: 54, spandrel: 0, phase: 2, lit: 0.36, major: 5 },
  },
} as const satisfies Record<string, FacadeSpec>

export type FacadeName = keyof typeof FACADES
