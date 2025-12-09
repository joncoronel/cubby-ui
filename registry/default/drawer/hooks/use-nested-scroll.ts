import * as React from "react";

import type { DrawerDirection } from "./use-snap-points";

export interface UseNestedScrollOptions {
  /** Ref to the drawer content container */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Direction the drawer opens from */
  direction: DrawerDirection;
  /** Whether nested scroll detection is enabled */
  enabled?: boolean;
}

export interface UseNestedScrollReturn {
  /**
   * Whether the active scrollable element is at its boundary
   * in the direction that would dismiss the drawer.
   *
   * - For bottom drawer: true when scrolled to top
   * - For top drawer: true when scrolled to bottom
   * - For right drawer: true when scrolled to left
   * - For left drawer: true when scrolled to right
   */
  isAtScrollBoundary: boolean;

  /**
   * The currently active scrollable element (if any)
   */
  activeScrollableElement: HTMLElement | null;
}

/**
 * Hook to detect when nested scrollable content is at its boundary
 *
 * This enables the drawer to be dismissed by swiping only when:
 * 1. There is no nested scrollable content, OR
 * 2. The nested scrollable content is at its boundary in the dismiss direction
 *
 * Mark scrollable areas with `data-drawer-scrollable` attribute to enable detection.
 */
export function useNestedScroll({
  containerRef,
  direction,
  enabled = true,
}: UseNestedScrollOptions): UseNestedScrollReturn {
  const [isAtScrollBoundary, setIsAtScrollBoundary] = React.useState(true);
  const [activeScrollableElement, setActiveScrollableElement] =
    React.useState<HTMLElement | null>(null);

  const isVertical = direction === "top" || direction === "bottom";

  // Check if element is at the relevant scroll boundary
  const checkBoundary = React.useCallback(
    (element: HTMLElement): boolean => {
      if (isVertical) {
        const atTop = element.scrollTop <= 1; // Small threshold for rounding
        const atBottom =
          element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

        // For bottom drawer, we dismiss by swiping down, so check if at top
        // For top drawer, we dismiss by swiping up, so check if at bottom
        return direction === "bottom" ? atTop : atBottom;
      } else {
        const atLeft = element.scrollLeft <= 1;
        const atRight =
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;

        // For right drawer, we dismiss by swiping right, so check if at left
        // For left drawer, we dismiss by swiping left, so check if at right
        return direction === "right" ? atLeft : atRight;
      }
    },
    [direction, isVertical],
  );

  // Handle scroll events on scrollable elements
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Find all scrollable elements
    const scrollableElements = container.querySelectorAll<HTMLElement>(
      "[data-drawer-scrollable]",
    );

    if (scrollableElements.length === 0) {
      // No scrollable elements - always allow dismiss
      setIsAtScrollBoundary(true);
      setActiveScrollableElement(null);
      return;
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setActiveScrollableElement(target);
      setIsAtScrollBoundary(checkBoundary(target));
    };

    // Check boundary on pointer/touch start to determine if we should allow the gesture
    // This runs synchronously before the gesture handler processes the event
    const handlePointerStart = (e: PointerEvent | TouchEvent) => {
      // Find the scrollable element that contains the pointer target
      const target =
        e instanceof TouchEvent
          ? (e.touches[0]?.target as HTMLElement)
          : (e.target as HTMLElement);

      if (!target) return;

      const scrollableParent = target.closest<HTMLElement>(
        "[data-drawer-scrollable]",
      );

      if (scrollableParent) {
        setActiveScrollableElement(scrollableParent);
        setIsAtScrollBoundary(checkBoundary(scrollableParent));
      } else {
        // Not inside a scrollable area - allow dismiss
        setActiveScrollableElement(null);
        setIsAtScrollBoundary(true);
      }
    };

    // Attach scroll listeners to all scrollable elements
    scrollableElements.forEach((el) => {
      el.addEventListener("scroll", handleScroll, { passive: true });
    });

    // Attach pointer down to container (fires before gesture handler)
    // Use capture phase to ensure we run first
    container.addEventListener("pointerdown", handlePointerStart, {
      capture: true,
      passive: true,
    });
    container.addEventListener("touchstart", handlePointerStart, {
      capture: true,
      passive: true,
    });

    // Initial check - set boundary state based on first scrollable element
    const firstScrollable = scrollableElements[0];
    if (firstScrollable) {
      setIsAtScrollBoundary(checkBoundary(firstScrollable));
    }

    return () => {
      scrollableElements.forEach((el) => {
        el.removeEventListener("scroll", handleScroll);
      });
      container.removeEventListener("pointerdown", handlePointerStart, {
        capture: true,
      });
      container.removeEventListener("touchstart", handlePointerStart, {
        capture: true,
      });
    };
  }, [containerRef, enabled, checkBoundary]);

  return {
    isAtScrollBoundary,
    activeScrollableElement,
  };
}
