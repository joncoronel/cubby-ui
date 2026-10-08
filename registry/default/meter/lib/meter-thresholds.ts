export type MeterStatus = "optimum" | "suboptimum" | "critical";

export interface MeterReadingOptions {
  value: number;
  min: number;
  max: number;
  low?: number;
  high?: number;
  optimum?: number;
}

export interface MeterReading {
  /** `undefined` without thresholds, so the meter stays neutral. */
  status: MeterStatus | undefined;
  /** Positions of the set thresholds, as track percentages. */
  notches: number[];
  /** The low to high span when the optimum sits inside it, as track percentages. */
  targetRange: { start: number; end: number } | undefined;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/**
 * Native `<meter>` gauge regions, boundaries included. Status, notches, and
 * the target range all come from the same clamped bounds so they agree.
 */
export function readMeter({
  value,
  min,
  max,
  low,
  high,
  optimum,
}: MeterReadingOptions): MeterReading {
  if (low === undefined && high === undefined && optimum === undefined) {
    return { status: undefined, notches: [], targetRange: undefined };
  }

  const current = clamp(value, min, max);
  const lowBound = clamp(low ?? min, min, max);
  const highBound = clamp(high ?? max, lowBound, max);
  const ideal = clamp(optimum ?? (min + max) / 2, min, max);

  const bounds = new Set<number>();
  if (low !== undefined) bounds.add(lowBound);
  if (high !== undefined) bounds.add(highBound);
  const notches = [...bounds].map((bound) => toPercent(bound, min, max));

  const isMiddleBest = ideal >= lowBound && ideal <= highBound;
  const targetRange =
    isMiddleBest &&
    low !== undefined &&
    high !== undefined &&
    lowBound < highBound
      ? {
          start: toPercent(lowBound, min, max),
          end: toPercent(highBound, min, max),
        }
      : undefined;

  return {
    status: getStatus(current, lowBound, highBound, ideal),
    notches,
    targetRange,
  };
}

function getStatus(
  current: number,
  low: number,
  high: number,
  ideal: number,
): MeterStatus {
  // Higher is better; boundaries go to the better side
  if (ideal > high) {
    if (current >= high) return "optimum";
    if (current >= low) return "suboptimum";
    return "critical";
  }
  // Lower is better
  if (ideal < low) {
    if (current <= low) return "optimum";
    if (current <= high) return "suboptimum";
    return "critical";
  }
  // Middle is best; both outer regions are suboptimum
  if (current >= low && current <= high) return "optimum";
  return "suboptimum";
}
