import * as React from "react";
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface NavigationMenuProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Root> {
  contentProps?: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Positioner>,
    "render"
  >;
}

function NavigationMenu({
  className,
  children,
  contentProps,
  ...props
}: NavigationMenuProps) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "bg-card border-border/70 text-foreground min-w-max rounded-md border p-1 shadow-[0_2px_6px_0_oklch(0.18_0_0_/_0.05)]",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport contentProps={contentProps} />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("relative flex", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "box-border flex items-center justify-center gap-1.5 h-10 px-2.5 xs:px-3 m-0 rounded-sm bg-card text-foreground font-medium text-[0.925rem] xs:text-base leading-6 select-none no-underline transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground active:bg-accent active:text-accent-foreground data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:relative",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <NavigationMenuIcon />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuIcon({
  className,
  render = <ChevronDownIcon />,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Icon>) {
  return (
    <NavigationMenuPrimitive.Icon
      className={cn(
        "transition-transform duration-200 ease-in-out data-[popup-open]:rotate-180",
        className,
      )}
      render={render}
      {...props}
    />
  );
}

const navigationMenuSubTriggerStyle = cva(
  "w-full text-left relative block rounded-md p-2.5 xs:p-3 no-underline text-inherit transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground focus-visible:relative focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring data-[popup-open]:bg-accent data-[popup-open]:text-accent-foreground",
);

function NavigationMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-sub-trigger"
      className={cn(navigationMenuSubTriggerStyle(), className)}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Icon
        className="absolute top-1/2 right-2.5 flex h-2.5 w-2.5 -translate-y-1/2 items-center justify-center transition-transform duration-200 ease-in-out data-[popup-open]:rotate-180"
        render={<ChevronRightIcon />}
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-max max-w-[90vw] p-4 transition-[opacity,transform,translate] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:opacity-0 data-[ending-style]:data-[activation-direction=left]:translate-x-[50%] data-[ending-style]:data-[activation-direction=right]:translate-x-[-50%] data-[starting-style]:opacity-0 data-[starting-style]:data-[activation-direction=left]:translate-x-[-50%] data-[starting-style]:data-[activation-direction=right]:translate-x-[50%]",
        className,
      )}
      {...props}
    />
  );
}

interface NavigationMenuLinkProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Link> {
  /**
   * When true, applies trigger button styling for top-level navigation links
   */
  standalone?: boolean;
}

function NavigationMenuLink({
  className,
  standalone,
  ...props
}: NavigationMenuLinkProps) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        standalone
          ? navigationMenuTriggerStyle()
          : "xs:p-3 hover:bg-accent/80 hover:text-accent-foreground focus-visible:outline-ring block rounded-md p-2.5 text-inherit no-underline transition-colors duration-200 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuBackdrop({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Backdrop>) {
  return (
    <NavigationMenuPrimitive.Backdrop
      data-slot="navigation-menu-backdrop"
      {...props}
    />
  );
}

function NavigationMenuPortal({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Portal>) {
  return (
    <NavigationMenuPrimitive.Portal
      data-slot="navigation-menu-portal"
      {...props}
    />
  );
}

function NavigationMenuArrow({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Arrow>) {
  return (
    <NavigationMenuPrimitive.Arrow
      className="flex transition-[left] duration-[var(--duration)] ease-[var(--easing)] data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180"
      {...props}
    >
      <ArrowSvg />
    </NavigationMenuPrimitive.Arrow>
  );
}

interface NavigationMenuViewportProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Viewport> {
  contentProps?: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Positioner>,
    "render"
  >;
}

function NavigationMenuViewport({
  className: viewportClassName,
  children,
  contentProps,
  ...props
}: NavigationMenuViewportProps) {
  const {
    sideOffset = 10,
    collisionPadding = { top: 5, bottom: 5, left: 20, right: 20 },
    className,
    ...rest
  } = contentProps ?? {};

  return (
    <NavigationMenuPortal>
      <NavigationMenuPrimitive.Positioner
        data-slot="navigation-menu-positioner"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "box-border h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5",
          className,
        )}
        style={{
          ["--duration" as string]: "0.35s",
          ["--easing" as string]: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        {...rest}
      >
        <NavigationMenuPrimitive.Popup
          data-slot="navigation-menu-content"
          className="data-[ending-style]:easing-[ease] bg-popover text-popover-foreground border-border/60 relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] rounded-lg border shadow-[0_6px_20px_0_oklch(0.18_0_0_/_0.10)] transition-[opacity,transform,width,height,scale,translate] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0"
        >
          {/* <NavigationMenuArrow /> */}
          <NavigationMenuPrimitive.Viewport
            data-slot="navigation-menu-viewport"
            className={cn(
              "relative h-full w-full overflow-hidden",
              viewportClassName,
            )}
            {...props}
          >
            {children}
          </NavigationMenuPrimitive.Viewport>
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPortal>
  );
}

interface NavigationMenuSubProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Root> {
  contentProps?: Omit<
    React.ComponentProps<typeof NavigationMenuPrimitive.Positioner>,
    "render"
  >;
}

function NavigationMenuSub({
  className,
  children,
  contentProps,
  orientation = "vertical",
  ...props
}: NavigationMenuSubProps) {
  const {
    sideOffset = 24,
    alignOffset = -24,
    align = "end",
    side = "right",
    className: positionerClassName,
    ...rest
  } = contentProps ?? {};

  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu-sub"
      className={cn("", className)}
      orientation={orientation}
      {...props}
    >
      {children}
      <NavigationMenuPortal>
        <NavigationMenuPrimitive.Positioner
          data-slot="navigation-menu-sub-positioner"
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          align={align}
          side={side}
          className={cn(
            "box-border h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom] duration-[var(--duration)] ease-[var(--easing)] before:absolute before:content-[''] data-[instant]:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 data-[side=bottom]:before:h-2.5 data-[side=left]:before:top-0 data-[side=left]:before:right-[-10px] data-[side=left]:before:bottom-0 data-[side=left]:before:w-2.5 data-[side=right]:before:top-0 data-[side=right]:before:bottom-0 data-[side=right]:before:left-[-10px] data-[side=right]:before:w-2.5 data-[side=top]:before:right-0 data-[side=top]:before:bottom-[-10px] data-[side=top]:before:left-0 data-[side=top]:before:h-2.5",
            positionerClassName,
          )}
          style={{
            ["--duration" as string]: "0.35s",
            ["--easing" as string]: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          {...rest}
        >
          <NavigationMenuPrimitive.Popup
            data-slot="navigation-menu-sub-content"
            className="data-[ending-style]:easing-[ease] bg-popover text-popover-foreground border-border/60 relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] rounded-lg border shadow-[0_6px_20px_0_oklch(0.18_0_0_/_0.10)] transition-[opacity,transform,width,height,scale,translate] duration-[var(--duration)] ease-[var(--easing)] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0"
          >
            <NavigationMenuPrimitive.Viewport
              data-slot="navigation-menu-sub-viewport"
              className="relative h-full w-full overflow-hidden"
            />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPortal>
    </NavigationMenuPrimitive.Root>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChevronRightIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" {...props}>
      <path d="M3.5 1L7.5 5L3.5 9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-popover"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-border"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-border"
      />
    </svg>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuSubTrigger,
  NavigationMenuSub,
  NavigationMenuIcon,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuBackdrop,
  NavigationMenuPortal,
  NavigationMenuViewport,
  NavigationMenuArrow,
  navigationMenuTriggerStyle,
  navigationMenuSubTriggerStyle,
  ChevronRightIcon,
};
