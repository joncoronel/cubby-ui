"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  SwitchVisual,
  type SwitchVisualProps,
} from "@/registry/default/switch/switch";

// Shared shell for checkbox and radio items. Padding matches the plain menu
// item so labels line up across every item type; the indicator lives in a
// reserved right-hand column so toggling never shifts the label.
const toggleItemClasses =
  "group/switch data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground grid cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// The tick draws itself in on check. `pathLength` restates the path as 1 unit
// long, so the dash values below are fractions of the stroke rather than a
// hardcoded length — a future HugeIcons revision can reshape Tick02Icon
// without stranding the number. HugeiconsIcon builds its paths from the icon
// array, so this is the only way in; the classes then reach the rendered path
// through the svg it returns.
const tickIcon = Tick02Icon.map(([tag, attrs]) => [
  tag,
  { ...attrs, pathLength: 1 },
]) as typeof Tick02Icon;

const checkmarkClasses =
  "[&_path]:ease-out-expo [&_path]:transition-[stroke-dashoffset] [&_path]:duration-150 [&_path]:[stroke-dasharray:1] in-data-checked:[&_path]:[stroke-dashoffset:0] in-data-unchecked:[&_path]:[stroke-dashoffset:1] motion-reduce:[&_path]:transition-none";

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

function DropdownMenuContent({
  className,
  children,
  sideOffset = 4,
  align = "center",
  side = "bottom",
  level = 3,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  align?: BaseMenu.Positioner.Props["align"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  side?: BaseMenu.Positioner.Props["side"];
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the menu reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none motion-reduce:transition-none"
        sideOffset={sideOffset}
        align={align}
        side={side}
      >
        <BaseMenu.Popup
          data-slot="dropdown-menu-content"
          data-level={level}
          className={cn(
            // Base UI derives --popup-width by measuring at `width:auto`, so two
            // menus that both sit on this floor morph position and height but not
            // width. That is the accepted trade: menus narrower than 12rem read
            // as cramped, and width is the least visible of the three.
            "text-popover-foreground relative max-h-(--available-height) max-w-(--available-width) min-w-[12rem] overflow-hidden rounded-xl outline-none",
            solidSurface(level, shadowLevel),
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "origin-(--transform-origin) transition-[width,height,scale,opacity] duration-[150ms,150ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // Own compositor layer while mounted. The origin sits just above
            // the popup, so the 0.95 -> 1 scale stretches it downward: the top
            // edge moves ~0.2px while the bottom moves ~7px. Every row lands on
            // a different sub-pixel offset, and because menu rows are an evenly
            // spaced stack of identical text, that differential reads as a
            // ripple down the list. Promoted, the rows raster once and move
            // together. (Popover shears more, ~7.6px, but its content is
            // irregular so there is no rhythm for the eye to lock onto.)
            "will-change-transform",
            "motion-reduce:transition-none motion-reduce:will-change-auto",
            // 'trigger-change' fires once a detached-trigger swap has settled,
            // so a later scroll or resize does not re-animate the whole
            // journey. The other instants are deliberately left alone:
            // 'dismiss' must still animate (Base UI waits on this transition
            // before unmounting, so killing it means no exit at all), 'click'
            // is inferred from `event.detail === 0` and so also matches
            // right-clicks and programmatic .click(), and 'group' only ever
            // fires for a menu parented to a Menubar.
            "data-[instant=trigger-change]:transition-none",
            className,
          )}
          {...props}
        >
          <BaseMenu.Viewport
            data-slot="dropdown-menu-viewport"
            className={cn(
              // Bounded here rather than inherited from the popup: `h-full`
              // is `height: 100%` against a parent whose specified height is
              // `--popup-height`, the literal `auto` at rest, so the
              // percentage stays indefinite and the viewport grows to its
              // content. scrollHeight then always equals clientHeight and the
              // overflow-y below can never engage. Capping the viewport gives
              // it a definite bound and leaves the popup's height free to
              // animate for the morph.
              // `max-w` is deliberately absent: `w-full` resolves against the
              // popup's already-capped content box, so the width bound is
              // inherited for free. Only the height needs restating here.
              "relative max-h-(--available-height) w-full overflow-clip p-1 [--viewport-padding:0.25rem]",
              "not-data-transitioning:overflow-y-auto",
              // Content width
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
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
              // Value-matched to the popup's own guard above, so one policy governs
              // the whole subtree. Targets the content, not the viewport: the
              // viewport has no transitions of its own and transition-property does
              // not inherit, so a rule here would be a no-op.
              "[[data-instant=trigger-change]_&_[data-current]]:transition-none [[data-instant=trigger-change]_&_[data-previous]]:transition-none",
              "motion-reduce:**:data-current:transition-none motion-reduce:**:data-previous:transition-none",
            )}
          >
            {children}
          </BaseMenu.Viewport>
        </BaseMenu.Popup>
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
      className={cn("bg-border mx-2.5 my-1 h-px", className)}
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
        // Visual only, and non-interactive: the row itself carries the role and
        // the click target, so nesting a real Switch here would put a focusable
        // control inside a menuitemcheckbox. Base UI's indicator supplies the
        // aria-hidden.
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
            icon={tickIcon}
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
          icon={tickIcon}
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
        "data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground data-popup-open:bg-surface-hover data-popup-open:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="ml-auto size-4"
        strokeWidth={2}
      />
    </BaseMenu.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
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
  align?: BaseMenu.Positioner.Props["align"];
  alignOffset?: BaseMenu.Positioner.Props["alignOffset"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the submenu bg (1-8). Defaults to 5 — one tier above the parent menu's default of 3. Bump higher when nesting inside a Dialog. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the submenu reads the same dropdown weight as its parent. */
  shadowLevel?: SurfaceLevel;
}) {
  // Default alignOffset to -5 when align is not "center" to line up first item with trigger
  const defaultAlignOffset = align !== "center" ? -4 : undefined;

  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner
        className="z-50 max-h-(--available-height) max-w-(--available-width)"
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset ?? defaultAlignOffset}
      >
        <BaseMenu.Popup
          data-slot="dropdown-menu-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative max-h-(--available-height) max-w-(--available-width) min-w-[12rem] overflow-hidden rounded-xl outline-none",
            solidSurface(level, shadowLevel),
            "ease-out-expo origin-(--transform-origin) transition-[transform,scale,opacity] duration-100",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          {/* The popup above is capped at --available-height and clips, so the
            scroll container has to live here or a tall submenu silently
            truncates. The main popups get this from Menu.Viewport; a
            submenu has none, so it is spelled out. */}
          <div className="max-h-(--available-height) overflow-x-hidden overflow-y-auto p-1">
            {children}
          </div>
        </BaseMenu.Popup>
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}

const createDropdownMenuHandle = BaseMenu.createHandle;

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
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
  createDropdownMenuHandle,
};
