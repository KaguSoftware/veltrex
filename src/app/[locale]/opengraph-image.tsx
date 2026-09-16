import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { routing, type Locale } from '@/i18n/routing'
import { ORG } from '@/lib/site'
import { LOGO_PATHS } from '@/components/brand/logo-paths'
import { facadeSvg } from '@/components/facade/svg'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/*
 * Prerendered per locale at BUILD time, not on the edge.
 *
 * Every page on this site is statically generated, so this route runs on
 * Node.js during `next build`, which is why node:fs/promises works here and why
 * there is no cold start to worry about. `runtime = 'edge'` is deprecated in
 * Next 16 and must not be set.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const PAPER = '#FDFAF6'
const MIST = '#AEBBD4'
const ACCENT = '#99BFFF'

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  // params is a Promise in image routes as of Next 16, same as in pages.
  const { locale } = await params

  /*
   * The message catalogue is read DIRECTLY rather than through getTranslations,
   * and that is a hard constraint rather than a preference.
   *
   * An image route is a Route Handler, and next/root-params is explicitly
   * unsupported in Route Handlers ("support for this API in Route Handlers is
   * planned for a future version"). getTranslations goes through
   * getRequestConfig, which reads the locale from root params, so calling it
   * here fails the BUILD with a prerender error even when the locale is passed
   * explicitly. The locale is already in params, so nothing is lost.
   */
  const messages = (await import(`../../../messages/${locale}.json`)).default
  const home = messages.Home

  /*
   * The catalogue title carries <em> markup for the page headline. The card
   * sets it the same way: the plain lead on one line, the italic accent below.
   */
  const match = /^(.*?)<em>(.*?)<\/em>(.*)$/.exec(home.title)
  const lead = match ? match[1].trim() : home.title
  const accent = match ? `${match[2]}${match[3]}`.trim() : ''

  /*
   * Fonts come from committed TTFs, NOT from next/font.
   *
   * next/font downloads woff2 and Satori cannot read woff2. Satori also does
   * not fall back per glyph across your own faces: it renders with exactly the
   * file handed to it, so a font missing U+011E, U+0130 or U+015E would render
   * Turkish as tofu here while looking perfect on the page. The subsetter
   * asserts those glyphs survive. See tools/brand/subset-og-fonts.mjs.
   */
  const fontDir = join(process.cwd(), 'assets', 'fonts')
  const [display, displayItalic, body] = await Promise.all([
    readFile(join(fontDir, 'NotoSerifDisplay-og.ttf')),
    readFile(join(fontDir, 'NotoSerifDisplayItalic-og.ttf')),
    readFile(join(fontDir, 'AlbertSans-og.ttf')),
  ])

  // Mono artwork on the dark ground, mark and wordmark only: at card scale the
  // tagline is under 10px.
  const logo = LOGO_PATHS['horizontal-mono'].filter(
    (p) => p.role === 'mark-under' || p.role === 'mark-over' || p.role === 'wordmark',
  )

  const facade = `data:image/svg+xml;base64,${Buffer.from(facadeSvg('home', size.width, size.height)).toString('base64')}`

  // Locale-aware uppercase, never text-transform: the Turkish dotted capital.
  const plaque = [
    ORG.legalName,
    home.eyebrow.toLocaleUpperCase(locale as Locale),
    `${ORG.address.district} / ${ORG.address.city}`.toLocaleUpperCase(locale as Locale),
  ]

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#050F28' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders <img>, not next/image */}
        <img src={facade} width={size.width} height={size.height} alt="" style={{ position: 'absolute', top: 0, left: 0 }} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: 'flex',
            backgroundImage:
              'linear-gradient(0deg, rgba(5, 15, 40, 0.94) 0%, rgba(5, 15, 40, 0.6) 42%, rgba(5, 15, 40, 0) 72%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 72px 44px',
            fontFamily: 'Body',
          }}
        >
          <svg width={276} height={72} viewBox="292 316 2600 680">
            {logo.map((p) => (
              <path key={p.role} d={p.d} fill={PAPER} />
            ))}
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontFamily: 'Display',
                fontWeight: 300,
                fontSize: 86,
                lineHeight: 1.02,
                color: PAPER,
                letterSpacing: '-0.02em',
              }}
            >
              {lead}
            </div>
            {accent ? (
              <div
                style={{
                  fontFamily: 'Display',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 86,
                  lineHeight: 1.08,
                  color: ACCENT,
                  letterSpacing: '-0.02em',
                }}
              >
                {accent}
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                marginTop: 38,
                paddingTop: 20,
                borderTop: '1px solid rgba(174, 187, 212, 0.35)',
                fontSize: 15,
                letterSpacing: '0.08em',
                color: MIST,
              }}
            >
              {plaque.map((item, i) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    paddingLeft: i === 0 ? 0 : 18,
                    marginLeft: i === 0 ? 0 : 18,
                    borderLeft: i === 0 ? 'none' : '1px solid rgba(174, 187, 212, 0.35)',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Display', data: display, style: 'normal', weight: 300 },
        { name: 'Display', data: displayItalic, style: 'italic', weight: 300 },
        { name: 'Body', data: body, style: 'normal', weight: 500 },
      ],
    },
  )
}
