import * as React from "react";
import { positionToAngle, angleToValue } from "./angle-calculations";

/**
 * Get the center coordinates of a circle container
 */
export function getCircleCenter(container: HTMLElement): {
  x: number;
  y: number;
} {
  const rect = container.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Convert pointer position to slider value
 * Consolidates the angle and value calculation logic
 */
export function getValueFromPointerPosition(
  e: React.PointerEvent,
  container: HTMLElement,
  min: number,
  max: number,
  startAngle: number,
  direction: "clockwise" | "counterclockwise",
  continuous: boolean,
): number {
  const { x: centerX, y: centerY } = getCircleCenter(container);
  const angle = positionToAngle(e.clientX, e.clientY, centerX, centerY);
  return angleToValue(angle, min, max, startAngle, direction, continuous);
}
