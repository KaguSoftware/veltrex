import type { routing } from '@/i18n/routing'
import type messages from './messages/tr.json'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]

    /**
     * Turkish is the reference catalogue, so every message key is typed from
     * messages/tr.json. A key that exists in en.json but not in tr.json is
     * therefore invisible to the type system, which is the correct bias for a
     * Turkish-first site: Turkish is the source and English is the translation.
     *
     * scripts/check-messages.mjs asserts the two files have identical key sets,
     * which is what catches drift in the other direction.
     */
    Messages: typeof messages
  }
}
