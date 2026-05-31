import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { cn } from "@/lib/utils";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
function Menubar({
  className,
  level = 2,
  shadowLevel = 2,
  ...props
}: React.ComponentProps<typeof BaseMenubar> & {
  /** Surface elevation level (1-8). Defaults to 2 — a subtle inline toolbar that sits just above the page. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Defaults to 2. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <BaseMenubar
      data-slot="menubar"
      data-level={level}
      className={cn(
        "relative flex h-9 items-center gap-1 rounded-lg p-1",
        solidSurface(level, shadowLevel),
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof BaseMenu.Root>) {
  return <BaseMenu.Root data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof BaseMenu.Group>) {
  return <BaseMenu.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof BaseMenu.Portal>) {
  return <BaseMenu.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioGroup>) {
  return <BaseMenu.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarTrigger({
  className,
  delay = 0,
  closeDelay = 0,
  ...props
}: React.ComponentProps<typeof BaseMenu.Trigger>) {
  return (
    <BaseMenu.Trigger
      data-slot="menubar-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={cn(
        "data-popup-open:text-accent-foreground hover:text-accent-foreground flex items-center rounded-sm px-2.5 py-1 text-sm font-medium outline-hidden select-none hover:bg-(--surface-hover) data-popup-open:bg-(--surface-hover)",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  children,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
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
    <MenubarPortal>
      <BaseMenu.Positioner
        className="z-50 h-(--positioner-height) max-h-(--available-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          data-slot="menubar-content"
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
            data-slot="menubar-viewport"
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
      </BaseMenu.Positioner>
    </MenubarPortal>
  );
}

function MenubarItem({
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
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive focus:data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none focus:bg-(--surface-hover) data-[disabled]:pointer-events-none data-[disabled]:opacity-60 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-all [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarLinkItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.LinkItem> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.LinkItem
      data-slot="menubar-link-item"
      data-inset={inset}
      className={cn(
        "focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm no-underline outline-hidden select-none focus:bg-(--surface-hover) data-disabled:pointer-events-none data-disabled:opacity-60 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-all [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof BaseMenu.CheckboxItem>) {
  return (
    <BaseMenu.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2.5 pl-8 text-sm outline-hidden select-none focus:bg-(--surface-hover) data-[disabled]:pointer-events-none data-[disabled]:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <BaseMenu.CheckboxItemIndicator>
          <HugeiconsIcon icon={Tick02Icon} className="size-4" strokeWidth={2} />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseMenu.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenu.RadioItem>) {
  return (
    <BaseMenu.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md py-1.5 pr-2.5 pl-8 text-sm outline-hidden select-none focus:bg-(--surface-hover) data-[disabled]:pointer-events-none data-[disabled]:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <BaseMenu.RadioItemIndicator>
          <HugeiconsIcon
            icon={CircleIcon}
            className="size-2 fill-current"
            strokeWidth={2}
          />
        </BaseMenu.RadioItemIndicator>
      </span>
      {children}
    </BaseMenu.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof BaseMenu.GroupLabel> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.GroupLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof BaseMenu.Separator>) {
  return (
    <BaseMenu.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof BaseMenu.SubmenuRoot>) {
  return <BaseMenu.SubmenuRoot data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof BaseMenu.SubmenuTrigger> & {
  inset?: boolean;
}) {
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:text-accent-foreground data-popup-open:text-accent-foreground flex cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none focus:bg-(--surface-hover) data-popup-open:bg-(--surface-hover) data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="ml-auto h-4 w-4"
        strokeWidth={2}
      />
    </BaseMenu.SubmenuTrigger>
  );
}

function MenubarSubContent({
  className,
  children,
  sideOffset = 8,
  level = 5,
  shadowLevel = 3,
  ...props
}: React.ComponentProps<typeof BaseMenu.Popup> & {
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  /** Surface elevation level for the submenu bg (1-8). Defaults to 5 — one tier above the parent menu's default of 3. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 3 by default so the submenu reads the same dropdown weight as its parent. */
  shadowLevel?: SurfaceLevel;
}) {
  return (
    <MenubarPortal>
      <BaseMenu.Positioner
        className="z-50 max-h-(--available-height)"
        sideOffset={sideOffset}
      >
        <BaseMenu.Popup
          data-slot="menubar-sub-content"
          data-level={level}
          className={cn(
            "text-popover-foreground relative min-w-[12rem] overflow-hidden rounded-xl",
            solidSurface(level, shadowLevel),
            // Submenus open as their own popup (no Viewport content-swap) — scale + fade
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
      </BaseMenu.Positioner>
    </MenubarPortal>
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
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
};
