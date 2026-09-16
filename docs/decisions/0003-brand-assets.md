# 0003. Brand assets: a zero-dependency extractor, two geometries, and a measured ink box

Status: accepted.

## Context

The brand was supplied as five files: four PNGs at 3439 x 1254 and one Adobe Illustrator PDF. The
site needs a header lockup, a dark-ground lockup, an isolated mark for icons, a favicon, an Apple
touch icon, a maskable PWA icon and two Open Graph images. All of it has to come from those five
files, on a Windows machine with no poppler, no Inkscape, no Ghostscript and no ImageMagick.

## The fold is a real knockout, which was initially got wrong

This is the load-bearing fact about the mark, and the first analysis of it was wrong.

The mark is a two-tone chevron where a navy blade crosses a blue blade. An early pass concluded the
fold was "purely a colour boundary between two flush overlapping shapes", reasoning from the blades'
**bounding boxes** overlapping, and concluded that recolouring both blades to one value would fuse
them into a solid chevron.

A pixel scan disproves it. At y=700 in `veltrex-Logo-H-C.png` the row reads navy `#082358` through
x795, then **fully transparent, alpha 0**, from x800 to x810, then blue `#0065EA` from x815. The gap
is 14px wide, holds that width down the whole seam, and its left edge marches
749 → 774 → 798 → 822 → 844 as y goes 620 → 660 → 700 → 740 → 780. That is exactly **3:5 slope**, or
59.04 degrees from horizontal.

Overlapping bounding boxes do not imply overlapping fills. The blue blade's path is cut with a notch,
so the region is simply unpainted.

Two consequences, and the first is good news:

- **The fold survives on any ground**, because the gap shows the background through rather than
  depending on two colours meeting. A single geometry with `currentColor` genuinely works on navy.
- The 3:5 seam angle is real brand geometry, so the layout language can reuse it rather than
  inventing an arbitrary diagonal.

## Decision: two geometries, not two colour schemes

- **Duotone** artwork on paper grounds and on the dark ground.
- **Monochrome** artwork, all white, on navy and on brand blue.

The monochrome files are a genuinely different drawing rather than a recolour: the under-blade is
trimmed back and the wordmark is optically expanded by roughly 1.7 percent, which is the standard
correction for white-on-colour reading thinner than dark-on-light. That is a real designer decision
and worth preserving.

The dark rule is **all white, not white plus blue**. The supplied monochrome pages contain exactly
one non-white colour, the background rectangle. Keeping the blue blade on navy would fail contrast
anyway, at 2.91:1.

Minimum sizes, because a sub-pixel gap aliases away where a colour boundary does not:

| Asset | Minimum |
| --- | --- |
| Duotone mark | 20px |
| Monochrome mark | 48px |
| Tagline | 320px lockup width |

So `app/icon.svg` is the duotone mark, while the 180px Apple icon can be monochrome.

## Decision: a zero-dependency extractor

Every off-the-shelf route was checked and rejected:

| Route | Why not |
| --- | --- |
| `mupdf` 1.28.1 | Genuine vector SVG and actively maintained, but AGPL-3.0-or-later |
| `mupdf-js`, `pdf2svg` | AGPL, abandoned since 2022; `pdf2svg` also shells out to poppler |
| `pdfjs-dist@2.16.105` | Last version with `SVGGraphics`, but its example needs `domstubs.js`, which ships in the pdf.js repo and not in the npm package |
| `pdf-to-svg` | Empty placeholder stub |

Instead, `tools/brand/` holds a small Node script using only `fs` and `zlib`. This works because the
PDF is unusually simple: verified to contain zero `/Font` and `/FontFile` entries, so all type is
outlined to paths, zero `/Subtype /Image`, and FlateDecode streams only. It is also the only route
that emits **semantically grouped** paths, mark-over, mark-under, wordmark, tagline and
tagline-comma, which is exactly what makes one themeable React component possible. A generic
converter returns an undifferentiated blob.

Note the PDF is **4 pages**, one per variant. A converter without a page loop silently yields only
the horizontal duotone and misses both monochrome variants, which are the only source for the dark
treatment.

## Decision: trim to a measured ink box, never to the canvas

The transparent padding is **asymmetric**. The ink box is x 294 to 2890, y 323 to 989 inside a
3439 x 1254 canvas, so the margins are left 294, right 548, top 323, bottom 264.

A centred square crop of the canvas does not letterbox the mark, it **removes** it: a centred
1254 x 1254 crop starts at x 1092, while the mark ends at x 1163, so the crop would contain 71px of
the mark's right edge and 1183px of wordmark.

So `tools/brand/measure-ink-bbox.mjs` runs first and its output is committed as
`assets/brand/measured.json`. Every derived asset trims to that, then composites onto a fresh square
canvas at a chosen fill ratio. Note the "vertical" PNGs are also 3439 x 1254 landscape, so the
vertical lockup needs its own measurement.

Maskable icon safe zone, computed against the measured mark ratio of 1.3050, since content must sit
inside a centred circle of radius 40 percent of width:

- 512 x 512: mark at 307 x 235, left 102, top 138
- 192 x 192: mark at 115 x 88, left 38, top 52

## Decision: no SVGR

Turbopack is the default bundler in Next 16 and **does not run a `webpack()` config at all**, so the
official SVGR recipe fails silently with zero errors. The working key would be top-level
`turbopack.rules`, and `@svgr/webpack` is on Next's supported loader list, but it was last published
in 2023 and would become a single point of failure for the whole build. A global `'*.svg'` rule is
also a live trap, because it converts every SVG import into a component and breaks
`import url from './x.svg'` and anything passing an SVG path to `next/image`.

The extracted paths are inlined as JSX in one logo component instead. No loader, no dependency, no
Turbopack interaction, per-path theming, and the tagline can be gated behind a prop, which matters
because the tagline is about 5.5KB of the roughly 7KB of path data.

## Consequences

- The brand scripts are **never** wired into `build`. Vercel must not need `sharp`, `svgo` or the
  source PDF in order to deploy. They run once locally and their outputs are committed.
- `sharp` will not resolve CSS custom properties when rasterizing: librsvg takes the fallback, and
  renders `currentColor` as black. So the pipeline emits a dedicated flat off-white SVG for icon use
  rather than relying on tinting.
- `apple-icon.png` must be **opaque**, grounded on paper `#FCFBF8`, because iOS composites alpha
  unpredictably and historically onto a dark ground.
- The Open Graph font is a separately committed, pre-subset TTF. `next/font` downloads woff2 and
  Satori cannot read woff2, and Satori does not fall back per glyph, so a font missing U+011E,
  U+0130 or U+015E renders Turkish as tofu in the card while looking perfect on the page. Testing
  with only the dotless i passes falsely, because U+0131 sits inside Google's `latin` range by a
  carve-out. Test with real strings: "İş Kolları", "Yatırım", "Kağıthane".
