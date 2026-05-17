"use client";

import * as React from "react";

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
 * Static map that exposes the chosen surface level to descendants as the
 * `--popup-surface` CSS variable. Used by every elevation helper so children
 * (arrow fills, sticky labels, fade gradients) can track the popup's level
 * via `bg-(--popup-surface,var(--popover))` and friends.
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
 * Combined-shadow utility classes — drops + rim insets in a single
 * `box-shadow` on the popup itself (no `::after`). Used by `solidSurface()`.
 * Each entry is a literal Tailwind class so the scanner picks them up.
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
 * Like `surfaceClasses`, but also adds a pseudo-element overlay that re-paints
 * the rim (inset highlight + ring) above the container's children. Use this on
 * elevated containers that hold opaque children near their edges — sticky group
 * labels, pinned search inputs, dialog headers, etc.
 *
 * Requirements on the host element: `position: relative` (or any positioned),
 * a border-radius class (the overlay inherits it), and a clipped overflow so
 * the overlay doesn't escape. The overlay sits at z-index 2; bump if you have
 * children with z-index > 2.
 */
export function elevatedSurface(
  level: SurfaceLevel,
  shadowLevel: SurfaceLevel = level,
): string {
  return `${SURFACE_BG[level]} ${SURFACE_SHADOW[shadowLevel]} ${SURFACE_RIM[level]} ${SURFACE_VAR[level]} after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:z-[2]`;
}

/**
 * Like `elevatedSurface`, but paints the rim *in the popup's own box-shadow*
 * (no `::after`). Use this for elevated containers that have no opaque
 * children near their edges — leaves `::after` free for other purposes.
 *
 * Composition: `bg-surface-N` + combined `box-shadow` (drops + rim insets).
 *
 * If you ever add a sticky/opaque child near an edge, switch the component
 * back to `elevatedSurface()` so the rim renders above the child.
 */
export function solidSurface(
  level: SurfaceLevel,
  shadowLevel: SurfaceLevel = level,
): string {
  // The combined shadow class is keyed by a single level. In practice level
  // and shadowLevel are equal for nearly all callers; when they differ, the
  // rim color tracks shadowLevel (slightly off if shadowLevel is much lower
  // than level). For cases that need rim-tracks-level + drops-track-shadow
  // independently, use `elevatedSurface` instead.
  return `${SURFACE_BG[level]} ${SURFACE_SHADOW_COMBINED[shadowLevel]} ${SURFACE_VAR[level]}`;
}

/**
 * Static map of `::after` classes that paint a 1px inset rim on a single
 * edge — used by viewport-flush elevated containers (Sheet/Drawer `default`
 * variant) so the rim only shows on the inner-facing edge and doesn't render
 * as a thin line at the screen boundary.
 *
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
 * Returns classes for an `::after` overlay that paints a 1px rim only on
 * the specified inner-facing edge. Pair with `surfaceClasses()` (NOT
 * `elevatedSurface()`) for flush variants.
 *
 * Map of "which side the popup attaches to" → "inner-facing edge":
 *   right → left, left → right, top → bottom, bottom → top
 */
export function innerEdgeRim(
  innerEdge: "top" | "bottom" | "left" | "right",
): string {
  return `after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:z-[2] ${SURFACE_RIM_EDGE[innerEdge]}`;
}

/**
 * Map a "popup attaches to this side" value to the inner-facing edge that
 * a single-edge rim should sit on.
 */
export const INNER_EDGE_FROM_ATTACH_SIDE: Record<
  "top" | "bottom" | "left" | "right",
  "top" | "bottom" | "left" | "right"
> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

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
