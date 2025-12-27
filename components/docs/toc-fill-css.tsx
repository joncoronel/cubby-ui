"use client";

import {
  createContext,
  type RefObject,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import { cn } from "@/lib/utils";

// Line offset for stepped mode (only 2 levels: depth 2 vs depth 3+)
// Value offset by 3px to maintain indent with MIN_X_OFFSET base position
function getLineOffset(depth: number): number {
  return depth <= 2 ? 0 : 13;
}

// Text indentation based on heading depth
// Values offset by 3px to maintain gap with MIN_X_OFFSET track position
function getItemOffset(depth: number): number {
  if (depth <= 2) return 15;
  if (depth === 3) return 27;
  return 39;
}

// Segment data for path tracing
interface PathSegment {
  offset: number;
  top: number;
  bottom: number;
}

// SVG data returned by useTocSegments
interface TocSvgData {
  path: string;
  width: number;
  height: number;
  endX: number;
  endY: number;
  segments: PathSegment[];
}

// Find x-coordinate on the path at a given y-coordinate
function getCircleX(segments: PathSegment[], y: number): number {
  for (const seg of segments) {
    if (y >= seg.top && y <= seg.bottom) return seg.offset;
  }
  return segments[segments.length - 1]?.offset ?? 1;
}

const CORNER_RADIUS = 4;
// Minimum x-offset ensures circle (6px with -translate-x-1/2) doesn't clip
const MIN_X_OFFSET = 4;

// Hook to compute segments and SVG path data
function useTocSegments(
  containerRef: RefObject<HTMLElement | null>,
  toc: TOCItemType[],
  stepped: boolean,
): TocSvgData | null {
  const [data, setData] = useState<TocSvgData | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    const observer = new ResizeObserver(compute);
    compute();
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, toc, stepped]);

  return data;
}

// Context for fill mode - tracks which item the circle is on
const FillActiveContext = createContext<string | null>(null);

