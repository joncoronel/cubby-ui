"use client";

import type { ReactNode } from "react";
// import {
//   Collapsible,
//   CollapsibleTrigger,
//   CollapsibleContent,
// } from "@/registry/default/collapsible/collapsible";
import { ChevronRight } from "lucide-react";
import { Collapsible } from "@base-ui-components/react/collapsible";

interface ApiPropProps {
  name: string;
  fullType: string;
  simpleType?: string;
  defaultValue?: string;
  required?: boolean;
  children: ReactNode;
}

export function ApiProp({
  name,
  fullType,
  simpleType,
  defaultValue,
  required = false,
  children,
}: ApiPropProps) {
  return (
    <Collapsible.Root
      data-slot="collapsible"
      className="group/collapsible border-border/60 col-span-2 grid grid-cols-subgrid border-x border-b last:rounded-b-lg sm:col-span-3 md:col-span-4 [&:last-child>div[data-slot='collapsible-panel']]:border-b-0 [div[data-slot='header']+&]:rounded-t-lg [div[data-slot='header']+&]:border-t"
    >
      <Collapsible.Trigger
        data-slot="collapsible-trigger"
        className="group/collapsible-trigger bg-card hover:bg-accent focus-visible:outline-ring/50 ease-out-cubic col-span-2 grid grid-cols-subgrid transition-[outline-width,outline-offset,outline-color,border-radius] duration-100 group-last:rounded-b-lg group-last/collapsible:not-data-[panel-open]:rounded-b-lg focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-span-3 md:col-span-4 [div[data-slot='header']+*>&]:rounded-t-lg"
      >
        {/* Column 1 - Prop name */}
        <div className="flex cursor-pointer items-center gap-2 px-3">
          <code className="text-foreground py-2.5 pr-4 font-mono text-sm font-medium">
            {name}
          </code>
          {required && (
            <span className="bg-danger text-danger-foreground rounded px-1.5 py-0.5 text-xs font-medium">
              required
            </span>
          )}
        </div>

        {/* Column 2 (sm+) - Type */}
        <div className="hidden cursor-pointer items-center px-3 sm:flex">
          <code className="text-muted-foreground py-2.5 pr-4 text-start font-mono text-sm">
            {simpleType || fullType}
          </code>
        </div>

        {/* Column 3 (md+) - Default */}
        <div className="hidden cursor-pointer items-center px-3 md:flex">
          <code className="text-muted-foreground py-2.5 pr-4 font-mono text-sm">
            {defaultValue !== undefined ? defaultValue : "—"}
          </code>
        </div>

        {/* Chevron - Column 2 (mobile), Column 3 (sm+), Column 4 (md+) */}
        <div className="flex cursor-pointer items-center justify-center px-3 sm:col-start-3 md:col-start-4">
          <ChevronRight className="text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-250 group-data-[panel-open]/collapsible-trigger:rotate-90" />
        </div>
      </Collapsible.Trigger>

      {/* Content - spans all columns (responsive) */}
      <Collapsible.Panel
        data-slot="collapsible-panel"
        className="ease-out-cubic col-span-2 grid h-[var(--collapsible-panel-height)] grid-cols-subgrid overflow-hidden text-sm transition-all duration-250 group-last/collapsible:rounded-b-lg data-[ending-style]:h-0 data-[ending-style]:opacity-0 data-[starting-style]:h-0 data-[starting-style]:opacity-0 sm:col-span-3 md:col-span-4"
      >
        <div className="bg-muted text-foreground col-span-2 grid grid-cols-subgrid sm:col-span-3 md:col-span-4">
          {/* Row 2: Description */}
          <div className="col-span-full grid grid-cols-subgrid">
            <div className="text-muted-foreground px-3 py-2.5 text-sm font-medium">
              Description
            </div>
            <div className="col-span-full min-w-0 px-3 py-2.5 text-sm leading-relaxed sm:col-span-2 md:col-span-3">
              {children}
            </div>
          </div>

          {/* Row 3: Type */}
          <div className="col-span-full grid grid-cols-subgrid">
            <div className="text-muted-foreground px-3 py-2.5 text-sm font-medium">
              Type
            </div>
            <code className="col-span-full min-w-0 px-3 py-2.5 font-mono text-sm sm:col-span-2 md:col-span-3">
              {fullType}
            </code>
          </div>
          {/* Row 4: Default */}
          <div className="col-span-full grid grid-cols-subgrid md:hidden">
            <div className="text-muted-foreground px-3 py-2.5 text-sm font-medium">
              Default
            </div>
            <code className="col-span-full min-w-0 px-3 py-2.5 font-mono text-sm sm:col-span-2 md:col-span-3">
              {defaultValue !== undefined ? defaultValue : "—"}
            </code>
          </div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

interface ApiPropsListProps {
  children: ReactNode;
}

export function ApiPropsList({ children }: ApiPropsListProps) {
  return (
    <div className="not-prose bg-muted my-6 rounded-2xl p-1 pt-0">
      {/* Outer container with muted background and padding */}

      {/* Inner container with card background */}
      <div className="grid grid-cols-[auto_min-content] sm:grid-cols-[auto_1fr_min-content] md:grid-cols-[auto_1fr_auto_min-content]">
        {/* Header row - Prop (always visible) */}
        <div data-slot="header" className="px-4 py-2.5 font-medium">
          <div className="text-muted-foreground text-sm">Prop</div>
        </div>

        {/* Header row - Type (hidden on mobile, visible sm+) */}
        <div
          data-slot="header"
          className="hidden px-4 py-2.5 font-medium sm:block"
        >
          <div className="text-muted-foreground text-sm">Type</div>
        </div>

        {/* Header row - Default (hidden until md) */}
        <div
          data-slot="header"
          className="hidden px-4 py-2.5 font-medium md:block"
        >
          <div className="text-muted-foreground text-sm">Default</div>
        </div>

        {/* Header row - Chevron column (always visible, empty) */}
        <div data-slot="header" className="px-4 py-2.5 font-medium">
          {/* Empty header for chevron column */}
        </div>

        {/* Props list - children participate in parent grid */}
        {children}
      </div>
    </div>
  );
}
