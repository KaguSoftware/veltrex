'use client'

import { useEffect } from 'react'
import { usePathname } from '@/i18n/navigation'

/**
 * Arms [data-reveal] elements as they enter the viewport: column rules and row
 * hairlines draw, band facades assemble. No content is ever hidden.
 *
 * The inline script in the layout marks the document with `js` before first
 * paint, which is what holds those rules at zero length until observed. That
 * script also sets a deadline: if this component never mounts, it removes the
 * mark and every rule is simply complete. Mounting here clears the deadline.
 *
 * Runs again on every client navigation, because the layout (and so this
 * component) persists while the page content underneath it changes.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    ;(window as Window & { __veltrexReveal?: boolean }).__veltrexReveal = true

    if (!('IntersectionObserver' in window)) {
      root.classList.remove('js')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    // Runner panes loop for as long as the page is open, so they stop whenever
    // their building is out of view. Watched in both directions, never unobserved.
    const runners = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-offscreen', !entry.isIntersecting)
      }
    })

    const frame = requestAnimationFrame(() => {
      document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => observer.observe(el))
      document.querySelectorAll('.facade-runners').forEach((el) => runners.observe(el))
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      runners.disconnect()
    }
  }, [pathname])

  return null
}
