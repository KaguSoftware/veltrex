import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

/**
 * The 404 page, as a REAL prerendered route rather than a not-found boundary.
 *
 * Why not `not-found.tsx`: with the root layout under a dynamic segment
 * (app/[locale]/layout.tsx, required by next/root-params), a notFound() throw
 * renders the not-found content OUTSIDE the layout, inside Next's bare
 * `<html id="__next_error__">` shell. Measured on 16.3.5: the status was
 * correctly 404, but the initial HTML body was EMPTY with no stylesheet, so the
 * copy only appeared after hydration.
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
    <PageHero
      id="not-found-hero"
      facade="home"
      anchor
      size="full"
      title={t('title')}
      intro={<p>{t('intro')}</p>}
      actions={
        <ButtonLink href="/" variant="ghost">
          {t('backHome')}
        </ButtonLink>
      }
    />
  )
}
