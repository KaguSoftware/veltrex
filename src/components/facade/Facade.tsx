import { buildFacade, FACADES, ROTATION, VIEW, type FacadeGeometry, type FacadeName } from './geometry'

type Props = {
  /** Which building to draw. */
  name?: FacadeName
  /**
   * Unique per page. Gradient ids live in the document's global id space, so two
   * facades on one page must not share one.
   */
  id: string
  /** Play the assembly on first paint: towers slide along the seam, mullions draw. */
  intro?: boolean
  /** Play the same assembly, but only once the band scrolls into view. */
  assemble?: boolean
  /**
   * Slide the drawing so the near tower's lit edge runs through the fold of the
   * logo in the header, at every viewport width. The seam in the building
   * continues the seam in the mark.
   */
  anchor?: boolean
  /** Lines and panes at reduced strength, for bands where copy leads. */
  quiet?: boolean
  /** Where the legibility scrim sits. */
  scrim?: 'left' | 'center' | 'bottom' | 'none'
  className?: string
}

// Geometry is pure and deterministic, so each building is computed once per
// build rather than once per page that draws it.
const cache = new Map<string, FacadeGeometry>()
function geometry(name: FacadeName, anchored: boolean) {
  const key = `${name}:${anchored}`
  let g = cache.get(key)
  if (!g) {
    g = buildFacade(FACADES[name], anchored)
    cache.set(key, g)
  }
  return g
}

const transform = `rotate(${ROTATION} ${VIEW.w / 2} ${VIEW.h / 2})`

/**
 * A drawn curtain wall at the logo's seam angle. Purely decorative, so it is
 * hidden from assistive technology and carries no content of its own.
 *
 * Three stacked SVGs rather than one: each tower is its own layer so it can be
 * moved with a compositor transform (the entrance and the scroll parallax)
 * without repainting the whole drawing on every frame.
 */
export function Facade({
  name = 'page',
  id,
  intro = false,
  assemble = false,
  anchor = false,
  quiet = false,
  scrim = 'left',
  className = '',
}: Props) {
  const g = geometry(name, anchor)
  const classes = [
    'facade',
    intro || assemble ? 'facade--intro' : '',
    anchor ? 'facade--anchored' : '',
    quiet ? 'facade--quiet' : '',
    scrim !== 'none' ? `facade--scrim-${scrim}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const viewBox = `${g.window.x0} 0 ${g.window.w} ${VIEW.h}`
  // An anchored drawing is sized by height in CSS, so its box already has the
  // viewBox's proportions; the plain one fills its band and crops.
  const fit = anchor ? 'xMinYMin meet' : 'xMidYMid slice'
  const bandMid = (g.band.from + g.band.to) / 2

  return (
    <div aria-hidden="true" className={classes} data-reveal={assemble ? 'facade' : undefined}>
      <svg className="facade-layer" viewBox={viewBox} preserveAspectRatio={fit} focusable="false">
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="facade-stop-sky-a" />
            <stop offset="1" className="facade-stop-sky-b" />
          </linearGradient>
          <linearGradient
            id={`${id}-band`}
            gradientUnits="userSpaceOnUse"
            x1={g.band.from - 120}
            y1="0"
            x2={g.band.to + 120}
            y2="0"
          >
            <stop offset="0" className="facade-stop-band-edge" />
            <stop offset="0.5" className="facade-stop-band-core" />
            <stop offset="1" className="facade-stop-band-edge" />
          </linearGradient>
          <linearGradient id={`${id}-fall`} gradientUnits="userSpaceOnUse" x1="0" y1="-300" x2="0" y2="1300">
            <stop offset="0" className="facade-stop-fall-top" />
            <stop offset="1" className="facade-stop-fall-bottom" />
          </linearGradient>
        </defs>
        <rect x={g.window.x0} width={g.window.w} height={VIEW.h} fill={`url(#${id}-sky)`} />
        <g transform={transform}>
          <rect
            x={g.band.from - 120}
            y={-2000}
            width={g.band.to - g.band.from + 240}
            height={5000}
            fill={`url(#${id}-band)`}
          />
          <rect x={bandMid - 700} y={-2000} width={1400} height={5000} fill={`url(#${id}-fall)`} />
        </g>
      </svg>

      {(['near', 'far'] as const).map((side) => {
        const t = g[side]
        return (
          <div key={side} className={`facade-plane facade-plane--${side}`}>
            <svg
              className={`facade-layer facade-tower facade-tower--${side}`}
              viewBox={viewBox}
              preserveAspectRatio={fit}
              focusable="false"
            >
              <defs>
                <linearGradient
                  id={`${id}-${side}-glass`}
                  gradientUnits="userSpaceOnUse"
                  x1={t.edgeFrom}
                  y1="0"
                  x2={t.edgeTo}
                  y2="0"
                >
                  <stop offset="0" className="facade-stop-glass-lit" />
                  <stop offset="0.45" className="facade-stop-glass-mid" />
                  <stop offset="1" className="facade-stop-glass-deep" />
                </linearGradient>
                {/* The lit corner catches the sky above and fades toward the street. */}
                <linearGradient id={`${id}-${side}-edge`} gradientUnits="userSpaceOnUse" x1="0" y1="-350" x2="0" y2="1250">
                  <stop offset="0" className="facade-stop-edge-top" />
                  <stop offset="1" className="facade-stop-edge-bottom" />
                </linearGradient>
              </defs>
              <g transform={transform}>
                <path d={t.body} fill={`url(#${id}-${side}-glass)`} />
                <path className="facade-pane facade-pane--1" d={t.panes[0]} />
                <path className="facade-pane facade-pane--2" d={t.panes[1]} />
                <path className="facade-pane facade-pane--3" d={t.panes[2]} />
                <path className="facade-pane facade-pane--4" d={t.panes[3]} />
                {t.spandrels ? <path className="facade-spandrel" d={t.spandrels} /> : null}
                <path className="facade-floor" d={t.floors} />
                <path className="facade-mullion" d={t.mullions} />
                <path className="facade-mullion facade-mullion--major" d={t.majors} />
                <path className="facade-edge" d={t.edge} stroke={`url(#${id}-${side}-edge)`} />
              </g>
            </svg>
          </div>
        )
      })}

      {intro || assemble ? <div className="facade-sheen" /> : null}
      <div className="facade-scrim" />
    </div>
  )
}
