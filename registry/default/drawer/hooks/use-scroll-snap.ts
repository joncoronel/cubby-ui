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

export interface UseScrollSnapOptions {
  direction: DrawerDirection;
  snapPoints: SnapPoint[];
  activeSnapPointIndex: number;
  onSnapPointChange: (index: number) => void;
  onDismiss: () => void;
  dismissible: boolean;
  contentSize: number | null;
  open: boolean;
  /** 0 = open, 1 = closed */
  onScrollProgress?: (progress: number) => void;
  /** 0 = first snap, 1 = last snap */
  onSnapProgress?: (progress: number) => void;
  onImmediateClose?: () => void;
  isAnimating?: boolean;
  onScrollingChange?: (isScrolling: boolean) => void;
}

export interface UseScrollSnapReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isScrolling: boolean;
  setSnapTargetRef: (index: number, el: HTMLDivElement | null) => void;
  trackSize: number;
  snapScrollPositions: number[];
  isInitialized: boolean;
  isClosing: boolean;
}

interface ScrollControlState {
  isProgrammatic: boolean;
  lastDetectedSnapIndex: number;
  isFromDetection: boolean;
}

interface InteractionState {
  isClosing: boolean;
  isPointerDown: boolean;
  prevScrollPos: number | null;
  /** Firefox: click stops momentum scroll, need to track if scrollend fired while pointer down */
  scrollEndedWhilePointerDown: boolean;
}

interface InitState {
  hasInitialized: boolean;
  retryTimeout: ReturnType<typeof setTimeout> | null;
  rafId: number | null;
  rafLastPos: number | null;
  rafStableCount: number;
}

