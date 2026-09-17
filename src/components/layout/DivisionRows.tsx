import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'
import { DIVISIONS } from '@/lib/divisions'

/**
 * The divisions as full-width rows, each ruled off by a hairline that draws
 * across as it enters view, the way a floor slab is drawn.
 *
 * Static: the row already carries everything the detail page says, so it does
 * not link there. The detail routes stay reachable from the header and footer.
 */
export async function DivisionRows({ className = '' }: { className?: string }) {
  const t = await getTranslations('Divisions')

  return (
    <ul className={`border-t border-[var(--rule-strong)] ${className}`}>
      {DIVISIONS.map((d, i) => (
        <li
          key={d.slug}
          data-division={d.slug}
          data-reveal="row"
          style={{ '--i': i } as CSSProperties}
          className="row-rule grid gap-x-8 gap-y-4 py-10 [--row-rule:var(--rule-strong)] md:grid-cols-12 md:items-baseline md:py-14"
        >
          <h2 className="t-display-l md:col-span-5">{t(`${d.slug}.name`)}</h2>
          <p className="max-w-[48ch] text-[var(--text-body)] md:col-span-6 md:col-start-7">{t(`${d.slug}.intro`)}</p>
        </li>
      ))}
    </ul>
  )
}
