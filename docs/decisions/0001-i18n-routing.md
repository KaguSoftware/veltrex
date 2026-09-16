# 0001. next-intl as a routing library only, with no message layer

Status: accepted.

## Context

Turkish is the default locale and must be served unprefixed at the root. English is prefixed under
`/en`. Pathnames are localized per locale, so `/is-kollari/teknoloji` and
`/en/divisions/technology` are the same page. Every route must statically generate, while middleware,
image optimization, ISR and server actions stay available for a later dynamic phase.

Next.js has no built-in App Router i18n. The `i18n` key in `next.config` is Pages Router only, and
there is no first-party documentation for an unprefixed default locale at all: the official guide
shows every locale prefixed. So this is library territory rather than a documented framework feature,
and the choice needed making before any route file existed, because retrofitting is expensive.

Three options were designed in full and scored independently.

1. **Literal sibling folders**, `app/(tr)/is-kollari` beside `app/en/divisions`. Zero dependencies,
   zero proxy, unambiguously static, but it duplicates layout wiring and gives up root params.
2. **A hand-rolled dictionary** with `app/[locale]`, `generateStaticParams`, a typed `t()` helper and
   a hand-maintained pathname map.
3. **next-intl 4.14.5** with `localePrefix: 'as-needed'` and its `pathnames` map.

## Decision

Option 3, but stripped to routing only. The message layer is deleted.

Three of the four usual arguments for the dependency are worth nothing here, and are not claimed:

- **Locale negotiation is deliberately disabled.** `localeDetection: false`, because Googlebot crawls
  from the US with an English `accept-language` and must never be bounced off the Turkish root.
- **Formatting is native.** `Intl.NumberFormat('tr-TR')` and `Intl.DateTimeFormat('tr-TR')` need no
  library.
- **ICU is inert on this content.** Turkish takes no plural agreement after a numeral, so the rule
  collapses to `other` alone, and eleven brochure pages have no dynamic quantities.

What remains is one problem with no cheap hand-rolled equivalent. `/is-kollari/teknoloji` and
`/en/divisions/technology` share no path segment, no prefix and no depth relationship. The only thing
the two locales of that page have in common is the internal route id `/divisions/technology`, and on
the client `usePathname` is the only thing that knows it. That reverse lookup is what the language
switcher needs in order to land on the equivalent page rather than the home page, and it is the whole
dependency.

The message layer goes because the content does not fit it. The three divisions have three genuinely
different section shapes, and `t()` returns a string, so nested arrays of objects would require
`t.raw()`, which discards exactly the typing that was the second-best reason to take the library.
Typed property access on a typed object gives better errors and faster typechecks. `getRequestConfig`
still runs and returns `messages: {}`.

## Two behaviours verified rather than assumed

Read off the published 4.14.5 bundle, because both were flagged as unknown during research:

- An unprefixed default-locale path is **rewritten, not redirected**, so `/is-kollari/teknoloji`
  stays visible in the address bar.
- A superfluous `/tr` prefix **redirects** with 307 or 308.

## Consequences

- `proxy.ts` is required, and in Next 16 that is the filename: `middleware.ts` is deprecated. It runs
  on the Node.js runtime only, and setting a `runtime` export there throws. A proxy does **not** force
  dynamic rendering; it rewrites in front of prerendered output.
- Its matcher must exclude the image conventions, or the **Turkish** Open Graph image silently
  breaks while English resolves fine. See `docs/decisions/0003`.
- `setRequestLocale` is deprecated and is not used. The locale comes from `next/root-params`, which
  landed in Next 16.3.0 and is the reason 16.3 is the version floor rather than 16.0.
- Because root params are only the segments **above** the root layout, `src/app/layout.tsx` must not
  exist. Creating one demotes `[locale]` and `next/root-params` silently stops resolving.

## Plan B, pre-costed at about half a day

next-intl issue 2037 reports that under `as-needed` the default-locale path, which here is the
Turkish root and the single most important page, can bypass the CDN cache and re-render per request
with no `Cache-Control` header. It affects ISR rather than the build-time prerender this project
uses, so it is not a current defect.

The trigger to watch for is a missing `cache-control` header on the Turkish root of a deployment.
If that appears, the escape hatch is option 1 above: literal sibling folders. It costs the duplicated
layout wiring and the loss of root params, and it removes the proxy entirely. The reason this is
cheap to fall back to is that all copy already lives in a typed content layer that is independent of
the routing mechanism.
