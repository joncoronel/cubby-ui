import * as React from "react";

import type { SnapPoint } from "../lib/drawer-utils";
import {
  supportsScrollEnd,
  supportsScrollTimeline,
  supportsScrollSnapChange,
  prefersReducedMotion,
  waitForScrollEnd,
  calculateHeightDrivenScrollProgress,
  resolveSnapPointRatio,
} from "../lib/drawer-utils";

export interface UseScrollSnapHeightDrivenOptions {
  snapPoints: SnapPoint[];
  activeSnapPointIndex: number;
  onSnapPointChange: (index: number) => void;
  onDismiss: () => void;
  dismissible: boolean;
  open: boolean;
  /** 0 = open, 1 = closed */
  onScrollProgress?: (progress: number) => void;
  /** 0 = first snap, 1 = last snap */
  onSnapProgress?: (progress: number) => void;
  onImmediateClose?: () => void;
  isAnimating?: boolean;
  onScrollingChange?: (isScrolling: boolean) => void;
  /** Natural content height of the sheet — used to cap fractional snap points */
  maxContentHeight?: number;
  /** Dismiss buffer in pixels — dead zone before snap points for smooth dismiss momentum */
  dismissBuffer?: number;
}

export interface UseScrollSnapHeightDrivenReturn {
  /** Ref for the scroll container (BaseDialog.Viewport) */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the sheet wrapper element */
  sheetWrapperRef: React.RefObject<HTMLDivElement | null>;
  isScrolling: boolean;
  isInitialized: boolean;
  isClosing: boolean;
  /** Current snap position identifier for data attribute */
  snapPosition: string | null;
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
  scrollEndedWhilePointerDown: boolean;
  /** Body scrollTop saved on touchstart, before any height-mode clamping */
  savedBodyScrollTop: number | null;
  /** Body offsetHeight saved on touchstart, consistent with savedBodyScrollTop */
  savedBodyHeight: number | null;
}

interface InitState {
  hasInitialized: boolean;
  retryTimeout: ReturnType<typeof setTimeout> | null;
  rafId: number | null;
  rafLastPos: number | null;
  rafStableCount: number;
}

