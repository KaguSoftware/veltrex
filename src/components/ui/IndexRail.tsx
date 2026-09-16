import type { ReactNode } from 'react'

type Props = {
  /** Small label in the rail, for example a section number or a short kicker. */
  rail: ReactNode
  children: ReactNode
  className?: string
}

/**
 * A two-column shell: a narrow rail of metadata on the left, content on the right.
 *
 * This is the highest-leverage component for the thin-content problem. A
 * DOCUMENT with four short sections reads as complete; a LANDING PAGE with four
 * short sections reads as unfinished. The rail is what makes a page read as a
 * document, so the division pages look deliberate at launch rather than empty,
 * and gain depth later without any layout change.
 */
export function IndexRail({ rail, children, className = '' }: Props) {
  return (
    <div className={`grid gap-6 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-12 ${className}`}>
      <div className="text-sm text-[var(--text-muted)] lg:pt-1">{rail}</div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
