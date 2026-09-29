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
- **Page** (`{colors.surface-1}` / dark `{colors.dark-surface-1}`): the page background and every docs surface that should read as the page itself (header when scrolled, stage).
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

The docs page is a card set in a frame. The frame (`--docs-frame`: oklch 0.925 in light, the chrome near-black in dark) holds the header; the card keeps the page color (`--background`), so components sit on the background they were designed for. The card is inset 8px (12px from sm up) on the sides and bottom, starts under the 56px header, and has a 16px (20px) radius and no edge line: the frame's color around it draws its shape. The document still scrolls natively: two fixed layers draw the card fill behind the content and the frame in front of it (a rounded rectangle with a 100vmax spread shadow in the frame color), so content reads as scrolling inside the card while scroll restoration, anchors, and the mobile URL bar keep working. No layer is sized from both its top and bottom edge: Chrome on Android resolves those against a different viewport height while the URL bar slides, so the fill and the frame's top and sides are pinned to the top at `100lvh` (they never resize) and the bottom edge is its own bottom-pinned strip, which moves with the URL bar. The shelf opens over the card: a sheet across its top below md, a floating window inset 0.5rem from md up. One centered column. Everything, previews included, sits in one `{spacing.content}` (48rem) column; nothing breaks out wider, so every block shares both edges. Header and shelf content share a `{spacing.chrome-max}` (76rem) container with 1.25rem to 2rem side padding. The sticky header is `{spacing.header-height}` (56px) and scroll padding is 5rem.

Vertical rhythm is set by the container, not the blocks: siblings flow at `{spacing.flow}`; any component block (preview, table, note) takes `{spacing.block}` above and below; h2 takes `{spacing.headline-above}` above, h3 `{spacing.title-above}`, h4 to h6 2.25rem; the gap after h2 and h3 is `{spacing.heading-below}`, after h4 0.5rem. The page footer sits 6rem below content. Lists indent 1.25rem with 0.375rem between items.

The table of contents is a fixed tick minimap in the right margin at the xl breakpoint (hovering it opens the headings in a PreviewCard to its left); below that it lives in the header's section crumb. The shelf is a window for browsing (finding a page by name is the search dialog's job): from lg up, an inset 11.5rem guides rail, Primitives flowing down three text columns and Composables down two; below lg the guides sit in a row above the groups, each flowing in two or three columns. Heading anchor glyphs hide below 40rem.

The home page is a 64rem (max-w-5xl) viewport-height composition: centered hero stack with 1.5rem internal gaps, 3 to 3.5rem to the category tiles, a slim footer pinned to the bottom.

## Elevation & Depth

A hybrid: light mode keeps fills neutral and communicates elevation with layered shadow; dark mode steps lightness up the tinted ladder, adds an inset top-edge highlight and ring, and uses darker, tighter shadow alphas so wide layers stay visible. Every rung is one shadow token plus one rim token, combined as `--surface-shadow-combined-N`. State overlays (`--surface-hover` 6%, `--surface-active` 8%, `--surface-selected` 10%, black in light, white in dark) raise whatever they sit on by a fixed perceptual delta.

### Shadow Vocabulary
- **Hairline ring** (`box-shadow: 0 0 0 1px oklch(0 0 0 / 0.06)`, rung 1): flush containers that need an edge without lift; also the light chrome edge.
- **Resting card** (rung 3: `0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 1px -0.5px oklch(0 0 0 / 0.06), 0 3px 3px -1.5px oklch(0 0 0 / 0.05)`): cards and inputs at rest.
- **Floating** (rungs 5 to 8, adding 12px, 24px, 48px, and 96px layers at 0.04 to 0.03 alpha): popovers, dialogs, menus.
- **Docs float** (`0 0 0 1px var(--border), 0 16px 40px -12px oklch(0 0 0 / 0.14)`, dark 0.5): menus and the minimap's PreviewCard use the component's own surface. The shelf window takes its fill and shadow from the surface ladder (`solidSurface(3, 5)`), like the other floating controls.
- **Dark chrome edge** (`0 0 0 1px oklch(0 0 0 / 0.7), inset 0 1px 0 0 oklch(1 0 0 / 0.065)`): defines the chrome fill against a dark page.
- **Stage outline** (`0 0 0 1px var(--border)`): previews are drawn, not lifted.

