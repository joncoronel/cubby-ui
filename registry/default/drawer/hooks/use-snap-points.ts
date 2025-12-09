import * as React from "react";

export type DrawerDirection = "top" | "right" | "bottom" | "left";

/**
 * Snap point value:
 * - number (0-1): percentage of drawer visible (0 = closed, 1 = fully open)
 * - `${number}px`: fixed pixel height visible (e.g., "200px")
 */
export type SnapPoint = number | `${number}px`;

/**
 * Parse a pixel value string (e.g., "200px") and return the number
 */
function parsePixelValue(value: string): number | null {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

export interface UseSnapPointsOptions {
  /** Array of snap point values (0-1 or pixel values) */
  snapPoints: SnapPoint[];
  /** Direction the drawer opens from */
  direction: DrawerDirection;
  /** Size of the drawer content (height for vertical, width for horizontal) */
  contentSize: number | null;
  /** Size of the viewport (height for vertical, width for horizontal) */
  viewportSize: number;
}

export interface UseSnapPointsReturn {
  /**
   * Calculated snap positions in pixels
   * Each position represents how far the drawer is translated from its fully-open position
   */
  snapPositions: number[];

  /**
   * Get the snap point index for a given position
   */
  getSnapPointForPosition: (position: number, velocity?: number) => number;

  /**
   * Get the pixel position for a given snap point index
   */
  getPositionForSnapPoint: (snapPointIndex: number) => number;

  /**
   * Get the nearest snap point index based on position and velocity
   */
  getNearestSnapPoint: (
    position: number,
    velocity: number,
    velocityThreshold?: number,
  ) => number;

  /**
   * Check if direction is vertical (top/bottom)
   */
  isVertical: boolean;

  /**
   * Get the maximum drag distance (for progress calculations)
   */
  maxDragDistance: number;
}

/**
 * Hook to manage drawer snap point calculations
 *
 * Snap points represent how much of the drawer is visible:
 * - 0 = fully hidden (dismissed)
 * - 0.5 = half visible
 * - 1 = fully visible
 *
 * The hook converts these to pixel positions based on drawer and viewport sizes.
 */
export function useSnapPoints({
  snapPoints,
  direction,
  contentSize,
  viewportSize,
}: UseSnapPointsOptions): UseSnapPointsReturn {
  const isVertical = direction === "top" || direction === "bottom";

  // Calculate the effective size (use viewport if content size unknown)
  const effectiveSize = contentSize ?? viewportSize;

  // Calculate snap positions in pixels
  // Position 0 = fully open, position = effectiveSize means fully closed
  const snapPositions = React.useMemo(() => {
    return snapPoints.map((snapPoint) => {
      // Handle pixel values (e.g., "200px")
      if (typeof snapPoint === "string") {
        const pixels = parsePixelValue(snapPoint);
        if (pixels !== null) {
          // Pixel value: how many pixels of drawer should be visible
          // position = effectiveSize - pixels (clamped to 0)
          return Math.max(0, effectiveSize - pixels);
        }
        // Invalid string format, treat as fully open
        return 0;
      }

      // Convert snap point (0-1) to pixel position
      // snapPoint 0 = position = effectiveSize (fully hidden)
      // snapPoint 1 = position = 0 (fully visible)
      return effectiveSize * (1 - snapPoint);
    });
  }, [snapPoints, effectiveSize]);

  // Maximum drag distance (from fully open to fully closed)
  const maxDragDistance = effectiveSize;

  // Get position for a specific snap point index
  const getPositionForSnapPoint = React.useCallback(
    (snapPointIndex: number): number => {
      const clampedIndex = Math.max(
        0,
        Math.min(snapPointIndex, snapPositions.length - 1),
      );
      return snapPositions[clampedIndex];
    },
    [snapPositions],
  );

  // Get the snap point index closest to a given position
  const getSnapPointForPosition = React.useCallback(
    (position: number): number => {
      let closestIndex = 0;
      let closestDistance = Math.abs(position - snapPositions[0]);

      for (let i = 1; i < snapPositions.length; i++) {
        const distance = Math.abs(position - snapPositions[i]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      return closestIndex;
    },
    [snapPositions],
  );

  // Get nearest snap point considering velocity
  const getNearestSnapPoint = React.useCallback(
    (
      position: number,
      velocity: number,
      velocityThreshold: number = 0.5,
    ): number => {
      // If velocity is significant, bias towards the direction of movement
      if (Math.abs(velocity) > velocityThreshold) {
        // For bottom/right drawers: positive velocity = closing, negative = opening
        // For top/left drawers: negative velocity = closing, positive = opening
        const isClosingDirection =
          direction === "bottom" || direction === "right"
            ? velocity > 0
            : velocity < 0;

        // Find snap points in the direction of movement
        const currentSnapPoint = getSnapPointForPosition(position);
        const currentPosition = snapPositions[currentSnapPoint];

        if (isClosingDirection) {
          // Moving towards closed - find next snap point with larger position value
          for (let i = 0; i < snapPositions.length; i++) {
            if (snapPositions[i] > currentPosition) {
              return i;
            }
          }
          // Already at most closed position
          return snapPositions.length - 1;
        } else {
          // Moving towards open - find next snap point with smaller position value
          for (let i = snapPositions.length - 1; i >= 0; i--) {
            if (snapPositions[i] < currentPosition) {
              return i;
            }
          }
          // Already at most open position
          return 0;
        }
      }

      // Low velocity - snap to nearest snap point
      return getSnapPointForPosition(position);
    },
    [direction, snapPositions, getSnapPointForPosition],
  );

  return {
    snapPositions,
    getSnapPointForPosition,
    getPositionForSnapPoint,
    getNearestSnapPoint,
    isVertical,
    maxDragDistance,
  };
}
