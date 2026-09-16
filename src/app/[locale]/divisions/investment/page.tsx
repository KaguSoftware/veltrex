import type { Metadata } from 'next'
import { DivisionPage, divisionMetadata } from '@/components/layout/DivisionPage'
import type { Locale } from '@/i18n/routing'

const SLUG = 'investment' as const
const HREF = '/divisions/investment' as const

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/divisions/investment'>): Promise<Metadata> {
  const { locale } = await params
  return divisionMetadata(SLUG, HREF, locale as Locale)
}

export default function Page() {
  return <DivisionPage slug={SLUG} />
}
