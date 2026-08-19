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

// Shared cell resets for the attached variants. Press-scale is deliberately NOT
// reset here: the Toggle recipe scales only its paint pseudo-element, so a cell
// presses by shrinking its own fill inside the track while the label, the track,
// and the dividers hold still — the same thing an attached Button does in a
// ButtonGroup. Careful adding `after:` utilities to cells: Tailwind's `after:`
// variant also emits `content: ""`, so a rule that only means to tweak a property
// materializes an in-flow pseudo, which the cell's `gap` then pushes out to 8px
// of phantom width. Only style ::after alongside `absolute` (as the dividers do).
const ATTACHED_CELL =
  "**:data-[slot=toggle]:shadow-none **:data-[slot=toggle]:focus-visible:z-10";

function ToggleGroup({
  className,
  size = "default",
  variant = "solid",
  detached = false,
  separators = true,
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo(
    () => ({ size, variant, detached }),
    [size, variant, detached],
  );

  // Cell styling lives here on the parent, via **:data-[slot=toggle]: descendant
  // selectors, rather than on ToggleGroupItem — on purpose. The item owns cell
  // *identity* (variant/size, fed through context); the group owns *adjacency*:
  // border collapse, end-cap radius, dividers, and track chrome. Keeping it
  // parent-side also makes the neutral-selection accent a single group-level
  // override hook (see toggle-group-custom-color). The selectors reach any
  // descendant [data-slot=toggle] so they don't depend on the item wrapper, but
  // they assume the variant ToggleGroupItem resolves: attached cells render as
  // `ghost` or `outline`, never `solid`, which is what leaves ::after free for
  // the dividers below.
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
                // paint themselves — a card fill and an opaque same-family
                // `--outline-hover`, both on the cell's ::before, with the border a
                // token that survives selection. That fixes the dark-mode darkening a
                // neutral overlay caused. The group only collapses the borders: adjacent
                // rules merge into one that frames the control and divides the cells.
                ATTACHED_CELL,
                CELL_RADIUS[size],
                "data-[orientation=horizontal]:**:data-[slot=toggle]:not-first:rounded-s-none data-[orientation=horizontal]:**:data-[slot=toggle]:not-last:rounded-e-none data-[orientation=horizontal]:**:data-[slot=toggle]:not-first:before:border-s-0",
                "data-[orientation=vertical]:**:data-[slot=toggle]:not-first:rounded-t-none data-[orientation=vertical]:**:data-[slot=toggle]:not-last:rounded-b-none data-[orientation=vertical]:**:data-[slot=toggle]:not-first:before:border-t-0",
              ]
            : [
                // Solid / ghost: one connected track; cells flatten and inherit the track's
                // corner radius on the ends (size-agnostic), with floating ::after dividers.
                // Each cell's own paint tokens (ghost → surface-selected when on) provide
                // the selected look, so the group sets no fill on the cells at all: the
                // track chrome below is the group's own background, not the cells'.
                TRACK_RADIUS[size],
                variant === "solid" && "bg-muted",
                // ghost: no container chrome.
                ATTACHED_CELL,
                "**:data-[slot=toggle]:rounded-none **:data-[slot=toggle]:before:border-0",
                "**:data-[slot=toggle]:first:rounded-s-[inherit] **:data-[slot=toggle]:last:rounded-e-[inherit] data-[orientation=vertical]:**:data-[slot=toggle]:first:rounded-s-none data-[orientation=vertical]:**:data-[slot=toggle]:first:rounded-t-[inherit] data-[orientation=vertical]:**:data-[slot=toggle]:last:rounded-e-none data-[orientation=vertical]:**:data-[slot=toggle]:last:rounded-b-[inherit]",
                separators && [
                  // Floating inset rule at 50% that tracks its cell's ink. It
                  // rides ::after because ::before is the cell's paint layer
                  // now; attached solid/ghost cells render as `ghost`, whose
                  // ::after is otherwise unused (only `solid` paints one).
                  "**:data-[slot=toggle]:not-first:after:pointer-events-none **:data-[slot=toggle]:not-first:after:absolute **:data-[slot=toggle]:not-first:after:z-0 **:data-[slot=toggle]:not-first:after:rounded-full **:data-[slot=toggle]:not-first:after:bg-current **:data-[slot=toggle]:not-first:after:opacity-15 **:data-[slot=toggle]:not-first:after:content-['']",
                  "**:data-[slot=toggle]:not-first:after:start-0 **:data-[slot=toggle]:not-first:after:top-1/4 **:data-[slot=toggle]:not-first:after:h-1/2 **:data-[slot=toggle]:not-first:after:w-px",
                  "data-[orientation=vertical]:**:data-[slot=toggle]:not-first:after:inset-s-1/4 data-[orientation=vertical]:**:data-[slot=toggle]:not-first:after:top-0 data-[orientation=vertical]:**:data-[slot=toggle]:not-first:after:h-px data-[orientation=vertical]:**:data-[slot=toggle]:not-first:after:w-1/2",
                ],
              ],
        className,
      )}
      {...props}
    >
      {/* Memoized so the context value is stable across the group's re-renders
          — a consumer (ToggleGroupItem) that memoizes on it isn't invalidated
          every time the parent renders for an unrelated reason. Restored after
          a registry refresh dropped it; nothing auto-memoizes this, the React
          Compiler is not enabled here (only its lint rules, via
          eslint-plugin-react-hooks). */}
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup>
  );
}

export type ToggleGroupItemProps = ToggleProps;

/**
 * A cell in a `ToggleGroup`. Accepts all `Toggle` props; `size` and `variant`
 * are inherited from the group through context. A per-item `variant` only takes
 * effect when the group is `detached` — attached cells are painted by the group
 * and ignore it.
 */
function ToggleGroupItem({ variant, size, ...props }: ToggleGroupItemProps) {
  const group = React.use(ToggleGroupContext);
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
