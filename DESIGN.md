---
name: Cubby UI
description: Styled primitives, your code. A component library site built on a tinted OKLCH surface ladder, one blue accent, and Bricolage headings.
colors:
  primary: "oklch(0.6 0.2 250)"
  primary-foreground: "oklch(1 0 0)"
  ring: "oklch(0.55 0.2 250)"
  foreground: "oklch(0.18 0.004 270)"
  muted-foreground: "oklch(0.5 0.004 270)"
  surface-1: "oklch(0.97 0 0)"
  surface-2: "oklch(0.985 0 0)"
  surface-3: "oklch(1 0 0)"
  secondary: "oklch(0.92 0 0)"
  secondary-foreground: "oklch(0.32 0.004 270)"
  neutral: "oklch(0.21 0.004 270)"
  neutral-foreground: "oklch(0.98 0.002 270)"
  border: "color-mix(in oklab, oklch(0.18 0.004 270) 10%, transparent)"
  destructive: "oklch(0.53 0.19 25)"
  danger-foreground: "oklch(0.55 0.18 25)"
  warning-foreground: "oklch(0.58 0.14 85)"
  info-foreground: "oklch(0.45 0.2 250)"
  success-foreground: "oklch(0.48 0.18 145)"
  dark-surface-1: "oklch(0.205 0.004 270)"
  dark-surface-3: "oklch(0.264 0.004 270)"
  dark-foreground: "oklch(0.94 0.004 270)"
  dark-muted-foreground: "oklch(0.73 0.004 270)"
  dark-chrome: "oklch(0.159 0.004 270)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
    fontVariation: "'opsz' auto"
  headline:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  2xl: "16px"
  stage: "18px"
  full: "999px"
spacing:
  flow: "1.25rem"
  block: "2rem"
  headline-above: "4rem"
  title-above: "3rem"
  heading-below: "0.875rem"
  header-height: "3.5rem"
  content: "48rem"
  chrome-max: "76rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-ghost:
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  button-neutral:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.neutral-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "36px"
  shelf-link:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "32px"
  shelf-link-current:
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "32px"
  preview-stage:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.stage}"
    padding: "52px 24px 40px"
  docs-note:
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "14px 18px"
---

# Design System: Cubby UI

## Overview

**Creative North Star: "The Cubby Shelf"**

A well-made wooden shelf of labeled cubbies: everything has a place, the place is marked with a hairline and a name, and nothing is shouting. The system is quiet on purpose. Tinted near-neutrals carry the page, one blue carries meaning, and the display type carries the voice. Depth comes from a measured surface ladder rather than from decoration, and structure is ruled with hairlines rather than boxed with cards.

Density is calm and reading-first. Pages sit in one centered column with generous vertical rhythm; controls stay small, muted until touched, and brighten to full foreground on hover. Motion is a single settle curve (ease-out-expo) that opens slowly and closes quickly, and every motion collapses to a plain opacity change under reduced motion.

Light and dark are both designed. Light keeps fills neutral and lets layered shadow carry elevation; dark steps lightness up a tinted ladder and adds a lit top rim. The home page adds one ornament, the cubby mark printed as a feathered dot-matrix field behind the hero; the docs surface carries the same mark as a four-cell glyph in its shelf trigger.

**Key Characteristics:**
- Neutrals tinted toward hue 270 at very low chroma (0.004, 0.002 near the extremes), tuned from three root variables.
- One chromatic accent, the primary blue; status hues appear only on status plates.
- Bricolage Grotesque (optical-size axis) for h1 to h3 and the wordmark; Geist for body and UI; Geist Mono for code.
- An 8-rung surface ladder with matching shadow and rim recipes; state overlays are translucent deltas.
- Hairline structure at 10% foreground; lighter 7% lines inside rows.
- A near-black chrome surface, off the ladder, in both themes.

## Colors

A cool, faintly violet-tinted neutral stack with a single saturated blue, expressed entirely in OKLCH and color-mix so the whole palette retunes from a few roots.

### Primary
- **Cubby Blue** (`{colors.primary}`): primary buttons, focus ring (via `{colors.ring}` at 50 to 55% opacity), text selection (24% mix), caret, link-underline hover, the current-page mark in the shelf, and the first cell of the cubby glyph. In dark mode the soft variant label brightens it by mixing 30% white.

