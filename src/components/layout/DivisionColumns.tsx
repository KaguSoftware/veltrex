import type { CSSProperties } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { DIVISIONS } from '@/lib/divisions'
import { Arrow } from '@/components/ui/Arrow'

/**
 * The three divisions as columns divided by vertical rules, the way a facade
 * is divided by its mullions. The rules draw down as the band enters view.
 */
/**
 * @param drawRules Let the rules draw down as the band enters view. Off inside a
 * band whose facade already carries that band's entrance.
 */
export async function DivisionColumns({ className = '', drawRules = true }: { className?: string; drawRules?: boolean }) {
  const t = await getTranslations('Divisions')

  return (
    <ul className={`grid md:grid-cols-3 ${className}`}>
      {DIVISIONS.map((d, i) => (
        <li key={d.slug} data-division={d.slug} className="group relative border-t border-[var(--rule)] md:border-t-0">
          <span
            aria-hidden="true"
            data-reveal={drawRules ? 'rule-y' : undefined}
            className="rule-v hidden transition-[width,background-color] duration-500 group-hover:w-[3px] group-hover:bg-[var(--text-link)] md:block"
            style={{ '--i': i } as CSSProperties}
          />
          <Link
            href={d.href}
            className="flex h-full flex-col py-9 md:px-8 md:py-1 lg:px-9"
          >
            <div className="flex h-full flex-col">
              <h3 className="t-display-s">{t(`${d.slug}.name`)}</h3>
              <span className="mt-2 font-[family-name:var(--font-display)] text-lg italic text-[var(--text-accent)]">
                {t(`${d.slug}.tagline`)}
              </span>
              <span className="mt-5 block text-[var(--text-body)]">{t(`${d.slug}.intro`)}</span>
              <span className="link-arrow mt-auto pt-8">
                {t('readMore')}
                <Arrow className="btn-arrow" />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
