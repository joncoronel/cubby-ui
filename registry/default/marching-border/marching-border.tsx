"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import "./marching-border.css";

export type MarchingBorderProps = React.ComponentProps<"svg"> & {
  /**
   * Override the auto-detected corner radius (in pixels). When omitted,
   * MarchingBorder reads its parent element's computed
   * `border-top-left-radius` — so the typical usage is to drop it inside
   * any positioned parent that already has a `rounded-*` class and have
   * the border conform automatically.
   */
  radius?: number;
  /** Stroke thickness in pixels. */
  strokeWidth?: number;
  /** Dash length as a percentage of the path's perimeter. */
  dash?: number;
  /** Gap length as a percentage of the path's perimeter. */
  gap?: number;
  /**
   * Seconds per dash-cycle. One cycle = one dash + one gap traversal,
   * which is the minimum seamless time-loop.
   */
  duration?: number;
};

/**
 * Builds the `d` attribute for a rounded-rect path that starts at the
 * midpoint of the top edge. Starting mid-edge (rather than at a corner,
 * the default for `<rect>`) puts any residual subpixel seam on a straight
 * side where it's invisible.
 *
 * `inset` shifts every coordinate inward by half the stroke so the stroke
 * sits inside the SVG bounding box instead of being clipped at the edges.
 */
function buildRoundedRectPath(
  width: number,
  height: number,
  radius: number,
  inset: number,
): string {
  const innerW = width - 2 * inset;
  const innerH = height - 2 * inset;
  if (innerW <= 0 || innerH <= 0) return "";
  const r = Math.min(radius, innerW / 2, innerH / 2);
  const left = inset;
  const top = inset;
  const right = inset + innerW;
  const bottom = inset + innerH;
  // Round to 2 decimals to keep the `d` attribute compact. 0.01px is well
  // below a visible subpixel, so corner alignment with the parent's
  // border-radius is unaffected.
  const f = (n: number) => Math.round(n * 100) / 100;
  return [
    `M ${f(left + innerW / 2)} ${f(top)}`,
    `L ${f(right - r)} ${f(top)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(right)} ${f(top + r)}`,
    `L ${f(right)} ${f(bottom - r)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(right - r)} ${f(bottom)}`,
    `L ${f(left + r)} ${f(bottom)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(left)} ${f(bottom - r)}`,
    `L ${f(left)} ${f(top + r)}`,
    `A ${f(r)} ${f(r)} 0 0 1 ${f(left + r)} ${f(top)}`,
    "Z",
  ].join(" ");
}

/**
 * Marching-ants dashed border drawn as an absolutely-positioned SVG
 * overlay. Lives outside the wrapped element's box model so toggling it
 * on/off causes zero layout shift. Parent must be `position: relative`
 * (or another positioned ancestor) and should have a `rounded-*` class
 * for the border to conform to.
 *
 * Seam-free loop, two techniques combined:
 *
 *  1. `pathLength` is set to a constant near 100, rounded to the nearest
 *     whole multiple of `(dash + gap)`. The dash pattern tiles the path
 *     an exact integer number of times regardless of element size — so
 *     `dash` and `gap` act as percentages of the perimeter.
 *
 *  2. The path's `M` is at the midpoint of the top edge so any residual
 *     subpixel error falls mid-straight-edge instead of at a corner.
 *
 * The `@keyframes dash-march` rule lives in `marching-border.css` and
 * is shared across every instance. The end offset (one full cycle)
 * comes from a CSS variable on the path so any `(dash, gap)`
 * combination loops seamlessly without per-cycle keyframe generation.
 *
 * Under `prefers-reduced-motion`, only the marching animation is
 * suppressed — the dashed border itself still renders, since for staged
 * edit-mode it's the primary visual signal of pending state.
 */
function MarchingBorder({
  radius,
  strokeWidth = 2,
  dash = 1,
  gap = 0.75,
  duration = 0.75,
  ref,
  className,
  ...rest
}: MarchingBorderProps) {
  const svgRef = React.useRef<SVGSVGElement | null>(null);
  const pathRef = React.useRef<SVGPathElement | null>(null);
  const cycle = dash + gap;
  const pathLength = Math.max(cycle, Math.round(100 / cycle) * cycle);

  // Compose the consumer `ref` with the internal `svgRef` used by the
  // ResizeObserver. Mirrors the pattern used in `TransitionPanel` so a
  // forwarded ref still works alongside the component's own DOM reads.
  const setSvgRef = React.useCallback(
    (node: SVGSVGElement | null) => {
      svgRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.RefObject<SVGSVGElement | null>).current = node;
      }
    },
    [ref],
  );

  // useLayoutEffect so the first paint includes the path's `d` — without
  // this there's a one-frame gap waiting for ResizeObserver to fire its
  // initial callback, which reads as a visible flash on staged-state
  // entry.
  React.useLayoutEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const inset = strokeWidth / 2;

    const apply = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      // Use the explicit `radius` prop when provided, otherwise auto-
      // detect from the parent's computed border-radius. Read on each
      // resize so theme changes / dynamic radius updates are picked up.
      const parent = svg.parentElement;
      const detected =
        radius ??
        (parent
          ? parseFloat(getComputedStyle(parent).borderTopLeftRadius)
          : NaN);
      const outerRadius = Number.isFinite(detected) ? detected : 0;
      // Path arc radius = outer radius − stroke inset. The stroke
      // renders centered on the path, so the stroke's outer edge sits on
      // a curve of (pathRadius + inset), which equals the parent's
      // border-radius. Without the subtraction the rounded corners
      // wouldn't align with the underlying element.
      const pathRadius = Math.max(0, outerRadius - inset);

      path.setAttribute(
        "d",
        buildRoundedRectPath(width, height, pathRadius, inset),
      );
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [radius, strokeWidth]);

  return (
    <svg
      ref={setSvgRef}
      aria-hidden
      data-slot="marching-border"
      {...rest}
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        className,
      )}
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        pathLength={pathLength}
        // `!` needed to defeat the inline animation style below.
        className="motion-reduce:animate-none!"
        style={
          {
            "--march-offset": -cycle,
            animation: `dash-march ${duration}s linear infinite`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
}

export { MarchingBorder };
