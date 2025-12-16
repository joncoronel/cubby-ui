/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

export type DrawerDirection = "top" | "right" | "bottom" | "left";

/**
 * Snap point value:
 * - number (0-1): percentage of drawer visible (0 = closed, 1 = fully open)
 * - `${number}px`: fixed pixel height visible (e.g., "200px")
 */
export type SnapPoint = number | `${number}px`;

/**
 * Direction configuration for drawer behavior.
 * Eliminates repeated conditionals throughout the codebase.
 */
export const DIRECTION_CONFIG = {
  top: { isVertical: true, isInverted: true },
  bottom: { isVertical: true, isInverted: false },
  left: { isVertical: false, isInverted: true },
  right: { isVertical: false, isInverted: false },
} as const;

export type DirectionConfig = (typeof DIRECTION_CONFIG)[DrawerDirection];

/**
 * Scroll geometry for drawer positioning calculations.
 */
export interface ScrollGeometry {
  /** Total track size (viewport + content + dismiss buffer) */
  trackSize: number;
  /** Buffer space for dismiss gesture */
  dismissBuffer: number;
  /** Range of visible drawer positions */
  visibleRange: number;
  /** Maximum scroll position */
  maxScroll: number;
  /** Whether scroll direction is inverted (top/left) */
  isInverted: boolean;
}

/* -------------------------------------------------------------------------------------------------
 * Browser Support Detection
 * -------------------------------------------------------------------------------------------------*/

export const supportsScrollEnd =
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
 * Utility Functions
 * -------------------------------------------------------------------------------------------------*/

/**
 * Parse a pixel value string (e.g., "200px") and return the number
 */
export function parsePixelValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Find the index of a snap point value in the array
 * Returns the last index if value is null or not found
 */
export function findSnapPointIndex(
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
export function getSnapPointValue(
  snapPoints: SnapPoint[],
  index: number,
): SnapPoint {
  return snapPoints[Math.max(0, Math.min(index, snapPoints.length - 1))];
}

/**
 * Wait for scroll to end on an element
 */
export function waitForScrollEnd(element: HTMLElement): Promise<void> {
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
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* -------------------------------------------------------------------------------------------------
 * Scroll Geometry Calculations
 * -------------------------------------------------------------------------------------------------*/

/**
 * Calculate scroll geometry for drawer positioning.
 * These values determine track size and scroll positions for snap points.
 */
export function calculateScrollGeometry(
  viewportSize: number,
  contentSize: number,
  dismissible: boolean,
  isInverted: boolean,
): ScrollGeometry {
  const effectiveSize = contentSize || viewportSize * 0.9;
  const dismissBuffer = dismissible ? effectiveSize * 0.3 : 0;
  const trackSize = viewportSize + effectiveSize + dismissBuffer;
  const maxScroll = trackSize - viewportSize;
  const visibleRange = maxScroll - dismissBuffer;

  return {
    trackSize,
    dismissBuffer,
    visibleRange,
    maxScroll,
    isInverted,
  };
}

/**
 * Calculate scroll positions for each snap point.
 * Returns an array where index 0 is dismiss position (if dismissible),
 * followed by positions for each snap point.
 */
export function calculateSnapScrollPositions(
  snapPoints: SnapPoint[],
  geometry: ScrollGeometry,
  dismissible: boolean,
  contentSize: number,
): number[] {
  const { maxScroll, visibleRange, dismissBuffer, isInverted } = geometry;
  const positions: number[] = [];

  // Add dismiss position first if dismissible
  if (dismissible) {
    positions.push(isInverted ? maxScroll : 0);
  }

  // Calculate positions for each snap point
  for (const snapPoint of snapPoints) {
    const visibleRatio =
      typeof snapPoint === "string"
        ? (parsePixelValue(snapPoint) ?? contentSize) / contentSize
        : snapPoint;

    // Calculate scroll position based on direction
    const scrollPos = isInverted
      ? maxScroll - dismissBuffer - visibleRatio * visibleRange
      : dismissBuffer + visibleRatio * visibleRange;

    positions.push(Math.min(maxScroll, Math.max(0, scrollPos)));
  }

  return positions;
}

/**
 * Calculate progress from scroll position (0 = fully open, 1 = fully closed).
 * Used for backdrop opacity animation.
 */
export function calculateScrollProgress(
  scrollPos: number,
  geometry: ScrollGeometry,
): number {
  const { maxScroll, visibleRange, dismissBuffer, isInverted } = geometry;

  let progress: number;
  if (isInverted) {
    // Top/Left: maxScroll = closed (1), 0 = open (0)
    const openScrollPos = maxScroll - dismissBuffer - visibleRange;
    progress = (scrollPos - openScrollPos) / visibleRange;
  } else {
    // Bottom/Right: 0 = closed (1), maxScroll = open (0)
    progress = 1 - (scrollPos - dismissBuffer) / visibleRange;
  }

  return Math.min(1, Math.max(0, progress));
}

/**
 * Calculate snap progress from scroll position (0 = first snap, 1 = last snap).
 * Used for crossfade effects between snap points.
 */
export function calculateSnapProgress(
  scrollPos: number,
  snapScrollPositions: number[],
  dismissible: boolean,
): number {
  const firstSnapIndex = dismissible ? 1 : 0;
  const lastSnapIndex = snapScrollPositions.length - 1;

  // Handle edge cases
  if (firstSnapIndex >= lastSnapIndex) return 0;

  const firstSnapPos = snapScrollPositions[firstSnapIndex];
  const lastSnapPos = snapScrollPositions[lastSnapIndex];

  if (firstSnapPos === lastSnapPos) return 0;

  const progress =
    (scrollPos - firstSnapPos) / (lastSnapPos - firstSnapPos);
  return Math.min(1, Math.max(0, progress));
}
