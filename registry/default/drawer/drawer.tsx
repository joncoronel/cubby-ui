"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

// Drawer-specific CSS animations (scroll-driven animations for progressive enhancement)
import "./drawer.css";

import type { SnapPoint, DrawerDirection } from "./hooks/use-snap-points";
import {
  useScrollSnap,
  supportsScrollTimeline,
  supportsScrollState,
} from "./hooks/use-scroll-snap";
import { useVirtualKeyboard } from "./hooks/use-virtual-keyboard";
import { useBodyScrollLock } from "./hooks/use-body-scroll-lock";

// Re-export types for consumers
export type { SnapPoint, DrawerDirection };

/**
 * Parse a pixel value string (e.g., "200px") and return the number
 */
function parsePixelValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Find the index of a snap point value in the array
 * Returns the last index if value is null or not found
 */
function findSnapPointIndex(
  snapPoints: SnapPoint[],
  value: SnapPoint | null,
): number {
  if (value === null) return snapPoints.length - 1;
  const index = snapPoints.findIndex((sp) => sp === value);
  return index === -1 ? snapPoints.length - 1 : index;
}

/**
 * Get the snap point value at a given index (clamped to valid range)
 */
function getSnapPointValue(snapPoints: SnapPoint[], index: number): SnapPoint {
  return snapPoints[Math.max(0, Math.min(index, snapPoints.length - 1))];
}

/* -------------------------------------------------------------------------------------------------
 * Drawer Context
 * -------------------------------------------------------------------------------------------------*/

interface DrawerContextValue {
  direction: DrawerDirection;
  snapPoints: SnapPoint[];
  activeSnapPoint: SnapPoint;
  setActiveSnapPoint: (snapPoint: SnapPoint) => void;
  dismissible: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragProgress: number;
  setDragProgress: (progress: number) => void;
  /** Progress between snap points (0 = first snap, 1 = last snap) */
  snapProgress: number;
  setSnapProgress: (progress: number) => void;
  open: boolean;
  onOpenChange: (open: boolean, eventDetails?: { reason?: string }) => void;

