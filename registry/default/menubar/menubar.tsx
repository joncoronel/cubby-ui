"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/default/button/button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuClear,
  DropdownMenuEmpty,
  DropdownMenuFilter,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuList,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  useDropdownMenuFilter,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import "./menubar.css";

// A shell, as in Button Group and Toolbar. Trigger insets are borders, 2px
// facing the shell's edge and 1px facing a neighbour; `of` counts triggers
// only, so Base UI's guard spans can't move the ends. Hit areas, the gliding
// highlight and focus rings are in menubar.css.
const menubarVariants = cva(
  [
    "group/menubar relative isolate flex w-fit items-stretch rounded-(--menubar-radius) data-[orientation=vertical]:flex-col",
    // Never narrower than its triggers; overflow is the container's to handle.
    "min-w-max",
    // Paint corners are the shell's minus the 2px edge border.
    "[--menubar-item-radius:max(0px,calc(var(--menubar-radius)-2px))]",
    // Pure overlays (black, white in dark): hover 8%, press 10%
    "[--menubar-highlight:var(--surface-active)] [--menubar-press:var(--surface-selected)]",
    "data-[orientation=horizontal]:h-(--menubar-h)",
    "data-[orientation=horizontal]:[&>[data-menubar-item]]:border-y-2 data-[orientation=horizontal]:[&>:nth-child(1_of_[data-menubar-item])]:border-s-2 data-[orientation=horizontal]:[&>:nth-last-child(1_of_[data-menubar-item])]:border-e-2",
    "data-[orientation=vertical]:[&>[data-menubar-item]]:border-x-2 data-[orientation=vertical]:[&>:nth-child(1_of_[data-menubar-item])]:border-t-2 data-[orientation=vertical]:[&>:nth-last-child(1_of_[data-menubar-item])]:border-b-2",
    // Triggers dim with the shell, not twice.
    "data-disabled:opacity-60 data-disabled:**:data-menubar-item:opacity-100",
  ],
  {
    variants: {
      variant: {
        elevated: cn(solidSurface(2, 2), "text-foreground"),
        outline:
          "bg-(--outline) text-foreground outline outline-(--outline-border)",
        soft: "bg-secondary text-secondary-foreground",
        ghost: "text-foreground",
      },
      // Button's height ladder (one step taller below sm); corners step with it.
      size: {
        sm: "[--menubar-h:--spacing(9)] sm:not-pointer-coarse:[--menubar-h:--spacing(8)] [--menubar-radius:calc(var(--radius)-2px)]",
        default:
          "[--menubar-h:--spacing(10)] sm:not-pointer-coarse:[--menubar-h:--spacing(9)] [--menubar-radius:var(--radius)]",
        lg: "[--menubar-h:--spacing(11)] sm:not-pointer-coarse:[--menubar-h:--spacing(10)] [--menubar-radius:calc(var(--radius)+2px)]",
      },
    },
  },
);

type MenubarVariant = NonNullable<
  VariantProps<typeof menubarVariants>["variant"]
>;
type MenubarSize = NonNullable<VariantProps<typeof menubarVariants>["size"]>;

export type MenubarProps = BaseMenubar.Props & {
  /** Shell style. */
  variant?: MenubarVariant;
  /** Outer height, on Button's ladder. */
  size?: MenubarSize;
  /** Glide a shared highlight between triggers. */
  highlight?: boolean;
};

function Menubar({
  className,
  variant = "elevated",
  size = "default",
  highlight = true,
  disabled,
  children,
  ...props
}: MenubarProps) {
  return (
    <BaseMenubar
      data-slot="menubar"
      data-variant={variant}
      data-size={size}
      // Base UI's Menubar state has no disabled flag, so it sets no attribute.
      data-disabled={disabled ? "" : undefined}
      data-glide={highlight ? "" : undefined}
      disabled={disabled}
      className={cn(menubarVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {highlight && (
        <span
          aria-hidden
          data-slot="menubar-highlight"
          data-menubar-highlight
        />
      )}
    </BaseMenubar>
  );
}

function MenubarMenu(props: BaseMenu.Root.Props) {
  return <BaseMenu.Root data-slot="menubar-menu" {...props} />;
}

// A quiet Button: hover and the open menu paint the menubar overlay. Menu triggers
// skip Button's press, as everywhere else.
const triggerClasses = cn(
  buttonVariants({ variant: "ghost", size: null }),
  "shrink-0 border border-transparent px-2.5 text-sm font-medium text-current hover:text-current data-popup-open:text-current",
  "[--btn-bg-hover:var(--menubar-highlight)] [--btn-bg-active:var(--menubar-press)]",
  // Instant hover, so a sweep never shows two triggers half-lit.
  "before:[transition-duration:0ms,100ms,100ms] active:before:[transition-duration:100ms]",
  // Box corners are the plate's + 2px.
  "rounded-[calc(var(--menubar-item-radius)+2px)] before:rounded-(--menubar-item-radius) focus-visible:z-10",
  // In a column every trigger gets the row's paint height.
  "h-auto self-stretch group-data-[orientation=vertical]/menubar:box-content group-data-[orientation=vertical]/menubar:h-[calc(var(--menubar-h)-4px)] group-data-[orientation=vertical]/menubar:min-w-[calc(var(--menubar-h)-4px)] group-data-[orientation=vertical]/menubar:py-0 group-data-[orientation=vertical]/menubar:justify-start",
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
  positionerClassName,
  viewportClassName,
  children,
  align = "start",
  alignOffset = 0,
  sideOffset = 4,
  level = 3,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  /** Classes for the positioner (the element Base UI moves into place), merged last. */
  positionerClassName?: string;
  /** Classes for the padded box around the items, e.g. `p-0` for a filterable menu. */
  viewportClassName?: string;
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
        className={cn(
          "z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          positionerClassName,
        )}
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
            // 'group' (a switch to another menu, or a tab-out close) is
            // instant, as in native menu bars. Start and end styles are pinned
            // too, or the swap frame shows both popups at opacity 0.
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
            className={cn(
              "relative max-h-(--available-height) w-full overflow-clip overflow-y-auto p-1",
              // Lets a filterable list shrink to fit; off during swaps (see DropdownMenu).
              "flex flex-col *:data-current:flex *:data-current:flex-col not-data-transitioning:*:data-current:min-h-0",
              viewportClassName,
            )}
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
// Filtering: wrap a MenubarMenu (or MenubarSub) in MenubarFilter.
const MenubarFilter = DropdownMenuFilter;
const MenubarInput = DropdownMenuInput;
const MenubarClear = DropdownMenuClear;
const MenubarList = DropdownMenuList;
const MenubarEmpty = DropdownMenuEmpty;
const useMenubarFilter = useDropdownMenuFilter;

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
  MenubarFilter,
  MenubarInput,
  MenubarClear,
  MenubarList,
  MenubarEmpty,
  useMenubarFilter,
  menubarVariants,
};
