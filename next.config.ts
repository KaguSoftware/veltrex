import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  // No `output` key. Setting it at all is what would remove the proxy,
  // next/image optimization, ISR, server actions and route handlers. With the
  // default, every page still prerenders at build time while all of that stays
  // available for a later dynamic phase.

  // No `cacheComponents`. It is a top-level, opt-in flag in Next 16 and leaving
  // it off keeps the classic fully static build. Turning it on later makes
  // generateStaticParams mandatory for every root param or the build fails.

  experimental: {
    // Catches requests that fall OUTSIDE the proxy matcher, which the
    // [locale]/[...rest] catch-all cannot reach. Required because the root
    // layout lives at app/[locale]/layout.tsx, and Next's own docs recommend
    // this file for exactly that shape. Still experimental in 16.3.5.
    globalNotFound: true,
  },

  typescript: {
    // Never ignore build errors. Stated explicitly so nobody adds it later to
    // get past a red build.
    ignoreBuildErrors: false,
  },
}

// The plugin auto-detects the request config at ./i18n/request.ts under src/.
const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