  contentSize: number | null;
  setContentSize: (size: number | null) => void;
  isVertical: boolean;
  isAnimating: boolean;
  immediateClose: boolean;
  setImmediateClose: (value: boolean) => void;
  sequentialSnap: boolean;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * Drawer (Root)
 * -------------------------------------------------------------------------------------------------*/

/** Props passed to render function children */
interface DrawerRenderProps {
  /** Progress between snap points (0 = first snap, 1 = last snap) */
  snapProgress: number;
  /** Progress toward closed (0 = open, 1 = closed) */
  dragProgress: number;
  /** Whether currently being dragged/scrolled */
  isDragging: boolean;
  /** Current active snap point value */
  activeSnapPoint: SnapPoint;
}

interface DrawerProps extends Omit<
  React.ComponentProps<typeof BaseDialog.Root>,
  "modal" | "children"
> {
  /** Direction the drawer opens from. Default: "bottom" */
  direction?: DrawerDirection;
  /** Snap points as percentages (0-1) or pixel values. Default: [1] (fully open) */
  snapPoints?: SnapPoint[];
  /** Initial snap point value when opened. Default: first snap point */
  defaultSnapPoint?: SnapPoint;
  /** Controlled snap point value (the actual value, not index) */
  activeSnapPoint?: SnapPoint | null;
  /** Callback when snap point changes - receives the actual value */
  onActiveSnapPointChange?: (snapPoint: SnapPoint) => void;
  /** Whether dismissible by swipe. Default: true */
  dismissible?: boolean;

  /** When true, prevents skipping snap points during fast swipes. Default: false */
  sequentialSnap?: boolean;
  /** Children - can be ReactNode or render function for access to drag state */
  children?: React.ReactNode | ((props: DrawerRenderProps) => React.ReactNode);
}

function Drawer({
  direction = "bottom",
  snapPoints = [1],
  defaultSnapPoint,
  activeSnapPoint: controlledSnapPoint,
  onActiveSnapPointChange,
  dismissible = true,
  sequentialSnap = false,
  open: controlledOpen,
  defaultOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  ...props
}: DrawerProps) {
  // Internal open state (uncontrolled mode)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const isOpenControlled = controlledOpen !== undefined;
  const open = isOpenControlled ? controlledOpen : uncontrolledOpen;

  // Convert default value to index (defaults to first snap point)
  const defaultSnapPointIndex =
    defaultSnapPoint !== undefined
      ? findSnapPointIndex(snapPoints, defaultSnapPoint)
      : 0;

  // Internal snap point state (uses index internally)
  const [internalSnapPointIndex, setInternalSnapPointIndex] = React.useState(
    defaultSnapPointIndex,
  );

  // Controlled mode: convert value to index
  const isSnapPointControlled = controlledSnapPoint !== undefined;
  const activeSnapPointIndex = isSnapPointControlled
    ? findSnapPointIndex(snapPoints, controlledSnapPoint)
    : internalSnapPointIndex;

  // The actual value for context
  const activeSnapPointValue = getSnapPointValue(
    snapPoints,
    activeSnapPointIndex,
  );

  // Drag state (now represents scroll state)
  const [isDragging, setIsDragging] = React.useState(false);
  // Start at 1 (backdrop invisible) - will be updated by scroll events
  const [dragProgress, setDragProgress] = React.useState(1);
  // Progress between snap points (0 = first snap, 1 = last snap)
  const [snapProgress, setSnapProgress] = React.useState(0);

  // Content size for measurements (set by DrawerContent)
  const [contentSize, setContentSize] = React.useState<number | null>(null);

  // Track CSS animation state to prevent interaction during transitions
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Track immediate close for swipe dismiss (skip exit animation)
  const [immediateClose, setImmediateClose] = React.useState(false);

  const isVertical = direction === "top" || direction === "bottom";

  // Clear animating when CSS animation completes
  const handleOpenChangeComplete = React.useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Lock body scroll when drawer is open or animating (prevents URL bar collapse/expand on mobile)
  // Keep locked during exit animation so page can't be scrolled until animation completes
  // useBodyScrollLock(open || isAnimating);

  // Handle open change
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails?: { reason?: string }) => {
      // Prevent state changes during animations (user can't interrupt enter/exit)
      if (isAnimating) return;
      // Prevent closing while actively scrolling/dragging (swipe momentum)
      // BUT allow swipe dismiss (which passes reason: "swipe-dismiss")
      if (!nextOpen && isDragging && eventDetails?.reason !== "swipe-dismiss")
        return;

      // Start animation state - will be cleared by onOpenChangeComplete
      setIsAnimating(true);

      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }
      controlledOnOpenChange?.(nextOpen, eventDetails as never);

      // Reset to default snap point when opening (only in uncontrolled mode)
      if (nextOpen && !isSnapPointControlled) {
        setInternalSnapPointIndex(defaultSnapPointIndex);
        const defaultSnapValue = getSnapPointValue(
          snapPoints,
          defaultSnapPointIndex,
        );
        onActiveSnapPointChange?.(defaultSnapValue);
      }

