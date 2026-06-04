# TODO — Elevation / Surface System

Tracking remaining items for the surface elevation system.

## Open

### Visual regression sweep

After all the token shifts (surface aliasing, OKLCH conversion, surface-1 darkening, muted/input bump, sidebar alias, foreground unification, light-neutral philosophy, tint pass via `--neutral-hue`/`--neutral-chroma`), walk the docs site and component-heavy demos in both light and dark to spot regressions. Especially worth checking:

- Components that use `bg-muted` as a single-layer container (Accordion, Calendar, Breadcrumbs, Button group, Code block, Kbd, Tree, Tab list, Table header/footer, Slider track, Avatar fallback, Sidebar inset/floating variants). The lift-from-page delta in dark mode shrunk from ~5.5% to ~3.5% with the new muted value.
- Inset patterns (Card inset, Command well, Toast CompletedItemsCard).
- Tinted dark-mode surfaces — confirm the cool-purple hue (275) reads coherently rather than as a tint clash with the cool-blue primary (250).

### Evaluate primary brand color

`--primary: oklch(0.6 0.2 250)` (cool blue). Now the neutrals are tinted hue 275 (cool purple-blue), 25° away from primary's 250. Harmonious, but PRODUCT.md flagged the cool-blue as "a starting point, not a fixture." Decide whether to:

- Stay cool-blue (current — works with the cool-purple neutrals)
- Shift to a different cool hue closer to 275
- Pivot to warm (would clash with current cool neutrals — would need to rotate `--neutral-hue` too)
- Something distinctive (sage, dusty plum)

### Light-mode shadow tuning (only if needed)

`--surface-shadow-color: oklch(0 0 0 / 0.06)` matches the source design. With light surfaces all neutral and the page at `oklch(0.97)`, color contrast between popup and page is mostly carried by the shadow drops + 1px ring. If popovers/cards look under-shadowed in light mode during the visual sweep, increase the alpha here.

### Standalone-button hover (intentionally not migrated)

Several standalone-button hovers still use `bg-accent/50` / `bg-accent/80` rather than `bg-(--surface-hover)`. This is deliberate — `--surface-hover` at 6% is too subtle for a single button needing visible hover feedback. Affected:

- Button (`outline`, `ghost`), Toggle, Select trigger, NumberField increment buttons, Collapsible trigger, Autocomplete trigger, Cropper toolbar buttons, Resizable handle hover, Calendar nav buttons, Checkbox-card and switch-card examples.

If we ever repurpose `--accent` as a true brand-tinted accent (instead of pure gray), these hover effects will automatically pick up the brand color.

### Inset variant level limitation

Card and code-block use the same `bg-muted` outer + `solidSurface(3)` inner pattern. The outer's gray-frame character doesn't track the Card's `level` prop (it's pinned to bg-muted regardless of level). Inner is hardcoded to level 3.

Practical effect: when a Card inset is rendered inside a Dialog at level 5, the outer reads as recessed below the dialog (bg-muted is darker than the dialog substrate). Acceptable since inset variant is mostly for page-level use, but if we ever need contextual inset rendering, it would need a level-aware inner (8 sets of classes or refactor).

## Done

### Foundation

- Eight-level surface ladder (`--surface-1..8`)
- Three elevation helpers in `lib/elevated.tsx`:
  - `solidSurface(level, shadowLevel?)` — bg + drops + rim in one `box-shadow`. **Default.**
  - `elevatedSurface(level, shadowLevel?)` — bg + drops + rim on `::after`. Use when sticky/opaque children could cover the rim (Select, Combobox, Command, Autocomplete).
  - `surfaceClasses(level, shadowLevel?)` — bg + drops only, no rim. Building block, paired with `innerEdgeRim()` for viewport-flush sheets/drawers.
- `innerEdgeRim(innerSide)` + `INNER_EDGE_FROM_ATTACH_SIDE` for flush sheet/drawer variants (single-edge rim).
- All helpers expose `--popup-surface` so descendants can pick up the popup's bg color (arrows, sticky labels, fade gradients).
- `--surface-hover` (6%) and `--surface-selected` (10%) state-overlay tokens — matched to fluid-functionalism.
- Aliased `--background`/`--card`/`--popover` → `--surface-1`/`--surface-3`/`--surface-3`. Card and Popover share level 3.
- `--sidebar` → `var(--surface-1)`.
- Foregrounds unified: `--card-foreground` and `--popover-foreground` → `var(--foreground)`.

### Tint system

