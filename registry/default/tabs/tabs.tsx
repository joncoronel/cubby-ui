"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";

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
        "data-[size=medium]:p-1 data-[size=small]:p-0.5",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:self-start",
        // box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.02) inset, 0px 0.75px 0.75px 0px rgba(0, 0, 0, 0.02) inset, 0px 0.25px 0.25px 0px rgba(0, 0, 0, 0.04) inset;
        "data-[orientation=horizontal]:data-[size=medium]:gap-x-1 data-[orientation=horizontal]:data-[size=small]:gap-x-0.5",
        "data-[variant=capsule]:bg-muted data-[variant=capsule]:rounded-xl",
        "data-[variant=underline]:data-[orientation=vertical]:py-0",
        "data-[variant=underline]:data-[orientation=vertical]:data-[side=left]:[&_[data-slot=tabs-trigger]]:justify-end",
        "data-[variant=underline]:data-[orientation=vertical]:data-[side=right]:[&_[data-slot=tabs-trigger]]:justify-start",
        className,
      )}
      {...props}
    >
      {children}
      <div
        data-slot="tabs-divider"
        className="bg-muted absolute top-0 bottom-0 hidden w-[2px] rounded-full group-data-[side=left]/tabs-list:right-0 group-data-[side=right]/tabs-list:left-0 group-data-[variant=underline]/tabs-list:group-data-[orientation=vertical]/tabs-list:block"
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
  variant,
  size,
  side,
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
      data-variant={variant}
      data-size={size}
      data-side={side}
      className={cn(
        "ease-out-cubic absolute transition-all duration-200",
        "data-[orientation=vertical]:top-0 data-[orientation=vertical]:h-[var(--active-tab-height)] data-[orientation=vertical]:translate-y-[var(--active-tab-top)]",
        "data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:w-[var(--active-tab-width)] data-[orientation=horizontal]:translate-x-[var(--active-tab-left)] data-[orientation=horizontal]:-translate-y-1/2",
        // Underline variant
        "data-[variant=underline]:data-[orientation=vertical]:bg-neutral data-[variant=underline]:data-[orientation=vertical]:w-[2px] data-[variant=underline]:data-[orientation=vertical]:rounded-full",
        "data-[variant=underline]:data-[orientation=vertical]:data-[side=left]:right-0 data-[variant=underline]:data-[orientation=vertical]:data-[side=right]:left-0",
        "data-[variant=underline]:data-[orientation=horizontal]:bg-neutral data-[variant=underline]:data-[orientation=horizontal]:top-full data-[variant=underline]:data-[orientation=horizontal]:h-px data-[variant=underline]:data-[orientation=horizontal]:rounded-full",
        // Capsule variant
        "data-[variant=capsule]:data-[orientation=vertical]:bg-card data-[variant=capsule]:data-[orientation=vertical]:dark:bg-accent data-[variant=capsule]:data-[orientation=vertical]:ring-border/25 data-[variant=capsule]:data-[orientation=vertical]:dark:ring-border data-[variant=capsule]:data-[orientation=vertical]:w-auto data-[variant=capsule]:data-[orientation=vertical]:shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.06)] data-[variant=capsule]:data-[orientation=vertical]:ring-1",
        "data-[variant=capsule]:data-[orientation=vertical]:data-[size=small]:right-0.5 data-[variant=capsule]:data-[orientation=vertical]:data-[size=small]:left-0.5",
        "data-[variant=capsule]:data-[orientation=vertical]:data-[size=medium]:right-1 data-[variant=capsule]:data-[orientation=vertical]:data-[size=medium]:left-1",
        "data-[variant=capsule]:data-[orientation=horizontal]:bg-card data-[variant=capsule]:data-[orientation=horizontal]:dark:bg-accent data-[variant=capsule]:data-[orientation=horizontal]:ring-border/25 data-[variant=capsule]:data-[orientation=horizontal]:dark:ring-border data-[variant=capsule]:data-[orientation=horizontal]:top-1/2 data-[variant=capsule]:data-[orientation=horizontal]:h-[var(--active-tab-height)] data-[variant=capsule]:data-[orientation=horizontal]:shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.06)] data-[variant=capsule]:data-[orientation=horizontal]:ring-0",
        "data-[variant=capsule]:rounded-sm data-[variant=capsule]:data-[size=medium]:rounded-md",
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
