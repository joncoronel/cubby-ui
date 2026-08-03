# TODO

Running todo for the project, grouped by area. Completed work is archived at the bottom.

## Open

### Elevation / surface system

#### Visual regression sweep

After all the token shifts (surface aliasing, OKLCH conversion, surface-1 darkening, muted/input bump, sidebar alias, foreground unification, light-neutral philosophy, tint pass via `--neutral-hue`/`--neutral-chroma`), walk the docs site and component-heavy demos in both light and dark to spot regressions. Especially worth checking:

- Components that use `bg-muted` as a single-layer container (Accordion, Calendar, Breadcrumbs, Button group, Code block, Kbd, Tree, Tab list, Table header/footer, Slider track, Avatar fallback, Sidebar inset/floating variants). The lift-from-page delta in dark mode shrunk from ~5.5% to ~3.5% with the new muted value.
- Inset patterns (Card inset, Command well, Toast CompletedItemsCard).
- Tinted dark-mode surfaces — confirm the cool-purple hue (275) reads coherently rather than as a tint clash with the cool-blue primary (250).

#### Evaluate primary brand color

`--primary: oklch(0.6 0.2 250)` (cool blue). Now the neutrals are tinted hue 275 (cool purple-blue), 25° away from primary's 250. Harmonious, but PRODUCT.md flagged the cool-blue as "a starting point, not a fixture." Decide whether to:

- Stay cool-blue (current — works with the cool-purple neutrals)
- Shift to a different cool hue closer to 275
- Pivot to warm (would clash with current cool neutrals — would need to rotate `--neutral-hue` too)
- Something distinctive (sage, dusty plum)

**Contrast note (accent-as-text):** `--primary` at L 0.6 is too light to serve as _colored text_ on a light tint — measured 2.92:1 for `text-primary` on `bg-primary/10` in light mode (needs 4.5:1). `ToggleGroup` now ships a **neutral** selected state (`bg-surface-selected` + `text-foreground`, no contrast issue), so this is no longer a shipped coupling — it only surfaces in the documented accent _override_ (`toggle-group-custom-color` example), which pairs the tint with `text-info-foreground` (the primary-hue text ramp: 5.5:1 light / ~5.9:1 dark) instead of `text-primary`. If a dedicated dark-primary text token is ever added (or primary is darkened here), that override — and any other "primary as colored text" usage — can switch to it.

**Contrast note (toggle selection is intentionally subtle):** `Toggle`/`ToggleGroup` signal selection by a neutral background step _only_ — the label/icon stay `text-foreground` in every state (rest/hover/selected) so resting options read as legible rather than dimmed. Consequence: measured selected-vs-unselected non-text contrast is only ~1.2:1 (solid/ghost) to ~1.4:1 (outline), both themes — under the WCAG 1.4.11 3:1 bar for a state indicator. This is a **deliberate** choice: neutral, subtle selection matching the ecosystem norm (shadcn et al. land similarly), with on/off exposed to assistive tech via Base UI's `aria-pressed`. A neutral overlay strong enough to clear 3:1 would read as near-black/white (disabled/inverted, not "selected"); genuine 3:1 compliance would require a distinct cue — an accent fill or a selected-cell boundary/ring. Revisit only if a bolder selection identity is wanted. (Note: outline selects with an opaque `--secondary` chip while solid/ghost use the `--surface-selected` overlay — different mechanism, but both land at ~the same faint contrast.)

#### Light-mode shadow tuning (only if needed)

`--surface-shadow-color: oklch(0 0 0 / 0.06)` matches the source design. With light surfaces all neutral and the page at `oklch(0.97)`, color contrast between popup and page is mostly carried by the shadow drops + 1px ring. If popovers/cards look under-shadowed in light mode during the visual sweep, increase the alpha here.

#### Standalone-button hover (intentionally not migrated)

Several standalone-button hovers still use `bg-accent/50` / `bg-accent/80` rather than `bg-(--surface-hover)`. This is deliberate — `--surface-hover` at 6% is too subtle for a single button needing visible hover feedback. Affected:

