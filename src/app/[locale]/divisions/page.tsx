import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'
import { DivisionList } from '@/components/layout/DivisionList'
import { DirectContact } from '@/components/layout/DirectContact'
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
      <SectionShell>
        <IndexRail rail="">
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)]">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-prose text-lg text-[var(--text-body)]">{t('intro')}</p>
          <DivisionList className="mt-14" />
        </IndexRail>
      </SectionShell>

      <SectionShell ground="brand">
        <DirectContact />
      </SectionShell>
    </>
  )
}
