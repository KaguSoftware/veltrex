import { LOGO_PATHS, LOGO_VIEWBOX } from './logo-paths'

type Ground = 'paper' | 'brand' | 'void'
type Orientation = 'horizontal' | 'vertical'

type Props = {
  /**
   * What the logo is sitting on. This picks the ARTWORK, not just the colours,
   * and that distinction is the whole reason this prop exists.
   *
   * The duotone and mono files are different drawings, not recolours: in the
   * mono artwork the under-blade is trimmed back so the fold survives as
   * negative space, and the wordmark is optically expanded by about 1.7 percent
   * to compensate for white-on-colour reading thinner. See docs/decisions/0003.
   */
  ground?: Ground
  orientation?: Orientation
  /**
   * The tagline is roughly 70 percent of the path data and becomes illegible
   * below about 320px of lockup width, so it is off by default. Never enable it
   * for an icon or an Open Graph image.
   */
  tagline?: boolean
  className?: string
  /**
   * Omit for a decorative logo that sits next to a text link, which is the
   * usual case in a header. Pass a string when the logo IS the only content of
   * its link, so it needs an accessible name.
   */
  title?: string
}

export function Logo({
  ground = 'paper',
  orientation = 'horizontal',
  tagline = false,
  className,
  title,
}: Props) {
  const variant = `${orientation}-${ground === 'paper' ? 'duotone' : 'mono'}` as const
  const paths = LOGO_PATHS[variant]
  const { w, h } = LOGO_VIEWBOX[variant]

  const visible = tagline
    ? paths
    : paths.filter((p) => p.role !== 'tagline' && p.role !== 'tagline-comma')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      {visible.map((p) => (
        <path
          key={p.role}
          d={p.d}
          /*
           * The mono artwork is a single colour, so currentColor lets it take
           * the surrounding text colour and work on brand blue and on navy
           * alike. The duotone keeps its exact brand hexes, because those two
           * values are the brand and must never be approximated.
           */
          fill={ground === 'paper' ? p.fill : 'currentColor'}
        />
      ))}
    </svg>
  )
}
