import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'
import { ButtonLink } from '@/components/ui/Button'
import { DirectContact } from '@/components/layout/DirectContact'
import { DivisionList } from '@/components/layout/DivisionList'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import { upper } from '@/lib/text'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Home' })
  return {
    // absolute, or the template would render "... | Veltrex | Veltrex"
    title: { absolute: `${t('title')} | Veltrex` },
    description: t('intro'),
    alternates: alternatesFor('/', locale as Locale),
    openGraph: { ...openGraphFor('/', locale as Locale), title: t('title'), description: t('intro') },
  }
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  const locale = await getLocale()

  return (
    <>
      <SectionShell>
        <IndexRail rail={upper(t('eyebrow'), locale)}>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
            {t('title')}
          </h1>
          <p className="mt-8 max-w-prose text-lg text-[var(--text-body)]">{t('intro')}</p>
          <ButtonLink href="/divisions" className="mt-10">
            {t('cta')}
          </ButtonLink>
        </IndexRail>
      </SectionShell>

      <SectionShell ground="sunken" id="divisions">
        <IndexRail rail="01">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.5vw,2.75rem)]">
            {t('divisionsHeading')}
          </h2>
          <p className="mt-4 max-w-prose text-[var(--text-body)]">{t('divisionsIntro')}</p>
          <DivisionList className="mt-12" />
        </IndexRail>
      </SectionShell>

      <SectionShell ground="brand">
        <IndexRail rail="02">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.5vw,2.75rem)]">
            {t('contactHeading')}
          </h2>
          <DirectContact className="mt-10" />
        </IndexRail>
      </SectionShell>
    </>
  )
}
