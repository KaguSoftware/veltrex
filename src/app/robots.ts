import type { MetadataRoute } from 'next'
import { SITE_URL, SITE_HOST } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  /*
   * Every non-production deployment is disallowed wholesale.
   *
   * Without this, every *.vercel.app preview becomes an indexable duplicate of
   * the production site carrying its own canonical, which is the most common
   * way a Vercel-hosted site gets flagged for duplicate content.
   */
  const isProduction = process.env.VERCEL_ENV === 'production' || !process.env.VERCEL_ENV

  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Deliberately NOT disallowing /_next/: that would block the CSS and JS
      // Googlebot needs in order to render the page at all.
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    // `host` takes a HOSTNAME, not a URL. Next prints it verbatim as
    // `Host: <value>`, so passing a full URL emits an invalid directive.
    host: SITE_HOST,
  }
}