### Neutral
- **Ink** (`{colors.foreground}` / dark `{colors.dark-foreground}`): headings, active labels, current-page marks. Docs prose runs at 88% ink mixed into the page background, so body text sits one step below headings.
- **Quiet Ink** (`{colors.muted-foreground}` / dark `{colors.dark-muted-foreground}`): descriptions, meta lines, idle controls, table headers, minimap labels.
- **Page** (`{colors.surface-1}` / dark `{colors.dark-surface-1}`): the page background and every docs surface that should read as the page itself (header when scrolled, shelf panel, stage).
- **Raised Paper** (`{colors.surface-2}`, `{colors.surface-3}` / dark `{colors.dark-surface-3}`): cards, popovers, default inputs, outline buttons. Light rungs 3 to 8 share one white and differ only in shadow; dark rungs climb in lightness from 0.205 to 0.402.
- **Plate Gray** (`{colors.secondary}`, text `{colors.secondary-foreground}`): secondary and primary-soft button plates.
- **Hairline** (`{colors.border}`): the default 1px rule, re-derived in dark from dark ink.
- **Chrome Black** (`{colors.neutral}` light, `{colors.dark-chrome}` dark): persistent instrument chrome and the solid neutral button in light. Its foreground is `{colors.neutral-foreground}`; its muted text, hover, and border are 71%, 10%, and 12% mixes of that foreground.

### Status
- **Destructive** (`{colors.destructive}`): destructive button fills only.
- **Danger / Warning / Info / Success** (`{colors.danger-foreground}`, `{colors.warning-foreground}`, `{colors.info-foreground}`, `{colors.success-foreground}`): text on their own pale plates (lightness 0.97 to 0.98, chroma 0.04 to 0.06) with a 0.9 to 0.92 border; dark inverts to 0.26 to 0.28 plates with 0.72 to 0.78 text. The docs "required" prop flag uses danger text with no plate.

### Named Rules
**The One Blue Rule.** Blue is the only chromatic accent outside status plates, and it means action, focus, or relation. The current location is marked in ink, never in blue; blue is reserved for what a thing is built on or what you can press.

**The Mix-Not-Pick Rule.** New tints are derived, not picked: color-mix of ink or blue into transparent at the established steps (2.5%, 3.5%, 4%, 7%, 9%, 10%, 16%, 24%, 35%, 40%). A new hard-coded gray is a defect.

**The Chrome Is Below Rule.** The chrome surface is near-black in both themes and sits off the ladder: in dark it goes below the page (0.159 against 0.205), because up is where cards live. Paint on it only through `data-surface="chrome"`, which re-points ink, muted, border, input, and hover tokens for the whole subtree.

## Typography

**Display Font:** Bricolage Grotesque, variable, with the `opsz` axis (with ui-sans-serif, system-ui)
**Body Font:** Geist (with ui-sans-serif, system-ui)
**Label/Mono Font:** Geist Mono for code, prop names, and types

**Character:** Bricolage brings the warmth and a slightly wonky, printed confidence at large sizes, and optical sizing tightens it automatically as it grows. Geist keeps the reading and the controls neutral and precise underneath.

### Hierarchy
- **Display** (600, `{typography.display}`: 2.75rem desktop, 2.25rem mobile, line-height 1.05, -0.03em, balanced): page titles. The home hero uses the same cut at 2.5rem, 3rem, and 3.75rem across breakpoints, capped at 18ch.
- **Headline** (600, 1.625rem, 1.2, -0.02em): docs h2 and section anchors.
- **Title** (600, 1.1875rem, 1.3, -0.01em): docs h3. The footer's next/previous names use Bricolage at 1.25rem.
- **Lead** (400, 1.125rem, 1.625, Quiet Ink): the description under a title, capped at 52ch on docs and 58ch on home.
- **Body** (400, 1rem, 1.75): docs prose, column-capped at 48rem, `text-wrap: pretty`. h4 to h6 stay in Geist at 1rem, 600.
- **Label** (500, 0.8125rem to 0.875rem): shelf links (0.875rem), minimap labels and table headers (0.8125rem), group labels and tool buttons (0.75rem, 500). Numbers are tabular.
- **Mono** (Geist Mono, 0.8125rem; inline code at 0.84em on a 7% ink plate with a 0.35rem radius).

