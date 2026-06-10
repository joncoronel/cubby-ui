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
import { Button } from "@/registry/default/button/button";
import {
  INNER_EDGE_FROM_ATTACH_SIDE,
  solidSurface,
  flushSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import {
  ScrollArea,
  type ScrollAreaProps,
} from "@/registry/default/scroll-area/scroll-area";

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

import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
export type { SnapPoint, DrawerDirection };

const createDrawerHandle = BaseDialog.createHandle;

const drawerContentVariants = cva(
  [
    "text-popover-foreground flex flex-col",
    "relative",
    "ease-[cubic-bezier(.32,.72,0,1)] transition-[transform,scale,translate] duration-400  will-change-transform",
    "motion-reduce:transition-none",
    // Nested drawer support: scale down parent when child opens (interpolated during drag)
    "scale-[calc(1-0.05*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))]",
    // Disable transitions on parent while child is being dragged
    "data-[nested-dragging]:transition-none",
    // Nested drawer support: overlay dim effect (using before: to avoid conflict with Safari ::after touch fix AND the elevation rim's ::after)
    "before:pointer-events-none before:absolute before:inset-0 before:z-50 before:hidden before:rounded-[inherit] before:bg-black/15 before:opacity-0 before:transition-[opacity,display] before:transition-discrete before:duration-300",
    "data-nested-dialog-open:before:block data-nested-dialog-open:before:opacity-100",
    "starting:data-nested-dialog-open:before:opacity-0",
  ],
  {
    variants: {
      variant: {
        // `default` no longer needs its own shadow/ring — the elevation system provides that
        default: "",
        floating: ["m-4 overflow-clip rounded-2xl"],
      },
      direction: {
        bottom: "",
        top: "",
        right: "",
        left: "",
      },
    },
    compoundVariants: [
      // Default variant - direction-specific sizing, rounding, and nesting origin/offset
      {
        variant: "default",
        direction: "bottom",
        class:
          "origin-bottom mx-auto max-h-[95dvh] w-full max-w-full rounded-t-2xl -translate-y-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:translate-y-[var(--drawer-offset)] [&[data-ending-style]]:translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "default",
        direction: "top",
        class:
          "origin-top mx-auto max-h-[95dvh] w-full max-w-full rounded-b-2xl translate-y-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:-translate-y-[var(--drawer-offset)] [&[data-ending-style]]:-translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "default",
        direction: "right",
        class:
          "origin-right max-w-screen w-screen sm:max-w-md -translate-x-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:translate-x-[var(--drawer-offset)] [&[data-ending-style]]:translate-x-[var(--drawer-offset)]",
      },
      {
        variant: "default",
        direction: "left",
        class:
          "origin-left max-w-screen w-screen sm:max-w-md translate-x-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:-translate-x-[var(--drawer-offset)] [&[data-ending-style]]:-translate-x-[var(--drawer-offset)]",
      },
      // Floating variant - direction-specific sizing, transforms, and nesting origin/offset
      {
        variant: "floating",
        direction: "bottom",
        class:
          "origin-bottom mx-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] -translate-y-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:translate-y-[var(--drawer-offset)] [&[data-ending-style]]:translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "floating",
        direction: "top",
        class:
          "origin-top mx-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] translate-y-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:-translate-y-[var(--drawer-offset)] [&[data-ending-style]]:-translate-y-[var(--drawer-offset)]",
      },
      {
        variant: "floating",
        direction: "right",
        class:
          "origin-right h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-md -translate-x-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:translate-x-[var(--drawer-offset)] [&[data-ending-style]]:translate-x-[var(--drawer-offset)]",
      },
      {
        variant: "floating",
        direction: "left",
        class:
          "origin-left h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-md translate-x-[calc(1.5rem*max(0,var(--nested-dialogs,0)-var(--nested-drag-progress,0)))] [&[data-starting-style]]:-translate-x-[var(--drawer-offset)] [&[data-ending-style]]:-translate-x-[var(--drawer-offset)]",
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

const backdropAnimationStyles: Record<DrawerDirection, string> = {
  bottom:
    "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  right:
    "fill-mode-[both] [animation-name:drawer-backdrop-fade] [animation-range:entry_0%_entry_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  top: "fill-mode-[both] direction-[reverse] [animation-name:drawer-backdrop-fade] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
  left: "fill-mode-[both] direction-[reverse] [animation-name:drawer-backdrop-fade] [animation-range:exit_0%_exit_100%] [animation-timeline:--drawer-panel] [animation-timing-function:linear]",
};

// Allows child drawers to propagate drag progress to parent for smooth stacking effects.
interface DrawerNestingContextValue {
  /** Set the child's drag progress (0 = open, 1 = closed) on the parent popup */
  setNestedDragProgress: (progress: number) => void;
  /** Toggle transition-disabling attribute on the parent popup */
  setNestedDragging: (dragging: boolean) => void;
  /** Remove the drag progress CSS variable from the parent popup */
  clearNestedDragProgress: () => void;
}

const DrawerNestingContext =
  React.createContext<DrawerNestingContextValue | null>(null);

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

interface DrawerScrollContextValue {
  isDragging: boolean;
  dragProgress: number;
  snapProgress: number;
}

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

/** Subscribes to high-frequency scroll/drag state — re-renders during drag. */
function useDrawerScroll() {
  const context = React.useContext(DrawerScrollContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

/** Low-frequency control state and stable setters — does not re-render during drag. */
function useDrawerControl() {
  const context = React.useContext(DrawerControlContext);
  if (!context) {
    throw new Error("Drawer components must be used within a <Drawer />");
  }
  return context;
}

/** Combines scroll + control contexts. For fewer re-renders use `useDrawerControl()` or `useDrawerScroll()`. */
function useDrawerAnimation() {
  return { ...useDrawerScroll(), ...useDrawerControl() };
}

/** All drawer context values. For fewer re-renders use `useDrawerConfig`, `useDrawerControl`, or `useDrawerScroll`. */
function useDrawer() {
  return { ...useDrawerConfig(), ...useDrawerScroll(), ...useDrawerControl() };
}

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

  // Base UI doesn't call onOpenChange for external prop changes, so handleOpenChange(true)
  // never fires — set isAnimating here to block dismiss gestures during the enter transition.
  const prevOpenRef = React.useRef(open);
  React.useLayoutEffect(() => {
    if (open && !prevOpenRef.current) {
      setIsAnimating(true);
      setImmediateClose(false);
    }
    prevOpenRef.current = open;
  }, [open]);

  const { isVertical } = DIRECTION_CONFIG[direction];

  const isDraggingRef = React.useRef(false);
  const swipeDismissRef = React.useRef(false);
  React.useLayoutEffect(() => {
    isDraggingRef.current = isDragging;
  });

  const handleOpenChangeComplete = React.useCallback(() => {
    setIsAnimating(false);
    setImmediateClose(false);
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

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof BaseDialog.Trigger>) {
  return <BaseDialog.Trigger data-slot="drawer-trigger" {...props} />;
}

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

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot="drawer-portal" {...props} />;
}

interface DrawerContentProps extends BaseDialog.Popup.Props {
  footerVariant?: "default" | "inset";
  showCloseButton?: boolean;
  /** Surface elevation level for the drawer bg (1-8). Defaults to 5 — the dialog/sheet/drawer tier. */
  level?: SurfaceLevel;
  /** Shadow weight (1-8). Pinned to 5 by default. */
  shadowLevel?: SurfaceLevel;
}

function DrawerContent({
  initialFocus,
  finalFocus,
  footerVariant = "default",
  showCloseButton,
  level = 5,
  shadowLevel = 5,
  ...props
}: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerContentInner
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        footerVariant={footerVariant}
        showCloseButton={showCloseButton}
        level={level}
        shadowLevel={shadowLevel}
        {...props}
      />
    </DrawerPortal>
  );
}

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

function DrawerContentInner({
  className,
  children,
  footerVariant = "default",
  showCloseButton = false,
  initialFocus,
  finalFocus,
  level = 5,
  shadowLevel = 5,
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

  const visualViewportHeight = useVisualViewportHeight({
    enabled: !isVertical && modal !== true,
  });

  const handleDismiss = React.useCallback(() => {
    dismissViaSwipe();
  }, [dismissViaSwipe]);

  const handleImmediateClose = React.useCallback(() => {
    setImmediateClose(true);
  }, [setImmediateClose]);

  const parentNesting = React.useContext(DrawerNestingContext);

  // Skip updates during enter/exit animations — let CSS control the backdrop then.
  const handleScrollProgress = React.useCallback(
    (progress: number) => {
      if (!isAnimating) {
        setDragProgress(progress);
        // Update parent's CSS variable for interpolated nesting scale/translate
        parentNesting?.setNestedDragProgress(progress);
      }
    },
    [isAnimating, setDragProgress, parentNesting],
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

  React.useLayoutEffect(() => {
    parentNesting?.setNestedDragging(isDragging);
  }, [isDragging, parentNesting]);

  React.useLayoutEffect(() => {
    if (!open) {
      parentNesting?.clearNestedDragProgress();
      parentNesting?.setNestedDragging(false);
    }
  }, [open, parentNesting]);

  const floatingMargin = variant === "floating" ? 16 : 0;
  const { mergedRef, popupRef } = useContentMeasurement(
    isVertical,
    floatingMargin,
    setContentSize,
  );

  const nestingValue = React.useMemo<DrawerNestingContextValue>(
    () => ({
      setNestedDragProgress(progress: number) {
        popupRef.current?.style.setProperty(
          "--nested-drag-progress",
          String(progress),
        );
      },
      setNestedDragging(dragging: boolean) {
        if (!popupRef.current) return;
        if (dragging) {
          popupRef.current.dataset.nestedDragging = "";
        } else {
          delete popupRef.current.dataset.nestedDragging;
        }
      },
      clearNestedDragProgress() {
        popupRef.current?.style.removeProperty("--nested-drag-progress");
      },
    }),
    [popupRef],
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
    <DrawerNestingContext.Provider value={nestingValue}>
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
              "absolute inset-0 z-50 bg-black/32 backdrop-blur-sm",
              "[transform:translateZ(0)] will-change-[opacity]",
              isClosing ? "pointer-events-none" : "pointer-events-auto",
              "touch-none",
              immediateClose || (isDragging && !isAnimating)
                ? "transition-none"
                : "transition-opacity duration-300",
              "[&[data-starting-style]]:opacity-0!",
              // Exit animation overrides scroll-driven animation — transitions can't interpolate from animation-held values.
              "data-ending-style:animate-[drawer-backdrop-exit_300ms_cubic-bezier(.32,.72,0,1)_forwards]",
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
            "[scrollbar-width:none]! [&::-webkit-scrollbar]:hidden!",
            isAnimating || isClosing
              ? "touch-none overflow-hidden"
              : isVertical
                ? "touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-none"
                : "touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-none",
            isVertical ? "touch-pan-y" : "touch-pan-x",
            "motion-reduce:[scroll-behavior:auto]",
            "has-data-nested-dialog-open:touch-none has-data-nested-dialog-open:overflow-hidden",
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
              data-level={level}
              initialFocus={initialFocus ?? popupRef}
              finalFocus={finalFocus}
              className={cn(
                drawerContentVariants({ variant, direction }),
                // Floating: full 4-edge rim. Flush (`default`): single-edge rim on the
                // inner-facing side only — other edges would show a 1px line at the viewport boundary.
                variant === "floating"
                  ? solidSurface(level, shadowLevel)
                  : flushSurface(level, INNER_EDGE_FROM_ATTACH_SIDE[direction]),
                open && !isInitialized && "opacity-0",
                isAnimating || isClosing
                  ? "pointer-events-none"
                  : "pointer-events-auto",
                immediateClose && "transition-none",
                "data-nested-dialog-open:overflow-hidden",
                // Safari iOS touch fix: 1px cross-axis overflow (WebKit bug #183870).
                // Co-exists with the rim's ::after — Tailwind merges both onto the same pseudo-element.
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
              {showCloseButton && (
                <DrawerClose
                  aria-label="Close"
                  className="absolute end-2 top-2"
                  render={<Button size="icon_sm" variant="ghost" />}
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                </DrawerClose>
              )}
            </BaseDialog.Popup>
          </div>

          {SafariNavColorDetectors}
        </BaseDialog.Viewport>
      </div>
    </DrawerNestingContext.Provider>
  );
}

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
  const { isVertical, direction } = useDrawerConfig();
  const { onOpenChange, isAnimating } = useDrawerControl();

  const isHorizontalDrawer = direction === "left" || direction === "right";

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
      "focus-visible:outline-ring/50 rounded-sm outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
      "bg-muted-foreground/30 shrink-0 cursor-pointer rounded-full",
      isVertical ? "mx-auto my-3 h-1 w-12" : "mx-3 my-auto h-12 w-1",
      "hover:bg-muted-foreground/50 transition-[color,opacity]",
      // Fade out when nested drawer opens, fade back when nested drawer is being dragged
      // "in-data-nested-dialog-open:opacity-0 in-data-nested-dragging:opacity-100",
      className,
    ),
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });

  if (hidden || isHorizontalDrawer) return null;

  return element;
}

// Padding rules use ancestor `:has()` on `[data-slot=drawer-content]` instead of
// adjacent-sibling selectors so consumers can wrap slots in forms, Suspense, etc.
// without breaking padding, and so a DrawerHandle between slots doesn't silently
// drop the header's padding (sibling selectors would miss it).
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-2 px-6 pt-6 pb-3",
        "in-data-[direction=bottom]:in-[[data-slot=drawer-content]:has([data-slot=drawer-handle])]:pt-1",
        // Header alone (with or without footer, no body): expand bottom padding.
        "in-[[data-slot=drawer-content]:not(:has([data-slot=drawer-body])):has([data-slot=drawer-footer])]:pb-6",
        "in-[[data-slot=drawer-content]:not(:has([data-slot=drawer-body])):not(:has([data-slot=drawer-footer]))]:pb-6",
        // "transition-opacity in-data-nested-dialog-open:opacity-0 in-data-nested-dragging:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        // z-1 above DrawerBody(z-0); translateZ(0) is Safari-only GPU promotion to fix
        // sticky/transform compositing flash during enter animation.
        "z-1 mt-auto flex flex-col-reverse gap-2 bg-(--popup-surface,var(--popover)) px-6 pt-4 pb-6 sm:flex-row sm:justify-end",
        "[@supports(-webkit-touch-callout:none)]:transform-[translateZ(0)]",
        "in-[[data-slot=drawer-content]:not(:has([data-slot=drawer-header])):not(:has([data-slot=drawer-body]))]:pt-6",
        "not-in-data-[footer-variant=inset]:in-[[data-slot=drawer-content]:has([data-slot=drawer-body])]:pt-3",
        "in-data-[footer-variant=inset]:border-border in-data-[footer-variant=inset]:bg-muted in-data-[footer-variant=inset]:border-t in-data-[footer-variant=inset]:pt-4 in-data-[footer-variant=inset]:pb-4",
        // "transition-opacity in-data-nested-dialog-open:opacity-0 in-data-nested-dragging:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      data-slot="drawer-title"
      className={cn(
        "text-foreground text-lg leading-none font-semibold tracking-tight text-balance",
        className,
      )}
      {...props}
    />
  );
}

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

function DrawerBody({
  className,
  nativeScroll = false,
  fadeEdges = false,
  scrollbarGutter = false,
  persistScrollbar,
  hideScrollbar,
  scrollLock = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  nativeScroll?: boolean;
  /** Disable scrolling when the drawer is not at its last (full) snap point */
  scrollLock?: boolean;
} & Pick<
    ScrollAreaProps,
    "fadeEdges" | "scrollbarGutter" | "persistScrollbar" | "hideScrollbar"
  >) {
  const { isVertical, snapPoints } = useDrawerConfig();
  const { activeSnapPoint } = useDrawerControl();

  const isAtFullSnap = activeSnapPoint === snapPoints[snapPoints.length - 1];

  return (
    <div
      data-slot="drawer-body"
      className={cn(
        // z-0: stays below sticky footer during iOS Safari enter animation.
        "relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden",
        "in-[[data-slot=drawer-content]:not(:has([data-slot=drawer-header]))]:pt-5",
        "in-[[data-slot=drawer-content]:not(:has([data-slot=drawer-footer]))]:pb-5",
        // Inset footer: still pad body bottom so content doesn't crowd the footer's top border.
        "in-data-[footer-variant=inset]:in-[[data-slot=drawer-content]:has([data-slot=drawer-footer])]:pb-5",
        // "transition-opacity in-data-nested-dialog-open:opacity-0 in-data-nested-dragging:opacity-100",
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
        viewportClassName={cn(
          isVertical ? "touch-pan-y" : "touch-pan-x",
          scrollLock && !isAtFullSnap && "!overflow-hidden",
        )}
      >
        <div className={cn("px-6 py-1", className)} {...props}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

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