      // Reset drag progress when opening (backdrop starts invisible, fades in with drawer)
      if (nextOpen) {
        setDragProgress(1); // 1 = closed/invisible, will animate to 0 = open/visible
        // Only reset snapProgress in uncontrolled mode
        // Controlled mode: scroll handler will set correct value when drawer positions itself
        if (!isSnapPointControlled) {
          // Calculate snapProgress based on default snap point
          const progress =
            snapPoints.length > 1
              ? defaultSnapPointIndex / (snapPoints.length - 1)
              : 0;
          setSnapProgress(progress);
        }
        setImmediateClose(false); // Reset immediate close flag
      }
    },
    [
      isAnimating,
      isDragging,
      isOpenControlled,
      controlledOnOpenChange,
      snapPoints,
      isSnapPointControlled,
      onActiveSnapPointChange,
      defaultSnapPointIndex,
    ],
  );

  // Handle snap point change (accepts value, converts to index internally)
  const setActiveSnapPoint = React.useCallback(
    (value: SnapPoint) => {
      const index = findSnapPointIndex(snapPoints, value);
      if (!isSnapPointControlled) {
        setInternalSnapPointIndex(index);
      }
      onActiveSnapPointChange?.(value);
    },
    [snapPoints, isSnapPointControlled, onActiveSnapPointChange],
  );

  const contextValue = React.useMemo(
    () => ({
      direction,
      snapPoints,
      activeSnapPoint: activeSnapPointValue,
      setActiveSnapPoint,
      dismissible,
      isDragging,
      setIsDragging,
      dragProgress,
      setDragProgress,
      snapProgress,
      setSnapProgress,
      open,
      onOpenChange: handleOpenChange,
      contentSize,
      setContentSize,
      isVertical,
      isAnimating,
      immediateClose,
      setImmediateClose,
      sequentialSnap,
    }),
    [
      direction,
      snapPoints,
      activeSnapPointValue,
      setActiveSnapPoint,
      dismissible,
      isDragging,
      dragProgress,
      snapProgress,
      open,
      handleOpenChange,
      contentSize,
      isVertical,
      isAnimating,
      immediateClose,
      sequentialSnap,
    ],
  );

  // Resolve render function children
  const resolvedChildren =
    typeof children === "function"
      ? children({
          snapProgress,
          dragProgress,
          isDragging,
          activeSnapPoint: activeSnapPointValue,
        })
      : children;

  return (
    <DrawerContext.Provider value={contextValue}>
      <BaseDialog.Root
        data-slot="drawer"
        open={open}
        onOpenChange={handleOpenChange}
        onOpenChangeComplete={handleOpenChangeComplete}
        // Use "trap-focus" to keep focus trapping but let us handle scroll lock
        // (modal={true} has its own scroll lock that conflicts with ours)
        // modal="trap-focus"
        // modal={true}
        {...props}
      >
        {resolvedChildren}
      </BaseDialog.Root>
    </DrawerContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerTrigger
 * -------------------------------------------------------------------------------------------------*/

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof BaseDialog.Trigger>) {
  return <BaseDialog.Trigger data-slot="drawer-trigger" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * DrawerClose
 * -------------------------------------------------------------------------------------------------*/

interface DrawerCloseProps extends useRender.ComponentProps<"button"> {
  onClick?: (event: React.MouseEvent) => void;
}

function DrawerClose({
  onClick,
  className,
  render,
  ...props
}: DrawerCloseProps) {
  const { onOpenChange, isAnimating } = useDrawer();

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      // Prevent closing during animations
      if (isAnimating) return;

      // Let Base UI handle the exit animation via data-ending-style
      onOpenChange(false);
    },
    [onClick, onOpenChange, isAnimating],
  );

  // Don't use BaseDialog.Close - it has its own close handler that bypasses our animation
  const mergedProps = mergeProps<"button">(
    {
      type: "button",
      className,
      onClick: handleClick,
    } as React.ComponentProps<"button">,
    props,
  );

  const element = useRender({
    render,
    defaultTagName: "button",
    props: { ...mergedProps, "data-slot": "drawer-close" },
  });

  return element;
}

/* -------------------------------------------------------------------------------------------------
 * DrawerPortal
 * -------------------------------------------------------------------------------------------------*/

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot="drawer-portal" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * DrawerContent
 * -------------------------------------------------------------------------------------------------*/

