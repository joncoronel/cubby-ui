import * as React from "react";

import type { DrawerDirection } from "./use-snap-points";

export interface UseDrawerGestureOptions {
  /** Direction the drawer opens from */
  direction: DrawerDirection;
  /** Whether the drawer can be dismissed by swiping */
  dismissible: boolean;
  /** Current active snap point index */
  activeSnapPointIndex: number;
  /** Snap positions in pixels */
  snapPositions: number[];
  /** Maximum drag distance for progress calculation (typically content size) */
  maxDragDistance: number;
  /** Callback when gesture ends and a new snap point should be selected */
  onSnapPointChange: (snapPointIndex: number) => void;
  /** Callback when drawer should be dismissed (swipe past lowest snap point) */
  onDismiss?: () => void;
  /** Callback during drag with progress (0-1) */
  onDragProgress?: (progress: number) => void;
  /** Callback when drag starts */
  onDragStart?: () => void;
  /** Callback when drag ends */
  onDragEnd?: () => void;
  /** Velocity threshold for flick gestures (px/ms) */
  velocityThreshold?: number;
  /** Distance threshold to dismiss as percentage of remaining distance past lowest snap point (0-1). Default: 0.5 (50%) */
  dismissThreshold?: number;
  /** Whether gesture handling is enabled */
  enabled?: boolean;
}

export interface UseDrawerGestureReturn {
  /** Props to spread on the draggable element */
  gestureProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
  };
  /** Current drag offset in pixels */
  dragOffset: number;
  /** Whether currently dragging */
  isDragging: boolean;
  /** Reset position to current snap point */
  resetPosition: () => void;
}

interface VelocityTracker {
  positions: Array<{ position: number; time: number }>;
  add: (position: number) => void;
  getVelocity: () => number;
  reset: () => void;
}

function createVelocityTracker(): VelocityTracker {
  const positions: Array<{ position: number; time: number }> = [];
  const maxSamples = 5;

  return {
    positions,
    add(position: number) {
      const now = performance.now();
      positions.push({ position, time: now });
      // Keep only recent samples
      while (positions.length > maxSamples) {
        positions.shift();
      }
    },
    getVelocity(): number {
      if (positions.length < 2) return 0;

      const first = positions[0];
      const last = positions[positions.length - 1];
      const dt = last.time - first.time;

      if (dt === 0) return 0;

      return (last.position - first.position) / dt;
    },
    reset() {
      positions.length = 0;
    },
  };
}

/**
 * Hook to handle drawer gesture/swipe interactions
 *
 * Uses pointer events for precise control over:
 * - Drag detection and tracking
 * - Velocity calculation for flick gestures
 * - Determining snap target based on position and velocity
 */
