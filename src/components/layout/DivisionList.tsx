import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { DIVISIONS } from '@/lib/divisions'

/** The three divisions as a document-style list, not a card grid. */
export async function DivisionList({ className = '' }: { className?: string }) {
  const t = await getTranslations('Divisions')

  return (
    <ul className={`divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)] ${className}`}>
      {DIVISIONS.map((d, i) => (
        <li key={d.slug} data-division={d.slug}>
          <Link
            href={d.href}
            className="group grid gap-2 py-8 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
          >
            <span className="text-sm text-[var(--text-muted)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="min-w-0">
              <span className="block font-[family-name:var(--font-display)] text-2xl text-[var(--text-strong)]">
                {t(`${d.slug}.name`)}
              </span>
              <span className="mt-2 block max-w-prose text-[var(--text-body)]">
                {t(`${d.slug}.intro`)}
              </span>
            </span>
            <span className="text-sm text-[var(--text-link)] group-hover:underline">
              {t('readMore')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
