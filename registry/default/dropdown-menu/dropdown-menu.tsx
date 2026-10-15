"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckIcon,
  ChevronRightIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  POPUP_SEARCH_CLEAR,
  POPUP_SEARCH_FIELD,
  POPUP_SEARCH_ICON,
  POPUP_SEARCH_INPUT,
  POPUP_SEARCH_MENU_FIELD,
} from "@/registry/default/lib/popup-search";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import {
  SwitchVisual,
  type SwitchVisualProps,
} from "@/registry/default/switch/switch";

// Shared shell for checkbox and radio items. Padding matches the plain menu
// item so labels line up across every item type; the indicator lives in a
// reserved right-hand column so toggling never shifts the label.
const toggleItemClasses =
  "group/switch data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground grid cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// The check draws itself in. `pathLength` restates the path as 1 unit
// long, so the dash values are fractions of the stroke and survive a HugeIcons
// reshape. Deriving the icon array is the only way to reach the path.
const checkIcon = CheckIcon.map(([tag, attrs]) => [
  tag,
  { ...attrs, pathLength: 1 },
]) as typeof CheckIcon;

const checkmarkClasses =
  "[&_path]:ease-out-expo [&_path]:transition-[stroke-dashoffset] [&_path]:duration-150 [&_path]:[stroke-dasharray:1] in-data-checked:[&_path]:[stroke-dashoffset:0] in-data-unchecked:[&_path]:[stroke-dashoffset:1] motion-reduce:[&_path]:transition-none" +
  // Fully undrawn, the dash still ends exactly at the path's start: a
  // zero-length piece whose round cap shows as a dot on high-density screens.
  // Fading the unchecked mark out, as Checkbox does, removes it.
  " transition-opacity duration-150 ease-out in-data-unchecked:opacity-0 motion-reduce:transition-none";