export { supportsScrollTimeline, supportsScrollState };

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

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const snapTargetRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const scrollControlRef = React.useRef<ScrollControlState>({
    isProgrammatic: false,
    lastDetectedSnapIndex: activeSnapPointIndex,
    isFromDetection: false,
  });

  const checkScrollStabilityRef = React.useRef<() => void>(() => {});

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

  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const [isScrolling, setIsScrolling] = React.useState(false);
  const [isClosing, setIsClosingState] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [viewportSize, setViewportSize] = React.useState(() => {
    if (typeof window === "undefined") return 800;
    return isVertical ? window.innerHeight : window.innerWidth;
  });

  const setIsClosing = React.useCallback((value: boolean) => {
    interactionRef.current.isClosing = value;
    setIsClosingState(value);
  }, []);

  const updateIsScrolling = React.useCallback(
    (value: boolean) => {
      setIsScrolling(value);
      onScrollingChange?.(value);
    },
    [onScrollingChange],
  );

  // Fallback size until measured (prevents iOS Safari timing issues)
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

  const getScrollPositionForSnapPoint = React.useCallback(
    (index: number): number => {
      const adjustedIndex = dismissible ? index + 1 : index;
      return snapScrollPositions[adjustedIndex] ?? 0;
    },
    [snapScrollPositions, dismissible],
  );

  const findNearestSnapIndex = React.useCallback(
    (scrollPos: number): { index: number; isDismiss: boolean } => {
      let closestIndex = 0;
      let closestDistance = Math.abs(
        scrollPos - (snapScrollPositions[0] ?? 0),
      );

      for (let i = 1; i < snapScrollPositions.length; i++) {
        const distance = Math.abs(scrollPos - snapScrollPositions[i]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      if (dismissible && closestIndex === 0) {
        return { index: 0, isDismiss: true };
      }

      const snapIndex = dismissible ? closestIndex - 1 : closestIndex;
      return { index: Math.max(0, snapIndex), isDismiss: false };
    },
    [snapScrollPositions, dismissible],
  );

  const detectAndNotifySnapChange = React.useCallback(
    (scrollPos: number) => {
      if (
        scrollControlRef.current.isProgrammatic ||
        interactionRef.current.isClosing
      ) {
        return;
      }

      const { index, isDismiss } = findNearestSnapIndex(scrollPos);
      if (
        !isDismiss &&
        index !== scrollControlRef.current.lastDetectedSnapIndex
      ) {
        scrollControlRef.current.lastDetectedSnapIndex = index;
        scrollControlRef.current.isFromDetection = true;
        optionsRef.current.onSnapPointChange(index);
      }
    },
    [findNearestSnapIndex],
  );

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

  // Fallback for browsers without scrollend event
  const checkScrollStability = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { isVertical: isVert } =
      DIRECTION_CONFIG[optionsRef.current.direction];
    const currentPos = isVert ? container.scrollTop : container.scrollLeft;
    const { rafLastPos } = initRef.current;

    if (rafLastPos !== null && Math.abs(currentPos - rafLastPos) < 0.5) {
      initRef.current.rafStableCount++;
      // 3 stable frames (~50ms) = scroll ended (if not touching)
      if (
        initRef.current.rafStableCount >= 3 &&
        !interactionRef.current.isPointerDown
      ) {
        updateIsScrolling(false);
        detectAndNotifySnapChange(currentPos);

        initRef.current.rafId = null;
        initRef.current.rafLastPos = null;
        initRef.current.rafStableCount = 0;
        return;
      }
    } else {
      initRef.current.rafStableCount = 0;
    }

    initRef.current.rafLastPos = currentPos;
    initRef.current.rafId = requestAnimationFrame(
      checkScrollStabilityRef.current,
    );
  }, [updateIsScrolling, detectAndNotifySnapChange]);

  React.useLayoutEffect(() => {
    checkScrollStabilityRef.current = checkScrollStability;
  });

  const startScrollStabilityCheck = React.useCallback(() => {
    if (initRef.current.rafId === null) {
      initRef.current.rafLastPos = null;
      initRef.current.rafStableCount = 0;
      initRef.current.rafId = requestAnimationFrame(checkScrollStability);
    }
  }, [checkScrollStability]);

  const handleScroll = React.useCallback(() => {
    if (!initRef.current.hasInitialized) return;

    const container = containerRef.current;
    if (!container) return;

    const { isVertical: isVert } =
      DIRECTION_CONFIG[optionsRef.current.direction];
    const scrollPos = isVert ? container.scrollTop : container.scrollLeft;

    const progress = calculateScrollProgress(scrollPos, geometry, effectiveSize);
    optionsRef.current.onScrollProgress?.(progress);

    const snapProg = calculateSnapProgress(
      scrollPos,
      snapScrollPositions,
      optionsRef.current.dismissible,
    );
    optionsRef.current.onSnapProgress?.(snapProg);

    // 2px threshold filters scroll-snap micro-adjustments
    const positionChanged =
      interactionRef.current.prevScrollPos !== null &&
      Math.abs(scrollPos - interactionRef.current.prevScrollPos) > 2;

    interactionRef.current.prevScrollPos = scrollPos;

    if (!scrollControlRef.current.isProgrammatic && positionChanged) {
      updateIsScrolling(true);
      if (!supportsScrollEnd) {
        startScrollStabilityCheck();
      }
    }

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
    effectiveSize,
    geometry,
    snapScrollPositions,
    updateIsScrolling,
    startScrollStabilityCheck,
    triggerImmediateDismiss,
  ]);

  const handleScrollEnd = React.useCallback(() => {
    // Firefox: clicking stops momentum, fires scrollend while pointer down
    if (interactionRef.current.isPointerDown) {
      interactionRef.current.scrollEndedWhilePointerDown = true;
    } else {
      updateIsScrolling(false);
    }

    const container = containerRef.current;
    if (container) {
      const { isVertical: isVert } =
        DIRECTION_CONFIG[optionsRef.current.direction];
      const scrollPos = isVert ? container.scrollTop : container.scrollLeft;
      detectAndNotifySnapChange(scrollPos);
    }
  }, [updateIsScrolling, detectAndNotifySnapChange]);

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

  // Touch events only (not mouse) - iOS Safari has quirky pointer event behavior
  const handleTouchStart = React.useCallback(() => {
    interactionRef.current.isPointerDown = true;
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    interactionRef.current.isPointerDown = false;
    initRef.current.rafStableCount = 0;

    // Firefox: if scrollend fired while pointer down, start stability check
    if (interactionRef.current.scrollEndedWhilePointerDown) {
      interactionRef.current.scrollEndedWhilePointerDown = false;
      startScrollStabilityCheck();
    }
  }, [startScrollStabilityCheck]);

  // Initialization (DrawerContentInner unmounts on close, giving fresh state)
  React.useEffect(() => {
    if (!open) {
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

    if (contentSize === null) return;

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

        const targetIndex = dismissible
          ? activeSnapPointIndex + 1
          : activeSnapPointIndex;
        const targetScrollPos = snapScrollPositions[targetIndex] ?? 0;

        scrollControlRef.current.isProgrammatic = true;
        scrollControlRef.current.lastDetectedSnapIndex = activeSnapPointIndex;

        if (isVertical) {
          container.scrollTop = targetScrollPos;
        } else {
          container.scrollLeft = targetScrollPos;
        }

        const initialProgress = calculateScrollProgress(
          targetScrollPos,
          geometry,
          effectiveSize,
        );
        onScrollProgress?.(initialProgress);

        const initialSnapProgress = calculateSnapProgress(
          targetScrollPos,
          snapScrollPositions,
          dismissible,
        );
        onSnapProgress?.(initialSnapProgress);

        setTimeout(() => {
          scrollControlRef.current.isProgrammatic = false;
        }, 0);

        setIsInitialized(true);
      };

      initRef.current.retryTimeout = setTimeout(performInitialScroll, 0);
    }

    const currentInit = initRef.current;
    return () => {
      if (currentInit.retryTimeout) {
        clearTimeout(currentInit.retryTimeout);
        currentInit.retryTimeout = null;
      }
    };
  }, [
    open,
    contentSize,
    effectiveSize,
    isVertical,
    viewportSize,
    dismissible,
    activeSnapPointIndex,
    snapScrollPositions,
    geometry,
    onScrollProgress,
    onSnapProgress,
  ]);

  // Sync lastDetectedSnapIndex to prevent false isFromDetection after programmatic scrolls
  React.useEffect(() => {
    if (open) {
      scrollControlRef.current.lastDetectedSnapIndex = activeSnapPointIndex;
    }
  }, [open, activeSnapPointIndex]);

  // Handle controlled snap point changes
  const prevSnapPointRef = React.useRef(activeSnapPointIndex);
  React.useEffect(() => {
    if (prevSnapPointRef.current !== activeSnapPointIndex && open) {
      if (scrollControlRef.current.isFromDetection) {
        scrollControlRef.current.isFromDetection = false;
        prevSnapPointRef.current = activeSnapPointIndex;
        return;
      }

      const container = containerRef.current;
      if (container) {
        const currentScrollPos = isVertical
          ? container.scrollTop
          : container.scrollLeft;
        const targetScrollPos =
          getScrollPositionForSnapPoint(activeSnapPointIndex);

        if (Math.abs(currentScrollPos - targetScrollPos) > 10) {
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

  // Re-position when geometry changes (e.g., keyboard appears)
  const prevTrackSizeRef = React.useRef(0);
  React.useEffect(() => {
    if (!open || !initRef.current.hasInitialized) return;

    const { trackSize } = geometry;

    if (
      prevTrackSizeRef.current !== 0 &&
      prevTrackSizeRef.current !== trackSize
    ) {
      const container = containerRef.current;
      if (container && !scrollControlRef.current.isProgrammatic) {
        const targetScrollPos =
          getScrollPositionForSnapPoint(activeSnapPointIndex);
        const prevScrollBehavior = container.style.scrollBehavior;

        container.style.scrollBehavior = "auto";
        if (isVertical) {
          container.scrollTop = targetScrollPos;
        } else {
          container.scrollLeft = targetScrollPos;
        }
        container.style.scrollBehavior = prevScrollBehavior;
      }
    }

    prevTrackSizeRef.current = trackSize;
  }, [
    open,
    geometry,
    isVertical,
    activeSnapPointIndex,
    getScrollPositionForSnapPoint,
  ]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !open) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
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

  const setSnapTargetRef = React.useCallback(
    (index: number, el: HTMLDivElement | null) => {
      snapTargetRefs.current[index] = el;
    },
    [],
  );

  return {
    containerRef,
    isScrolling,
    setSnapTargetRef,
    trackSize: geometry.trackSize,
    snapScrollPositions,
    isInitialized,
    isClosing,
  };
}
