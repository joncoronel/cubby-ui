"use client";

import * as React from "react";
import { startTransition } from "react";
import * as Primitive from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

// Static empty state content (hoisted to avoid recreation)
const emptyTocContent = (
  <div className="bg-card text-muted-foreground rounded-lg border p-3 text-xs">
    No headings on this page
  </div>
);


// Check if CSS anchor positioning is fully supported (including transitions)
// Firefox supports anchor positioning but transitions don't work there,
// so we explicitly exclude it and fall back to JS positioning
function supportsAnchorPositioning(): boolean {
  if (typeof CSS === "undefined" || typeof navigator === "undefined") return false;
  // Firefox has anchor positioning but transitions don't animate
  if (navigator.userAgent.includes("Firefox")) return false;
  // Check for anchor() function support
  return CSS.supports("top", "anchor(top)");
}

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
  tocByAnchor: Map<string, { item: TOCItemType; index: number }>,
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
    // Uses Map for O(1) lookups instead of findIndex
    for (const item of activeAnchors) {
      const entry = tocByAnchor.get(item);
      if (entry && entry.index > targetIndex) {
        targetIndex = entry.index;
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

// Calculate position for a specific URL
function calcPositionForUrl(
  container: HTMLElement,
  url: string | null,
): [top: number, height: number] {
  if (!url || container.clientHeight === 0) {
    return [0, 0];
  }

  const element = container.querySelector<HTMLElement>(`a[href="${url}"]`);
  if (!element) return [0, 0];

  return [element.offsetTop, element.clientHeight];
}

// Position type for thumb/ghost
interface ThumbPosition {
  top: number;
  height: number;
}

// Component to manage thumb position and forced active state
interface TocPositionManagerProps {
  containerRef: React.RefObject<HTMLElement | null>;
  toc: TOCItemType[];
  hoveredUrl: string | null;
  activeAnchor: string | null;
  clickedUrl: string | null;
  usesCssAnchoring: boolean;
  setForcedActive: (url: string | null) => void;
  setActiveAnchor: (url: string | null) => void;
  setThumbPosition: (pos: ThumbPosition) => void;
  setGhostPosition: (pos: ThumbPosition) => void;
}

function TocPositionManager({
  containerRef,
  toc,
  hoveredUrl,
  activeAnchor,
  clickedUrl,
  usesCssAnchoring,
  setForcedActive,
  setActiveAnchor,
  setThumbPosition,
  setGhostPosition,
}: TocPositionManagerProps) {
  const active = Primitive.useActiveAnchors();

  // Build Map for O(1) lookups instead of repeated .find()/.findIndex()
  const tocByAnchor = React.useMemo(
    () => new Map(toc.map((t, i) => [t.url.slice(1), { item: t, index: i }])),
    [toc],
  );

  // Memoize forceLastItem check
  const checkForceLastItem = React.useCallback(() => {
    return isNearPageBottom(50) && isLastHeadingVisible(toc);
  }, [toc]);

  // Update thumb position via state
  // Only needed for browsers without CSS anchor positioning
  const updateThumbPosition = React.useCallback(() => {
    // Skip JS positioning if CSS anchor positioning is supported
    if (usesCssAnchoring) return;
    if (!containerRef.current) return;

    // If user clicked a TOC item, position thumb there (overrides scroll-spy)
    if (clickedUrl) {
      const [top, height] = calcPositionForUrl(containerRef.current, clickedUrl);
      setThumbPosition({ top, height });
      return;
    }

    const forceLastItem = checkForceLastItem();
    const [top, height] = calcThumbPosition(
      containerRef.current,
      active,
      toc,
      tocByAnchor,
      forceLastItem,
    );
    setThumbPosition({ top, height });
  }, [containerRef, active, toc, tocByAnchor, checkForceLastItem, usesCssAnchoring, clickedUrl, setThumbPosition]);

  // Update ghost thumb position via state (JS fallback)
  const updateGhostPosition = React.useCallback(() => {
    // Skip JS positioning if CSS anchor positioning is supported
    if (usesCssAnchoring) return;
    if (!containerRef.current) return;

    // Ghost follows hovered item, or defaults to active item
    const targetUrl = hoveredUrl ?? activeAnchor;
    const [top, height] = calcPositionForUrl(containerRef.current, targetUrl);
    setGhostPosition({ top, height });
  }, [containerRef, hoveredUrl, activeAnchor, usesCssAnchoring, setGhostPosition]);

  // Update forcedActive and activeAnchor state
  // This is needed for text styling and CSS anchor-name assignment
  const updateActiveStates = React.useCallback(() => {
    // If user clicked a TOC item, prioritize that over scroll-spy
    if (clickedUrl) {
      setForcedActive(clickedUrl);
      setActiveAnchor(clickedUrl);
      return;
    }

    const forceLastItem = checkForceLastItem();

    // Update forced active (for text styling when near bottom)
    if (forceLastItem && toc.length > 0) {
      setForcedActive(toc[toc.length - 1].url);
      setActiveAnchor(toc[toc.length - 1].url);
    } else {
      setForcedActive(null);

      // Determine which item should be the CSS anchor
      // Find the active anchor from the primitive, or default to first item
      // Uses Map for O(1) lookups instead of .find()
      let anchorUrl: string | null = null;
      for (const item of active) {
        const entry = tocByAnchor.get(item);
        if (entry) {
          anchorUrl = entry.item.url;
        }
      }
      // Default to first item if no active anchor
      if (!anchorUrl && toc.length > 0) {
        anchorUrl = toc[0].url;
      }
      setActiveAnchor(anchorUrl);
    }
  }, [toc, tocByAnchor, setForcedActive, setActiveAnchor, checkForceLastItem, active, clickedUrl]);

  // Run on active anchor changes
  React.useEffect(() => {
    updateActiveStates();
  }, [active, updateActiveStates]);

  // Update thumb position when active anchors change
  React.useEffect(() => {
    updateThumbPosition();
  }, [active, updateThumbPosition]);

  // Update ghost position when hovered URL changes
  React.useEffect(() => {
    updateGhostPosition();
  }, [updateGhostPosition]);

  // Combined scroll and resize handler
  React.useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = () => {
      updateThumbPosition();
      updateGhostPosition();
      updateActiveStates();
    };

    const container = containerRef.current;
    // Only observe resize if we need JS positioning
    const observer = usesCssAnchoring
      ? null
      : new ResizeObserver(() => {
          updateThumbPosition();
          updateGhostPosition();
        });
    observer?.observe(container);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    containerRef,
    updateThumbPosition,
    updateGhostPosition,
    updateActiveStates,
    usesCssAnchoring,
  ]);

  return null;
}

