import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { Arrow } from '@/components/ui/Arrow'
import { Facade } from '@/components/facade/Facade'
import { ORG, formatPhone } from '@/lib/site'

/**
 * The navy close at the foot of a section page: the phones at display scale
 * over a quiet facade, with the address beside them.
 */
export async function ContactBand({ id }: { id: string }) {
  const h = await getTranslations('Home')
  const t = await getTranslations('Contact')
  const headingId = `${id}-heading`

  const mapQuery = encodeURIComponent(`${ORG.address.street}, ${ORG.address.district}, ${ORG.address.city}`)

  return (
    <Band tone="navy" className="overflow-hidden" aria-labelledby={headingId}>
      <Facade id={id} name="statement" assemble quiet scrim="center" />
      <div className="shell band-pad grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5">
          <h2 id={headingId} className="t-display-l t-italic">
            {h('contactHeading')}
          </h2>
          <p className="t-lead mt-6 max-w-[40ch]">
            {t('bandIntro')}
          </p>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7 lg:pl-12">
          <span aria-hidden="true" className="rule-v hidden lg:block" />
          <ul className="space-y-1">
            {ORG.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={`tel:${phone}`}
                  className="link-draw tabular font-[family-name:var(--font-display)] text-[clamp(2rem,1.5rem+1.8vw,3.25rem)] leading-tight font-light text-[var(--text-strong)]"
                >
                  {formatPhone(phone)}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <address className="not-italic leading-relaxed text-[var(--text-body)]">
              {ORG.address.street}
              <br />
              {ORG.address.district} / {ORG.address.city}
              <br />
              {ORG.address.country}
            </address>
            <div>
              <p className="text-[0.9375rem] text-[var(--text-muted)]">{t('divisionHint')}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-arrow mt-4"
              >
                {t('mapLink')}
                <Arrow className="btn-arrow -rotate-45" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Band>
  )
}