### Named Rules
**The Bricolage Rule.** The display face sets h1 to h3 and the wordmark, nothing smaller than about 1.05rem, and always in weight 600 with negative tracking. Body, labels, h4 and below are Geist.

**The Two-Step Ink Rule.** Headings and strong text are full ink; running prose is 88% ink. The step is small and deliberate: it lets headings lead without enlarging them.

## Layout

The docs page is a card set in a frame. The frame (`--docs-frame`: oklch 0.925 in light, the chrome near-black in dark) holds the header; the card keeps the page color (`--background`), so components sit on the background they were designed for. The card is inset 8px (12px from sm up) on the sides and bottom, starts under the 56px header, and has a 16px (20px) radius with a 1px hairline edge. The document still scrolls natively: two fixed layers draw the card fill behind the content and the frame in front of it (a rounded rectangle with a 100vmax spread shadow in the frame color), so content reads as scrolling inside the card while scroll restoration, anchors, and the mobile URL bar keep working. No layer is sized from both its top and bottom edge: Chrome on Android resolves those against a different viewport height while the URL bar slides, so the fill and the frame's top and sides are pinned to the top at `100lvh` (they never resize) and the bottom edge is its own bottom-pinned strip, which moves with the URL bar. The shelf opens inside the card's rounded rectangle. One centered column. Everything, previews included, sits in one `{spacing.content}` (48rem) column; nothing breaks out wider, so every block shares both edges. Header and shelf content share a `{spacing.chrome-max}` (76rem) container with 1.25rem to 2rem side padding. The sticky header is `{spacing.header-height}` (56px) and scroll padding is 5rem.

Vertical rhythm is set by the container, not the blocks: siblings flow at `{spacing.flow}`; any component block (preview, table, note) takes `{spacing.block}` above and below; h2 takes `{spacing.headline-above}` above, h3 `{spacing.title-above}`, h4 to h6 2.25rem; the gap after h2 and h3 is `{spacing.heading-below}`, after h4 0.5rem. The page footer sits 6rem below content. Lists indent 1.25rem with 0.375rem between items.

The table of contents is a fixed tick minimap in the right margin at the xl breakpoint (hovering it opens the headings in a PreviewCard to its left); below that it lives in the header's section crumb. The shelf is a contents page: from lg up, a 10rem guides column, Primitives flowing down three text columns and Composables down two; below lg the groups stack, each flowing in two or three columns. Heading anchor glyphs hide below 40rem.

The home page is a 64rem (max-w-5xl) viewport-height composition: centered hero stack with 1.5rem internal gaps, 3 to 3.5rem to the category tiles, a slim footer pinned to the bottom.

## Elevation & Depth

A hybrid: light mode keeps fills neutral and communicates elevation with layered shadow; dark mode steps lightness up the tinted ladder, adds an inset top-edge highlight and ring, and uses darker, tighter shadow alphas so wide layers stay visible. Every rung is one shadow token plus one rim token, combined as `--surface-shadow-combined-N`. State overlays (`--surface-hover` 6%, `--surface-active` 8%, `--surface-selected` 10%, black in light, white in dark) raise whatever they sit on by a fixed perceptual delta.

### Shadow Vocabulary
- **Hairline ring** (`box-shadow: 0 0 0 1px oklch(0 0 0 / 0.06)`, rung 1): flush containers that need an edge without lift; also the light chrome edge.
- **Resting card** (rung 3: `0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 1px -0.5px oklch(0 0 0 / 0.06), 0 3px 3px -1.5px oklch(0 0 0 / 0.05)`): cards and inputs at rest.
- **Floating** (rungs 5 to 8, adding 12px, 24px, 48px, and 96px layers at 0.04 to 0.03 alpha): popovers, dialogs, menus.
- **Docs float** (`0 0 0 1px var(--border), 0 16px 40px -12px oklch(0 0 0 / 0.14)`, dark 0.5): menus and the minimap's PreviewCard use the component's own surface. The shelf panel uses `0 1px 0 var(--border), 0 24px 48px -16px oklch(0 0 0 / 0.16)` (dark 0.5), dropping from the header edge.
- **Dark chrome edge** (`0 0 0 1px oklch(0 0 0 / 0.7), inset 0 1px 0 0 oklch(1 0 0 / 0.065)`): defines the chrome fill against a dark page.
- **Stage outline** (`0 0 0 1px var(--border)`): previews are drawn, not lifted.

