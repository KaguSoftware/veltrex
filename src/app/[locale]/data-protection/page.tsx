import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LegalPage } from '@/components/layout/LegalPage'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/data-protection'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Legal' })
  return {
    title: t('dataProtectionTitle'),
    alternates: alternatesFor('/data-protection', locale as Locale),
    openGraph: {
      ...openGraphFor('/data-protection', locale as Locale),
      title: t('dataProtectionTitle'),
    },
  }
}

export default async function DataProtectionPage() {
  const t = await getTranslations('Legal')
  const k = await getTranslations('DataProtectionText')

  return (
    <LegalPage title={t('dataProtectionTitle')}>
      <p>{k('controllerIntro')}</p>
      <h2>{k('dataHeading')}</h2>
      <p>{k('dataBody')}</p>
      <h2>{k('purposeHeading')}</h2>
      <p>{k('purposeBody')}</p>
      <h2>{k('transferHeading')}</h2>
      <p>{k('transferBody')}</p>
      <h2>{k('rightsHeading')}</h2>
      <p>{k('rightsBody')}</p>
      <h2>{k('applyHeading')}</h2>
      <p>{k('applyBody')}</p>
    </LegalPage>
  )
}
