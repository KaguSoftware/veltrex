import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { DIVISIONS, type DivisionSlug } from '@/lib/divisions'
import { Arrow } from '@/components/ui/Arrow'

type Props = {
  exclude?: DivisionSlug
  /** h2 on the divisions index, h3 under a section heading elsewhere. */
  heading?: 'h2' | 'h3'
  className?: string
}

/**
 * The divisions as full-width rows. On hover a row fills with navy along the
 * seam angle and its copy turns to paper, so the state reads at a glance.
 */
export async function DivisionRows({ exclude, heading: Heading = 'h2', className = '' }: Props) {
  const t = await getTranslations('Divisions')
  const list = DIVISIONS.filter((d) => d.slug !== exclude)

  return (
    <ul className={`border-t border-[var(--rule-strong)] ${className}`}>
      {list.map((d, i) => (
        <li
          key={d.slug}
          data-division={d.slug}
          data-reveal="row"
          style={{ '--i': i } as CSSProperties}
          className="row-rule [--row-rule:var(--rule-strong)]"
        >
          <Link
            href={d.href}
            className="fold-row group grid gap-x-8 gap-y-4 py-10 md:grid-cols-12 md:items-center md:py-14"
          >
            <Heading className="t-display-l md:col-span-5">{t(`${d.slug}.name`)}</Heading>
            <span className="md:col-span-5">
              <span className="block font-[family-name:var(--font-display)] text-[1.625rem] leading-tight italic text-[var(--text-accent)]">
                {t(`${d.slug}.tagline`)}
              </span>
              <span className="mt-3 block max-w-[48ch] text-[var(--text-body)]">{t(`${d.slug}.intro`)}</span>
            </span>
            <span className="link-arrow md:col-span-2 md:justify-self-end">
              {t('readMore')}
              <Arrow className="btn-arrow" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
