---
name: Veltrex
description: A holding company's facade, drawn rather than photographed, at the logo's 59.036 degree seam.
colors:
  brand-950: "#031435"
  brand-900: "#082358"
  brand-800: "#02358a"
  brand-700: "#034cbe"
  brand-600: "#0065ea"
  brand-500: "#3a80f9"
  brand-400: "#649dfe"
  brand-300: "#99bfff"
  brand-200: "#c5dafe"
  brand-100: "#e3edfe"
  void: "#050f28"
  paper-50: "#fdfaf6"
  paper-100: "#f9f5ef"
  paper-200: "#f5efe7"
  paper-300: "#f0e8df"
  paper-400: "#ddd3c6"
  ink-900: "#0a1932"
  ink-700: "#324058"
  ink-500: "#565e6b"
  mist-100: "#e6e9f0"
  mist-300: "#aebbd4"
  brand-grey: "#6d6e71"
typography:
  display-xl:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(3.125rem, 1.4rem + 5.2vw, 6rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.022em"
  display-l:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.375rem, 1.3rem + 3.6vw, 4.75rem)"
    fontWeight: 300
    lineHeight: 1.03
    letterSpacing: "-0.018em"
  display-m:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2rem, 1.35rem + 2.1vw, 3.25rem)"
    fontWeight: 300
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  display-s:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(1.625rem, 1.3rem + 0.9vw, 2.125rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  lead:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "clamp(1.125rem, 1.02rem + 0.35vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  button:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.01em"
  label:
    fontFamily: "Albert Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  menu:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3.2vw, 3rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  menu-sub:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.2
  menu-phone:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 300
    lineHeight: 1.35
  legal-heading:
    fontFamily: "Noto Serif Display, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(1.5rem, 1.25rem + 0.8vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 4.5vw, 4rem)"
  container: "86rem"
  column-gap: "2rem"
  band: "clamp(5rem, 11vw, 9.5rem)"
  band-statement: "clamp(6.5rem, 13vw, 11rem)"
  header: "4.5rem"
  logo-sm: "2.5rem"
  logo: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.brand-600}"
    textColor: "{colors.paper-50}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.625rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-700}"
    textColor: "{colors.paper-50}"
  button-ghost-paper:
    textColor: "{colors.brand-900}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.625rem"
    height: "3.25rem"
  button-ghost-paper-hover:
    backgroundColor: "{colors.brand-900}"
    textColor: "{colors.paper-50}"
  button-ghost-navy:
    textColor: "{colors.paper-50}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.625rem"
    height: "3.25rem"
  button-ghost-navy-hover:
    backgroundColor: "{colors.paper-50}"
    textColor: "{colors.brand-900}"
  division-row:
    textColor: "{colors.ink-900}"
    rounded: "{rounded.none}"
    padding: "3.5rem 0"
  site-header:
    backgroundColor: "{colors.void}"
    textColor: "{colors.paper-50}"
    height: "4.5rem"
  register-row:
    textColor: "{colors.ink-900}"
    padding: "2rem 0"
  footer:
    backgroundColor: "{colors.void}"
    textColor: "{colors.mist-100}"
---

# Design System: Veltrex

## Overview

**Creative North Star: "The Drawn Curtain Wall"**

The site stands as a building facade drawn in hairlines. Deep navy bands carry an inline SVG curtain wall of mullions, floor lines and glass panes, all running at the one angle the company owns: the knockout seam of its logo, measured at 3:5, or 59.036 degrees from horizontal. Warm paper bands carry the reading. The two alternate down every page the way glass alternates with slab, and the footer closes on the deepest void ground.

Density is low and deliberate. Headlines are set large in a serif, in one colour, columns are split by vertical hairline rules rather than boxed, and the registered identity of the company is laid out as a ruled register, the way it reads on the company's own documents. Nothing is photographed; the building is computed at build time from the mark's geometry, so the imagery belongs to Veltrex rather than to a stock library. Every corner is square because the mark is all straight edges and one hard fold.

