import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { ButtonLink } from '@/components/ui/Button'
import { Arrow } from '@/components/ui/Arrow'
import { Link } from '@/i18n/navigation'
import { PageHero } from './PageHero'
import { DivisionRows } from './DivisionRows'
import { ContactBand } from './ContactBand'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import type { DivisionSlug } from '@/lib/divisions'
import type { InternalHref, Locale } from '@/i18n/routing'

export async function divisionMetadata(
  slug: DivisionSlug,
  href: InternalHref,
  locale: Locale,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Divisions' })
  const title = t(`${slug}.name`)
  const description = t(`${slug}.intro`)

  return {
    title,
    description,
    alternates: alternatesFor(href, locale),
    openGraph: { ...openGraphFor(href, locale), title, description },
  }
}

/**
 * One layout for all three divisions.
 *
 * They share a structure because that is what makes three very different
 * activities read as ONE company, and because we know very little about each
 * division yet: a shared structure reads as deliberate at low content volume.
 *
 * Identity comes from the building. Each division's hero draws its own facade
 * in the same grammar (fine and dense, broad panes behind heavy slabs, or a mix
 * of the two), and `data-division` tints its lit panes with a different step on
 * the single brand ramp, never a new hue.
 */
export async function DivisionPage({ slug }: { slug: DivisionSlug }) {
  const t = await getTranslations('Divisions')
  const h = await getTranslations('Home')

  return (
    <div data-division={slug}>
      <PageHero
        id={`${slug}-hero`}
        facade={slug}
        title={t(`${slug}.name`)}
        intro={
          <>
            <p className="font-[family-name:var(--font-display)] text-[clamp(1.625rem,1.3rem+1vw,2.25rem)] leading-tight font-light text-[var(--text-strong)] italic">
              {t(`${slug}.tagline`)}
            </p>
            <p className="mt-5">{t(`${slug}.intro`)}</p>
          </>
        }
        actions={
          <>
            <ButtonLink href="/contact" variant="ghost">
              {h('contactHeading')}
            </ButtonLink>
            <Link href="/divisions" className="link-arrow">
              {h('allDivisions')}
              <Arrow className="btn-arrow" />
            </Link>
          </>
        }
      />

      <Band tone="paper" aria-labelledby={`${slug}-others`}>
        <div className="shell band-pad">
          <h2 id={`${slug}-others`} className="t-display-m t-italic mb-12 lg:mb-16">
            {t('otherHeading')}
          </h2>
          <DivisionRows exclude={slug} heading="h3" />
        </div>
      </Band>

      <ContactBand id={`${slug}-contact`} />
    </div>
  )
}
