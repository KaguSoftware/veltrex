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

### Amended: the message layer is kept, at the owner's direction

An earlier revision of this decision dropped next-intl's message layer in favour of a typed
TypeScript content module, on the argument that the three divisions have different section shapes and
that nested arrays need `t.raw()`, which loses some typing.

That was reversed by the project owner, who specified the conventional structure:
`messages/<locale>.json`, with no `if` or `else if` branching on locale in components. That is the
right call, and the argument against it was weaker than it looked:

- The ternary pattern it replaces was genuinely bad. The placeholder home page had
  `locale === 'tr' ? '...' : '...'` inline, which does not scale past two locales, scatters copy
  through components, and is exactly what a message catalogue exists to prevent.
- Type safety is not actually lost. `AppConfig.Messages` is derived from `messages/tr.json`, so
  `t('nopeNotAKey')` is a compile error. Verified: `tsc` rejects it with TS2345.
- The one real gap is that types come from the Turkish reference only, so a key present in `tr.json`
  and missing from `en.json` typechecks and then renders a raw key path to an English visitor.
  `scripts/check-messages.mjs` closes it by asserting identical key sets, and is proven to fail on a
  deliberately deleted key.

So: Turkish is the reference catalogue, English is the translation, and
`getRequestConfig` loads `messages/<locale>.json` by a dynamic import keyed on the resolved locale.
Adding a locale is a new JSON file plus an entry in `routing.ts`, with no conditional anywhere.

### One thing the catalogues must not contain: pre-cased strings

A gate was written to detect Turkish uppercase done the JavaScript way, and it had to be rewritten
because **the problem is undecidable**, which is worth recording so nobody tries again.

Given the stored value `TEKNOLOJI`, there is no way to tell whether the author meant:

- `teknoloji` uppercased correctly, which is `TEKNOLOJİ` with a dotted capital, or
- `teknolojı` uppercased correctly, which is `TEKNOLOJI` with a dotless capital

Both are legitimate, and real Turkish copy contains both forms: `Yatırım` genuinely uppercases to
`YATIRIM` with a dotless I. The information needed to judge it is destroyed by the casing itself.

So the rule is decidable instead: **catalogues store natural case only**, and uppercase styling is
applied by `upper()` in `src/lib/text.ts`, which calls `toLocaleUpperCase(locale)` server-side.
`check-messages.mjs` fails the build on any all-caps value. CSS `text-transform` stays banned,
because only Firefox implements Turkic case mapping.

The URL matrix asserts the dotted `İ` is present in the rendered Turkish page and the dotless `I` is
absent, so a regression in either direction fails the build.

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

## Plan B, pre-costed at about half a day, and currently not needed

next-intl issue 2037 reports that under `as-needed` the default-locale path, which here is the
Turkish root and the single most important page, can bypass the CDN cache and re-render per request
with no `Cache-Control` header.

**Measured on this project, and the risk did not materialise.** A local production server returns:

```
GET /  ->  200, cache-control: s-maxage=31536000
```

So the Turkish root is cached, not bypassed. The first build also confirmed both locales prerender
as static HTML rather than being forced dynamic by the proxy, which was the other half of the same
worry. `scripts/check-public-urls.mjs` records this header on every run without asserting it, so a
regression would show up as a visible change rather than a silent one. Re-check it on the first
Vercel deployment, since the CDN layer is what the issue is actually about.

The trigger to act on is a **missing** `cache-control` header on the Turkish root of a deployment.
If that ever appears, the escape hatch is option 1 above: literal sibling folders. It costs the
duplicated layout wiring and the loss of root params, and it removes the proxy entirely. The reason
this stays cheap to fall back to is that all copy lives in a typed content layer that is independent
of the routing mechanism.

## What the first build actually proved

Recorded because these were the load-bearing assumptions, and assumptions are worth converting into
measurements:

| Assumption | Result |
| --- | --- |
| Both locales prerender despite the proxy | Confirmed, both marked SSG in the route table and present as HTML on disk |
| `/` serves Turkish with `lang="tr"` | Confirmed, with correct diacritics |
| A superfluous `/tr` redirects | Confirmed, 307 to `/` |
| `alternateLinks: false` removes the header | Confirmed, no `link:` header on either locale |
| Unknown paths return a real 404 | Confirmed, status 404 and not a soft 200 |
| The Turkish root is CDN cacheable | Confirmed, `s-maxage=31536000` |
