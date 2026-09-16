import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { locale as localeRootParam } from 'next/root-params'
import { routing } from './routing'

/**
 * Resolves the active locale and loads its message catalogue.
 *
 * The locale comes from next/root-params, which landed in Next 16.3.0 and is
 * the reason 16.3 is this project's version floor. It replaces setRequestLocale,
 * which next-intl deprecated in 4.13.5, and it is why no pass-through root
 * layout exists and why src/app/layout.tsx must never be created: root params
 * are only the dynamic segments ABOVE the root layout.
 *
 * Copy lives in messages/<locale>.json. The import is dynamic and keyed by the
 * resolved locale, so adding a locale is a new JSON file plus an entry in
 * routing.ts, with no conditional anywhere in the app.
 */
export default getRequestConfig(async () => {
  const candidate = await localeRootParam()
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Pinned so a server in a different zone cannot format dates differently
    // from a local build, which would make prerendered output non-reproducible.
    timeZone: 'Europe/Istanbul',
  }
})
