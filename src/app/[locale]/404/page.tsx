import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SectionShell } from '@/components/ui/SectionShell'
import { IndexRail } from '@/components/ui/IndexRail'
import { ButtonLink } from '@/components/ui/Button'

/**
 * The 404 page, as a REAL prerendered route rather than a not-found boundary.
 *
 * Why not `not-found.tsx`: with the root layout under a dynamic segment
 * (app/[locale]/layout.tsx, required by next/root-params), a notFound() throw
 * renders the not-found content OUTSIDE the layout, inside Next's bare
 * `<html id="__next_error__">` shell. Measured on 16.3.5: the status was
 * correctly 404, but the initial HTML body was EMPTY with no stylesheet, so the
 * copy only appeared after hydration. A status-only check would have passed
 * while visitors saw a blank flash, and no-JS visitors saw nothing at all.
 * experimental.globalNotFound did not help, because the proxy rewrites every
 * request into the locale segment so nothing ever fails to match a route.
 *
 * So proxy.ts rewrites unknown paths here with a 404 status instead. The page
 * is statically generated, keeps the header and footer, and needs no
 * client-side JavaScript to display.
 */
export const metadata: Metadata = {
  title: '404',
  // Never index the 404 itself, but let crawlers follow its links out.
  robots: { index: false, follow: true },
}

export default async function NotFoundPage() {
  const t = await getTranslations('NotFound')

  return (
    <SectionShell>
      <IndexRail rail="404">
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3rem)]">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-prose text-lg text-[var(--text-body)]">{t('intro')}</p>
        <ButtonLink href="/" variant="outline" className="mt-10">
          {t('backHome')}
        </ButtonLink>
      </IndexRail>
    </SectionShell>
  )
}
