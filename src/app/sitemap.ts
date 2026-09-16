import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { PAGES, ALL_HREFS } from '@/lib/pages'
import { urlFor, HREFLANG } from '@/lib/seo/alternates'

/**
 * One entry per page per locale, each carrying the full alternates set.
 *
 * Generated from the same PAGES table and the same urlFor helper as
 * metadata.alternates, so the sitemap and the HTML tags cannot disagree.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ALL_HREFS.flatMap((href) =>
    routing.locales.map((locale) => {
      const languages: Record<string, string> = {}
      for (const l of routing.locales) languages[HREFLANG[l]] = urlFor(href, l)
      languages['x-default'] = urlFor(href, routing.defaultLocale)

      return {
        url: urlFor(href, locale),
        lastModified: PAGES[href].lastModified,
        changeFrequency: PAGES[href].changeFrequency,
        priority: PAGES[href].priority,
        alternates: { languages },
      }
    }),
  )
}
