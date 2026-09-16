# Content register: what needs confirming

Every claim on this site that is not backed by a document we hold is listed here, with the exact
question to ask. Nothing in this file is confidential: **this repository is public**, so it is
written as open questions only. No pricing, no counterparties, no internal structure.

Status key: **BLOCKER** stops the production deploy. **OPEN** means the site ships honestly without
the answer, but stays less specific than it could be.

---

## 1. What does each division actually do? BLOCKER for specificity

The single question that changes the site rather than a paragraph. The whole group narrative, all
three division taglines, the home hero and the About page rest on it.

Ask, in these words:

- **Technology.** Do you build systems and then operate and host them, or do you deliver and hand
  over? The difference decides whether the site can say "what we build, we keep running".
- **Investment.** Do you deploy only the company's own capital, or do you ever manage, pool or
  solicit third-party money? This is not a style question. Managing third-party capital in Türkiye is
  SPK-licensed activity, so if there is any third-party element, every line that could read as an
  offer has to come out and counsel must see the page before launch.
- **Trading.** Do you buy and take title to goods, or broker for a commission?

**Current handling:** the copy asserts none of the three. It is written on structure and long-term
involvement, so no rewrite is needed whichever way each answer lands.

One follow-up in the same conversation: two lines describe staying involved after the setup stage,
"yapıyı kurar, sonrasında da içinde kalırız" on the home page and "kurgudan yürütmeye kadar süreçte
yer alırız" in the home introduction. Is that true of all three divisions? If not, both lines should
be narrowed. Until then they stay at body size, and the large statement on the home page uses the
structural line about the divisions sharing one approach instead.

## 2. Is Trading domestic, export, or a mix? BLOCKER for specificity

There is a genuine contradiction in the source material and it should be resolved before the Trading
page gets any more specific.

The company's own proforma invoice is denominated in TRY with a VAT column, which is a **domestic
sale** pattern. An export operation would normally invoice differently.

Ask: what product groups do you actually trade, and is the work domestic, import, export or mixed?
Then, of the instruments that usually appear on a trading page (Incoterms, letters of credit, tariff
classification, customs brokerage, freight forwarding), which do you handle in house, which do you
coordinate through a broker or forwarder, and which do you not do at all? We will cut the third
group rather than soften it.

**Current handling:** the Trading page names none of those instruments.

## 3. The domain, and the email mailbox. BLOCKER for the production deploy

- What is the production domain?
- Does an `info@` mailbox exist on it, and who reads it?

Both block the first production deploy. The build throws by design when
`NEXT_PUBLIC_SITE_URL` is unset in the production environment, and with no confirmed mailbox the
KVKK notice can only offer the postal address as its application channel.

**The email we were given is unusable.** `salse@greeniletisim.com` appears in the proforma invoice.
"salse" is a typo of "sales", and the domain belongs to a different company. It is published
nowhere on this site. Separately: that address should be corrected in the company's own stationery,
not only on the website, because the invoice template carries it.

Smaller, same conversation:

- What is the difference between `+90 212 300 99 99` and `+90 212 300 99 44`? Is either a fax?
- What are the working hours?
- What is the postal code for Yeşilce Mah. Yunus Emre Cad. No 8/1, Kağıthane?

## 4. Registry identifiers. OPEN, and one is for the accountant

Please provide, so the footer can be completed:

- MERSIS numarası
- Ticaret Sicil Numarası, and the registry office that issued it

TTK art. 39/2 expects these on a company website. We publish nothing we cannot back, so today these
fields are **structurally absent** rather than showing "N/A" or a guess.

We do hold the Vergi No, `4111039736`, and it is published.

**For the accountant, not the lawyer:** is Veltrex subject to independent audit? If yes, TTK art.
1524 requires the website to also publish committed and paid-in capital and the board members,
which changes the footer scope.

## 5. Do you hold any certification? OPEN

ISO 27001, ISO 9001, TSE, a KVKK compliance audit, anything else.

