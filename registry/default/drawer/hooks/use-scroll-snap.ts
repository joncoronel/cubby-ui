import * as React from "react";

import type { DrawerDirection, SnapPoint } from "./use-snap-points";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

export interface UseScrollSnapOptions {
  /** Direction the drawer opens from */
  direction: DrawerDirection;
  /** Snap points configuration */
  snapPoints: SnapPoint[];
  /** Current active snap point index */
  activeSnapPointIndex: number;
  /** Callback when snap point changes */
  onSnapPointChange: (index: number) => void;
  /** Callback when drawer should be dismissed */
  onDismiss: () => void;
  /** Whether drawer can be dismissed by swiping */
  dismissible: boolean;
  /** Size of the drawer content */
  contentSize: number | null;
  /** Whether the drawer is open */
  open: boolean;
  /** Callback during scroll with progress (0-1, where 0 = open, 1 = closed) */
  onScrollProgress?: (progress: number) => void;
  /** Callback during scroll with snap progress (0 = first snap, 1 = last snap) */
  onSnapProgress?: (progress: number) => void;
  /** Callback to signal immediate close (skip exit animation) for swipe dismiss */
  onImmediateClose?: () => void;
  /** Whether the drawer is currently animating (enter/exit CSS transition) */
  isAnimating?: boolean;
}

export interface UseScrollSnapReturn {
  /** Ref for the scroll container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Current scroll progress (0 = fully open, 1 = fully closed) */
  scrollProgress: number;
  /** Progress between snap points (0 = first snap, 1 = last snap) */
  snapProgress: number;
  /** Whether currently scrolling/dragging */
  isScrolling: boolean;
  /** Programmatically scroll to a snap point */
  scrollToSnapPoint: (index: number, behavior?: ScrollBehavior) => void;
  /** Scroll to closed position (for close animation) */
  scrollToClose: (behavior?: ScrollBehavior) => Promise<void>;
  /** Snap target refs for the snap elements */
  snapTargetRefs: React.RefObject<(HTMLDivElement | null)[]>;
  /** Track size for the scroll container */
  trackSize: number;
  /** Snap positions (scroll positions for each snap point) */
  snapScrollPositions: number[];
  /** Whether the initial scroll positioning is complete */
  isInitialized: boolean;
  /** Whether the drawer is in the process of closing (pointer events should be disabled) */
  isClosing: boolean;
  /** Scroll position for first snap point (for CSS animation-range) */
  firstSnapScrollPos: number;
  /** Scroll position for last snap point (for CSS animation-range) */
  lastSnapScrollPos: number;
  /** Scroll position for dismiss (0 or last depending on direction, for CSS animation-range) */
  dismissScrollPos: number;
}

/* -------------------------------------------------------------------------------------------------
 * Browser Support Detection
 * -------------------------------------------------------------------------------------------------*/

const supportsScrollEnd =
  typeof window !== "undefined" && "onscrollend" in window;

/**
 * Feature detection for scroll-driven animations (animation-timeline: scroll())
 * Chrome 115+, Safari 26+ (future), Firefox flag-only
 */
export const supportsScrollTimeline =
  typeof CSS !== "undefined" &&
  CSS.supports("animation-timeline", "scroll()") &&
  CSS.supports("timeline-scope", "--test");

/**
 * Feature detection for scroll snap events (scrollsnapchange, scrollsnapchanging)
 * Chrome 129+ only
 */
export const supportsScrollSnapChange =
  typeof window !== "undefined" && "onscrollsnapchange" in window;

/**
 * Feature detection for CSS scroll-state() container queries
 * Chrome 133+ only
 */
export const supportsScrollState =
  typeof CSS !== "undefined" && CSS.supports("container-type", "scroll-state");

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -------------------------------------------------------------------------------------------------*/

/**
 * Parse a pixel value string (e.g., "200px") and return the number
 */
function parsePixelValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Wait for scroll to end on an element
 */
function waitForScrollEnd(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    if (supportsScrollEnd) {
      element.addEventListener("scrollend", () => resolve(), { once: true });
    } else {
      // Fallback: debounced scroll detection
      let timeout: ReturnType<typeof setTimeout>;
      const handler = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          element.removeEventListener("scroll", handler);
          resolve();
        }, 0);
      };
      element.addEventListener("scroll", handler, { passive: true });
    }
  });
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* -------------------------------------------------------------------------------------------------
 * Hook Implementation
 * -------------------------------------------------------------------------------------------------*/

