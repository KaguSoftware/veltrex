# Veltrex

Corporate website for VELTREX TEKNOLOJİ VE TİCARET ANONİM ŞİRKETİ, an İstanbul company organised
into three divisions: Technology, Investment and Trading.

Turkish first, English alongside. Every page is statically generated. Hosted on Vercel.

## Quick start

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Then open http://localhost:3000, which serves Turkish. English is at http://localhost:3000/en.

## Stack

| Package | Version | Note |
| --- | --- | --- |
| next | 16.3.5 | pinned exactly; 16.3 is the floor because `next/root-params` landed there |
| react, react-dom | 19.2.8 | what `create-next-app` pins, not `latest` |
| next-intl | 4.14.5 | routing only, no message layer |
| tailwindcss | 4.3.3 | CSS-first, no `tailwind.config.js` |

Versions are pinned without carets and `package-lock.json` is committed, so `npm ci` reproduces the
whole transitive tree.

## URLs

Turkish is the default locale and is served unprefixed. English is prefixed with `/en`. Pathnames are
localized per locale, so the two locales of a page share no URL segments.

| Page | Turkish | English |
| --- | --- | --- |
| Home | `/` | `/en` |
| Divisions | `/is-kollari` | `/en/divisions` |
| Technology | `/is-kollari/teknoloji` | `/en/divisions/technology` |
| Investment | `/is-kollari/yatirim` | `/en/divisions/investment` |
| Trading | `/is-kollari/ticaret` | `/en/divisions/trading` |
| About | `/kurumsal` | `/en/about` |
| Contact | `/iletisim` | `/en/contact` |
| Privacy | `/gizlilik-politikasi` | `/en/privacy-policy` |
| Data protection | `/kvkk-aydinlatma-metni` | `/en/data-protection-notice` |

## Layout

```
assets/brand/source/   the five supplied brand masters, never touched by the build
assets/brand/dist/     generated SVG and PNG, committed so Vercel needs no image tooling
docs/decisions/        why the load-bearing choices were made
public/                static files served at the web root
scripts/               verification gates, run by npm run verify
src/app/[locale]/      the route tree
src/content/           all copy, typed, both locales
src/i18n/              routing, navigation and request config
src/lib/               site config, SEO helpers, structured data
tools/brand/           one-off brand pipeline, never wired into build
```

## Verification

```powershell
npm run verify
```

That chain is the contract. It runs the dash check, palette check, Turkish casing check, contrast
check, content check, route check, typecheck, lint, build, prerender check, hreflang check and the
public URL matrix.

Two things worth knowing about it:

- `next lint` no longer exists and `next build` no longer lints, so lint is wired into the chain by
  hand. Removing it means linting silently stops happening.
- The gates are meant to be broken on purpose once each, to confirm they exit non-zero. A gate
  nobody has seen fail is decoration.

## Deploying

The production domain is not yet decided, and that is handled rather than worked around. Nothing in
the codebase hardcodes a domain: canonicals, hreflang, the sitemap, robots.txt and the Open Graph
image base all derive from `NEXT_PUBLIC_SITE_URL`.

Preview deployments work today with the domain still unknown. For production, set
`NEXT_PUBLIC_SITE_URL` in the Vercel Production environment **before** the first production build,
because `src/lib/site.ts` throws by design without it, and because `NEXT_PUBLIC_*` is inlined at
build time so a later change needs a redeploy rather than an env edit.

Preview deployments return `Disallow: /` from `robots.txt`, which is what stops every preview
becoming an indexable duplicate of production.

## Contributing

Read [CLAUDE.md](./CLAUDE.md) first. It carries the rules that are not obvious from the code,
including commit attribution, the ban on em dashes, the ban on pure black and white as design
values, Turkish casing, and the content honesty policy.

Open questions about the business are tracked in [CONTENT-TODO.md](./CONTENT-TODO.md).

## What is deliberately not here yet

Honest inventory, so nobody goes looking.

- **No dark theme, on purpose.** The design is alternating navy and paper
  bands, so the navy bands already give a dark ground and the paper bands stay
  paper in every colour scheme. The reasoning is at the top of
  `src/app/globals.css`.
- **No analytics.** Deliberate: it is what keeps the site free of a cookie
  consent banner. See `CONTENT-TODO.md` item 10 before adding any.
- **Division pages are intentionally shallow.** We do not yet know what each
  division concretely does, so they are written on structure and method and
  share one layout. Depth slots into the same structure without a redesign.
  See `CONTENT-TODO.md` items 1 and 2.
- **Not deployed to production.** The domain is undecided, and
  `src/lib/site.ts` throws on a production build without
  `NEXT_PUBLIC_SITE_URL` by design. Preview deployments work today.
