import type { Locale } from '@/i18n/routing'

/**
 * Locale-aware uppercase. The ONLY way this codebase uppercases text.
 *
 * Two rules it exists to enforce:
 *
 * 1. Never `text-transform: uppercase` on Turkish. CSS case mapping follows the
 *    lang attribute in theory, but only Firefox actually implements Turkic
 *    mapping, so Chrome and Safari render "istanbul" as "ISTANBUL" with a
 *    dotless capital where Turkish needs the dotted İ.
 * 2. Never bare `toUpperCase()`, which has the same defect in JavaScript.
 *
 * Message catalogues therefore store NATURAL CASE only, and this runs at render
 * time on the server. check-messages.mjs fails the build on any pre-cased value,
 * because a pre-cased Turkish string cannot be verified after the fact:
 * "TEKNOLOJI" is a valid uppercase of both "teknoloji" and "teknolojı".
 */
export function upper(value: string, locale: Locale): string {
  return value.toLocaleUpperCase(locale)
}

/** Locale-aware lowercase, same reasoning. Turkish I lowercases to ı, not i. */
export function lower(value: string, locale: Locale): string {
  return value.toLocaleLowerCase(locale)
}