export function useScrollSnapHeightDriven(
  options: UseScrollSnapHeightDrivenOptions,
): UseScrollSnapHeightDrivenReturn {
  const { snapPoints, activeSnapPointIndex, open, onScrollingChange } = options;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const sheetWrapperRef = React.useRef<HTMLDivElement | null>(null);

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
    savedBodyScrollTop: null,
    savedBodyHeight: null,
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
  const [snapPosition, setSnapPosition] = React.useState<string | null>(null);

  // Nested scroll optimization: when switching from height-animation to
  // transform-animation (data-scrolling), the sheet panel goes to height:100%
  // causing the body to expand and scrollTop to clamp to 0.
  // Modeled after pure-web-bottom-sheet: instead of locking body height, we
  // apply a scroll-driven translateY offset on the body that compensates for
  // the scroll position change. On scroll end, we read the computed transform
  // matrix and restore scrollTop.
  const scrollOptActiveRef = React.useRef(false);

  const setIsClosing = React.useCallback((value: boolean) => {
    interactionRef.current.isClosing = value;
    setIsClosingState(value);
  }, []);

  const updateIsScrolling = React.useCallback(
    (value: boolean) => {
      if (supportsScrollTimeline) {
        const container = containerRef.current;
        const wrapper = sheetWrapperRef.current;
        const body = wrapper?.querySelector<HTMLElement>(
          '[data-slot="drawer-body"]',
        );
        const sheetPanel = wrapper?.querySelector<HTMLElement>(
          '[data-slot="drawer-sheet-panel"]',
        );

        if (
          value &&
          !scrollOptActiveRef.current &&
          container &&
          body &&
          sheetPanel
        ) {
          // Save dimensions BEFORE layout change.
          // These are needed by the pure-web-bottom-sheet offset formula.
          const bodyHeightBefore = body.offsetHeight;
          const panelHeightBefore = sheetPanel.offsetHeight;
          // Use the scrollTop saved on touchstart (before any height-mode
          // clamping) when available. By the time the scroll event fires,
          // the CSS height animation may have already expanded the body and
          // clamped scrollTop, causing cumulative drift on each drag cycle.
          const scrollTopBefore =
            interactionRef.current.savedBodyScrollTop ?? body.scrollTop;
          const overhead = panelHeightBefore - bodyHeightBefore;
          const bodyHeightAtFull = container.offsetHeight - overhead;
          const contentFitsAtFull = body.scrollHeight <= bodyHeightAtFull;

          scrollOptActiveRef.current = true;

          // Set data-scrolling imperatively — triggers CSS layout change:
          // panel switches from height animation to transform + height:100%.
          container.setAttribute("data-scrolling", "");

          let offsetStart: number;
          let offsetEnd: number;

          if (contentFitsAtFull) {
            // Content fits at full expansion but overflows at the current snap.
            // Offset the body by the lost scrollTop. The CSS animation
            // interpolates from offsetStart → 0 over the animation range,
            // progressively reducing the compensation as the sheet expands.
            if (scrollTopBefore > 0) {
              const lastSnap =
                optionsRef.current.snapPoints[
                  optionsRef.current.snapPoints.length - 1
                ];
              const lastSnapRatio = resolveSnapPointRatio(
                lastSnap,
                container.clientHeight,
                optionsRef.current.maxContentHeight,
              );
              const activeSnap =
                optionsRef.current.snapPoints[
                  optionsRef.current.activeSnapPointIndex
                ];
              const activeSnapRatio = resolveSnapPointRatio(
                activeSnap,
                container.clientHeight,
                optionsRef.current.maxContentHeight,
              );
              const cssProgress =
                lastSnapRatio > 0 ? activeSnapRatio / lastSnapRatio : 0;

              if (cssProgress < 1) {
                offsetEnd = 0;
                offsetStart = -scrollTopBefore / (1 - cssProgress);
              } else {
                offsetStart = -scrollTopBefore;
                offsetEnd = -scrollTopBefore;
              }
            } else {
              offsetStart = 0;
              offsetEnd = 0;
            }
          } else {
            // Content overflows at full expansion — use standard
            // pure-web-bottom-sheet offset formula.
            const contentMaxOffsetHeight = container.offsetHeight - overhead;
            const scrollBottomAnchorThreshold =
              body.scrollHeight - contentMaxOffsetHeight;

            if (
              scrollBottomAnchorThreshold > 0 &&
              Math.floor(scrollTopBefore) > scrollBottomAnchorThreshold
            ) {
              // Bottom anchoring: user scrolled far enough that top content is off-screen
              // Use savedBodyHeight (from touchstart) when available so
              // that bodyHeight and scrollTopBefore are from the same
              // instant. bodyHeightBefore is from the first scroll event
              // and may have grown, making contentScrollBottom negative.
              const bodyHeightForScroll =
                interactionRef.current.savedBodyHeight ?? bodyHeightBefore;
              const contentScrollBottom =
                body.scrollHeight - bodyHeightForScroll - scrollTopBefore;
              const sheetSizeFactor =
                container.offsetHeight /
                (container.offsetHeight - panelHeightBefore);

              offsetStart =
                -(body.scrollHeight + overhead) +
                contentScrollBottom * sheetSizeFactor;
              offsetEnd = -scrollBottomAnchorThreshold;

              // After layout change, body has expanded and scrollTop is clamped.
              // Adjust offsets based on the clamped scrollTop value.
              offsetStart += body.scrollTop;
              offsetEnd += body.scrollTop;
            } else {
              // Top anchoring: content stays anchored to top, no offset needed
              offsetStart = 0;
              offsetEnd = 0;
            }
          }

          wrapper.style.setProperty("--body-offset-start", `${offsetStart}px`);
          wrapper.style.setProperty("--body-offset-end", `${offsetEnd}px`);
        } else if (!value && scrollOptActiveRef.current && container) {
          scrollOptActiveRef.current = false;

          if (body && wrapper) {
            // Read current translateY from the body's scroll-driven animation
            const style = getComputedStyle(body);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const yOffset = -matrix.m42;

            // Clean up CSS properties and attribute
            wrapper.style.removeProperty("--body-offset-start");
            wrapper.style.removeProperty("--body-offset-end");
            container.removeAttribute("data-scrolling");

            // Restore scrollTop synchronously. Reading body.scrollTop forces
            // a layout reflow after removeAttribute, but this only happens once
            // per drag cycle and prevents a one-frame flash when called from
            // rAF (e.g. the stability check) where a nested rAF would defer
            // to the next frame.
            if (yOffset > 0) {
              body.scrollTop = yOffset + body.scrollTop;
            }
          } else {
            container.removeAttribute("data-scrolling");
          }
        }
      }

      setIsScrolling(value);
      onScrollingChange?.(value);
    },
    [onScrollingChange],
  );

  // --- Snap position detection ---

  const updateSnapPosition = React.useCallback(
    (position: string) => {
      setSnapPosition(position);

      // "dismiss" = swiped past all snap points toward close
      if (
        position === "dismiss" &&
        optionsRef.current.dismissible &&
        !interactionRef.current.isClosing
      ) {
        // Dismiss via swipe
        interactionRef.current.isClosing = true;
        setIsClosing(true);
        scrollControlRef.current.isProgrammatic = true;

        const container = containerRef.current;
        if (container) {
          container.style.overflow = "hidden";
          container.style.pointerEvents = "none";
          container.style.touchAction = "none";
        }

        optionsRef.current.onImmediateClose?.();
        optionsRef.current.onDismiss();
        return;
      }

      // Map snap position to snap point index
      const posNum = parseInt(position, 10);
      if (isNaN(posNum) || posNum < 0) return;

      // Position 0 = last snap point (fully expanded)
      // Position 1 = first snap point (or intermediate)
      // We need to map these to snap point indices
      const snapPointIndex =
        posNum === 0
          ? snapPoints.length - 1
          : Math.max(0, snapPoints.length - 1 - posNum);

      if (
        snapPointIndex !== scrollControlRef.current.lastDetectedSnapIndex &&
        !scrollControlRef.current.isProgrammatic
      ) {
        scrollControlRef.current.lastDetectedSnapIndex = snapPointIndex;
        scrollControlRef.current.isFromDetection = true;
        optionsRef.current.onSnapPointChange(snapPointIndex);
      }
    },
    [snapPoints, setIsClosing],
  );

  // IntersectionObserver for snap detection (fallback for browsers without scrollsnapchange)
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  const setupIntersectionObserver = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let lowestIntersectingSnap = Infinity;
        let highestNonIntersectingSnap = -Infinity;
        let hasIntersectingElement = false;

        for (const entry of entries) {
          if (
            !(entry.target instanceof HTMLElement) ||
            entry.target.dataset.snap == null
          ) {
            continue;
          }

          const snap = parseInt(entry.target.dataset.snap, 10);

          if (entry.isIntersecting) {
            hasIntersectingElement = true;
            lowestIntersectingSnap = Math.min(lowestIntersectingSnap, snap);
          } else {
            highestNonIntersectingSnap = Math.max(
              highestNonIntersectingSnap,
              snap,
            );
          }
        }

        // When no sentinel is intersecting, user has scrolled past all snap points → dismiss.
        // Use "dismiss" string instead of a numeric position to avoid collision
        // with valid snap element data-snap values.
        const newSnapPosition = hasIntersectingElement
          ? lowestIntersectingSnap.toString()
          : "dismiss";

        updateSnapPosition(newSnapPosition);
      },
      {
        root: container,
        threshold: 0,
        rootMargin: "1000% 0px -100% 0px",
      },
    );

    // Observe sentinel elements
    const sentinels = container.querySelectorAll(
      '[data-slot="drawer-sentinel"]',
    );
    sentinels.forEach((sentinel) => {
      observerRef.current?.observe(sentinel);
    });
  }, [updateSnapPosition]);

  // --- JS fallback for --sheet-position ---
  const handleScrollFallback = React.useCallback(() => {
    const container = containerRef.current;
    const wrapper = sheetWrapperRef.current;
    if (!container || !wrapper) return;

    if (!supportsScrollTimeline) {
      const db = optionsRef.current.dismissBuffer ?? 0;
      const adjustedScroll = Math.max(0, container.scrollTop - db);
      wrapper.style.setProperty("--sheet-position", `${adjustedScroll}px`);
    }
  }, []);

  // --- Scroll progress reporting ---
  const reportProgress = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const db = optionsRef.current.dismissBuffer ?? 0;

    const progress = calculateHeightDrivenScrollProgress(
      container.scrollTop,
      container.scrollHeight,
      container.clientHeight,
      db,
    );
    optionsRef.current.onScrollProgress?.(progress);

    // Calculate snap progress (0 = first snap, 1 = last snap)
    const maxScroll = container.scrollHeight - container.clientHeight;
    const sheetScroll = maxScroll - db;
    if (sheetScroll > 0 && snapPoints.length > 1) {
      // Map scroll position between first and last snap positions
      const first = snapPoints[0];
      const last = snapPoints[snapPoints.length - 1];
      const mch = optionsRef.current.maxContentHeight;
      const firstSnapRatio = resolveSnapPointRatio(
        first,
        container.clientHeight,
        mch,
      );
      const lastSnapRatio = resolveSnapPointRatio(
        last,
        container.clientHeight,
        mch,
      );

      const firstSnapScroll = db + firstSnapRatio * sheetScroll;
      const lastSnapScroll = db + lastSnapRatio * sheetScroll;
      const range = lastSnapScroll - firstSnapScroll;

      const snapProgress =
        range > 0 ? (container.scrollTop - firstSnapScroll) / range : 0;
      optionsRef.current.onSnapProgress?.(
        Math.min(1, Math.max(0, snapProgress)),
      );
    }
  }, [snapPoints]);

  // --- Dismiss logic ---
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

  // --- Scroll stability check (fallback for browsers without scrollend) ---
  const checkScrollStability = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const currentPos = container.scrollTop;
    const { rafLastPos } = initRef.current;

    if (rafLastPos !== null && Math.abs(currentPos - rafLastPos) < 0.5) {
      initRef.current.rafStableCount++;
      if (
        initRef.current.rafStableCount >= 3 &&
        !interactionRef.current.isPointerDown
      ) {
        updateIsScrolling(false);
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
  }, [updateIsScrolling]);

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

  // --- Main scroll handler ---
  const handleScroll = React.useCallback(() => {
    if (!initRef.current.hasInitialized) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollPos = container.scrollTop;

    // Report progress
    reportProgress();

    // JS fallback for sheet position
    handleScrollFallback();

    const prevPos = interactionRef.current.prevScrollPos;
    // 2px threshold filters scroll-snap micro-adjustments
    const positionChanged =
      prevPos !== null && Math.abs(scrollPos - prevPos) > 2;
    // When pointer is down, enter transform mode on the first scroll
    // change to minimize height-mode scrollTop clamping. The CSS
    // scroll-driven height animation runs synchronously with scroll,
    // so even 1-2px of height-mode scroll can clamp body.scrollTop.
    const positionChangedAny =
      prevPos !== null && Math.abs(scrollPos - prevPos) > 0;

    interactionRef.current.prevScrollPos = scrollPos;

    if (!scrollControlRef.current.isProgrammatic) {
      const shouldActivate =
        positionChanged ||
        (interactionRef.current.isPointerDown && positionChangedAny);
      if (shouldActivate) {
        updateIsScrolling(true);
      }
      if (!supportsScrollEnd && positionChanged) {
        startScrollStabilityCheck();
      }
    }

    // Check for dismiss
    if (!scrollControlRef.current.isProgrammatic) {
      const db = optionsRef.current.dismissBuffer ?? 0;
      const progress = calculateHeightDrivenScrollProgress(
        container.scrollTop,
        container.scrollHeight,
        container.clientHeight,
        db,
      );
      if (
        optionsRef.current.dismissible &&
        !interactionRef.current.isClosing &&
        progress >= 1
      ) {
        triggerImmediateDismiss();
      }
    }
  }, [
    reportProgress,
    handleScrollFallback,
    updateIsScrolling,
    startScrollStabilityCheck,
    triggerImmediateDismiss,
  ]);

  const handleScrollEnd = React.useCallback(() => {
    if (interactionRef.current.isPointerDown) {
      interactionRef.current.scrollEndedWhilePointerDown = true;
    } else {
      updateIsScrolling(false);
    }
  }, [updateIsScrolling]);

  const handleScrollSnapChange = React.useCallback(
    (event: Event) => {
      if (interactionRef.current.isClosing) return;

      const snapEvent = event as Event & {
        snapTargetBlock?: Element | null;
      };

      if (
        !snapEvent.snapTargetBlock ||
        !(snapEvent.snapTargetBlock instanceof HTMLElement)
      ) {
        return;
      }

      const target = snapEvent.snapTargetBlock;

      // Detect dismiss by checking element identity (data-slot), not data-snap value.
      // data-snap values on snap elements can collide with the dismiss element's value
      // when there are 3+ snap points (e.g., snap element for 0.5 gets data-snap="2",
      // same as the dismiss element).
      if (target.dataset.slot === "drawer-dismiss-snap") {
        updateSnapPosition("dismiss");
        return;
      }

      const newSnapPosition = target.dataset.snap ?? "1";
      updateSnapPosition(newSnapPosition);
    },
    [updateSnapPosition],
  );

  // Touch events
  const handleTouchStart = React.useCallback(() => {
    interactionRef.current.isPointerDown = true;
    // Capture body scrollTop before any scrolling occurs. The CSS
    // scroll-driven height animation runs synchronously with scroll,
    // so by the time the first scroll event fires, body.scrollTop may
    // already be clamped. Saving here gives us the true pre-drag value.
    const wrapper = sheetWrapperRef.current;
    const body = wrapper?.querySelector<HTMLElement>(
      '[data-slot="drawer-body"]',
    );
    if (body) {
      interactionRef.current.savedBodyScrollTop = body.scrollTop;
      interactionRef.current.savedBodyHeight = body.offsetHeight;
    }
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    interactionRef.current.isPointerDown = false;
    initRef.current.rafStableCount = 0;

    if (interactionRef.current.scrollEndedWhilePointerDown) {
      interactionRef.current.scrollEndedWhilePointerDown = false;
      startScrollStabilityCheck();
    }
  }, [startScrollStabilityCheck]);

  // Stable handler refs
  const handleScrollRef = React.useRef(handleScroll);
  const handleScrollEndRef = React.useRef(handleScrollEnd);
  const handleScrollSnapChangeRef = React.useRef(handleScrollSnapChange);
  const handleTouchStartRef = React.useRef(handleTouchStart);
  const handleTouchEndRef = React.useRef(handleTouchEnd);
  React.useLayoutEffect(() => {
    handleScrollRef.current = handleScroll;
    handleScrollEndRef.current = handleScrollEnd;
    handleScrollSnapChangeRef.current = handleScrollSnapChange;
    handleTouchStartRef.current = handleTouchStart;
    handleTouchEndRef.current = handleTouchEnd;
  });

  // --- Reset state when drawer closes ---
  React.useEffect(() => {
    if (!open) {
      initRef.current.hasInitialized = false;
      if (initRef.current.rafId !== null) {
        cancelAnimationFrame(initRef.current.rafId);
        initRef.current.rafId = null;
      }
      if (initRef.current.retryTimeout) {
        clearTimeout(initRef.current.retryTimeout);
        initRef.current.retryTimeout = null;
      }
      initRef.current.rafLastPos = null;
      initRef.current.rafStableCount = 0;

      interactionRef.current.isClosing = false;
      interactionRef.current.isPointerDown = false;
      interactionRef.current.prevScrollPos = null;
      interactionRef.current.scrollEndedWhilePointerDown = false;
      interactionRef.current.savedBodyScrollTop = null;
      interactionRef.current.savedBodyHeight = null;

      scrollControlRef.current.isProgrammatic = false;
      scrollControlRef.current.isFromDetection = false;

      scrollOptActiveRef.current = false;

      setIsInitialized(false);
      setIsClosingState(false);
      setSnapPosition(null);
      updateIsScrolling(false);

      observerRef.current?.disconnect();

      // Reset container styles
      const container = containerRef.current;
      if (container) {
        container.style.removeProperty("overflow");
        container.style.removeProperty("pointer-events");
        container.style.removeProperty("touch-action");
      }
    }
  }, [open, updateIsScrolling]);

  // --- Initialization ---
  // useLayoutEffect ensures scrollTop is set BEFORE the browser paints.
  // Without this, the browser would paint with scrollTop=0 and scroll-snap-type: y mandatory,
  // causing the scroll-snap engine to snap to the dismiss position on mobile.
  React.useLayoutEffect(() => {
    if (!open) {
      return;
    }

    if (!initRef.current.hasInitialized) {
      const performInitialScroll = () => {
        const container = containerRef.current;
        if (!container) {
          // Fallback: retry if container ref not yet available
          initRef.current.retryTimeout = setTimeout(performInitialScroll, 0);
          return;
        }

        if (container.clientHeight === 0) {
          // Fallback: retry if container not yet laid out
          initRef.current.retryTimeout = setTimeout(performInitialScroll, 0);
          return;
        }

        initRef.current.hasInitialized = true;
        scrollControlRef.current.lastDetectedSnapIndex = activeSnapPointIndex;
        scrollControlRef.current.isProgrammatic = true;

        // For height-driven mode, we need to scroll to the initial snap position.
        // The snap elements position themselves via CSS --snap, so we scroll
        // to trigger the scroll-snap to the initial element.
        // The initial snap element has data-initial which keeps scroll-snap-align
        // during the initial-snap CSS animation.

        // Calculate target scroll based on snap point ratio
        const snapPoint = snapPoints[activeSnapPointIndex];
        const mch = optionsRef.current.maxContentHeight;
        const ratio = resolveSnapPointRatio(
          snapPoint,
          container.clientHeight,
          mch,
        );

        // In height-driven mode, scroll position maps to sheet height.
        // The dismiss buffer creates a dead zone at the start of the scroll range.
        const maxScroll = container.scrollHeight - container.clientHeight;
        const db = optionsRef.current.dismissBuffer ?? 0;
        const sheetScroll = maxScroll - db;
        const targetScroll = db + ratio * sheetScroll;

        container.scrollTop = targetScroll;

        // Report initial progress
        const progress = calculateHeightDrivenScrollProgress(
          targetScroll,
          container.scrollHeight,
          container.clientHeight,
          db,
        );
        optionsRef.current.onScrollProgress?.(progress);

        if (snapPoints.length > 1 && sheetScroll > 0) {
          const firstSp = snapPoints[0];
          const lastSp = snapPoints[snapPoints.length - 1];
          const firstRatio = resolveSnapPointRatio(
            firstSp,
            container.clientHeight,
            mch,
          );
          const lastRatio = resolveSnapPointRatio(
            lastSp,
            container.clientHeight,
            mch,
          );
          const firstSnapScroll = db + firstRatio * sheetScroll;
          const lastSnapScroll = db + lastRatio * sheetScroll;
          const range = lastSnapScroll - firstSnapScroll;
          const snapProg =
            range > 0 ? (targetScroll - firstSnapScroll) / range : 0;
          optionsRef.current.onSnapProgress?.(
            Math.min(1, Math.max(0, snapProg)),
          );
        }

        setTimeout(() => {
          scrollControlRef.current.isProgrammatic = false;
        }, 0);

        setIsInitialized(true);

        // Set up IntersectionObserver for snap detection if scrollsnapchange not supported
        if (!supportsScrollSnapChange) {
          setupIntersectionObserver();
        }
      };

      // Call directly (before paint) — setTimeout is only a fallback
      // if container ref or layout isn't ready yet.
      performInitialScroll();
    }

    const currentInit = initRef.current;
    return () => {
      if (currentInit.retryTimeout) {
        clearTimeout(currentInit.retryTimeout);
        currentInit.retryTimeout = null;
      }
    };
  }, [open, activeSnapPointIndex, snapPoints, setupIntersectionObserver]);

  // Sync lastDetectedSnapIndex
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
        const snapPoint = snapPoints[activeSnapPointIndex];
        const ratio = resolveSnapPointRatio(
          snapPoint,
          container.clientHeight,
          optionsRef.current.maxContentHeight,
        );

        const maxScroll = container.scrollHeight - container.clientHeight;
        const db = optionsRef.current.dismissBuffer ?? 0;
        const sheetScroll = maxScroll - db;
        const targetScroll = db + ratio * sheetScroll;

        if (Math.abs(container.scrollTop - targetScroll) > 10) {
          scrollControlRef.current.isProgrammatic = true;
          const behavior = prefersReducedMotion() ? "auto" : "smooth";
          container.scrollTo({ top: targetScroll, behavior });

          if (behavior === "auto") {
            scrollControlRef.current.isProgrammatic = false;
          } else {
            waitForScrollEnd(container).then(() => {
              scrollControlRef.current.isProgrammatic = false;
            });
          }
        }
      }
    }
    prevSnapPointRef.current = activeSnapPointIndex;
  }, [activeSnapPointIndex, open, snapPoints]);

  // --- Event listener registration ---
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !open) return;

    const onScroll = () => handleScrollRef.current();
    const onScrollEnd = () => handleScrollEndRef.current();
    const onScrollSnapChange = (e: Event) =>
      handleScrollSnapChangeRef.current(e);
    const onTouchStart = () => handleTouchStartRef.current();
    const onTouchEnd = () => handleTouchEndRef.current();

    container.addEventListener("scroll", onScroll, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

    if (supportsScrollEnd) {
      container.addEventListener("scrollend", onScrollEnd);
    }

    if (supportsScrollSnapChange) {
      container.addEventListener("scrollsnapchange", onScrollSnapChange);
    }

    return () => {
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);

      if (supportsScrollEnd) {
        container.removeEventListener("scrollend", onScrollEnd);
      }

      if (supportsScrollSnapChange) {
        container.removeEventListener("scrollsnapchange", onScrollSnapChange);
      }

      observerRef.current?.disconnect();
    };
  }, [open]);

  return {
    containerRef,
    sheetWrapperRef,
    isScrolling,
    isInitialized,
    isClosing,
    snapPosition,
  };
}
