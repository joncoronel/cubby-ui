import type * as React from "react";

import { cn } from "@/lib/utils";

export type SurfaceLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const SURFACE_BG: Record<SurfaceLevel, string> = {
  1: "bg-surface-1",
  2: "bg-surface-2",
  3: "bg-surface-3",
  4: "bg-surface-4",
  5: "bg-surface-5",
  6: "bg-surface-6",
  7: "bg-surface-7",
  8: "bg-surface-8",
};

export const SURFACE_SHADOW: Record<SurfaceLevel, string> = {
  1: "shadow-surface-1",
  2: "shadow-surface-2",
  3: "shadow-surface-3",
  4: "shadow-surface-4",
  5: "shadow-surface-5",
  6: "shadow-surface-6",
  7: "shadow-surface-7",
  8: "shadow-surface-8",
};

export const SURFACE_RIM: Record<SurfaceLevel, string> = {
  1: "after:shadow-surface-rim-1",
  2: "after:shadow-surface-rim-2",
  3: "after:shadow-surface-rim-3",
  4: "after:shadow-surface-rim-4",
  5: "after:shadow-surface-rim-5",
  6: "after:shadow-surface-rim-6",
  7: "after:shadow-surface-rim-7",
  8: "after:shadow-surface-rim-8",
};

/**
 * Exposes the surface level to descendants as `--popup-surface` so children
 * (arrow fills, sticky labels, fade gradients) can track the popup's level
 * via `bg-(--popup-surface,var(--popover))`.
 */
export const SURFACE_VAR: Record<SurfaceLevel, string> = {
  1: "[--popup-surface:var(--surface-1)]",
  2: "[--popup-surface:var(--surface-2)]",
  3: "[--popup-surface:var(--surface-3)]",
  4: "[--popup-surface:var(--surface-4)]",
  5: "[--popup-surface:var(--surface-5)]",
  6: "[--popup-surface:var(--surface-6)]",
  7: "[--popup-surface:var(--surface-7)]",
  8: "[--popup-surface:var(--surface-8)]",
};

/**
 * Drops + rim insets in a single `box-shadow` (no `::after`). Used by `solidSurface()`.
 * Literal Tailwind classes so the scanner picks them up.
 */
export const SURFACE_SHADOW_COMBINED: Record<SurfaceLevel, string> = {
  1: "shadow-[var(--surface-shadow-1),var(--surface-rim-1)]",
  2: "shadow-[var(--surface-shadow-2),var(--surface-rim-2)]",
  3: "shadow-[var(--surface-shadow-3),var(--surface-rim-3)]",
  4: "shadow-[var(--surface-shadow-4),var(--surface-rim-4)]",
  5: "shadow-[var(--surface-shadow-5),var(--surface-rim-5)]",
  6: "shadow-[var(--surface-shadow-6),var(--surface-rim-6)]",
  7: "shadow-[var(--surface-shadow-7),var(--surface-rim-7)]",
  8: "shadow-[var(--surface-shadow-8),var(--surface-rim-8)]",
};

export function surfaceClasses(
  level: SurfaceLevel,
  shadowLevel: SurfaceLevel = level,
): string {
  return `${SURFACE_BG[level]} ${SURFACE_SHADOW[shadowLevel]} ${SURFACE_VAR[level]}`;
}

/**
 * Like `surfaceClasses`, but adds a `::after` overlay that re-paints the rim
 * above the container's children. Use on elevated containers with opaque
 * children near their edges (sticky labels, pinned inputs, dialog headers).
 *
 * Host requirements: positioned, `border-radius` class, clipped overflow.
 * Overlay is `z-index: 2` — bump if children exceed that.
 */
export function elevatedSurface(
  level: SurfaceLevel,
  shadowLevel: SurfaceLevel = level,
): string {
  return `${SURFACE_BG[level]} ${SURFACE_SHADOW[shadowLevel]} ${SURFACE_RIM[level]} ${SURFACE_VAR[level]} after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:z-[2]`;
}

/**
 * Like `elevatedSurface`, but paints the rim in the popup's own `box-shadow`
 * (no `::after`) — leaves `::after` free for other purposes. Use for elevated
 * containers with no opaque children near their edges; switch to
 * `elevatedSurface()` if you add a sticky/opaque child.
 *
 * When `level !== shadowLevel` the rim color tracks `shadowLevel`; for
 * independent rim/drop control use `elevatedSurface` instead.
 */
export function solidSurface(
  level: SurfaceLevel,
  shadowLevel: SurfaceLevel = level,
): string {
  return `${SURFACE_BG[level]} ${SURFACE_SHADOW_COMBINED[shadowLevel]} ${SURFACE_VAR[level]}`;
}

/**
 * `::after` classes for a 1px inset rim on a single edge — for viewport-flush
 * containers (Sheet/Drawer) so the rim only shows on the inner-facing edge.
 * Color is `--surface-rim-color` (transparent in light, ~4% white in dark).
 */
export const SURFACE_RIM_EDGE: Record<
  "top" | "bottom" | "left" | "right",
  string
> = {
  top: "after:shadow-[inset_0_1px_0_0_var(--surface-rim-color)]",
  bottom: "after:shadow-[inset_0_-1px_0_0_var(--surface-rim-color)]",
  left: "after:shadow-[inset_1px_0_0_0_var(--surface-rim-color)]",
  right: "after:shadow-[inset_-1px_0_0_0_var(--surface-rim-color)]",
};

/**
 * `::after` overlay with a 1px rim on the specified inner-facing edge.
 * Pair with `surfaceClasses()` (NOT `elevatedSurface()`) for flush variants.
 */