export function useScrollSnap({
  direction,
  snapPoints,
  activeSnapPointIndex,
  onSnapPointChange,
  onDismiss,
  dismissible,
  contentSize,
  open,
  onScrollProgress,
  onSnapProgress,
  onImmediateClose,
  isAnimating,
}: UseScrollSnapOptions): UseScrollSnapReturn {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const snapTargetRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [snapProgress, setSnapProgress] = React.useState(0);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  // Track whether we're programmatically scrolling (to avoid triggering snap change callbacks)
  const isProgrammaticScrollRef = React.useRef(false);

  // Track closing state with ref to avoid stale closures in scroll handler
  const isClosingRef = React.useRef(false);
  React.useEffect(() => {
    isClosingRef.current = isClosing;
  }, [isClosing]);

  const isVertical = direction === "top" || direction === "bottom";

  // Use CSS viewport units for more reliable mobile measurements
  const [viewportSize, setViewportSize] = React.useState(() => {
    if (typeof window === "undefined") return 800;
    return isVertical ? window.innerHeight : window.innerWidth;
  });

  const effectiveSize = contentSize ?? viewportSize * 0.9;

  // Calculate track size (viewport + drawer size + dismiss buffer)
  const dismissBuffer = dismissible ? effectiveSize * 0.3 : 0;
  const trackSize = viewportSize + effectiveSize + dismissBuffer;

  // Determine if this direction uses inverted scroll (drawer at start of track)
  const isInvertedScroll = direction === "top" || direction === "left";

  // Calculate snap scroll positions
  const snapScrollPositions = React.useMemo(() => {
    const positions: number[] = [];
    const maxScroll = trackSize - viewportSize;
    const visibleRange = maxScroll - dismissBuffer;

    // Add dismiss position first if dismissible
    // Bottom/Right: dismiss at scroll 0 (drawer hidden at end)
    // Top/Left: dismiss at maxScroll (drawer hidden at start)
    if (dismissible) {
      positions.push(isInvertedScroll ? maxScroll : 0);
    }

    // Calculate positions for each snap point
    snapPoints.forEach((snapPoint) => {
      let visibleRatio: number;

      if (typeof snapPoint === "string") {
        const pixels = parsePixelValue(snapPoint);
        visibleRatio = (pixels ?? effectiveSize) / effectiveSize;
      } else {
        visibleRatio = snapPoint;
      }

      // Calculate scroll position
      // Bottom/Right: more visible = higher scroll position
      // Top/Left: more visible = lower scroll position (inverted)
      let scrollPos: number;
      if (isInvertedScroll) {
        // Inverted: maxScroll (closed) -> 0 (fully open)
        scrollPos = maxScroll - dismissBuffer - visibleRatio * visibleRange;
      } else {
        // Normal: 0 (closed) -> maxScroll (fully open)
        scrollPos = dismissBuffer + visibleRatio * visibleRange;
      }

      positions.push(Math.min(maxScroll, Math.max(0, scrollPos)));
    });

    return positions;
  }, [
    snapPoints,
    trackSize,
    viewportSize,
    effectiveSize,
    dismissible,
    dismissBuffer,
    isInvertedScroll,
  ]);

  // Get the scroll position for the active snap point
  const getScrollPositionForSnapPoint = React.useCallback(
    (index: number): number => {
      const adjustedIndex = dismissible ? index + 1 : index;
      return snapScrollPositions[adjustedIndex] ?? 0;
    },
    [snapScrollPositions, dismissible],
  );

  // Find nearest snap point index from scroll position
  const findNearestSnapIndex = React.useCallback(
    (scrollPos: number): { index: number; isDismiss: boolean } => {
      let closestIndex = 0;
      let closestDistance = Infinity;

      snapScrollPositions.forEach((pos, i) => {
        const distance = Math.abs(scrollPos - pos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      });

      if (dismissible && closestIndex === 0) {
        return { index: 0, isDismiss: true };
      }

      const snapIndex = dismissible ? closestIndex - 1 : closestIndex;
      return { index: Math.max(0, snapIndex), isDismiss: false };
    },
    [snapScrollPositions, dismissible],
  );

  // Calculate progress from scroll position
  // Progress: 0 = fully open, 1 = fully closed
  const calculateProgress = React.useCallback(
    (scrollPos: number): number => {
      const maxScroll = trackSize - viewportSize;
      const visibleRange = maxScroll - dismissBuffer;

      let progress: number;
      if (isInvertedScroll) {
        // Top/Left: maxScroll = closed (1), 0 = open (0)
        // Open position is at: maxScroll - dismissBuffer - visibleRange
        const openScrollPos = maxScroll - dismissBuffer - visibleRange;
        progress = (scrollPos - openScrollPos) / visibleRange;
      } else {
        // Bottom/Right: 0 = closed (1), maxScroll = open (0)
        progress = 1 - (scrollPos - dismissBuffer) / visibleRange;
      }

      return Math.min(1, Math.max(0, progress));
    },
    [trackSize, viewportSize, dismissBuffer, isInvertedScroll],
  );

  // Calculate snap progress from scroll position
  // Snap progress: 0 = at first snap point, 1 = at last snap point
  const calculateSnapProgress = React.useCallback(
    (scrollPos: number): number => {
      // Get first and last snap positions (excluding dismiss position)
      const firstSnapIndex = dismissible ? 1 : 0;
      const lastSnapIndex = snapScrollPositions.length - 1;

      // Handle edge case of single snap point
      if (firstSnapIndex >= lastSnapIndex) return 0;

      const firstSnapPos = snapScrollPositions[firstSnapIndex];
      const lastSnapPos = snapScrollPositions[lastSnapIndex];

      // Handle edge case of same positions
      if (firstSnapPos === lastSnapPos) return 0;

      // Normalize scroll position to 0-1 between first and last snap
      const progress =
        (scrollPos - firstSnapPos) / (lastSnapPos - firstSnapPos);
      return Math.min(1, Math.max(0, progress));
    },
    [snapScrollPositions, dismissible],
  );

  // Scroll to a specific snap point
  const scrollToSnapPoint = React.useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      if (!container) return;

      const scrollPos = getScrollPositionForSnapPoint(index);
      const actualBehavior = prefersReducedMotion() ? "auto" : behavior;

      isProgrammaticScrollRef.current = true;
      container.scrollTo({
        [isVertical ? "top" : "left"]: scrollPos,
        behavior: actualBehavior,
      });

      if (actualBehavior === "auto") {
        isProgrammaticScrollRef.current = false;
      } else {
        waitForScrollEnd(container).then(() => {
          isProgrammaticScrollRef.current = false;
        });
      }
    },
    [getScrollPositionForSnapPoint, isVertical],
  );

  // Scroll to close position
  const scrollToClose = React.useCallback(
    async (behavior: ScrollBehavior = "smooth"): Promise<void> => {
      const container = containerRef.current;
      if (!container) return;

      const actualBehavior = prefersReducedMotion() ? "auto" : behavior;

      // Mark as closing to disable all pointer events
      setIsClosing(true);
      isProgrammaticScrollRef.current = true;

      container.scrollTo({
        [isVertical ? "top" : "left"]: 0,
        behavior: actualBehavior,
      });

      if (actualBehavior !== "auto") {
        await waitForScrollEnd(container);
      }
      isProgrammaticScrollRef.current = false;
      // Note: isClosing stays true since dialog is about to close anyway
    },
    [isVertical],
  );

  // Track if we've done initial scroll for this open
  const hasInitializedRef = React.useRef(false);
  const retryTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Track if initial scroll is complete (used to skip dismiss detection during init)
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initial scroll positioning - wait for contentSize to be measured
  React.useEffect(() => {
    if (!open) {
      // Reset all state when drawer closes
      hasInitializedRef.current = false;
      setIsInitialized(false);
      setIsClosing(false);
      setIsScrolling(false);
      isProgrammaticScrollRef.current = false;
      prevScrollPosRef.current = null;
      isTouchingRef.current = false;
      // Cancel any running RAF stability check
      if (rafStateRef.current.rafId !== null) {
        cancelAnimationFrame(rafStateRef.current.rafId);
        rafStateRef.current.rafId = null;
      }
      rafStateRef.current.lastScrollPos = null;
      rafStateRef.current.stableCount = 0;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      return;
    }

    // CRITICAL: Wait for contentSize to be measured before scrolling
    // Otherwise track height will change and clamp our scroll position
    if (contentSize === null) return;

    // Don't re-run if already initialized with measured contentSize
    if (hasInitializedRef.current) return;

    const performInitialScroll = () => {
      const container = containerRef.current;
      if (!container) {
        retryTimeoutRef.current = setTimeout(performInitialScroll, 0);
        return;
      }

      // Measure the actual container size
      const size = isVertical ? container.clientHeight : container.clientWidth;
      if (size === 0) {
        retryTimeoutRef.current = setTimeout(performInitialScroll, 0);
        return;
      }

      hasInitializedRef.current = true;

      if (size !== viewportSize) {
        setViewportSize(size);
      }

      // Use the actual snap position from our pre-calculated array
      const targetIndex = dismissible
        ? activeSnapPointIndex + 1
        : activeSnapPointIndex;
      const targetScrollPos = snapScrollPositions[targetIndex] ?? 0;

      // Mark as programmatic scroll to prevent isScrolling from being set
      isProgrammaticScrollRef.current = true;

      // Disable scroll-snap AND scroll-behavior for instant positioning
      container.style.scrollSnapType = "none";
      container.style.scrollBehavior = "auto";

      if (isVertical) {
        container.scrollTop = targetScrollPos;
      } else {
        container.scrollLeft = targetScrollPos;
      }

      // Calculate and emit initial progress for backdrop opacity
      const initialProgress = calculateProgress(targetScrollPos);
      setScrollProgress(initialProgress);
      onScrollProgress?.(initialProgress);

      // Calculate and emit initial snap progress
      const initialSnapProgress = calculateSnapProgress(targetScrollPos);
      setSnapProgress(initialSnapProgress);
      onSnapProgress?.(initialSnapProgress);

      // Re-enable scroll-snap and smooth behavior
      container.style.scrollSnapType = isVertical
        ? "y mandatory"
        : "x mandatory";
      container.style.scrollBehavior = "smooth";

      // Clear programmatic flag after a tick (after scroll events have fired)
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 0);

      // Mark as initialized
      setIsInitialized(true);
    };

    // Small delay to let DOM settle
    retryTimeoutRef.current = setTimeout(performInitialScroll, 0);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [
    open,
    isVertical,
    viewportSize,
    contentSize,
    dismissible,
    snapPoints,
    activeSnapPointIndex,
    snapScrollPositions,
    calculateProgress,
    calculateSnapProgress,
    onScrollProgress,
    onSnapProgress,
  ]);

  // Track the last detected snap index to avoid duplicate callbacks
  const lastDetectedSnapIndexRef = React.useRef(activeSnapPointIndex);

  // Track if the state change came from detection (vs external like button click)
  // When true, the controlled effect should skip programmatic scrolling
  const isStateFromDetectionRef = React.useRef(false);

  // Track previous scroll position to detect actual movement
  // This prevents spurious scroll events (common on iOS Safari for Bottom/Right drawers)
  // from keeping isScrolling stuck as true
  const prevScrollPosRef = React.useRef<number | null>(null);

  // Persist RAF stability check state across effect re-runs
  // This is critical because the effect may re-run during scroll (due to dependency changes)
  // and we don't want to lose the RAF state
  const rafStateRef = React.useRef({
    rafId: null as number | null,
    lastScrollPos: null as number | null,
    stableCount: 0,
  });

  // Track whether user is actively touching (to distinguish hold vs momentum)
  const isTouchingRef = React.useRef(false);

  // Reset last detected snap index when drawer opens
  React.useEffect(() => {
    if (open) {
      lastDetectedSnapIndexRef.current = activeSnapPointIndex;
    }
  }, [open, activeSnapPointIndex]);

  // Handle scroll events for progress tracking and snap detection
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !open) return;

    // Helper to trigger dismiss immediately when drawer exits viewport
    const triggerImmediateDismiss = () => {
      if (isClosingRef.current) return; // Guard against multiple calls

      // Immediately disable interaction (don't wait for React state update)
      container.style.overflow = "hidden";
      container.style.pointerEvents = "none";
      container.style.touchAction = "none";

      setIsClosing(true);
      isClosingRef.current = true;
      isProgrammaticScrollRef.current = true;

      // Signal immediate close (skip exit animation) then dismiss
      onImmediateClose?.();
      onDismiss();
    };

    // RAF-based scroll end detection - more reliable than scrollend event
    // Detects when scroll position stops changing for a few frames
    // Uses rafStateRef to persist state across effect re-runs

    const checkScrollStability = () => {
      const currentPos = isVertical
        ? container.scrollTop
        : container.scrollLeft;

      const { lastScrollPos } = rafStateRef.current;

      if (
        lastScrollPos !== null &&
        Math.abs(currentPos - lastScrollPos) < 0.5
      ) {
        rafStateRef.current.stableCount++;
        // After 3 stable frames (~50ms), consider scroll ended
        // But only if user is not actively touching - they might be holding still
        if (rafStateRef.current.stableCount >= 3 && !isTouchingRef.current) {
          handleScrollEnd();
          rafStateRef.current.rafId = null;
          rafStateRef.current.lastScrollPos = null;
          rafStateRef.current.stableCount = 0;
          return;
        }
      } else {
        rafStateRef.current.stableCount = 0;
      }

      rafStateRef.current.lastScrollPos = currentPos;
      rafStateRef.current.rafId = requestAnimationFrame(checkScrollStability);
    };

    const startScrollStabilityCheck = () => {
      if (rafStateRef.current.rafId === null) {
        rafStateRef.current.lastScrollPos = null;
        rafStateRef.current.stableCount = 0;
        rafStateRef.current.rafId = requestAnimationFrame(checkScrollStability);
      }
    };

    const handleScroll = () => {
      // Skip during initialization (scroll position is 0 before init)
      if (!isInitialized) return;

      const scrollPos = isVertical ? container.scrollTop : container.scrollLeft;
      const progress = calculateProgress(scrollPos);
      setScrollProgress(progress);
      onScrollProgress?.(progress);

      // Calculate and emit snap progress
      const snapProg = calculateSnapProgress(scrollPos);
      setSnapProgress(snapProg);
      onSnapProgress?.(snapProg);

      // Only mark as scrolling for user-initiated scrolls, not programmatic
      // Programmatic scrolls (especially with behavior: 'auto') don't trigger scrollend,
      // which would leave isScrolling stuck as true forever
      // Use 2px threshold to filter out scroll-snap micro-adjustments when settling
      const positionChanged =
        prevScrollPosRef.current !== null &&
        Math.abs(scrollPos - prevScrollPosRef.current) > 2;

      // Always update the position baseline (for both programmatic and user scrolls)
      prevScrollPosRef.current = scrollPos;

      // Only set isScrolling for user-initiated scrolls with actual movement
      if (!isProgrammaticScrollRef.current && positionChanged) {
        setIsScrolling(true);
        // Start RAF-based stability check only for browsers without native scrollend
        // Chrome's scrollend already has correct touch-awareness built in
        if (!supportsScrollEnd) {
          startScrollStabilityCheck();
        }
      }

      // Only do snap detection for user drags, not programmatic scroll
      if (!isProgrammaticScrollRef.current) {
        // Trigger dismiss when drawer exits viewport (progress >= 1)
        if (dismissible && !isClosingRef.current && progress >= 1) {
          triggerImmediateDismiss();
          return;
        }

        // Snap detection is handled by:
        // - scrollsnapchange (Chrome 129+): native event after snap completes
        // - scrollend (Firefox 109+, Chrome 114+): position-based detection after scroll ends
        // - RAF stability check: detects when scroll position stops changing
        // All browsers update snap point only after scrolling ends, not during drag
      }
    };

    const handleScrollEnd = () => {
      setIsScrolling(false);

      // Fallback snap detection for scrollend (catches cases where scrollsnapchange didn't fire)
      // This is especially important for fast swipes where scrollsnapchange may be unreliable
      if (!isProgrammaticScrollRef.current && !isClosingRef.current) {
        const scrollPos = isVertical
          ? container.scrollTop
          : container.scrollLeft;
        const { index, isDismiss } = findNearestSnapIndex(scrollPos);

        if (!isDismiss && index !== lastDetectedSnapIndexRef.current) {
          lastDetectedSnapIndexRef.current = index;
          isStateFromDetectionRef.current = true;
          onSnapPointChange(index);
        }
      }
    };

    // Native scroll snap change event (Chrome 129+)
    // Provides the actual snapped element, more reliable than position-based detection
    const handleScrollSnapChange = (event: Event) => {
      // Skip during closing only - not during programmatic scroll
      // scrollsnapchange fires AFTER scroll completes, so it's safe to process
      // even for programmatic scrolls (calling onSnapPointChange with same value is a no-op)
      // This ensures user swipes that happen right after programmatic scrolls are caught
      if (isClosingRef.current) return;

      // Get the snapped element from the event
      // TypeScript doesn't have types for this yet, so we need to cast
      const snapEvent = event as Event & {
        snapTargetBlock?: Element | null;
        snapTargetInline?: Element | null;
      };
      const snapTarget = isVertical
        ? snapEvent.snapTargetBlock
        : snapEvent.snapTargetInline;

      if (!snapTarget) return;

      // Get snap index from data attribute
      const snapIndexAttr = snapTarget.getAttribute("data-snap-index");
      if (snapIndexAttr === null) return;

      const rawIndex = parseInt(snapIndexAttr, 10);
      if (isNaN(rawIndex)) return;

      // Adjust for dismiss target (index 0 is dismiss when dismissible)
      const actualIndex = dismissible ? rawIndex - 1 : rawIndex;

      // Index -1 means dismiss target was snapped (shouldn't happen normally,
      // as dismiss is handled by progress >= 1 check, but handle gracefully)
      if (actualIndex < 0) return;

      if (actualIndex !== lastDetectedSnapIndexRef.current) {
        lastDetectedSnapIndexRef.current = actualIndex;
        isStateFromDetectionRef.current = true;
        onSnapPointChange(actualIndex);
      }
    };

    // Touch/mouse tracking to distinguish "holding still" from "released with momentum"
    const handleTouchStart = () => {
      isTouchingRef.current = true;
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
      // Reset stable count so we don't immediately fire handleScrollEnd
      // from counts accumulated while user was holding still
      // This gives momentum scroll time to start
      rafStateRef.current.stableCount = 0;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });
    container.addEventListener("mousedown", handleTouchStart);
    container.addEventListener("mouseup", handleTouchEnd);

    // Also use native scrollend if available (may fire faster than RAF check)
    if (supportsScrollEnd) {
      container.addEventListener("scrollend", handleScrollEnd);
    }

    if (supportsScrollSnapChange) {
      container.addEventListener("scrollsnapchange", handleScrollSnapChange);
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
      container.removeEventListener("mousedown", handleTouchStart);
      container.removeEventListener("mouseup", handleTouchEnd);
      // Don't cancel RAF on cleanup - let it complete to detect scroll end
      // The ref persists across effect re-runs
      if (supportsScrollEnd) {
        container.removeEventListener("scrollend", handleScrollEnd);
      }
      if (supportsScrollSnapChange) {
        container.removeEventListener(
          "scrollsnapchange",
          handleScrollSnapChange,
        );
      }
    };
  }, [
    isVertical,
    calculateProgress,
    calculateSnapProgress,
    open,
    isInitialized,
    dismissible,
    findNearestSnapIndex,
    onScrollProgress,
    onSnapProgress,
    onDismiss,
    onImmediateClose,
    onSnapPointChange,
  ]);

  // Update viewport size when container is mounted and on resize
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateViewportSize = () => {
      const size = isVertical ? container.clientHeight : container.clientWidth;
      setViewportSize(size);
    };

    updateViewportSize();

    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, [isVertical]);

  // Handle controlled snap point changes (from external sources like buttons)
  const prevSnapPointRef = React.useRef(activeSnapPointIndex);
  React.useEffect(() => {
    if (prevSnapPointRef.current !== activeSnapPointIndex && open) {
      // Skip if this change came from detection (CSS scroll-snap already handled it)
      if (isStateFromDetectionRef.current) {
        isStateFromDetectionRef.current = false;
        prevSnapPointRef.current = activeSnapPointIndex;
        return;
      }

      // Only scroll if we're not already at the target position
      const container = containerRef.current;
      if (container) {
        const currentScrollPos = isVertical
          ? container.scrollTop
          : container.scrollLeft;
        const targetScrollPos =
          getScrollPositionForSnapPoint(activeSnapPointIndex);
        const tolerance = 10; // pixels

        if (Math.abs(currentScrollPos - targetScrollPos) > tolerance) {
          scrollToSnapPoint(activeSnapPointIndex, "smooth");
        }
      }
    }
    prevSnapPointRef.current = activeSnapPointIndex;
  }, [
    activeSnapPointIndex,
    open,
    scrollToSnapPoint,
    isVertical,
    getScrollPositionForSnapPoint,
  ]);

  // Calculate scroll positions for CSS animation-range
  const firstSnapIndex = dismissible ? 1 : 0;
  const lastSnapIndex = snapScrollPositions.length - 1;
  const firstSnapScrollPos = snapScrollPositions[firstSnapIndex] ?? 0;
  const lastSnapScrollPos = snapScrollPositions[lastSnapIndex] ?? 0;
  const dismissScrollPos = snapScrollPositions[0] ?? 0;

  return {
    containerRef,
    scrollProgress,
    snapProgress,
    isScrolling,
    scrollToSnapPoint,
    scrollToClose,
    snapTargetRefs,
    trackSize,
    snapScrollPositions,
    isInitialized,
    isClosing,
    firstSnapScrollPos,
    lastSnapScrollPos,
    dismissScrollPos,
  };
}