function DrawerContent({
  className,
  children,
  ...props
}: BaseDialog.Popup.Props) {
  const {
    direction,
    snapPoints,
    activeSnapPoint,
    setActiveSnapPoint,
    dismissible,
    contentSize,
    setContentSize,
    isVertical,
    setIsDragging,
    dragProgress,
    setDragProgress,
    setSnapProgress,
    onOpenChange,
    open,
    isAnimating,
    immediateClose,
    setImmediateClose,
    isDragging,
    sequentialSnap,
  } = useDrawer();

  // Derive index locally - single conversion point for hooks
  const activeSnapPointIndex = findSnapPointIndex(snapPoints, activeSnapPoint);

  // Handler converts index back to value for context
  const handleSnapPointChange = React.useCallback(
    (index: number) => {
      setActiveSnapPoint(getSnapPointValue(snapPoints, index));
    },
    [snapPoints, setActiveSnapPoint],
  );

  // Virtual keyboard handling (for bottom drawers with form inputs)
  const { keyboardHeight } = useVirtualKeyboard({
    enabled: direction === "bottom",
  });

  // Memoize dismiss handler to prevent effect re-runs
  const handleDismiss = React.useCallback(() => {
    onOpenChange(false, { reason: "swipe-dismiss" });
  }, [onOpenChange]);

  // Handler for immediate close (swipe dismiss - skip exit animation)
  const handleImmediateClose = React.useCallback(() => {
    setImmediateClose(true);
  }, [setImmediateClose]);

  // Wrap scroll progress callback to skip updates during enter/exit animations
  // This lets CSS transitions control the backdrop opacity during animations
  const handleScrollProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setDragProgress(progress);
      }
    },
    [isAnimating, setDragProgress],
  );

  // Wrap snap progress callback to skip updates during enter/exit animations
  const handleSnapProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setSnapProgress(progress);
      }
    },
    [isAnimating, setSnapProgress],
  );

  // Scroll snap hook - containerRef now attaches to Viewport
  const {
    containerRef,
    isScrolling,
    snapTargetRefs,
    trackSize,
    snapScrollPositions,
    isInitialized,
    isClosing,
    firstSnapScrollPos,
    lastSnapScrollPos,
  } = useScrollSnap({
    direction,
    snapPoints,
    activeSnapPointIndex,
    onSnapPointChange: handleSnapPointChange,
    onDismiss: handleDismiss,
    dismissible,
    contentSize,
    open,
    onScrollProgress: handleScrollProgress,
    onSnapProgress: handleSnapProgress,
    onImmediateClose: handleImmediateClose,
    isAnimating,
  });

  // Sync scrolling state to context
  React.useEffect(() => {
    setIsDragging(isScrolling);
  }, [isScrolling, setIsDragging]);

  // Calculate snap point ratio (0-1) for backdrop opacity
  // This represents how "open" the drawer is at the target snap point
  const snapPointRatio = React.useMemo(() => {
    if (typeof activeSnapPoint === "number") {
      return activeSnapPoint;
    }
    // Pixel value - need contentSize to calculate ratio
    const pixels = parsePixelValue(activeSnapPoint);
    if (!pixels || !contentSize) return 1;
    return pixels / contentSize;
  }, [activeSnapPoint, contentSize]);

  // Starting offset for enter/exit animations (drawer slides in by this amount)
  // For pixel snap points, use the value directly (e.g., "92px")
  // For percentage snap points, convert to percentage (e.g., 0.1 -> "10%")
  const startingOffset =
    typeof activeSnapPoint === "number"
      ? `${activeSnapPoint * 100}%`
      : activeSnapPoint;

  // Target backdrop opacity based on snap point (0.25 snap = 0.25 opacity)
  const targetBackdropOpacity = snapPointRatio;

  // Measure the drawer content size (now measures the Popup element)
  const observerRef = React.useRef<ResizeObserver | null>(null);

  const measureRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup previous observer
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) return;

      const measure = () => {
        setContentSize(isVertical ? node.offsetHeight : node.offsetWidth);
      };

      measure();
      observerRef.current = new ResizeObserver(measure);
      observerRef.current.observe(node);
    },
    [isVertical, setContentSize],
  );

  // Cleanup on unmount
  React.useEffect(() => () => observerRef.current?.disconnect(), []);

  // Determine if scroll-driven animations should be active
  // Requires: browser support + initialized + not during enter/exit animation
  const useScrollDrivenAnimation =
    supportsScrollTimeline && isInitialized && !isAnimating && !immediateClose;

  return (
    <DrawerPortal>
      {/* Timeline scope wrapper - enables cross-element timeline references */}
      {/* Required for backdrop to reference drawer panel's view timeline */}
      <div
        style={
          supportsScrollTimeline
            ? ({ timelineScope: "--drawer-panel" } as React.CSSProperties)
            : undefined
        }
      >
        {/* Backdrop - view-driven opacity (Chrome 115+) with JS fallback */}
        <BaseDialog.Backdrop
          data-slot="drawer-overlay"
          className={cn(
            "absolute inset-0 z-40 bg-black/35",
            // Force GPU layer to prevent repaint flicker
            "[transform:translateZ(0)] will-change-[opacity]",
            // Disable pointer events during closing to avoid interfering with swipe dismiss
            isClosing ? "pointer-events-none" : "pointer-events-auto",
            // Prevent touch-drag on backdrop from scrolling the page underneath
            "touch-none",
            // Transition for smooth enter/exit (skip on immediate close or while dragging)
            immediateClose || (isDragging && !isAnimating)
              ? "transition-none"
              : "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-opacity duration-450",
            // Enter: start at opacity 0, transition animates to target
            "[&[data-starting-style]]:opacity-0!",
            // Exit: use animation to override scroll-driven animation (transition can't interpolate from animation-held values)
            "[&[data-ending-style]]:[animation:drawer-backdrop-exit_450ms_cubic-bezier(0,0,0.58,1)_forwards]",

            isInitialized && !isAnimating && dragProgress < 1
              ? useScrollDrivenAnimation
                ? // Scroll-driven backdrop animation (Chrome 115+)
                  // Bottom/Right: drawer enters from below/right → use entry range (0→1 opacity)
                  // Top/Left: drawer exits toward top/left → use exit range with reversed keyframe (1→0 opacity)
                  direction === "top" || direction === "left"
                  ? "[animation-fill-mode:both] [animation-name:drawer-backdrop-fade-reverse] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]"
                  : "[animation-fill-mode:both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]"
                : `opacity-(--drawer-backdrop-dynamic-opacity)`
              : `opacity-(--drawer-backdrop-static-opacity)`,
          )}
          style={
            {
              "--drawer-backdrop-dynamic-opacity": 1 - dragProgress,
              "--drawer-backdrop-static-opacity": targetBackdropOpacity,
            } as React.CSSProperties
          }
        />

        {/* Viewport - scroll container for scroll-snap gestures */}
        <BaseDialog.Viewport
          ref={containerRef}
          data-slot="drawer-viewport"
          data-direction={direction}
          data-scrolling={isScrolling || undefined}
          className={cn(
            // Group for propagating data-starting-style/data-ending-style to children
            "group/drawer",
            // Fixed positioning for the scroll container
            "fixed z-50 outline-hidden",
            // Extra 60px height prevents URL bar from responding to touch gestures
            // Offset position so extra space is outside viewport (prevents content cutoff)
            "left-0 w-dvw",
            direction === "bottom" && "-top-[60px]",
            direction === "top" && "top-0",
            direction === "left" && "top-0",
            direction === "right" && "top-0",
            // Disable all interaction when animating or closing
            isAnimating || isClosing
              ? "pointer-events-none"
              : "pointer-events-auto",
            // Prevent Base UI's default animation and ensure transparent background
            "bg-transparent opacity-100! [&[data-ending-style]]:opacity-100! [&[data-starting-style]]:opacity-100!",
            // Transform transition for exit animation - Base UI detects this and waits before removing
            // Skip transition on immediate close (swipe dismiss)
            immediateClose
              ? "transition-none"
              : "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-transform duration-450",

            // Hide scrollbar
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            // Scroll snap configuration - disable scrolling when animating or closing
            isAnimating || isClosing
              ? "overflow-hidden"
              : isVertical
                ? "overflow-y-scroll"
                : "overflow-x-scroll",
            isAnimating || isClosing
              ? "overflow-hidden"
              : isVertical
                ? "overflow-x-hidden"
                : "overflow-y-hidden",
            // Prevent scroll chaining to parent (none is more aggressive than contain)
            "overscroll-none",
            // Constrain touch gestures to drawer scroll direction only (prevents URL bar collapse/expand)
            isVertical ? "touch-pan-y" : "touch-pan-x",
            // Reduced motion: instant behavior
            "motion-reduce:[scroll-behavior:auto]",
            // Progressive enhancement for viewport height via Tailwind arbitrary variants:
            // 1. Default: vh fallback for old browsers (Firefox old, IE)
            isVertical ? "h-[calc(100vh+60px)]" : "h-[100vh]",
            // 2. Modern browsers: dvh adjusts with URL bar (Android Chrome)
            isVertical && "[@supports(height:1dvh)]:h-[calc(100dvh+60px)]",
            !isVertical && "[@supports(height:1dvh)]:h-dvh",
            // 3. Safari: max(dvh, lvh) - self-detects iOS SFSafariViewController bug
            // Normal iOS Safari: lvh > dvh → picks lvh (stable)
            // Buggy iOS in-app browser: lvh < dvh → picks dvh (workaround)
            isVertical &&
              "[@supports(-webkit-touch-callout:none)]:h-[calc(max(100dvh,100lvh)+60px)]",
            !isVertical &&
              "[@supports(-webkit-touch-callout:none)]:h-[max(100dvh,100lvh)]",
          )}
          style={
            {
              scrollSnapType: isVertical ? "y mandatory" : "x mandatory",
              scrollBehavior: "smooth",
              // Constrain touch to scroll direction only (prevents URL bar collapse on mobile)
              // Disable touch entirely during animations or closing
              touchAction:
                isAnimating || isClosing
                  ? "none"
                  : isVertical
                    ? "pan-y"
                    : "pan-x",
              // Adjust for keyboard on bottom drawer
              paddingBottom:
                direction === "bottom" && keyboardHeight > 0
                  ? `${keyboardHeight}px`
                  : undefined,
              // Animate --drawer-snap-progress CSS custom property (Chrome 115+)
              // Consumers can use: opacity: var(--drawer-snap-progress) for crossfades
              ...(useScrollDrivenAnimation && {
                animationName: "drawer-snap-progress",
                animationTimingFunction: "linear",
                animationFillMode: "both",
                animationTimeline: "scroll(self)",
                animationRange: `${firstSnapScrollPos}px ${lastSnapScrollPos}px`,
              }),
            } as React.CSSProperties
          }
        >
          {/* Scroll track - creates the scrollable area */}
          <div
            data-slot="drawer-track"
            className={cn(
              "pointer-events-none relative",
              // Track sizing
              isVertical ? "w-full" : "h-full",
              // Flex layout to position drawer
              // Bottom/Right: drawer at end, scroll 0 = hidden
              // Top/Left: drawer at start, scroll MAX = hidden (inverted)
              "flex",
              direction === "bottom" && "flex-col justify-end",
              direction === "top" && "flex-col justify-start",
              direction === "right" && "flex-row justify-end",
              direction === "left" && "flex-row justify-start",
            )}
            style={{
              // Track size: creates the scrollable space
              [isVertical ? "height" : "width"]: `${trackSize}px`,
            }}
          >
            {/* Snap targets - invisible elements for scroll-snap-align */}
            {/* Also serve as scroll-state containers for CSS queries (Chrome 133+) */}
            {snapScrollPositions.map((position, index) => (
              <div
                key={index}
                ref={(el) => {
                  snapTargetRefs.current[index] = el;
                }}
                data-slot="drawer-snap-target"
                data-snap-index={index}
                className={cn(
                  "pointer-events-none absolute",
                  isVertical ? "right-0 left-0 h-px" : "top-0 bottom-0 w-px",
                )}
                style={
                  {
                    [isVertical ? "top" : "left"]: `${position}px`,
                    scrollSnapAlign: "start",
                    scrollSnapStop: sequentialSnap ? "always" : undefined,
                    // CSS scroll-state() container queries (Chrome 133+)
                    // Enables: @container scroll-state(snapped: block) { ... }
                    ...(supportsScrollState && {
                      containerType: "scroll-state",
                    }),
                  } as React.CSSProperties
                }
                aria-hidden="true"
              />
            ))}

            {/* Popup - the actual drawer panel (dialog element with accessibility) */}
            <BaseDialog.Popup
              ref={measureRef}
              data-slot="drawer-content"
              className={cn(
                // Base styles
                "bg-popover text-popover-foreground flex flex-col",
                // Positioning and layering
                "relative z-10",
                // Hide until scroll is initialized to prevent flash at wrong position (iOS Safari)
                // Only apply when opening (open=true), not during close animation
                open && !isInitialized && "invisible",
                // Disable pointer events during enter/exit animations to prevent interruption
                isAnimating || isClosing
                  ? "pointer-events-none"
                  : "pointer-events-auto",
                // Direction-specific styling (use dvh for mobile)
                direction === "bottom" && "max-h-[95dvh] w-full rounded-t-xl",
                direction === "top" && "max-h-[95dvh] w-full rounded-b-xl",
                direction === "right" && "h-dvh w-[85vw] max-w-md rounded-l-xl",
                direction === "left" && "h-dvh w-[85vw] max-w-md rounded-r-xl",
                // Shadow and border
                // "border-transparent ring-1 ring-transparent outline-transparent",
                // direction === "bottom" && "border-t",
                // direction === "top" && "border-b",
                // direction === "right" && "border-l",
                // direction === "left" && "border-r",
                // CSS transitions for enter/exit animations
                // Skip transition on immediate close (swipe dismiss)
                immediateClose
                  ? "transition-none"
                  : "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-transform duration-450",
                // Starting style (entering) - off-screen by snap point ratio
                // Uses CSS variable for dynamic offset based on target snap point
                direction === "bottom" &&
                  "[&[data-starting-style]]:translate-y-[var(--drawer-start-offset)]",
                direction === "top" &&
                  "[&[data-starting-style]]:-translate-y-[var(--drawer-start-offset)]",
                direction === "right" &&
                  "[&[data-starting-style]]:translate-x-[var(--drawer-start-offset)]",
                direction === "left" &&
                  "[&[data-starting-style]]:-translate-x-[var(--drawer-start-offset)]",
                // Ending style (exiting) - off-screen by snap point ratio
                // Uses same CSS variable so exit matches current snap point position
                direction === "bottom" &&
                  "[&[data-ending-style]]:translate-y-[var(--drawer-start-offset)]",
                direction === "top" &&
                  "[&[data-ending-style]]:-translate-y-[var(--drawer-start-offset)]",
                direction === "right" &&
                  "[&[data-ending-style]]:translate-x-[var(--drawer-start-offset)]",
                direction === "left" &&
                  "[&[data-ending-style]]:-translate-x-[var(--drawer-start-offset)]",
                // Reduced motion: instant transitions
                "motion-reduce:transition-none",
                className,
              )}
              style={
                {
                  scrollSnapAlign: "start",

                  // Dynamic starting offset for enter animation
                  "--drawer-start-offset": startingOffset,

                  // View timeline for backdrop animation (Chrome 115+)
                  // Backdrop opacity tracks how much of drawer is visible
                  ...(supportsScrollTimeline && {
                    viewTimelineName: "--drawer-panel",
                    viewTimelineAxis: isVertical ? "block" : "inline",
                  }),
                } as React.CSSProperties
              }
              {...props}
            >
              {children}
            </BaseDialog.Popup>
          </div>

          {/* iOS 26 Safari: Fixed element at bottom for nav bar color detection */}
          {/* Must be: within 3px of bottom, ≥80% wide, ≥3px tall */}
          {/* Only visible on Safari; slides with drawer during exit */}
          {(direction === "bottom" ||
            direction === "left" ||
            direction === "right") && (
            <div
              aria-hidden="true"
              className={cn(
                "bg-popover pointer-events-none fixed inset-x-0 bottom-0 hidden h-10 bg-clip-text [@supports(-webkit-touch-callout:none)]:block",
              )}
            />
          )}
        </BaseDialog.Viewport>
      </div>
    </DrawerPortal>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerHandle
 * -------------------------------------------------------------------------------------------------*/

interface DrawerHandleProps extends React.ComponentProps<"div"> {
  /** Hide the handle visually */
  hidden?: boolean;
}

function DrawerHandle({ className, hidden, ...props }: DrawerHandleProps) {
  const { direction } = useDrawer();
  const isVertical = direction === "top" || direction === "bottom";

  if (hidden) return null;

  return (
    <div
      data-slot="drawer-handle"
      aria-hidden="true"
      className={cn(
        "bg-muted-foreground/30 shrink-0 rounded-full",
        isVertical ? "mx-auto my-3 h-1.5 w-12" : "mx-3 my-auto h-12 w-1.5",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerHeader
 * -------------------------------------------------------------------------------------------------*/

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 px-4 pt-2 pb-0", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerFooter
 * -------------------------------------------------------------------------------------------------*/

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerTitle
 * -------------------------------------------------------------------------------------------------*/

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      data-slot="drawer-title"
      className={cn("text-foreground text-lg font-semibold", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerDescription
 * -------------------------------------------------------------------------------------------------*/

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerBody
 * -------------------------------------------------------------------------------------------------*/

function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn("flex-1 overflow-y-auto px-4 py-2", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------------------------------*/

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerPortal,
  DrawerContent,
  DrawerHandle,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  useDrawer,
};

export type { DrawerRenderProps };

// Re-export feature detection for consumers who want to check browser support
export {
  supportsScrollTimeline,
  supportsScrollState,
} from "./hooks/use-scroll-snap";
