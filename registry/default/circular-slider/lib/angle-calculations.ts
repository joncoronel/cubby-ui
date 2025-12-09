/**
 * Utility functions for circular slider angle and position calculations
 */

/**
 * Normalize an angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Convert a value to an angle based on min/max range
 * @param value - The value to convert
 * @param min - Minimum value
 * @param max - Maximum value
 * @param startAngle - Starting angle in degrees (0 = top)
 * @param direction - Direction of rotation
 * @param continuous - Whether the slider is in continuous mode (360° arc) or non-continuous mode (270° arc)
 * @returns Angle in degrees
 */
export function valueToAngle(
  value: number,
  min: number,
  max: number,
  startAngle: number = 0,
  direction: "clockwise" | "counterclockwise" = "clockwise",
  continuous: boolean = true,
): number {
  const range = max - min;
  // Use 270° arc for non-continuous mode so min and max are visually separated
  // Use 360° arc for continuous mode (full circle)
  const arcDegrees = continuous ? 360 : 270;
  // For non-continuous mode, offset by 225° to center the gap at bottom (180°)
  // Gap will be from 135° to 225° (90° gap centered at 180° = bottom)
  const offset = continuous ? 0 : 225;
  const normalizedValue = ((value - min) / range) * arcDegrees;
  const angle =
    direction === "clockwise"
      ? startAngle + normalizedValue + offset
      : startAngle - normalizedValue + offset;
  return normalizeAngle(angle);
}

/**
 * Convert an angle to a value based on min/max range
 * @param angle - Angle in degrees
 * @param min - Minimum value
 * @param max - Maximum value
 * @param startAngle - Starting angle in degrees
 * @param direction - Direction of rotation
 * @param continuous - Whether the slider is in continuous mode (360° arc) or non-continuous mode (270° arc)
 * @returns The calculated value
 */
export function angleToValue(
  angle: number,
  min: number,
  max: number,
  startAngle: number = 0,
  direction: "clockwise" | "counterclockwise" = "clockwise",
  continuous: boolean = true,
): number {
  // For non-continuous mode, clamp angles that fall in the gap area
  if (!continuous) {
    const normalizedAngle = normalizeAngle(angle);

    // Gap is centered at 180° (bottom), spanning 135° to 225° (90° gap)
    if (normalizedAngle >= 135 && normalizedAngle <= 225) {
      // Clamp to nearest edge of the gap
      // 135° to 180° → clamp to 135° (max value position)
      // 180° to 225° → clamp to 225° (min value position)
      angle = normalizedAngle <= 180 ? 135 : 225;
    }
  }

  // For non-continuous mode, subtract the 225° offset to account for gap positioning
  const offset = continuous ? 0 : 225;
  const adjustedAngle = angle - offset;
  const normalizedAngle = normalizeAngle(adjustedAngle);
  const normalizedStart = normalizeAngle(startAngle);

  let diff =
    direction === "clockwise"
      ? normalizedAngle - normalizedStart
      : normalizedStart - normalizedAngle;

  if (diff < 0) diff += 360;

  const range = max - min;
  // Use 270° arc for non-continuous mode so min and max are visually separated
  // Use 360° arc for continuous mode (full circle)
  const arcDegrees = continuous ? 360 : 270;
  const value = min + (diff / arcDegrees) * range;

  return value;
}

/**
 * Calculate angle from mouse/touch position relative to circle center
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param centerX - Circle center X
 * @param centerY - Circle center Y
 * @returns Angle in degrees (0 = top, increases clockwise)
 */
export function positionToAngle(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
): number {
  const radians = Math.atan2(y - centerY, x - centerX);
  // Convert to degrees and adjust so 0° is at top (subtract 90°)
  const degrees = radians * (180 / Math.PI) + 90;
  return normalizeAngle(degrees);
}

/**
 * Calculate thumb position on circle based on angle
 * @param angle - Angle in degrees (0 = top)
 * @param radius - Circle radius
 * @param centerX - Circle center X
 * @param centerY - Circle center Y
 * @returns Object with x and y coordinates
 */
export function getThumbPosition(
  angle: number,
  radius: number,
  centerX: number = 100,
  centerY: number = 100,
): { x: number; y: number } {
  // Subtract 90° because 0° should be at top
  const radians = ((angle - 90) * Math.PI) / 180;
  // Round to 4 decimal places to avoid hydration errors from floating-point precision
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return {
    x: round(centerX + radius * Math.cos(radians)),
    y: round(centerY + radius * Math.sin(radians)),
  };
}

/**
 * Create SVG arc path for the indicator
 * @param centerX - Circle center X
 * @param centerY - Circle center Y
 * @param radius - Circle radius
 * @param startAngle - Start angle in degrees (0 = top)
 * @param endAngle - End angle in degrees
 * @param direction - Direction to draw the arc (clockwise or counterclockwise)
 * @returns SVG path string
 */
export function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  direction: "clockwise" | "counterclockwise" = "clockwise",
): string {
  const start = getThumbPosition(startAngle, radius, centerX, centerY);
  const end = getThumbPosition(endAngle, radius, centerX, centerY);

  const normalizedStart = normalizeAngle(startAngle);
  const normalizedEnd = normalizeAngle(endAngle);

  let arcAngle =
    direction === "clockwise"
      ? normalizedEnd - normalizedStart
      : normalizedStart - normalizedEnd;
  if (arcAngle < 0) arcAngle += 360;

  const largeArcFlag = arcAngle > 180 ? 1 : 0;
  // Sweep flag: 1 for clockwise, 0 for counterclockwise
  const sweepFlag = direction === "clockwise" ? 1 : 0;

  if (arcAngle === 0) {
    return "";
  }

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    sweepFlag,
    end.x,
    end.y,
  ].join(" ");
}

/**
 * Round a value to the nearest step
 * @param value - Value to round
 * @param step - Step size
 * @param min - Minimum value (for precision)
 * @returns Rounded value
 */
export function roundToStep(value: number, step: number, min: number): number {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if angle is within a range (handles wraparound)
 */
export function isAngleInRange(
  angle: number,
  startAngle: number,
  endAngle: number,
): boolean {
  const normalizedAngle = normalizeAngle(angle);
  const normalizedStart = normalizeAngle(startAngle);
  const normalizedEnd = normalizeAngle(endAngle);

  if (normalizedStart <= normalizedEnd) {
    return (
      normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd
    );
  } else {
    return (
      normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd
    );
  }
}
