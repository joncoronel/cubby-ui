import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";

import { cn } from "@/lib/utils";

function CollapsibleRoot({ className, ...props }: BaseCollapsible.Root.Props) {
  return (
    <BaseCollapsible.Root
      data-slot="collapsible"
      className={cn("group/collapsible", className)}
      {...props}
    />
  );
}

function CollapsibleTrigger({
  className,
  ...props
}: BaseCollapsible.Trigger.Props) {
  return (
    <BaseCollapsible.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "bg-card border-border hover:bg-accent/30 group hover:text-accent-foreground focus-visible:outline-ring/50 flex w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-medium shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.06)] outline-0 transition-[outline,outline-offset,background-color] duration-[50ms] ease-out focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

function CollapsibleContent({
  className,
  ...props
}: BaseCollapsible.Panel.Props) {
  return (
    <BaseCollapsible.Panel
      data-slot="collapsible-panel"
      className={cn(
        "h-[var(--collapsible-panel-height)] overflow-hidden text-sm transition-all duration-200 ease-out data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

const Collapsible = CollapsibleRoot;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
