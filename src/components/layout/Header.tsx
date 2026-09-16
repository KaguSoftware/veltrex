import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Logo } from '@/components/brand/Logo'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ORG } from '@/lib/site'

const NAV = [
  { href: '/divisions', key: 'divisions' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const

export async function Header() {
  const t = await getTranslations('Nav')

  return (
    <>
      {/* Skip link. First focusable element, visible only when focused. */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:bg-[var(--surface-raised)] focus-visible:px-4 focus-visible:py-2"
      >
        {t('skipToContent')}
      </a>

      <header className="border-b border-[var(--border-subtle)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5 sm:px-8">
          <Link href="/" aria-label={ORG.shortName} className="shrink-0">
            {/* Tagline off: it is illegible below about 320px of lockup width. */}
            <Logo className="h-7 w-auto" />
          </Link>

          <nav aria-label={t('primaryLabel')} className="flex items-center gap-6">
            <ul className="flex items-center gap-6">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--text-body)] underline-offset-4 hover:underline"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <LocaleSwitcher />
          </nav>
        </div>
      </header>
    </>
  )
}