### Named Rules
**The Ladder Rule.** Elevation is chosen from the ladder, never hand-written. A floating chrome surface is built from the near, mid, and far shadow alphas with no ladder ring, because rungs 3 to 8 carry their own ring.

**The Drawn-Not-Lifted Rule.** Reading surfaces on docs (stage, note, tables, API rows, shelf index) sit flat on the page, defined by hairlines or a faint ink wash. Shadow appears only on things that float over content: the open shelf, the minimap card, menus.

## Shapes

Softly rounded, from a single root radius of 12px (`{rounded.lg}`) with 2px steps either side: 6, 8, 10, 12, 14, 16px. Buttons use 12px; shelf links 8px; compact buttons and menu rows 8 to 10px; notes 14px; the preview stage 18px, the largest radius, because it is the page's main object. Pills (999px) are reserved for the shelf trigger and step numbers. Small marks are nearly square: the current-page mark is a 6px square at 2px radius, minimap ticks are 2px bars.

Structure is typographic: groups are set apart by space and a small label, not by boxes or rules. Disclosure is clipped, not scaled: the shelf opens with `clip-path: inset()` and revealed code simply appears in place with a 180ms fade; nothing animates layout height.

## Components

### Buttons
Tactile and small. Paint lives on a `::before` layer so press can scale it without moving the label.
- **Shape:** gently rounded (`{rounded.lg}`); xs and icon_xs sizes drop to 10px.
- **Sizes:** default 36px tall desktop, 40px below sm (touch step); sm 32px, lg 40px, xs 28px; 14px inline padding.
- **Primary:** `{colors.primary}` fill, white label. Hover mixes 5% black (light) or 10% white (dark); pressed goes one step further (8% / 14%).
- **Outline:** card fill with a hairline border; **Ghost:** Quiet Ink label brightening to ink on a surface-hover wash; **Neutral:** the chrome-black fill that lightens on hover; **Primary-soft / Destructive-soft:** accent-colored label on the Plate Gray plate.
- **Hover / Focus:** 100ms ease-out on color and fill; press scales the paint to 0.98; focus draws a 2px ring at 50% ring color, offset 2px.

### Inputs / Fields
- **Style:** opaque surface-3 fill tracking the ladder; inside cards and dialogs, a translucent elevated fill (black 8% light, white 9% dark).
- **Focus:** the shared 2px half-strength ring; the caret is blue on docs.

### Navigation
- **Docs header:** 56px, fixed, sitting on the frame above the card; it never changes as the page scrolls. The logo enters as one composited fade and settle (opacity and scale, 600ms), not the home page's drawn stroke, which freezes while the page hydrates.
- **Shelf trigger:** a pill reading "Group / Page" with the four-cell cubby glyph (first cell blue, others at 32% ink) and a chevron that turns 180 degrees. Open state uses surface-selected; the glyph cells spread 0.75px apart.
- **Section crumb:** a slash and the active section title, which morphs letter by letter when the section changes; it opens a menu of the page's headings.
- **Home top nav:** the shared search trigger, theme toggle, and GitHub link, reused by the docs header.

### The Cubby Shelf (signature)
Every docs page, laid out like a contents page, dropping from the header. No boxes, no filter, no connecting lines: it is an index, read at a glance.
- **Link:** 32px tall, 8px inline padding, 0.875rem Quiet Ink label. Hover: ink label on a surface-hover wash (8px radius). Focus: a 2px ring inset.
- **Current page:** 500-weight ink label with a 6px blue mark that grows in and pushes the name over (300ms ease-out-expo).
- **Keyboard:** opens with focus on the current page; up and down arrows walk the links in reading order; Escape closes and returns focus to the trigger.
- **Motion:** the panel clip-reveals in 550ms ease-out-expo and closes in 260ms ease-in-cubic; the groups arrive as beats (guides, Primitives, Composables) rising 0.25rem, 80ms + 50ms apart. A scrim at 10% ink (45% black in dark) covers the page, which becomes inert.