### Named Rules
**The Ladder Rule.** Elevation is chosen from the ladder, never hand-written. A floating chrome surface is built from the near, mid, and far shadow alphas with no ladder ring, because rungs 3 to 8 carry their own ring.

**The Drawn-Not-Lifted Rule.** Reading surfaces on docs (note, tables, API rows) sit flat on the page, defined by hairlines or a faint ink wash. Shadow appears only on things that float over content: the open shelf, the minimap card, menus.

## Shapes

Softly rounded, from a single root radius of 12px (`{rounded.lg}`) with 2px steps either side: 6, 8, 10, 12, 14, 16px. Buttons use 12px; shelf links 8px; compact buttons and menu rows 8 to 10px; notes 14px; the example tray 20px (its card 16px), the largest radius, because it is the page's main object. Pills (999px) are reserved for the shelf trigger, the example peek's expand button and step numbers. Small marks are nearly square: the current-page mark is a 6px square at 2px radius, minimap ticks are 2px bars.

Structure is typographic: groups are set apart by space and a small label, not by boxes or rules. Revealed code simply appears in place with a 180ms fade; nothing animates layout height.

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
Every docs page in one window that grows out of the header's trigger. Below md it is a sheet across the top of the card, scrolling inside it, with rounded bottom corners. From md up it floats: inset 0.5rem from the card, its left edge on the header row's, up to 66rem wide, with a 16px radius (the card's less 4px).
- **Layout:** from lg up the guides sit in an 11.5rem rail: a 3.5% ink panel inset 0.5rem from the window's edges, set apart by its fill rather than a rule, with an 8px radius (concentric with the window's 16px); Primitives (three columns) and Composables (two) sit beside it. Every group name is Bricolage 0.875rem semibold in ink; component groups add a tabular count. Below md the sheet is flush with the card, so it drops the ring and rim and keeps only the shadow below it.
- **Link:** 32px tall, 8px inline padding, 0.875rem Quiet Ink label. Hover: ink label on a surface-hover wash (8px radius), instant both ways (no transition). Focus: a 2px ring inset.
- **Current page:** 500-weight ink label with a 6px blue mark that grows in and pushes the name over (300ms ease-out-expo). The list opens scrolled to it.
- **Keyboard:** the window takes focus on open; the first arrow key lands on the current page, then up and down walk the links in reading order; Escape closes and returns focus to the trigger.
- **Motion:** the window opens from 98% scale and 4px up, from an origin under the trigger: opacity 100ms ease-out, scale and position 180ms ease-out-expo, on its own layer. The scrim (150ms), chevron and glyph (200ms) finish on the same short clock. It closes the same way back in 120ms ease-out, the scrim with it. A scrim at 10% ink (45% black in dark) covers the card, which becomes inert. Under reduced motion it only fades.

### Preview Stage
- **Example tray:** an example with code is one object. A tray in the code block's own fill and edge (`bg-muted`, `solidSurface(3, 1)`), 20px radius and 4px padding, holds the live example on a card at the top (page fill, 16px radius so the corners stay concentric, no ring or shadow: its fill alone sets it apart) and the code on the tray beneath it. An example without code is the card alone with a 1px hairline ring.
- **Card:** 13rem minimum height in a tray (the first stage 16rem, 12rem on mobile), content centered with 52px top, 24px sides, 40px bottom padding.
- **Code:** Shiki colors straight on the tray, no card of its own, with a copy button floating in its top-right corner (outside the scroller, on the tray fill) so it never scrolls away. Up to 6 lines show in full. Longer code opens as a peek, its first four lines fading out; the peek itself and a "Show all N lines" button floating over its faded foot (the registry Button, outline, xs, fully rounded, chevron as its leading icon; the fade masks the code only, so the button stays solid) expand it in place with no height animation. It is one toggle for both states: open, the same button stays floating at the code's foot and reads Collapse (chevron turning 180 degrees; the label swaps without a morph, since the code jumps open with no animation to follow), so it never leaves the pointer or loses focus, and the open code keeps just enough room at its foot that the last line scrolls to sit right above it, to at most min(30rem, 65dvh), past which it scrolls with faded edges, so copy and the toggle stay in reach. A closed peek doesn't render the lines it never shows (`display: none` from the sixth): a page carries every example's full source, and on the combobox page a theme change restyled 11,000 of its 13,000 elements, about 95ms a switch against 35ms now. Scroll chains through to the page (code blocks never contain overscroll, which trapped the page over sideways-scrolling code). Collapsing brings the example back into view if it went off the top.

