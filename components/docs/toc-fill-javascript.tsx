"use client";

import {
  createContext,
  forwardRef,
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
import {
  type PathSegment,
  type TocSvgData,
  CORNER_RADIUS,
  MIN_X_OFFSET,
  getLineOffset,
  getItemOffset,
} from "./toc-utils";

export type { TocSvgData };

// Find x-coordinate on the path at a given y-coordinate
function getCircleX(segments: PathSegment[], y: number): number {
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

const ANIMATION_DURATION = 150;

// CSS ease-out: cubic-bezier(0, 0, 0.58, 1)
// Uses binary search to find the bezier parameter for a given time
function cssEaseOut(t: number): number {
  const x2 = 0.58;
  let low = 0,
    high = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2;
    const x = 3 * mid * mid * (1 - mid) * x2 + mid * mid * mid;
    if (x < t) low = mid;
    else high = mid;
  }
  const bt = (low + high) / 2;
  return 3 * bt * bt * (1 - bt) + bt * bt * bt;
}

// Hook to compute segments and SVG path data
// Accepts optional initial value for server-side rendering
function useTocSegments(
  containerRef: RefObject<HTMLElement | null>,
  toc: TOCItemType[],
  stepped: boolean,
  initialSvg: TocSvgData | null = null,
): TocSvgData | null {
  const [data, setData] = useState<TocSvgData | null>(initialSvg);

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
    // Skip initial compute if server already provided the SVG data
    if (!initialSvg) {
      compute();
    }
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, toc, stepped, initialSvg]);

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

// Component to manage thumb + circle position updates with synchronized JS animation
interface TocThumbPositionProps {
  containerRef: RefObject<HTMLElement | null>;
  thumbRef: RefObject<HTMLDivElement | null>;
  circleRef: RefObject<HTMLDivElement | null>;
  toc: TOCItemType[];
  segments: PathSegment[];
  onFillActiveChange?: (anchor: string | null) => void;
}

function TocThumbPosition({
  containerRef,
  thumbRef,
  circleRef,
  toc,
  segments,
  onFillActiveChange,
}: TocThumbPositionProps) {
  const active = Primitive.useActiveAnchors();
  const animationRef = useRef<number | null>(null);
  // Track current animated values for smooth transitions
  const currentThumbHeight = useRef<number>(0);
  const currentCircleY = useRef<number>(0);
  // Track if we've done the initial positioning (skip animation on first update)
  const isInitialized = useRef(false);

  // Set position immediately without animation (for initial positioning)
  // Returns true if successful, false if prerequisites not met
  function setPositionImmediate(targetHeight: number, targetY: number): boolean {
    if (!thumbRef.current || !circleRef.current || segments.length === 0)
      return false;

    const x = getCircleX(segments, targetY);

    thumbRef.current.style.height = `${targetHeight}px`;
    circleRef.current.style.left = `${x}px`;
    circleRef.current.style.top = `${targetY}px`;
    circleRef.current.style.visibility = "visible";
    circleRef.current.style.opacity = "1";

    currentThumbHeight.current = targetHeight;
    currentCircleY.current = targetY;
    return true;
  }

  // Animate both thumb and circle together with JS for perfect sync
  function animate(targetHeight: number, targetY: number) {
    if (!thumbRef.current || !circleRef.current || segments.length === 0)
      return;

    const startHeight = currentThumbHeight.current;
    const startY = currentCircleY.current;
    const startTime = performance.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const eased = cssEaseOut(progress);

      // Animate thumb height
      const height = startHeight + (targetHeight - startHeight) * eased;
      if (thumbRef.current) {
        thumbRef.current.style.height = `${height}px`;
      }
      currentThumbHeight.current = height;

      // Animate circle position along path
      const y = startY + (targetY - startY) * eased;
      const x = getCircleX(segments, y);
      if (circleRef.current) {
        circleRef.current.style.left = `${x}px`;
        circleRef.current.style.top = `${y}px`;
      }
      currentCircleY.current = y;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  }

  // Core update logic - only DOM manipulation, no state updates
  function updateDOM(activeAnchors: string[]) {
    if (!containerRef.current || !thumbRef.current) return;

    const [top, height, bottomY] = calcThumbPosition(
      containerRef.current,
      activeAnchors,
      toc,
    );

    // Set thumb top position (doesn't animate - just shifts the starting point)
    thumbRef.current.style.transform = `translateY(${top}px)`;

    // Skip animation on first valid update - snap to position then show
    if (!isInitialized.current) {
      if (height > 0 && setPositionImmediate(height, bottomY)) {
        isInitialized.current = true;
      }
      // Don't animate until initialized (circle stays hidden)
      return;
    }

    // Animate both thumb height and circle position together
    animate(height, bottomY);
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

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return null;
}

// TOC Thumb - JS animated for sync with circle
const TocThumb = forwardRef<HTMLDivElement, { className?: string }>(
  function TocThumb({ className }, ref) {
    return (
      <div ref={ref} role="none" className={cn("bg-fd-primary", className)} />
    );
  },
);

// Thumb end circle - JS animated to follow path
// Starts hidden, shown by setPositionImmediate after position is calculated
const TocThumbCircle = forwardRef<HTMLDivElement>(
  function TocThumbCircle(_props, ref) {
    return (
      <div
        ref={ref}
        role="none"
        aria-hidden="true"
        className="bg-fd-primary pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ opacity: 0, visibility: "hidden" }}
      />
    );
  },
);

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
        "line-clamp-1",
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
  /** Pre-computed SVG data for server-side rendering */
  initialSvg?: TocSvgData | null;
}

export function FillTOC({
  toc,
  stepped = false,
  initialSvg = null,
}: FillTOCProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [fillActive, setFillActive] = useState<string | null>(null);

  const svg = useTocSegments(containerRef, toc, stepped, initialSvg);

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
            thumbRef={thumbRef}
            circleRef={circleRef}
            toc={toc}
            segments={svg?.segments ?? []}
            onFillActiveChange={setFillActive}
          />
          <Primitive.ScrollProvider containerRef={containerRef}>
            <div className="relative min-h-0 flex-1">
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
                    <TocThumb ref={thumbRef} />
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
                <TocThumbCircle ref={circleRef} />
              </nav>
            </div>
          </Primitive.ScrollProvider>
        </FillActiveContext>
      </Primitive.AnchorProvider>
    </div>
  );
}
