import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Source_Serif_4, Plus_Jakarta_Sans } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { ORG, SITE_URL } from '@/lib/site'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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
 * LCP element is a TEXT BLOCK rather than an image, which inverts the usual
 * advice: the fallback must paint immediately so LCP is not gated on the font
 * arriving. display: 'block' would gate it on the network.
 *
 * Both faces are open licensed (SIL Open Font License), which is a deliberate
 * departure from the reference site's use of an unlicensed trial font.
 */
const serif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: true,
})

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
  adjustFontFallback: true,
})

/**
 * Prerenders both locales at build time.
 *
 * Also the guard that makes the locale root param resolvable without
 * cacheComponents: with that flag off this is not strictly required, but
 * omitting it would make every page dynamic, which is the opposite of the goal.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/*
 * Layout-level metadata ONLY.
 *
 * metadataBase, the title template, the site name and robots belong here
 * because they are genuinely global. `alternates` must NEVER appear in a
 * layout: a layout-level alternates.canonical is inherited by every child that
 * does not override it, so one page forgetting its own would silently publish
 * the homepage canonical as its own. Each page.tsx carries its own alternates.
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

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${serif.variable} ${sans.variable} antialiased`}>
        <script
          type="application/ld+json"
          // The documented App Router approach. Values are escaped in jsonLdString.
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd(locale)) }}
        />
        {/*
          messages={pick(...)} rather than the whole catalogue.

          Without trimming, the provider serialises EVERY message into the HTML
          of every page, which is the single largest avoidable JS payload on the
          site. Only LocaleSwitcher is a Client Component, so only its namespace
          needs to cross the boundary.
        */}
        <NextIntlClientProvider messages={{ LocaleSwitcher: messages.LocaleSwitcher }}>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
