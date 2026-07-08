"use client";

import * as React from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";

import { cn } from "@/lib/utils";
import { Toggle, type ToggleProps } from "@/registry/default/toggle/toggle";

type ToggleGroupSize = "sm" | "default" | "lg";
type ToggleGroupVariant = "solid" | "outline" | "ghost";

export type ToggleGroupProps = BaseToggleGroup.Props & {
  /** Cell size, propagated to child `ToggleGroupItem`s that don't set their own. */
  size?: ToggleGroupSize;
  /** Container chrome: filled track, bordered track, or none. */
  variant?: ToggleGroupVariant;
  /** Split the buttons into standalone pills with gaps instead of one track. */
  detached?: boolean;
  /** Hairline dividers between attached cells. Ignored when `detached` or `outline`. */
  separators?: boolean;
};

// Config the group hands its items. Internal to this file — `Toggle` never reads
// it, so it stays a standalone primitive.
type ToggleGroupContextValue = {
  size?: ToggleGroupSize;
  variant?: ToggleGroupVariant;
  detached?: boolean;
};
const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({});

// Literal classes so the Tailwind scanner keeps them.
const TRACK_RADIUS: Record<ToggleGroupSize, string> = {
  sm: "rounded-md",
  default: "rounded-lg",
  lg: "rounded-xl",
};
const CELL_RADIUS: Record<ToggleGroupSize, string> = {
  sm: "**:data-[slot=toggle]:rounded-md",
  default: "**:data-[slot=toggle]:rounded-lg",
  lg: "**:data-[slot=toggle]:rounded-xl",
};

// Attached cells read as one control: uniform neutral selection regardless of
// variant (the app's standard selected-state overlay; text stays full-contrast
// from the base). Detached cells opt out and keep their own Toggle variant's
// pressed identity instead.
// For an accent look, override via className, e.g.
//   className="**:data-[slot=toggle]:data-pressed:bg-primary/10 **:data-[slot=toggle]:data-pressed:text-info-foreground"
const SELECTED = "**:data-[slot=toggle]:data-pressed:bg-surface-selected";

// Shared cell resets for the attached variants.
const ATTACHED_CELL =
  "**:data-[slot=toggle]:relative **:data-[slot=toggle]:shadow-none **:data-[slot=toggle]:active:scale-100 **:data-[slot=toggle]:focus-visible:z-10";

function ToggleGroup({
  className,
  size = "default",
  variant = "solid",
  detached = false,
  separators = true,
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <BaseToggleGroup
      data-slot="toggle-group"
      data-variant={variant}
      data-detached={detached ? "" : undefined}
      className={cn(
        "inline-flex w-fit items-stretch data-[orientation=vertical]:flex-col",
        "[&[data-orientation=vertical]_[data-slot=toggle]]:w-full",
        detached
          ? // Detached: each cell is a standalone Toggle of the group's variant,
            // so it paints itself — the group only lays them out.
            "items-center gap-1.5 data-[orientation=vertical]:items-stretch"
          : variant === "outline"
            ? [
                // Outline: cells are Toggle `outline`s (see ToggleGroupItem), so they
                // paint themselves — bg-card, an opaque same-family `--outline-hover`,
                // and a border kept through press. That fixes the dark-mode darkening a
                // neutral overlay caused. The group only collapses the borders: adjacent
                // rules merge into one that frames the control and divides the cells.
                ATTACHED_CELL,
                CELL_RADIUS[size],
                "data-[orientation=horizontal]:**:data-[slot=toggle]:not-first:border-s-0 data-[orientation=horizontal]:**:data-[slot=toggle]:not-first:rounded-s-none data-[orientation=horizontal]:**:data-[slot=toggle]:not-last:rounded-e-none",
                "data-[orientation=vertical]:**:data-[slot=toggle]:not-first:border-t-0 data-[orientation=vertical]:**:data-[slot=toggle]:not-first:rounded-t-none data-[orientation=vertical]:**:data-[slot=toggle]:not-last:rounded-b-none",
              ]
            : [
                // Solid / ghost: one connected track; cells flatten and inherit the track's
                // corner radius on the ends (size-agnostic), with floating ::before dividers.
                SELECTED,
                TRACK_RADIUS[size],
                variant === "solid" && "bg-muted",
                // ghost: no container chrome.
                ATTACHED_CELL,
                "**:data-[slot=toggle]:rounded-none **:data-[slot=toggle]:border-0 **:data-[slot=toggle]:bg-transparent",
                "**:data-[slot=toggle]:first:rounded-s-[inherit] **:data-[slot=toggle]:last:rounded-e-[inherit] data-[orientation=vertical]:**:data-[slot=toggle]:first:rounded-s-none data-[orientation=vertical]:**:data-[slot=toggle]:last:rounded-e-none data-[orientation=vertical]:**:data-[slot=toggle]:first:rounded-t-[inherit] data-[orientation=vertical]:**:data-[slot=toggle]:last:rounded-b-[inherit]",
                separators && [
                  // Floating inset rule at 50% that tracks its cell's ink.
                  "**:data-[slot=toggle]:not-first:before:pointer-events-none **:data-[slot=toggle]:not-first:before:absolute **:data-[slot=toggle]:not-first:before:z-0 **:data-[slot=toggle]:not-first:before:content-[''] **:data-[slot=toggle]:not-first:before:rounded-full **:data-[slot=toggle]:not-first:before:bg-current **:data-[slot=toggle]:not-first:before:opacity-15",
                  "**:data-[slot=toggle]:not-first:before:top-1/4 **:data-[slot=toggle]:not-first:before:left-0 **:data-[slot=toggle]:not-first:before:h-1/2 **:data-[slot=toggle]:not-first:before:w-px",
                  "data-[orientation=vertical]:**:data-[slot=toggle]:not-first:before:top-0 data-[orientation=vertical]:**:data-[slot=toggle]:not-first:before:left-1/4 data-[orientation=vertical]:**:data-[slot=toggle]:not-first:before:h-px data-[orientation=vertical]:**:data-[slot=toggle]:not-first:before:w-1/2",
                ],
              ],
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant, detached }}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup>
  );
}

export type ToggleGroupItemProps = ToggleProps;

function ToggleGroupItem({ variant, size, ...props }: ToggleGroupItemProps) {
  const group = React.useContext(ToggleGroupContext);
  const resolvedSize = size ?? group.size ?? "default";
  // Detached cells own their variant (reusing the Toggle cva). Attached `outline`
  // reuses the Toggle `outline` too so its states stay in the card family; solid /
  // ghost cells are flattened and painted by the group, so they render as ghost.
  const resolvedVariant = group.detached
    ? (variant ?? group.variant ?? "solid")
    : group.variant === "outline"
      ? "outline"
      : "ghost";

  return <Toggle variant={resolvedVariant} size={resolvedSize} {...props} />;
}

export { ToggleGroup, ToggleGroupItem };
