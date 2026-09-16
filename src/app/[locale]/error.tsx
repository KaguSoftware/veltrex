'use client'

import { useLocale } from 'next-intl'

/**
 * Error boundary. A Client Component, so it cannot read the server-side message
 * catalogue. next/root-params is also unavailable in client code, which is why
 * the strings live in a literal keyed by useLocale() rather than coming from
 * the catalogue. This is the ONE place a locale-keyed literal is acceptable.
 *
 * It draws no facade: the geometry is computed at build time on the server, and
 * an error screen should not pull that code into the client bundle. The ruled
 * void ground carries the same seam angle instead.
 */
const COPY = {
  tr: { title: 'Bir şeyler ters gitti', intro: 'Beklenmeyen bir hata oluştu.', retry: 'Tekrar deneyin' },
  en: { title: 'Something went wrong', intro: 'An unexpected error occurred.', retry: 'Try again' },
} as const

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const locale = useLocale()
  const t = COPY[locale]

  return (
    <section data-ground="void" className="band ruled-void flex min-h-[80svh] flex-col justify-end">
      <div className="shell pb-24 pt-[calc(var(--header-height)+4rem)]">
        <h1 className="t-display-xl rise">{t.title}</h1>
        <p className="t-lead rise mt-6 max-w-[46ch]">{t.intro}</p>
        <button type="button" onClick={reset} className="btn btn--ghost rise mt-10">
          {t.retry}
        </button>
      </div>
    </section>
  )
}
