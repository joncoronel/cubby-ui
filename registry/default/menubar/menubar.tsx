"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/default/button/button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import "./menubar.css";

// A shell, as in Button Group and Toolbar. The inset is two 1px transparent
// borders, one on the shell and one on each trigger, so plates sit 2px from
// the edge and from each other and snap alike at every display scale.
// Outline draws its line as an outline just outside the shell, the way
// elevated's shadow ring sits outside. A highlight glides to the hovered, focused, or open trigger's
// plate (menubar.css).
const menubarVariants = cva(
  [
    "relative isolate flex w-fit items-stretch rounded-(--menubar-radius) data-[orientation=vertical]:flex-col",
    "[--menubar-item-radius:max(0px,calc(var(--menubar-radius)-var(--menubar-border)-1px))]",
    // Label-color tints: hover 10%, press 14%
    "[--menubar-highlight:color-mix(in_oklab,currentColor_10%,transparent)] [--menubar-press:color-mix(in_oklab,currentColor_14%,transparent)]",
    "data-[orientation=horizontal]:h-(--menubar-h) data-[orientation=vertical]:min-w-(--menubar-h)",
    "data-disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        // The surface's inner rim is the 1px border, so it meets the shadow
        // ring as on other raised surfaces.
        elevated: cn(
          solidSurface(2, 2),
          "text-foreground shadow-(--surface-shadow-2) border border-(--surface-rim-color) [--menubar-border:1px]",
        ),
        outline:
          "bg-card text-foreground border border-transparent outline outline-border [--menubar-border:1px]",
        soft: "bg-secondary text-secondary-foreground border border-transparent [--menubar-border:1px]",
        ghost:
          "text-foreground border border-transparent [--menubar-border:1px]",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--menubar-h:--spacing(9)] sm:[--menubar-h:--spacing(8)] [--menubar-radius:calc(var(--radius)-2px)]",
        default:
          "[--menubar-h:--spacing(10)] sm:[--menubar-h:--spacing(9)] [--menubar-radius:var(--radius)]",
        lg: "[--menubar-h:--spacing(11)] sm:[--menubar-h:--spacing(10)] [--menubar-radius:calc(var(--radius)+2px)]",
      },
    },
    defaultVariants: {
      variant: "elevated",
      size: "default",
    },
  },
);

export type MenubarProps = BaseMenubar.Props &
  VariantProps<typeof menubarVariants> & {
    /** Glide a shared highlight between triggers. */
    highlight?: boolean;
  };

