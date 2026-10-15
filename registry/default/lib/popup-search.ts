// Shared classes for the search field at the top of a popup list. It serves
// Combobox's `popup` input, the Filters add menu, and the filterable menus,
// with one look for all of them so they can't drift apart.
//
// It is drawn like the list's own rows: the same 4px gutter, the item radius
// and the item's 10px label inset, so the search icon starts where item labels
// do. Each component sets the height to match its item height.

/**
 * The surface-colored band around the field. Covers the side and top gutters;
 * the list below supplies the 4px gap under the field.
 */
export const POPUP_SEARCH_BAND = "bg-(--popup-surface) px-1 pt-1";

/**
 * The field itself. Outlined, never filled: a highlighted item is a filled
 * box of the same size, so a filled field right above one reads as a second
 * highlight. The ring takes no room, so the icon still lines up with the item
 * labels. No focus ring: the field has focus for as long as the popup is
 * open, so a ring would say nothing.
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
 * A menu's search field, placed above its list: an item's height, inset 4px
 * like the items, and never squeezed by the list in the popup's column. The
 * gap below it is the list's own padding, so rows scroll up under the field.
 */
export const POPUP_SEARCH_MENU_FIELD = "mx-1 mt-1 h-8 shrink-0";

/** The search icon's classes. */
export const POPUP_SEARCH_ICON = "text-muted-foreground size-4 shrink-0";