// Pill-shaped thumb - centered on track (track is 1px, thumb is 4px, offset by -1.5px)
// Uses CSS anchor positioning when supported, falls back to position props
interface TocThumbProps {
  position: ThumbPosition;
  usesCssAnchoring: boolean;
  className?: string;
}

function TocThumb({ position, usesCssAnchoring, className }: TocThumbProps) {
  return (
    <div
      role="none"
      className={cn(
        "bg-neutral absolute w-1 rounded-full",
        "start-[-1.5px]",
        // Fallback: state-based positioning via CSS variables
        "h-(--fd-height) top-(--fd-top)",
        "transition-[top,height] duration-200 ease-out-cubic",
        className,
      )}
      style={{
        // CSS anchor positioning (only when supported)
        ...(usesCssAnchoring && {
          positionAnchor: "--active-toc",
          top: "anchor(top)",
          height: "anchor-size(height)",
        }),
        // Fallback values (used by h-(--fd-height) and top-(--fd-top) classes)
        "--fd-top": `${position.top}px`,
        "--fd-height": `${position.height}px`,
      } as React.CSSProperties}
    />
  );
}

// Ghost thumb - semi-transparent preview that follows hovered items
// Uses CSS anchor positioning when supported, falls back to position props
interface TocGhostThumbProps {
  position: ThumbPosition;
  usesCssAnchoring: boolean;
}