Motion is the building's own material moving. Above the fold the hero assembles in pure CSS; below the fold nothing fades and nothing starts hidden, only rules and facades draw. Reduced motion, print and no script all render the page complete.

**Key Characteristics:**
- Alternating navy facade bands and warm paper reading bands, void footer.
- One angle everywhere: mullions, button sweeps, row fills, menu ruling and tower motion run along the 59.036 degree seam.
- Serif display in one colour per headline over a quiet humanist sans.
- Hairline rules instead of containers; square corners; flat surfaces.
- Brand blue is scarce: the mark, one solid action per view, live accents.
- Registered identity rendered as a ruled register, with unknown identifiers structurally absent.

## Colors

A single blue hue ramp anchored on the two exact brand colours, set against warm paper, navy tinted ink and a cool mist for text on dark grounds.

### Primary
- **Veltrex Navy** (brand-900): the exact brand navy, pinned and never approximated. Ground of every facade band and hero, the ghost button line and text on paper, the strong rule on paper, and the theme colour.
- **Veltrex Blue** (brand-600): the exact brand blue, pinned and never approximated. The blade of the mark, the single solid primary action in a view, text selection and live accents. Paper text on it passes; as text on navy it fails outright (2.91:1), so it is never text on a dark ground.
- **Deep Link Blue** (brand-700): links and body size blue on paper, the hover fill of the solid button, the focus ring on paper, and the lit core of the facade sky band.
- **Lit Sky Blue** (brand-300): links, the current menu row and the focus ring on navy and void grounds (8.08:1 on navy).

### Secondary
- **Division Lit Steps** (brand-500, brand-400, brand-300, brand-200): each division tints the lit panes of its building with a different step on the one ramp. Trading takes 500, Technology 300, Investment 200, and the default is 400. A division never gets a new hue.
- **Facade Glass** (brand-950, brand-100): the sky gradient runs from void to brand-950; the lit tower edge fades from brand-100 at the top toward nothing at the street.

### Neutral
- **Void** (void): the deepest ground. Footer, header, small screen menu, facade sky, and the html background under everything.
- **Warm Paper** (paper-100): the default reading surface.
- **Lifted Paper** (paper-50): text on navy and void grounds, text on the solid button, the ghost fill on navy and the focus halo on paper. This is the lightest value in the system; there is no pure white.
- **Paper Stone** (paper-400): hairline rules on paper, decorative only.
- **Deep Paper** (paper-200, paper-300): the centred statement band on the home page and a reserved deeper paper surface.
- **Night Ink** (ink-900): headings and strong text on paper.
- **Body Ink** (ink-700): body copy on paper.
- **Muted Ink** (ink-500): muted text on paper. The lowest ink step allowed for text on paper.
- **Mist** (mist-100): body copy on navy and void.
- **Soft Mist** (mist-300): muted text on navy and void, and the base of every translucent rule on dark grounds (rules at 0.2 and 0.5 alpha, nav separators at 0.28).
- **Tagline Grey** (brand-grey): the logo tagline and nothing else. It fails AA for body text on paper.

### Named Rules
**The Scarce Blue Rule.** Brand blue appears only in the mark, the one solid primary action per view and live accents. Links on paper are brand-700; links on navy are brand-300. Ramp 400 is the lowest step ever allowed as text on navy.

**The One World Rule.** There is no dark theme. Under a dark colour scheme paper bands stay paper, because the alternation is the design; the navy bands already give dark scheme visitors their dark ground. Navy and void grounds re-point every text, rule, ghost and focus role through the ground attribute, so a component never needs to know which band it sits in, and colour scheme is declared per ground.

**The Tinted Extremes Rule.** No pure black and no pure white as a design value, including shadows, borders, overlays, scrims and gradient stops. The extremes are void and paper-50; translucent overlays are built from void, mist or brand-100 channels.

