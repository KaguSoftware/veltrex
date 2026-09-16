import { getTranslations } from 'next-intl/server'
import { ORG, formatPhone } from '@/lib/site'

/**
 * Direct contact details. There is deliberately NO FORM.
 *
 * That is a decision with a legal consequence worth keeping: no form and no
 * analytics means nothing on this site collects personal data through the
 * browser, which is what keeps it free of a cookie consent banner.
 */
export async function DirectContact({ className = '' }: { className?: string }) {
  const t = await getTranslations('Contact')

  const mapQuery = encodeURIComponent(
    `${ORG.address.street}, ${ORG.address.district}, ${ORG.address.city}`,
  )

  return (
    <div className={`grid gap-10 sm:grid-cols-2 ${className}`}>
      <div>
        <h3 className="text-sm text-[var(--text-muted)]">{t('phoneHeading')}</h3>
        <ul className="mt-3 space-y-2">
          {ORG.phones.map((phone) => (
            <li key={phone}>
              {/* tel: so it dials on mobile. */}
              <a href={`tel:${phone}`} className="text-lg text-[var(--text-link)] hover:underline">
                {formatPhone(phone)}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-prose text-sm text-[var(--text-muted)]">{t('divisionHint')}</p>
      </div>

      <div>
        <h3 className="text-sm text-[var(--text-muted)]">{t('addressHeading')}</h3>
        <address className="mt-3 not-italic text-[var(--text-body)]">
          {ORG.address.street}
          <br />
          {ORG.address.district} / {ORG.address.city}
          <br />
          {ORG.address.country}
        </address>
        {/*
          A plain link, NOT an embedded Google Maps iframe, and this is load
          bearing rather than a style choice. An iframe would set Google cookies
          on page load, which flips the site from "disclosure only" to "consent
          banner required" under the KVKK cookie guidance. Do not "improve" this
          into an embedded map without also adding a consent banner and updating
          both legal texts.
        */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-[var(--text-link)] hover:underline"
        >
          {t('mapLink')}
        </a>
      </div>
    </div>
  )
}
