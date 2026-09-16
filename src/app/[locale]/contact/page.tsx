import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'
import { DirectContact } from '@/components/layout/DirectContact'
import { alternatesFor, openGraphFor } from '@/lib/seo/alternates'
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
    <SectionShell>
      <IndexRail rail="">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)]">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-prose text-lg text-[var(--text-body)]">{t('intro')}</p>
        <DirectContact className="mt-14 border-t border-[var(--border-subtle)] pt-12" />
      </IndexRail>
    </SectionShell>
  )
}
