# TODO — Elevation / Surface System

Tracking items deferred while building out the surface elevation system.

## Deferred

### Tinting the neutrals (high impact, design)

The entire surface ladder + foregrounds + muted/accent/secondary use `oklch(L 0 0)` — pure neutral gray, no hue. PRODUCT.md mandates: "Neutrals must be tinted toward the brand hue — no pure gray, no pure white, no pure black."

Suggested approach when picked up:

- Pick a warm hue (70–80 amber, or warmer if primary evolves)
- Apply chroma `0.005` light / `0.006–0.008` dark across `--surface-1..8`
- Tint `--foreground`, `--muted`, `--secondary`, `--accent`, `--border`, `--input` to match
- Keep `oklch(1 0 0)` for pure-white surface-3..8 in light mode (you can't tint pure white)

### Migrate remaining elevated components to elevation props

Select is the only component using `elevatedSurface()` + `level`/`shadowLevel` props today. These all need the same treatment:

- [x] Popover — `<PopoverContent level={3} />` (and standalone `<PopoverPopup />`)
- [x] DropdownMenu — `<DropdownMenuContent level={3} />` + `<DropdownMenuSubContent level={5} />` + all 5 item types migrated to `bg-(--surface-hover)`
- [x] ContextMenu — `<ContextMenuContent level={3} />` + `<ContextMenuSubContent level={5} />` + all item `focus:bg-accent` migrated
- [x] Menubar — bar itself at `level={2}` (subtle inline toolbar) + `<MenubarContent level={3} />` + `<MenubarSubContent level={5} />` + item + trigger hover migrated
- [x] Combobox — `<ComboboxPopup level={3} shadowLevel={3} />`. Uses `elevatedSurface` (rim on `::after`) because group labels can be sticky. Arrow tracks `--popup-surface`. Item `data-highlighted:bg-accent/50` → `bg-(--surface-hover)`. Group label `bg-popover` → `bg-(--popup-surface,var(--popover))`.
- [x] Command — elevation moved to the OUTER `Command` frame via `solidSurface(level, shadowLevel)` (defaults `3/3`); inner `CommandContent` reverted to its original inset-card styling (`bg-card` + 1px `ring-border/25 dark:ring-border/10`). The inner is intentionally darker than the outer — Command's design is a "well inside a panel," not a floating card. The outer's `solidSurface` exposes `--popup-surface` which the sticky CommandGroupLabel (rendered inside the inner card) picks up. Item hover stays on `bg-(--surface-hover)`. For CommandDialog, pass `level={7}` to the outer Command so the palette pops above the dialog.
- [x] Tooltip — `<TooltipContent level={2} shadowLevel={2} />`. Lightest tier. Arrow tracks `--popup-surface`. Replaced `bg-card` / `ring-1 ring-border/60` / custom shadow with `solidSurface(2, 2)`.
- [x] Dialog — `<DialogContent level={5} shadowLevel={5} />` (nested-dialog overlay moved from `::after` to `::before` z-3 to coexist with the rim)
- [x] AlertDialog — `<AlertDialogContent level={5} shadowLevel={5} />` (nested-dialog overlay moved to `::before` z-3, same pattern as Dialog)
- [x] Sheet — `<SheetContent level={5} shadowLevel={5} />` (CVA refactored: removed `bg-popover` / `shadow-lg` / `ring-1` from variants; surface comes from `elevatedSurface()` applied via cn(). Nested-sheet overlay moved to `::before` z-3.)
- [x] Drawer — both variants migrated:
  - `drawer` (custom snap-point drawer): `<DrawerContent level={5} shadowLevel={5} />`. CVA refactored (removed `bg-popover` / `shadow-lg` / `ring-1` from `default`); surface applied outside via `cn(elevatedSurface(...))`. `popupSurfaceStyle()` merged with the existing animation `popupStyle`. DrawerFooter `bg-popover` → `bg-(--popup-surface,var(--popover))` so sticky footer tracks the level. Nested-dialog overlay already on `::before` (pre-existing). The Safari iOS touch-fix `::after` co-exists with the rim's `::after` on the same pseudo-element (different properties, no conflict).
  - `base-drawer` (Base UI drawer wrapper): `<BaseDrawerPopup level={5} shadowLevel={5} />`. Bleed pseudo-element moved from `::after` → `::before` (positioned outside the popup to fill drag-past-edge gaps). 4 menu-item hover sites migrated to `bg-(--surface-hover)`.
- [x] Toast — defaults baked in: `level=3, shadowLevel=4` (heavier shadow since it floats unattached). Because Toast is spawned imperatively via `toast()` instead of wrapped, the level isn't exposed as a prop — it's hardcoded in the styling. Stacked toasts preserve their color-mix darkening effect by using `--popup-surface` as the base of the mix. Grouped expanded card pops to level 5; CompletedItemsCard stays on `bg-muted` (intentionally recessed) but gets the level-5 shadow + rim. Anchored toast uses `solidSurface(3, 3)` (tooltip-tier).
- [x] Autocomplete — `<AutocompletePopup level={3} shadowLevel={3} />`. Same shape as Combobox — uses `elevatedSurface` (rim on `::after`) for sticky group labels. Arrow tracks `--popup-surface`. Item hover + group label migrated.
- [x] Card — `<Card level={3} shadowLevel={2} />` on the `default` variant. Replaces `bg-card border dark:border-border/50` with `solidSurface(level, shadowLevel)`. `inset` variant left as-is (well-inside-a-card pattern, its own surface treatment). Defaults to a static-card shadow (subtle drop + rim) lower than floating components.
- [x] NavigationMenu — bar itself: `<NavigationMenu level={2} shadowLevel={2} />` (same toolbar-tier as Menubar). Viewport popup baked to `solidSurface(3, 3)`; Sub popup baked to `solidSurface(5, 5)`. `NavigationMenuTrigger` lost its `bg-card` (now transparent over the bar). Arrow body tracks `--popup-surface`. Triggers/links migrated to `bg-(--surface-hover)` / `bg-(--surface-selected)` for hover and `data-[popup-open]` states.

Each component currently uses `bg-popover` (now aliased to `--surface-3`, so it works) but doesn't expose a `level` prop. Bump to `level` + `shadowLevel` so they can nest correctly.

### Replace `bg-accent/50` hover usage across components

Same pattern as Select's fix — `bg-accent/50` blends a fixed gray with the variable substrate, which breaks at higher levels. Migrate to `bg-(--surface-hover)`:

- [x] DropdownMenu items (already on `data-highlighted:bg-(--surface-hover)`)
- [x] ContextMenu items (done as part of ContextMenu migration above)
- [x] Menubar items (done as part of Menubar migration above)
- [x] Combobox items (already on `data-highlighted:bg-(--surface-hover)`)
- [x] Command items (already on `data-highlighted:bg-(--surface-hover)`)
- [x] Autocomplete items (already on `data-highlighted:bg-(--surface-hover)`)
- [x] Ghost/list button hover migrated for list-style components:
  - NavigationMenu trigger / sub-trigger / link — `hover:bg-(--surface-hover)`, `data-[popup-open]:bg-(--surface-selected)`
  - Toolbar link — `hover:bg-(--surface-hover)`
  - DataTable column-header sort button — `hover:bg-(--surface-hover)`
  - SidebarMenuButton + SidebarMenuSubButton — `hover:bg-(--surface-hover)`, `active:bg-(--surface-selected)`, `data-[state=open]:bg-(--surface-selected)`
  - `examples/navigation-menu/navigation-menu-custom-styled-dropdown` — link hover migrated
- [ ] Standalone-button hover (Button outline, Toggle, Select trigger, NumberField buttons, Collapsible trigger, Autocomplete trigger, Cropper, Resizable handle) intentionally **not** migrated — they need visible hover feedback as single elements; `--surface-hover` at 6% is too subtle for that use case.

Once everything's migrated, `--accent` can be repurposed as a true brand accent (colored, not gray).

### Evaluate primary brand color

PRODUCT.md flags the current `oklch(0.6 0.2 250)` cool blue as "a starting point, not a fixture." When the neutrals warm up, the cool-blue primary will read as increasingly off. Pick a direction:

- Stay cool-blue (and tint neutrals only slightly to avoid clash)
- Shift to warm (amber, terracotta, dusty red)
- A more distinctive option (sage, dusty plum)

### Light-mode shadow tuning (only if needed)

`--surface-shadow-color: oklch(0 0 0 / 0.06)` is the same value used by the source design. With the page now at `oklch(0.97)` instead of near-white, there's *slightly* more color contrast between popup and page, which means shadow does less of the lifting. Probably still reads fine — only revisit if popovers look under-shadowed in light mode after migrating real screens.

### Visual regression sweep

After several token shifts in this session — surface aliasing, OKLCH conversion, surface-1 darkening, muted/input bump, sidebar alias, foreground unification — there's no guarantee every screen still reads well. Walk the docs site and any component-heavy demos in both light and dark to spot regressions.

## Done

- Eight-level surface ladder (`--surface-1..8`)
- Rim overlay system (`--surface-rim-N` + `after:` pseudo-element pattern)
- Three elevation helpers in `lib/elevated.tsx` — all bake `--popup-surface` into their className output via a static `SURFACE_VAR` map, so descendants can pick it up with `bg-(--popup-surface,var(--popover))` etc.:
  - `solidSurface(level, shadowLevel?)` — bg + drops + rim all in `box-shadow` (no `::after`). **Default choice** for components without opaque/sticky children near edges.
  - `elevatedSurface(level, shadowLevel?)` — bg + drops + rim on `::after`. Use when sticky/opaque children could cover the rim (Select, Combobox, Command, Autocomplete).
  - `surfaceClasses(level, shadowLevel?)` — bg + drops only, no rim. Building block for specialized rim treatments (paired with `innerEdgeRim()` for viewport-flush sheets/drawers).
- `innerEdgeRim(innerSide)` + `INNER_EDGE_FROM_ATTACH_SIDE` for flush sheet/drawer variants (single-edge rim only).
- Select `level` / `shadowLevel` props with rim overlay
- `--surface-hover` and `--surface-selected` state-overlay tokens
- Aliased `--background`/`--card`/`--popover` → `--surface-1/3/3` (Card and Popover share level 3, matching fluid-functionalism)
- All surface values converted to OKLCH format
- Light surface-1 dropped to `oklch(0.97)` for visible page tint
- `--muted` kept standalone (`oklch(0.94)` light / `oklch(0.24)` dark), intentionally **off the surface ladder**. The ladder represents *lifted* surfaces (up-only from page); `--muted` represents the **recessed** category — used for inset wells, input backgrounds, code blocks, command palette wells, quiet differentiation strips. This deliberately diverges from fluid-functionalism (where `--muted: var(--surface-2)`) because their system has no recessed concept; ours does.
- Command's `CommandContent` uses mode-asymmetric inner: `bg-surface-3 dark:bg-surface-1`. Light gets the "well in a panel" pattern (white card lifted inside a gray strip); dark gets the "cutout" pattern (inner drops back to page color). Each mode gets strong contrast in its own way — a symmetric version (single token both modes) has a weak mode by construction.
- `--input` stays standalone at `oklch(0.93)` light — same off-ladder recessed category as `--muted`.
- `--sidebar` aliased to `var(--surface-1)`
- Foregrounds unified (`--card-foreground` and `--popover-foreground` → `var(--foreground)`)
