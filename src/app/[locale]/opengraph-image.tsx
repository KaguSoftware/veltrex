import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { routing, type Locale } from '@/i18n/routing'
import { ORG } from '@/lib/site'
import { LOGO_PATHS } from '@/components/brand/logo-paths'

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

const PAPER = '#FCFBF8'
const NAVY = '#082358'
const BLUE = '#0065EA'
const INK_MUTED = '#565E6B'

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
  const t = (key: keyof typeof messages.Home) => messages.Home[key]

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
  const [display, body] = await Promise.all([
    readFile(join(fontDir, 'SourceSerif4-og.ttf')),
    readFile(join(fontDir, 'PlusJakartaSans-og.ttf')),
  ])

  // The mark only, never the tagline: at card scale the tagline is under 10px.
  const mark = LOGO_PATHS['horizontal-duotone'].filter(
    (p) => p.role === 'mark-under' || p.role === 'mark-over',
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          padding: '72px 80px',
          fontFamily: 'Body',
        }}
      >
        {/* The brand seam, at the mark's own 3:5 angle rather than an arbitrary one. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 8,
            height: size.height,
            background: BLUE,
          }}
        />

        <svg width={150} height={115} viewBox="294 318 869 666">
          {mark.map((p) => (
            <path key={p.role} d={p.d} fill={p.fill} />
          ))}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'Display',
              fontSize: 68,
              lineHeight: 1.1,
              color: NAVY,
              letterSpacing: '-0.01em',
            }}
          >
            {t('title')}
          </div>
          <div style={{ marginTop: 22, fontSize: 27, color: INK_MUTED, maxWidth: 880 }}>
            {t('eyebrow')}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 22, color: INK_MUTED }}>
          {ORG.address.district} / {ORG.address.city}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Display', data: display, style: 'normal', weight: 400 },
        { name: 'Body', data: body, style: 'normal', weight: 500 },
      ],
    },
  )
}