- `--neutral-hue` (currently 275 — cool purple-blue) and `--neutral-chroma` (0.004) / `--neutral-chroma-low` (0.002) vars at the top of `:root`. Change those two values to retune the entire surface/foreground stack.
- **Light-neutral philosophy**: light-mode backgrounds (surface ladder, muted, secondary, accent, input, sidebar surfaces) are pure neutral — no chroma. Tint applies only to:
  - Light-mode foregrounds (subtle warmth in text)
  - All dark-mode surfaces and foregrounds (brand identity expresses in dark mode)
- Result: light mode reads as "clean canvas," dark mode carries the brand. Linear/Vercel/Stripe-style asymmetric treatment.
- Pure-black and pure-white translucent overlays (`oklch(0 0 0 / X)`, `oklch(1 0 0 / X)`) left untinted — they pick up color from the tinted substrate through alpha compositing.

### `--muted` philosophy (off-ladder)

- `--muted` kept standalone (`oklch(0.94 0 0)` light / `oklch(0.24 var(--neutral-chroma) var(--neutral-hue))` dark) — **intentionally off the surface ladder**.
- The surface ladder represents *lifted* surfaces (up-only from page).
- `--muted` represents the **recessed** category: inset wells, input backgrounds, code blocks, command palette wells, quiet differentiation strips.
- Deliberately diverges from fluid-functionalism (where `--muted: var(--surface-2)`) — they don't have a recessed concept; we do.

### Migrated to elevation props

Every floating component exposes `level`/`shadowLevel` props that flow through to the underlying `solidSurface`/`elevatedSurface` call:

- Popover, Tooltip
- DropdownMenu, ContextMenu, Menubar, Select, Combobox, Command, Autocomplete
- Dialog, AlertDialog, Sheet, Drawer, BaseDrawer
- Toast (defaults baked since spawned imperatively)
- NavigationMenu (bar + Viewport + Sub popups)
- Card (outer for both `default` and `inset` variants)
- Tabs (capsule indicator uses `solidSurface(4)`)
- Code block (outer gray frame + inner code body)
- ComponentPreview docs frame (outer gray frame)
- Table + DataTable (outer; same Card-inset pattern — bg-muted frame + body cells `bg-surface-3 dark:bg-surface-1`)
- PreviewCard (popup, exposes `level`/`shadowLevel`)
- Toolbar (`default` variant exposes `level`/`shadowLevel`; `outline` and `ghost` variants unchanged)
- Tree (`filled` and `outline` variants migrated; `default` variant unchanged)
- Breadcrumbs (BreadcrumbList outer + BreadcrumbPage current-page pill)

### Standardized "flat-card" defaults

Card, Table, DataTable, code-block, and ComponentPreview all default to `solidSurface(3, 1)` — surface-3 bg + 1px rim only, no drop shadow. They're embedded containers (not floating popups), so they read as "lifted off the page just enough to define an edge." Documented in [surfaces.mdx — default levels](content/docs/getting-started/surfaces.mdx).

### Mode-asymmetric inset patterns (extended)

In addition to Command and Card inset, the **Table redesign** now also uses this pattern:

- Table outer: `bg-muted` + `solidSurface(3, 1)` — gray frame with rim
- Table body cells: `bg-surface-3 dark:bg-surface-1` — surface-3 (pure white) in light, surface-1 (page color) in dark
- Header cells stay `bg-muted` (match the outer frame, opaque for sticky scrolling)
- Footer cells stay `bg-muted` (match the outer)
- Body card gets rounded bottom corners via Viewport `rounded-lg` clipping against the outer; top is flat (sticky header bottom — known limitation, see "Open / Visual regression sweep")

### Table polish (this session)