We have deliberately claimed **none** anywhere on the site. If you do hold one, we need the exact
certificate name, number, issuing body and validity dates, because a certification claim without
those is worse than making no claim at all.

## 6. Two copy lines that asserted more than we know. OPEN

Both were rewritten already; please confirm the replacements.

- The About draft said the company does not claim offices in other cities **because there are none**.
  We know one address. We do not know it is the only location, so that was an invented fact in the
  honest direction, which is the subtle kind. It now reads that the only address published on this
  site is Kağıthane / İstanbul. Is there any branch, warehouse, bonded warehouse or foreign
  representative office that should be listed?
- The Contact draft said both numbers reach a switchboard and that you will put the caller through to
  the right person. Please confirm that is true, or it becomes a simple request to say which division
  the enquiry concerns.

## 7. Legal review before launch. OPEN, for counsel

The two legal pages ship with a visible DRAFT banner and must be reviewed. Specific questions:

- "No contact form, so no KVKK obligation" is **wrong**, and the texts reflect that. Vercel's edge
  logs the visitor IP on every request, an IP is personal data, so Veltrex is a veri sorumlusu for
  server log records and an Aydınlatma Metni is owed regardless of there being no form.
- US hosting is a cross-border transfer under the article 9 regime as rewritten by Law 7499,
  effective 1 June 2024. Does the Vercel hosting relationship need a standart sözleşme notified to
  the Authority for pure server-log processing, or does an exception cover it? A Türkiye-hosted
  alternative would remove the question entirely, which is worth raising as a consideration.
- What log retention period is actually configured at the hosting layer? Both texts need a real
  number in the saklama süresi clause and there is nothing to put there today.

## 8. Brand questions for whoever owns the brand book. OPEN

- The tagline comma in "Teknoloji, Ticaret" is brand blue `#0065EA`, not grey, in the colour
  artwork. Sixteen of the seventeen tagline glyphs are grey and the comma is the one blue element.
  Is that intentional? It becomes white in the supplied monochrome asset.
- Is all-white the official monochrome rule on both navy and brand blue? The supplied assets imply
  it, but no brand book was provided.
- What is the official minimum reproduction size for the mark? Measured, the monochrome fold gap
  stops resolving below roughly 48px, so the brand book may already specify a number.
- Can the original `.ai` file be obtained? The PDF carries an Illustrator private data block but no
  editable layer names, so the path grouping in the extraction script is inferred from fill colour
  and paint order rather than read from named layers.

## 9. Naming decisions already taken. OPEN, confirm before indexing

URLs are a one-way door once indexed. Three conflicts in the specs were resolved as follows, and the
reasoning is substantive but the decision is the client's:

- Turkish About is `/kurumsal`, labelled "Kurumsal", rather than `/hakkimizda`, because "Hakkımızda"
  promises a founder story, a team and a history that we do not have and will not invent.
- Turkish divisions index is `/is-kollari`, labelled "İş Kolları", rather than `/bolumler`, because
  "bölüm" is org-chart language, and "faaliyet alanları" promises an inventory we cannot list, while
  "iş kolu" names structure without implying separate legal entities.
- English KVKK page is `/en/data-protection-notice` rather than `/en/kvkk-notice`, because the
  acronym means nothing to a foreign reader.

Also in the one-way-door category: hreflang granularity is currently `tr-TR` plus bare `en`. Note
that `tr-TR` does not match a Turkish speaker in Germany, who resolves through `x-default` instead.
It is legal and currently harmless, but far cheaper to settle now than after indexing.

## 10. Analytics. Confirmed as none, recorded here so the reason is not lost

Launching with zero analytics is what keeps this site free of a cookie consent banner, together with
using a plain link to Google Maps instead of an embedded map.

Adding GA4, a map iframe, a YouTube embed, Hotjar or a LinkedIn Insight Tag flips the answer to
"banner required" and changes both legal texts in the same commit.

If measurement is wanted later: Vercel Speed Insights first, because it takes no referrer, no query
parameters and no city-level geolocation. Web Analytics only after legal sign-off.
