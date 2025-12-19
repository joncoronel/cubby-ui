import * as React from "react";

import type {
  DrawerDirection,
  SnapPoint,
  ScrollGeometry,
} from "../lib/drawer-utils";
import {
  DIRECTION_CONFIG,
  supportsScrollEnd,
  supportsScrollTimeline,
  supportsScrollState,
  supportsScrollSnapChange,
  prefersReducedMotion,
  waitForScrollEnd,
  calculateScrollGeometry,
  calculateSnapScrollPositions,
  calculateScrollProgress,
  calculateSnapProgress,
} from "../lib/drawer-utils";

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
  /** Callback when scrolling state changes */
  onScrollingChange?: (isScrolling: boolean) => void;
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
 * Consolidated Ref Types
 * -------------------------------------------------------------------------------------------------*/

interface ScrollControlState {
  /** Whether currently in a programmatic scroll (not user-initiated) */
  isProgrammatic: boolean;
  /** Last detected snap index to avoid duplicate callbacks */
  lastDetectedSnapIndex: number;
  /** Whether state change came from detection (CSS snap) vs external */
  isFromDetection: boolean;
}

interface InteractionState {
  /** Whether drawer is closing (disables pointer events) */
  isClosing: boolean;
  /** Whether user is actively touching/pressing */
  isPointerDown: boolean;
  /** Previous scroll position for movement detection */
  prevScrollPos: number | null;
  /** Whether scrollend fired while pointer was down (Firefox: click stops momentum) */
  scrollEndedWhilePointerDown: boolean;
}

interface InitState {
  /** Whether initial scroll positioning is complete */
  hasInitialized: boolean;
  /** Timeout for DOM ready retry */
  retryTimeout: ReturnType<typeof setTimeout> | null;
  /** RAF ID for stability check */
  rafId: number | null;
  /** Last scroll position for RAF check */
  rafLastPos: number | null;
  /** Count of stable frames */
  rafStableCount: number;
}

/* -------------------------------------------------------------------------------------------------
 * Hook Implementation
 * -------------------------------------------------------------------------------------------------*/

// Re-export browser support detection for consumers
export {
  supportsScrollTimeline,
  supportsScrollState,
} from "../lib/drawer-utils";

