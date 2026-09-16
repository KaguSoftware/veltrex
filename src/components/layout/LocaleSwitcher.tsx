'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { routing, type InternalHref, type Locale } from '@/i18n/routing'
import { publicPath } from '@/lib/paths'

/**
 * Switches locale while staying on the EQUIVALENT page.
 *
 * This is the single most failure-prone component on a site with localized
 * pathnames, and the failure is visible: a switcher that drops the visitor on
 * the home page, or 404s.
 *
 * Why it cannot be done with string surgery: /is-kollari/teknoloji and
 * /en/divisions/technology share no segment, no prefix and no depth
 * relationship. The ONLY thing the two locales of that page have in common is
 * the internal route id, /divisions/technology. next-intl's usePathname returns
 * exactly that, and it is the whole reason the dependency is here at all.
 *
 * Note the type is optimistic: usePathname is typed as keyof AppPathnames, but
 * at RUNTIME it returns the raw unmatched path on a 404. TypeScript cannot
 * catch that, so the known-set check below is a real guard rather than
 * defensive noise, and the URL matrix asserts the 404 case explicitly.
 */
export function LocaleSwitcher() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('LocaleSwitcher')

  const target = (routing.locales.find((l) => l !== locale) ?? routing.defaultLocale) as Locale
  const known = Object.keys(routing.pathnames) as InternalHref[]
  const isKnown = known.includes(pathname as InternalHref)

  // On an unknown path there is no equivalent page to offer, so fall back to
  // the other locale's home rather than building a URL that 404s.
  const href = publicPath(isKnown ? (pathname as InternalHref) : '/', target)

  return (
    /*
     * A plain anchor, NOT next-intl's Link, and this is a deliberate fix rather
     * than an oversight.
     *
     * next-intl's Link with an explicit `locale` prop FORCES the locale prefix,
     * so switching to Turkish produced /tr/is-kollari/teknoloji instead of the
     * canonical unprefixed /is-kollari/teknoloji. That still resolves, because
     * the proxy 307s the superfluous prefix away, but it costs every
     * Turkish-bound switch an extra redirect and puts a non-canonical URL in
     * the HTML for crawlers to follow.
     *
     * publicPath gives the canonical URL directly. A full document load is also
     * the correct behaviour here: the whole page is changing language, and the
     * verification gate asserts this href is the equivalent page.
     */
    <a
      href={href}
      /*
       * lang and hrefLang both matter and do different jobs: lang switches the
       * screen reader's voice for the link text, hrefLang declares the language
       * of the destination.
       *
       * The visible text is the target language written IN the target language,
       * so a Turkish page offers "English" and never "İngilizce". The person
       * who needs this link cannot read the current language. No flags either,
       * since flags are countries rather than languages.
       */
      lang={target}
      hrefLang={target}
      className="text-sm text-[var(--text-link)] underline-offset-4 hover:underline"
    >
      {t('switchTo')}
    </a>
  )
}
