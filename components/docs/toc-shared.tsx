"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  type RefObject,
} from "react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { cn } from "@/lib/utils";
import {
  type PathSegment,
  type TocSvgData,
  CORNER_RADIUS,
  MIN_X_OFFSET,
  getLineOffset,
  getItemOffset,
} from "./toc-utils";

// Re-export types for convenience
export type { PathSegment, TocSvgData };
export { ANIMATION_DURATION } from "./toc-utils";

/**
 * Find x-coordinate on the path at a given y-coordinate.
 * Interpolates position when between segments (diagonal zones).
 */
export function getCircleX(segments: PathSegment[], y: number): number {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const nextSeg = segments[i + 1];

    // Within a segment - use segment's offset
    if (y >= seg.top && y <= seg.bottom) return seg.offset;

    // In diagonal zone between segments - interpolate
    if (nextSeg && y > seg.bottom && y < nextSeg.top) {
      const t = (y - seg.bottom) / (nextSeg.top - seg.bottom);
      return seg.offset + t * (nextSeg.offset - seg.offset);
    }
  }
  return segments[segments.length - 1]?.offset ?? 1;
}

/**
 * Hook to compute segments and SVG path data from DOM measurements.
 * Accepts optional initial value for server-side rendering.
 * Uses debounced resize handling via requestAnimationFrame.
 */
export function useTocSegments(
  containerRef: RefObject<HTMLElement | null>,
  toc: TOCItemType[],
  stepped: boolean,
  initialSvg: TocSvgData | null = null,
): TocSvgData | null {
  const [data, setData] = useState<TocSvgData | null>(initialSvg);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    function compute() {
      if (!container || container.clientHeight === 0) return;

      let w = 0;
      let h = 0;
      const d: string[] = [];
      const segments: PathSegment[] = [];

      // Build segments from DOM
      for (let i = 0; i < toc.length; i++) {
        const element = container.querySelector<HTMLElement>(
          `a[href="${toc[i].url}"]`,
        );
        if (!element) continue;

        const styles = getComputedStyle(element);
        const offset = stepped
          ? Math.max(MIN_X_OFFSET, getLineOffset(toc[i].depth) + 1)
          : MIN_X_OFFSET;
        const top = element.offsetTop + parseFloat(styles.paddingTop);

        const isLastItem = i === toc.length - 1;
        const paddingTop = parseFloat(styles.paddingTop);
        const paddingBottom = parseFloat(styles.paddingBottom);
        const contentHeight = element.clientHeight - paddingTop - paddingBottom;
        const bottom = isLastItem
          ? element.offsetTop + paddingTop + contentHeight / 2
          : element.offsetTop + element.clientHeight - paddingBottom;

        w = Math.max(offset, w);
        h = Math.max(h, bottom);
        segments.push({ offset, top, bottom });
      }

      // Build SVG path from segments
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const prevSeg = segments[i - 1];
        const nextSeg = segments[i + 1];

        if (i === 0) {
          d.push(`M${seg.offset} ${seg.top}`);
        } else if (prevSeg && seg.offset !== prevSeg.offset) {
          d.push(
            `Q${seg.offset} ${seg.top},${seg.offset} ${seg.top + CORNER_RADIUS}`,
          );
        } else {
          d.push(`L${seg.offset} ${seg.top}`);
        }

        if (nextSeg && seg.offset !== nextSeg.offset) {
          const cornerBottom = seg.bottom;
          d.push(`L${seg.offset} ${cornerBottom - CORNER_RADIUS}`);
          const nextTop = nextSeg.top;
          const dx = nextSeg.offset - seg.offset;
          const dy = nextTop - cornerBottom;
          const diagLength = Math.sqrt(dx * dx + dy * dy);
          const ratio = Math.min(CORNER_RADIUS / diagLength, 0.5);
          const midX = seg.offset + dx * ratio;
          const midY = cornerBottom + dy * ratio;
          d.push(`Q${seg.offset} ${cornerBottom},${midX} ${midY}`);
          const endRatio = 1 - Math.min(CORNER_RADIUS / diagLength, 0.5);
          const endX = seg.offset + dx * endRatio;
          const endY = cornerBottom + dy * endRatio;
          d.push(`L${endX} ${endY}`);
        } else {
          d.push(`L${seg.offset} ${seg.bottom}`);
        }
      }

      const lastSeg = segments[segments.length - 1];
      setData({
        path: d.join(" "),
        width: w + 1,
        height: h,
        endX: lastSeg?.offset ?? 1,
        endY: lastSeg?.bottom ?? h,
        segments,
      });
    }

    // Debounced resize handler
    function handleResize() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(compute);
    }

    const observer = new ResizeObserver(handleResize);
    // Skip initial compute if server already provided the SVG data
    if (!initialSvg) {
      compute();
    }
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [containerRef, toc, stepped, initialSvg]);

  return data;
}

