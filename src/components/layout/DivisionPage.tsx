import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'
import { DirectContact } from './DirectContact'
import { DivisionList } from './DivisionList'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import { DIVISIONS, type DivisionSlug } from '@/lib/divisions'
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
 * The three businesses are genuinely different, so the temptation is three
 * bespoke pages. They share a layout instead, for two reasons that matter more
 * than variety:
 *
 * 1. It is what makes three very different activities read as ONE company.
 *    Identity comes from `data-division`, which shifts the accent to a
 *    different step on the single brand ramp, never to a new hue.
 * 2. We know very little about each division yet. A shared document layout
 *    reads as deliberate at low content volume, where three bespoke landing
 *    pages would each read as unfinished. Depth slots into the same structure
 *    later without a redesign.
 */
export async function DivisionPage({ slug }: { slug: DivisionSlug }) {
  const t = await getTranslations('Divisions')
  const index = DIVISIONS.findIndex((d) => d.slug === slug)

  return (
    <div data-division={slug}>
      <SectionShell>
        <IndexRail rail={String(index + 1).padStart(2, '0')}>
          <p className="text-sm text-[var(--text-muted)]">{t('title')}</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)]">
            {t(`${slug}.name`)}
          </h1>
          {/* The accent rule is the one visual difference between divisions. */}
          <span
            aria-hidden="true"
            className="mt-8 block h-0.5 w-24 bg-[var(--division-accent)]"
          />
          <p className="mt-8 max-w-prose text-xl text-[var(--text-strong)]">
            {t(`${slug}.tagline`)}
          </p>
          <p className="mt-6 max-w-prose text-lg text-[var(--text-body)]">{t(`${slug}.intro`)}</p>
        </IndexRail>
      </SectionShell>

      <SectionShell ground="sunken">
        <IndexRail rail={t('title')}>
          <DivisionList />
        </IndexRail>
      </SectionShell>

      <SectionShell ground="brand">
        <DirectContact />
      </SectionShell>
    </div>
  )
}
