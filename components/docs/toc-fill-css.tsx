"use client";

import { type RefObject, useEffect, useEffectEvent, useRef, useState } from "react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import { cn } from "@/lib/utils";
import {
  type PathSegment,
  type TocSvgData,
  FillActiveContext,
  TOCEmptyState,
  TOCItem,
  calcThumbPosition,
  getCircleX,
  useTocSegments,
} from "./toc-shared";

export type { TocSvgData };

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
      // Enable Tailwind transitions for subsequent updates (after paint)
      requestAnimationFrame(() => {
        navRef.current?.setAttribute("data-toc-ready", "");
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

// Thumb end circle - uses Tailwind transitions, enabled after initialization via parent data attribute
function TocThumbCircle() {
  return (
    <div
      role="none"
      aria-hidden="true"
      className="bg-fd-primary pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[var(--circle-opacity,0)] transition-none [[data-toc-ready]_&]:transition-[left,top] [[data-toc-ready]_&]:duration-150 [[data-toc-ready]_&]:ease-out"
      style={{
        left: "var(--circle-x, 0)",
        top: "var(--circle-y, 0)",
      }}
    />
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
  const navRef = useRef<HTMLDivElement>(null);
  const [fillActive, setFillActive] = useState<string | null>(null);

  const svg = useTocSegments(containerRef, toc, stepped, initialSvg);

  if (toc.length === 0) {
    return <TOCEmptyState />;
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