export function innerEdgeRim(
  innerEdge: "top" | "bottom" | "left" | "right",
): string {
  return `after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:z-[2] ${SURFACE_RIM_EDGE[innerEdge]}`;
}

/** Maps attach-side → inner-facing edge for `innerEdgeRim`. */
export const INNER_EDGE_FROM_ATTACH_SIDE: Record<
  "top" | "bottom" | "left" | "right",
  "top" | "bottom" | "left" | "right"
> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * Directional drop shadow for a viewport-flush surface: casts toward the
 * inner-facing edge (into the content) rather than always straight down. A
 * flush surface only sheds shadow on the one edge that isn't pinned to the
 * viewport, so the radial `--surface-shadow-N` recipe (which casts down on
 * every surface) points the wrong way for top/bottom/left attach sides.
 *
 * This is the level-5 recipe, rotated per edge. It matches the floating
 * variant's edge ring EXACTLY by mirroring how that recipe handles the ring
 * per mode: the base shadow uses --surface-shadow-ring (light: 6%) and the
 * `dark:` shadow inlines oklch(0 0 0 / 0.16) (the level-5 dark ring). The drop
 * layers reference --surface-shadow-near/mid/far, which already redefine per
 * mode, so they're identical between the two and don't need splitting.
 * The ring casts on all four edges — the three viewport-pinned ones fall
 * off-screen.
 */
export const INNER_EDGE_SHADOW: Record<
  "top" | "bottom" | "left" | "right",
  string
> = {
  left: "shadow-[0_0_0_1px_var(--surface-shadow-ring),-1px_0_1px_-0.5px_var(--surface-shadow-near),-3px_0_3px_-1.5px_var(--surface-shadow-mid),-6px_0_6px_-3px_var(--surface-shadow-mid),-12px_0_12px_-6px_var(--surface-shadow-far)] dark:shadow-[0_0_0_1px_oklch(0_0_0/0.16),-1px_0_1px_-0.5px_var(--surface-shadow-near),-3px_0_3px_-1.5px_var(--surface-shadow-mid),-6px_0_6px_-3px_var(--surface-shadow-mid),-12px_0_12px_-6px_var(--surface-shadow-far)]",
  right:
    "shadow-[0_0_0_1px_var(--surface-shadow-ring),1px_0_1px_-0.5px_var(--surface-shadow-near),3px_0_3px_-1.5px_var(--surface-shadow-mid),6px_0_6px_-3px_var(--surface-shadow-mid),12px_0_12px_-6px_var(--surface-shadow-far)] dark:shadow-[0_0_0_1px_oklch(0_0_0/0.16),1px_0_1px_-0.5px_var(--surface-shadow-near),3px_0_3px_-1.5px_var(--surface-shadow-mid),6px_0_6px_-3px_var(--surface-shadow-mid),12px_0_12px_-6px_var(--surface-shadow-far)]",
  top: "shadow-[0_0_0_1px_var(--surface-shadow-ring),0_-1px_1px_-0.5px_var(--surface-shadow-near),0_-3px_3px_-1.5px_var(--surface-shadow-mid),0_-6px_6px_-3px_var(--surface-shadow-mid),0_-12px_12px_-6px_var(--surface-shadow-far)] dark:shadow-[0_0_0_1px_oklch(0_0_0/0.16),0_-1px_1px_-0.5px_var(--surface-shadow-near),0_-3px_3px_-1.5px_var(--surface-shadow-mid),0_-6px_6px_-3px_var(--surface-shadow-mid),0_-12px_12px_-6px_var(--surface-shadow-far)]",
  bottom:
    "shadow-[0_0_0_1px_var(--surface-shadow-ring),0_1px_1px_-0.5px_var(--surface-shadow-near),0_3px_3px_-1.5px_var(--surface-shadow-mid),0_6px_6px_-3px_var(--surface-shadow-mid),0_12px_12px_-6px_var(--surface-shadow-far)] dark:shadow-[0_0_0_1px_oklch(0_0_0/0.16),0_1px_1px_-0.5px_var(--surface-shadow-near),0_3px_3px_-1.5px_var(--surface-shadow-mid),0_6px_6px_-3px_var(--surface-shadow-mid),0_12px_12px_-6px_var(--surface-shadow-far)]",
};

/**
 * Flush-surface elevation: bg + a directional drop shadow cast toward the
 * inner edge + the single-edge inset rim on that edge. Use for viewport-flush
 * containers (Sheet/Drawer `default` variant) instead of `solidSurface` (whose
 * all-around, downward shadow only suits a free-floating surface). `innerEdge`
 * is the content-facing edge — derive it from the attach side via
 * `INNER_EDGE_FROM_ATTACH_SIDE`.
 */
export function flushSurface(
  level: SurfaceLevel,
  innerEdge: "top" | "bottom" | "left" | "right",
): string {
  return `${SURFACE_BG[level]} ${SURFACE_VAR[level]} ${INNER_EDGE_SHADOW[innerEdge]} ${innerEdgeRim(innerEdge)}`;
}

export interface ElevatedProps extends React.ComponentProps<"div"> {
  level: SurfaceLevel;
  shadowLevel?: SurfaceLevel;
}

function Elevated({
  level,
  shadowLevel,
  className,
  ...props
}: ElevatedProps) {
  return (
    <div
      data-slot="elevated"
      data-level={level}
      className={cn(surfaceClasses(level, shadowLevel ?? level), className)}
      {...props}
    />
  );
}

export { Elevated };