### Preview Stage
- **Container:** page fill, 18px radius, 1px hairline ring, 16rem minimum height (12rem on mobile for the first stage), content centered with 52px top, 24px sides, 40px bottom padding.
- **Tools:** a single Code toggle sits top-right as a 28px ghost button at 0.75rem. The code block appears directly below the stage with a 180ms fade and a 4px drop; closing is instant.

### Install
One code block with package-manager tabs; the choice is shared across the site and remembered. Manual steps appear the same way (instant, short fade) under a small chevron disclosure; steps are numbered 24px pills at 7% ink joined by a hairline.

### API Props
Quiet hairline rows on a subgrid: mono name in ink (0.8125rem, 500), type and default in Quiet Ink mono, a chevron that turns 90 degrees. Rows are separated by a 70% hairline; hover washes the row at 2.5% ink. The panel height-animates 300ms ease-out-expo and shows description, full type, and default.

### Minimap (on this page)
A column of 2px ticks in the right margin at xl: 24px for h2, 16px and 8px (indented) for deeper levels, at 16% ink; visible sections go to 40%, the active one to full ink. Hovering opens the headings in a PreviewCard to its left, vertically centered on the ticks and fixed-positioned so it never drifts on scroll; the ticks fade out while it is open. Clicking a heading scrolls smoothly (instant under reduced motion) and updates the URL. The active section is computed from scroll position once per frame (`HeadingsProvider` in `components/docs/use-headings.tsx`): the last heading above a reading line 25% down the viewport, or the last heading on screen at the very bottom. That keeps the minimap, header crumb and mobile pill in step even on fast scrolls, which an IntersectionObserver can skip.

### Text Morph
Any label that swaps in place animates with `TextMorph` (`registry/default/text-morph/`, installable), through `MorphText`. The server renders the label already split into one span per glyph, the same markup the browser keeps, so nothing changes on hydration and nothing is measured at load. On each change it snapshots every glyph's on-screen box (mid-animation included), reuses shared glyphs, moves removed ones to a ghost layer, and animates each from its snapshot, so a change that lands mid-animation picks up where things are. The box width is a CSS transition (always retargets), and the stage rides against the box's moving edge on the same curve, so glyphs never drift in a centred pill or right-pinned button.