// Context for fill mode - tracks which item the circle is on
export const FillActiveContext = createContext<string | null>(null);

/**
 * Calculate thumb position from active anchors.
 * Returns [top, height, bottomY, lastActiveIndex].
 */
export function calcThumbPosition(
  container: HTMLElement,
  activeAnchors: string[],
  toc: TOCItemType[],
): [top: number, height: number, bottomY: number, lastActiveIndex: number] {
  if (activeAnchors.length === 0 || container.clientHeight === 0) {
    return [0, 0, 0, -1];
  }

  // Build URL lookup map for O(1) access
  const urlIndexMap = new Map<string, number>();
  for (let i = 0; i < toc.length; i++) {
    urlIndexMap.set(toc[i].url.replace("#", ""), i);
  }

  let lastActiveIndex = -1;
  for (const item of activeAnchors) {
    const tocIndex = urlIndexMap.get(item);
    if (tocIndex !== undefined && tocIndex > lastActiveIndex) {
      lastActiveIndex = tocIndex;
    }
  }

  if (lastActiveIndex === -1) return [0, 0, 0, -1];

  // Find center of last active item's content
  const lastActiveElement = container.querySelector<HTMLElement>(
    `a[href="${toc[lastActiveIndex]?.url}"]`,
  );
  if (!lastActiveElement) return [0, 0, 0, lastActiveIndex];

  const lastStyles = getComputedStyle(lastActiveElement);
  const paddingTop = parseFloat(lastStyles.paddingTop);
  const paddingBottom = parseFloat(lastStyles.paddingBottom);
  const contentHeight =
    lastActiveElement.clientHeight - paddingTop - paddingBottom;
  const lastItemCenter =
    lastActiveElement.offsetTop + paddingTop + contentHeight / 2;

  // Find start of first item
  const firstElement = container.querySelector<HTMLElement>(
    `a[href="${toc[0]?.url}"]`,
  );
  if (!firstElement)
    return [0, lastItemCenter, lastItemCenter, lastActiveIndex];

  const firstStyles = getComputedStyle(firstElement);
  const lineStart = firstElement.offsetTop + parseFloat(firstStyles.paddingTop);

  return [
    lineStart,
    lastItemCenter - lineStart,
    lastItemCenter,
    lastActiveIndex,
  ];
}

/**
 * TOC Item component for fill mode.
 * Uses FillActiveContext to determine active state.
 */
export function TOCItem({ item }: { item: TOCItemType }) {
  const fillActive = use(FillActiveContext);
  const isActive = fillActive === item.url.replace("#", "");

  return (
    <Primitive.TOCItem
      href={item.url}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
      }}
      className={cn(
        "relative py-1.5 text-sm transition-colors duration-150 ease-out",
        "text-fd-muted-foreground hover:text-fd-accent-foreground",
        "first:pt-0 last:pb-0",
        "line-clamp-1",
        isActive && "text-fd-primary",
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}

/**
 * Empty state component for TOC with no headings.
 */
export function TOCEmptyState() {
  return (
    <div
      id="nd-toc"
      className="sticky top-(--fd-docs-row-3) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] w-(--fd-toc-width) flex-col pe-4 pt-12 pb-2 [grid-area:toc] max-xl:hidden"
      data-slot="toc"
    >
      <div className="bg-fd-card text-fd-muted-foreground rounded-lg border p-3 text-xs">
        No headings on this page
      </div>
    </div>
  );
}