### Install
One code block with package-manager tabs; the choice is shared across the site and remembered. Manual steps appear the same way (instant, short fade) under a small chevron disclosure; steps are numbered 24px pills at 7% ink joined by a hairline. Three steps: add the dependencies (the same shared tabs), copy the source, update the import paths. The source sits in a code block tray whose header names the file (tabs when there are several, labelled by file name, or by path only when two files share one; the tab row scrolls sideways without a scrollbar), with the code on the block's own card as a peek, the same `CodePeek` as an example's code (`card` variant: the clip keeps the card's corners and the fade is on the text, so the card stays solid). The full path sits under it: "Save it as ...".

### API Props
Quiet hairline rows on a subgrid: mono name in ink (0.8125rem, 500), type and default in Quiet Ink mono, a chevron that turns 90 degrees. Rows are separated by a 70% hairline; hover washes the row at 2.5% ink. The panel height-animates 300ms ease-out-expo and shows description, full type, and default.

### Minimap (on this page)
A column of 2px ticks in the right margin at xl: 24px for h2, 16px and 8px (indented) for deeper levels, at 16% ink; visible sections go to 40%, the active one to full ink. Hovering opens the headings in a PreviewCard to its left, vertically centered on the ticks and fixed-positioned so it never drifts on scroll; the ticks fade out while it is open. Clicking a heading scrolls smoothly (instant under reduced motion) and updates the URL. The active section is computed from scroll position once per frame (`HeadingsProvider` in `components/docs/use-headings.tsx`): the last heading above a reading line 25% down the viewport, or the last heading on screen at the very bottom. That keeps the minimap, header crumb and mobile pill in step even on fast scrolls, which an IntersectionObserver can skip.

### Text Morph
Any label that swaps in place animates with `TextMorph` (`registry/default/text-morph/`, installable), through `MorphText`. The server renders the label already split into one span per glyph, the same markup the browser keeps, so nothing changes on hydration and nothing is measured at load. On each change it snapshots every glyph's on-screen box (mid-animation included), reuses shared glyphs, moves removed ones to a ghost layer, and animates each from its snapshot, so a change that lands mid-animation picks up where things are. The space the label takes eases through its start margin (below), and the stage rides against its moving start on the same clock, so glyphs never drift in a centred pill or right-pinned button. The engine is split by job: DOM reads in `lib/measure.ts`, the batch scheduler in `lib/scheduler.ts`, matching in `lib/match.ts`, edge-fade and arrival-clip arithmetic in `lib/edges.ts`, stage-ride snapping in `lib/ride.ts`, with `lib/timing.ts`, `lib/shapes.ts`, `lib/anchors.ts` and `lib/options.ts` alongside.

Three modes, picked with the top-level `mode` prop, each bringing its own defaults for every option (`MODE_DEFAULTS` in `text-morph/lib/options.ts`, deeply frozen, built from `BLEND_OPTIONS`, `ROLL_OPTIONS` and `MORPH_OPTIONS`). `blend`, Cubby's own mode and the default, is a soft crossfade: only what changed moves, and each changed run, letters or digits, comes in as one unit from 0.9 scale about its own centre with a 0.1em blur, all at once, while digits also drift 0.08em the way the value went; 240ms in, 150ms out, the box's width and the words that stay sliding to their places included, on one ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`), with no stagger. Gather (letters drawing together), Sweep (focus in reading order) and Advance (a shift along the line) were tried before it and dropped as too stylised for a default. `morph` matches by words, then letters within similar words, sliding shared glyphs and scaling the rest to 0.95 on a 400ms ease-out expo, with linear opacity (leaving over the first 100ms, arriving over 200ms from 100ms in), no blur and no stagger; its digits roll a full line on their own fades (out over 180ms, in over 100ms). `roll` keeps the shared start and end and rolls the glyphs between, travelling 0.35em while scaling to 0.6, tilting 2deg and blurring 0.1em, on a 550ms hand-tuned spring (transform and opacity alike), with delays fanned across 165ms and the width on a non-overshooting 550ms curve.

`options` deep-merges over the chosen mode's defaults, so `{ motion: { duration: 200 } }` keeps the mode's easing. The `duration` prop scales the mode's whole clock so movement takes that long, every other duration, delay and stagger in proportion, so the look holds on a shorter clock. Click feedback (`MorphText feedback`: Copied, Hide code) passes `duration={209}`. `value` also takes a number, formatted with a fixed `locale` (default `en`) and optional `format` (`Intl.NumberFormat` options), so the server and browser render the same text. `/tune/text-morph` switches modes and tunes from each mode's defaults.

Blend matches by words: a word that stays keeps every glyph (edge punctuation aside, so `saved.` → `saved!` swaps only the mark), a similar word or the lone changed word in its gap keeps only what it shares at its start and end plus what stays in place in a same-length middle (`2024-01-01` → `2024-02-01` changes one digit, `09:59` → `10:00` keeps its colon), and a punctuation mark found once in the changed middle on each side slides to its new place (`12.4M` → `1.1B` moves its decimal point); a letter or digit never moves to another place, which is what made letter-level reuse read as busy. Morph matches by words first, with a word diff: words that survive in order or only moved keep every glyph, so `hello world` → `world hello` swaps them whole and `Transaction Safe` → `Processing Transaction` slides `Transaction` over intact; a new word takes the letters it shares, in order, with the most similar old word in the same gap between survivors when strictly more than 40% match; anything else enters or leaves whole; numbers count as one token and keep their place-value match. Morph matches letters anywhere only in a one-word value, sliding shared ones. Roll also keeps one shared run in the middle (`xxlightxx` → `yylightyy` keeps `light`), at least two glyphs long and travelling no further than its length plus two slots.

In every mode numbers are matched by place value (`text-morph/lib/match.ts`), and a number is a whole word (digits and separators, opened only by a sign, currency symbol, `(` or `#` and closed only by punctuation), so `v1.2.3`, `2024-01-01` and `COVID-19` stay text rather than reading `-19` as a falling negative. Digits line up on the decimal point, so only the ones that changed roll (`matchPlaces`: the shared prefix and suffix hold; digits pair by column while their count stays, and as the longest run carried from the units column when it changes, so `12,345` → `1,234` slides 1234 over; a separator keeps its distance from the point unless digits carried a reshape, when it leaves; gaining or losing three or more digits replaces the number, keeping only its affixes). A number without a partner (one that appears or empties: `$4` → `$`) still animates as a number, rolling its digits rather than fading them like letters, while matching treats it as text so its affix holds. `cursorIndex` matches an edit around the caret instead (an editable-field mode), setting group separators aside so a field that formats as you type keeps its digits; it is a string index (an input's `selectionStart`), converted to text units, so an emoji or joined word before the caret doesn't shift the match.

What arrives or leaves travels with its nearest survivor, by how far that survivor moved in the layout, not where it's drawn. Positions are measured with transforms taken out: a digit still falling in is drawn above its place, and anchoring the next to that stacked each fall on the last, so typing fast brought digits in from up to 883px above. An arriving glyph starts at that neighbour's starting offset, looking before it first; a leaving one moves with it, looking after it first, so `Processing` slides in beside `Transaction` and `Safe` rides out with it. The neighbour must share the glyph's line (its old line when leaving, its new one when arriving), since in wrapped text the glyph before a line's first ends the line above, and travelling with it carried `dog` off the start of its own line and out of the card. A whole word arriving or leaving scales about the word's centre as one shape, and a run of six or more replaced glyphs with no survivor inside (letters in a one-word value, digits in any) is swapped as one shape, so `$12,345,678` → `$99` shrinks the old digits in place instead of sending them after the `$` (to 0.8 about the run's centre, fading in over 35% and out over 45% of the movement, without travelling). Each glyph's pivot (`transform-origin`) is set per change and cleared when it's kept, and a leaving glyph takes a shape's pivot only if it was at rest, so an interrupted glyph never jumps. The glyph's slot takes the trip (a `translate` on the slot, fade and all) and the glyph its own entrance inside it, so a digit rolls within a number that moves line; added up on the glyph, the two cancelled (a morph digit rolls exactly one line), and `Total
5,678` → `1,234` showed a new number appearing in place instead of the old one rising. A glyph whose trip crosses lines also rolls the way it travels, not by the trend, so the number visibly scrolls up as it changes (rolling against the trip, it held still while its slot slid past). Roll mode anchors only digits, to the rest of their own number, and only when the trip crosses lines, so its glyphs still roll in place on their line (a right-aligned `$12,345,678` → `$99` used to drag its old digits 143px after the sliding `$`) while a number that moves to another line takes its digits with it; its letters don't travel, and it has no one-shape swap. Arriving and leaving glyphs in blend travel with their neighbours as in morph (new text appearing in place ran into the words sliding past it), and since blend's new text shows from its first frame (morph's waits 100ms, by when it has come most of the way in), arriving text carried in from past a pinned edge a reader sees (`Copied` → `Copy page` in a right-pinned button brings `page` in from past its right edge) stays hidden past that edge while the change plays, the mirror of leaving text dissolving there under the edge fade: a `clip-path` inset on the root (`data-edge-clip`), since a mask can't hide what's outside its element, only on an edge the label holds still, lifted when the change ends. Holding the arrival back at the edge instead (clamping its trip) looked squashed. A glyph's trip with its neighbour never waits for its stagger.

The `spread` stagger is a sweep: delay by position across the changed stretch only, so a glyph leaving and its replacement in the same spot cross over together, over `ms` less one glyph's step (two glyphs sit half of it apart). The stagger runs in reading order, from the right in right-to-left text. In roll mode a kept glyph slides on the width's curve rather than the roll's spring, so a kept run can't outrun the box resizing around it. A roll run's travel is measured on screen, against where the value is pinned as it grows (an anchor of 0 at the start, 0.5 centred, 1 at the end), so in centred or end-pinned text a run shifted along the text by the change in length holds still and is kept; the anchor comes from how far each edge travelled in the label's last resize, and before one from its `text-align`. `trend` sets the roll direction: `auto` reads it off the value (a number that grew brings new glyphs up from below, one that shrank brings them down, anything else rolls up), and `up` and `down` hold one way. Blend and roll default to `auto`, morph to `down` (digits fall in from above and leave downward, and a number's other marks, separators and currency, arrive from below so each reads as its own event; reading the value in morph had `$99` → `$1,234` rise where a fall reads better). Morph can take `auto` for counters that follow the value. In any setting, a glyph crossing lines rolls the way it travels; crossing means a trip of more than three quarters of a line, so a centred value recentring by half a line as it gains or loses one keeps the setting's direction. A kept glyph whose place doesn't change carries on with the roll it was on (its keyframes, timing and progress are noted before the change stops everything, and resumed): restarted from where it was drawn, holding a key sent every digit still settling off again on a fresh ease-out each press, lurching forward, and one within half a pixel of home snapped there.

A new glyph always arrives fresh, even where the same text is still leaving (a quick `5 → 6 → 5`, a double-clicked toggle): the old copy keeps leaving while the new one comes in. Taking the leaving ghost back instead (reclaim, removed) spared a quick toggle a brief overlap of two copies, but made quick changes look unlike slow ones: spam clicking the long paragraph pulled the leaving words back in, so nothing visibly left and returning words skipped their entrance. A leaving glyph caught before it showed (still in its fade-in delay) leaves from full opacity (its snapshot reads opacity with `|| 1`, so 0 counts as 1): leaving from nothing, spam clicking the long paragraph showed nothing fading out at all (0 of 58 leaving glyphs visible 40ms after a click 70ms after the last; now all 58). A glyph caught mid-fade by the next change catches up: it finishes over a quarter of its fade at most (50ms in morph), since a newer value is now what to read. Restarting the whole fade on every change left a run of quick ones (a held key) playing only its opening sliver, so letters crawled in over most of a second; finishing at the pace it was going still left the last few letters of fast typing half-faded; snapping them to full in one frame pops. Typing fast, each letter is readable about 47ms after it appears, and the last one fades in fully.

When the box shrinks, old glyphs hold the place they were drawn while the edge moves in, so they can sit over the next word or outside a pill. The edge fade (`edgeFade`) dissolves that ink: a 0.3em ramp on the ghost layer only, never the live value, on each edge that is actually moving, following the box edge on the width curve and ending 0.4em past it. `auto` arms it only where the ink would land on something: a neighbour on the line, or past the edge a reader sees holding the value (the nearest ancestor that shows an edge, a background, a side border, a shadow (Tailwind's rings) or a frosted backdrop, on itself or on its `::before`/`::after`, or that clips; our Button paints its fill on `::before`, so a first version reading only the element itself skipped the button and let `page` out again). A transparent wrapper is skipped on the way up, and a plain block around the value has no edge to see, so ink there dissolves on its own opacity; an edge drawn by a separate element, not an ancestor, isn't seen. The fade lifts when the last ghost leaves. Armed for a neighbour, the band follows the box edge; armed only for the container's edge, it holds still at that edge and fades only ink crossing it (following the box, it swept right to left across letters still well inside a card as a long value cleared). It also arms on an edge that doesn't move when leaving ink is carried past it: travelling with its neighbour, `page` in a right-pinned `Copy page` → `Copied` rides out past the button's edge as `Cop` slides toward it, and unfaded it would be drawn outside the button; here it dissolves at the edge. `edgeFade: "never"` turns it off, leaving that ink to fade on its own opacity wherever it travels. The vertical fade lives on the glyph and ghost layers rather than the box, since a mask cuts everything outside its element. The edge fade's neighbour check maps physical sides through the text direction.

At rest the label flows inline like the text around it, grouped into no-wrap words with real spaces between them, so a long value wraps between words wherever its context lets text wrap (the header crumb and buttons stay on one line). A change that stays on one line eases the space the label takes through its start margin (`margin-inline-start`, back to the author's own), so text after it slides. A start margin, not an end one: line breaking counts it before the glyphs, so a growing value never runs past the space it had and breaks away from the text before it (an end margin let `$1200` → `$12009999` drop the number to a new line below the `$`). While it eases, the label also stays on one line (`text-wrap-mode: nowrap`, which leaves spaces alone); the label never changes display, since switching between inline and inline-block repaints its text snapped differently (the old inline-block box's settle step measured 550–1,650 changed pixel channels on the docs examples; this measures 0). When a centred or pinned container, or a neighbour changing in the same update and easing its own space, moves the label's start, the stage rides against it with `left`, which inline boxes honour (every one-line label reads its start after all the start margins are set, so a label that doesn't resize still rides when a counter beside it grows; without that its kept glyphs started a neighbour's growth away from where they were, 26.6px on the tune page's counter row; the ride runs on the label's own width curve, so a neighbour easing on a different one leaves the glyphs drifting slightly in flight, landing exactly; matching it would take per-frame tracking or an extra layout round per change, and nothing on this site mixes width timings in one update). Both run on the main thread from one clock, so a busy main thread can't leave the compositor sliding the text away from its space; a change that wraps keeps its lines as they fall and glyphs travel across them. When the label's move is just its own start margin (all of it pinned at the start or end, half centred), the stage rides by the margin's exact value, not the measured move: the measurement is rounded to layout units (1/64px), and two animations easing from values that far apart round apart frame to frame, so at 125% display scaling left-aligned glyphs flipped a device pixel side to side (116 times in one change; 0 now).

A label laid out as a box (`display` other than `inline`: a class like `block` or `inline-block`, or a flex or grid item, which is blockified) eases its `width` instead, since an inline label can't take one: its text sits at its start while it resizes (`text-align: start` under `data-sizing`), and when its glyphs move with the width (half of it centred, all of it pinned at the end) the stage rides by that share of the width in CSS, `calc(0.5 * (100% - <final width>))`, so layout rounds the ride and the width from the same number each frame. A ride animated beside a width, or text centred inside a box resizing in a centred line, rounded on its own and stepped the glyphs back and forth by 1/64px; centred, the ink now moves monotonically at 125% scaling. Such a label also eases its height when its line count changes: the height animates from what it was to what its new lines take on the width's curve, and the stage rides vertically as well as horizontally so glyphs hold their measured places in a centred container. An inline-block needs `vertical-align: top` to grow smoothly: on the baseline, its last line, already laid out below the easing box, stretched the line holding it to the new height at once, so it eased shrinking but jumped growing. The tune page's wrapping stage uses `inline-block align-top` and keeps room for two lines, so a third grows the card and it eases. An inline label's height is its lines', which can't be set, so there a change of line count lands at once (the glyphs still travel). The root's `display` sits in `@layer components` so such a class wins; the rest of the CSS stays unlayered, so page styles for spans (a docs code block's) can't reach the glyphs. Line counts are rows of the letters layer's rects, not their number: an inline element can come back in pieces on one row, split around a space or a line break. An empty value keeps its line: the letters layer shows a zero-width space when it has no glyphs, where before the line collapsed to 0 once the change settled and everything below jumped.

Every label that changes in the same update runs through the change together, in phases (read, write, read, write), from a microtask before the paint; running animations are gathered once per change, in the read phase. A change nobody can see swaps instantly and measures nothing, only stopping what's running and swapping the glyphs: when `disableAnimation` (named for the registry's tabs; `disabled` read as disabling whatever element `render` made the root), in a background tab (its animations don't finish until it's shown, so ghosts piled up), or when the label isn't on screen at that moment (in the viewport and inside every ancestor that clips it, so a label scrolled out of view in a scrolling panel doesn't animate unseen); an instant swap also clears an earlier change's ghosts and edge fade. Each glyph sits in a layout-neutral slot built with the words (a glyph sliding along its line keeps its fade and gets room for the slide, `--reach`; only one moving to another line drops it, so a digit caught mid-roll by fast typing fades back in rather than appearing in full off its line), all structural DOM changes (words, slots, ghosts moving into their layer) happen in one phase, and finished ghosts are removed together, so a batch forces one restyle. On this site that matters: its compiled `:has()` rules (Tailwind `group-has-*` and `has-*:**` variants from the registry) make Chrome restyle nearly the whole document after any element insertion, about 9ms each, and unbatched a tab click forced about 8.

Glyphs keep `will-change: transform, opacity` at rest: a glyph that drops out of its compositing layer when its animation ends is repainted snapped to the pixel grid with different anti-aliasing, a visible twitch as it settles. Every glyph, from first paint, not only from its first animation: that was tried, to save layers on labels that never change, and dropped. A glyph outside a layer draws with subpixel (LCD) anti-aliasing and one in a layer in greyscale, so a label mixed the two (a still `hello` colour-fringed beside an animated `there`) and a still word visibly changed rendering the first time it animated. The top and bottom fade is per glyph, not on the letters layer (a mask cuts off everything outside its element, including glyphs travelling in from outside the new text): only a glyph that rolls or is drawn off its line gets a slot mask (`data-fade`), fading it at its line, and glyphs that travel go unmasked. Each leaving glyph sits in its own slot at its line, inside a ghost layer placed at the value's start in the flow and sized around its ghosts each change. Where the browser supports it (`mask-clip: no-clip`, current Chromium and Firefox), each slot's fade repeats sideways without end (`mask-repeat: repeat-x`), so it only ever cuts above and below and a glyph sliding or shrinking sideways out of its slot is never sliced; elsewhere the slot's room (`--reach`) and unmasking a shape's glyphs cover it. `no-clip` lifts the cut above and below too, so a `clip-path: inset(0 -100vw)` puts that edge back (without it, a digit falling into the number sandbox showed whole and faint above its line). How far a slot reaches past the glyph's box follows the mode: roll's fades across 0.3em of room outside it, for its blur and tilt; morph's has none and fades 0.15em inside the box, so a digit rolling in shows nothing until it enters its line. In a tight line height the ink reaches past the line box (a comma's tail below it at `leading-none`), so a fade inside the box faded it until the change settled, then popped it; morph's slot is at least 1.4em tall (`max(0em, (1.4em - 1lh) / 2)` of room, inside `@supports (height: 1lh)`), reaching past the box only as far as that takes, none at a 1.6 line height. The slots fade only while a change plays (`data-playing` on the letters layer, set with the change's last writes and removed when it settles, while the root carries `data-animating` for styling), so no masks stay on the page at rest. The slots themselves stay, as inert wrappers: unwrapping them at settle measured about 8–9ms of whole-document restyle on the docs pages (the `:has()` cost again, on desktop), where the attribute measured 0. Masked and unmasked at rest measured identical (0 changed pixel channels on four docs examples), so lifting the masks can't show as a settle step. Fades carry no `filter` keyframes when blur is 0 (morph mode), so nothing leaves the compositor for a no-op blur.

