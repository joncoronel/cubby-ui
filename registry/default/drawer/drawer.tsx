"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

// Drawer-specific CSS animations (scroll-driven animations for progressive enhancement)
import "./drawer.css";

import type { SnapPoint, DrawerDirection } from "./lib/drawer-utils";
import {
  DIRECTION_CONFIG,
  parsePixelValue,
  findSnapPointIndex,
  getSnapPointValue,
  snapPointToRatio,
  supportsScrollTimeline,
  supportsScrollState,
} from "./lib/drawer-utils";
import { useScrollSnap } from "./hooks/use-scroll-snap";
import { useVirtualKeyboard } from "./hooks/use-virtual-keyboard";
import { useVisualViewportHeight } from "./hooks/use-visual-viewport-height";

// Re-export types for consumers
export type { SnapPoint, DrawerDirection };

// Create handle for detached triggers (triggers outside the Drawer component)
const createDrawerHandle = BaseDialog.createHandle;

/* -------------------------------------------------------------------------------------------------
 * CVA Variants
 * -------------------------------------------------------------------------------------------------*/

const drawerContentVariants = cva(
  [
    "bg-popover text-popover-foreground flex flex-col",
    "relative ",
    "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-transform duration-350 will-change-transform",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        default: "",
        floating: [
          "m-4 rounded-2xl",
          "ring-border ring-1",
          "shadow-[0_16px_32px_0_oklch(0.18_0_0/0.16)]",
        ],
      },
      direction: {
        bottom: "",
        top: "",
        right: "",
        left: "",
      },
    },
    compoundVariants: [
      // Default variant - direction-specific sizing and rounding
      {
        variant: "default",
        direction: "bottom",
        class:
          "mx-auto max-h-[95dvh] w-full max-w-full rounded-t-xl [&[data-starting-style]]:translate-y-[var(--drawer-offset)] [&[data-ending-style]]:translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "default",
        direction: "top",
        class:
          "mx-auto max-h-[95dvh] w-full max-w-full rounded-b-xl [&[data-starting-style]]:-translate-y-[var(--drawer-offset)] [&[data-ending-style]]:-translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "default",
        direction: "right",
        class:
          "max-w-screen w-screen rounded-l-xl sm:max-w-sm [&[data-starting-style]]:translate-x-[var(--drawer-offset)] [&[data-ending-style]]:translate-x-[var(--drawer-offset)]",
      },
      {
        variant: "default",
        direction: "left",
        class:
          "max-w-screen w-screen  rounded-r-xl sm:max-w-sm [&[data-starting-style]]:-translate-x-[var(--drawer-offset)] [&[data-ending-style]]:-translate-x-[var(--drawer-offset)]",
      },
      // Floating variant - direction-specific sizing and transforms
      {
        variant: "floating",
        direction: "bottom",
        class:
          "mx-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] [&[data-starting-style]]:translate-y-[var(--drawer-offset)] [&[data-ending-style]]:translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "floating",
        direction: "top",
        class:
          "mx-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] [&[data-starting-style]]:-translate-y-[var(--drawer-offset)] [&[data-ending-style]]:-translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "floating",
        direction: "right",
        class:
          "h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-sm [&[data-starting-style]]:translate-x-[var(--drawer-offset)] [&[data-ending-style]]:translate-x-[var(--drawer-offset)]",
      },
      {
        variant: "floating",
        direction: "left",
        class:
          "h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-sm [&[data-starting-style]]:-translate-x-[var(--drawer-offset)] [&[data-ending-style]]:-translate-x-[var(--drawer-offset)]",
      },
    ],
    defaultVariants: {
      variant: "default",
      direction: "bottom",
    },
  },
);

const drawerTrackVariants = cva("pointer-events-none relative flex", {
  variants: {
    direction: {
      bottom: "w-full flex-col justify-end",
      top: "w-full flex-col justify-start",
      right: "h-full flex-row justify-end",
      left: "h-full flex-row justify-start",
    },
  },
  defaultVariants: {
    direction: "bottom",
  },
});

