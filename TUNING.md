# TUNING.md

Live-tuning components with [DialKit](https://github.com/joshpuckett/dialkit): drag sliders next to the real component, then bake the chosen values into source.

## Rules

- **DialKit never goes in `registry/`.** Registry files ship to users via the shadcn CLI. Tune pages live in `app/tune/` only.
- **Don't edit the component to make it tunable.** Override it from the tune page (see "Binding values" below). The component stays the source of truth.
- **Dial defaults must equal the component's current values**, so the page opens looking exactly like production.
- **Only emit an override once its dial leaves the default.** Untouched dials must inject nothing, so the page shows the real component even if the defaults drift. Keep defaults as named constants and compare against them (see the popover page's `css` array).
- **Every page gets an `original: false` toggle** that drops all overrides and default-valued props, for A/B against the shipped component.
- **Every page gets a `reset: { type: "action", label: "Reset to component" }`** handled with `DialStore.resetValues("<panel id>")`. Values persist across reloads (`persist: true`) and DialKit's panel has no reset button of its own. Saved versions survive a reset.
- `app/tune/layout.tsx` mounts the single `<DialRoot />`, loads `dialkit/styles.css`, and `notFound()`s in production. Don't mount another root.

## Adding a tune page

One page per component: `app/tune/<component>/page.tsx` (client component). Copy `app/tune/popover/page.tsx` as the template. It renders the real registry component, calls `useDialKit("<Name>", config, { id, persist: true, onAction })`, and injects overrides.

Pick a small, useful set of dials (5 to 10). Group with nested objects (folders). Add a `replay: { type: "action" }` whenever there's an enter/exit animation to re-trigger.

For overlays (popover, select, menu, tooltip): control `open` and ignore `details.reason === "outside-press"` while a `keepOpen` toggle is on, otherwise clicking the dial panel closes the popup.

Standard extras for every page:

- **Content variants that exercise the component**, not just the one-line demo: short, long, and overflowing. For components that morph between contents (popover, menu, tooltip), render one trigger per variant sharing a `createXHandle()` with `payload`; switching triggers while open is what runs the morph. A morph is several transitions on different elements (popover: popup width/height, positioner + arrow position, content crossfade); give each its own dial in a `morph` folder. Tuning only one of them desyncs it from the rest.
- **Theme toggle action** via `next-themes`' `setTheme`. It flips the site theme (the same one the docs toggle uses).
- **Real props as dials** (`level`, `shadowLevel`, `size`, `variant`): pass them through, `undefined` when `original` is on.
- `/tune` lists every `app/tune/<name>/` folder automatically. Folders starting with `_` are skipped.

## Binding values

Cubby components are styled with Tailwind utilities in `@layer utilities`. An **unlayered** `<style>` rule beats any layered rule regardless of specificity, so target the component's `data-slot` hooks:

```tsx
<style>{`
  [data-slot="popover-content"] { border-radius: ${v.radius}px; }
  [data-slot="popover-content"][data-starting-style] { scale: ${v.startScale}; }
`}</style>
```

| What                                  | How                                                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Spacing, radius, size, color, opacity | CSS property in the `<style>` rule, or set a CSS variable the component already reads                                                           |
| Enter/exit states (Base UI)           | `[data-starting-style]` / `[data-ending-style]` selectors                                                                                       |
| Props (side, offset, variant, size)   | Pass `v.x` straight to the component prop; use `select` controls for enums                                                                      |
| CSS transition (easing or spring)     | `transitionToCss(v.x)` from `app/tune/_lib/transition-css.ts` returns `{ duration, easing }`. Handles all three tabs of the transition control. |
| Motion (`motion/react`) animations    | Pass the `spring`/`easing` value directly as the `transition` prop                                                                              |

**Multi-value transitions:** if the component transitions several properties with a comma list (e.g. `transition-[width,height,scale,opacity]`), keep the list length and only replace the entries you're tuning, or you'll silently retime the others.

**Never put a spring on opacity or color.** A spring overshoots and swings back. Transforms show that as bounce, but opacity is capped at 1, so it only shows the swing back as a visible flicker. Give transform and opacity separate transition dials; the opacity one uses its bezier only and falls back to the default if a spring tab is picked (see the popover page's `motion.scale` / `motion.fade`).

**Never assume a transition control returns a bezier.** Its Time and Physics tabs switch the value to `{ type: "spring", ... }` (`visualDuration`/`bounce` or `stiffness`/`damping`/`mass`). Always go through `transitionToCss`, which samples springs into `linear()` via Motion's `spring()`. Springs usually outlast beziers, so size the scrub `time` range and replay delay to fit.

## Scrubbing CSS transitions

`app/tune/_lib/use-css-scrub.ts` freezes a component's CSS transitions and seeks them from a dial. Every CSS transition is a `CSSTransition` in the Web Animations API, so the hook listens for `transitionrun`, pauses the animations under `selector`, and sets `currentTime` from the dial (one shared playhead in ms, so offsets between properties stay real).

```tsx
scrub: {
  freeze: false,
  phase: { type: "select", options: ["enter", "exit"] },
  time: [0, 0, 400, 1],
},

useCssScrub({ selector: '[data-slot="popover-content"]', enabled: v.scrub.freeze, phase, time: v.scrub.time });
```

- `phase: "exit"` only freezes transitions under `[data-ending-style]`. Base UI waits for exit transitions to finish, so a frozen exit keeps the popup mounted until freeze is turned off.
- Freezing only catches transitions that start after it's on. Make `replay` phase-aware: close then reopen for `enter`, open then close for `exit`.
- **Slow motion:** pass the component's **outermost animated element** (for popups, the positioner, not the popup). Anything outside the selector keeps playing at 1x and drifts out of sync. `useSlowMotion(selector, rate)` (`app/tune/_lib/use-slow-motion.ts`) sets `playbackRate` on every browser-run animation under `selector`: CSS transitions/keyframes and Motion's hardware-accelerated animations (opacity, transform, filter, clip-path). Motion's JS-driven animations (layout, other-property springs, motion values) aren't affected. Divide replay delays by the rate.
- For quick inspection without a page, Chrome DevTools' Animations panel (Ctrl+Shift+P, "Show Animations") also scrubs and slows CSS transitions.

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
