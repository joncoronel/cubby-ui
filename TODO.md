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

#### Light-mode shadow tuning (only if needed)

`--surface-shadow-color: oklch(0 0 0 / 0.06)` matches the source design. With light surfaces all neutral and the page at `oklch(0.97)`, color contrast between popup and page is mostly carried by the shadow drops + 1px ring. If popovers/cards look under-shadowed in light mode during the visual sweep, increase the alpha here.

#### Standalone-button hover (intentionally not migrated)

Several standalone-button hovers still use `bg-accent/50` / `bg-accent/80` rather than `bg-(--surface-hover)`. This is deliberate — `--surface-hover` at 6% is too subtle for a single button needing visible hover feedback. Affected:

- Button (`outline`, `ghost`), Toggle, Select trigger, NumberField increment buttons, Collapsible trigger, Autocomplete trigger, Cropper toolbar buttons, Resizable handle hover, Calendar nav buttons, Checkbox-card and switch-card examples.

If we ever repurpose `--accent` as a true brand-tinted accent (instead of pure gray), these hover effects will automatically pick up the brand color.

#### Inset variant level limitation

Card and code-block use the same `bg-muted` outer + `solidSurface(3)` inner pattern. The outer's gray-frame character doesn't track the Card's `level` prop (it's pinned to bg-muted regardless of level). Inner is hardcoded to level 3.

Practical effect: when a Card inset is rendered inside a Dialog at level 5, the outer reads as recessed below the dialog (bg-muted is darker than the dialog substrate). Acceptable since inset variant is mostly for page-level use, but if we ever need contextual inset rendering, it would need a level-aware inner (8 sets of classes or refactor).

### Filters

Deferred / removed follow-ups pulled from the initial `filters` build (`registry/default/filters/`) to keep v1 tight. None are blocking; revisit when demand shows up.

- **Pill enter/exit motion (removed).** A `motion`/`AnimatePresence` scale+opacity in/out was built then removed at request, along with the `motion` dependency. If we want it back, prefer a lightweight path over pulling framer-motion: CSS `@starting-style` for enter (works today) plus a small JS-managed "exiting" set for exit, and gate it behind a prop (e.g. `animatePills`) so the default stays instant. Must keep the `prefers-reduced-motion` fallback.
- **Date / date-range / boolean as first-class field types.** Currently achievable through the `custom` field type + `renderValue` (see the date example in `filters-field-types.tsx`). First-class versions would wire the existing `date-picker` / `date-range-picker` composables and a boolean toggle, with their own default operators (`before` / `after` / `between`, `is`). Adds `@cubby-ui/date-picker` etc. as registry deps.
- **Field grouping in the add-filter picker.** The picker is a flat searchable list. For many fields, group them by category using `ComboboxGroup` / `ComboboxGroupLabel` (a `group` key on `FilterField`). Dropped for v1 since search covers discovery.
- **Auto-remove a filter dismissed without a value.** Linear-style: if a freshly added select/multiselect filter is dismissed (popup closed) without choosing a value, drop the dangling `Select…` pill instead of leaving it. Would hook the value Combobox's `onOpenChange`/close with an "was anything picked" check. Left out to avoid surprising removals; consider behind an opt-in prop.

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
