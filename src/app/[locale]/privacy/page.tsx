import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LegalPage } from '@/components/layout/LegalPage'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/privacy'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Legal' })
  return {
    title: t('privacyTitle'),
    alternates: alternatesFor('/privacy', locale as Locale),
    openGraph: { ...openGraphFor('/privacy', locale as Locale), title: t('privacyTitle') },
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations('Legal')
  const p = await getTranslations('PrivacyText')

  return (
    <LegalPage id="privacy-hero" title={t('privacyTitle')}>
      <p>{p('intro')}</p>
      <h2>{p('collectedHeading')}</h2>
      <p>{p('collectedBody')}</p>
      <h2>{p('cookiesHeading')}</h2>
      <p>{p('cookiesBody')}</p>
      <h2>{p('hostingHeading')}</h2>
      <p>{p('hostingBody')}</p>
      <h2>{p('contactHeading')}</h2>
      <p>{p('contactBody')}</p>
    </LegalPage>
  )
}
