import type { InternalHref } from '../i18n/routing.ts'

type PageEntry = {
  /** Sitemap priority, 0 to 1. */
  priority: number
  changeFrequency: 'yearly' | 'monthly' | 'weekly'
  /**
   * Hand-maintained ISO date. Bump ONLY the page you actually edited.
   *
   * Deliberately not `new Date()`: that would stamp every URL as modified on
   * every deploy, which is a lie that trains crawlers to ignore lastmod
   * entirely. It would also make the build non-reproducible.
   */
  lastModified: string
}

/**
 * Every route, keyed by its internal href.
 *
 * The type is `Record<InternalHref, PageEntry>` rather than an array, and that
 * is load-bearing: adding a route to routing.ts without adding it here is a
 * COMPILE ERROR, so the sitemap cannot silently fall behind the site. An array
 * would type-check while missing entries, which is how three parallel route
 * lists drifted apart in an earlier draft of this design.
 */
export const PAGES: Record<InternalHref, PageEntry> = {
  '/': { priority: 1.0, changeFrequency: 'monthly', lastModified: '2026-09-16' },
  '/divisions': { priority: 0.9, changeFrequency: 'monthly', lastModified: '2026-09-16' },
  '/divisions/technology': { priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-09-16' },
  '/divisions/investment': { priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-09-16' },
  '/divisions/trading': { priority: 0.8, changeFrequency: 'monthly', lastModified: '2026-09-16' },
  '/about': { priority: 0.7, changeFrequency: 'yearly', lastModified: '2026-09-16' },
  '/contact': { priority: 0.7, changeFrequency: 'yearly', lastModified: '2026-09-16' },
  '/privacy': { priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-09-16' },
  '/data-protection': { priority: 0.3, changeFrequency: 'yearly', lastModified: '2026-09-16' },
}

export const ALL_HREFS = Object.keys(PAGES) as InternalHref[]
