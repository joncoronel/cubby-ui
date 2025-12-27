"use client";

import * as React from "react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { cn } from "@/lib/utils";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import type { DefaultTocSvgData } from "./toc-utils";

// Line offset for stepped mode (only 2 levels: depth 2 vs depth 3+)
function getLineOffset(depth: number): number {
  return depth <= 2 ? 0 : 10;
}

// Text indentation based on heading depth
function getItemOffset(depth: number): number {
  if (depth <= 2) return 12;
  if (depth === 3) return 24;
  return 36;
}

// Calculate thumb position for active items
function calcThumbPosition(
  container: HTMLElement,
  activeAnchors: string[],
  toc: TOCItemType[],
  stepped: boolean,
): [top: number, height: number] {
  if (activeAnchors.length === 0 || container.clientHeight === 0) {
    return [0, 0];
  }

  const THUMB_INSET = 2;

  let upper = Number.MAX_VALUE;
  let lower = 0;
  let firstActiveIndex = -1;
  let lastActiveIndex = -1;

  for (const item of activeAnchors) {
    const element = container.querySelector<HTMLElement>(`a[href="#${item}"]`);
    if (!element) continue;

    const tocIndex = toc.findIndex((t) => t.url === `#${item}`);
    if (tocIndex !== -1) {
      if (firstActiveIndex === -1 || tocIndex < firstActiveIndex) {
        firstActiveIndex = tocIndex;
      }
      if (lastActiveIndex === -1 || tocIndex > lastActiveIndex) {
        lastActiveIndex = tocIndex;
      }
    }

    const styles = getComputedStyle(element);
    upper = Math.min(upper, element.offsetTop + parseFloat(styles.paddingTop));
    lower = Math.max(
      lower,
      element.offsetTop +
        element.clientHeight -
        parseFloat(styles.paddingBottom),
    );
  }

  // Only apply inset near diagonal corners (depth changes) in stepped mode
  let topInset = 0;
  let bottomInset = 0;

  if (stepped && firstActiveIndex !== -1 && lastActiveIndex !== -1) {
    if (firstActiveIndex > 0) {
      const prevDepth = toc[firstActiveIndex - 1].depth;
      const currDepth = toc[firstActiveIndex].depth;
      if (prevDepth !== currDepth) {
        topInset = THUMB_INSET;
      }
    }

    if (lastActiveIndex < toc.length - 1) {
      const currDepth = toc[lastActiveIndex].depth;
      const nextDepth = toc[lastActiveIndex + 1].depth;
      if (currDepth !== nextDepth) {
        bottomInset = THUMB_INSET;
      }
    }
  }

  const height = lower - upper - topInset - bottomInset;
  return [upper + topInset, Math.max(0, height)];
}

// Component to manage thumb position updates
interface TocThumbPositionProps {
  containerRef: React.RefObject<HTMLElement | null>;
  thumbRef: React.RefObject<HTMLDivElement | null>;
  toc: TOCItemType[];
  stepped: boolean;
}

function TocThumbPosition({
  containerRef,
  thumbRef,
  toc,
  stepped,
}: TocThumbPositionProps) {
  const active = Primitive.useActiveAnchors();

  const update = React.useCallback(() => {
    if (!containerRef.current || !thumbRef.current) return;

    const [top, height] = calcThumbPosition(
      containerRef.current,
      active,
      toc,
      stepped,
    );

    thumbRef.current.style.setProperty("--fd-top", `${top}px`);
    thumbRef.current.style.setProperty("--fd-height", `${height}px`);
  }, [containerRef, thumbRef, active, toc, stepped]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const observer = new ResizeObserver(update);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, update]);

  useOnChange(active, update);

  return null;
}

// TOC Thumb - CSS transitions via CSS variables
const TocThumb = React.forwardRef<HTMLDivElement, { className?: string }>(
  function TocThumb({ className }, ref) {
    return (
      <div
        ref={ref}
        role="none"
        className={cn(
          "bg-neutral h-(--fd-height) translate-y-(--fd-top) transition-[translate,height] duration-150 ease-out",
          className,
        )}
      />
    );
  },
);

// TOC Item
function TOCItem({ item }: { item: TOCItemType }) {
  return (
    <Primitive.TOCItem
      href={item.url}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
      }}
      className={cn(
        "relative py-1.5 text-sm transition-colors duration-150 ease-out",
        "text-muted-foreground hover:text-accent-foreground",
        "first:pt-0 last:pb-0",
        "data-[active=true]:text-primary",
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}

// Main TOC component
interface DefaultTOCProps {
  toc: TOCItemType[];
  /**
   * When true, only a single anchor is active at a time.
   * When false, multiple anchors can be active simultaneously.
   * @default true
   */
  single?: boolean;
  /** Enable stepped/indented line for depth 3+ headings */
  stepped?: boolean;
  /** Pre-computed SVG data for server-side rendering */
  initialSvg?: DefaultTocSvgData | null;
}

export function DefaultTOC({
  toc,
  single = true,
  stepped = false,
  initialSvg = null,
}: DefaultTOCProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const [svg, setSvg] = React.useState<DefaultTocSvgData | null>(initialSvg);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const CORNER_RADIUS = 4;

    function onResize() {
      if (container.clientHeight === 0) return;

      let w = 0;
      let h = 0;
      const d: string[] = [];
      const segments: { offset: number; top: number; bottom: number }[] = [];

      for (let i = 0; i < toc.length; i++) {
        const element = container.querySelector<HTMLElement>(
          `a[href="${toc[i].url}"]`,
        );
        if (!element) continue;

        const styles = getComputedStyle(element);
        const offset = stepped ? getLineOffset(toc[i].depth) + 1 : 1;
        const top = element.offsetTop + parseFloat(styles.paddingTop);
        const paddingBottom = parseFloat(styles.paddingBottom);
        const bottom = element.offsetTop + element.clientHeight - paddingBottom;

        w = Math.max(offset, w);
        h = Math.max(h, bottom);

        segments.push({ offset, top, bottom });
      }

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

      setSvg({
        path: d.join(" "),
        width: w + 1,
        height: h,
      });
    }

    const observer = new ResizeObserver(onResize);
    // Skip initial compute if server already provided the SVG data
    if (!initialSvg) {
      onResize();
    }
    observer.observe(container);

    return () => observer.disconnect();
  }, [toc, stepped, initialSvg]);

  if (toc.length === 0) {
    return (
      <div
        id="nd-toc"
        className="sticky top-(--fd-docs-row-3) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] w-(--fd-toc-width) flex-col pe-4 pt-12 pb-2 [grid-area:toc] max-xl:hidden"
        data-slot="toc"
      >
        <div className="bg-card text-muted-foreground rounded-lg border p-3 text-xs">
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
        className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
      >
        On this page
      </h3>
      <Primitive.AnchorProvider toc={toc} single={single}>
        <TocThumbPosition
          containerRef={containerRef}
          thumbRef={thumbRef}
          toc={toc}
          stepped={stepped}
        />
        <Primitive.ScrollProvider containerRef={containerRef}>
          <nav
            aria-label="Table of contents"
            className="relative min-h-0 overflow-auto mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-4 ps-0.5 [scrollbar-width:none]"
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
                  className="stroke-muted"
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
          </nav>
        </Primitive.ScrollProvider>
      </Primitive.AnchorProvider>
    </div>
  );
}
