"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  switchVariants,
  switchThumbVariants,
} from "@/registry/default/switch/switch";

// Shared shell for checkbox and radio items. Padding matches DropdownMenuItem
// so labels line up across every item type; the indicator lives in a reserved
// right-hand column so toggling never shifts the label.
const toggleItemClasses =
  "group data-highlighted:bg-surface-hover data-highlighted:text-accent-foreground grid cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

// Path length ≈ 22 (from the path geometry)
function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path
        d="M5 14L8.5 17.5L19 6.5"
        style={{
          strokeDasharray: 22,
        }}
        className="ease-out-expo transition-[stroke-dashoffset] duration-150 in-data-checked:[stroke-dashoffset:0] in-data-unchecked:[stroke-dashoffset:22] motion-reduce:transition-none"
      />
    </svg>
  );
}

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
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
        sideOffset={sideOffset}
        align={align}
        side={side}
      >
        <BaseMenu.Popup
          data-slot="dropdown-menu-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative min-w-[12rem] overflow-hidden rounded-xl",
            solidSurface(level, shadowLevel),
            "h-(--popup-height,auto) w-(--popup-width,auto)",
            "origin-(--transform-origin) transition-[width,height,scale,opacity] duration-[350ms,350ms,100ms,100ms] ease-[cubic-bezier(0.22,1,0.36,1),cubic-bezier(0.22,1,0.36,1),var(--ease-out-expo),var(--ease-out-expo)]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
            "data-instant:transition-none",
            className,
          )}
          {...props}
        >
          <BaseMenu.Viewport
            data-slot="dropdown-menu-viewport"
            className={cn(
              "relative size-full overflow-clip p-1 [--viewport-padding:0.25rem]",
              "not-data-transitioning:overflow-y-auto",
              // Content width
              "**:data-current:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              "**:data-previous:w-[calc(var(--popup-width)-2*var(--viewport-padding))]",
              // Content base state and transitions
              "**:data-current:translate-x-0 **:data-current:opacity-100",
              "**:data-previous:translate-x-0 **:data-previous:opacity-100",
              "**:data-current:transition-[translate,opacity,filter] **:data-current:duration-[350ms,175ms,350ms] **:data-current:ease-[cubic-bezier(0.22,1,0.36,1)]",
              "**:data-previous:transition-[translate,opacity,filter] **:data-previous:duration-[350ms,175ms,350ms] **:data-previous:ease-[cubic-bezier(0.22,1,0.36,1)]",
              // Direction-aware slide animations for incoming content
              "data-[activation-direction~=left]:**:data-current:data-starting-style:-translate-x-1/2",
              "data-[activation-direction~=left]:**:data-current:data-starting-style:opacity-0",
              "data-[activation-direction~=right]:**:data-current:data-starting-style:translate-x-1/2",
              "data-[activation-direction~=right]:**:data-current:data-starting-style:opacity-0",
              // Direction-aware slide animations for outgoing content
              "data-[activation-direction~=left]:**:data-previous:data-ending-style:translate-x-1/2",
              "data-[activation-direction~=left]:**:data-previous:data-ending-style:opacity-0",
              "data-[activation-direction~=right]:**:data-previous:data-ending-style:-translate-x-1/2",
              "data-[activation-direction~=right]:**:data-previous:data-ending-style:opacity-0",
              // Blur effects during transitions
              "**:data-current:data-starting-style:blur-[4px]",
              "**:data-current:data-ending-style:blur-[4px]",
              "**:data-previous:data-starting-style:blur-[4px]",
              "**:data-previous:data-ending-style:blur-[4px]",

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
      className={cn("bg-border -mx-1 my-1 h-px", className)}
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
  variant = "default",
  ...props
}: React.ComponentProps<typeof BaseMenu.CheckboxItem> & {
  inset?: boolean;
  /** Indicator style. `"switch"` is visual only — the item keeps the `menuitemcheckbox` role. */
  variant?: "default" | "switch";
}) {
  return (
    <BaseMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        toggleItemClasses,
        variant === "switch"
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
      {variant === "switch" ? (
        // The indicator is aria-hidden and non-interactive: the row itself
        // carries the role and the click target, so nesting a real Switch here
        // would put a focusable control inside a menuitemcheckbox.
        <BaseMenu.CheckboxItemIndicator
          keepMounted
          className={cn(
            switchVariants({ shape: "circle", size: "xs" }),
            "col-start-2 cursor-default",
            "pointer-events-none",
            // The row already dims when disabled; don't compound the fade.
            "data-disabled:opacity-100",
          )}
        >
          <span className={switchThumbVariants()} />
        </BaseMenu.CheckboxItemIndicator>
      ) : (
        <BaseMenu.CheckboxItemIndicator
          keepMounted
          className="col-start-2 flex items-center justify-center"
        >
          <CheckmarkIcon className="size-4" />
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
        <CheckmarkIcon className="size-4" />
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
}: React.ComponentProps<typeof BaseMenu.Root>) {
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
        className="z-50 max-h-(--available-height)"
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset ?? defaultAlignOffset}
      >
        <BaseMenu.Popup
          data-slot="dropdown-menu-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative min-w-[12rem] overflow-hidden rounded-xl",
            solidSurface(level, shadowLevel),
            "ease-out-expo origin-(--transform-origin) transition-[transform,scale,opacity] duration-100",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:scale-95 data-ending-style:opacity-0",
            "motion-reduce:transition-none",
            className,
          )}
          {...props}
        >
          <div className="p-1">{children}</div>
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
