import { getLocale, getTranslations } from 'next-intl/server'
import { ORG } from '@/lib/site'
import { upper } from '@/lib/text'

export default async function HomePage() {
  const t = await getTranslations('Home')
  const locale = await getLocale()

  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      {/*
        Uppercased here rather than with text-transform, because CSS case
        mapping is not reliably Turkish-aware outside Firefox. See lib/text.ts.
      */}
      <p className="text-sm tracking-[0.2em] text-[var(--text-muted)]">
        {upper(t('eyebrow'), locale)}
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl text-[var(--text-strong)]">
        {t('title')}
      </h1>
      <p className="mt-6 text-lg text-[var(--text-body)]">{t('intro')}</p>
      <p className="mt-10 text-sm text-[var(--text-muted)]">{ORG.legalName}</p>
    </main>
  )
}