export function useDrawerGesture({
  direction,
  dismissible,
  activeSnapPointIndex,
  snapPositions,
  maxDragDistance,
  onSnapPointChange,
  onDismiss,
  onDragProgress,
  onDragStart,
  onDragEnd,
  velocityThreshold = 0.5,
  dismissThreshold = 0.5,
  enabled = true,
}: UseDrawerGestureOptions): UseDrawerGestureReturn {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);

  // Refs for tracking gesture state
  const startPositionRef = React.useRef(0);
  const currentPositionRef = React.useRef(0);
  const velocityTrackerRef = React.useRef<VelocityTracker>(
    createVelocityTracker(),
  );
  const isDraggingRef = React.useRef(false);
  const hasMovedRef = React.useRef(false);
  const pointerIdRef = React.useRef<number | null>(null);
  const targetElementRef = React.useRef<HTMLElement | null>(null);

  const isVertical = direction === "top" || direction === "bottom";

  // Get the current snap point position
  const currentSnapPointPosition = snapPositions[activeSnapPointIndex] ?? 0;

  // Calculate drag direction multiplier
  // For bottom/right: positive drag = closing (translate increases)
  // For top/left: positive drag = opening (translate decreases)
  const dragMultiplier =
    direction === "bottom" || direction === "right" ? 1 : -1;

  // Get pointer position based on direction
  const getPointerPosition = React.useCallback(
    (e: React.PointerEvent) => {
      return isVertical ? e.clientY : e.clientX;
    },
    [isVertical],
  );

  // Find the lowest snap point position (highest pixel value = most closed)
  // Snap positions are sorted with index 0 being the most closed
  const lowestSnapPosition = snapPositions[0] ?? 0;

  // Get nearest snap point considering velocity
  // Returns { index, shouldDismiss }
  const getSnapTarget = React.useCallback(
    (
      position: number,
      velocity: number,
    ): { index: number; shouldDismiss: boolean } => {
      // Check if we should dismiss
      // Threshold is calculated as percentage of distance from lowest snap point to fully closed
      // This means "50% of the way past the lowest snap point" triggers dismiss
      if (dismissible) {
        const distanceToFullyClosed = maxDragDistance - lowestSnapPosition;
        const dismissPosition =
          lowestSnapPosition + distanceToFullyClosed * dismissThreshold;
        const isFlickingClosed = velocity > velocityThreshold;

        if (
          position > dismissPosition ||
          (isFlickingClosed && position > lowestSnapPosition)
        ) {
          return { index: 0, shouldDismiss: true };
        }
      }

      // FIRST: If velocity is significant, use velocity-based snapping
      if (Math.abs(velocity) > velocityThreshold) {
        const isClosingDirection = velocity > 0;

        if (isClosingDirection) {
          // Find next snap point towards closed (higher position value)
          for (let i = 0; i < snapPositions.length; i++) {
            if (snapPositions[i] > position) {
              return { index: i, shouldDismiss: false };
            }
          }
          // Already past all snap points
          return { index: 0, shouldDismiss: false };
        } else {
          // Find next snap point towards open (lower position value)
          for (let i = snapPositions.length - 1; i >= 0; i--) {
            if (snapPositions[i] < position) {
              return { index: i, shouldDismiss: false };
            }
          }
          return { index: snapPositions.length - 1, shouldDismiss: false };
        }
      }

      // SECOND: Low velocity - snap to nearest snap point
      let closestIndex = 0;
      let closestDistance = Math.abs(position - snapPositions[0]);

      for (let i = 1; i < snapPositions.length; i++) {
        const distance = Math.abs(position - snapPositions[i]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      return { index: closestIndex, shouldDismiss: false };
    },
    [
      dismissible,
      dismissThreshold,
      lowestSnapPosition,
      maxDragDistance,
      snapPositions,
      velocityThreshold,
    ],
  );

  // Handle pointer down
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;

      // Only handle primary pointer (touch or left mouse)
      if (e.button !== 0) return;

      // Don't prevent default here - allow clicks on interactive elements
      // We'll prevent default in handlePointerMove once drag threshold is crossed

      startPositionRef.current = getPointerPosition(e);
      currentPositionRef.current = startPositionRef.current;
      velocityTrackerRef.current.reset();
      velocityTrackerRef.current.add(0);
      hasMovedRef.current = false;
      isDraggingRef.current = true;
      pointerIdRef.current = e.pointerId;
      targetElementRef.current = e.currentTarget as HTMLElement;

      // Don't capture pointer yet - we'll capture in handlePointerMove
      // after the drag threshold is crossed. This allows clicks to work normally.
    },
    [enabled, getPointerPosition],
  );

  // Handle pointer move
  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (pointerIdRef.current !== e.pointerId) return;

      const currentPos = getPointerPosition(e);
      let delta = (currentPos - startPositionRef.current) * dragMultiplier;

      // Clamp delta to prevent dragging past open position
      const minDelta = -currentSnapPointPosition; // Can't go past fully open (position 0)

      // When dismissible, allow dragging past the lowest snap point (for dismiss gesture)
      // Otherwise, clamp to the lowest snap point
      const maxDelta = dismissible
        ? Infinity // Allow dragging past for dismiss
        : lowestSnapPosition - currentSnapPointPosition;
      delta = Math.max(minDelta, Math.min(maxDelta, delta));

      // Calculate new position (current snap point position + drag delta)
      const newPosition = currentSnapPointPosition + delta;

      // Track velocity
      velocityTrackerRef.current.add(newPosition);

      // Update state
      currentPositionRef.current = currentPos;
      setDragOffset(delta);

      // Calculate progress (0 = open, 1 = closed)
      const progress = Math.min(1, Math.max(0, newPosition / maxDragDistance));
      onDragProgress?.(progress);

      // Start dragging state after some movement
      if (!hasMovedRef.current && Math.abs(delta) > 5) {
        hasMovedRef.current = true;
        setIsDragging(true);
        onDragStart?.();
        // Prevent default once drag starts to stop text selection
        e.preventDefault();
        // Now capture the pointer for reliable tracking
        if (targetElementRef.current) {
          targetElementRef.current.setPointerCapture(e.pointerId);
        }
      } else if (hasMovedRef.current) {
        // Continue preventing default during drag
        e.preventDefault();
      }
    },
    [
      getPointerPosition,
      dragMultiplier,
      currentSnapPointPosition,
      dismissible,
      lowestSnapPosition,
      maxDragDistance,
      onDragProgress,
      onDragStart,
    ],
  );

  // Handle pointer up
  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (pointerIdRef.current !== e.pointerId) return;

      isDraggingRef.current = false;
      pointerIdRef.current = null;

      // Release pointer capture if we captured it
      if (hasMovedRef.current && targetElementRef.current) {
        try {
          targetElementRef.current.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if already released
        }
      }
      targetElementRef.current = null;

      if (!hasMovedRef.current) {
        // No significant movement - this was a click, let it pass through
        setDragOffset(0);
        return;
      }

      // Calculate final position and velocity
      const delta =
        (currentPositionRef.current - startPositionRef.current) *
        dragMultiplier;
      const finalPosition = currentSnapPointPosition + delta;
      const velocity = velocityTrackerRef.current.getVelocity();

      // Determine target snap point or dismiss
      const { index: targetSnapPoint, shouldDismiss } = getSnapTarget(
        finalPosition,
        velocity,
      );

      // Reset drag state
      setDragOffset(0);
      setIsDragging(false);
      onDragEnd?.();

      // Handle dismiss or snap point change
      if (shouldDismiss) {
        onDismiss?.();
      } else if (targetSnapPoint !== activeSnapPointIndex) {
        onSnapPointChange(targetSnapPoint);
      }
    },
    [
      dragMultiplier,
      currentSnapPointPosition,
      getSnapTarget,
      activeSnapPointIndex,
      onSnapPointChange,
      onDismiss,
      onDragEnd,
    ],
  );

  // Handle pointer cancel
  const handlePointerCancel = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      if (pointerIdRef.current !== e.pointerId) return;

      // Release pointer capture if we captured it
      if (hasMovedRef.current && targetElementRef.current) {
        try {
          targetElementRef.current.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore if already released
        }
      }

      isDraggingRef.current = false;
      pointerIdRef.current = null;
      targetElementRef.current = null;
      hasMovedRef.current = false;
      setDragOffset(0);
      setIsDragging(false);
      onDragEnd?.();
    },
    [onDragEnd],
  );

  // Reset to current snap point position
  const resetPosition = React.useCallback(() => {
    setDragOffset(0);
  }, []);

  return {
    gestureProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    dragOffset,
    isDragging,
    resetPosition,
  };
}