The letters layer carries `dir="auto"`: each glyph is its own box, which bidi treats as direction-neutral, so without it a Latin value in a right-to-left paragraph was laid out backwards. Ghost coordinates count from a zero-size anchor at the value's place in the flow, and a sheet inside it (positioned with `left`/`top`) carries the ghosts, their sizing and the edge fade: resizing an element whose place comes from the line moved it in right-to-left lines, which anchor by the right edge. Text animates per grapheme, except that a word in a script whose letters shape together stays one unit (`textUnits` in `lib/match.ts`): joining scripts (Arabic and the scripts written with it, Syriac, N'Ko, Mongolian, Thaana, ...), since their letters only take their joined forms drawn together, and the ones that stack or fuse consonants into conjuncts (Devanagari and the other Indic scripts, Sinhala, Tibetan, Thai, Lao, Khmer, Myanmar), where a conjunct split across two glyph boxes showed a loose virama or subscript. Latin words and digits in the same value still split, and values without such letters split exactly as before. Numbers use any script's decimal digits (Arabic-Indic, Persian, ...), with the Arabic separators and percent sign, so they still match by place value and read their trend. Spaces show as typed: the space glyphs take `white-space-collapse: preserve` (with a `pre-wrap` fallback), so a run of spaces isn't collapsed to one (`hello world` → `hello  world` slides `world` over) and a `\n` breaks the line; only collapsing changes, since `white-space: pre-wrap` would also turn wrapping back on and let a label easing its width wrap.