- Button (`outline`, `ghost`), Toggle, Select trigger, NumberField increment buttons, Collapsible trigger, Autocomplete trigger, Resizable handle hover, Calendar nav buttons, Checkbox-card and switch-card examples.

If we ever repurpose `--accent` as a true brand-tinted accent (instead of pure gray), these hover effects will automatically pick up the brand color.

#### Inset variant level limitation

Card and code-block use the same `bg-muted` outer + `solidSurface(3)` inner pattern. The outer's gray-frame character doesn't track the Card's `level` prop (it's pinned to bg-muted regardless of level). Inner is hardcoded to level 3.

Practical effect: when a Card inset is rendered inside a Dialog at level 5, the outer reads as recessed below the dialog (bg-muted is darker than the dialog substrate). Acceptable since inset variant is mostly for page-level use, but if we ever need contextual inset rendering, it would need a level-aware inner (8 sets of classes or refactor).

### Menus

#### Content-driven indicator column (`:has()`)

`DropdownMenuCheckboxItem` and its Context Menu / Menubar / Base Drawer siblings pick the row's grid template from the `indicator` prop:

```tsx
indicator === "switch"
  ? "grid-cols-[1fr_auto] gap-3"
  : "grid-cols-[1fr_1rem] gap-2";
```

So the layout is welded to the flag rather than to the contents. `indicator="switch"` gets the built-in `SwitchVisual` and a template sized for it; anything else you place in the row is laid out for a 1rem checkmark.

This does **not** block configuring the built-in switch — `switchShape`, `switchSize` and `switchMotion` all forward, and the switch branch's `auto` column absorbs every size those produce. The only gap is a _different_ indicator entirely: a spinner, a count badge, a coloured dot.

The fix, when a use case shows up:

```tsx
"grid-cols-[1fr_1rem] gap-2",
"has-[[data-slot=switch-visual]]:grid-cols-[1fr_auto] has-[[data-slot=switch-visual]]:gap-3",
```

Then the row adapts to whatever is inside it and `indicator="switch"` becomes shorthand rather than the only door. Costs four components plus an exported indicator primitive per menu so the composed form is writable. Purely additive to what shipped — nothing needs undoing first.

#### Radio and checkbox items are visually identical

Raised by the panel review and deliberately deferred. `DropdownMenuRadioItem` and a default `DropdownMenuCheckboxItem` render the same grid template and the same checkmark glyph in the same cell (dropdown-menu.tsx, and repeated in context-menu and menubar). The pre-branch radio indicator had its own filled-dot treatment, which this branch removed.

In the common "View" menu shape — a `Show sidebar` toggle above a `Sort by` group — nothing signals that one group is multi-select and the other single-select, so there is no cue that picking a second radio silently clears the first.

Options: give the radio indicator a distinct mark (a filled dot, or a lighter/smaller check), or document `indicator="switch"` as the expected choice for checkbox items in any menu that also holds a radio group.

#### Switch track contrast in light mode is an accepted trade

The unchecked light track is `oklch(0 0 0 / 8%)` (`switch.tsx`), which composites on white to `#EBEBEB` — **1.20:1** against the surface. The thumb is `bg-white`, so it measures 1.20:1 against the track too, and thumb position is what conveys on/off. WCAG 1.4.11 asks 3:1 for the parts that identify a component and its state, so this is below the bar on both counts. `data-disabled:opacity-60` takes it to ~1.11:1, and the light hover step (8% → 12%) is a change of about 0.12 contrast points, i.e. not perceptible.

Dark mode is fine at 20% white (≈1.88:1 against the dark page).

Kept deliberately: the value looks right as shipped, and reaching 3:1 by fill alone needs roughly 42% black, which is a visually filled track rather than a subtle one. Recorded here rather than left implicit because the comment that used to carry the reasoning was removed when the tokens moved into the component, and an undocumented trade reads as an oversight to the next reviewer.

If it is ever revisited, the cheaper route than darkening the fill is restoring a boundary: the pre-branch switch carried `inset-shadow-xs`, and a `--switch-track-ring` token at ≥3:1 against both the surface and the thumb would satisfy 1.4.11 without changing the track's weight.

