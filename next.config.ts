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

  /*
   * experimental.globalNotFound is NOT enabled, because it does not help here.
   * The proxy rewrites every request into the locale segment, so no request
   * ever fails to match a route, which is the only case that file handles.
   * Unknown paths are rewritten to [locale]/404 with a 404 status instead.
   * See src/app/[locale]/404/page.tsx for the measurements behind this.
   */

  /*
   * Off on purpose. With it on, next dev writes a managed instructions block
   * into AGENTS.md on every start, and that block contains an em dash, which
   * fails npm run check:dashes the moment anyone commits a working tree after
   * running the dev server. The repository rules for agents live in CLAUDE.md.
   */
  agentRules: false,

  typescript: {
    // Never ignore build errors. Stated explicitly so nobody adds it later to
    // get past a red build.
    ignoreBuildErrors: false,
  },
}

// The plugin auto-detects the request config at ./i18n/request.ts under src/.
const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