**The Ground Contrast Rule.** Every text pairing and focus ring is computed against the ground it sits on before it ships. The focus ring is brand-700 with a paper-50 halo on paper, and brand-300 with a navy or void halo on dark grounds.

## Typography

**Display Font:** Noto Serif Display, light and regular, with italic (with Iowan Old Style, Palatino Linotype, Georgia)
**Body Font:** Albert Sans (with ui-sans-serif, system-ui, Segoe UI)

**Character:** A high contrast display serif set large, light for band headings and regular for the hero, carrying its emphasis in italic rather than in weight, over a calm geometric humanist sans that stays out of the way. Both load the latin-ext subset, which Turkish requires.

### Hierarchy
- **Display XL** (400, clamp 3.125rem to 6rem, 1): page hero headlines only, in one colour. A step heavier than the other display sizes, because at 300 it read thin over the facade.
- **Display L** (300, clamp 2.375rem to 4.75rem, 1.03): band headings, set wholly italic; division names in rows; the centred statement band.
- **Display M** (300, clamp 2rem to 3.25rem, 1.08): secondary band headings, italic.
- **Display S** (400, clamp 1.625rem to 2.125rem, 1.15): division column names.
- **Lead** (400, clamp 1.125rem to 1.3125rem, 1.6): the paragraph beside or under a display heading, held to 36 to 46ch.
- **Body** (400, 1.0625rem, 1.65): all running text; legal prose at 1.75 line height and 68ch.
- **Label** (500, 0.8125rem, 0.02em tracking, natural case): register term labels and footer column headings, in muted text.
- **Phones at display scale**: phone numbers set in the display face at light weight with tabular figures, as the contact band and register headline.
- **Menu** (300, clamp 2.25rem to 3rem, 1.05): the small screen menu's page rows; the current page turns italic in brand-300.
- **Menu Sub** (400, 1.375rem, 1.2): division names hanging under their parent row, each with its tagline in 0.8125rem muted text set to the end of the line.
- **Menu Phone** (300, 1.75rem, 1.35): the phone numbers at the foot of the small screen menu.
- **Legal Heading** (400, clamp 1.5rem to 2rem, 1.2): section headings inside legal prose.

### Named Rules
**The One Colour Headline Rule.** A headline is one colour. Never set one phrase in the text colour and the next in an accent colour: that split is the most recognisable template tell there is. Emphasis in display type, where there is any, is italic, never bold.

**The Locale Case Rule.** Uppercase is applied to strings at render time with the locale aware helper built on toLocaleUpperCase. Never CSS text transform on Turkish text, and never an all caps value in a message catalogue.

**The Tabular Figures Rule.** Phone numbers and registry identifiers use tabular numerals.

## Layout

A single centred column capped at 86rem with a fluid gutter (clamp 1.25rem to 4rem) serves every band, so all content aligns to one edge down the page. Within it a 12 column grid with a 2rem column gap takes over at the lg breakpoint (64rem); below that, content stacks. Common splits are 4 over 8 (heading and lead beside a register), 7 over 5 (hero headline beside intro), three equal columns along the foot of the home hero, and 5 over 6 inside a division row.

Bands are full bleed with block padding of clamp 5rem to 9.5rem; the centred statement band runs taller. The header is fixed at 4.5rem and every hero clears it with top padding. Heroes come in three heights: full (the larger of 100svh and 44rem, home), tall (78svh or 38rem, section landings) and compact (26rem, reading pages). Hero content sits at the foot of the band, not the centre.

The header lockup is 2.5rem tall below 40rem and 3rem above, the height at which the mono fold gap still resolves. Nav labels align to the centre line of the wordmark, not of the lockup. Layouts are never tuned to English string length; Turkish runs longer.

