"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { LayoutGroup, m, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// Context for sharing state between components
type PullDownMenuContextValue = {
  open: boolean;
  layoutId: string;
  reducedMotion: boolean;
};

const PullDownMenuContext =
  React.createContext<PullDownMenuContextValue | null>(null);

function usePullDownMenu() {
  const context = React.useContext(PullDownMenuContext);
  if (!context) {
    throw new Error("PullDownMenu components must be used within PullDownMenu");
  }
  return context;
}

// Animation configuration
const springTransition = {
  type: "spring" as const,
  duration: 0.35,
  bounce: 0.1,
};

// Root component - wraps Base UI Menu with LayoutGroup
type PullDownMenuProps = Omit<
  React.ComponentProps<typeof BaseMenu.Root>,
  "open" | "onOpenChange" | "children"
> & {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
};

function PullDownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  ...props
}: PullDownMenuProps) {
  const layoutId = React.useId();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const reducedMotion = useReducedMotion() ?? false;

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const contextValue = React.useMemo(
    () => ({
      open,
      layoutId,
      reducedMotion,
    }),
    [open, layoutId, reducedMotion],
  );

  return (
    <LayoutGroup>
      <BaseMenu.Root {...props} open={open} onOpenChange={handleOpenChange}>
        <PullDownMenuContext.Provider value={contextValue}>
          <div data-slot="pull-down-menu" className="relative inline-block">
            {children}
          </div>
        </PullDownMenuContext.Provider>
      </BaseMenu.Root>
    </LayoutGroup>
  );
}

// Content component - handles the morphing animation
type PullDownMenuContentProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  triggerClassName?: string;
};

function PullDownMenuContent({
  trigger,
  children,
  className,
  triggerClassName,
}: PullDownMenuContentProps) {
  const { open, layoutId, reducedMotion } = usePullDownMenu();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // For reduced motion, use simple fade animation
  if (reducedMotion) {
    return (
      <>
        <BaseMenu.Trigger
          ref={triggerRef}
          data-slot="pull-down-menu-trigger"
          className={cn(
            "bg-popover text-popover-foreground inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors",
            "hover:bg-accent/50 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            open && "pointer-events-none opacity-0",
            triggerClassName,
          )}
        >
          {trigger}
        </BaseMenu.Trigger>
        <BaseMenu.Portal>
          <BaseMenu.Positioner
            anchor={triggerRef}
            sideOffset={0}
            align="start"
            className="z-50"
          >
            <BaseMenu.Popup
              data-slot="pull-down-menu-content"
              className={cn(
                "bg-popover text-popover-foreground min-w-[12rem] overflow-hidden rounded-xl border p-1 shadow-[0_8px_20px_0_oklch(0.18_0_0/0.10)]",
                "origin-(--transform-origin) transition-[transform,scale,opacity] duration-150",
                "data-starting-style:scale-95 data-starting-style:opacity-0",
                "data-ending-style:scale-95 data-ending-style:opacity-0",
                className,
              )}
            >
              {children}
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </>
    );
  }

  // Full morph animation with Portal
  return (
    <>
      {/* Trigger button - the button itself morphs via layoutId */}
      {!open && (
        <BaseMenu.Trigger
          ref={triggerRef}
          render={
            <m.button
              layout
              layoutId={layoutId}
              transition={springTransition}
            />
          }
          data-slot="pull-down-menu-trigger"
          className={cn(
            "bg-popover text-popover-foreground inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors",
            "hover:bg-accent/50 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            triggerClassName,
          )}
        >
          {trigger}
        </BaseMenu.Trigger>
      )}

      {/* Hidden trigger to maintain anchor ref when menu is open */}
      {open && (
        <BaseMenu.Trigger
          ref={triggerRef}
          data-slot="pull-down-menu-trigger"
          className="pointer-events-none invisible absolute"
          tabIndex={-1}
        >
          {trigger}
        </BaseMenu.Trigger>
      )}

      {/* Portal with menu content */}
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          anchor={triggerRef}
          sideOffset={0}
          align="start"
          side="bottom"
          className="z-50"
        >
          {open && (
            <m.div
              layout
              layoutId={layoutId}
              transition={springTransition}
              className="bg-popover overflow-hidden rounded-xl border shadow-[0_8px_20px_0_oklch(0.18_0_0/0.10)]"
            >
              <BaseMenu.Popup
                data-slot="pull-down-menu-content"
                className={cn(
                  "text-popover-foreground min-w-[12rem] p-1",
                  className,
                )}
              >
                {children}
              </BaseMenu.Popup>
            </m.div>
          )}
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </>
  );
}

// Menu item
type PullDownMenuItemProps = React.ComponentProps<typeof BaseMenu.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
};

function PullDownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: PullDownMenuItemProps) {
  return (
    <BaseMenu.Item
      data-slot="pull-down-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "data-highlighted:bg-accent/50 data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/20",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

// Separator
type PullDownMenuSeparatorProps = React.ComponentProps<
  typeof BaseMenu.Separator
>;

function PullDownMenuSeparator({
  className,
  ...props
}: PullDownMenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      data-slot="pull-down-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// Label for groups
type PullDownMenuLabelProps = React.ComponentProps<"div"> & {
  inset?: boolean;
};

function PullDownMenuLabel({
  className,
  inset,
  ...props
}: PullDownMenuLabelProps) {
  return (
    <div
      data-slot="pull-down-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// Group
type PullDownMenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>;

function PullDownMenuGroup({ ...props }: PullDownMenuGroupProps) {
  return <BaseMenu.Group data-slot="pull-down-menu-group" {...props} />;
}

// Group label
type PullDownMenuGroupLabelProps = React.ComponentProps<
  typeof BaseMenu.GroupLabel
> & {
  inset?: boolean;
};

function PullDownMenuGroupLabel({
  className,
  inset,
  ...props
}: PullDownMenuGroupLabelProps) {
  return (
    <BaseMenu.GroupLabel
      data-slot="pull-down-menu-group-label"
      data-inset={inset}
      className={cn(
        "px-2.5 py-1.5 text-xs font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

// Shortcut display
type PullDownMenuShortcutProps = React.ComponentProps<"span">;

function PullDownMenuShortcut({
  className,
  ...props
}: PullDownMenuShortcutProps) {
  return (
    <span
      data-slot="pull-down-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  PullDownMenu,
  PullDownMenuContent,
  PullDownMenuItem,
  PullDownMenuSeparator,
  PullDownMenuLabel,
  PullDownMenuGroup,
  PullDownMenuGroupLabel,
  PullDownMenuShortcut,
};
