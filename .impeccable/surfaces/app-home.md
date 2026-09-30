---
version: 1
slug: "app-home"
primary_target: "app/(home)"
related_targets: ["app/(home)/page.tsx","components/home"]
---

# Home page

Scope: the whole landing page (`app/(home)`), nav and footer included. Visitor mode: Persuade. Its own look, separate from the docs; the docs keep DESIGN.md's world.

Audience: indie builders deciding in seconds whether Cubby is worth installing. Job: see Cubby's custom components working and that the code becomes theirs. Action: Get started (docs intro); secondary, browse components. Proof: live custom components only (no stock primitives, no Fancy Button), each one command away. Constraints: no testimonials or sponsor rows (no real quotes); no settings dials; light and dark both designed.

Benchmarks for finish: beui.dev (structure), rauno.me and Tuple (craft).

Memorable moment: the hero's install command changes its component name letter by letter and the component above it swaps in, live.

## Direction contract

THESIS: The category standard played straight and finished: hero, install command, a gallery of live components, a close. It refuses the old page's abstract tiles and the grey devtool template by making every block a working component and giving the page its own committed colour.

OWN-WORLD: A drenched ultramarine slab (inset from the page edge, large radius) holds the nav and hero, with near-white ink and one marigold spark for the live component name. Below, a warm near-white ground (deep ink navy in dark) with white stage cards. Bricolage display set big, Geist body, Geist Mono for commands.

STORY: The visitor reads one sentence, watches the command swap components, plays with the gallery, sees that the source lands in their project, and clicks Get started.

FIRST VIEWPORT: The ultramarine slab fills most of the viewport: nav across its top (logo, Components, Docs, search, theme, GitHub, Get started); left, the headline up to 5.5rem, a one-line lead, Get started (light) and Browse components; right, a stage card showing the current showpiece live, component tabs above it and the install command joined beneath it.

FORM: The category standard (canon), user's choice after The Session was rolled; The Session's command-prints-component idea kept for the hero only. Seed key 18448ba8.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
