import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Logo } from '@/components/brand/Logo'
import { SiteNav } from './SiteNav'
import { ORG, formatPhone } from '@/lib/site'
import { upper } from '@/lib/text'

export async function Header() {
  const t = await getTranslations('Nav')
  const d = await getTranslations('Divisions')
  const c = await getTranslations('Company')
  const locale = (await getLocale()) as Locale

  const items = [
    {
      href: '/divisions' as const,
      label: t('divisions'),
      children: [
        { href: '/divisions/technology' as const, label: t('technology'), tagline: d('technology.tagline') },
        { href: '/divisions/investment' as const, label: t('investment'), tagline: d('investment.tagline') },
        { href: '/divisions/trading' as const, label: t('trading'), tagline: d('trading.tagline') },
      ],
    },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
  ]

  return (
    <>
      {/* Skip link. First focusable element, visible only when focused. */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:bg-[var(--color-paper-50)] focus-visible:px-4 focus-visible:py-3 focus-visible:text-[var(--color-brand-900)]"
      >
        {t('skipToContent')}
      </a>

      <header className="site-header" data-ground="void">
        <div className="shell flex h-full items-center justify-between gap-6">
          {/* relative z-50: stays above the small-screen menu, which opens behind the header row. */}
          <Link
            href="/"
            aria-label={ORG.shortName}
            className="relative z-50 shrink-0"
          >
            {/*
              Mono artwork on the dark header, at --logo-h tall. Tagline off, it
              is illegible under 320px of lockup width. The home facade reads the
              same metric to run its lit edge through this logo's fold.
            */}
            <Logo ground="brand" className="block h-[var(--logo-h)] w-auto text-[var(--color-paper-50)]" />
          </Link>

          <SiteNav
            items={items}
            home={{ href: '/', label: t('home') }}
            labels={{
              primary: t('primaryLabel'),
              menuOpen: t('menuOpen'),
              menuClose: t('menuClose'),
              phone: c('phone'),
            }}
            phones={ORG.phones.map((tel) => ({ tel, display: formatPhone(tel) }))}
            place={upper(`${ORG.address.district} / ${ORG.address.city}`, locale)}
          />
        </div>
      </header>
    </>
  )
}
