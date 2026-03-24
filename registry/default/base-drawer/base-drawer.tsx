"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRightIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";

// ---------------------------------------------------------------------------
// Types & context
// ---------------------------------------------------------------------------

type DrawerPosition = "right" | "left" | "top" | "bottom";

const DrawerContext = React.createContext<{ position: DrawerPosition }>({
  position: "bottom",
});

const directionMap: Record<
  DrawerPosition,
  DrawerPrimitive.Root.Props["swipeDirection"]
> = {
  bottom: "down",
  left: "left",
  right: "right",
  top: "up",
};

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const createBaseDrawerHandle: typeof DrawerPrimitive.createHandle =
  DrawerPrimitive.createHandle;

function BaseDrawer({
  swipeDirection,
  position = "bottom",
  ...props
}: DrawerPrimitive.Root.Props & {
  position?: DrawerPosition;
}) {
  return (
    <DrawerContext.Provider value={{ position }}>
      <DrawerPrimitive.Root
        swipeDirection={swipeDirection ?? directionMap[position]}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Primitives (pass-through)
// ---------------------------------------------------------------------------

const BaseDrawerPortal: typeof DrawerPrimitive.Portal =
  DrawerPrimitive.Portal;

function BaseDrawerTrigger(
  props: DrawerPrimitive.Trigger.Props,
): React.ReactElement {
  return <DrawerPrimitive.Trigger data-slot="base-drawer-trigger" {...props} />;
}

function BaseDrawerClose(
  props: DrawerPrimitive.Close.Props,
): React.ReactElement {
  return <DrawerPrimitive.Close data-slot="base-drawer-close" {...props} />;
}

const BaseDrawerContent: typeof DrawerPrimitive.Content =
  DrawerPrimitive.Content;

// ---------------------------------------------------------------------------
// Provider / Indent
// ---------------------------------------------------------------------------

function BaseDrawerProvider({
  ...props
}: DrawerPrimitive.Provider.Props) {
  return <DrawerPrimitive.Provider {...props} />;
}

function BaseDrawerIndent({
  className,
  ...props
}: DrawerPrimitive.Indent.Props) {
  return (
    <DrawerPrimitive.Indent
      data-slot="base-drawer-indent"
      className={cn(
        "transition-[transform,border-radius] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        "data-[active]:scale-[0.94] data-[active]:overflow-hidden data-[active]:rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

function BaseDrawerIndentBackground({
  className,
  ...props
}: DrawerPrimitive.IndentBackground.Props) {
  return (
    <DrawerPrimitive.IndentBackground
      data-slot="base-drawer-indent-background"
      className={cn("fixed inset-0 bg-black", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// SwipeArea
// ---------------------------------------------------------------------------

function BaseDrawerSwipeArea({
  className,
  position: positionProp,
  ...props
}: DrawerPrimitive.SwipeArea.Props & {
  position?: DrawerPosition;
}) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <DrawerPrimitive.SwipeArea
      className={cn(
        "fixed z-50 touch-none",
        position === "bottom" && "inset-x-0 bottom-0 h-8",
        position === "top" && "inset-x-0 top-0 h-8",
        position === "left" && "inset-y-0 left-0 w-8",
        position === "right" && "inset-y-0 right-0 w-8",
        className,
      )}
      data-slot="base-drawer-swipe-area"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Backdrop
// ---------------------------------------------------------------------------

function BaseDrawerBackdrop({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 opacity-[calc(1-var(--drawer-swipe-progress))] backdrop-blur-sm transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      data-slot="base-drawer-backdrop"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Viewport
// ---------------------------------------------------------------------------

function BaseDrawerViewport({
  className,
  position,
  variant = "default",
  ...props
}: DrawerPrimitive.Viewport.Props & {
  position?: DrawerPosition;
  variant?: "default" | "floating";
}) {
  return (
    <DrawerPrimitive.Viewport
      className={cn(
        "fixed inset-0 z-50 [--bleed:3rem] [--inset:0px]",
        "touch-none",
        position === "bottom" && "grid grid-rows-[1fr_auto] pt-12",
        position === "top" && "grid grid-rows-[auto_1fr] pb-12",
        position === "left" && "flex justify-start",
        position === "right" && "flex justify-end",
        variant === "floating" && "px-[var(--inset)] [--inset:1rem]",
        variant === "floating" && position !== "bottom" && "pt-[var(--inset)]",
        variant === "floating" && position !== "top" && "pb-[var(--inset)]",
        className,
      )}
      data-slot="base-drawer-viewport"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Popup (convenience composite: Portal + Backdrop + Viewport + Popup)
// ---------------------------------------------------------------------------

function BaseDrawerPopup({
  className,
  children,
  showCloseButton = false,
  position: positionProp,
  variant = "default",
  showBar = false,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  position?: DrawerPosition;
  variant?: "default" | "floating";
  showBar?: boolean;
}) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <BaseDrawerPortal>
      <BaseDrawerBackdrop />
      <BaseDrawerViewport position={position} variant={variant}>
        <DrawerPrimitive.Popup
          className={cn(
            // Base layout
            "relative flex max-h-full min-h-0 w-full min-w-0 flex-col bg-popover text-popover-foreground shadow-lg outline-none will-change-transform",
            // Transition
            "transition-[transform,box-shadow,height,background-color] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
            "touch-none",
            // Stack calculation variables
            "[--peek:1.5rem] [--stack-step:0.05]",
            "[--stack-progress:clamp(0,var(--drawer-swipe-progress),1)]",
            "[--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))]",
            "[--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)]",
            "[--shrink:calc(1-var(--scale))]",
            "[--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]",
            // Subtle border ring
            "ring-border ring-1",
            // Bleed pseudo (fills gap when dragged past edge)
            "after:pointer-events-none after:absolute after:bg-popover",
            // States
            "data-swiping:select-none",
            "data-nested-drawer-open:overflow-hidden",
            "data-ending-style:shadow-transparent data-starting-style:shadow-transparent",
            "data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            // --- Position: bottom ---
            position === "bottom" &&
              cn(
                "row-start-2",
                // Transform
                "transform-[translateY(calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)))]",
                "data-starting-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))]",
                "data-ending-style:transform-[translateY(calc(100%+env(safe-area-inset-bottom,0px)+var(--inset)))]",
                // Dynamic bleed: adjusts for snap points automatically
                "-mb-[max(0px,calc(var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))]",
                "pb-[max(0px,calc(env(safe-area-inset-bottom,0px)+var(--drawer-snap-point-offset,0px)+clamp(0,1,var(--drawer-snap-point-offset,0px)/1px)*var(--drawer-swipe-movement-y,0px)))]",
                "data-starting-style:mb-0 data-ending-style:mb-0",
                "data-starting-style:pb-0 data-ending-style:pb-0",
                // Transition includes margin/padding for snap changes but not enter/exit
                "not-data-starting-style:not-data-ending-style:transition-[transform,box-shadow,height,background-color,margin,padding]",
                // Bleed pseudo
                "after:inset-x-0 after:top-full after:h-[var(--bleed)]",
                // Bar support
                "has-data-[slot=base-drawer-bar]:pt-2",
                // Nested stacking
                "h-[var(--drawer-height,auto)]",
                "[--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))]",
                "data-nested-drawer-open:h-[var(--height)]",
                "origin-[50%_calc(100%-var(--inset))]",
                "data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))]",
              ),
            // --- Position: top ---
            position === "top" &&
              cn(
                "transform-[translateY(var(--drawer-swipe-movement-y))]",
                "data-starting-style:transform-[translateY(calc(-100%-var(--inset)))]",
                "data-ending-style:transform-[translateY(calc(-100%-var(--inset)))]",
                "after:inset-x-0 after:bottom-full after:h-[var(--bleed)]",
                "has-data-[slot=base-drawer-bar]:pb-2",
                // Nested stacking
                "h-[var(--drawer-height,auto)]",
                "[--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))]",
                "data-nested-drawer-open:h-[var(--height)]",
                "origin-[50%_var(--inset)]",
                "data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)+var(--stack-peek-offset)+(var(--shrink)*var(--height))))_scale(var(--scale))]",
              ),
            // --- Position: left ---
            position === "left" &&
              cn(
                "w-[calc(100%-3rem)] max-w-md",
                "transform-[translateX(var(--drawer-swipe-movement-x))]",
                "data-starting-style:transform-[translateX(calc(-100%-var(--inset)))]",
                "data-ending-style:transform-[translateX(calc(-100%-var(--inset)))]",
                "after:inset-y-0 after:end-full after:w-[var(--bleed)]",
                "has-data-[slot=base-drawer-bar]:pe-2",
                "origin-right",
                "data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)+var(--stack-peek-offset)))_scale(var(--scale))]",
              ),
            // --- Position: right ---
            position === "right" &&
              cn(
                "w-[calc(100%-3rem)] max-w-md",
                "transform-[translateX(var(--drawer-swipe-movement-x))]",
                "data-starting-style:transform-[translateX(calc(100%+var(--inset)))]",
                "data-ending-style:transform-[translateX(calc(100%+var(--inset)))]",
                "after:inset-y-0 after:start-full after:w-[var(--bleed)]",
                "has-data-[slot=base-drawer-bar]:ps-2",
                "origin-left",
                "data-nested-drawer-open:transform-[translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)))_scale(var(--scale))]",
              ),
            // --- Variant: rounded corners ---
            variant !== "floating"
              ? cn(
                  position === "bottom" && "rounded-t-2xl",
                  position === "top" && "rounded-b-2xl",
                )
              : cn(
                  position === "bottom" && "rounded-t-2xl",
                  position === "top" && "rounded-b-2xl",
                  position === "left" && "rounded-e-2xl",
                  position === "right" && "rounded-s-2xl",
                  "rounded-2xl after:bg-transparent",
                ),
            className,
          )}
          data-slot="base-drawer-popup"
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon_sm" variant="ghost" />}
            >
              <XIcon />
            </DrawerPrimitive.Close>
          )}
          {showBar && <BaseDrawerBar />}
        </DrawerPrimitive.Popup>
      </BaseDrawerViewport>
    </BaseDrawerPortal>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function BaseDrawerHeader({
  className,
  allowSelection = false,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  allowSelection?: boolean;
}) {
  const defaultProps = {
    className: cn(
      "flex flex-col gap-2 p-6 in-[[data-slot=base-drawer-popup]:has([data-slot=base-drawer-panel])]:pb-3 max-sm:pb-4",
      !allowSelection && "cursor-default",
      className,
    ),
    "data-slot": "base-drawer-header",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <BaseDrawerContent render={render} /> : render,
  });
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function BaseDrawerFooter({
  className,
  variant = "default",
  allowSelection = true,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  variant?: "default" | "inset";
  allowSelection?: boolean;
}) {
  const defaultProps = {
    className: cn(
      "mt-auto flex flex-col-reverse gap-2 px-6 pb-[env(safe-area-inset-bottom,0px)] sm:flex-row sm:justify-end",
      !allowSelection && "cursor-default",
      variant === "default" &&
        "in-[[data-slot=base-drawer-popup]:has([data-slot=base-drawer-panel])]:pt-3 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]",
      variant === "inset" &&
        "border-t bg-muted/72 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]",
      className,
    ),
    "data-slot": "base-drawer-footer",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <BaseDrawerContent render={render} /> : render,
  });
}

// ---------------------------------------------------------------------------
// Title / Description
// ---------------------------------------------------------------------------

function BaseDrawerTitle({
  className,
  ...props
}: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      data-slot="base-drawer-title"
      {...props}
    />
  );
}

function BaseDrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="base-drawer-description"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Panel (scrollable body)
// ---------------------------------------------------------------------------

function BaseDrawerPanel({
  className,
  scrollFade = false,
  scrollable = true,
  allowSelection = true,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  scrollFade?: boolean;
  scrollable?: boolean;
  allowSelection?: boolean;
}) {
  const defaultProps = {
    className: cn(
      "p-6 in-[[data-slot=base-drawer-popup]:has([data-slot=base-drawer-header])]:pt-1 in-[[data-slot=base-drawer-popup]:has([data-slot=base-drawer-footer]:not(.border-t))]:pb-1",
      !allowSelection && "cursor-default",
      className,
    ),
    "data-slot": "base-drawer-panel",
  };

  const content = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <BaseDrawerContent render={render} /> : render,
  });

  if (scrollable) {
    return (
      <ScrollArea className="touch-auto" fadeEdges={scrollFade}>
        {content}
      </ScrollArea>
    );
  }

  return content;
}

// ---------------------------------------------------------------------------
// Bar (drag handle indicator)
// ---------------------------------------------------------------------------

function BaseDrawerBar({
  className,
  position: positionProp,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  position?: DrawerPosition;
}) {
  const { position: contextPosition } = React.useContext(DrawerContext);
  const position = positionProp ?? contextPosition;
  const horizontal = position === "left" || position === "right";

  const defaultProps = {
    "aria-hidden": true as const,
    className: cn(
      "absolute flex touch-none items-center justify-center p-3 before:rounded-full before:bg-input",
      horizontal
        ? "inset-y-0 before:h-12 before:w-1"
        : "inset-x-0 before:h-1 before:w-12",
      position === "top" && "bottom-0",
      position === "bottom" && "top-0",
      position === "left" && "right-0",
      position === "right" && "left-0",
      className,
    ),
    "data-slot": "base-drawer-bar",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

// ---------------------------------------------------------------------------
// Menu components
// ---------------------------------------------------------------------------

function BaseDrawerMenu({
  className,
  render,
  ...props
}: useRender.ComponentProps<"nav">) {
  const defaultProps = {
    className: cn("-m-2 flex flex-col", className),
    "data-slot": "base-drawer-menu",
  };

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(defaultProps, props),
    render,
  });
}

function BaseDrawerMenuItem({
  className,
  variant = "default",
  render,
  disabled,
  ...props
}: useRender.ComponentProps<"button"> & {
  variant?: "default" | "destructive";
}) {
  const defaultProps = {
    className: cn(
      "flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-64 data-[variant=destructive]:text-destructive-foreground sm:min-h-8 sm:text-sm [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4.5 sm:[&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:-mx-0.5 [&>svg]:shrink-0",
      className,
    ),
    "data-slot": "base-drawer-menu-item",
    "data-variant": variant,
    disabled,
    type: "button" as const,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}

function BaseDrawerMenuSeparator({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const defaultProps = {
    className: cn("mx-2 my-1 h-px bg-border", className),
    "data-slot": "base-drawer-menu-separator",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

function BaseDrawerMenuGroup({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const defaultProps = {
    className: cn("flex flex-col", className),
    "data-slot": "base-drawer-menu-group",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

function BaseDrawerMenuGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const defaultProps = {
    className: cn(
      "px-2 py-1.5 font-medium text-muted-foreground text-xs",
      className,
    ),
    "data-slot": "base-drawer-menu-group-label",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });
}

function BaseDrawerMenuTrigger({
  className,
  children,
  ...props
}: DrawerPrimitive.Trigger.Props) {
  return (
    <BaseDrawerTrigger
      className={cn(
        "flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground sm:min-h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      data-slot="base-drawer-menu-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto -me-0.5 opacity-80" />
    </BaseDrawerTrigger>
  );
}

function BaseDrawerMenuCheckboxItem({
  className,
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  variant = "default",
  disabled,
  render,
  ...props
}: CheckboxPrimitive.Root.Props & {
  variant?: "default" | "switch";
  render?: React.ReactElement;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      className={cn(
        "grid min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-8 sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
        variant === "switch"
          ? "grid-cols-[1fr_auto] gap-4 pe-1.5"
          : "grid-cols-[1rem_1fr] pe-4",
        className,
      )}
      data-slot="base-drawer-menu-checkbox-item"
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      render={render}
      {...props}
    >
      {variant === "switch" ? (
        <>
          <span className="col-start-1">{children}</span>
          <CheckboxPrimitive.Indicator
            className="col-start-2 inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] duration-200 [--thumb-size:1rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-checked:bg-primary data-unchecked:bg-input data-disabled:opacity-64 sm:[--thumb-size:0.75rem]"
            keepMounted
          >
            <span className="pointer-events-none block aspect-square h-full origin-left rounded-[var(--thumb-size)] bg-background shadow-sm will-change-transform in-[[data-slot=base-drawer-menu-checkbox-item][data-checked]]:origin-[var(--thumb-size)_50%] in-[[data-slot=base-drawer-menu-checkbox-item][data-checked]]:translate-x-[calc(var(--thumb-size)-4px)] in-[[data-slot=base-drawer-menu-checkbox-item]:active]:not-data-disabled:scale-x-110 [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]" />
          </CheckboxPrimitive.Indicator>
        </>
      ) : (
        <>
          <CheckboxPrimitive.Indicator className="col-start-1">
            <svg
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
            </svg>
          </CheckboxPrimitive.Indicator>
          <span className="col-start-2">{children}</span>
        </>
      )}
    </CheckboxPrimitive.Root>
  );
}

function BaseDrawerMenuRadioGroup({
  className,
  ...props
}: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      className={cn("flex flex-col", className)}
      data-slot="base-drawer-menu-radio-group"
      {...props}
    />
  );
}

function BaseDrawerMenuRadioItem({
  className,
  children,
  value,
  disabled,
  render,
  ...props
}: RadioPrimitive.Root.Props & {
  value: string;
  render?: React.ReactElement;
}) {
  return (
    <RadioPrimitive.Root
      className={cn(
        "grid min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-64 sm:min-h-8 sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
        "grid-cols-[1rem_1fr] items-center pe-4",
        className,
      )}
      data-slot="base-drawer-menu-radio-item"
      disabled={disabled}
      render={render}
      value={value}
      {...props}
    >
      <RadioPrimitive.Indicator className="col-start-1">
        <svg
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </RadioPrimitive.Indicator>
      <span className="col-start-2">{children}</span>
    </RadioPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  BaseDrawer,
  BaseDrawerBackdrop,
  BaseDrawerBar,
  BaseDrawerClose,
  BaseDrawerContent,
  BaseDrawerDescription,
  BaseDrawerFooter,
  BaseDrawerHeader,
  BaseDrawerIndent,
  BaseDrawerIndentBackground,
  BaseDrawerMenu,
  BaseDrawerMenuCheckboxItem,
  BaseDrawerMenuItem,
  BaseDrawerMenuGroup,
  BaseDrawerMenuGroupLabel,
  BaseDrawerMenuRadioGroup,
  BaseDrawerMenuRadioItem,
  BaseDrawerMenuSeparator,
  BaseDrawerMenuTrigger,
  BaseDrawerPanel,
  BaseDrawerPopup,
  BaseDrawerPortal,
  BaseDrawerProvider,
  BaseDrawerSwipeArea,
  BaseDrawerTitle,
  BaseDrawerTrigger,
  BaseDrawerViewport,
  createBaseDrawerHandle,
  DrawerPrimitive,
};

export type { DrawerPosition };