**The Anchored Seam Rule.** On the home hero the facade is sized by height and slid sideways so the near tower's lit edge passes exactly through the fold of the header logo at every viewport width. The drawing is 3600 units wide with 800 units to the left of that edge, and the stylesheet offset reads the same logo height, header height and gutter. Change any of them together.

## Elevation & Depth

The system is flat. No surface is lifted with a shadow; depth lives inside the drawn facade, where a gradient sky, a lit seam band, two tower planes at different parallax rates, and legibility scrims built from void make the space. Hierarchy between surfaces is carried by ground (void, navy, paper) and by hairline rules. The fixed header is translucent void over the hero and turns solid as the page scrolls, on a scroll timeline.

**The Hairline Not Box Rule.** Structure is drawn with 1px rules: vertical rules between columns, horizontal rules between rows, a strong top rule over lists. No cards, no panels, no drop shadows.

## Shapes

Square corners everywhere: buttons, rows, bands, menu, focus ring. The one recurring silhouette is the seam: a parallelogram cut at 59.036 degrees that appears as the leading edge of every hover fill, as the ruling of the small screen menu, and as the direction every tower moves. The only icon is a single hairline arrow drawn as inline SVG at 1.3 stroke to match the facade; it rotates 45 degrees to mark an external link. The menu toggle is two hairlines of unequal length at rest, the shorter aligned right like a receding floor, that meet and cross at 45 degrees to close.

## Components

### Buttons
Two variants only, both square and both filled on hover by a sweep whose leading edge is skewed to the seam.
- **Shape:** square (0px), minimum height 3.25rem, 1px border.
- **Primary (solid):** brand blue ground with paper-50 text. Reserved for the single primary action in a view. Hover and focus sweep brand-700 in from the left over 620ms on the expo ease.
- **Ghost:** a hairline outline that takes its colours from the ground. On paper, navy line and text, sweeping to a navy fill with paper text. On navy, a translucent paper line with paper text, sweeping to a paper fill with navy text.
- **Arrow:** the hairline arrow follows the label and slides 0.3rem forward on hover.

### Links
- **Drawn underline:** the underline is a 1px line drawn from the left on hover, focus and current page, over 520ms. The resting variant keeps a strong rule underline that turns to the text colour on hover.
- **Arrow link:** medium weight in the link colour of the ground, with the hairline arrow nudging forward on hover.

### Division Rows
Full width rows under a strong top rule, each with a strong bottom hairline, a Display L name and the short intro beside it. Static: a row already says everything its detail page does, so it links nowhere and has no hover state. The detail pages are reached from the header and footer.

### Division Columns
The three divisions along the foot of the home hero, under a drawn hairline, as columns divided by vertical rules the way mullions divide a facade: a Display S name and the short intro. Static, for the same reason as the rows. This is the only place the divisions appear as a block outside the divisions page; the corporate and division pages do not repeat them.

### Scrollbar
Fully styled in Chromium and Safari: a 0.75rem void gutter with a faint hairline on its inner edge, and a square brand-600 thumb inset 3px from the gutter so it reads as a pane set in a frame. Hover lifts it to brand-400, dragging to brand-300. No arrow buttons. Brand blue on void is 3.7:1. Firefox has no scrollbar pseudo-elements and gets the same two colours through scrollbar-color at the thin width. The page and the small screen menu both scroll on void, so one set of values serves both.

### Company Register
A definition list set as a ruled register: label column of 3, value column of 9, strong top rule and a hairline under each row. Phones at display scale, the address, the legal name, and the tax id only when it is held. Unknown registry identifiers are omitted from the data, never rendered as a placeholder.

