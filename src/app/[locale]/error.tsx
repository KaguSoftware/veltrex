'use client'

import { useLocale } from 'next-intl'

/**
 * Error boundary. A Client Component, so it cannot read the server-side message
 * catalogue. next/root-params is also unavailable in client code, which is why
 * the strings live in a literal keyed by useLocale() rather than coming from
 * the catalogue. This is the ONE place a locale-keyed literal is acceptable.
 */
const COPY = {
  tr: { title: 'Bir şeyler ters gitti', intro: 'Beklenmeyen bir hata oluştu.', retry: 'Tekrar deneyin' },
  en: { title: 'Something went wrong', intro: 'An unexpected error occurred.', retry: 'Try again' },
} as const

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const locale = useLocale()
  const t = COPY[locale]

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">{t.title}</h1>
      <p className="mt-4 text-[var(--text-body)]">{t.intro}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 border border-[var(--border-strong)] px-6 py-3 text-sm hover:bg-[var(--surface-sunken)]"
      >
        {t.retry}
      </button>
    </div>
  )
}
