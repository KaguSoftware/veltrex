import type { CSSProperties, ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Arrow } from '@/components/ui/Arrow'
import { ORG, formatPhone } from '@/lib/site'

type Props = {
  /** The Kurumsal page's note that this is the only address published here. */
  addressNote?: string
  className?: string
}

/**
 * The company's registered identity as a ruled register: legal name, tax id,
 * address, phones. What a counterparty checks before calling, set out the way
 * it appears on the company's documents.
 *
 * There is deliberately NO FORM. No form and no analytics means nothing on this
 * site collects personal data through the browser, which is what keeps it free
 * of a cookie consent banner.
 *
 * Registry identifiers we do not hold (MERSİS, Ticaret Sicil) are structurally
 * absent, never "N/A" and never a guess. See CONTENT-TODO.md item 4.
 */
export async function CompanyRegister({ addressNote, className = '' }: Props) {
  const c = await getTranslations('Company')
  const t = await getTranslations('Contact')

  const mapQuery = encodeURIComponent(`${ORG.address.street}, ${ORG.address.district}, ${ORG.address.city}`)

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: c('phone'),
      value: (
        <>
          <ul className="space-y-1">
            {ORG.phones.map((phone) => (
              <li key={phone}>
                {/* tel: so it dials on mobile. */}
                <a
                  href={`tel:${phone}`}
                  className="link-draw tabular font-[family-name:var(--font-display)] text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] leading-snug font-light text-[var(--text-strong)]"
                >
                  {formatPhone(phone)}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[52ch] text-[0.9375rem] text-[var(--text-muted)]">{t('divisionHint')}</p>
        </>
      ),
    },
    {
      label: c('address'),
      value: (
        <>
          <address className="not-italic text-lg leading-relaxed text-[var(--text-strong)]">
            {ORG.address.street}
            <br />
            {ORG.address.district} / {ORG.address.city}, {ORG.address.country}
          </address>
          {addressNote ? (
            <p className="mt-3 max-w-[52ch] text-[0.9375rem] text-[var(--text-muted)]">{addressNote}</p>
          ) : null}
          {/*
            A plain link, NOT an embedded Google Maps iframe, and this is load
            bearing rather than a style choice. An iframe would set Google
            cookies on page load, which flips the site from "disclosure only" to
            "consent banner required" under the KVKK cookie guidance.
          */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow mt-5"
          >
            {t('mapLink')}
            <Arrow className="btn-arrow -rotate-45" />
          </a>
        </>
      ),
    },
    {
      label: c('legalName'),
      value: <p className="text-lg text-[var(--text-strong)]">{ORG.legalName}</p>,
    },
    ...(ORG.taxId
      ? [{ label: c('taxId'), value: <p className="tabular text-lg text-[var(--text-strong)]">{ORG.taxId}</p> }]
      : []),
  ]

  return (
    <dl className={`border-t border-[var(--rule-strong)] ${className}`}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          data-reveal="row"
          style={{ '--i': i } as CSSProperties}
          className="row-rule grid gap-x-8 gap-y-3 py-8 md:grid-cols-12"
        >
          <dt className="t-label pt-1 md:col-span-3">{row.label}</dt>
          <dd className="md:col-span-9">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
