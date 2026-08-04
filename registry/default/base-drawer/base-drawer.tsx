"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/default/button/button";
import {
  INNER_EDGE_FROM_ATTACH_SIDE,
  elevatedSurface,
  flushSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import { ScrollArea } from "@/registry/default/scroll-area/scroll-area";
import {
  SwitchVisual,
  type SwitchVisualProps,
} from "@/registry/default/switch/switch";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

// The tick draws itself in on check. `pathLength` restates the path as 1 unit
// long, so the dash values are fractions of the stroke and survive a HugeIcons
// reshape. Deriving the icon array is the only way to reach the path.
const tickIcon = Tick02Icon.map(([tag, attrs]) => [
  tag,
  { ...attrs, pathLength: 1 },
]) as typeof Tick02Icon;

const checkmarkClasses =
  "[&_path]:ease-out-expo [&_path]:transition-[stroke-dashoffset] [&_path]:duration-150 [&_path]:[stroke-dasharray:1] in-data-checked:[&_path]:[stroke-dashoffset:0] in-data-unchecked:[&_path]:[stroke-dashoffset:1] motion-reduce:[&_path]:transition-none";

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

const BaseDrawerPortal: typeof DrawerPrimitive.Portal = DrawerPrimitive.Portal;

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

function BaseDrawerProvider({ ...props }: DrawerPrimitive.Provider.Props) {
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
        "transition-[transform,border-radius] duration-400 ease-[cubic-bezier(.32,.72,0,1)]",
        "data-active:scale-[0.94] data-active:overflow-hidden data-active:rounded-lg",
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

function BaseDrawerBackdrop({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 opacity-[calc(1-var(--drawer-swipe-progress))] backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      data-slot="base-drawer-backdrop"
      {...props}
    />
  );
}

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
        variant === "floating" && "px-(--inset) [--inset:1rem]",
        variant === "floating" && position !== "bottom" && "pt-(--inset)",
        variant === "floating" && position !== "top" && "pb-(--inset)",
        className,
      )}
      data-slot="base-drawer-viewport"
      {...props}
    />
  );
}

function BaseDrawerPopup({
  className,
  children,
  showCloseButton = false,
  position: positionProp,
  variant = "default",
  showBar = false,
  level = 5,
  shadowLevel = 5,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showCloseButton?: boolean;
  position?: DrawerPosition;
  variant?: "default" | "floating";
  showBar?: boolean;
  /** Surface elevation level (1-8). Defaults to 5 — the dialog/sheet/drawer tier. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 5 by default. */
  shadowLevel?: SurfaceLevel;
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
            "text-popover-foreground relative flex max-h-full min-h-0 w-full min-w-0 flex-col will-change-transform outline-none",
            // Surface elevation — floating variants get the full 4-edge rim
            // overlay; flush (`default`) variants get a single-edge rim only
            // on the inner-facing edge so the other edges don't show a 1px
            // line at the viewport boundary.
            variant === "floating"
              ? elevatedSurface(level, shadowLevel)
              : flushSurface(level, INNER_EDGE_FROM_ATTACH_SIDE[position]),
            // Transition
            "transition-[transform,box-shadow,height,background-color] duration-400 ease-[cubic-bezier(.32,.72,0,1)]",
            "touch-none",
            // Stack calculation variables
            "[--peek:1.5rem] [--stack-step:0.05]",
            "[--stack-progress:clamp(0,var(--drawer-swipe-progress),1)]",
            "[--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))]",
            "[--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)]",
            "[--shrink:calc(1-var(--scale))]",
            "[--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]",
            // Bleed pseudo (fills gap when dragged past edge) — uses ::before so ::after stays free for the rim overlay
            "before:pointer-events-none before:absolute before:bg-(--popup-surface,var(--popover))",
            // States
            "data-swiping:select-none",
            "data-nested-drawer-open:overflow-hidden",
            "data-ending-style:shadow-transparent data-starting-style:shadow-transparent",
            "data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)]",
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
                "data-ending-style:mb-0 data-starting-style:mb-0",
                "data-ending-style:pb-0 data-starting-style:pb-0",
                // Transition includes margin/padding for snap changes but not enter/exit
                "not-data-starting-style:not-data-ending-style:transition-[transform,box-shadow,height,background-color,margin,padding]",
                // Bleed pseudo
                "before:inset-x-0 before:top-full before:h-(--bleed)",
                // Bar support
                "has-data-[slot=base-drawer-bar]:pt-2",
                // Nested stacking
                "h-(--drawer-height,auto)",
                "[--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))]",
                "data-nested-drawer-open:h-(--height)",
                "origin-[50%_calc(100%-var(--inset))]",
                "data-nested-drawer-open:transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))]",
              ),
            // --- Position: top ---
            position === "top" &&
              cn(
                "transform-[translateY(var(--drawer-swipe-movement-y))]",
                "data-starting-style:transform-[translateY(calc(-100%-var(--inset)))]",
                "data-ending-style:transform-[translateY(calc(-100%-var(--inset)))]",
                "before:inset-x-0 before:bottom-full before:h-(--bleed)",
                "has-data-[slot=base-drawer-bar]:pb-2",
                // Nested stacking
                "h-(--drawer-height,auto)",
                "[--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))))]",
                "data-nested-drawer-open:h-(--height)",
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
                "before:inset-y-0 before:end-full before:w-(--bleed)",
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
                "before:inset-y-0 before:start-full before:w-(--bleed)",
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
                  "rounded-2xl before:bg-transparent",
                ),
            className,
          )}
          data-slot="base-drawer-popup"
          data-level={level}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close
              aria-label="Close"
              className="absolute end-2 top-2"
              render={<Button size="icon_sm" variant="ghost" />}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </DrawerPrimitive.Close>
          )}
          {showBar && <BaseDrawerBar />}
        </DrawerPrimitive.Popup>
      </BaseDrawerViewport>
    </BaseDrawerPortal>
  );
}

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
        "border-t bg-muted pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]",
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

function BaseDrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
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
      "absolute flex touch-none items-center justify-center p-3 before:rounded-full before:bg-muted-foreground/30",
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
      "flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none focus-visible:outline-ring/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid hover:bg-surface-hover hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-60 data-[variant=destructive]:text-destructive-foreground sm:min-h-8 sm:text-sm [&>svg:not([class*='opacity-'])]:opacity-80 [&>svg:not([class*='size-'])]:size-4.5 sm:[&>svg:not([class*='size-'])]:size-4 [&>svg]:pointer-events-none [&>svg]:-mx-0.5 [&>svg]:shrink-0",
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
        "text-foreground hover:bg-surface-hover hover:text-accent-foreground focus-visible:outline-ring/50 flex min-h-9 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1 text-base outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid sm:min-h-8 sm:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-slot="base-drawer-menu-trigger"
      {...props}
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="ms-auto -me-0.5 opacity-80"
        strokeWidth={2}
      />
    </BaseDrawerTrigger>
  );
}

function BaseDrawerMenuCheckboxItem({
  className,
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  indicator = "check",
  switchColor = "primary",
  switchShape = "circle",
  switchSize = "sm",
  switchMotion = "default",
  disabled,
  render,
  ...props
}: CheckboxPrimitive.Root.Props & {
  /** Which indicator sits in the right-hand column. `"switch"` is visual only. */
  indicator?: "check" | "switch";
  /** Checked track colour, when `indicator="switch"`. */
  switchColor?: SwitchVisualProps["color"];
  /** Thumb silhouette, when `indicator="switch"`. */
  switchShape?: SwitchVisualProps["shape"];
  /** Thumb size, when `indicator="switch"`. Defaults to `sm` for the drawer's taller touch rows. */
  switchSize?: SwitchVisualProps["size"];
  /** How the thumb travels, when `indicator="switch"`. */
  switchMotion?: SwitchVisualProps["motion"];
  render?: React.ReactElement;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      className={cn(
        "text-foreground hover:bg-surface-hover hover:text-accent-foreground focus-visible:outline-ring/50 grid min-h-9 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1 text-base outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid data-disabled:pointer-events-none data-disabled:opacity-60 sm:min-h-8 sm:text-sm [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        // `group/switch` lets a switch indicator pick up the row's press
        // state, so the whole row behaves as the control rather than just the
        // switch. Named, so an unrelated `.group` on an ancestor cannot.
        "group/switch",
        indicator === "switch"
          ? "grid-cols-[1fr_auto] gap-4 pe-1.5"
          : "grid-cols-[1fr_1.125rem] pe-2 sm:grid-cols-[1fr_1rem]",
        className,
      )}
      data-slot="base-drawer-menu-checkbox-item"
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      render={render}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      {indicator === "switch" ? (
        <SwitchVisual
          color={switchColor}
          shape={switchShape}
          size={switchSize}
          motion={switchMotion}
          // Touch-sized on mobile, matching the taller drawer rows; drops to
          // the same 14px thumb the desktop menus use (`size="xs"`) from `sm`
          // up. Responsive sizing can't come from the cva variant.
          className="col-start-2 sm:[--thumb-size:--spacing(3.5)]"
          // Checkbox.Indicator does not inject aria-hidden the way the menu
          // primitives do, and this span sits inside the row's accessible name.
          aria-hidden
          render={<CheckboxPrimitive.Indicator keepMounted />}
        />
      ) : (
        <CheckboxPrimitive.Indicator
          className="col-start-2 flex items-center justify-center"
          aria-hidden
          keepMounted
        >
          <HugeiconsIcon
            icon={tickIcon}
            strokeWidth={2.5}
            className={cn("size-4.5 sm:size-4", checkmarkClasses)}
          />
        </CheckboxPrimitive.Indicator>
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
        "text-foreground hover:bg-surface-hover hover:text-accent-foreground focus-visible:outline-ring/50 grid min-h-9 w-full cursor-default items-center gap-2 rounded-sm px-2 py-1 text-base outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid data-disabled:pointer-events-none data-disabled:opacity-60 sm:min-h-8 sm:text-sm [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4",
        "grid-cols-[1fr_1.125rem] items-center pe-2 sm:grid-cols-[1fr_1rem]",
        className,
      )}
      data-slot="base-drawer-menu-radio-item"
      disabled={disabled}
      render={render}
      value={value}
      {...props}
    >
      <span className="col-start-1 flex min-w-0 items-center gap-2">
        {children}
      </span>
      {/* Radio.Indicator, like Checkbox.Indicator, leaves aria-hidden to us. */}
      <RadioPrimitive.Indicator
        className="col-start-2 flex items-center justify-center"
        aria-hidden
        keepMounted
      >
        <HugeiconsIcon
          icon={tickIcon}
          strokeWidth={2.5}
          className={cn("size-4.5 sm:size-4", checkmarkClasses)}
        />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

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
