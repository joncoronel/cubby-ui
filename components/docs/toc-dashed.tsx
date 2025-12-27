"use client";

import * as React from "react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { cn } from "@/lib/utils";
import { useOnChange } from "fumadocs-core/utils/use-on-change";

// Context for forced active item (when near bottom of page)
const ForcedActiveContext = React.createContext<string | null>(null);

// Text indentation based on heading depth
function getItemOffset(depth: number): number {
  if (depth <= 2) return 12;
  if (depth === 3) return 24;
  return 36;
}

// Check if we're near the bottom of the page
function isNearPageBottom(threshold = 100): boolean {
  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  return pageHeight - scrollPosition <= threshold;
}

// Check if the last heading is visible on screen
function isLastHeadingVisible(toc: TOCItemType[]): boolean {
  if (toc.length === 0) return false;
  const lastUrl = toc[toc.length - 1].url;
  const lastHeading = document.querySelector(lastUrl);
  if (!lastHeading) return false;

  const rect = lastHeading.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

// Calculate thumb position for active item (single mode)
function calcThumbPosition(
  container: HTMLElement,
  activeAnchors: string[],
  toc: TOCItemType[],
  forceLastItem = false,
): [top: number, height: number] {
  if (container.clientHeight === 0) {
    return [0, 0];
  }

  let targetIndex = -1;

  // If forcing last item (near bottom of page), use last item
  if (forceLastItem && toc.length > 0) {
    targetIndex = toc.length - 1;
  } else {
    // Find the last active anchor (single mode effectively)
    for (const item of activeAnchors) {
      const tocIndex = toc.findIndex((t) => t.url === `#${item}`);
      if (tocIndex !== -1 && tocIndex > targetIndex) {
        targetIndex = tocIndex;
      }
    }
  }

  if (targetIndex === -1) return [0, 0];

  const element = container.querySelector<HTMLElement>(
    `a[href="${toc[targetIndex].url}"]`,
  );
  if (!element) return [0, 0];

  // Use full element height (includes padding for visual alignment with clickable area)
  const top = element.offsetTop;
  const height = element.clientHeight;

  return [top, height];
}

// Component to manage thumb position and forced active state
interface TocPositionManagerProps {
  containerRef: React.RefObject<HTMLElement | null>;
  thumbRef: React.RefObject<HTMLDivElement | null>;
  toc: TOCItemType[];
  setForcedActive: (url: string | null) => void;
}

function TocPositionManager({
  containerRef,
  thumbRef,
  toc,
  setForcedActive,
}: TocPositionManagerProps) {
  const active = Primitive.useActiveAnchors();

  const update = React.useCallback(() => {
    if (!containerRef.current || !thumbRef.current) return;

    // Check if we should force the last item active (near bottom + last heading visible)
    const forceLastItem = isNearPageBottom(50) && isLastHeadingVisible(toc);

    // Update forced active context
    if (forceLastItem && toc.length > 0) {
      setForcedActive(toc[toc.length - 1].url);
    } else {
      setForcedActive(null);
    }

    const [thumbTop, thumbHeight] = calcThumbPosition(
      containerRef.current,
      active,
      toc,
      forceLastItem,
    );
    thumbRef.current.style.setProperty("--fd-top", `${thumbTop}px`);
    thumbRef.current.style.setProperty("--fd-height", `${thumbHeight}px`);
  }, [containerRef, thumbRef, active, toc, setForcedActive]);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const observer = new ResizeObserver(update);
    observer.observe(container);

    // Also listen for scroll to detect bottom of page
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [containerRef, update]);

  useOnChange(active, update);

  return null;
}

// Pill-shaped thumb - centered on track (track is 1px, thumb is 4px, offset by -1.5px)
const TocThumb = React.forwardRef<HTMLDivElement, { className?: string }>(
  function TocThumb({ className }, ref) {
    return (
      <div
        ref={ref}
        role="none"
        className={cn(
          "bg-neutral absolute w-1 rounded-full",
          "start-[-1.5px]",
          "h-(--fd-height) translate-y-(--fd-top)",
          "transition-[translate,height] duration-150 ease-out",
          className,
        )}
      />
    );
  },
);

// TOC Item - no vertical padding, spacing handled by container gap
function TOCItem({ item }: { item: TOCItemType }) {
  const forcedActive = React.useContext(ForcedActiveContext);
  const isForcedActive = forcedActive === item.url;
  // When forcing an item, suppress normal data-[active] styling for other items
  const suppressNormalActive = forcedActive !== null && !isForcedActive;

  return (
    <Primitive.TOCItem
      href={item.url}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
      }}
      className={cn(
        "relative ml-2 text-sm leading-5 transition-colors duration-150 ease-out",
        "text-muted-foreground hover:text-accent-foreground",
        // Only apply data-[active] styling when not suppressed
        !suppressNormalActive && "data-[active=true]:text-accent-foreground",
        isForcedActive && "text-accent-foreground",
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  );
}

// Main TOC component
export interface DashedTOCProps {
  toc: TOCItemType[];
  /** Pre-computed initial position for SSR */
  initialPosition?: { top: number; height: number } | null;
}

export function DashedTOC({ toc, initialPosition = null }: DashedTOCProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const [forcedActive, setForcedActive] = React.useState<string | null>(null);

  // Apply initial position for SSR
  React.useEffect(() => {
    if (initialPosition && thumbRef.current) {
      thumbRef.current.style.setProperty(
        "--fd-top",
        `${initialPosition.top}px`,
      );
      thumbRef.current.style.setProperty(
        "--fd-height",
        `${initialPosition.height}px`,
      );
    }
  }, [initialPosition]);

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
      <Primitive.AnchorProvider toc={toc} single={true}>
        <TocPositionManager
          containerRef={containerRef}
          thumbRef={thumbRef}
          toc={toc}
          setForcedActive={setForcedActive}
        />
        <ForcedActiveContext.Provider value={forcedActive}>
          <Primitive.ScrollProvider containerRef={containerRef}>
            <nav
              aria-label="Table of contents"
              className="relative min-h-0 overflow-auto mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-4 pl-0.5 [scrollbar-width:none]"
            >
              {/* Items container - dashed track via background gradient */}
              <div
                ref={containerRef}
                className="relative flex flex-col gap-3 bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--color-accent-foreground)_30%,transparent)_33%,transparent_0)] bg-size-[1px_4px] bg-repeat-y"
              >
                {/* Pill thumb - centered on track */}
                <TocThumb ref={thumbRef} />
                {/* TOC items */}
                {toc.map((item) => (
                  <TOCItem key={item.url} item={item} />
                ))}
              </div>
            </nav>
          </Primitive.ScrollProvider>
        </ForcedActiveContext.Provider>
      </Primitive.AnchorProvider>
    </div>
  );
}
