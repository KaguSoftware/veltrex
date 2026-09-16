import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/brand/Logo'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ORG, formatPhone } from '@/lib/site'

export async function Footer() {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')
  const c = await getTranslations('Company')

  /*
   * Registry identifiers are built from an array and filtered, so an unknown
   * value renders as STRUCTURALLY ABSENT rather than as "N/A" or a guess.
   * An invented MERSIS or Ticaret Sicil number would be a false statement about
   * a registry entry, not a design compromise. See CONTENT-TODO.md item 4.
   */
  const identifiers = [
    { label: c('taxId'), value: ORG.taxId },
    { label: 'MERSİS', value: ORG.mersisNo },
    { label: 'Ticaret Sicil No', value: ORG.tradeRegistryNo },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))

  const pages = [
    { href: '/' as const, label: nav('home') },
    { href: '/divisions' as const, label: nav('divisions') },
    { href: '/divisions/technology' as const, label: nav('technology') },
    { href: '/divisions/investment' as const, label: nav('investment') },
    { href: '/divisions/trading' as const, label: nav('trading') },
    { href: '/about' as const, label: nav('about') },
    { href: '/contact' as const, label: nav('contact') },
  ]

  const column = 'relative pl-6 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-[var(--rule)]'
  const heading = 't-label mb-5 text-[var(--text-muted)]'
  const link = 'link-draw text-[0.9375rem] text-[var(--text-body)] hover:text-[var(--text-strong)]'

  return (
    <footer data-ground="void" className="band">
      <div className="shell pb-10 pt-20 lg:pt-28">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={ORG.shortName} className="inline-block">
              {/* Mono artwork on the void ground, with the tagline: legible above 320px of lockup width. */}
              <Logo ground="brand" tagline className="h-[5.25rem] w-auto text-[var(--color-paper-50)]" />
            </Link>
            <p className="mt-10 max-w-[32ch] text-[0.8125rem] leading-relaxed tracking-[0.04em] text-[var(--text-muted)]">
              {ORG.legalName}
            </p>
            {identifiers.length > 0 ? (
              <dl className="mt-3 space-y-1 text-[0.8125rem] text-[var(--text-muted)]">
                {identifiers.map((row) => (
                  <div key={row.label} className="flex gap-2">
                    <dt>{row.label}</dt>
                    <dd className="tabular">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <div className="grid gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:col-span-7 lg:col-start-6">
            <nav aria-label={t('navLabel')} className={column}>
              <h2 className={heading}>{t('pagesHeading')}</h2>
              <ul className="space-y-2.5">
                {pages.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} className={link}>
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={column}>
              <h2 className={heading}>{t('contactHeading')}</h2>
              <address className="text-[0.9375rem] not-italic leading-relaxed text-[var(--text-body)]">
                {ORG.address.street}
                <br />
                {ORG.address.district} / {ORG.address.city}
                <br />
                {ORG.address.country}
              </address>
              <ul className="mt-5 space-y-1.5">
                {ORG.phones.map((phone) => (
                  <li key={phone}>
                    <a href={`tel:${phone}`} className={`${link} tabular`}>
                      {formatPhone(phone)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label={t('legalHeading')} className={column}>
              <h2 className={heading}>{t('legalHeading')}</h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/privacy" className={link}>
                    {t('privacy')}
                  </Link>
                </li>
                <li>
                  <Link href="/data-protection" className={link}>
                    {t('dataProtection')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--rule)] pt-8 text-[0.8125rem] text-[var(--text-muted)]">
          <p>
            {ORG.shortName}. {t('rights')}
          </p>
          <LocaleSwitcher className="link-draw link-draw--rest text-[var(--text-link)]" />
        </div>
      </div>
    </footer>
  )
}
