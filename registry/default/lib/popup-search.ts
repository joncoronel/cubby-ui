// Shared classes for popup list rows and the search field above them, so
// menus, Select, Combobox, Autocomplete and Filters can't drift. The field
// matches the rows (gutter, radius, label inset, height).

/** A row: 32px, 40px on touch. Padding overrides need a `pointer-coarse:py-*` twin. */
export const POPUP_ITEM =
  "rounded-md px-2.5 py-1.5 text-sm pointer-coarse:py-2.5";

/** The surface band over the side and top gutters; the list supplies the gap below. */
export const POPUP_SEARCH_BAND = "bg-(--popup-surface) px-1 pt-1";

/**
 * The field: the outline field's fill and edge (`--outline`, `--outline-border`),
 * not the filled tint, since a filled field above a highlighted item reads as
 * a second highlight. The inset ring takes no room, so the icon stays aligned.
 * No focus ring: the field holds focus the whole time the popup is open.
 */
export const POPUP_SEARCH_FIELD =
  "flex h-8 items-center gap-2 rounded-md bg-(--outline) px-2.5 inset-ring inset-ring-(--outline-border) pointer-coarse:h-10";

/** The `<input>`. 16px on touch screens and below `sm`, so iOS Safari doesn't zoom on focus. */
export const POPUP_SEARCH_INPUT =
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-full min-w-0 flex-1 bg-transparent text-base outline-none sm:not-pointer-coarse:text-sm";

/**
 * A clear button inside the field: 24px to look at, with a 40px hit area that
 * reaches the input across the gap without covering it.
 */
export const POPUP_SEARCH_CLEAR =
  "text-muted-foreground hover:text-foreground relative -mr-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-100 outline-none focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-solid focus-visible:outline-ring after:absolute after:-inset-2";

/**
 * A menu's search field above its list: inset 4px, never squeezed. The
 * list's own padding is the gap, so rows scroll under the field.
 */
export const POPUP_SEARCH_MENU_FIELD = "mx-1 mt-1 shrink-0";

/** The search icon's classes. */
export const POPUP_SEARCH_ICON = "text-muted-foreground size-4 shrink-0";
