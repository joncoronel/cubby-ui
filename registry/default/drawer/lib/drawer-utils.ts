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