- **`p-1 pt-0` outer padding** — `pt-0` because TableHead's `py-2` already provides the header's top breathing room; `has-[tfoot]:pb-0` mirrors the same for footers when present (footer's `py-2` covers it). Outer keeps `pb-1` when no footer.
- **Header tick separators** — short 16px-tall `::after` pseudo on each `<th>` (`bg-border`, vertically centered, right-edge), `last:after:hidden` on the rightmost cell. Replaces full-height borders with subtle dividers.
- **Sortable header redesign** (in `data-table.tsx`):
  - Removed `hover:bg-(--surface-hover)` — now uses `hover:text-foreground` instead (text brightens from muted to full foreground on hover, `transition-colors` for smooth easing).
  - Sort icon pinned to right edge via a `flex-1` wrapper around the children — icon always at the cell's right edge regardless of column `align`.
- **Selected row specificity fix** — `[[data-state=selected]_&]:bg-(--surface-selected)!` (Tailwind important) so it wins against the dark-mode body bg-surface-1, which would otherwise out-specify it.
- **DataTable's inner Table** — when DataTable wraps a Table via `DataTableContent`, the inner Table's elevation is suppressed (`bg-transparent shadow-none ring-0 rounded-none`) so only the DataTable wrapper carries the rim. Avoids double-rim artifact.

### Mode-asymmetric inset patterns

- **Command** outer uses `bg-muted` (gray frame), inner `CommandContent` uses `bg-surface-3 dark:bg-surface-1`. Light: lifted white card inside gray strip. Dark: cutout to page color. Each mode gets strong contrast.
- **Card** `inset` variant: outer uses `bg-muted` + `solidSurface(3, 3)` (gray frame with shadow + rim). Inner `CardContent` uses `solidSurface(3)` — looks like a Default Card sitting in a gray tray.

### State migrations

`bg-accent/N` → `bg-(--surface-hover)` / `bg-(--surface-selected)` for list-style hovers and selected indicators:

- All popup items (Dropdown, Context, Menubar, Select, Combobox, Command, Autocomplete) — `data-highlighted:bg-(--surface-hover)`
- NavigationMenu trigger / sub-trigger / link — `hover:bg-(--surface-hover)`, `data-[popup-open]:bg-(--surface-hover)` (collapsed to same as hover to avoid the lightness-jump artifact)
- Toolbar link, DataTable column-header sort button
- SidebarMenuButton — `hover:bg-(--surface-hover)`, `active:bg-(--surface-selected)`, `data-[state=open]:bg-(--surface-selected)`
- SidebarMenuSubButton — same set + `data-[active=true]:bg-(--surface-selected)` for current-page indicator
- SidebarMenuAction / SidebarMenuSubAction — small action icons inside sidebar items
- Tree node — `hover:bg-(--surface-hover)` and `isSelected ? bg-(--surface-selected)`
- Table — row hover `bg-(--surface-hover)`, row selected `bg-(--surface-selected)`
- Examples: sheet/sheet-basic, sheet/sheet-positions, base-drawer/base-drawer-side, popover/popover-animated, drawer/drawer-music-player, navigation-menu/navigation-menu-custom-styled-dropdown

### Surface ladder values

- Light surface-1 at `oklch(0.97)` for visible page tint vs the white surface-3+ above.
- Dark surfaces stepped through L 0.205–0.402 with chroma 0.004 at hue `--neutral-hue` (275).
- Light surface-3 through surface-8 are pure white (`oklch(1 0 0)`); shadow alone carries elevation here.

### Form-field bg — `default` / `elevated` variants

Form fields take a `variant="default" | "elevated"` prop on Input, Textarea, NumberField input, InputGroup, OTP slot (both `InputOTPSlot` and `OTPFieldInput`), Combobox input + chips, Autocomplete input, Checkbox, Radio, Switch.

Two tokens:

```css
--input:          var(--surface-3);
   /* default opaque — "clean lifted card" look. Pure white light / surface-3 dark. */
--input-elevated: light-dark(oklch(0 0 0 / 0.08), oklch(1 0 0 / 0.15));
   /* elevated translucent overlay — adapts to substrate. Same family as
      --surface-hover/--surface-selected but stronger (8% / 15%). */
```

Why both: a single token can't satisfy every context. On the page (surface-1), opaque white feels lifted and clean. On a Card / Dialog (both surface-3 / surface-5 = white in light), opaque white is invisible against its parent — the translucent overlay is needed. The variant prop lets the caller choose. Same pattern HeroUI uses.

Migration notes:

- Previous session had `--input` translucent in light; reverted to opaque (= `var(--surface-3)`) and added `--input-elevated` for the translucent value. Variant names match the token suffix (e.g., `variant="elevated"` → `bg-input-elevated`).
- Form-field components dropped manual `dark:bg-input/N` overrides and `shadow-xs` (form fields aren't lifted, no drop shadow needed).

Non-form usages of `bg-input` (where it was being used as a "fixed gray surface") migrated earlier in the session:

- base-drawer drag handle → `bg-muted-foreground/30`
- base-drawer switch unchecked track → `bg-muted` (now also gets the form-field variant treatment)
- timeline pending node → `bg-muted`

Cropper's `border-input/60` → `border-border` (semantic correctness — those were border colors).

Dark-mode-only usages of `dark:bg-input/N` (button outline, select trigger, number-field increment/decrement, radio-group hover) keep working — they leverage the dark value via Tailwind's opacity modifier, which composites to similar visual on dark surfaces.

### Misc

- All values converted from hex to OKLCH format.
- Hover/selected lightness-jump bug fix on NavigationMenu trigger (and sub-trigger) — `data-[popup-open]` now uses `--surface-hover` (same as hover) instead of `--surface-selected`, eliminating the perceived hue shift when the popup opens.
