# TUNING.md

Live-tuning components with [DialKit](https://github.com/joshpuckett/dialkit): drag sliders next to the real component, then bake the chosen values into source.

## Rules

- **DialKit never goes in `registry/`.** Registry files ship to users via the shadcn CLI. Tune pages live in `app/tune/` only.
- **Don't edit the component to make it tunable.** Override it from the tune page (see "Binding values" below). The component stays the source of truth.
- **Dial defaults must equal the component's current values**, so the page opens looking exactly like production.
- **Only emit an override once its dial leaves the default.** Untouched dials must inject nothing, so the page shows the real component even if the defaults drift. Keep defaults as named constants and compare against them (see the popover page's `css` array).
- **DialKit holds component values only.** Playback and page controls (replay, speed, freeze/scrub, original, keep open, theme, reset, copy) live in the shared `<TuneToolbar>` (`app/tune/_lib/tune-toolbar.tsx`), so DialKit's Copy output and saved versions never contain them. DialKit can't host custom buttons in its sticky header, which is why they're not there.
- `app/tune/layout.tsx` mounts the single `<DialRoot />`, loads `dialkit/styles.css`, and `notFound()`s in production. Don't mount another root.

## Adding a tune page

One page per component: `app/tune/<component>/page.tsx` (client component). Copy `app/tune/popover/page.tsx` as the template. It renders the real registry component, calls `useDialKit("<Name>", config, { id, persist: true })`, builds the override `css`, and renders the toolbar:

```tsx
const [tune, setTune] = useTuneState(); // { original, keepOpen, rate, freeze, phase, time }

<TuneToolbar
  state={tune}
  setState={setTune}
  panelId="popover" // reset also calls DialStore.resetValues(panelId)
  file="registry/default/popover/popover.tsx" // named in the copied text
  css={css} // the emitted overrides
  props={{ PopoverContent: changedProps }} // prop dials that left the default
  onReplay={replay}
  keepOpen // popups only
/>;
```

Prop dials follow the same rule as CSS: build a `changedProps` object holding only props whose dial left the default, spread it onto the component (skip it when `tune.original`), and pass it to the toolbar. Copy is disabled when both `css` and `props` are empty.

Pick a small, useful set of dials. Group with nested objects (folders). Wire `tune.original` (drop the `<style>` and dial-driven props), `tune.rate` (`useSlowMotion`), and `tune.freeze`/`phase`/`time` (`useCssScrub`).

For overlays (popover, select, menu, tooltip): control `open` and ignore `details.reason === "outside-press"` while `tune.keepOpen` is on, otherwise clicking the dial panel or toolbar closes the popup.

Standard extras for every page:

- **Content variants that exercise the component**, not just the one-line demo: short, long, and overflowing. For components that morph between contents (popover, menu, tooltip), render one trigger per variant sharing a `createXHandle()` with `payload`; switching triggers while open is what runs the morph. A morph is several transitions on different elements (popover: popup width/height, positioner + arrow position, content crossfade); give each its own dial in a `morph` folder. Tuning only one of them desyncs it from the rest.
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
useCssScrub({
  selector: '[data-slot="popover-content"]',
  enabled: tune.freeze,
  phase: tune.phase,
  time: tune.time,
});
```

The toolbar's Freeze toggle reveals the phase and time controls; `scrubMax` sets the time range (default 1000ms).

- `phase: "exit"` only freezes transitions under `[data-ending-style]`. Base UI waits for exit transitions to finish, so a frozen exit keeps the popup mounted until freeze is turned off.
- Freezing only catches transitions that start after it's on. Make `replay` phase-aware: close then reopen for `enter`, open then close for `exit`.
- **Slow motion:** pass the component's **outermost animated element** (for popups, the positioner, not the popup). Anything outside the selector keeps playing at 1x and drifts out of sync. `useSlowMotion(selector, rate)` (`app/tune/_lib/use-slow-motion.ts`) sets `playbackRate` on every browser-run animation under `selector`: CSS transitions/keyframes and Motion's hardware-accelerated animations (opacity, transform, filter, clip-path). Motion's JS-driven animations (layout, other-property springs, motion values) aren't affected. Divide replay delays by the rate.
- For quick inspection without a page, Chrome DevTools' Animations panel (Ctrl+Shift+P, "Show Animations") also scrubs and slows CSS transitions.

## Timeline

`useDialTimeline` + `<DialTimeline />` only drives values it samples itself. It **cannot scrub CSS transitions** in registry components. Use it only for sequences authored in Motion (or prototyped with timeline values bound to inline styles), then port the result.

## Applying tuned values

The user clicks **Copy changes** in the toolbar and pastes the result: the source file, then only the CSS rules and props whose dials moved, e.g.

```
/* Tuned changes for registry/default/popover/popover.tsx. Apply CSS as Tailwind classes and props as new defaults. */

[data-slot="popover-content"] { border-radius: 16px; }

/* PopoverContent prop defaults */
sideOffset: 12
level: 5
```

(DialKit's own **Copy** gives raw dial values instead; prefer the toolbar's, since it's already resolved to CSS, springs included.) Then:

1. Change each listed prop's default in the component's function signature (e.g. `sideOffset = 8` → `sideOffset = 12`), and update any doc/API reference that states the default.
2. Translate each CSS rule into the component's Tailwind classes in `registry/default/<component>/` (e.g. `radius: 14` → `rounded-[14px]` or the nearest token; easing → `ease-[cubic-bezier(...)]` or an existing `--ease-*` token if it matches).
3. If a value belongs in a design token, update **both** `registry/theme.css` and `app/globals.css`.
4. Update the tune page's defaults to the new values so it keeps matching production.
5. `pnpm run registry:sync`, lint, and check the examples in the dev server.

## Why not Leva or Tweakpane

DialKit covers the same controls (slider, toggle, color, select, text, pad, folders) plus spring/easing curve editors, saved versions, and a Copy-to-agent flow. Leva and Tweakpane add only monitors/graphs and 3D vector inputs, which component tuning doesn't need. Don't add a second tuning library.
