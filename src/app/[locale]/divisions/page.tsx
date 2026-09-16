import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { PageHero } from '@/components/layout/PageHero'
import { DivisionRows } from '@/components/layout/DivisionRows'
import { ContactBand } from '@/components/layout/ContactBand'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/divisions'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Divisions' })
  return {
    title: t('title'),
    description: t('intro'),
    alternates: alternatesFor('/divisions', locale as Locale),
    openGraph: {
      ...openGraphFor('/divisions', locale as Locale),
      title: t('title'),
      description: t('intro'),
    },
  }
}

export default async function DivisionsPage() {
  const t = await getTranslations('Divisions')

  return (
    <>
      <PageHero id="divisions-hero" facade="page" title={t('title')} intro={<p>{t('intro')}</p>} />

      <Band tone="paper">
        <div className="shell band-pad">
          <DivisionRows heading="h2" />
        </div>
      </Band>

      <ContactBand id="divisions-contact" />
    </>
  )
}
