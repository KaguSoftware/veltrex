import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { PageHero } from '@/components/layout/PageHero'
import { CompanyRegister } from '@/components/layout/CompanyRegister'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
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
  const h = await getTranslations('Home')

  return (
    <>
      <PageHero id="about-hero" facade="page" title={t('title')} intro={<p>{t('intro')}</p>} />

      <Band tone="paper" aria-labelledby="about-identity">
        <div className="shell band-pad grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <h2 id="about-identity" className="t-display-l t-italic">
              {h('identityHeading')}
            </h2>
            <p className="t-lead mt-6 max-w-[36ch]">
              {h('identityIntro')}
            </p>
          </div>
          {/*
            The address note is phrased as what we publish, not as a claim about
            how many offices exist. An earlier draft said there are no other
            offices, which we cannot know from one address.
          */}
          <CompanyRegister addressNote={t('addressNote')} className="lg:col-span-8" />
        </div>
      </Band>
    </>
  )
}