// Calculate thumb position from active anchors
function calcThumbPosition(
  container: HTMLElement,
  activeAnchors: string[],
  toc: TOCItemType[],
): [top: number, height: number, bottomY: number, lastActiveIndex: number] {
  if (activeAnchors.length === 0 || container.clientHeight === 0) {
    return [0, 0, 0, -1];
  }

  let lastActiveIndex = -1;

  for (const item of activeAnchors) {
    const tocIndex = toc.findIndex((t) => t.url === `#${item}`);
    if (tocIndex !== -1 && tocIndex > lastActiveIndex) {
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

// Component to manage thumb position updates via CSS variables
interface TocThumbPositionProps {
  containerRef: RefObject<HTMLElement | null>;
  navRef: RefObject<HTMLDivElement | null>;
  toc: TOCItemType[];
  segments: PathSegment[];
  onFillActiveChange?: (anchor: string | null) => void;
}

function TocThumbPosition({
  containerRef,
  navRef,
  toc,
  segments,
  onFillActiveChange,
}: TocThumbPositionProps) {
  const active = Primitive.useActiveAnchors();
  // Track if we've done the initial positioning (skip transition on first update)
  const isInitialized = useRef(false);

  // Core update logic - only DOM manipulation, no state updates
  function updateDOM(activeAnchors: string[]) {
    if (!containerRef.current || !navRef.current) return;

    const [top, height, bottomY] = calcThumbPosition(
      containerRef.current,
      activeAnchors,
      toc,
    );

    // Calculate circle X position from segments
    const circleX = getCircleX(segments, bottomY);

    // Set CSS variables - CSS transitions handle animation
    navRef.current.style.setProperty("--thumb-top", `${top}px`);
    navRef.current.style.setProperty("--thumb-height", `${height}px`);
    navRef.current.style.setProperty("--circle-x", `${circleX}px`);
    navRef.current.style.setProperty("--circle-y", `${bottomY}px`);

    // On first valid update, show circle without transition
    if (!isInitialized.current && height > 0) {
      navRef.current.style.setProperty("--circle-opacity", "1");
      // Enable transitions for subsequent updates (after paint)
      requestAnimationFrame(() => {
        navRef.current?.style.setProperty(
          "--circle-transition",
          "left 150ms ease-out, top 150ms ease-out",
        );
      });
      isInitialized.current = true;
      return;
    }

    navRef.current.style.setProperty("--circle-opacity", height > 0 ? "1" : "0");
  }

  // Stable callback for ResizeObserver (avoids re-subscriptions)
  const onResize = useEffectEvent(() => updateDOM(active));

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  // Declarative DOM update when active anchors change
  useOnChange(active, () => updateDOM(active));

  // Report active anchor to parent (must be in effect, not during render)
  useEffect(() => {
    if (!containerRef.current) return;

    const [, , , lastActiveIndex] = calcThumbPosition(
      containerRef.current,
      active,
      toc,
    );

    if (lastActiveIndex !== -1) {
      onFillActiveChange?.(toc[lastActiveIndex].url.replace("#", ""));
    }
  }, [active, containerRef, toc, onFillActiveChange]);

  return null;
}

// TOC Thumb - CSS variable animated
function TocThumb({ className }: { className?: string }) {
  return (
    <div
      role="none"
      className={cn(
        "bg-fd-primary transition-[transform,height] duration-150 ease-out",
        className,
      )}
      style={{
        transform: "translateY(var(--thumb-top, 0))",
        height: "var(--thumb-height, 0)",
      }}
    />
  );
}

// Thumb end circle - CSS variable animated
function TocThumbCircle() {
  return (
    <div
      role="none"
      aria-hidden="true"
      className="bg-fd-primary pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: "var(--circle-x, 0)",
        top: "var(--circle-y, 0)",
        opacity: "var(--circle-opacity, 0)",
        transition: "var(--circle-transition, none)",
      }}
    />
  );
}

// TOC Item for fill mode
function TOCItem({ item }: { item: TOCItemType }) {
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
        isActive && "text-fd-primary",
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}

// Fill mode TOC component
interface FillTOCProps {
  toc: TOCItemType[];
  /** Enable stepped/indented line for depth 3+ headings */
  stepped?: boolean;
}

export function FillTOC({ toc, stepped = false }: FillTOCProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [fillActive, setFillActive] = useState<string | null>(null);

  const svg = useTocSegments(containerRef, toc, stepped);

  if (toc.length === 0) {
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

  return (
    <div
      id="nd-toc"
      className="xl:layout:[--fd-toc-width:268px] sticky top-(--fd-docs-row-3) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] w-(--fd-toc-width) flex-col pe-4 pt-12 pb-2 [grid-area:toc] max-xl:hidden"
      data-slot="toc"
    >
      <h3
        id="toc-title"
        className="text-fd-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        On this page
      </h3>
      <Primitive.AnchorProvider toc={toc} single={false}>
        <FillActiveContext value={fillActive}>
          <TocThumbPosition
            containerRef={containerRef}
            navRef={navRef}
            toc={toc}
            segments={svg?.segments ?? []}
            onFillActiveChange={setFillActive}
          />
          <Primitive.ScrollProvider containerRef={containerRef}>
            <div ref={navRef} className="relative min-h-0 flex-1">
              <nav
                aria-label="Table of contents"
                className="relative h-full min-h-0 overflow-auto mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-4 ps-[5px] [scrollbar-width:none]"
              >
                {svg && (
                  <svg
                    className="absolute start-0 top-0 rtl:-scale-x-100"
                    width={svg.width + 3}
                    height={svg.height + 3}
                    aria-hidden="true"
                  >
                    <path
                      d={svg.path}
                      className="stroke-fd-foreground/10"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                )}
                {svg && (
                  <div
                    className="absolute start-0 top-0 rtl:-scale-x-100"
                    style={{
                      width: svg.width,
                      height: svg.height,
                      maskImage: `url("data:image/svg+xml,${encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none" /></svg>`,
                      )}")`,
                    }}
                    aria-hidden="true"
                  >
                    <TocThumb />
                  </div>
                )}
                <div ref={containerRef} className="flex flex-col">
                  {toc.map((item) => (
                    <TOCItem key={item.url} item={item} />
                  ))}
                </div>
                {svg && (
                  <div
                    className="bg-fd-foreground/10 pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ left: svg.endX, top: svg.endY }}
                    aria-hidden="true"
                  />
                )}
                <TocThumbCircle />
              </nav>
            </div>
          </Primitive.ScrollProvider>
        </FillActiveContext>
      </Primitive.AnchorProvider>
    </div>
  );
}
