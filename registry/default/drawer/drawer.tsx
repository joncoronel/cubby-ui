"use client";

import * as React from "react";
import {
  Dialog as BaseDialog,
  type DialogRootChangeEventDetails,
} from "@base-ui/react/dialog";
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
  snapPointToSnapPercent,
  resolveSnapPointRatio,
  calculateHeightDrivenScrollProgress,
  supportsScrollTimeline,
  supportsScrollState,
} from "./lib/drawer-utils";
import { useScrollSnap } from "./hooks/use-scroll-snap";
import { useScrollSnapHeightDriven } from "./hooks/use-scroll-snap-height-driven";
import { useVirtualKeyboard } from "./hooks/use-virtual-keyboard";
import { useVisualViewportHeight } from "./hooks/use-visual-viewport-height";

export type { SnapPoint, DrawerDirection };

const createDrawerHandle = BaseDialog.createHandle;

/* -------------------------------------------------------------------------------------------------
 * CVA Variants
 * -------------------------------------------------------------------------------------------------*/

const drawerContentVariants = cva(
  [
    "bg-popover text-popover-foreground flex flex-col",
    "relative",
    "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-transform duration-300 will-change-transform",
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
          "max-w-screen w-screen rounded-r-xl sm:max-w-sm [&[data-starting-style]]:-translate-x-[var(--drawer-offset)] [&[data-ending-style]]:-translate-x-[var(--drawer-offset)]",
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

// iOS 26 Safari: Fixed elements for nav bar color detection (must be within 3px of edge, ≥80% wide, ≥3px tall)
const SafariNavColorDetectors = (
  <>
    <div
      aria-hidden="true"
      className="bg-popover pointer-events-none fixed inset-x-0 bottom-0 hidden h-10 bg-clip-text [@supports(-webkit-touch-callout:none)]:block"
    />
    <div
      aria-hidden="true"
      className="bg-popover pointer-events-none fixed inset-x-0 top-0 hidden h-10 bg-clip-text [@supports(-webkit-touch-callout:none)]:block"
    />
  </>
);

// Scroll-driven backdrop animation styles per direction
const backdropAnimationStyles: Record<DrawerDirection, string> = {
  bottom:
    "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  right:
    "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  top: "fill-mode-[both] direction-[reverse] [animation-name:drawer-backdrop-fade] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  left: "fill-mode-[both] direction-[reverse] [animation-name:drawer-backdrop-fade] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Context
 * -------------------------------------------------------------------------------------------------*/

type DrawerVariant = "default" | "floating";

interface DrawerConfigContextValue {
  direction: DrawerDirection;
  variant: DrawerVariant;
  snapPoints: SnapPoint[];
  dismissible: boolean;
  modal: boolean | "trap-focus";
  isVertical: boolean;
  sequentialSnap: boolean;
  repositionInputs: boolean;
}

/** High-frequency values updated during scroll/drag */
interface DrawerScrollContextValue {
  isDragging: boolean;
  dragProgress: number;
  snapProgress: number;
}

/** Low-frequency control values and stable setters */
interface DrawerControlContextValue {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  dismissViaSwipe: () => void;
  activeSnapPoint: SnapPoint;
  setActiveSnapPoint: (snapPoint: SnapPoint) => void;
  contentSize: number | null;
  setContentSize: (size: number | null) => void;
  isAnimating: boolean;
  immediateClose: boolean;
  setImmediateClose: (value: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setDragProgress: (progress: number) => void;
  setSnapProgress: (progress: number) => void;
}

const DrawerConfigContext =
  React.createContext<DrawerConfigContextValue | null>(null);
const DrawerScrollContext =
  React.createContext<DrawerScrollContextValue | null>(null);
const DrawerControlContext =
  React.createContext<DrawerControlContextValue | null>(null);

function useDrawerConfig() {
  const context = React.useContext(DrawerConfigContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

/** High-frequency scroll/drag state. Subscribing causes re-renders during drag. */
function useDrawerScroll() {
  const context = React.useContext(DrawerScrollContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

/** Low-frequency control state and stable setters. Does not re-render during drag. */
function useDrawerControl() {
  const context = React.useContext(DrawerControlContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

/**
 * Convenience hook combining scroll and control contexts.
 * Subscribes to both — re-renders on any animation state change.
 * For fewer re-renders, use `useDrawerControl()` or `useDrawerScroll()`.
 */
function useDrawerAnimation() {
  return { ...useDrawerScroll(), ...useDrawerControl() };
}

/**
 * Convenience hook that returns all drawer context values.
 * For granular subscriptions (fewer re-renders), use
 * `useDrawerConfig()` for static config,
 * `useDrawerControl()` for control state, or
 * `useDrawerScroll()` for scroll/drag state.
 */
function useDrawer() {
  return { ...useDrawerConfig(), ...useDrawerScroll(), ...useDrawerControl() };
}

/* -------------------------------------------------------------------------------------------------
 * Drawer (Root)
 * -------------------------------------------------------------------------------------------------*/

interface DrawerRenderProps {
  /** 0 = first snap, 1 = last snap */
  snapProgress: number;
  /** 0 = open, 1 = closed */
  dragProgress: number;
  isDragging: boolean;
  activeSnapPoint: SnapPoint;
}

interface DrawerProps extends Omit<
  React.ComponentProps<typeof BaseDialog.Root>,
  "children" | "onOpenChange"
> {
  direction?: DrawerDirection;
  variant?: DrawerVariant;
  /** Percentages (0-1) or pixel strings (e.g., "200px") */
  snapPoints?: SnapPoint[];
  defaultSnapPoint?: SnapPoint;
  activeSnapPoint?: SnapPoint | null;
  onActiveSnapPointChange?: (snapPoint: SnapPoint) => void;
  dismissible?: boolean;
  /** `true` = modal, `"trap-focus"` = focus trapped but no scroll lock, `false` = non-modal */
  modal?: boolean | "trap-focus";
  /** Prevents skipping snap points during fast swipes */
  sequentialSnap?: boolean;
  /** Repositions drawer when virtual keyboard appears (bottom only) */
  repositionInputs?: boolean;
  /**
   * Event handler called when the drawer is opened or closed.
   * `eventDetails` may be undefined for internal close actions (e.g., DrawerClose, DrawerHandle).
   */
  onOpenChange?: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  children?: React.ReactNode | ((props: DrawerRenderProps) => React.ReactNode);
}

const DEFAULT_SNAP_POINTS: SnapPoint[] = [1];

function Drawer({
  direction = "bottom",
  variant = "default",
  snapPoints = DEFAULT_SNAP_POINTS,
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
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const isOpenControlled = controlledOpen !== undefined;
  const open = isOpenControlled ? controlledOpen : uncontrolledOpen;

  const defaultSnapPointIndex =
    defaultSnapPoint !== undefined
      ? findSnapPointIndex(snapPoints, defaultSnapPoint)
      : 0;

  const [internalSnapPointIndex, setInternalSnapPointIndex] = React.useState(
    defaultSnapPointIndex,
  );

  const isSnapPointControlled = controlledSnapPoint !== undefined;
  const activeSnapPointIndex = isSnapPointControlled
    ? findSnapPointIndex(snapPoints, controlledSnapPoint)
    : internalSnapPointIndex;

  const activeSnapPointValue = getSnapPointValue(
    snapPoints,
    activeSnapPointIndex,
  );

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragProgress, setDragProgress] = React.useState(1);
  const [snapProgress, setSnapProgress] = React.useState(0);
  const [contentSize, setContentSize] = React.useState<number | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [immediateClose, setImmediateClose] = React.useState(false);

  const { isVertical } = DIRECTION_CONFIG[direction];

  // Refs for stable access in callbacks without adding deps
  const isDraggingRef = React.useRef(false);
  const swipeDismissRef = React.useRef(false);
  React.useLayoutEffect(() => {
    isDraggingRef.current = isDragging;
  });

  const handleOpenChangeComplete = React.useCallback(() => {
    setIsAnimating(false);
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails?: DialogRootChangeEventDetails) => {
      // Prevent closing while scrolling, but allow explicit swipe dismiss
      if (!nextOpen && isDraggingRef.current && !swipeDismissRef.current) {
        return;
      }
      swipeDismissRef.current = false;

      setIsAnimating(true);

      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }
      controlledOnOpenChange?.(nextOpen, eventDetails);

      if (nextOpen && !isSnapPointControlled) {
        setInternalSnapPointIndex(defaultSnapPointIndex);
        const defaultSnapValue = getSnapPointValue(
          snapPoints,
          defaultSnapPointIndex,
        );
        onActiveSnapPointChange?.(defaultSnapValue);
      }

      if (nextOpen) {
        setDragProgress(1);
        setIsDragging(false);
        setImmediateClose(false);
        if (!isSnapPointControlled) {
          const progress =
            snapPoints.length > 1
              ? defaultSnapPointIndex / (snapPoints.length - 1)
              : 0;
          setSnapProgress(progress);
        }
      }
    },
    [
      isOpenControlled,
      controlledOnOpenChange,
      snapPoints,
      isSnapPointControlled,
      onActiveSnapPointChange,
      defaultSnapPointIndex,
    ],
  );

  const dismissViaSwipe = React.useCallback(() => {
    swipeDismissRef.current = true;
    handleOpenChange(false);
  }, [handleOpenChange]);

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

  const configValue = React.useMemo(
    () => ({
      direction,
      variant,
      snapPoints,
      dismissible,
      modal,
      isVertical,
      sequentialSnap,
      repositionInputs,
    }),
    [
      direction,
      variant,
      snapPoints,
      dismissible,
      modal,
      isVertical,
      sequentialSnap,
      repositionInputs,
    ],
  );

  const scrollValue = React.useMemo(
    () => ({
      isDragging,
      dragProgress,
      snapProgress,
    }),
    [isDragging, dragProgress, snapProgress],
  );

  const controlValue = React.useMemo(
    () => ({
      open,
      onOpenChange: handleOpenChange,
      dismissViaSwipe,
      activeSnapPoint: activeSnapPointValue,
      setActiveSnapPoint,
      contentSize,
      setContentSize,
      isAnimating,
      immediateClose,
      setImmediateClose,
      setIsDragging,
      setDragProgress,
      setSnapProgress,
    }),
    [
      open,
      handleOpenChange,
      dismissViaSwipe,
      activeSnapPointValue,
      setActiveSnapPoint,
      contentSize,
      isAnimating,
      immediateClose,
    ],
  );

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
    <DrawerConfigContext.Provider value={configValue}>
      <DrawerScrollContext.Provider value={scrollValue}>
        <DrawerControlContext.Provider value={controlValue}>
          <BaseDialog.Root
            data-slot="drawer"
            open={open}
            onOpenChange={handleOpenChange}
            onOpenChangeComplete={handleOpenChangeComplete}
            modal={modal}
            disablePointerDismissal={isAnimating || modal !== true}
            {...props}
          >
            {resolvedChildren}
          </BaseDialog.Root>
        </DrawerControlContext.Provider>
      </DrawerScrollContext.Provider>
    </DrawerConfigContext.Provider>
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
  const { onOpenChange, isAnimating } = useDrawerControl();

  const handleClick = React.useCallback(
    (event: React.MouseEvent) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (isAnimating) return;
      onOpenChange(false);
    },
    [onClick, onOpenChange, isAnimating],
  );

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
  footerVariant?: "default" | "inset";
}

function DrawerContent({
  initialFocus,
  finalFocus,
  footerVariant = "default",
  ...props
}: DrawerContentProps) {
  const { direction, snapPoints } = useDrawerConfig();
  const Inner =
    direction === "bottom" && snapPoints.length > 1
      ? DrawerContentInnerHeightDriven
      : DrawerContentInner;

  return (
    <DrawerPortal>
      <Inner
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        footerVariant={footerVariant}
        {...props}
      />
    </DrawerPortal>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Content Hooks (extracted from DrawerContentInner for readability)
 * -------------------------------------------------------------------------------------------------*/

/**
 * Measures drawer content size via ResizeObserver and provides merged refs
 * for the popup element.
 */
function useContentMeasurement(
  isVertical: boolean,
  floatingMargin: number,
  setContentSize: (size: number | null) => void,
) {
  const observerRef = React.useRef<ResizeObserver | null>(null);

  const measureRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node) return;

      const measure = () => {
        const baseSize = isVertical ? node.offsetHeight : node.offsetWidth;
        setContentSize(baseSize + floatingMargin);
      };

      measure();
      observerRef.current = new ResizeObserver(measure);
      observerRef.current.observe(node);
    },
    [isVertical, setContentSize, floatingMargin],
  );

  const popupRef = React.useRef<HTMLDivElement>(null);

  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      popupRef.current = node;
      measureRef(node);
    },
    [measureRef],
  );

  React.useEffect(() => () => observerRef.current?.disconnect(), []);

  return { mergedRef, popupRef };
}

/**
 * Computes all CSS style objects for the drawer viewport, popup, and backdrop.
 * Handles scroll-driven animation detection, snap ratios, and CSS custom properties.
 */
function useDrawerContentStyles({
  direction,
  variant,
  activeSnapPoint,
  snapPoints,
  contentSize,
  isVertical,
  isInitialized,
  isAnimating,
  immediateClose,
  dismissible,
  snapProgress,
  repositionInputs,
  keyboardHeight,
  visualViewportHeight,
}: {
  direction: DrawerDirection;
  variant: DrawerVariant;
  activeSnapPoint: SnapPoint;
  snapPoints: SnapPoint[];
  contentSize: number | null;
  isVertical: boolean;
  isInitialized: boolean;
  isAnimating: boolean;
  immediateClose: boolean;
  dismissible: boolean;
  snapProgress: number;
  repositionInputs: boolean;
  keyboardHeight: number;
  visualViewportHeight: number | null;
}) {
  const snapPointRatio = React.useMemo(() => {
    if (typeof activeSnapPoint === "number") {
      return activeSnapPoint;
    }
    const pixels = parsePixelValue(activeSnapPoint);
    if (!pixels || !contentSize) return 1;
    return pixels / contentSize;
  }, [activeSnapPoint, contentSize]);

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

  const baseOffset =
    typeof activeSnapPoint === "number"
      ? `${activeSnapPoint * 100}%`
      : activeSnapPoint;
  const animationOffset =
    variant === "floating" ? `calc(${baseOffset} + 1rem)` : baseOffset;

  const targetBackdropOpacity = snapPointRatio;

  const useScrollDrivenAnimation =
    supportsScrollTimeline && isInitialized && !isAnimating && !immediateClose;

  const viewportStyle = React.useMemo<React.CSSProperties>(
    () => ({
      ...(visualViewportHeight != null && {
        "--visual-viewport-height": `${visualViewportHeight}px`,
      }),
      ...(repositionInputs && {
        "--keyboard-height": `${keyboardHeight}px`,
      }),
      "--content-size": `${contentSize ?? 0}px`,
      "--dismiss-buffer": dismissible ? `${(contentSize ?? 0) * 0.3}px` : "0px",
      "--first-snap-ratio": firstSnapRatio,
      "--last-snap-ratio": lastSnapRatio,
      scrollSnapType: isInitialized
        ? isVertical
          ? "y mandatory"
          : "x mandatory"
        : "none",
      scrollBehavior: isInitialized ? "smooth" : "auto",
      ...(useScrollDrivenAnimation
        ? {
            animationName: "drawer-snap-progress",
            animationTimingFunction: "linear",
            animationFillMode: "both",
            animationTimeline: isVertical ? "scroll(self)" : "scroll(self x)",
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
    }),
    [
      visualViewportHeight,
      repositionInputs,
      keyboardHeight,
      contentSize,
      dismissible,
      firstSnapRatio,
      lastSnapRatio,
      isInitialized,
      isVertical,
      useScrollDrivenAnimation,
      snapProgress,
      direction,
    ],
  );

  const popupStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--drawer-offset": animationOffset,
      ...(supportsScrollTimeline && {
        viewTimelineName: "--drawer-panel",
        viewTimelineAxis: isVertical ? "block" : "inline",
      }),
    }),
    [animationOffset, isVertical],
  );

  return {
    viewportStyle,
    popupStyle,
    useScrollDrivenAnimation,
    targetBackdropOpacity,
  };
}

/* -------------------------------------------------------------------------------------------------
 * DrawerContentInner
 * -------------------------------------------------------------------------------------------------*/

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
    dismissible,
    modal,
    isVertical,
    sequentialSnap,
    repositionInputs,
  } = useDrawerConfig();

  const { isDragging, dragProgress, snapProgress } = useDrawerScroll();

  const {
    activeSnapPoint,
    setActiveSnapPoint,
    contentSize,
    setContentSize,
    setIsDragging,
    setDragProgress,
    setSnapProgress,
    dismissViaSwipe,
    open,
    isAnimating,
    immediateClose,
    setImmediateClose,
  } = useDrawerControl();

  const activeSnapPointIndex = findSnapPointIndex(snapPoints, activeSnapPoint);

  const handleSnapPointChange = React.useCallback(
    (index: number) => {
      setActiveSnapPoint(getSnapPointValue(snapPoints, index));
    },
    [snapPoints, setActiveSnapPoint],
  );

  const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboard({
    enabled: direction === "bottom",
  });

  // Provides real-time viewport height that updates with URL bar changes
  const visualViewportHeight = useVisualViewportHeight({
    enabled: !isVertical && modal !== true,
  });

  const handleDismiss = React.useCallback(() => {
    dismissViaSwipe();
  }, [dismissViaSwipe]);

  const handleImmediateClose = React.useCallback(() => {
    setImmediateClose(true);
  }, [setImmediateClose]);

  // Skip progress updates during enter/exit animations (let CSS control backdrop)
  const handleScrollProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setDragProgress(progress);
      }
    },
    [isAnimating, setDragProgress],
  );

  const handleSnapProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setSnapProgress(progress);
      }
    },
    [isAnimating, setSnapProgress],
  );

  const {
    containerRef,
    isScrolling,
    setSnapTargetRef,
    trackSize,
    snapScrollPositions,
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

  const floatingMargin = variant === "floating" ? 16 : 0;
  const { mergedRef, popupRef } = useContentMeasurement(
    isVertical,
    floatingMargin,
    setContentSize,
  );

  const {
    viewportStyle,
    popupStyle,
    useScrollDrivenAnimation,
    targetBackdropOpacity,
  } = useDrawerContentStyles({
    direction,
    variant,
    activeSnapPoint,
    snapPoints,
    contentSize,
    isVertical,
    isInitialized,
    isAnimating,
    immediateClose,
    dismissible,
    snapProgress,
    repositionInputs,
    keyboardHeight,
    visualViewportHeight,
  });

  return (
    <div
      data-slot="drawer-timeline-scope"
      style={
        supportsScrollTimeline
          ? ({ timelineScope: "--drawer-panel" } as React.CSSProperties)
          : undefined
      }
    >
      {modal === true && (
        <BaseDialog.Backdrop
          data-slot="drawer-overlay"
          className={cn(
            "absolute inset-0 z-50 bg-black/35",
            "[transform:translateZ(0)] will-change-[opacity]",
            isClosing ? "pointer-events-none" : "pointer-events-auto",
            "touch-none",
            immediateClose || (isDragging && !isAnimating)
              ? "transition-none"
              : "ease-[cubic-bezier(0, 0, 0.58, 1)] transition-opacity duration-300",
            "[&[data-starting-style]]:opacity-0!",
            // Exit animation overrides scroll-driven animation (transitions can't interpolate from animation-held values)
            "data-ending-style:animate-[drawer-backdrop-exit_300ms_cubic-bezier(0,0,0.58,1)_forwards]",
            isInitialized && !isAnimating && dismissible && dragProgress < 1
              ? useScrollDrivenAnimation
                ? backdropAnimationStyles[direction]
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
          "group/drawer",
          "fixed inset-x-0 z-50 outline-hidden",
          // Bottom: -60px top buffer prevents URL bar collapse; non-modal uses lvh
          direction === "bottom" &&
            (modal === true
              ? "top-[-60px] bottom-[env(keyboard-inset-height,var(--keyboard-height,0))]"
              : "top-auto! bottom-[env(keyboard-inset-height,var(--keyboard-height,0))] h-lvh"),
          direction === "top" && "top-0! bottom-[-60px]!",
          !isVertical &&
            (modal === true
              ? "top-0! bottom-0! h-dvh"
              : "top-0! bottom-0 h-lvh"),
          isAnimating || isClosing || modal !== true
            ? "pointer-events-none"
            : "pointer-events-auto",
          "bg-transparent opacity-100! [&[data-ending-style]]:opacity-100! [&[data-starting-style]]:opacity-100!",
          "[scrollbar-width:none_!important] [&::-webkit-scrollbar]:hidden!",
          isAnimating || isClosing
            ? "touch-none overflow-hidden"
            : isVertical
              ? "touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-none"
              : "touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-none",
          isVertical ? "touch-pan-y" : "touch-pan-x",
          "motion-reduce:[scroll-behavior:auto]",
        )}
        style={viewportStyle}
      >
        <div
          data-slot="drawer-track"
          className={drawerTrackVariants({ direction })}
          style={
            {
              [isVertical ? "height" : "width"]: `${trackSize}px`,
              "--content-size": `${contentSize ?? 0}px`,
              "--dismiss-buffer": dismissible
                ? `${(contentSize ?? 0) * 0.3}px`
                : "0px",
            } as React.CSSProperties
          }
        >
          {/* Snap targets with JS-calculated positions (CSS calc() has issues on iOS Safari) */}
          {snapScrollPositions.map((position, index) => (
            <div
              key={index}
              ref={(el) => setSnapTargetRef(index, el)}
              data-slot="drawer-snap-target"
              data-snap-index={index}
              className={cn(
                "pointer-events-none absolute",
                isVertical ? "inset-x-0 h-px" : "inset-y-0 w-px",
              )}
              style={
                {
                  [isVertical ? "top" : "left"]: `${position}px`,
                  scrollSnapAlign: "start",
                  scrollSnapStop: sequentialSnap ? "always" : undefined,
                  ...(supportsScrollState && {
                    containerType: "scroll-state",
                  }),
                } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}

          <BaseDialog.Popup
            ref={mergedRef}
            data-slot="drawer-content"
            data-footer-variant={footerVariant}
            initialFocus={initialFocus ?? popupRef}
            finalFocus={finalFocus}
            className={cn(
              drawerContentVariants({ variant, direction }),
              open && !isInitialized && "opacity-0",
              isAnimating || isClosing
                ? "pointer-events-none"
                : "pointer-events-auto",
              immediateClose && "transition-none",
              // Safari iOS touch fix: 1px cross-axis overflow (WebKit bug #183870)
              modal !== true && [
                "[@supports(-webkit-touch-callout:none)]:relative [@supports(-webkit-touch-callout:none)]:[scrollbar-width:none]",
                isVertical
                  ? "[@supports(-webkit-touch-callout:none)]:overflow-x-scroll [@supports(-webkit-touch-callout:none)]:overscroll-x-none [@supports(-webkit-touch-callout:none)]:after:pointer-events-none [@supports(-webkit-touch-callout:none)]:after:absolute [@supports(-webkit-touch-callout:none)]:after:inset-0 [@supports(-webkit-touch-callout:none)]:after:w-[calc(100%+0.5px)] [@supports(-webkit-touch-callout:none)]:after:content-['']"
                  : "[@supports(-webkit-touch-callout:none)]:overflow-y-scroll [@supports(-webkit-touch-callout:none)]:overscroll-y-none [@supports(-webkit-touch-callout:none)]:after:pointer-events-none [@supports(-webkit-touch-callout:none)]:after:absolute [@supports(-webkit-touch-callout:none)]:after:inset-0 [@supports(-webkit-touch-callout:none)]:after:h-[calc(100%+1px)] [@supports(-webkit-touch-callout:none)]:after:content-['']",
              ],
              className,
            )}
            style={popupStyle}
            {...props}
          >
            {children}
          </BaseDialog.Popup>
        </div>

        {SafariNavColorDetectors}
      </BaseDialog.Viewport>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerContentInnerHeightDriven (bottom direction with multiple snap points)
 * -------------------------------------------------------------------------------------------------*/

function DrawerContentInnerHeightDriven({
  className,
  children,
  footerVariant = "default",
  initialFocus,
  finalFocus,
  ...props
}: DrawerContentProps) {
  const { snapPoints, dismissible, modal, sequentialSnap, repositionInputs } =
    useDrawerConfig();

  const { isDragging, dragProgress, snapProgress } = useDrawerScroll();

  const {
    activeSnapPoint,
    setActiveSnapPoint,
    contentSize,
    setContentSize,
    setIsDragging,
    setDragProgress,
    setSnapProgress,
    dismissViaSwipe,
    open,
    isAnimating,
    immediateClose,
    setImmediateClose,
  } = useDrawerControl();

  const activeSnapPointIndex = findSnapPointIndex(snapPoints, activeSnapPoint);

  const handleSnapPointChange = React.useCallback(
    (index: number) => {
      setActiveSnapPoint(getSnapPointValue(snapPoints, index));
    },
    [snapPoints, setActiveSnapPoint],
  );

  const { keyboardHeight, isKeyboardVisible } = useVirtualKeyboard({
    enabled: true,
  });

  const handleDismiss = React.useCallback(() => {
    dismissViaSwipe();
  }, [dismissViaSwipe]);

  const handleImmediateClose = React.useCallback(() => {
    setImmediateClose(true);
  }, [setImmediateClose]);

  const handleScrollProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setDragProgress(progress);
      }
    },
    [isAnimating, setDragProgress],
  );

  const handleSnapProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setSnapProgress(progress);
      }
    },
    [isAnimating, setSnapProgress],
  );

  const [sheetNaturalHeight, setSheetNaturalHeight] = React.useState<
    number | null
  >(null);

  // Dismiss buffer: 30% of the sheet height at the lowest snap point.
  // Places the dismiss snap target below the viewport edge so scroll-snap
  // momentum doesn't decelerate at the visible edge during swipe-to-dismiss.
  const dismissBuffer = React.useMemo(() => {
    if (!dismissible || !contentSize) return 0;
    const firstRatio = resolveSnapPointRatio(
      snapPoints[0],
      contentSize,
      sheetNaturalHeight ?? undefined,
    );
    return Math.round(contentSize * firstRatio * 0.3);
  }, [dismissible, contentSize, snapPoints, sheetNaturalHeight]);

  const {
    containerRef,
    sheetWrapperRef,
    isInitialized,
    isClosing,
    snapPosition,
    isTransformMode,
  } = useScrollSnapHeightDriven({
    snapPoints,
    activeSnapPointIndex,
    onSnapPointChange: handleSnapPointChange,
    onDismiss: handleDismiss,
    dismissible,
    open,
    // When CSS scroll-driven animations are available, skip JS progress callbacks
    // to eliminate React re-renders on every scroll frame during drag.
    // CSS handles backdrop opacity (via --sheet-timeline) and snap progress
    // (via drawer-snap-progress animation). JS fallback path still needs these.
    onScrollProgress: supportsScrollTimeline ? undefined : handleScrollProgress,
    onSnapProgress: supportsScrollTimeline ? undefined : handleSnapProgress,
    onImmediateClose: handleImmediateClose,
    isAnimating,
    onScrollingChange: setIsDragging,
    maxContentHeight: sheetNaturalHeight ?? undefined,
    dismissBuffer,
  });

  // Snap activation phases prevent Safari from resetting scrollTop to 0:
  //
  // Phase 1 (isInitialized=false): scrollSnapType "none", scrollTo sets position
  // Phase 2 (isSnapReady=true, isSnapSettled=false): scrollSnapType "y mandatory"
  //   kicks in, but --snap-point-align: none is set inline on the viewport.
  //   All non-initial snap elements inherit "none" → scroll-snap-align: none.
  //   The initial snap element has its own CSS rule (--snap-point-align: start)
  //   that overrides the inherited value. Safari MUST snap to it (only target).
  // Phase 3 (isSnapSettled=true): inline --snap-point-align removed, all snap
  //   points become active for user interaction.
  //
  // Phase 2→3 is triggered by the FIRST touch on the viewport, NOT a timeout.
  // Safari re-evaluates scroll-snap when snap targets change. Even if the scroll
  // is at a valid snap point, adding new targets can cause Safari to re-snap to
  // dismiss (position 0). By deferring to user touch:
  // - During active scrolling, scroll-snap doesn't re-snap (only on finger lift)
  // - By the time the user lifts their finger, all targets are active and the
  //   browser snaps to the nearest one naturally.
  const [isSnapReady, setIsSnapReady] = React.useState(false);
  React.useEffect(() => {
    if (isInitialized) {
      const id = requestAnimationFrame(() => {
        setIsSnapReady(true);
      });
      return () => cancelAnimationFrame(id);
    } else {
      setIsSnapReady(false);
    }
  }, [isInitialized]);

  // Snap protection: --snap-point-align: none on the viewport restricts
  // scroll-snap to only the initial snap element (which has its own CSS
  // rule overriding the inherited value). This prevents Safari from
  // re-snapping to dismiss (position 0) when scrollSnapType transitions
  // from "none" to "y mandatory".
  //
  // Managed via direct DOM manipulation (not React state) to avoid
  // re-render-induced frame gaps that cause visual flashes. The property
  // is set when isSnapReady activates and removed on the first scroll
  // event (user actively dragging → snap evaluation deferred to finger lift).
  React.useEffect(() => {
    if (!isSnapReady) return;
    const container = containerRef.current;
    if (!container) return;

    // Set protection directly on DOM
    container.style.setProperty("--snap-point-align", "none");

    const release = () => {
      // Remove protection synchronously during scroll gesture.
      // Safari defers snap evaluation until finger lift, so all targets
      // are safely active before re-evaluation.
      container.style.removeProperty("--snap-point-align");
    };

    container.addEventListener("scroll", release, { once: true, passive: true });
    return () => {
      container.style.removeProperty("--snap-point-align");
      container.removeEventListener("scroll", release);
    };
  }, [isSnapReady, containerRef]);

  // In height-driven mode, contentSize is the container height (max sheet height).
  // useLayoutEffect ensures contentSize is available before paint so snap elements
  // render with correct --snap positions on the first visible frame.
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const size = container.clientHeight;
      setContentSize(size);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, setContentSize]);

  const popupRef = React.useRef<HTMLDivElement>(null);

  // Measure the natural content height of the sheet (header + body content + footer).
  // Used to cap fractional snap points (e.g. snap point 1 = content height, not viewport).
  React.useLayoutEffect(() => {
    const wrapper = sheetWrapperRef.current;
    if (!wrapper) return;

    const measure = () => {
      const popup = wrapper.querySelector<HTMLElement>(
        '[data-slot="drawer-content"]',
      );
      if (!popup) return;

      let totalHeight = 0;
      for (const child of popup.children) {
        if (!(child instanceof HTMLElement)) continue;
        const style = getComputedStyle(child);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;

        if (child.dataset.slot === "drawer-body") {
          // Body may be overflow-constrained due to flex layout,
          // so measure inner content directly + body's own padding.
          // Use getBoundingClientRect for sub-pixel precision —
          // offsetHeight rounds to integers, losing up to 0.5px per element.
          const inner = child.firstElementChild as HTMLElement | null;
          const bodyPaddingTop = parseFloat(style.paddingTop) || 0;
          const bodyPaddingBottom = parseFloat(style.paddingBottom) || 0;
          const contentHeight = inner
            ? inner.getBoundingClientRect().height
            : child.scrollHeight;
          totalHeight +=
            contentHeight +
            bodyPaddingTop +
            bodyPaddingBottom +
            marginTop +
            marginBottom;
        } else {
          // getBoundingClientRect includes padding+border (like offsetHeight)
          // but with sub-pixel precision instead of integer rounding.
          totalHeight +=
            child.getBoundingClientRect().height + marginTop + marginBottom;
        }
      }

      // Math.ceil ensures the snap point is never under the actual content
      // height due to accumulated floating-point imprecision.
      setSheetNaturalHeight(totalHeight > 0 ? Math.ceil(totalHeight) : null);
    };

    measure();
    const observer = new ResizeObserver(measure);
    const popup = wrapper.querySelector('[data-slot="drawer-content"]');
    if (popup) observer.observe(popup);
    const body = popup?.querySelector('[data-slot="drawer-body"]');
    const bodyContent = body?.firstElementChild;
    if (bodyContent) observer.observe(bodyContent);
    return () => observer.disconnect();
  }, [sheetWrapperRef]);

  // Measure the combined height of non-body children (handle + header + footer).
  // Sets two CSS variables on the wrapper for the split footer animations:
  // --non-body-height: px value used in the clamped/linear translateY keyframes
  // --non-body-ratio: unitless ratio (nonBodyHeight / containerHeight) used in
  //   animation-range to compute the crossover scroll position between the
  //   clamped and linear footer animations.
  React.useLayoutEffect(() => {
    const wrapper = sheetWrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    const measure = () => {
      const popup = wrapper.querySelector<HTMLElement>(
        '[data-slot="drawer-content"]',
      );
      if (!popup) return;

      let nonBodyHeight = 0;
      for (const child of popup.children) {
        if (!(child instanceof HTMLElement)) continue;
        if (child.dataset.slot === "drawer-body") continue;
        nonBodyHeight += child.getBoundingClientRect().height;
      }
      wrapper.style.setProperty("--non-body-height", `${nonBodyHeight}px`);

      const containerHeight = container.clientHeight;
      const ratio =
        containerHeight > 0 ? nonBodyHeight / containerHeight : 0;
      wrapper.style.setProperty("--non-body-ratio", String(ratio));
    };

    measure();
    const observer = new ResizeObserver(measure);
    const popup = wrapper.querySelector('[data-slot="drawer-content"]');
    if (popup) observer.observe(popup);
    // Also observe container so ratio updates on viewport resize
    observer.observe(container);
    return () => {
      observer.disconnect();
      wrapper.style.removeProperty("--non-body-height");
      wrapper.style.removeProperty("--non-body-ratio");
    };
  }, [sheetWrapperRef, containerRef]);

  // Compute snap element CSS values
  const snapElements = React.useMemo(() => {
    const containerHeight = contentSize ?? 0;
    return snapPoints.map((sp, i) => ({
      snapPercent: snapPointToSnapPercent(
        sp,
        containerHeight,
        sheetNaturalHeight ?? undefined,
      ),
      isInitial: i === activeSnapPointIndex,
    }));
  }, [snapPoints, activeSnapPointIndex, contentSize, sheetNaturalHeight]);

  // Sync dragProgress after enter animation completes.
  // During enter, isAnimating=true prevents scroll progress from updating dragProgress,
  // so it stays at 1 (the initial "closed" value). Once animation ends, read the
  // current scroll position to set the correct progress for backdrop opacity.
  React.useEffect(() => {
    if (!isAnimating && isInitialized) {
      const container = containerRef.current;
      if (!container) return;
      const progress = calculateHeightDrivenScrollProgress(
        container.scrollTop,
        container.scrollHeight,
        container.clientHeight,
        dismissBuffer,
      );
      setDragProgress(progress);
    }
  }, [
    isAnimating,
    isInitialized,
    containerRef,
    dismissBuffer,
    setDragProgress,
  ]);

  // Backdrop styles
  const snapPointRatio = React.useMemo(() => {
    const containerHeight = contentSize ?? 0;
    return resolveSnapPointRatio(
      activeSnapPoint,
      containerHeight,
      sheetNaturalHeight ?? undefined,
    );
  }, [activeSnapPoint, contentSize, sheetNaturalHeight]);

  const targetBackdropOpacity = snapPointRatio;

  const firstSnapRatio = React.useMemo(() => {
    const containerHeight = contentSize ?? 0;
    if (containerHeight <= 0)
      return typeof snapPoints[0] === "number" ? snapPoints[0] : 1;
    return resolveSnapPointRatio(
      snapPoints[0],
      containerHeight,
      sheetNaturalHeight ?? undefined,
    );
  }, [snapPoints, contentSize, sheetNaturalHeight]);

  const lastSnapRatio = React.useMemo(() => {
    const containerHeight = contentSize ?? 0;
    if (containerHeight <= 0)
      return typeof snapPoints[snapPoints.length - 1] === "number"
        ? snapPoints[snapPoints.length - 1]
        : 1;
    return resolveSnapPointRatio(
      snapPoints[snapPoints.length - 1],
      containerHeight,
      sheetNaturalHeight ?? undefined,
    );
  }, [snapPoints, contentSize, sheetNaturalHeight]);

  // CSS scroll-driven animation gate: only active when initialized, not animating,
  // and not in immediate-close mode. Eliminates React re-renders during drag by
  // letting CSS handle backdrop opacity and snap progress via scroll timeline.
  const useScrollDrivenAnimation =
    supportsScrollTimeline && isInitialized && !isAnimating && !immediateClose;

  // Viewport style for height-driven mode
  const sheetMaxHeight = repositionInputs
    ? `calc(100dvh - 24px - env(keyboard-inset-height, ${keyboardHeight}px))`
    : "calc(100dvh - 24px)";

  // Scroll-driven snap progress animation goes on the timeline-scope wrapper
  // (NOT the viewport) so it doesn't replace the CSS drawer-initial-snap
  // animation on the viewport. drawer-initial-snap sets --snap-point-align: none
  // to disable non-initial snap targets during opening. If an inline animationName
  // is set on the viewport, it kills drawer-initial-snap, removing that protection.
  // When scroll-snap then activates, all snap targets (including dismiss at 0)
  // become valid and Safari may snap to dismiss, resetting scrollTop to 0.
  // Moving the animation to the wrapper avoids this conflict entirely.
  // --drawer-snap-progress inherits (via @property), so setting it on the
  // wrapper makes it available to all descendants.
  const timelineScopeStyle = React.useMemo<React.CSSProperties | undefined>(
    () =>
      supportsScrollTimeline
        ? {
            timelineScope: "--sheet-timeline",
            ...(useScrollDrivenAnimation
              ? {
                  animationName: "drawer-snap-progress",
                  animationDuration: "auto",
                  animationTimingFunction: "linear",
                  animationFillMode: "both",
                  animationTimeline: "--sheet-timeline",
                  animationRange: `calc(${dismissBuffer}px + ${firstSnapRatio} * (100% - ${dismissBuffer}px)) calc(${dismissBuffer}px + ${lastSnapRatio} * (100% - ${dismissBuffer}px))`,
                }
              : undefined),
          }
        : undefined,
    [
      useScrollDrivenAnimation,
      dismissBuffer,
      firstSnapRatio,
      lastSnapRatio,
    ],
  );

  const viewportStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--sheet-max-height": sheetMaxHeight,
      "--dismiss-buffer": `${dismissBuffer}px`,
      "--last-snap-ratio": lastSnapRatio,
      ...(repositionInputs && {
        "--keyboard-height": `${keyboardHeight}px`,
      }),
      // Disable scroll-snap until one frame after initialization. Two-phase
      // protection prevents Safari from snapping to the dismiss zone:
      // Phase 1 (isInitialized=false): scrollSnapType "none" lets init and
      //   correction effects set scrollTop freely without snap interference.
      // Phase 2 (isInitialized=true, isSnapReady=false): one-frame delay
      //   lets the programmatic scrollTo settle before snap enforcement.
      //   By the time isSnapReady activates, the CSS drawer-initial-snap
      //   animation is running, limiting valid snap targets to only the
      //   initial element.
      scrollSnapType: isSnapReady ? "y mandatory" : "none",
      scrollBehavior: isSnapReady ? "smooth" : "auto",
      // Note: --snap-point-align protection is managed via direct DOM manipulation
      // in the useEffect above (not React state) to avoid re-render flash.
      // JS fallback for --drawer-snap-progress when scroll-driven animations
      // are not available.
      ...(!useScrollDrivenAnimation && {
        "--drawer-snap-progress": snapProgress,
      }),
    }),
    [
      sheetMaxHeight,
      dismissBuffer,
      repositionInputs,
      keyboardHeight,
      isSnapReady,
      useScrollDrivenAnimation,
      lastSnapRatio,
      snapProgress,
    ],
  );

  // In height-driven mode, the scroll position IS the animation.
  // No popup CSS transition needed — scroll-driven animation handles height.
  // We use isInitialized (not isAnimating) to gate user interaction,
  // because the popup has no CSS transition — Base UI fires
  // onOpenChangeComplete immediately, making isAnimating short-lived.

  return (
    <div
      data-slot="drawer-timeline-scope"
      style={timelineScopeStyle}
    >
      {modal === true && (
        <BaseDialog.Backdrop
          data-slot="drawer-overlay"
          className={cn(
            // Use fixed positioning so backdrop covers full screen
            // regardless of parent positioning context
            "fixed inset-0 z-50 bg-black/35",
            "transform-[translateZ(0)] will-change-[opacity]",
            isClosing ? "pointer-events-none" : "pointer-events-auto",
            "touch-none",
            // Disable transitions when CSS scroll-driven animation is active or
            // during drag/immediateClose to prevent interference.
            immediateClose ||
              useScrollDrivenAnimation ||
              (isDragging && !isAnimating)
              ? "transition-none"
              : "transition-opacity duration-300 ease-[cubic-bezier(0,0,0.58,1)]",
            "data-starting-style:opacity-0!",
            "data-ending-style:animate-[drawer-backdrop-exit_300ms_cubic-bezier(0,0,0.58,1)_forwards]",
            // Height-driven backdrop strategy:
            // 1. CSS scroll-driven animation (Chrome 115+): backdrop opacity driven
            //    by --sheet-timeline, zero JS/React overhead during drag.
            // 2. JS fallback: dragProgress state drives opacity via CSS variable.
            // When immediateClose (swipe dismiss), force opacity-0 to prevent a flash.
            immediateClose
              ? "opacity-0"
              : useScrollDrivenAnimation
                ? "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-timeline:--sheet-timeline] [animation-timing-function:linear]"
                : isInitialized &&
                    !isAnimating &&
                    dismissible &&
                    dragProgress < 1
                  ? `opacity-(--drawer-backdrop-dynamic-opacity)`
                  : `opacity-(--drawer-backdrop-static-opacity)`,
          )}
          style={
            {
              ...(useScrollDrivenAnimation && {
                animationRange: `${dismissBuffer}px calc(${dismissBuffer}px + ${lastSnapRatio} * (100% - ${dismissBuffer}px))`,
              }),
              "--drawer-backdrop-dynamic-opacity": 1 - dragProgress,
              "--drawer-backdrop-static-opacity": targetBackdropOpacity,
            } as React.CSSProperties
          }
        />
      )}

      <BaseDialog.Viewport
        ref={containerRef}
        data-slot="drawer-viewport"
        data-direction="bottom"
        data-drawer-mode="height-driven"
        data-dismissible={dismissible || undefined}
        data-sheet-snap-position={snapPosition ?? undefined}
        data-scrolling={isTransformMode || undefined}
        data-keyboard-visible={
          repositionInputs && isKeyboardVisible ? "true" : undefined
        }
        className={cn(
          "group/drawer",
          "fixed inset-x-0 z-50 outline-hidden",
          // Height-driven mode: explicit height matching pure-web-bottom-sheet.
          // The scroll container uses height: var(--sheet-max-height) so that
          // clientHeight = max scroll range, making snap % = sheet height %.
          "bottom-[env(keyboard-inset-height,var(--keyboard-height,0))]",
          "h-(--sheet-max-height)",
          "contain-strict",
          // Viewport uses pointer-events-auto in height-driven mode so iOS Safari
          // propagates touch-initiated scrolling from non-scrollable children
          // (header, handle) to the viewport scroll container. With pointer-events-none,
          // Safari won't initiate scrolling on the viewport for touches originating
          // from children — only the body works (via its own overflow-y: auto and
          // scroll chaining). Dismiss-on-outside-click still works via Base UI's
          // click-outside detection on the popup element.
          "pointer-events-auto",
          "bg-transparent opacity-100! [&[data-ending-style]]:opacity-100! [&[data-starting-style]]:opacity-100!",
          "[scrollbar-width:none_!important] [&::-webkit-scrollbar]:hidden!",
          // Always overflow-y: scroll — scroll-driven animation needs scrollable container.
          "overflow-x-hidden overflow-y-scroll overscroll-y-none",
          "motion-reduce:[scroll-behavior:auto]",
          "will-change-scroll",
        )}
        style={viewportStyle}
      >
        {/* Dismiss snap target — at scroll position 0 (before buffer) */}
        {dismissible && (
          <div data-slot="drawer-dismiss-snap" aria-hidden="true" />
        )}

        {/* Dismiss buffer spacer — dead zone between dismiss snap and first snap point */}
        {dismissible && (
          <div data-slot="drawer-dismiss-buffer" aria-hidden="true" />
        )}

        {/* Snap elements positioned via CSS --snap */}
        {snapElements.map((snap, i) => (
          <div
            key={i}
            data-slot="drawer-snap-element"
            data-snap={String(snapPoints.length - 1 - i)}
            data-initial={snap.isInitial || undefined}
            style={
              {
                "--snap": snap.snapPercent,
                scrollSnapStop: sequentialSnap ? "always" : undefined,
              } as React.CSSProperties
            }
            aria-hidden="true"
          />
        ))}

        {/* Sentinel for IntersectionObserver snap detection */}
        <div data-slot="drawer-sentinel" data-snap="1" aria-hidden="true" />

        {/* Bottom spacer: creates scroll range below the sheet */}
        <div
          data-slot="drawer-snap-bottom"
          style={
            { "--sheet-max-height": sheetMaxHeight } as React.CSSProperties
          }
          aria-hidden="true"
        />

        {/* Sentinel for top position */}
        <div data-slot="drawer-sentinel" data-snap="0" aria-hidden="true" />

        {/* Sheet wrapper: sticky bottom, anchors the sheet */}
        <div ref={sheetWrapperRef} data-slot="drawer-sheet-wrapper">
          {/* Sheet panel: carries the scroll-driven height animation.
              Separate from the Popup so that scroll-driven animationend
              doesn't block Base UI's onOpenChangeComplete. */}
          <div data-slot="drawer-sheet-panel" className="rounded-t-xl">
            <BaseDialog.Popup
              ref={popupRef}
              data-slot="drawer-content"
              data-footer-variant={footerVariant}
              initialFocus={initialFocus ?? popupRef}
              finalFocus={finalFocus}
              className={cn(
                "bg-popover text-popover-foreground",
                "rounded-t-xl",
                // Same slide transition as regular drawer: translateY to slide in/out.
                // The sheet-panel has overflow:clip so the popup clips as it slides.
                // --drawer-offset is 100% because the panel height IS the snap height,
                // so sliding by 100% of its own height always matches the snap distance.
                "transition-transform duration-300 ease-[cubic-bezier(0_0_0.58_1)] will-change-transform",
                "motion-reduce:transition-none",
                "data-starting-style:translate-y-(--drawer-offset)",
                "data-ending-style:translate-y-(--drawer-offset)",
                // When dismissed via swipe, remove CSS transition so Base UI fires
                // onOpenChangeComplete immediately (no 300ms wait for transitionend).
                immediateClose && "transition-none",
                className,
              )}
              style={{ "--drawer-offset": "100%" } as React.CSSProperties}
              {...props}
            >
              {children}
            </BaseDialog.Popup>
          </div>
        </div>

        {SafariNavColorDetectors}
      </BaseDialog.Viewport>

      {/* DEBUG: Temporary overlay to diagnose iOS Safari issue */}
      <DrawerDebugOverlay
        containerRef={containerRef}
        isInitialized={isInitialized}
        isSnapReady={isSnapReady}
        isAnimating={isAnimating}
        dismissBuffer={dismissBuffer}
        snapPosition={snapPosition}
        isClosing={isClosing}
      />
    </div>
  );
}

