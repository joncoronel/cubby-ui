"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

type TabsVariant = "capsule" | "underline";
type TabsSize = "small" | "medium";
type TabsSide = "left" | "right";

function Tabs({ className, ...props }: BaseTabs.Root.Props) {
  return (
    <BaseTabs.Root
      data-slot="tabs"
      className={cn(
        "flex min-w-0 gap-2",
        "data-[orientation=vertical]:flex-row",
        "data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function TabsList({
  variant = "capsule",
  size = "medium",
  side = "left",
  className,
  children,
  ...props
}: BaseTabs.List.Props & {
  variant?: TabsVariant;
  size?: TabsSize;
  side?: TabsSide;
}) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      data-side={side}
      className={cn(
        "group/tabs-list text-muted-foreground relative inline-flex w-fit items-center justify-center gap-1",
        size === "small" && "p-0.5",
        size === "medium" && "p-1",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:self-start",
        size === "small" && "data-[orientation=horizontal]:gap-x-0.5",
        size === "medium" && "data-[orientation=horizontal]:gap-x-1",
        variant === "capsule" && "bg-muted rounded-xl",
        variant === "underline" &&
          "data-[orientation=horizontal]:px-0 data-[orientation=horizontal]:pt-0 data-[orientation=vertical]:py-0",
        variant === "underline" &&
          side === "left" &&
          "data-[orientation=vertical]:**:data-[slot=tabs-trigger]:justify-end",
        variant === "underline" &&
          side === "right" &&
          "data-[orientation=vertical]:**:data-[slot=tabs-trigger]:justify-start",
        className,
      )}
      {...props}
    >
      {children}
      <div
        data-slot="tabs-divider"
        className={cn(
          "bg-accent absolute rounded-full",
          variant === "underline" ? "block" : "hidden",
          // Vertical orientation - translated inward so indicator overlaps on both sides
          "group-data-[orientation=vertical]/tabs-list:top-0 group-data-[orientation=vertical]/tabs-list:bottom-0 group-data-[orientation=vertical]/tabs-list:w-[2px]",
          side === "left" &&
            "group-data-[orientation=vertical]/tabs-list:right-0 group-data-[orientation=vertical]/tabs-list:-translate-x-[0.5px]",
          side === "right" &&
            "group-data-[orientation=vertical]/tabs-list:left-0 group-data-[orientation=vertical]/tabs-list:translate-x-[0.5px]",
          // Horizontal orientation - translated inward so indicator overlaps on both sides
          "group-data-[orientation=horizontal]/tabs-list:bottom-0 group-data-[orientation=horizontal]/tabs-list:right-0 group-data-[orientation=horizontal]/tabs-list:left-0 group-data-[orientation=horizontal]/tabs-list:h-[2px] group-data-[orientation=horizontal]/tabs-list:-translate-y-[0.5px]",
        )}
        aria-hidden="true"
      />
      <TabIndicator variant={variant} size={size} side={side} />
    </BaseTabs.List>
  );
}

function TabsTrigger({ className, ...props }: BaseTabs.Tab.Props) {
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      className={cn(
        "text-muted-foreground data-active:text-foreground focus-visible:outline-ring/30 hover:text-muted-foreground/75 z-[1] flex cursor-pointer items-center gap-1.5 font-medium text-nowrap whitespace-nowrap transition-[outline-offset,color] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[orientation=horizontal]:flex-1 data-[orientation=vertical]:w-full",
        "justify-center",
        "rounded-lg px-2 py-1 text-xs",
        "group-data-[size=medium]/tabs-list:rounded-md group-data-[size=medium]/tabs-list:px-2.5 group-data-[size=medium]/tabs-list:py-1.5 group-data-[size=medium]/tabs-list:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabIndicator({
  variant = "capsule",
  size = "medium",
  side = "left",
  className,
  ...props
}: BaseTabs.Indicator.Props & {
  variant?: TabsVariant;
  size?: TabsSize;
  side?: TabsSide;
}) {
  return (
    <BaseTabs.Indicator
      data-slot="tab-indicator"
      className={cn(
        "ease-out-cubic absolute transition-all duration-200",
        // Vertical orientation (Base UI provides data-orientation)
        "data-[orientation=vertical]:top-0 data-[orientation=vertical]:h-(--active-tab-height) data-[orientation=vertical]:translate-y-(--active-tab-top)",
        // Horizontal orientation
        "data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:w-(--active-tab-width) data-[orientation=horizontal]:translate-x-(--active-tab-left) data-[orientation=horizontal]:-translate-y-1/2",
        // Underline variant
        variant === "underline" && [
          "bg-neutral rounded-full",
          // Vertical: flush against edge, no translation
          "data-[orientation=vertical]:w-0.75",
          side === "left" && "data-[orientation=vertical]:right-0",
          side === "right" && "data-[orientation=vertical]:left-0",
          // Horizontal: flush at bottom, reset translation from base
          "data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:top-auto data-[orientation=horizontal]:h-0.75 data-[orientation=horizontal]:translate-y-0",
        ],
        // Capsule variant
        variant === "capsule" && [
          "bg-card dark:bg-accent border-border/50 dark:border-border border bg-clip-padding shadow-[0_1px_2px_0_oklch(0.18_0_0/0.06)]",
          size === "small" && "rounded-sm",
          size === "medium" && "rounded-md",
          // Vertical: full width with inset, ring visible
          "data-[orientation=vertical]:w-auto",
          size === "small" && "data-[orientation=vertical]:inset-x-0.5",
          size === "medium" && "data-[orientation=vertical]:inset-x-1",
          // Horizontal: height matches tab, no ring
          "data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:h-(--active-tab-height)",
        ],
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  animate = false,
  ...props
}: BaseTabs.Panel.Props & {
  animate?: boolean;
}) {
  return (
    <BaseTabs.Panel
      data-slot="tabs-content"
      data-animate={animate}
      keepMounted={animate}
      className={cn(
        "outline-none",
        !animate && "min-w-0 flex-1",
        animate && [
          // Grid layout for stacked panels
          "min-h-0 min-w-0 [grid-area:1/1]",
          // Transition properties
          "transition-[opacity,display,translate,filter] transition-discrete duration-300 ease-out",
          // Default visible state
          "blur-0 opacity-100",
          "translate-x-0 translate-y-0",
          // // Starting style animations (enter from)
          "starting:not-data-[activation-direction=none]:opacity-0 starting:not-data-[activation-direction=none]:blur-sm",
          "starting:data-[activation-direction='left']:-translate-x-[20px]",
          "starting:data-[activation-direction='right']:translate-x-[20px]",
          "starting:data-[activation-direction='up']:-translate-y-[20px]",
          "starting:data-[activation-direction='down']:translate-y-[20px]",
          "starting:not-data-[activation-direction]:translate-y-[10px]",
          // // Exit animations (data-hidden state)
          "data-[hidden]:pointer-events-none data-[hidden]:opacity-0 data-[hidden]:blur-sm",
          "data-[hidden]:data-[activation-direction='left']:translate-x-[20px]",
          "data-[hidden]:data-[activation-direction='right']:-translate-x-[20px]",
          "data-[hidden]:data-[activation-direction='up']:translate-y-[20px]",
          "data-[hidden]:data-[activation-direction='down']:-translate-y-[20px]",
          "data-[hidden]:not-data-[activation-direction]:translate-y-2.5",
        ],
        className,
      )}
      {...props}
    />
  );
}

function TabsPanels({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-panels"
      className={cn("grid min-w-0", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPanels };
