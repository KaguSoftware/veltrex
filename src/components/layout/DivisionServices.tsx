import { getTranslations } from 'next-intl/server'
import type { DivisionSlug } from '@/lib/divisions'

type Service = { name: string; description: string }

/**
 * A division's sub-sections, ruled off along the foot of its hero band: the
 * same slot the home page's DivisionColumns fills. A flexible grid rather
 * than a fixed column count, because the divisions don't all list the same
 * number of sub-sections.
 */
export async function DivisionServices({ slug }: { slug: DivisionSlug }) {
  const t = await getTranslations('Divisions')
  const services = t.raw(`${slug}.services`) as Service[]

  return (
    <ul className="grid gap-x-8 gap-y-7 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]">
      {services.map((service) => (
        <li key={service.name} className="border-t border-[var(--rule)] pt-5">
          <h3 className="t-label">{service.name}</h3>
          <p className="mt-2 max-w-[28ch] text-[0.9375rem] text-[var(--text-body)]">{service.description}</p>
        </li>
      ))}
    </ul>
  )
}
