import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'
import { DivisionList } from '@/components/layout/DivisionList'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import { ORG } from '@/lib/site'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'About' })
  return {
    title: t('title'),
    description: t('intro'),
    alternates: alternatesFor('/about', locale as Locale),
    openGraph: { ...openGraphFor('/about', locale as Locale), title: t('title'), description: t('intro') },
  }
}

export default async function AboutPage() {
  const t = await getTranslations('About')

  return (
    <>
      <SectionShell>
        <IndexRail rail="">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)]">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-prose text-lg text-[var(--text-body)]">{t('intro')}</p>

          <dl className="mt-12 grid gap-8 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-[var(--text-muted)]">{t('addressHeading')}</dt>
              <dd className="mt-2">
                <address className="not-italic text-[var(--text-body)]">
                  {ORG.address.street}
                  <br />
                  {ORG.address.district} / {ORG.address.city}
                </address>
                {/*
                  Phrased as what we publish, not as a claim about how many
                  offices exist. An earlier draft said there are no other
                  offices, which we cannot know from one address.
                */}
                <p className="mt-3 max-w-prose text-sm text-[var(--text-muted)]">
                  {t('addressNote')}
                </p>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--text-muted)]">Vergi No</dt>
              <dd className="mt-2 text-[var(--text-body)]">{ORG.taxId}</dd>
            </div>
          </dl>
        </IndexRail>
      </SectionShell>

      <SectionShell ground="sunken">
        <DivisionList />
      </SectionShell>
    </>
  )
}
