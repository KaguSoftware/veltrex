import type { Metadata } from 'next'
import { DivisionPage, divisionMetadata } from '@/components/layout/DivisionPage'
import type { Locale } from '@/i18n/routing'

const SLUG = 'startup' as const
const HREF = '/divisions/startup' as const

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/divisions/startup'>): Promise<Metadata> {
  const { locale } = await params
  return divisionMetadata(SLUG, HREF, locale as Locale)
}

export default function Page() {
  return <DivisionPage slug={SLUG} />
}