function TocGhostThumb({ position, usesCssAnchoring }: TocGhostThumbProps) {
  return (
    <div
      role="presentation"
      className={cn(
        "bg-neutral pointer-events-none absolute w-1 rounded-full opacity-30",
        "start-[-1.5px]",
        // Fallback: state-based positioning via CSS variables
        "h-(--fd-ghost-height) top-(--fd-ghost-top)",
        "transition-[top,height] duration-150 ease-out-cubic",
      )}
      style={{
        // CSS anchor positioning (only when supported)
        ...(usesCssAnchoring && {
          positionAnchor: "--hovered-toc",
          top: "anchor(top)",
          height: "anchor-size(height)",
        }),
        // Fallback values (used by h-(--fd-ghost-height) and top-(--fd-ghost-top) classes)
        "--fd-ghost-top": `${position.top}px`,
        "--fd-ghost-height": `${position.height}px`,
      } as React.CSSProperties}
    />
  );
}

// TOC Item - no vertical padding, spacing handled by container gap
interface TOCItemProps {
  item: TOCItemType;
  isAnchor: boolean;
  isForcedActive: boolean;
  suppressDataActive: boolean;
  onHover?: (url: string | null) => void;
  onClick?: (url: string) => void;
}

function TOCItem({
  item,
  isAnchor,
  isForcedActive,
  suppressDataActive,
  onHover,
  onClick,
}: TOCItemProps) {
  return (
    <Primitive.TOCItem
      href={item.url}
      data-toc-anchor={isAnchor || undefined}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
      }}
      onMouseEnter={() => onHover?.(item.url)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(item.url)}
      className={cn(
        "relative ml-2 text-sm leading-5 transition-colors duration-150 ease-out",
        "text-muted-foreground hover:text-accent-foreground",
        // Only apply data-[active] styling when not suppressed
        !suppressDataActive && "data-[active=true]:text-accent-foreground",
        isForcedActive && "text-accent-foreground",
        // Extend hover area to cover gaps between items (pseudo-element trick)
        "before:absolute before:inset-x-0 before:-top-1.5 before:-bottom-1.5 before:content-['']",
        // CSS anchor positioning:
        // - Active item has both anchors (ghost overlaps with active thumb)
        // - When container has a hovered item, active item only keeps --active-toc
        // - Non-active hovered item takes --hovered-toc
        isAnchor && "[anchor-name:--active-toc,--hovered-toc]",
        isAnchor &&
          "group-has-[a:hover]/toc-items:not-hover:[anchor-name:--active-toc]",
        // Only non-active items get --hovered-toc on hover
        // (active item keeps both anchors so active thumb doesn't lose its anchor)
        !isAnchor && "[&:hover]:[anchor-name:--hovered-toc]",
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
  // Check after mount to avoid hydration mismatch (server has no navigator)
  const [usesCssAnchoring, setUsesCssAnchoring] = React.useState(false);
  React.useEffect(() => {
    setUsesCssAnchoring(supportsAnchorPositioning());
  }, []);
  const [forcedActive, setForcedActive] = React.useState<string | null>(null);
  // Track which item should be the CSS anchor (defaults to first item)
  const [activeAnchor, setActiveAnchor] = React.useState<string | null>(
    toc.length > 0 ? toc[0].url : null,
  );
  // Track hovered item for ghost thumb (JS fallback)
  const [hoveredUrl, setHoveredUrl] = React.useState<string | null>(null);
  // Track clicked item to override scroll-spy until user manually scrolls
  const [clickedUrl, setClickedUrl] = React.useState<string | null>(null);
  const isScrollingFromClickRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const scrollendHandlerRef = React.useRef<(() => void) | null>(null);

  // Position state for JS fallback (browsers without CSS anchor positioning)
  const [thumbPosition, setThumbPosition] = React.useState<ThumbPosition>(
    initialPosition ?? { top: 0, height: 0 },
  );
  const [ghostPosition, setGhostPosition] = React.useState<ThumbPosition>(
    initialPosition ?? { top: 0, height: 0 },
  );

  // Handle TOC item click - override scroll-spy until manual scroll
  const handleItemClick = React.useCallback((url: string) => {
    // Mark that we're about to do a programmatic scroll
    isScrollingFromClickRef.current = true;
    setClickedUrl(url);

    // Clear the "programmatic scroll" flag when scroll ends
    // Use scrollend event where supported, with timeout fallback
    const clearScrollFlag = () => {
      isScrollingFromClickRef.current = false;
    };

    if ("onscrollend" in window) {
      // Modern browsers: use scrollend event (fires once when scroll settles)
      // Store handler ref for cleanup on unmount
      scrollendHandlerRef.current = clearScrollFlag;
      window.addEventListener("scrollend", clearScrollFlag, { once: true });
    } else {
      // Fallback: use timeout for browsers without scrollend support
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(clearScrollFlag, 1000);
    }
  }, []);

  // Listen for manual scroll to clear click override
  React.useEffect(() => {
    if (!clickedUrl) return;

    const handleManualScroll = () => {
      // If this scroll is from clicking a TOC item, ignore it
      if (isScrollingFromClickRef.current) return;
      // User manually scrolled - clear the click override
      // Use startTransition for non-urgent state update
      startTransition(() => setClickedUrl(null));
    };

    window.addEventListener("scroll", handleManualScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleManualScroll);
    };
  }, [clickedUrl]);

  // Cleanup timeout and scrollend listener on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollendHandlerRef.current) {
        window.removeEventListener("scrollend", scrollendHandlerRef.current);
      }
    };
  }, []);

  if (toc.length === 0) {
    return (
      <div
        id="nd-toc"
        className="sticky top-(--fd-docs-row-3) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] w-(--fd-toc-width) flex-col pe-4 pt-12 pb-2 [grid-area:toc] max-xl:hidden"
        data-slot="toc"
      >
        {emptyTocContent}
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
        className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase"
      >
        <HugeiconsIcon icon={File01Icon} className="size-4" strokeWidth={2} />
        On this page
      </h3>
      <Primitive.AnchorProvider toc={toc} single={true}>
        <TocPositionManager
          containerRef={containerRef}
          toc={toc}
          hoveredUrl={hoveredUrl}
          activeAnchor={activeAnchor}
          clickedUrl={clickedUrl}
          usesCssAnchoring={usesCssAnchoring}
          setForcedActive={setForcedActive}
          setActiveAnchor={setActiveAnchor}
          setThumbPosition={setThumbPosition}
          setGhostPosition={setGhostPosition}
        />
        <Primitive.ScrollProvider containerRef={containerRef}>
          <nav
            aria-label="Table of contents"
            className="relative min-h-0 overflow-auto mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-4 pl-0.5 [scrollbar-width:none]"
          >
            {/* Items container - dashed track via background gradient */}
            <div
              ref={containerRef}
              className="group/toc-items relative flex flex-col gap-3 bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--color-accent-foreground)_30%,transparent)_33%,transparent_0)] bg-size-[1px_4px] bg-repeat-y"
            >
              {/* Pill thumb - centered on track */}
              <TocThumb position={thumbPosition} usesCssAnchoring={usesCssAnchoring} />
              {/* Ghost thumb - follows hovered item */}
              <TocGhostThumb position={ghostPosition} usesCssAnchoring={usesCssAnchoring} />
              {/* TOC items */}
              {toc.map((item) => (
                <TOCItem
                  key={item.url}
                  item={item}
                  isAnchor={activeAnchor === item.url}
                  isForcedActive={forcedActive === item.url}
                  suppressDataActive={forcedActive !== null && forcedActive !== item.url}
                  onHover={setHoveredUrl}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          </nav>
        </Primitive.ScrollProvider>
      </Primitive.AnchorProvider>
    </div>
  );
}