function Menubar({
  className,
  variant,
  size,
  highlight = true,
  children,
  ...props
}: MenubarProps) {
  return (
    <BaseMenubar
      data-slot="menubar"
      data-variant={variant ?? "elevated"}
      data-size={size ?? "default"}
      data-glide={highlight ? "" : undefined}
      className={cn(menubarVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {/* Last, so first-child selectors still match the first trigger. */}
      {highlight && <span aria-hidden data-slot="menubar-highlight" />}
    </BaseMenubar>
  );
}

function MenubarMenu(props: BaseMenu.Root.Props) {
  return <BaseMenu.Root data-slot="menubar-menu" {...props} />;
}

// A quiet Button: hover and the open menu paint the label tint. Menu triggers
// skip Button's press, as everywhere else.
const triggerClasses = cn(
  buttonVariants({ variant: "ghost", size: null }),
  "shrink-0 border border-transparent px-2.5 text-sm font-medium text-current hover:text-current data-popup-open:text-current",
  "[--btn-bg-hover:var(--menubar-highlight)] [--btn-bg-active:var(--menubar-press)]",
  // Box corners are the paint's + 1px, so paint, gap, and focus ring (at
  // offset 0) are concentric.
  "rounded-[calc(var(--menubar-item-radius)+1px)] before:rounded-(--menubar-item-radius) focus-visible:outline-offset-0 focus-visible:z-10",
  "h-auto self-stretch in-data-[orientation=vertical]:h-[calc(var(--menubar-h)-var(--menubar-border)*2)] in-data-[orientation=vertical]:justify-start",
);

function MenubarTrigger({
  className,
  delay = 0,
  closeDelay = 0,
  ...props
}: BaseMenu.Trigger.Props) {
  return (
    <BaseMenu.Trigger
      data-slot="menubar-trigger"
      data-menubar-item=""
      delay={delay}
      closeDelay={closeDelay}
      className={cn(triggerClasses, className)}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  children,
  align = "start",
  alignOffset = 0,
  sideOffset = 4,
  level = 3,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  align?: BaseMenu.Positioner.Props["align"];
  alignOffset?: BaseMenu.Positioner.Props["alignOffset"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the popup bg (1-8). Bump when nesting inside a Dialog or other elevated container. Defaults to 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the menu reads the same regardless of nesting depth. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <BaseMenu.Portal>
      {/* No guard here, unlike DropdownMenu: there one positioner is shared by
          detached triggers and physically travels between them. Each MenubarMenu
          mounts its own, with no previous position to animate from. */}
      <BaseMenu.Positioner
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          data-slot="menubar-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative max-h-(--available-height) max-w-(--available-width) min-w-[12rem] overflow-hidden rounded-xl outline-none",
            solidSurface(level, shadowLevel),
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "origin-(--transform-origin) transition-[width,height,scale,opacity] duration-[150ms,150ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            // Own compositor layer while mounted. width/height in the transition
            // list stops Chrome compositing the scale, so rows re-raster every
            // frame and the differential stretch reads as a ripple. ContextMenu
            // escapes it by transitioning scale and opacity alone.
            "will-change-transform",
            "motion-reduce:transition-none motion-reduce:will-change-auto",
            // 'group' marks a switch to another menu in the bar, File to Edit.
            // Those swap instantly, as in native menu bars; only the first
            // open and the final close animate. 'dismiss' must animate or
            // there is no exit.
            // The start and end styles are pinned too, or the swap frame shows
            // both popups at opacity 0.
            "data-[instant=group]:transition-none data-[instant=group]:data-ending-style:scale-100 data-[instant=group]:data-ending-style:opacity-100 data-[instant=group]:data-starting-style:scale-100 data-[instant=group]:data-starting-style:opacity-100",
            className,
          )}
          {...props}
        >
          {/*
            Kept for sizing, not for content transitions. Base UI runs the popup
            auto-resize from inside the Viewport, and that is what writes
            --positioner-width / --positioner-height (plus --popup-width /
            --popup-height, which sit at `auto` between resizes). The positioner
            above sizes off those, so dropping the Viewport leaves them unset
            and its explicit box collapses.

            Deliberately carries no morph styling. A menubar can't morph: each
            MenubarMenu is its own Menu.Root, so moving from File to Edit mounts
            a new popup rather than swapping content within one, and
            data-current / data-previous / data-activation-direction never
            appear. (Verified: two distinct popup elements across a switch.)
          */}
          <BaseMenu.Viewport
            data-slot="menubar-viewport"
            // No `max-w`: `w-full` resolves against the popup's already-capped
            // content box, so the width bound is inherited for free.
            className="relative max-h-(--available-height) w-full overflow-clip overflow-y-auto p-1"
          >
            {children}
          </BaseMenu.Viewport>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

// The menu's contents are Dropdown Menu's parts: a menubar menu is the same
// Base UI Menu.
const MenubarPortal = DropdownMenuPortal;
const MenubarGroup = DropdownMenuGroup;
const MenubarLabel = DropdownMenuLabel;
const MenubarGroupLabel = DropdownMenuGroupLabel;
const MenubarItem = DropdownMenuItem;
const MenubarLinkItem = DropdownMenuLinkItem;
const MenubarCheckboxItem = DropdownMenuCheckboxItem;
const MenubarRadioGroup = DropdownMenuRadioGroup;
const MenubarRadioItem = DropdownMenuRadioItem;
const MenubarSeparator = DropdownMenuSeparator;
const MenubarShortcut = DropdownMenuShortcut;
const MenubarSub = DropdownMenuSub;
const MenubarSubTrigger = DropdownMenuSubTrigger;
const MenubarSubContent = DropdownMenuSubContent;

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarGroupLabel,
  MenubarLabel,
  MenubarItem,
  MenubarLinkItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  menubarVariants,
};