### Filters

Deferred / removed follow-ups pulled from the initial `filters` build (`registry/default/filters/`) to keep v1 tight. None are blocking; revisit when demand shows up.

- **Pill enter/exit motion (removed).** A `motion`/`AnimatePresence` scale+opacity in/out was built then removed at request, along with the `motion` dependency. If we want it back, prefer a lightweight path over pulling framer-motion: CSS `@starting-style` for enter (works today) plus a small JS-managed "exiting" set for exit, and gate it behind a prop (e.g. `animatePills`) so the default stays instant. Must keep the `prefers-reduced-motion` fallback.
- **Date / date-range / boolean as first-class field types.** Currently achievable through the `custom` field type + `renderValue` (see the date example in `filters-field-types.tsx`). First-class versions would wire the existing `date-picker` / `date-range-picker` composables and a boolean toggle, with their own default operators (`before` / `after` / `between`, `is`). Adds `@cubby-ui/date-picker` etc. as registry deps.
- **Field grouping in the add-filter picker.** The picker is a flat searchable list. For many fields, group them by category using `ComboboxGroup` / `ComboboxGroupLabel` (a `group` key on `FilterField`). Dropped for v1 since search covers discovery.
- **Auto-remove a filter dismissed without a value.** Linear-style: if a freshly added select/multiselect filter is dismissed (popup closed) without choosing a value, drop the dangling `Select…` pill instead of leaving it. Would hook the value Combobox's `onOpenChange`/close with an "was anything picked" check. Left out to avoid surprising removals; consider behind an opt-in prop.
- **Lower-priority PR-review leftovers** (blockers, structural pass, context split, and provider/bar split all landed): a ghost/unstyled variant on the `NumberField` primitive so the filter chip can compose it instead of raw Base UI (do it when a second consumer wants an inline borderless number input, or when the chip's copy visibly drifts from the primitive); cache `resolveOperators` per field if it ever shows in profiles.

### Code hygiene

#### Canonical Tailwind class sweep (repo-wide)

Tailwind CSS IntelliSense flags non-canonical v4 class spellings (`suggestCanonicalClasses`). These are editor warnings only — ESLint does not catch them, so `pnpm run lint` stays green either way. Purely cosmetic; the compiled CSS is identical.

Already swept: `dropdown-menu`, `context-menu`, `menubar`, `base-drawer`, `switch`. Those five are clean.

What's left, and how safe each bucket is:

| Pattern                                        | Fix                    | Count | Files                     | Safe to sed? |
| ---------------------------------------------- | ---------------------- | ----- | ------------------------- | ------------ |
| `data-[starting-style]:` etc. (bare attribute) | `data-starting-style:` | 39    | 11                        | Yes          |
| `!text-foo` (leading important)                | `text-foo!`            | 4     | 3                         | Yes          |
| `h-[var(--x)]` (single var)                    | `h-(--x)`              | 9     | 6                         | Yes          |
| `shadow-[var(--a),var(--b)]` (multi-var)       | —                      | 17    | mostly `lib/elevated.tsx` | **No**       |

Two things a blind find/replace gets wrong:

- **Multi-var arbitrary values can't be converted.** The `(--x)` shorthand takes exactly one custom property, so `shadow-[var(--surface-shadow-3),var(--surface-rim-3)]` in `lib/elevated.tsx` has to stay bracketed. IntelliSense doesn't flag these, but a naive regex will eat them.
- **Translate utilities are the Safari @property trap, and the obvious fix costs `cn()` overrides.** Any Tailwind translate utility, bracketed (`translate-y-[var(--x)]`) or shorthand (`translate-y-(--x)`), compiles to `--tw-translate-y: <value>; translate: var(--tw-translate-x) var(--tw-translate-y)`. WebKit drops a registered custom property's `@starting-style` value when it is a `var()` reference and falls back to the registered `initial-value: 0`, so an enter animation starts from the wrong offset. An earlier version of this note claimed the bracketed form was the safe one; it is not — both forms compile identically, confirmed against this repo's own compiler.

  `drawer/drawer.tsx` has 24 of them inside `data-starting-style` / `data-ending-style` variants and is the only file affected. It was converted to direct `[translate:…]` arbitrary properties and then **reverted**, because that conversion is invisible to tailwind-merge: `twMerge("-translate-y-[calc(1.5rem)] translate-y-4")` resolves to `translate-y-4`, but `twMerge("[translate:0_calc(-1.5rem)] translate-y-4")` keeps both, and the arbitrary property wins on emission order. So `<DrawerContent className="translate-y-2">` would silently do nothing. Losing a documented `className` override is worse than a Safari-only enter-animation offset, so the utilities stay for now.

  What a real fix needs: keep the value out of `--tw-translate-*` **and** stay mergeable. Most likely shape is a custom property the consumer sets (`--drawer-offset` already exists) with the component reading it, so `className` is not the override channel in the first place. `transition-panel.tsx` sets `translate` directly and documents it at the call site — it has no consumer-overridable offset, which is why the same trade does not bite there. Confirm the symptom in real Safari before spending more on it; it has never been reproduced here, only reasoned about.

Also note `data-[variant=destructive]:` and other `key=value` forms are already canonical — only bare attribute-presence variants shorten.

Worth doing opportunistically when a file is already being touched rather than as one big diff, since it churns lines without changing behavior.

## Done — Elevation / surface system

Condensed log of the completed surface/elevation work. Full detail is in git history and [surfaces.mdx](content/docs/getting-started/surfaces.mdx). Future areas add their own `## Done — <area>` as work lands.

- **Eight-level surface ladder** (`--surface-1..8`) with three helpers in `lib/elevated.tsx`: `solidSurface` (default, bg + drops + rim in one `box-shadow`), `elevatedSurface` (rim on `::after`, for sticky/opaque children like Select/Combobox/Command), and `surfaceClasses` + `innerEdgeRim()` (viewport-flush sheets/drawers). All expose `--popup-surface` so descendants pick up the popup bg.
- **Tint system** via `--neutral-hue` (275, cool purple-blue) / `--neutral-chroma` — change those two to retune the whole surface + foreground stack. Light-neutral philosophy: light mode is pure-neutral surfaces (clean canvas) with subtly warm foregrounds; dark mode carries the brand tint on both surfaces and foregrounds. Pure black/white translucent overlays left untinted (they pick up color through alpha).
- **`--muted` kept off-ladder** as the recessed category (inset wells, input bg, code blocks, command wells) vs. the ladder's lifted surfaces.
- **State tokens** `--surface-hover` (6%) / `--surface-selected` (10%); migrated all popup items and nav/sidebar/tree/table hover + selected indicators off `bg-accent/N`.
- **Token aliases**: `--background`/`--card`/`--popover` → surface-1/3/3; `--sidebar` → surface-1; card/popover foregrounds → `--foreground`. All values converted hex → OKLCH.
- **Elevation props** (`level` / `shadowLevel`) on every floating component: Popover, Tooltip, all menus + Select/Combobox/Command/Autocomplete, all dialogs/sheets/drawers, Toast, NavigationMenu, Card, Tabs indicator, Code block, ComponentPreview, Table/DataTable, PreviewCard, Toolbar, Tree, Breadcrumbs.
- **Flat-card default** `solidSurface(3, 1)` (bg + 1px rim, no drop) for embedded containers: Card, Table, DataTable, code-block, ComponentPreview.
- **Mode-asymmetric inset** (gray `bg-muted` frame + `bg-surface-3 dark:bg-surface-1` body) on Command, Card `inset`, and the Table redesign — plus Table polish: header tick separators, brighten-on-hover sortable headers, selected-row specificity fix (`!`), and suppressed inner-Table rim inside DataTable.
- **Form-field `default` / `elevated` variants** across Input/Textarea/NumberField/InputGroup/OTP/Combobox/Autocomplete/Checkbox/Radio/Switch: `--input` opaque (surface-3, clean lifted look) vs `--input-elevated` translucent (for white-on-white surfaces like Cards/Dialogs).
