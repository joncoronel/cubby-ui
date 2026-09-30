---
version: 1
slug: "app-docs"
primary_target: "app/docs"
related_targets: ["app/docs/[[...slug]]/page.tsx"]
---

# Docs pages (app/docs)

Scope: every page under /docs, component pages first. Mode: Read.
Audience: indie builders evaluating or using cubby-ui. Job: grab and go (see the component live, copy install and example, leave). Constraints: .mdx content files stay untouched; Fumadocs keeps static generation, search, page tree, TOC data, LLM markdown routes. Site-wide display face is Bricolage Grotesque.

## Direction contract

THESIS: A component page is one calm column where the live component leads; navigation is a shelf of cubbies opened on demand. Refuses the three-column sidebar / content / right-TOC docs template and its permanent chrome.

OWN-WORLD: Cubby surface ladder and tokens, Bricolage headings over Geist body, one blue accent. The shelf is a literal cubby grid: hairline-ruled cells, one name per cell, the current page filled. A thin tick rail stands in for the TOC.

STORY: The visitor sees the component working, copies the install line under it, scans examples, and switches components from the shelf without losing their place. Composables show which primitives they are built on (raise from transit diagram: interchanges drawn between cells on hover).

FIRST VIEWPORT: 56px header: logo, shelf trigger reading the current page, search, theme. Centered 44rem column: title in Bricolage ~2.75rem, description, a quiet meta line (type, built on, page actions). Directly below, a wide live stage (up to 54rem) with replay and code toggles; install command immediately after. Tick rail fixed in the right margin at xl.

FORM: The cubby shelf, position 5 on the ranked list, seed key 684c5e49.

Signature interaction: the shelf drops from the header with a clip reveal and staggered cells; filtering dims instead of removing cells so the grid never reflows; hovering a composable lights up its primitives. Motion grammar: ease-out-expo, 180-450ms, header crumb rolls to the active section, page content settles in on navigation.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