function DrawerDebugOverlay({
  containerRef,
  isInitialized,
  isSnapReady,
  isAnimating,
  dismissBuffer,
  snapPosition,
  isClosing,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isInitialized: boolean;
  isSnapReady: boolean;
  isAnimating: boolean;
  dismissBuffer: number;
  snapPosition: string | null;
  isClosing: boolean;
}) {
  const [info, setInfo] = React.useState("");

  React.useEffect(() => {
    let id: number;
    const poll = () => {
      const c = containerRef.current;
      const scrollTop = c?.scrollTop ?? -1;
      const scrollHeight = c?.scrollHeight ?? -1;
      const clientHeight = c?.clientHeight ?? -1;
      const debugTarget = c?.dataset.debugTarget ?? "?";
      const debugAfterSet = c?.dataset.debugAfterSet ?? "?";
      const debugRetry = c?.dataset.debugRetry ?? "0";
      setInfo(
        `sT:${Math.round(scrollTop)} sH:${scrollHeight} cH:${clientHeight} db:${dismissBuffer}\ntgt:${debugTarget} afterSet:${debugAfterSet} retry:${debugRetry}\nsnap:${snapPosition ?? "?"} init:${isInitialized ? 1 : 0} ready:${isSnapReady ? 1 : 0} anim:${isAnimating ? 1 : 0} closing:${isClosing ? 1 : 0}`,
      );
      id = requestAnimationFrame(poll);
    };
    id = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(id);
  }, [
    containerRef,
    isInitialized,
    isSnapReady,
    isAnimating,
    dismissBuffer,
    snapPosition,
    isClosing,
  ]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: "10px",
        fontFamily: "monospace",
        padding: "4px 6px",
        pointerEvents: "none",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {info}
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * DrawerHandle
 * -------------------------------------------------------------------------------------------------*/

interface DrawerHandleProps extends Omit<
  useRender.ComponentProps<"button">,
  "children"
> {
  hidden?: boolean;
  preventClose?: boolean;
}

function DrawerHandle({
  className,
  hidden,
  preventClose = false,
  onClick,
  render,
  ...props
}: DrawerHandleProps) {
  const { isVertical } = useDrawerConfig();
  const { onOpenChange, isAnimating } = useDrawerControl();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (isAnimating || preventClose) return;
      onOpenChange(false);
    },
    [onClick, onOpenChange, isAnimating, preventClose],
  );

  const defaultProps = {
    "data-slot": "drawer-handle" as const,
    type: "button" as const,
    "aria-label": preventClose ? "Drawer handle" : "Close drawer",
    onClick: handleClick,
    className: cn(
      "appearance-none border-0 bg-transparent p-0",
      "focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "bg-muted-foreground/30 shrink-0 cursor-pointer rounded-full",
      isVertical ? "mx-auto my-3 h-1.5 w-12" : "mx-3 my-auto h-12 w-1.5",
      "hover:bg-muted-foreground/50 transition-colors",
      className,
    ),
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });

  if (hidden) return null;

  return (
    <div
      className="flex items-center justify-center"
      data-slot="drawer-handle-wrapper"
    >
      {element}
    </div>
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
        "not-has-[+[data-slot=drawer-body]]:has-[+[data-slot=drawer-footer]]:pb-1",
        "not-has-[+[data-slot=drawer-body]]:not-has-[+[data-slot=drawer-footer]]:pb-5",
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
        // z-1 + translateZ(0): stays above DrawerBody(z-0); Safari-only GPU layer
        // promotion fixes sticky/transform compositing flash during enter animation
        "bg-popover z-1 mt-auto flex flex-col gap-2 px-5 pt-3 pb-5",
        "[@supports(-webkit-touch-callout:none)]:transform-[translateZ(0)]",
        "first:pt-5",
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
      className={cn(
        "text-foreground text-lg font-semibold text-balance",
        className,
      )}
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
      className={cn("text-muted-foreground text-sm text-pretty", className)}
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
  const { isVertical, direction, snapPoints } = useDrawerConfig();

  // In height-driven mode (bottom with multiple snaps), CSS handles overflow-y: auto
  // directly on drawer-body. No ScrollArea wrapper needed — the body scrolls natively.
  if (direction === "bottom" && snapPoints.length > 1) {
    return (
      <div
        data-slot="drawer-body"
        className={cn(
          "relative z-0 min-h-0 flex-1",
          "first:pt-4",
          "not-has-[+[data-slot=drawer-footer]]:pb-4",
          "in-data-[footer-variant=inset]:has-[+[data-slot=drawer-footer]]:pb-4",
        )}
      >
        <div className={cn("px-5 py-1", className)} {...props}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="drawer-body"
      className={cn(
        // z-0: stays below sticky footer during iOS Safari enter animation
        "relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden",
        "first:pt-4",
        "not-has-[+[data-slot=drawer-footer]]:pb-4",
        "in-data-[footer-variant=inset]:has-[+[data-slot=drawer-footer]]:pb-4",
      )}
    >
      <ScrollArea
        className="flex-1"
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
  useDrawerConfig,
  useDrawerAnimation,
  useDrawerScroll,
  useDrawerControl,
  createDrawerHandle,
};

export type { DrawerRenderProps, DrawerVariant };

export { supportsScrollTimeline, supportsScrollState };