function DropdownMenu<Payload = unknown>({
  ...props
}: BaseMenu.Root.Props<Payload>) {
  return <BaseMenu.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof BaseMenu.Portal>) {
  return <BaseMenu.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof BaseMenu.Trigger>) {
  return <BaseMenu.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuPositioner({
  ...props
}: React.ComponentProps<typeof BaseMenu.Positioner>) {
  return (
    <BaseMenu.Positioner data-slot="dropdown-menu-positioner" {...props} />
  );
}

function DropdownMenuPopup({
  className,
  level = 3,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the menu reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <BaseMenu.Popup
      data-slot="dropdown-menu-popup"
      data-level={level}
      className={cn(
        "text-popover-foreground relative max-h-(--available-height) max-w-(--available-width) min-w-[12rem] overflow-hidden rounded-xl outline-none",
        solidSurface(level, shadowLevel),
        "origin-(--transform-origin) transition-[scale,opacity] duration-100 ease-(--ease-out-expo)",
        "data-starting-style:scale-95 data-starting-style:opacity-0",
        "data-ending-style:scale-95 data-ending-style:opacity-0",
        // Own compositor layer while mounted. The scale stretches the popup
        // downward from an origin just above it, so the top edge moves
        // ~0.2px and the bottom ~7px; every row lands on a different
        // sub-pixel offset, which on an evenly spaced stack of identical
        // text reads as a ripple. Promoted, the rows raster once.
        "will-change-transform",
        "motion-reduce:transition-none motion-reduce:will-change-auto",
        // Only 'trigger-change', which fires once a detached-trigger swap has
        // settled. The others must animate: Base UI waits on this transition
        // before unmounting, so suppressing 'dismiss' means no exit at all,
        // and 'click' is inferred from `event.detail === 0`, which every
        // right-click matches.
        "data-[instant=trigger-change]:transition-none",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Crossfades content when a detached trigger swaps what the menu shows. Its
 * presence also switches Base UI's positioner from `transform` to `top`/`left`
 * so the popup can grow from the right edge, so leave it out of menus that
 * never swap content.
 */
function DropdownMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Viewport>) {
  return (
    <BaseMenu.Viewport
      data-slot="dropdown-menu-viewport"
      className={cn(
        // `h-full` and the cap do different jobs; both are load-bearing. At
        // rest --popup-height is `auto`, so the percentage is indefinite and
        // only the cap bounds the viewport, which is what engages the
        // overflow-y below. Mid-swap it is a definite px that transitions,
        // and the percentage tracks it. Without that the viewport snaps to
        // the incoming content's height on frame one, because Base UI takes
        // the outgoing content out of flow with position:absolute, and
        // overflow-clip cuts its extra rows instead of letting them fade.
        // No `max-w`: `w-full` resolves against the popup's already-capped
        // content box, so the width bound is inherited for free.
        "relative h-full max-h-(--available-height) w-full overflow-clip p-1 [--viewport-padding:0.25rem]",
        // A column down to Base UI's content wrapper, so a filterable menu's
        // list shrinks to fit a short screen (as in Combobox and Select). Not
        // while content swaps: the viewport's height animates then, and letting
        // the new content shrink with it would collapse its separators.
        "flex flex-col *:data-current:flex *:data-current:flex-col not-data-transitioning:*:data-current:min-h-0",
        "not-data-transitioning:overflow-y-auto",
        // Content width, only while content swaps between detached triggers,
        // so it doesn't re-flow as the popup morphs. Base UI also pins
        // --popup-width during the entrance, to the content's natural width,
        // which a width set on the popup or a dropped padding would contradict.
        "data-transitioning:**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
        "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
        // Non-directional crossfade, matching Popover: the two halves
        // dissolve in place and both recede to 0.96, so the swap reads
        // the same whichever trigger you came from and the popup's own
        // width/height morph carries the movement.
        "**:data-current:scale-100 **:data-current:opacity-100",
        "**:data-previous:scale-100 **:data-previous:opacity-100",
        "**:data-current:transition-[scale,opacity] **:data-current:duration-150 **:data-current:ease-[cubic-bezier(0.22,1,0.36,1)]",
        "**:data-previous:transition-[scale,opacity] **:data-previous:duration-150 **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
        "**:data-current:data-starting-style:scale-[0.96] **:data-current:data-starting-style:opacity-0",
        "**:data-previous:data-ending-style:scale-[0.96] **:data-previous:data-ending-style:opacity-0",
        // Value-matched to the popup's guard so one policy governs the
        // subtree. Targets the content: the viewport has no transitions of
        // its own and transition-property does not inherit.
        "[[data-instant=trigger-change]_&_[data-current]]:transition-none [[data-instant=trigger-change]_&_[data-previous]]:transition-none",
        "motion-reduce:**:data-current:transition-none motion-reduce:**:data-previous:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  positionerClassName,
  viewportClassName,
  children,
  sideOffset = 4,
  align = "center",
  side = "bottom",
  ...props
}: React.ComponentProps<typeof DropdownMenuPopup> & {
  /** Classes for the positioner (the element Base UI moves into place), merged last. */
  positionerClassName?: string;
  /**
   * Classes for the padded box around the items, e.g. `p-0` for a filterable
   * menu, whose field and list bring their own spacing.
   */
  viewportClassName?: string;
  align?: BaseMenu.Positioner.Props["align"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  side?: BaseMenu.Positioner.Props["side"];
}) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner
        className={cn(
          "z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none",
          positionerClassName,
        )}
        sideOffset={sideOffset}
        align={align}
        side={side}
      >
        <DropdownMenuPopup
          data-slot="dropdown-menu-content"
          className={cn(
            // Base UI derives --popup-width by measuring at `width:auto`, so two
            // menus that both sit on this floor morph position and height but not
            // width. That is the accepted trade: menus narrower than 12rem read
            // as cramped, and width is the least visible of the three.
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "transition-[width,height,scale,opacity] duration-[150ms,150ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            className,
          )}
          {...props}
        >
          <DropdownMenuViewport className={viewportClassName}>
            {children}
          </DropdownMenuViewport>
        </DropdownMenuPopup>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof BaseMenu.Group>) {
  return <BaseMenu.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof BaseMenu.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <BaseMenu.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        "data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive-foreground data-[variant=destructive]:*:[svg]:text-destructive! data-highlighted:data-[variant=destructive]:*:[svg]:text-destructive-foreground! [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Separator>) {
  return (
    <BaseMenu.Separator
      data-slot="dropdown-menu-separator"
      // Inset to the item label, not the popup edge: mx-2.5 clears the
      // viewport's p-1 plus the item's px-2.5, so the rule starts where the
      // text does instead of running into the popup's rounded corners.
      className={cn(
        "bg-border mx-2.5 my-1 h-px",
        // While filtering, Base UI hides emptied groups. Drop a rule that
        // would follow one, or that has nothing left to separate below it.
        "[&:not(:has(~:not([hidden]):not([role=separator])))]:hidden [[hidden]+&]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuGroupLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.GroupLabel
      data-slot="dropdown-menu-group-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  indicator = "check",
  switchColor = "primary",
  switchShape = "circle",
  switchSize = "xs",
  switchMotion = "default",
  ...props
}: React.ComponentProps<typeof BaseMenu.CheckboxItem> & {
  inset?: boolean;
  /** Which indicator sits in the right-hand column. `"switch"` is visual only — the item keeps the `menuitemcheckbox` role. */
  indicator?: "check" | "switch";
  /** Checked track colour, when `indicator="switch"`. */
  switchColor?: SwitchVisualProps["color"];
  /** Thumb silhouette, when `indicator="switch"`. */
  switchShape?: SwitchVisualProps["shape"];
  /** Thumb size, when `indicator="switch"`. Defaults to `xs`, which matches the row's text. */
  switchSize?: SwitchVisualProps["size"];
  /** How the thumb travels, when `indicator="switch"`. */
  switchMotion?: SwitchVisualProps["motion"];
}) {
  return (
    <BaseMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      data-indicator={indicator}
      className={cn(
        toggleItemClasses,
        indicator === "switch"
          ? "grid-cols-[1fr_auto] gap-3"
          : "grid-cols-[1fr_1rem] gap-2",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      {indicator === "switch" ? (
        // Visual only: the row carries the role and the click target, so a real
        // Switch here would nest a focusable control inside a menuitemcheckbox.
        // Base UI's indicator supplies the aria-hidden.
        <SwitchVisual
          color={switchColor}
          shape={switchShape}
          size={switchSize}
          motion={switchMotion}
          className="col-start-2"
          render={<BaseMenu.CheckboxItemIndicator keepMounted />}
        />
      ) : (
        <BaseMenu.CheckboxItemIndicator
          keepMounted
          className="col-start-2 flex items-center justify-center"
        >
          <HugeiconsIcon
            icon={checkIcon}
            strokeWidth={2.5}
            className={cn("size-4", checkmarkClasses)}
          />
        </BaseMenu.CheckboxItemIndicator>
      )}
    </BaseMenu.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioGroup>) {
  return (
    <BaseMenu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset || undefined}
      className={cn(toggleItemClasses, "grid-cols-[1fr_1rem] gap-2", className)}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      <BaseMenu.RadioItemIndicator
        keepMounted
        className="col-start-2 flex items-center justify-center"
      >
        <HugeiconsIcon
          icon={checkIcon}
          strokeWidth={2.5}
          className={cn("size-4", checkmarkClasses)}
        />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  );
}

function DropdownMenuLinkItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.LinkItem> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.LinkItem
      data-slot="dropdown-menu-link-item"
      data-inset={inset || undefined}
      className={cn(
        "data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm no-underline outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof BaseMenu.SubmenuRoot>) {
  return <BaseMenu.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  delay = 0,
  closeDelay = 0,
  ...props
}: React.ComponentProps<typeof BaseMenu.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        "data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground data-popup-open:bg-surface-hover data-popup-open:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ChevronRightIcon}
        className="ml-auto size-4"
        strokeWidth={2}
      />
    </BaseMenu.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  positionerClassName,
  viewportClassName,
  children,
  // 8px, not 0: the positioner anchors to the sub-trigger, which sits 4px
  // inside the parent popup because of its p-1. A 0 offset therefore overlaps
  // the parent's edge by 4px; 8 leaves a 4px gap, matching Menubar.
  sideOffset = 8,
  align = "start",
  alignOffset,
  level = 5,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  /** Classes for the positioner (the element Base UI moves into place), merged last. */
  positionerClassName?: string;
  align?: BaseMenu.Positioner.Props["align"];
  alignOffset?: BaseMenu.Positioner.Props["alignOffset"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the submenu bg (1-8). Defaults to 5 — one tier above the parent menu's default of 3. Bump higher when nesting inside a Dialog. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the submenu reads the same dropdown weight as its parent. */
  shadowLevel?: SurfaceLevel;
  /**
   * Classes for the padded box around the items, e.g. `p-0` for a filterable
   * menu, whose field and list bring their own spacing.
   */
  viewportClassName?: string;
}) {
  // Default alignOffset to -5 when align is not "center" to line up first item with trigger
  const defaultAlignOffset = align !== "center" ? -4 : undefined;

  return (
    <DropdownMenuPortal>
      {/* Base UI re-places a submenu a frame after its parent moves, so it
          steps behind a gliding menu. The same glide as the parent smooths
          that out. */}
      <DropdownMenuPositioner
        className={cn(
          "z-50 max-h-(--available-height) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none",
          positionerClassName,
        )}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset ?? defaultAlignOffset}
      >
        <DropdownMenuPopup
          data-slot="dropdown-menu-content"
          level={level}
          shadowLevel={shadowLevel}
          className={className}
          {...props}
        >
          {/* The popup above is capped at --available-height and clips, so the
            scroll container has to live here or a tall submenu silently
            truncates. The main popups get this from Menu.Viewport; a
            submenu has none, so it is spelled out. */}
          <div
            className={cn(
              "flex max-h-(--available-height) flex-col overflow-x-hidden overflow-y-auto p-1",
              viewportClassName,
            )}
          >
            {children}
          </div>
        </DropdownMenuPopup>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

// Filtering (Base UI preview API). Wrap `DropdownMenu` or `DropdownMenuSub` in
// the provider, then put a `DropdownMenuInput` above a `DropdownMenuList`.
function DropdownMenuFilter({
  autoHighlight = true,
  ...props
}: BaseMenu.FilterProvider.Props) {
  // Highlight the top match while typing, so Enter runs it.
  return <BaseMenu.FilterProvider autoHighlight={autoHighlight} {...props} />;
}

function DropdownMenuInput({
  className,
  inputClassName,
  showClear = true,
  clearLabel,
  "aria-label": ariaLabel = "Search",
  ...props
}: BaseMenu.Input.Props & {
  /** Class applied to the inner `<input>`. `className` styles the field. */
  inputClassName?: string;
  /** Show a clear button while the query has text. */
  showClear?: boolean;
  /** Accessible name of the clear button. Defaults to "Clear search". */
  clearLabel?: string;
}) {
  return (
    <div
      data-slot="dropdown-menu-input-group"
      // Above the list, outside its scroll, as in Base UI's filter demo. An
      // item's height (32px), inset like the items; the gap below it is the
      // list's own padding, so rows scroll right up to the field.
      className={cn(POPUP_SEARCH_FIELD, POPUP_SEARCH_MENU_FIELD, className)}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        strokeWidth={2}
        className={POPUP_SEARCH_ICON}
      />
      <BaseMenu.Input
        data-slot="dropdown-menu-input"
        className={cn(POPUP_SEARCH_INPUT, inputClassName)}
        // The placeholder isn't a name; pass a specific label when you can.
        aria-label={ariaLabel}
        {...props}
      />
      {showClear && <DropdownMenuClear aria-label={clearLabel} />}
    </div>
  );
}

function DropdownMenuClear({
  className,
  children,
  "aria-label": ariaLabel = "Clear search",
  ...props
}: BaseMenu.Clear.Props) {
  return (
    <BaseMenu.Clear
      data-slot="dropdown-menu-clear"
      aria-label={ariaLabel}
      className={cn(POPUP_SEARCH_CLEAR, className)}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
      )}
    </BaseMenu.Clear>
  );
}

function DropdownMenuList({
  className,
  ...props
}: Omit<BaseMenu.List.Props, "className"> & {
  /** Styles the scroll area around the list, e.g. to change its height cap. */
  className?: string;
}) {
  return (
    // The list scrolls on its own so the field above it stays put, with the
    // same edge fade as Combobox's list. Its padding sits inside the scroll,
    // as in Combobox, so rows scroll to the popup's edges and up under the
    // field. Filterable menus drop their container's padding to match. Capped
    // at 20rem; on a short screen it shrinks as a flex item to fit the popup,
    // as Combobox's and Select's lists do.
    <ScrollArea fadeEdges="y" className={cn("max-h-80", className)}>
      <BaseMenu.List
        data-slot="dropdown-menu-list"
        className="p-1"
        {...props}
      />
    </ScrollArea>
  );
}

function DropdownMenuEmpty({ className, ...props }: BaseMenu.Empty.Props) {
  return (
    <BaseMenu.Empty
      data-slot="dropdown-menu-empty"
      // Lines up with the item labels. Sits 10px from the field and 10px from
      // the bottom: the list's 8px of padding still renders below it.
      className={cn(
        "text-muted-foreground shrink-0 px-3.5 pt-2.5 pb-0.5 text-sm",
        className,
      )}
      {...props}
    />
  );
}

const useDropdownMenuFilter = BaseMenu.useFilter;

const createDropdownMenuHandle = BaseMenu.createHandle;

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuViewport,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuFilter,
  DropdownMenuInput,
  DropdownMenuClear,
  DropdownMenuList,
  DropdownMenuEmpty,
  useDropdownMenuFilter,
  createDropdownMenuHandle,
};
