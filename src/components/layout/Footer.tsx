import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/brand/Logo'
import { ORG, formatPhone } from '@/lib/site'

export async function Footer() {
  const t = await getTranslations('Footer')

  /*
   * Registry identifiers are built from an array and filtered, so an unknown
   * value renders as STRUCTURALLY ABSENT rather than as "N/A" or a guess.
   * An invented MERSIS or Ticaret Sicil number would be a false statement about
   * a registry entry, not a design compromise. See CONTENT-TODO.md item 4.
   */
  const identifiers = [
    { label: t('taxId'), value: ORG.taxId },
    { label: 'MERSİS', value: ORG.mersisNo },
    { label: 'Ticaret Sicil No', value: ORG.tradeRegistryNo },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))

  return (
    <footer data-ground="brand" className="bg-[var(--color-brand-900)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-sm">
            {/* Mono artwork on navy: the duotone's navy blade would vanish. */}
            <Logo ground="brand" tagline className="h-12 w-auto text-[var(--color-paper-50)]" />
            <p className="mt-6 text-sm text-[var(--text-body)]">{ORG.legalName}</p>
            <address className="mt-4 text-sm not-italic text-[var(--text-muted)]">
              {ORG.address.street}
              <br />
              {ORG.address.district} / {ORG.address.city}, {ORG.address.country}
            </address>
            <ul className="mt-4 space-y-1 text-sm">
              {ORG.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} className="text-[var(--text-link)] hover:underline">
                    {formatPhone(phone)}
                  </a>
                </li>
              ))}
            </ul>
            {identifiers.length > 0 ? (
              <dl className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
                {identifiers.map((row) => (
                  <div key={row.label} className="flex gap-2">
                    <dt>{row.label}:</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <nav aria-label={t('navLabel')}>
            <h2 className="text-sm text-[var(--text-strong)]">{t('legalHeading')}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-[var(--text-link)] hover:underline">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/data-protection" className="text-[var(--text-link)] hover:underline">
                  {t('dataProtection')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-16 text-xs text-[var(--text-muted)]">
          {ORG.shortName}. {t('rights')}
        </p>
      </div>
    </footer>
  )
}
