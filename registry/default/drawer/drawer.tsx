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

export type { SnapPoint, DrawerDirection };

const createDrawerHandle = BaseDialog.createHandle;

/* -------------------------------------------------------------------------------------------------
 * CVA Variants
 * -------------------------------------------------------------------------------------------------*/

const drawerContentVariants = cva(
  [
    "bg-popover text-popover-foreground flex flex-col",
    "relative ",
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

interface DrawerAnimationContextValue {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragProgress: number;
  setDragProgress: (progress: number) => void;
  snapProgress: number;
  setSnapProgress: (progress: number) => void;
  activeSnapPoint: SnapPoint;
  setActiveSnapPoint: (snapPoint: SnapPoint) => void;
  open: boolean;
  onOpenChange: (open: boolean, eventDetails?: { reason?: string }) => void;
  contentSize: number | null;
  setContentSize: (size: number | null) => void;
  isAnimating: boolean;
  immediateClose: boolean;
  setImmediateClose: (value: boolean) => void;
}

const DrawerConfigContext =
  React.createContext<DrawerConfigContextValue | null>(null);
const DrawerAnimationContext =
  React.createContext<DrawerAnimationContextValue | null>(null);

function useDrawerConfig() {
  const context = React.useContext(DrawerConfigContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

function useDrawerAnimation() {
  const context = React.useContext(DrawerAnimationContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

function useDrawer() {
  return { ...useDrawerConfig(), ...useDrawerAnimation() };
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
  "children"
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

  const handleOpenChangeComplete = React.useCallback(() => {
    setIsAnimating(false);
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, eventDetails?: { reason?: string }) => {
      // Prevent closing while scrolling, but allow explicit swipe dismiss
      if (!nextOpen && isDragging && eventDetails?.reason !== "swipe-dismiss") {
        return;
      }

      setIsAnimating(true);

      if (!isOpenControlled) {
        setUncontrolledOpen(nextOpen);
      }
      controlledOnOpenChange?.(nextOpen, eventDetails as never);

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
      isDragging,
      isOpenControlled,
      controlledOnOpenChange,
      snapPoints,
      isSnapPointControlled,
      onActiveSnapPointChange,
      defaultSnapPointIndex,
    ],
  );

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

  const animationValue = React.useMemo(
    () => ({
      isDragging,
      setIsDragging,
      dragProgress,
      setDragProgress,
      snapProgress,
      setSnapProgress,
      activeSnapPoint: activeSnapPointValue,
      setActiveSnapPoint,
      open,
      onOpenChange: handleOpenChange,
      contentSize,
      setContentSize,
      isAnimating,
      immediateClose,
      setImmediateClose,
    }),
    [
      isDragging,
      dragProgress,
      snapProgress,
      activeSnapPointValue,
      setActiveSnapPoint,
      open,
      handleOpenChange,
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
      <DrawerAnimationContext.Provider value={animationValue}>
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
      </DrawerAnimationContext.Provider>
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
  const { onOpenChange, isAnimating } = useDrawerAnimation();

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
    onOpenChange(false, { reason: "swipe-dismiss" });
  }, [onOpenChange]);

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

  const observerRef = React.useRef<ResizeObserver | null>(null);
  const floatingMargin = variant === "floating" ? 16 : 0;

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

  React.useEffect(() => () => observerRef.current?.disconnect(), []);

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
            ref={measureRef}
            data-slot="drawer-content"
            data-footer-variant={footerVariant}
            initialFocus={initialFocus}
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
 * DrawerHandle
 * -------------------------------------------------------------------------------------------------*/

interface DrawerHandleProps extends Omit<
  React.ComponentProps<"button">,
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
  ...props
}: DrawerHandleProps) {
  const { isVertical } = useDrawerConfig();
  const { onOpenChange, isAnimating } = useDrawerAnimation();

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
      // tabIndex={-1} prevents Base UI from auto-focusing the handle on dialog open.
      // Without this, focus-induced scrolling overrides the scroll position set by
      // performInitialScroll, causing snap-point drawers to open at the wrong position.
      tabIndex={-1}
      data-slot="drawer-handle"
      aria-label="Close drawer"
      onClick={handleClick}
      className={cn(
        "appearance-none border-0 bg-transparent p-0",
        "focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "bg-muted-foreground/30 shrink-0 cursor-pointer rounded-full",
        isVertical ? "mx-auto my-3 h-1.5 w-12" : "mx-3 my-auto h-12 w-1.5",
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
        "bg-popover mt-auto flex flex-col gap-2 px-5 pt-3 pb-5",
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
  const { isVertical } = useDrawerConfig();

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
  createDrawerHandle,
};

export type { DrawerRenderProps, DrawerVariant };

export { supportsScrollTimeline, supportsScrollState };