// Backdrop scroll-driven animation styles (used conditionally at runtime)
const backdropAnimationStyles: Record<DrawerDirection, string> = {
  // Bottom/Right: drawer enters from below/right → use entry range (0→1 opacity)
  bottom:
    "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  right:
    "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  // Top/Left: drawer exits toward top/left → use exit range with reversed keyframe (1→0 opacity)
  top: "fill-mode-[both] direction-[reverse] [animation-name:drawer-backdrop-fade] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  left: "fill-mode-[both] direction-[reverse] [animation-name:drawer-backdrop-fade] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Context
 * -------------------------------------------------------------------------------------------------*/

type DrawerVariant = "default" | "floating";

interface DrawerContextValue {
  direction: DrawerDirection;
  variant: DrawerVariant;
  snapPoints: SnapPoint[];
  activeSnapPoint: SnapPoint;
  setActiveSnapPoint: (snapPoint: SnapPoint) => void;
  dismissible: boolean;
  /** Modal behavior passed to Base UI Dialog */
  modal: boolean | "trap-focus";
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
  /** Whether to reposition drawer when virtual keyboard appears. */
  repositionInputs: boolean;
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
  "children"
> {
  /** Direction the drawer opens from. Default: "bottom" */
  direction?: DrawerDirection;
  /** Visual variant of the drawer. Default: "default" */
  variant?: DrawerVariant;
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
  /**
   * Modal behavior:
   * - `true`: Focus trapped, outside pointer disabled, body scroll locked (default)
   * - `"trap-focus"`: Focus trapped, outside pointer enabled, no scroll lock
   * - `false`: Non-modal, no focus trapping
   * @default true
   */
  modal?: boolean | "trap-focus";

  /** When true, prevents skipping snap points during fast swipes. Default: false */
  sequentialSnap?: boolean;
  /** When true, repositions drawer when virtual keyboard appears (bottom direction only). Default: false */
  repositionInputs?: boolean;
  /** Children - can be ReactNode or render function for access to drag state */
  children?: React.ReactNode | ((props: DrawerRenderProps) => React.ReactNode);
}

function Drawer({
  direction = "bottom",
  variant = "default",
  snapPoints = [1],
  defaultSnapPoint,
  activeSnapPoint: controlledSnapPoint,
  onActiveSnapPointChange,
  dismissible = true,
  modal = true,
  sequentialSnap = false,
  repositionInputs = false,
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

  const { isVertical } = DIRECTION_CONFIG[direction];

  // Clear animating when CSS animation completes
  const handleOpenChangeComplete = React.useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Handle open change
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails?: { reason?: string }) => {
      // Prevent state changes during animations (user can't interrupt enter/exit)
      if (isAnimating) return;
      // Prevent closing while actively scrolling/dragging (swipe momentum)
      // BUT allow swipe dismiss (which passes reason: "swipe-dismiss")
      if (!nextOpen && isDragging && eventDetails?.reason !== "swipe-dismiss") {
        return;
      }

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

      // Reset state when opening (these persist across drawer sessions since they're in the root)
      if (nextOpen) {
        setDragProgress(1); // 1 = closed/invisible, will animate to 0 = open/visible
        setIsDragging(false); // Reset dragging state (may be stale from swipe dismiss)
        setImmediateClose(false); // Reset immediate close flag
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
      variant,
      snapPoints,
      activeSnapPoint: activeSnapPointValue,
      setActiveSnapPoint,
      dismissible,
      modal,
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
      repositionInputs,
    }),
    [
      direction,
      variant,
      snapPoints,
      activeSnapPointValue,
      setActiveSnapPoint,
      modal,
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
      repositionInputs,
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
        modal={modal}
        // For non-modal modes, disable outside click dismissal so page interaction doesn't close drawer
        disablePointerDismissal={modal !== true}
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
  const defaultProps = {
    "data-slot": "drawer-close",
    type: "button" as const,
    className,
    onClick: handleClick,
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
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

interface DrawerContentProps extends BaseDialog.Popup.Props {
  /** Visual style variant for the footer. */
  footerVariant?: "default" | "inset";
}

/**
 * DrawerContent - Outer wrapper that renders the Portal.
 * The actual content is in DrawerContentInner, which only mounts when the Portal is visible.
 * This ensures useScrollSnap gets fresh state on each open (no stale state between sessions).
 *
 * @param initialFocus - Determines the element to focus when the drawer is opened.
 *   - `false`: Do not move focus.
 *   - `true`: Move focus to first tabbable element or popup (default).
 *   - `RefObject<HTMLElement>`: Move focus to the ref element.
 *   - `function`: Called with interaction type, returns element to focus or boolean.
 *
 * @param finalFocus - Determines the element to focus when the drawer is closed.
 *   - `false`: Do not move focus.
 *   - `true`: Move focus to trigger or previously focused element (default).
 *   - `RefObject<HTMLElement>`: Move focus to the ref element.
 *   - `function`: Called with interaction type, returns element to focus or boolean.
 */
function DrawerContent({
  initialFocus,
  finalFocus,
  footerVariant = "default",
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerContentInner
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        footerVariant={footerVariant}
        {...props}
      />
    </DrawerPortal>
  );
}

/**
 * DrawerContentInner - The actual drawer content that mounts/unmounts with the dialog.
 * Contains useScrollSnap hook which gets fresh state on each mount.
 */
function DrawerContentInner({
  className,
  children,
  footerVariant = "default",
  initialFocus,
  finalFocus,
  ...props
}: DrawerContentProps) {
  const {
    direction,
    variant,
    snapPoints,
    activeSnapPoint,
    setActiveSnapPoint,
    dismissible,
    modal,
    contentSize,
    setContentSize,
    isVertical,
    setIsDragging,
    dragProgress,
    setDragProgress,
    snapProgress,
    setSnapProgress,
    onOpenChange,
    open,
    isAnimating,
    immediateClose,
    setImmediateClose,
    isDragging,
    sequentialSnap,
    repositionInputs,
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
  const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboard({
    enabled: direction === "bottom",
  });

  // Visual viewport height tracking (for horizontal drawers in non-modal mode)
  // This provides real-time viewport height that updates immediately with URL bar changes
  const visualViewportHeight = useVisualViewportHeight({
    enabled: !isVertical && modal !== true,
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
    setSnapTargetRef,
    trackSize,
    isInitialized,
    isClosing,
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
    onScrollingChange: setIsDragging,
  });

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

  // Calculate first and last snap ratios for CSS animation-range
  // These are used in calc() expressions instead of pre-calculated pixel values
  const firstSnapRatio =
    contentSize != null
      ? snapPointToRatio(snapPoints[0], contentSize)
      : typeof snapPoints[0] === "number"
        ? snapPoints[0]
        : 1;
  const lastSnapRatio =
    contentSize != null
      ? snapPointToRatio(snapPoints[snapPoints.length - 1], contentSize)
      : typeof snapPoints[snapPoints.length - 1] === "number"
        ? snapPoints[snapPoints.length - 1]
        : 1;

  // Animation offset based on active snap point
  // For pixel snap points, use the value directly (e.g., "92px")
  // For percentage snap points, convert to percentage (e.g., 0.25 -> "25%")
  const baseOffset =
    typeof activeSnapPoint === "number"
      ? `${activeSnapPoint * 100}%`
      : activeSnapPoint;
  const animationOffset =
    variant === "floating" ? `calc(${baseOffset} + 1rem)` : baseOffset;

  // Target backdrop opacity based on snap point (0.25 snap = 0.25 opacity)
  const targetBackdropOpacity = snapPointRatio;

  // Measure the drawer content size (now measures the Popup element)
  // For floating variant, add margin to size so scroll calculations account for it
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const floatingMargin = variant === "floating" ? 16 : 0; // m-4 = 1rem = 16px

  const measureRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup previous observer
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) return;

      const measure = () => {
        const baseSize = isVertical ? node.offsetHeight : node.offsetWidth;
        // Add margin for floating variant so drawer scrolls fully off-screen
        setContentSize(baseSize + floatingMargin);
      };

      measure();
      observerRef.current = new ResizeObserver(measure);
      observerRef.current.observe(node);
    },
    [isVertical, setContentSize, floatingMargin],
  );

  // Cleanup on unmount
  React.useEffect(() => () => observerRef.current?.disconnect(), []);

  // Determine if scroll-driven animations should be active
  // Requires: browser support + initialized + not during enter/exit animation
  const useScrollDrivenAnimation =
    supportsScrollTimeline && isInitialized && !isAnimating && !immediateClose;

  return (
    // Timeline scope wrapper - enables cross-element timeline references
    // Required for backdrop to reference drawer panel's view timeline
    <div
      data-slot="drawer-timeline-scope"
      style={
        supportsScrollTimeline
          ? ({ timelineScope: "--drawer-panel" } as React.CSSProperties)
          : undefined
      }
    >
      {/* Backdrop - view-driven opacity (Chrome 115+) with JS fallback */}
      {/* Only render backdrop when modal={true} - other modes allow page interaction */}
      {modal === true && (
        <BaseDialog.Backdrop
          data-slot="drawer-overlay"
          className={cn(
            "absolute inset-0 z-50 bg-black/35",
            // Force GPU layer to prevent repaint flicker
            "[transform:translateZ(0)] will-change-[opacity]",
            // Disable pointer events during closing to avoid interfering with swipe dismiss
            isClosing ? "pointer-events-none" : "pointer-events-auto",
            // Prevent touch-drag on backdrop from scrolling the page underneath
            "touch-none",
            // Transition for smooth enter/exit (skip on immediate close or while dragging)
            immediateClose || (isDragging && !isAnimating)
              ? "transition-none"
              : "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-opacity duration-350",
            // Enter: start at opacity 0, transition animates to target
            "[&[data-starting-style]]:opacity-0!",
            // Exit: use animation to override scroll-driven animation (transition can't interpolate from animation-held values)
            // "[&[data-ending-style]]:[animation:drawer-backdrop-exit_450ms_cubic-bezier(0,0,0.58,1)_forwards]",
            "[&[data-ending-style]]:opacity-0",

            isInitialized && !isAnimating && isDragging && dismissible
              ? useScrollDrivenAnimation
                ? // Scroll-driven backdrop animation (Chrome 115+)
                  backdropAnimationStyles[direction]
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
      )}

      {/* Viewport - scroll container for scroll-snap gestures */}
      <BaseDialog.Viewport
        ref={containerRef}
        data-slot="drawer-viewport"
        data-direction={direction}
        data-scrolling={isScrolling || undefined}
        data-keyboard-visible={
          direction === "bottom" && repositionInputs && isKeyboardVisible
            ? "true"
            : undefined
        }
        className={cn(
          // Group for propagating data-starting-style/data-ending-style to children
          "group/drawer",
          // Fixed positioning
          "fixed inset-x-0 z-50 outline-hidden",
          // Bottom drawer: anchor to bottom edge
          // Modal mode: -60px top buffer + dynamic height to prevent URL bar collapse on drag
          // Non-modal modes: anchor to bottom with fixed lvh height extending upward
          // (top-auto unsets the top:0 from inset-0, so container anchors from bottom)
          direction === "bottom" &&
            (modal === true
              ? "top-[-60px] bottom-[env(keyboard-inset-height,var(--keyboard-height,0))]"
              : "top-auto! bottom-[env(keyboard-inset-height,var(--keyboard-height,0))] h-lvh"),
          // Top drawer: anchor top, extend below for scroll space
          direction === "top" && "top-0! bottom-[-60px]!",
          // Horizontal drawers: full viewport height
          !isVertical &&
            (modal === true
              ? "top-0! bottom-0! h-dvh"
              : "top-0! bottom-0 h-lvh"),

          // Disable all interaction when animating, closing, or non-modal
          // (non-modal modes allow page interaction - Popup has its own pointer-events-auto)
          isAnimating || isClosing || modal !== true
            ? "pointer-events-none"
            : "pointer-events-auto",
          // Prevent Base UI's default animation and ensure transparent background
          "bg-transparent opacity-100! [&[data-ending-style]]:opacity-100! [&[data-starting-style]]:opacity-100!",

          // Hide scrollbar
          "[scrollbar-width:none_!important] [&::-webkit-scrollbar]:hidden!",
          // Scroll snap configuration - disable scrolling when animating or closing
          isAnimating || isClosing
            ? "touch-none overflow-hidden"
            : isVertical
              ? "touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-none"
              : "touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-none",
          // Constrain touch gestures to drawer scroll direction only (prevents URL bar collapse/expand)
          isVertical ? "touch-pan-y" : "touch-pan-x",
          // Reduced motion: instant behavior
          "motion-reduce:[scroll-behavior:auto]",
        )}
        style={
          {
            ...(visualViewportHeight != null && {
              "--visual-viewport-height": `${visualViewportHeight}px`,
            }),
            ...(repositionInputs && {
              "--keyboard-height": `${keyboardHeight}px`,
            }),
            // CSS variables for scroll-driven animation calc() expressions
            // These enable animation-range to be computed in CSS instead of JS
            ...{
              "--content-size": `${contentSize ?? 0}px`,
              "--dismiss-buffer": dismissible
                ? `${(contentSize ?? 0) * 0.3}px`
                : "0px",
              "--first-snap-ratio": firstSnapRatio,
              "--last-snap-ratio": lastSnapRatio,
            },
            // Disable scroll-snap until initialized to prevent browser snapping to wrong position
            // For inverted directions (top/left), scroll 0 = fully open, which causes incorrect initial state
            scrollSnapType: isInitialized
              ? isVertical
                ? "y mandatory"
                : "x mandatory"
              : "none",
            scrollBehavior: isInitialized ? "smooth" : "auto",
            // Reposition drawer when virtual keyboard appears (bottom direction only)
            // Uses transform (not bottom) to avoid resizing the scroll container
            // which would mess with scroll positions and snap behavior
            // transform:
            //   direction === "bottom" &&
            //   repositionInputs &&
            //   isKeyboardVisible &&
            //   keyboardHeight > 0
            //     ? `translateY(-${keyboardHeight}px)`
            //     : undefined,
            // Animate --drawer-snap-progress CSS custom property
            // Consumers can use: opacity: var(--drawer-snap-progress) for crossfades
            // Chrome 115+: uses CSS scroll-driven animation
            // Fallback: sets variable via JS snapProgress state
            ...(useScrollDrivenAnimation
              ? {
                  animationName: "drawer-snap-progress",
                  animationTimingFunction: "linear",
                  animationFillMode: "both",
                  // Horizontal drawers need scroll(self x) to track horizontal scroll
                  animationTimeline: isVertical
                    ? "scroll(self)"
                    : "scroll(self x)",
                  // For inverted directions (top/left), scroll decreases as drawer opens
                  // animation-range requires start < end, so swap values and reverse animation
                  // Formula: dismissBuffer + ratio * contentSize (non-inverted)
                  // Or: contentSize * (1 - ratio) (inverted, with reversed animation)
                  ...(direction === "top" || direction === "left"
                    ? {
                        animationRange: `calc(var(--content-size) * (1 - var(--last-snap-ratio))) calc(var(--content-size) * (1 - var(--first-snap-ratio)))`,
                        animationDirection: "reverse",
                      }
                    : {
                        animationRange: `calc(var(--dismiss-buffer) + var(--first-snap-ratio) * var(--content-size)) calc(var(--dismiss-buffer) + var(--last-snap-ratio) * var(--content-size))`,
                      }),
                }
              : {
                  "--drawer-snap-progress": snapProgress,
                }),
          } as React.CSSProperties
        }
      >
        {/* Scroll track - creates the scrollable area */}
        <div
          data-slot="drawer-track"
          className={drawerTrackVariants({ direction })}
          style={
            {
              // Track size: creates the scrollable space
              [isVertical ? "height" : "width"]: `${trackSize}px`,
              // CSS variables for snap target positioning (see drawer.css)
              "--content-size": `${contentSize ?? 0}px`,
              "--dismiss-buffer": dismissible
                ? `${(contentSize ?? 0) * 0.3}px`
                : "0px",
            } as React.CSSProperties
          }
        >
          {/* Snap targets - invisible elements for scroll-snap-align */}
          {/* Positioning handled by CSS using --snap-ratio variable (see drawer.css) */}
          {/* Also serve as scroll-state containers for CSS queries (Chrome 133+) */}
          {/* Only render when contentSize is measured - drawer is hidden until then anyway */}
          {contentSize != null && (
            <>
              {/* Dismiss snap target (if dismissible) */}
              {dismissible && (
                <div
                  ref={(el) => setSnapTargetRef(0, el)}
                  data-slot="drawer-snap-target"
                  data-snap-index={0}
                  data-snap-type="dismiss"
                  className={cn(
                    "pointer-events-none absolute",
                    isVertical ? "inset-x-0 h-px" : "inset-y-0 w-px",
                  )}
                  style={
                    {
                      scrollSnapAlign: "start",
                      scrollSnapStop: sequentialSnap ? "always" : undefined,
                      ...(supportsScrollState && {
                        containerType: "scroll-state",
                      }),
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              )}

              {/* Snap point targets */}
              {snapPoints.map((snapPoint, index) => {
                const snapIndex = dismissible ? index + 1 : index;
                const ratio = snapPointToRatio(snapPoint, contentSize);

                return (
                  <div
                    key={snapIndex}
                    ref={(el) => setSnapTargetRef(snapIndex, el)}
                    data-slot="drawer-snap-target"
                    data-snap-index={snapIndex}
                    className={cn(
                      "pointer-events-none absolute",
                      isVertical ? "inset-x-0 h-px" : "inset-y-0 w-px",
                    )}
                    style={
                      {
                        "--snap-ratio": ratio,
                        scrollSnapAlign: "start",
                        scrollSnapStop: sequentialSnap ? "always" : undefined,
                        ...(supportsScrollState && {
                          containerType: "scroll-state",
                        }),
                      } as React.CSSProperties
                    }
                    aria-hidden="true"
                  />
                );
              })}
            </>
          )}

          {/* Popup - the actual drawer panel (dialog element with accessibility) */}
          <BaseDialog.Popup
            ref={measureRef}
            data-slot="drawer-content"
            data-footer-variant={footerVariant}
            initialFocus={initialFocus}
            finalFocus={finalFocus}
            className={cn(
              drawerContentVariants({ variant, direction }),
              // Hide until scroll is initialized to prevent flash at wrong position
              open && !isInitialized && "opacity-0",
              // Disable pointer events during enter/exit animations to prevent interruption
              isAnimating || isClosing
                ? "pointer-events-none"
                : "pointer-events-auto",
              // Skip transition on immediate close (swipe dismiss)
              immediateClose && "transition-none",
              // Safari iOS touch fix: 1px cross-axis overflow (WebKit bug #183870)
              // Only needed for non-modal modes where viewport has pointer-events:none
              modal !== true && [
                "[@supports(-webkit-touch-callout:none)]:relative [@supports(-webkit-touch-callout:none)]:[scrollbar-width:none]",
                isVertical
                  ? "[@supports(-webkit-touch-callout:none)]:overflow-x-scroll [@supports(-webkit-touch-callout:none)]:overscroll-x-none [@supports(-webkit-touch-callout:none)]:after:pointer-events-none [@supports(-webkit-touch-callout:none)]:after:absolute [@supports(-webkit-touch-callout:none)]:after:inset-0 [@supports(-webkit-touch-callout:none)]:after:w-[calc(100%+0.5px)] [@supports(-webkit-touch-callout:none)]:after:content-['']"
                  : "[@supports(-webkit-touch-callout:none)]:overflow-y-scroll [@supports(-webkit-touch-callout:none)]:overscroll-y-none [@supports(-webkit-touch-callout:none)]:after:pointer-events-none [@supports(-webkit-touch-callout:none)]:after:absolute [@supports(-webkit-touch-callout:none)]:after:inset-0 [@supports(-webkit-touch-callout:none)]:after:h-[calc(100%+1px)] [@supports(-webkit-touch-callout:none)]:after:content-['']",
              ],
              className,
            )}
            style={
              {
                // Note: scroll-snap-align is NOT set here - we use dedicated invisible
                // snap targets instead. Setting it on the Popup creates conflicting
                // snap points for floating variant (due to margin offset).

                // Dynamic offset for enter/exit animations
                "--drawer-offset": animationOffset,

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

        <>
          <div
            aria-hidden="true"
            className={cn(
              "bg-popover pointer-events-none fixed inset-x-0 bottom-0 hidden h-10 bg-clip-text [@supports(-webkit-touch-callout:none)]:block",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "bg-popover pointer-events-none fixed inset-x-0 top-0 hidden h-10 bg-clip-text [@supports(-webkit-touch-callout:none)]:block",
            )}
          />
        </>
      </BaseDialog.Viewport>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerHandle
 * -------------------------------------------------------------------------------------------------*/

interface DrawerHandleProps extends Omit<
  React.ComponentProps<"button">,
  "children"
> {
  /** Hide the handle visually */
  hidden?: boolean;
  /** Disable click-to-close behavior (visual-only mode). Default: false */
  preventClose?: boolean;
}

/**
 * DrawerHandle - Interactive handle that closes the drawer when clicked.
 * On touch devices, users typically swipe the drawer to dismiss.
 * On non-touch devices, clicking the handle provides an intuitive close action.
 */
function DrawerHandle({
  className,
  hidden,
  preventClose = false,
  onClick,
  ...props
}: DrawerHandleProps) {
  const { direction, onOpenChange, isAnimating } = useDrawer();
  const { isVertical } = DIRECTION_CONFIG[direction];

  if (hidden) return null;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isAnimating || preventClose) return;
    onOpenChange(false);
  };

  return (
    <button
      type="button"
      data-slot="drawer-handle"
      aria-label="Close drawer"
      onClick={handleClick}
      className={cn(
        // Reset button styles
        "appearance-none border-0 bg-transparent p-0",
        // Focus ring for keyboard users
        "focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        // Visual handle styles
        "bg-muted-foreground/30 shrink-0 cursor-pointer rounded-full",
        isVertical ? "mx-auto my-3 h-1.5 w-12" : "mx-3 my-auto h-12 w-1.5",
        // Hover state
        "hover:bg-muted-foreground/50 transition-colors",
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
      className={cn(
        "flex flex-col gap-1.5 px-5 pt-5 pb-3",
        // Reduce bottom padding when header is directly before footer (no body)
        "not-has-[+[data-slot=drawer-body]]:has-[+[data-slot=drawer-footer]]:pb-1",
        // Add extra bottom padding when header is alone (no body or footer)
        "not-has-[+[data-slot=drawer-body]]:not-has-[+[data-slot=drawer-footer]]:pb-5",
        // Inset footer variant: add extra bottom padding when header is directly before footer (no body)
        "in-data-[footer-variant=inset]:not-has-[+[data-slot=drawer-body]]:has-[+[data-slot=drawer-footer]]:pb-5",
        className,
      )}
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
      className={cn(
        "bg-popover mt-auto flex flex-col gap-2 px-5 pt-3 pb-5",
        // Add extra top padding when footer is first (no header or body before it)
        // Note: first: works when no Handle precedes; for Handle-first layouts
        // without header/body, add className="pt-5" manually
        "first:pt-5",
        // Inset variant: muted background with top border for separation
        "in-data-[footer-variant=inset]:border-border in-data-[footer-variant=inset]:bg-muted in-data-[footer-variant=inset]:border-t in-data-[footer-variant=inset]:pt-4 in-data-[footer-variant=inset]:pb-4",
        className,
      )}
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

function DrawerBody({
  className,
  nativeScroll = false,
  fadeEdges = false,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  nativeScroll?: boolean;
} & Pick<
    ScrollAreaProps,
    "fadeEdges" | "scrollbarGutter" | "persistScrollbar" | "hideScrollbar"
  >) {
  const { direction } = useDrawer();
  const { isVertical } = DIRECTION_CONFIG[direction];

  return (
    <div
      data-slot="drawer-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        "first:pt-4",
        "not-has-[+[data-slot=drawer-footer]]:pb-4",
        "in-data-[footer-variant=inset]:has-[+[data-slot=drawer-footer]]:pb-4",
      )}
    >
      <ScrollArea
        className="flex-1"
        // fadedges is false by default since it can cause issues with the drawer animation on mobile devices
        fadeEdges={fadeEdges}
        scrollbarGutter={scrollbarGutter}
        persistScrollbar={persistScrollbar}
        hideScrollbar={hideScrollbar}
        nativeScroll={nativeScroll}
        overscrollBehavior="auto"
        viewportClassName={isVertical ? "touch-pan-y" : "touch-pan-x"}
      >
        <div className={cn("px-5 py-1", className)} {...props}>
          {children}
        </div>
      </ScrollArea>
    </div>
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
  createDrawerHandle,
};

export type { DrawerRenderProps, DrawerVariant };

// Re-export feature detection for consumers who want to check browser support
export { supportsScrollTimeline, supportsScrollState };
