"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import "./marching-border.css";

export type MarchingBorderProps = React.ComponentProps<"svg"> & {
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
 * Builds the `d` for a rounded-rect path starting at the midpoint of the top
 * edge, so any residual subpixel seam falls on a straight side (invisible)
 * rather than at a corner. `inset` shifts coordinates inward by half the stroke
 * so the stroke sits inside the SVG box instead of clipping at the edges.
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
  // Round to 2 decimals to keep `d` compact; 0.01px is sub-visible so corner
  // alignment with the parent's border-radius is unaffected.
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
 * Marching-ants dashed border, drawn as an absolutely-positioned SVG overlay
 * outside the wrapped element's box model so toggling it causes zero layout
 * shift. Parent must be positioned and should have a `rounded-*` class to
 * conform to. The SVG defaults to `rounded-[inherit]`, so it adopts the
 * parent's corner radius automatically; pass a `rounded-*` class to override.
 *
 * Seam-free loop via two techniques: (1) `pathLength` is rounded to a whole
 * multiple of `(dash + gap)` so the pattern tiles an integer number of times at
 * any size — making `dash`/`gap` perimeter percentages; (2) the path's `M` sits
 * mid-top-edge so residual subpixel error falls on a straight side. The shared
 * `@keyframes dash-march` (in `marching-border.css`) reads the one-cycle end
 * offset from a CSS var, so any `(dash, gap)` loops without per-cycle keyframes.
 *
 * Under `prefers-reduced-motion` only the animation is suppressed — the dashed
 * border still renders as the primary signal of pending/staged state.
 */
function MarchingBorder({
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

  // useLayoutEffect so the first paint already has the path's `d`; otherwise
  // the wait for ResizeObserver's initial callback flashes on staged-state entry.
  React.useLayoutEffect(() => {
    const svg = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    const inset = strokeWidth / 2;

    const apply = () => {
      const { width, height } = svg.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      // Read the SVG's own computed border-radius. With the default
      // `rounded-[inherit]` this resolves to the parent's radius; a `rounded-*`
      // class overrides it. Re-read each resize to track theme / dynamic updates.
      const detected = parseFloat(getComputedStyle(svg).borderTopLeftRadius);
      const outerRadius = Number.isFinite(detected) ? detected : 0;
      // pathRadius = outerRadius − inset: the stroke is centered on the path,
      // so its outer edge sits at (pathRadius + inset) = the parent's
      // border-radius. Without the subtraction the corners wouldn't align.
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
  }, [strokeWidth]);

  return (
    <svg
      ref={setSvgRef}
      aria-hidden
      data-slot="marching-border"
      {...rest}
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit]",
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
