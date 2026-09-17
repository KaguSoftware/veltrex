import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'
import { DIVISIONS } from '@/lib/divisions'

/**
 * The three divisions as columns divided by vertical rules, the way a facade
 * is divided by its mullions. The rules draw down as the columns enter view.
 *
 * Static on purpose: each division is described here in full, so a link to a
 * page repeating the same two lines would only send a visitor in a circle.
 * The detail routes stay reachable from the header and footer.
 */
export async function DivisionColumns({ className = '' }: { className?: string }) {
  const t = await getTranslations('Divisions')

  return (
    <ul className={`grid md:grid-cols-3 ${className}`}>
      {DIVISIONS.map((d, i) => (
        <li
          key={d.slug}
          data-division={d.slug}
          className="relative border-t border-[var(--rule)] py-6 first:border-t-0 max-md:first:pt-0 md:border-t-0 md:px-8 md:py-1 md:first:pl-0 lg:px-9"
        >
          {/* The first column aligns with the headline, so only the others carry a rule. */}
          {i > 0 ? (
            <span
              aria-hidden="true"
              data-reveal="rule-y"
              className="rule-v hidden md:block"
              style={{ '--i': i } as CSSProperties}
            />
          ) : null}
          <h2 className="t-display-s">{t(`${d.slug}.name`)}</h2>
          <p className="mt-3 max-w-[40ch] text-[var(--text-body)]">{t(`${d.slug}.intro`)}</p>
        </li>
      ))}
    </ul>
  )
}