export function useScrollSnap(
  options: UseScrollSnapOptions,
): UseScrollSnapReturn {
  const {
    direction,
    snapPoints,
    activeSnapPointIndex,
    dismissible,
    contentSize,
    open,
    onScrollProgress,
    onSnapProgress,
    onScrollingChange,
  } = options;

  // Get direction config (replaces repeated conditionals)
  const { isVertical, isInverted } = DIRECTION_CONFIG[direction];

  // DOM refs
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const snapTargetRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Consolidated refs (instead of 8+ scattered refs)
  const scrollControlRef = React.useRef<ScrollControlState>({
    isProgrammatic: false,
    lastDetectedSnapIndex: activeSnapPointIndex,
    isFromDetection: false,
  });

  const interactionRef = React.useRef<InteractionState>({
    isClosing: false,
    isPointerDown: false,
    prevScrollPos: null,
    scrollEndedWhilePointerDown: false,
  });

  const initRef = React.useRef<InitState>({
    hasInitialized: false,
    retryTimeout: null,
    rafId: null,
    rafLastPos: null,
    rafStableCount: 0,
  });

  // Options ref for stable callbacks (avoids effect dependency changes)
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  // React state (only what needs to trigger re-renders)
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [snapProgress, setSnapProgress] = React.useState(0);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const [isClosing, setIsClosingState] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [viewportSize, setViewportSize] = React.useState(() => {
    if (typeof window === "undefined") return 800;
    return isVertical ? window.innerHeight : window.innerWidth;
  });

  // Wrapper that updates both ref and state synchronously
  const setIsClosing = React.useCallback((value: boolean) => {
    interactionRef.current.isClosing = value;
    setIsClosingState(value);
  }, []);

  // Wrapper that updates scrolling state and notifies parent
  const updateIsScrolling = React.useCallback(
    (value: boolean) => {
      setIsScrolling(value);
      onScrollingChange?.(value);
    },
    [onScrollingChange],
  );

  // Calculate geometry using pure functions (memoized)
  const effectiveSize = contentSize ?? viewportSize * 0.9;

  const geometry = React.useMemo<ScrollGeometry>(
    () =>
      calculateScrollGeometry(
        viewportSize,
        effectiveSize,
        dismissible,
        isInverted,
      ),
    [viewportSize, effectiveSize, dismissible, isInverted],
  );

  const snapScrollPositions = React.useMemo(
    () =>
      calculateSnapScrollPositions(
        snapPoints,
        geometry,
        dismissible,
        effectiveSize,
      ),
    [snapPoints, geometry, dismissible, effectiveSize],
  );

  // Calculate scroll positions for CSS animation-range
  const firstSnapIndex = dismissible ? 1 : 0;
  const lastSnapIndex = snapScrollPositions.length - 1;
  const firstSnapScrollPos = snapScrollPositions[firstSnapIndex] ?? 0;
  const lastSnapScrollPos = snapScrollPositions[lastSnapIndex] ?? 0;
  const dismissScrollPos = snapScrollPositions[0] ?? 0;

  // Get scroll position for a snap point index
  const getScrollPositionForSnapPoint = React.useCallback(
    (index: number): number => {
      const adjustedIndex = dismissible ? index + 1 : index;
      return snapScrollPositions[adjustedIndex] ?? 0;
    },
    [snapScrollPositions, dismissible],
  );

  // Find nearest snap point from scroll position
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

  // Scroll to a specific snap point
  const scrollToSnapPoint = React.useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const container = containerRef.current;
      if (!container) return;

      const scrollPos = getScrollPositionForSnapPoint(index);
      const actualBehavior = prefersReducedMotion() ? "auto" : behavior;

      scrollControlRef.current.isProgrammatic = true;
      container.scrollTo({
        [isVertical ? "top" : "left"]: scrollPos,
        behavior: actualBehavior,
      });

      if (actualBehavior === "auto") {
        scrollControlRef.current.isProgrammatic = false;
      } else {
        waitForScrollEnd(container).then(() => {
          scrollControlRef.current.isProgrammatic = false;
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

      setIsClosing(true);
      scrollControlRef.current.isProgrammatic = true;

      container.scrollTo({
        [isVertical ? "top" : "left"]: 0,
        behavior: actualBehavior,
      });

      if (actualBehavior !== "auto") {
        await waitForScrollEnd(container);
      }
      scrollControlRef.current.isProgrammatic = false;
    },
    [isVertical, setIsClosing],
  );

  /* -------------------------------------------------------------------------------------------------
   * Event Handlers (defined outside effects for stability)
   * -------------------------------------------------------------------------------------------------*/

  // Helper to trigger dismiss when drawer exits viewport
  const triggerImmediateDismiss = React.useCallback(() => {
    if (interactionRef.current.isClosing) return;

    const container = containerRef.current;
    if (container) {
      container.style.overflow = "hidden";
      container.style.pointerEvents = "none";
      container.style.touchAction = "none";
    }

    setIsClosing(true);
    scrollControlRef.current.isProgrammatic = true;

    optionsRef.current.onImmediateClose?.();
    optionsRef.current.onDismiss();
  }, [setIsClosing]);

  // RAF-based scroll end detection (fallback for browsers without scrollend)
  const checkScrollStability = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { isVertical: isVert } =
      DIRECTION_CONFIG[optionsRef.current.direction];
    const currentPos = isVert ? container.scrollTop : container.scrollLeft;
    const { rafLastPos } = initRef.current;

    if (rafLastPos !== null && Math.abs(currentPos - rafLastPos) < 0.5) {
      initRef.current.rafStableCount++;
      // After 3 stable frames (~50ms), consider scroll ended
      // But only if user is not actively touching
      if (
        initRef.current.rafStableCount >= 3 &&
        !interactionRef.current.isPointerDown
      ) {
        updateIsScrolling(false);

        // Fallback snap detection
        if (
          !scrollControlRef.current.isProgrammatic &&
          !interactionRef.current.isClosing
        ) {
          const { index, isDismiss } = findNearestSnapIndex(currentPos);
          if (
            !isDismiss &&
            index !== scrollControlRef.current.lastDetectedSnapIndex
          ) {
            scrollControlRef.current.lastDetectedSnapIndex = index;
            scrollControlRef.current.isFromDetection = true;
            optionsRef.current.onSnapPointChange(index);
          }
        }

        initRef.current.rafId = null;
        initRef.current.rafLastPos = null;
        initRef.current.rafStableCount = 0;
        return;
      }
    } else {
      initRef.current.rafStableCount = 0;
    }

    initRef.current.rafLastPos = currentPos;
    initRef.current.rafId = requestAnimationFrame(checkScrollStability);
  }, [updateIsScrolling, findNearestSnapIndex]);

  const startScrollStabilityCheck = React.useCallback(() => {
    if (initRef.current.rafId === null) {
      initRef.current.rafLastPos = null;
      initRef.current.rafStableCount = 0;
      initRef.current.rafId = requestAnimationFrame(checkScrollStability);
    }
  }, [checkScrollStability]);

  // Main scroll handler
  const handleScroll = React.useCallback(() => {
    if (!initRef.current.hasInitialized) return;

    const container = containerRef.current;
    if (!container) return;

    const { isVertical: isVert } =
      DIRECTION_CONFIG[optionsRef.current.direction];
    const scrollPos = isVert ? container.scrollTop : container.scrollLeft;

    // Calculate and emit progress
    const progress = calculateScrollProgress(scrollPos, geometry);
    setScrollProgress(progress);
    optionsRef.current.onScrollProgress?.(progress);

    const snapProg = calculateSnapProgress(
      scrollPos,
      snapScrollPositions,
      optionsRef.current.dismissible,
    );
    setSnapProgress(snapProg);
    optionsRef.current.onSnapProgress?.(snapProg);

    // Only mark as scrolling for user-initiated scrolls
    // When pointer is down (user actively touching), use low threshold so slow drags register
    // When pointer is up, use higher threshold to filter scroll-snap settling micro-adjustments
    const scrollDelta =
      interactionRef.current.prevScrollPos !== null
        ? Math.abs(scrollPos - interactionRef.current.prevScrollPos)
        : 0;
    const threshold = interactionRef.current.isPointerDown ? 0.5 : 2;
    const positionChanged = scrollDelta > threshold;

    interactionRef.current.prevScrollPos = scrollPos;

    if (!scrollControlRef.current.isProgrammatic && positionChanged) {
      updateIsScrolling(true);
      // Start RAF-based stability check only for browsers without native scrollend
      if (!supportsScrollEnd) {
        startScrollStabilityCheck();
      }
    }

    // Trigger dismiss when drawer exits viewport
    if (!scrollControlRef.current.isProgrammatic) {
      if (
        optionsRef.current.dismissible &&
        !interactionRef.current.isClosing &&
        progress >= 1
      ) {
        triggerImmediateDismiss();
      }
    }
  }, [
    geometry,
    snapScrollPositions,
    updateIsScrolling,
    startScrollStabilityCheck,
    triggerImmediateDismiss,
  ]);

  // Scroll end handler
  const handleScrollEnd = React.useCallback(() => {
    // Firefox: clicking/touching stops momentum scroll and fires scrollend immediately.
    // If pointer is down, don't clear isScrolling yet - let touchend handler do it
    // so that click events can see we were scrolling and block the close.
    if (interactionRef.current.isPointerDown) {
      interactionRef.current.scrollEndedWhilePointerDown = true;
    } else {
      updateIsScrolling(false);
    }

    // Fallback snap detection for scrollend
    if (
      !scrollControlRef.current.isProgrammatic &&
      !interactionRef.current.isClosing
    ) {
      const container = containerRef.current;
      if (!container) return;

      const { isVertical: isVert } =
        DIRECTION_CONFIG[optionsRef.current.direction];
      const scrollPos = isVert ? container.scrollTop : container.scrollLeft;
      const { index, isDismiss } = findNearestSnapIndex(scrollPos);

      if (
        !isDismiss &&
        index !== scrollControlRef.current.lastDetectedSnapIndex
      ) {
        scrollControlRef.current.lastDetectedSnapIndex = index;
        scrollControlRef.current.isFromDetection = true;
        optionsRef.current.onSnapPointChange(index);
      }
    }
  }, [updateIsScrolling, findNearestSnapIndex]);

  // Native scroll snap change handler (Chrome 129+)
  const handleScrollSnapChange = React.useCallback((event: Event) => {
    if (interactionRef.current.isClosing) return;

    const snapEvent = event as Event & {
      snapTargetBlock?: Element | null;
      snapTargetInline?: Element | null;
    };

    const { isVertical: isVert } =
      DIRECTION_CONFIG[optionsRef.current.direction];
    const snapTarget = isVert
      ? snapEvent.snapTargetBlock
      : snapEvent.snapTargetInline;

    if (!snapTarget) return;

    const snapIndexAttr = snapTarget.getAttribute("data-snap-index");
    if (snapIndexAttr === null) return;

    const rawIndex = parseInt(snapIndexAttr, 10);
    if (isNaN(rawIndex)) return;

    const actualIndex = optionsRef.current.dismissible
      ? rawIndex - 1
      : rawIndex;
    if (actualIndex < 0) return;

    if (actualIndex !== scrollControlRef.current.lastDetectedSnapIndex) {
      scrollControlRef.current.lastDetectedSnapIndex = actualIndex;
      scrollControlRef.current.isFromDetection = true;
      optionsRef.current.onSnapPointChange(actualIndex);
    }
  }, []);

  // Touch handlers to track if user is actively touching (touch only, not mouse)
  // (Used by RAF stability check to distinguish "holding still" from "released")
  // Note: We use touch events only (not mouse) because:
  // 1. iOS Safari has quirky behavior with pointer events that causes flickering
  // 2. Mouse clicks on desktop can cause tiny scroll jitter that falsely triggers isScrolling
  const handleTouchStart = React.useCallback(() => {
    interactionRef.current.isPointerDown = true;
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    interactionRef.current.isPointerDown = false;
    // Reset stable count so we don't immediately fire handleScrollEnd
    // from counts accumulated while user was holding still
    // This gives momentum scroll time to start
    initRef.current.rafStableCount = 0;

    // Firefox: if scrollend fired while pointer was down (click stopped momentum),
    // start stability check to clear isScrolling once scroll position stabilizes.
    // This handles both cases:
    // - If snap animation occurs: scroll events keep firing, natural scrollend clears isScrolling
    // - If already at snap point: stability check detects no movement and clears isScrolling
    if (interactionRef.current.scrollEndedWhilePointerDown) {
      interactionRef.current.scrollEndedWhilePointerDown = false;
      startScrollStabilityCheck();
    }
  }, [startScrollStabilityCheck]);

  /* -------------------------------------------------------------------------------------------------
   * Effects (reduced from 5 to 4)
   * -------------------------------------------------------------------------------------------------*/

  // Effect 1: Initialization
  // Note: State/ref resets are unnecessary since DrawerContentInner unmounts on close,
  // giving us fresh state on remount. We only need to cancel pending callbacks.
  React.useEffect(() => {
    if (!open) {
      // Cancel pending callbacks during exit animation
      if (initRef.current.rafId !== null) {
        cancelAnimationFrame(initRef.current.rafId);
        initRef.current.rafId = null;
      }
      if (initRef.current.retryTimeout) {
        clearTimeout(initRef.current.retryTimeout);
        initRef.current.retryTimeout = null;
      }
      return;
    }

    // Wait for contentSize to be measured before positioning
    if (contentSize === null) return;

    // Perform initial scroll positioning (only once per open)
    if (!initRef.current.hasInitialized) {
      const performInitialScroll = () => {
        const container = containerRef.current;
        if (!container) {
          initRef.current.retryTimeout = setTimeout(performInitialScroll, 0);
          return;
        }

        const size = isVertical
          ? container.clientHeight
          : container.clientWidth;
        if (size === 0) {
          initRef.current.retryTimeout = setTimeout(performInitialScroll, 0);
          return;
        }

        initRef.current.hasInitialized = true;

        if (size !== viewportSize) {
          setViewportSize(size);
        }

        // Calculate target scroll position
        const targetIndex = dismissible
          ? activeSnapPointIndex + 1
          : activeSnapPointIndex;
        const targetScrollPos = snapScrollPositions[targetIndex] ?? 0;

        // Mark as programmatic scroll
        scrollControlRef.current.isProgrammatic = true;
        scrollControlRef.current.lastDetectedSnapIndex = activeSnapPointIndex;

        // Disable scroll-snap and smooth behavior for instant positioning
        container.style.scrollSnapType = "none";
        container.style.scrollBehavior = "auto";

        if (isVertical) {
          container.scrollTop = targetScrollPos;
        } else {
          container.scrollLeft = targetScrollPos;
        }

        // Calculate and emit initial progress
        const initialProgress = calculateScrollProgress(
          targetScrollPos,
          geometry,
        );
        setScrollProgress(initialProgress);
        onScrollProgress?.(initialProgress);

        const initialSnapProgress = calculateSnapProgress(
          targetScrollPos,
          snapScrollPositions,
          dismissible,
        );
        setSnapProgress(initialSnapProgress);
        onSnapProgress?.(initialSnapProgress);

        // Re-enable scroll-snap and smooth behavior
        container.style.scrollSnapType = isVertical
          ? "y mandatory"
          : "x mandatory";
        container.style.scrollBehavior = "smooth";

        // Clear programmatic flag after a tick
        setTimeout(() => {
          scrollControlRef.current.isProgrammatic = false;
        }, 0);

        setIsInitialized(true);
      };

      initRef.current.retryTimeout = setTimeout(performInitialScroll, 0);
    }

    return () => {
      if (initRef.current.retryTimeout) {
        clearTimeout(initRef.current.retryTimeout);
        initRef.current.retryTimeout = null;
      }
    };
  }, [
    open,
    contentSize,
    isVertical,
    viewportSize,
    dismissible,
    activeSnapPointIndex,
    snapScrollPositions,
    geometry,
    onScrollProgress,
    onSnapProgress,
  ]);

  // Effect 2: Keep lastDetectedSnapIndex in sync with activeSnapPointIndex
  // This prevents handleScrollSnapChange from setting isFromDetection=true after programmatic scrolls
  React.useEffect(() => {
    if (open) {
      scrollControlRef.current.lastDetectedSnapIndex = activeSnapPointIndex;
    }
  }, [open, activeSnapPointIndex]);

  // Effect 3: Handle controlled snap point changes (from external sources like buttons)
  const prevSnapPointRef = React.useRef(activeSnapPointIndex);
  React.useEffect(() => {
    if (prevSnapPointRef.current !== activeSnapPointIndex && open) {
      // Skip if this change came from detection (CSS scroll-snap already handled it)
      if (scrollControlRef.current.isFromDetection) {
        scrollControlRef.current.isFromDetection = false;
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

  // Effect 4: Event listeners (stable handlers, minimal dependencies)
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !open) return;

    // Attach event listeners
    container.addEventListener("scroll", handleScroll, { passive: true });

    // Touch tracking to distinguish "holding still" from "released with momentum"
    // Note: We use touch events only (not mouse) to avoid false positives from
    // mouse click jitter on desktop triggering scroll events
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    if (supportsScrollEnd) {
      container.addEventListener("scrollend", handleScrollEnd);
    }

    if (supportsScrollSnapChange) {
      container.addEventListener("scrollsnapchange", handleScrollSnapChange);
    }

    // Viewport resize handling
    const updateViewportSize = () => {
      const size = isVertical ? container.clientHeight : container.clientWidth;
      setViewportSize(size);
    };
    window.addEventListener("resize", updateViewportSize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);

      if (supportsScrollEnd) {
        container.removeEventListener("scrollend", handleScrollEnd);
      }

      if (supportsScrollSnapChange) {
        container.removeEventListener(
          "scrollsnapchange",
          handleScrollSnapChange,
        );
      }

      window.removeEventListener("resize", updateViewportSize);
    };
  }, [
    open,
    isVertical,
    handleScroll,
    handleScrollEnd,
    handleScrollSnapChange,
    handleTouchStart,
    handleTouchEnd,
  ]);

  return {
    containerRef,
    scrollProgress,
    snapProgress,
    isScrolling,
    scrollToSnapPoint,
    scrollToClose,
    snapTargetRefs,
    trackSize: geometry.trackSize,
    snapScrollPositions,
    isInitialized,
    isClosing,
    firstSnapScrollPos,
    lastSnapScrollPos,
    dismissScrollPos,
  };
}
