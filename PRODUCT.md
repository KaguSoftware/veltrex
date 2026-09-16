# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: counterparties vetting the company. Suppliers, banks, prospective clients and partners who
have heard the name Veltrex, received a document or a phone number, and open the site to confirm it
is a real, serious company before they call, sign or pay. Mostly Turkish readers at a desk during
working hours, with a meaningful share on a phone; English readers are secondary.

Their job is short: confirm the company exists, understand in one pass what it does, find the legal
identity and the way to reach it.

## Product Purpose

The corporate website of VELTREX TEKNOLOJİ VE TİCARET ANONİM ŞİRKETİ. It establishes legitimacy,
explains the three-division structure, and routes the visitor to a phone call or the registered
address. Success is a visitor who leaves convinced the company is substantial and knows how to reach
it.

## Positioning

One İstanbul joint stock company, three divisions under one structure: Technology, Investment and
Trading. Veltrex is not a marketing agency and is never described as one.

## Operating Context

Visitors typically arrive from a search for the company name, a business card, a phone number or a
commercial document. There is deliberately no contact form and no analytics: contact is by phone or
by post to the published address, which keeps the site free of a cookie consent banner.

## Capabilities and Constraints

- Next.js App Router, statically generated, hosted on Vercel. Turkish is primary and served at the
  root; English is secondary under `/en`. Localized pathnames per locale.
- Nine pages per locale: home, divisions index, three division pages, corporate, contact, privacy,
  data protection notice, plus a real prerendered 404.
- All copy lives in `messages/<locale>.json`; no locale branching in components.
- Undecided and not to be asserted: whether Veltrex acts as principal or intermediary in any
  division; whether Trading is domestic, export or mixed; any certification; the production domain;
  an email mailbox; MERSİS and Ticaret Sicil numbers.

## Brand Commitments

- The Veltrex logo: a V mark of two blades, navy `#082358` over blue `#0065EA`, with a knockout fold
  at a measured 3:5 slope (59.036 degrees), and the VELTREX wordmark. Duotone artwork on light and
  dark grounds, monochrome artwork on navy and on blue. See `docs/decisions/0003`.
- Brand colours are exact: navy `#082358` and blue `#0065EA`, never approximated.
- Never pure black or pure white as a design value; shadows are navy tinted.
- No em dashes or en dashes anywhere. Typographic apostrophe U+2019.
- Turkish casing is applied at render time with a locale-aware helper, never with CSS
  `text-transform`.
- Visual reference the owner likes: mhholding.es (a holding company site with full-bleed dark
  architectural imagery, alternating deep-colour and light sections, a serif display face, vertical
  rules between columns and scroll reveals). Low contrast, no creativity and no motion were the
  explicit complaints about the previous build.
- Imagery decision: no stock photography. The hero and dark sections carry a drawn architectural
  facade built from the logo's own fold angle.

## Evidence on Hand

- Legal name, Vergi No `4111039736`, address Yeşilce Mah. Yunus Emre Cad. No: 8/1, Kağıthane /
  İstanbul, Türkiye, and two phone numbers, all in `src/lib/site.ts`.
- Brand masters in `assets/brand/source/`, extracted vector paths in
  `src/components/brand/logo-paths.ts`.
- No photography, no client names, no case studies, no statistics, no founding date, no office list.
  None of these may be invented. Open questions are tracked in `CONTENT-TODO.md`.

## Product Principles

1. Legitimacy before persuasion: the legal identity and the way to reach the company are never more
   than one scroll away.
2. Say less and make it certain. Every sentence is either structural or backed by a document.
3. One company, three divisions: the structure itself is the story.
4. Turkish reads as Turkish, not as translated English.

## Accessibility & Inclusion

WCAG 2.2 AA. Contrast is computed for every text pairing, focus rings contrast on every ground,
reduced motion is honoured, and the site works without JavaScript for reading.
