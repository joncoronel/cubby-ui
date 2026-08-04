"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
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

function ContextMenu({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Root>) {
  return <BaseContextMenu.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Trigger>) {
  return (
    <BaseContextMenu.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Group>) {
  return <BaseContextMenu.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Portal>) {
  return <BaseContextMenu.Portal data-slot="context-menu-portal" {...props} />;
}

function ContextMenuPositioner({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Positioner>) {
  return (
    <BaseContextMenu.Positioner
      data-slot="context-menu-positioner"
      {...props}
    />
  );
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.RadioGroup>) {
  return (
    <BaseContextMenu.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  sideOffset = 4,
  align = "start",
  level = 3,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Popup> & {
  align?: BaseContextMenu.Positioner.Props["align"];
  sideOffset?: BaseContextMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the menu reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositioner
        className="max-h-(--available-height) max-w-(--available-width)"
        align={align}
        sideOffset={sideOffset}
      >
        <BaseContextMenu.Popup
          data-slot="context-menu-content"
          data-level={level}
          className={cn(
            // No Menu.Viewport here (ContextMenu has no trigger-swap morph to run
            // one for), so the popup is its own scroll container: capped at
            // --available-height, clipping on x for the rounded corners and
            // scrolling on y. Without the cap a tall menu runs off screen.
            "text-popover-foreground relative z-50 max-h-(--available-height) max-w-(--available-width) min-w-[12rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl p-1 outline-none",
            // Modern enter/exit — scale + fade from the transform origin, matching
            // popover/dropdown-menu (replaces the legacy animate-in/zoom/slide classes)
            "ease-out-expo transition-[scale,opacity] duration-100",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // No data-instant guard at all, deliberately. 'click' is inferred
            // from `event.detail === 0`, which every right-click matches, so
            // suppressing it would kill the enter animation on every open.
            // 'dismiss' must animate, or Base UI has nothing to wait on and the
            // popup unmounts with no exit. And 'group' / 'trigger-change'
            // cannot fire here: the first needs a Menubar parent, the second
            // needs detached triggers sharing one root.
            "motion-reduce:transition-none",
            solidSurface(level, shadowLevel),
            className,
          )}
          {...props}
        />
      </ContextMenuPositioner>
    </ContextMenuPortal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <BaseContextMenu.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        "data-highlighted:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/20 data-[variant=destructive]:data-highlighted:text-destructive-foreground data-[variant=destructive]:*:[svg]:text-destructive! data-highlighted:data-[variant=destructive]:*:[svg]:text-destructive-foreground! [&_svg:not([class*='text-'])]:text-muted-foreground data-highlighted:bg-surface-hover relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuLinkItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.LinkItem> & {
  inset?: boolean;
}) {
  return (
    <BaseContextMenu.LinkItem
      data-slot="context-menu-link-item"
      data-inset={inset || undefined}
      className={cn(
        "data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground data-highlighted:bg-surface-hover relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm no-underline outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
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
}: React.ComponentProps<typeof BaseContextMenu.CheckboxItem> & {
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
    <BaseContextMenu.CheckboxItem
      data-slot="context-menu-checkbox-item"
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
          render={<BaseContextMenu.CheckboxItemIndicator keepMounted />}
        />
      ) : (
        <BaseContextMenu.CheckboxItemIndicator
          keepMounted
          className="col-start-2 flex items-center justify-center"
        >
          <HugeiconsIcon
            icon={tickIcon}
            strokeWidth={2.5}
            className={cn("size-4", checkmarkClasses)}
          />
        </BaseContextMenu.CheckboxItemIndicator>
      )}
    </BaseContextMenu.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.RadioItem> & {
  inset?: boolean;
}) {
  return (
    <BaseContextMenu.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset || undefined}
      className={cn(toggleItemClasses, "grid-cols-[1fr_1rem] gap-2", className)}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      <BaseContextMenu.RadioItemIndicator
        keepMounted
        className="col-start-2 flex items-center justify-center"
      >
        <HugeiconsIcon
          icon={tickIcon}
          strokeWidth={2.5}
          className={cn("size-4", checkmarkClasses)}
        />
      </BaseContextMenu.RadioItemIndicator>
    </BaseContextMenu.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean;
}) {
  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuGroupLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <BaseContextMenu.GroupLabel
      data-slot="context-menu-group-label"
      data-inset={inset || undefined}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Separator>) {
  return (
    <BaseContextMenu.Separator
      data-slot="context-menu-separator"
      // Inset to the item label, not the popup edge: mx-2.5 clears the popup's
      // p-1 plus the item's px-2.5, so the rule starts where the text does
      // instead of running into the popup's rounded corners.
      className={cn("bg-border mx-2.5 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof BaseContextMenu.SubmenuRoot>) {
  return (
    <BaseContextMenu.SubmenuRoot data-slot="context-menu-sub" {...props} />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  delay = 0,
  closeDelay = 0,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <BaseContextMenu.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        "data-highlighted:text-accent-foreground data-popup-open:text-accent-foreground data-highlighted:bg-surface-hover data-popup-open:bg-surface-hover flex cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-inset:pl-8",
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
    </BaseContextMenu.SubmenuTrigger>
  );
}

function ContextMenuSubContent({
  className,
  // 8px, not 0: the positioner anchors to the sub-trigger, which sits 4px
  // inside the parent popup because of its p-1. A 0 offset therefore overlaps
  // the parent's edge by 4px; 8 leaves a 4px gap, matching Menubar.
  sideOffset = 8,
  align = "start",
  level = 5,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseContextMenu.Popup> & {
  align?: BaseContextMenu.Positioner.Props["align"];
  sideOffset?: BaseContextMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the submenu bg (1-8). Defaults to 5 — one tier above the parent menu's default of 3. Bump higher when nesting inside a Dialog. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the submenu reads the same dropdown weight as its parent. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositioner
        className="max-h-(--available-height) max-w-(--available-width)"
        sideOffset={sideOffset}
        align={align}
      >
        <BaseContextMenu.Popup
          data-slot="context-menu-sub-content"
          data-level={level}
          className={cn(
            // No Menu.Viewport here (ContextMenu has no trigger-swap morph to run
            // one for), so the popup is its own scroll container: capped at
            // --available-height, clipping on x for the rounded corners and
            // scrolling on y. Without the cap a tall menu runs off screen.
            "text-popover-foreground relative z-50 max-h-(--available-height) max-w-(--available-width) min-w-[12rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl p-1 outline-none",
            // Modern enter/exit — scale + fade from the transform origin, matching
            // popover/dropdown-menu (replaces the legacy animate-in/zoom/slide classes)
            "ease-out-expo transition-[scale,opacity] duration-100",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // See ContextMenuContent for why there is no data-instant guard.
            "motion-reduce:transition-none",
            solidSurface(level, shadowLevel),
            className,
          )}
          {...props}
        />
      </ContextMenuPositioner>
    </ContextMenuPortal>
  );
}

export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuGroupLabel,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuPortal,
  ContextMenuPositioner,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
};
