# TUNING.md

Live-tuning components with [DialKit](https://github.com/joshpuckett/dialkit): drag sliders next to the real component, then bake the chosen values into source.

## Rules

- **DialKit never goes in `registry/`.** Registry files ship to users via the shadcn CLI. Tune pages live in `app/tune/` only.
- **Don't edit the component to make it tunable.** Override it from the tune page (see "Binding values" below). The component stays the source of truth.
- **Dial defaults must equal the component's current values**, so the page opens looking exactly like production.
- `app/tune/layout.tsx` mounts the single `<DialRoot />`, loads `dialkit/styles.css`, and `notFound()`s in production. Don't mount another root.

## Adding a tune page

One page per component: `app/tune/<component>/page.tsx` (client component). Copy `app/tune/popover/page.tsx` as the template. It renders the real registry component, calls `useDialKit("<Name>", config, { id, persist: true, onAction })`, and injects overrides.

Pick a small, useful set of dials (5 to 10). Group with nested objects (folders). Add a `replay: { type: "action" }` whenever there's an enter/exit animation to re-trigger.

For overlays (popover, select, menu, tooltip): control `open` and ignore `details.reason === "outside-press"` while a `keepOpen` toggle is on, otherwise clicking the dial panel closes the popup.

## Binding values

Cubby components are styled with Tailwind utilities in `@layer utilities`. An **unlayered** `<style>` rule beats any layered rule regardless of specificity, so target the component's `data-slot` hooks:

```tsx
<style>{`
  [data-slot="popover-content"] { border-radius: ${v.radius}px; }
  [data-slot="popover-content"][data-starting-style] { scale: ${v.startScale}; }
`}</style>
```

| What                                  | How                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing, radius, size, color, opacity | CSS property in the `<style>` rule, or set a CSS variable the component already reads                                                       |
| Enter/exit states (Base UI)           | `[data-starting-style]` / `[data-ending-style]` selectors                                                                                   |
| Props (side, offset, variant, size)   | Pass `v.x` straight to the component prop; use `select` controls for enums                                                                  |
| CSS transition with easing curve      | `easing` control → `transition-duration: ${d}s; transition-timing-function: cubic-bezier(${ease.join(",")})`                                |
| CSS transition with a spring          | `spring` control → `String(spring(visualDuration, bounce))` from `motion` gives `"550ms linear(...)"`, usable as duration + timing function |
| Motion (`motion/react`) animations    | Pass the `spring`/`easing` value directly as the `transition` prop                                                                          |

**Multi-value transitions:** if the component transitions several properties with a comma list (e.g. `transition-[width,height,scale,opacity]`), keep the list length and only replace the entries you're tuning, or you'll silently retime the others.

**Types:** `spring`/`easing` values come back typed as the `TransitionConfig` union. Narrow with `as EasingConfig` / `as SpringConfig` (both exported from `dialkit`).

## Timeline

`useDialTimeline` + `<DialTimeline />` only drives values it samples itself. It **cannot scrub CSS transitions** in registry components. Use it only for sequences authored in Motion (or prototyped with timeline values bound to inline styles), then port the result.

## Applying tuned values

The user clicks **Copy** in the panel and pastes the result. Then:

1. Translate each value into the component's Tailwind classes in `registry/default/<component>/` (e.g. `radius: 14` → `rounded-[14px]` or the nearest token; easing → `ease-[cubic-bezier(...)]` or an existing `--ease-*` token if it matches).
2. If a value belongs in a design token, update **both** `registry/theme.css` and `app/globals.css`.
3. Update the tune page's defaults to the new values so it keeps matching production.
4. `pnpm run registry:sync`, lint, and check the examples in the dev server.

## Why not Leva or Tweakpane

DialKit covers the same controls (slider, toggle, color, select, text, pad, folders) plus spring/easing curve editors, saved versions, and a Copy-to-agent flow. Leva and Tweakpane add only monitors/graphs and 3D vector inputs, which component tuning doesn't need. Don't add a second tuning library.
