import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { ButtonAnchor } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { CompanyRegister } from '@/components/layout/CompanyRegister'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import { ORG, formatPhone } from '@/lib/site'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Contact' })
  return {
    title: t('title'),
    description: t('intro'),
    alternates: alternatesFor('/contact', locale as Locale),
    openGraph: { ...openGraphFor('/contact', locale as Locale), title: t('title'), description: t('intro') },
  }
}

export default async function ContactPage() {
  const t = await getTranslations('Contact')

  return (
    <>
      <PageHero
        id="contact-hero"
        facade="page"
        title={t('title')}
        intro={<p>{t('intro')}</p>}
        actions={
          <ButtonAnchor variant="solid" href={`tel:${ORG.phones[0]}`} className="tabular">
            {formatPhone(ORG.phones[0])}
          </ButtonAnchor>
        }
      />

      <Band tone="paper">
        <div className="shell band-pad">
          <CompanyRegister />
        </div>
      </Band>
    </>
  )
}
