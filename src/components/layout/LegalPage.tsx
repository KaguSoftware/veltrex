import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'

/**
 * Shell for the two legal pages.
 *
 * The DRAFT banner is not decoration. These texts have not been reviewed by a
 * lawyer, and publishing them unmarked would present them as legal
 * commitments. It stays until counsel signs off, and the reason it is visible
 * rather than a code comment is that the audience who needs the warning is the
 * reader, not the developer.
 *
 * The pages stay INDEXABLE on purpose: for a Turkish company they are part of
 * looking like KVKK is taken seriously. If the client objects to public drafts,
 * use robots: { index: false, follow: true } in generateMetadata, never a
 * robots.txt disallow, which would stop Google seeing the noindex at all.
 */
export async function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const t = await getTranslations('Legal')

  return (
    <SectionShell>
      <IndexRail rail="">
        <p
          role="note"
          className="border-l-2 border-[var(--color-brand-600)] bg-[var(--surface-sunken)] px-5 py-4 text-sm text-[var(--text-body)]"
        >
          {t('draftBanner')}
        </p>
        <h1 className="mt-10 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3rem)]">
          {title}
        </h1>
        <div className="prose prose-veltrex mt-8 max-w-prose text-[var(--text-body)]">
          {children}
        </div>
      </IndexRail>
    </SectionShell>
  )
}
