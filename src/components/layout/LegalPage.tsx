import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Band } from '@/components/ui/Band'
import { PageHero } from './PageHero'

/**
 * Shell for the two legal pages. A reading page: a short facade band, then the
 * text on paper at a comfortable measure.
 *
 * The DRAFT notice is not decoration. These texts have not been reviewed by a
 * lawyer, and publishing them unmarked would present them as legal
 * commitments. It stays until counsel signs off, and it is visible rather than
 * a code comment because the audience who needs the warning is the reader.
 *
 * The pages stay INDEXABLE on purpose: for a Turkish company they are part of
 * looking like KVKK is taken seriously. If the client objects to public drafts,
 * use robots: { index: false, follow: true } in generateMetadata, never a
 * robots.txt disallow, which would stop Google seeing the noindex at all.
 */
export async function LegalPage({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const t = await getTranslations('Legal')

  return (
    <>
      <PageHero id={id} facade="page" size="compact" title={title} />

      <Band tone="paper">
        <div className="shell pb-28 pt-14 lg:pt-20">
          <p
            role="note"
            className="mb-14 max-w-[68ch] border border-[var(--rule-strong)] px-6 py-4 text-[0.9375rem] text-[var(--text-strong)]"
          >
            {t('draftBanner')}
          </p>
          <div className="prose-legal">{children}</div>
        </div>
      </Band>
    </>
  )
}