The stage carries `translate="no"`, so page translation rewrites the screen-reader copy rather than scrambling the glyphs. The visible glyphs are what you select and copy (leaving glyphs excluded); the hidden plain copy for screen readers isn't selectable, so a copy has the value once, spaces intact. Under reduced motion (`reducedMotion`: `"user"`, the default, follows the system setting; `"always"` and `"never"` override it) it crossfades in place instead: no travel, scale, tilt, blur, stagger or resize, and no fade-in delay (morph's left a gap after the old glyphs had gone that its travel covers; standing still it read as a blink), and arriving glyphs carry no transform animation. The root renders through Base UI's `useRender` (a `render` prop, like the registry). `onMorphStart` fires only for a change that animates; every change then ends in exactly one of `onMorphComplete` (right away for an instant swap) or `onMorphCancel` (interrupted by the next change). A label that unmounts mid-change, or that an Activity or Suspense boundary hides, ends silently (no callbacks) but still settles; merely dropping the change let a label shown again report it complete. Package-manager commands (the install block and `PackageManagerCommand`) morph when the reader picks a tab (`components/mdx/command-morph.tsx`): the command splits into the command word, the words between it and the ending every manager shares (an argument part and a flag part), and that shared ending, each in Shiki's github-light/dark token color, so `npx` becomes `pnpm dlx` and the rest slides over. Only the block clicked animates; a saved choice restored after load, or the same choice applied to other blocks, swaps in place. Headings are flattened to plain text first; `MorphText truncate` clips and fades the right edge only while the settled text doesn't fit, checking the fit in `onMorphComplete`.

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