Two modes, one option, each bringing its own defaults (`MODE_DEFAULTS` in `text-morph/lib/options.ts`, taken from each library's source). `roll` is Scritto's: it keeps the shared start and end and rolls the glyphs between, travelling 0.35em while scaling to 0.6, tilting 2deg and blurring 0.1em, on Scritto's 550ms hand-tuned spring (transform and opacity alike), with delays fanned across 165ms and the width on a non-overshooting 550ms curve. `morph` (default) is torph's: it matches letters anywhere, sliding shared ones and scaling the rest to 0.95 on a 400ms ease-out expo, with linear opacity (leaving over the first 100ms, arriving over 200ms from 100ms in), no blur and no stagger. In both modes numbers are matched by place value (`text-morph/lib/match.ts`, torph's approach): digits line up on the decimal point, so only the ones that changed roll, and in morph mode they roll a full line (torph's digit fades: out over 180ms, in over 100ms). Roll mode also keeps one shared run in the middle (Scritto's floating run: `xxlightxx` → `yylightyy` keeps `light`), at least two glyphs long and travelling no further than its length plus two slots. The `spread` stagger is Scritto's sweep: delay by position across the changed stretch only, so a glyph leaving and its replacement in the same spot cross over together. When the box shrinks, old glyphs hold the place they were drawn while the edge moves in, so they can sit over the next word or outside a pill. The edge fade (`edgeFade`, Scritto's) dissolves that ink: a 0.3em ramp on the ghost layer only, never the live value, on each edge that is actually moving, following the box edge on the width curve and ending 0.4em past it. `auto` arms it only where the ink would land on something (a neighbour on the line, or the edge of the pill, card or clip holding the value) and lifts it when the last ghost leaves. The vertical fade lives on the glyph and ghost layers rather than the box, since a mask cuts everything outside its element. Glyphs roll the way the value moved (`trend`, Scritto's): a number that grew brings new glyphs up from below, one that shrank brings them down; anything else rolls up. `value` also takes a number, formatted with a fixed `locale` (default `en`) and optional `decimals`, so the server and browser render the same text. Click feedback (`feedback`: Copied, Hide code) runs the same look on a shorter clock, so its movement takes 209ms. `/tune/text-morph` switches modes and tunes from each mode's defaults. At rest the label flows inline like the text around it, grouped into no-wrap words with real spaces between them, so a long value wraps between words wherever its context lets text wrap (the header crumb and buttons stay on one line). A change that stays on one line eases the space the label takes through its start margin (`margin-inline-start`, back to the author's own), so text after it slides. A start margin, not an end one: line breaking counts it before the glyphs, so a growing value never runs past the space it had and breaks away from the text before it (an end margin let `$1200` → `$12009999` drop the number to a new line below the `$`). While it eases, the label also stays on one line (`text-wrap-mode: nowrap`, which leaves spaces alone); the label never changes display, since switching between inline and inline-block repaints its text snapped differently (the old inline-block box's settle step measured 550–1,650 changed pixel channels on the docs examples; this measures 0). When a centred or pinned container moves the label's start, the stage rides against it with `left`, which inline boxes honour; both run on the main thread from one clock, so a busy main thread can't leave the compositor sliding the text away from its space; a change that wraps keeps its lines as they fall and glyphs travel across them. Every label that changes in the same update runs through the change together, in phases (read, write, read, write), from a microtask before the paint. Each glyph sits in a layout-neutral slot built with the words (a glyph sliding along its line keeps its fade and gets room for the slide, `--reach`; only one moving to another line drops it, so a digit caught mid-roll by fast typing fades back in rather than appearing in full off its line), all structural DOM changes (words, slots, ghosts moving into their layer) happen in one phase, and finished ghosts are removed together, so a batch forces one restyle. On this site that matters: its compiled `:has()` rules (Tailwind `group-has-*` and `has-*:**` variants from the registry) make Chrome restyle nearly the whole document after any element insertion, about 9ms each, and unbatched a tab click forced about 8. Glyphs keep `will-change: transform, opacity` at rest (as torph does): a glyph that drops out of its compositing layer when its animation ends is repainted snapped to the pixel grid with different anti-aliasing, a visible twitch as it settles. The top and bottom fade is per glyph, not on the letters layer (a mask cuts off everything outside its element, including glyphs travelling in from outside the new text): arriving glyphs and glyphs rolling in place sit in a layout-neutral slot that fades them at their line; glyphs that travel go unmasked. The letters layer carries `dir="auto"`: each glyph is its own box, which bidi treats as direction-neutral, so without it a Latin value in a right-to-left paragraph was laid out backwards. Ghost coordinates count from a zero-size anchor at the value's place in the flow, and a sheet inside it (positioned with `left`/`top`) carries the ghosts, their sizing and the edge fade: resizing an element whose place comes from the line moved it in right-to-left lines, which anchor by the right edge. The edge fade's neighbour check maps physical sides through the text direction. Text animates per grapheme, except that a word in a joining script (Arabic and the scripts written with it, Syriac, N'Ko, Mongolian, Thaana, ...) stays one unit, since its letters only take their joined forms drawn together (`textUnits` in `lib/match.ts`); Latin words and digits in the same value still split, and values without joining letters split exactly as before. Numbers use any script's decimal digits (Arabic-Indic, Persian, ...), with the Arabic separators and percent sign, so they still match by place value and read their trend. Each leaving glyph sits in its own slot at its line, faded above and below, inside a ghost layer placed at the value's start in the flow and sized around its ghosts each change. `cursorIndex` matches an edit around the caret instead (torph's editable-field mode), setting group separators aside so a field that formats as you type keeps its digits. The root renders through Base UI's `useRender` (a `render` prop, like the registry). A change swaps instantly, with no animation, when `disabled`, under reduced motion (`respectReducedMotion`, default on), or when the label isn't on screen at that moment. `onAnimationStart` fires only for a change that animates; every change then ends in exactly one of `onAnimationComplete` (right away for an instant swap) or `onAnimationCancel` (interrupted by the next change). Package-manager commands (the install block and `PackageManagerCommand`) morph when the reader picks a tab (`components/mdx/command-morph.tsx`): the command splits into the command word, the words between it and the ending every manager shares (an argument part and a flag part), and that shared ending, each in Shiki's github-light/dark token color, so `npx` becomes `pnpm dlx` and the rest slides over. Only the block clicked animates; a saved choice restored after load, or the same choice applied to other blocks, swaps in place. The visible glyphs are what you select and copy (leaving glyphs excluded); the hidden plain copy for screen readers isn't selectable, so a copy has the value once, spaces intact (torph does the same). Headings are flattened to plain text first; `MorphText truncate` clips and fades the right edge only while the settled text doesn't fit.

### Scrolling lists
Popup lists that can outgrow the viewport (the minimap card, the mobile TOC list) scroll inside `ScrollArea` with `fadeEdges="y"` and contained overscroll, the max height set on its viewport.

### Hydration-safe chrome
Anything visible on first paint must not change when React hydrates. Platform shortcut hints render both variants and CSS picks one from `<html data-platform>`, set by an inline script in the head; the theme toggle renders both icons and `.dark` picks one; Animated labels (`TextMorph`) render their per-glyph markup on the server, so hydration adds no work. Styles for portaled popups use literal values, not `--docs-*` tokens, which only exist inside `.docs-root`.

### Mobile TOC Pill
Below md, the table of contents is a pill floating 1rem above the bottom edge (plus the iOS safe area; Android keeps 0 to avoid the fixed-overlay viewport bug). It appears once the title scrolls away (rises 1.5rem and fades, 350ms ease-out-expo) and hides while the shelf is open. It shows a 16px ring filling in Cubby Blue with reading progress, the current section name (morphs on change), and a chevron that turns when open. The pill takes its fill and shadow from the surface ladder (`solidSurface(3, 5)`: level-3 fill, level-5 shadow), like other floating controls; it presses to 97%. Tapping opens a Popover above it listing every heading (40px rows, current one on surface-selected), scrolled to the current section; choosing one scrolls there and closes.

### Code Blocks
A block with a header (package-manager or file tabs) sits in the muted tray; a block without one drops the tray entirely and shows only its code card.

### Cards / Notes / Tables
- **Note:** 14px radius, 4% ink wash, 14px by 18px padding, 0.9375rem at 1.65 line height, no border.
- **Table:** 0.875rem tabular numerals; Quiet Ink 0.8125rem headers over a full hairline; rows split by 7% ink lines.
- **Home category tiles** rest at ladder rung 3 (shadow plus rim) and lift on hover to rung 6 with a 4px rise.

## Do's and Don'ts

### Do:
- **Do** retune neutrals through `--neutral-hue` (270), `--neutral-chroma` (0.004), and `--neutral-chroma-low` (0.002) rather than editing individual grays.
- **Do** take elevation from the surface ladder (`--surface-N`, `--surface-shadow-combined-N`) and state from the translucent overlays (6%, 8%, 10%).
- **Do** keep blue for action, focus, and relation; mark the current location in ink.
- **Do** set h1 to h3 in Bricolage Grotesque at 600 with negative tracking, and everything else in Geist.
- **Do** open with ease-out-expo (`cubic-bezier(0.19, 1, 0.22, 1)`) and close faster with ease-in-cubic (`cubic-bezier(0.55, 0.055, 0.675, 0.19)`); keep hovers at 150ms ease-out.
- **Do** collapse every transform, clip, blur, and draw to opacity or nothing under `prefers-reduced-motion`.
- **Do** design dark explicitly: re-declare derived tokens in `.dark` so they resolve against dark roots.

### Don't:
- **Don't** raise the chrome surface with a ladder rung or paint chrome controls by hand; use `data-surface="chrome"`.
- **Don't** add a second accent hue outside status plates.
- **Don't** use elastic or bouncy easing on controls.
- **Don't** use neon glows, gradient meshes, or cool-AI dark-mode effects; the only gradients are the stage's 3.5% light and the feathered mask on the home dot field.
- **Don't** use the reflex fonts PRODUCT.md bans (Inter, DM Sans, Plus Jakarta, Space Grotesk, Fraunces, Playfair, Cormorant, Instrument Serif, Crimson).
- **Don't** box reading content in shadowed cards on docs; rule it with hairlines or a faint wash.
