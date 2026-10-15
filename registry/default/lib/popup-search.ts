// Shared classes for the search field at the top of a popup list. Combobox,
// the Filters add menu and the filterable menus share them so they can't drift.
// It matches the rows (4px gutter, item radius, 10px label inset) so the icon
// starts where item labels do. Each component sets the height.

/** The surface band over the side and top gutters; the list supplies the gap below. */
export const POPUP_SEARCH_BAND = "bg-(--popup-surface) px-1 pt-1";

/**
 * The field. Outlined, since a filled field above a highlighted item reads as
 * a second highlight; the inset ring takes no room, so the icon stays aligned.
 * No focus ring: the field holds focus the whole time the popup is open.
 */
export const POPUP_SEARCH_FIELD =
  "flex items-center gap-2 rounded-md px-2.5 inset-ring inset-ring-border";

/** The `<input>`. 16px below `md` so iOS Safari doesn't zoom on focus. */
export const POPUP_SEARCH_INPUT =
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-full min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm";

/**
 * A clear button inside the field: 24px to look at, with a 40px hit area that
 * reaches the input across the gap without covering it.
 */
export const POPUP_SEARCH_CLEAR =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring/70 relative -mr-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-100 outline-none focus-visible:ring-2 after:absolute after:-inset-2";

/**
 * A menu's search field above its list: an item's height, inset 4px, never
 * squeezed. The list's own padding is the gap, so rows scroll under the field.
 */
export const POPUP_SEARCH_MENU_FIELD = "mx-1 mt-1 h-8 shrink-0";

/** The search icon's classes. */
export const POPUP_SEARCH_ICON = "text-muted-foreground size-4 shrink-0";
