import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { PageHero } from '@/components/layout/PageHero'
import { DivisionColumns } from '@/components/layout/DivisionColumns'
import { CompanyRegister } from '@/components/layout/CompanyRegister'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Home' })
  const title = t('title')
  return {
    // absolute, or the template would render "... | Veltrex | Veltrex"
    title: { absolute: `${title} | Veltrex` },
    description: t('intro'),
    alternates: alternatesFor('/', locale as Locale),
    openGraph: { ...openGraphFor('/', locale as Locale), title, description: t('intro') },
  }
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  const d = await getTranslations('Divisions')

  return (
    <>
      {/*
        The divisions sit along the foot of the hero rather than behind a button
        pointing at a band a scroll away: the page opens on what the company is.
      */}
      <PageHero
        id="home-hero"
        facade="home"
        anchor
        runners
        size="full"
        title={t('title')}
        foot={<DivisionColumns />}
      />

      <Band tone="deep">
        <div className="shell py-[clamp(6.5rem,13vw,11rem)]">
          {/*
            The display-scale statement is structural on purpose: that the three
            divisions are independent and share one approach is what the site
            can stand behind. Lines about how long Veltrex stays involved stay
            at body size until confirmed (CONTENT-TODO.md item 1).
          */}
          <p className="t-display-l t-italic mx-auto max-w-[24ch] text-center">
            {d('intro')}
          </p>
        </div>
      </Band>

      <Band tone="paper" aria-labelledby="home-identity">
        <div className="shell band-pad grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <h2 id="home-identity" className="t-display-l t-italic">
              {t('identityHeading')}
            </h2>
            <p className="t-lead mt-6 max-w-[36ch]">
              {t('identityIntro')}
            </p>
          </div>
          <CompanyRegister className="lg:col-span-8" />
        </div>
      </Band>
    </>
  )
}
