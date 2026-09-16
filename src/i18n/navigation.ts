import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * The ONLY navigation primitives this app may use.
 *
 * Importing next/link or next/navigation's redirect directly would bypass both
 * the locale prefix and the pathname map, producing a link that 404s in one
 * locale and works in the other. That failure is invisible in Turkish, which
 * is the unprefixed default, so it tends to reach production.
 *
 * getPathname is SYNCHRONOUS in 4.14.5, returning string rather than
 * Promise<string>, despite next-intl's own sitemap example awaiting it.
 */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
