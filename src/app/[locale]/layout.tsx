import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Noto_Serif_Display, Albert_Sans } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { ORG, SITE_URL } from '@/lib/site'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RevealObserver } from '@/components/ui/RevealObserver'
import { organizationJsonLd, jsonLdString } from '@/lib/seo/jsonld'
import './../globals.css'

/*
 * Fonts.
 *
 * 'latin-ext' is REQUIRED, not optional. The plain 'latin' subset does not
 * carry U+011E/011F (g-breve), U+0130 (dotted capital I) or U+015E/015F
 * (s-cedilla), so Turkish copy would render with missing glyphs. Note that
 * testing with only the dotless i passes falsely, because U+0131 sits inside
 * Google's 'latin' range by a carve-out.
 *
 * display: 'swap' with adjustFontFallback is deliberate. On a type-led page the
 * LCP element is a TEXT BLOCK rather than an image, so the fallback must paint
 * immediately and LCP is not gated on the font arriving.
 *
 * Noto Serif Display carries the headlines at a light weight with italic
 * accents; Albert Sans carries everything else. Both are open licensed (SIL
 * Open Font License), a deliberate departure from the reference site's use of
 * an unlicensed trial font.
 *
 * The variables are set on <html>, not <body>, because the theme tokens that
 * reference them are declared on :root and would otherwise resolve empty.
 */
const serif = Noto_Serif_Display({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif-face',
  adjustFontFallback: true,
})

const sans = Albert_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans-face',
  adjustFontFallback: true,
})

/**
 * Prerenders both locales at build time.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/*
 * Layout-level metadata ONLY. `alternates` must NEVER appear in a layout: a
 * layout-level canonical is inherited by every child that does not override
 * it. Each page.tsx carries its own alternates.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: ORG.shortName,
    template: `%s | ${ORG.shortName}`,
  },
  openGraph: {
    siteName: ORG.shortName,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#082358',
}

/*
 * Marks the document as scripted before first paint, so below-the-fold rules
 * and facades can wait to draw without a flash. If RevealObserver has not
 * mounted within three seconds (a script error, a blocked bundle), the mark
 * comes off and everything is simply complete. Static string, no interpolation.
 */
const REVEAL_BOOTSTRAP = `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__veltrexReveal)document.documentElement.classList.remove('js')},3000);`

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOTSTRAP }} />
        <script
          type="application/ld+json"
          // The documented App Router approach. Values are escaped in jsonLdString.
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd(locale)) }}
        />
        {/*
          messages={pick(...)} rather than the whole catalogue. Only the
          language switcher reads the catalogue on the client; the navigation
          receives its labels as props from the server-rendered header.
        */}
        <NextIntlClientProvider messages={{ LocaleSwitcher: messages.LocaleSwitcher }}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
