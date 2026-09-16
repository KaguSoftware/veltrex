import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { ButtonLink } from '@/components/ui/Button'
import { Facade } from '@/components/facade/Facade'
import { PageHero } from '@/components/layout/PageHero'
import { DivisionColumns } from '@/components/layout/DivisionColumns'
import { CompanyRegister } from '@/components/layout/CompanyRegister'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
import { ORG, formatPhone } from '@/lib/site'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'Home' })
  // The title carries <em> markup for the headline; metadata wants plain text.
  const title = t.markup('title', { em: (chunks) => chunks })
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
      <PageHero
        id="home-hero"
        facade="home"
        anchor
        size="full"
        plaque
        title={t.rich('title', { em: (chunks) => <em>{chunks}</em> })}
        intro={<p>{t('intro')}</p>}
        actions={
          <>
            <ButtonLink href="/divisions">{t('cta')}</ButtonLink>
            <a
              href={`tel:${ORG.phones[0]}`}
              className="link-draw link-draw--rest tabular text-[1.0625rem] text-[var(--text-strong)]"
            >
              {formatPhone(ORG.phones[0])}
            </a>
          </>
        }
      />

      <Band tone="paper" aria-labelledby="home-divisions">
        <div className="shell band-pad grid gap-y-14 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <h2 id="home-divisions" className="t-display-l t-italic">
              {t('divisionsHeading')}
            </h2>
            <p className="t-lead mt-6 max-w-[36ch]">
              {t('divisionsIntro')}
            </p>
            <div className="mt-10">
              <ButtonLink href="/divisions" variant="ghost">
                {t('allDivisions')}
              </ButtonLink>
            </div>
          </div>
          <DivisionColumns className="lg:col-span-8" />
        </div>
      </Band>

      <Band tone="navy" className="overflow-hidden">
        <Facade id="home-statement" name="statement" assemble quiet scrim="center" />
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