### Navigation
- **Header:** fixed, void ground, mono logo left at 2.25rem tall (2rem on small screens), nav right and centred on the header midline, with hairline separators between items and the language switcher last in the link colour. Transparent over the hero, solid once the page moves.
- **Small screens:** the menu is a piece of the building. A full screen void panel opens behind the header row (the logo and toggle stay above it) over a facade drawn in CSS gradients, so it costs no page weight: a near tower of broad bays and slabs lower left, a far tower of fine mullions upper right, both at the seam angle, split by a lit band, with soft edges and a scrim so no line competes with the type. Rows: Home, Divisions, About, Contact in Menu type with a hairline arrow and a drawn rule beneath each; the three divisions hang off Divisions on a vertical hairline with their taglines. The foot holds the Phone label, both numbers in Menu Phone, then a hairline, the district and city in small tracked capitals and the language switcher as a ghost button. While open, the page behind is inert and does not scroll, Escape closes and returns focus to the toggle, and widening past the desktop breakpoint closes it.

### Facade
A decorative, hidden from assistive technology, three layer SVG: a sky layer with the lit seam band, and a near and a far tower plane of glass panes, spandrels, floor lines, mullions and a lit edge, all computed at build time. Variants: anchored (home hero), runners (home hero only, see Motion), quiet (half strength lines for bands where copy leads), and scrims placed left, centre or bottom for legibility. Each division draws its own building in the same grammar.

### Motion
- **Hero entrance (CSS only, first paint):** towers slide in along the seam from opposite sides (2.1s), mullions and edges draw (2.6s), floors draw (2.8s), panes light (1.8s); the headline rises from a clip, the column rule draws down, and the intro and actions rise. On the home page the foot rule draws across and the division columns rise.
- **Runners (home hero only):** once the assembly settles (2.6s), lanes of panes on the far tower light one after another, along a floor or down one bay, like current through the traces of a chip. Each pane holds for one 66ms step and leaves a two step tail, with hard cuts rather than fades, so a lit pane jumps rather than glides. Fourteen lanes share a 6s cycle, alternate direction, and stay clear of the header and the hero's foot copy. They run in their own small SVG layer, pause while the hero is off screen, and are not drawn at all under reduced motion.
- **Scroll:** the tower planes drift along the seam on a view timeline, the near plane further than the far.
- **Below the fold:** exactly one device per band, and none of them hides content. Column rules draw down (1600ms), row hairlines draw across (1400ms), each staggered 140ms; or a band facade holds its assembly until in view.
- **Small screen menu:** opens with a wipe whose leading edge is cut square to the seam (900ms, expo out) while the two towers slide into place along the seam (1400ms); rows rise on a 70ms stagger and each rule draws across. Closing reverses the wipe (560ms) with rows fading fast, and the panel only becomes hidden after the wipe completes.
- **Fallbacks:** reduced motion, print and no script render every rule and building complete; the reveal is armed by a script mark that removes itself if the observer never mounts.

## Do's and Don'ts

### Do:
- **Do** alternate navy facade bands with paper reading bands, and close every page on the void footer.
- **Do** run every angled device at the seam (59.036 degrees, skew 30.964 degrees).
- **Do** set the ground attribute on every navy or void band so text, rule, ghost and focus roles re-point.
- **Do** keep brand blue to the mark, one solid primary action per view and live accents; use brand-700 for links on paper and brand-300 on navy.
- **Do** divide content with 1px vertical and horizontal rules and keep every corner square.
- **Do** uppercase with the locale aware helper, and keep catalogue strings in natural case.
- **Do** let reduced motion, print and no script show everything complete.
- **Do** render unknown registry identifiers as structurally absent.

### Don't:
- **Don't** use pure black or pure white anywhere, including scrims, rules, shadows and gradient stops.
- **Don't** approximate the brand navy or brand blue, and don't set brand blue as text on a navy or void ground.
- **Don't** give paper bands a dark variant under a dark colour scheme.
- **Don't** fade or hide content below the fold; only rules and facades draw, one device per band.
- **Don't** use cards, rounded corners, drop shadows, section numbers or eyebrow labels above headings.
- **Don't** use photography or stock architecture; the facade is drawn from the mark.
- **Don't** use CSS text transform on Turkish text.
- **Don't** use the brand grey for anything but the logo tagline.
