## Design Context

### Users

Solo indie builders shipping side projects and small SaaS. They arrive evaluating whether cubby-ui will help them skip design decisions and ship fast. Job to be done: drop beautiful, accessible, opinionated components into a Next.js/React project in minutes — confident they'll look good by default and that they can own and customize the source fully.

### Brand Personality

Three words: **warm, crafted, confident**.

- Less sterile than shadcn, less corporate than Material, less playful than Chakra.
- Feels like a tool made by one person for one person, not a committee shipping for the enterprise.
- Voice is direct and pragmatic ("Styled primitives. Your code."), but never clinical. Copy can have personality where it lands — no corporate-speak, no joke-heavy.
- Emotional goal: make an indie dev feel like a capable craftsperson, not a cog in a feature factory.

### Aesthetic Direction

**Visual tone**: warm, refined minimalism. Typography and spatial rhythm do the heavy lifting; ornament is suspicious by default.

**Theme**: system default on first paint. Both light and dark must be designed explicitly — dark is not the brand-primary mode and never an inverted afterthought.

**Color direction**: the current primary (`oklch(0.6 0.2 250)`, cool blue) is a starting point, not a fixture. Evolution toward a warmer / more distinctive accent is on the table when it serves "warm and human." Neutrals must be tinted toward the brand hue — no pure gray, no pure white, no pure black.

**Typography direction**: Geist is a reflex default; it gets the job done but does not carry warmth. Prefer pairing a more characterful display face with a readable body face. Do not reach for Inter, DM Sans, Plus Jakarta, Space Grotesk, Fraunces, Playfair, Cormorant, Instrument Serif, or Crimson — they are banned reflex fonts.

**References to sense (not to copy)**:

- Rauno Freiberg's personal site — craft and restraint.
- Craft, Tuple, Arc marketing — warm, considered, software-with-soul.
- Printed magazines — deliberate hierarchy and considered spacing.

**Anti-references — explicitly NOT this**:

- shadcn.com homepage: grid of identical cards, subtle gradient hero, muted cool-grays. The generic 2024-2025 devtool template.
- Linear / Vercel dark mode with neon-cyan glowing accents, gradient meshes — the "cool AI tool" look.
- Cartoon mascots, hand-drawn SVGs, pastel gradients, bouncy consumer animations.
- B2B SaaS: stock photography, trust-logo rows, generic corporate blue, testimonial carousels.

### Design Principles

1. **Warmth without sacrificing precision.** Soften edges, tint neutrals, choose a warm accent — but never at the cost of sharp typographic hierarchy or clean spacing logic.
2. **Typography carries the voice.** Most of the personality lives in type pairing and rhythm, not in decorative elements. Skip the reflex font list above; find something with actual character.
3. **Earn every ornament.** If a gradient, shadow, or illustration doesn't reinforce "warm, crafted, indie," it doesn't ship.
4. **Not another devtool template.** Audit every layout against the anti-references. If it could be any dev tool's homepage, redesign it.
5. **Motion is spring-based and earned.** Use the existing `--ease-gentle` / `--ease-smooth` / `--ease-snappy` tokens. Avoid elastic/bouncy at button-click level. Respect `prefers-reduced-motion`.
6. **Theme parity.** Light and dark are both designed explicitly. System preference wins on first paint.
