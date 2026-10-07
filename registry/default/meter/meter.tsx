"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";

import { cn } from "@/lib/utils";

export type MeterStatus = "optimum" | "suboptimum" | "critical";

/** Width of the notch cut into the track at each threshold, in px. */
const NOTCH_WIDTH = 2;

export interface MeterRootProps extends Omit<
  React.ComponentProps<typeof BaseMeter.Root>,
  "getAriaValueText"
> {
  /**
   * Text for screen readers in place of the formatted value. Receives the
   * threshold status too, since the indicator color alone isn't announced.
   */
  getAriaValueText?: (
    formattedValue: string,
    value: number,
    status: MeterStatus | undefined,
  ) => string;
  /** Track thickness. */
  size?: "sm" | "md" | "lg";
  /** Upper bound of the low region. Values below it are "low". */
  low?: number;
  /** Lower bound of the high region. Values above it are "high". */
  high?: number;
  /**
   * The ideal value. Whichever region (low, middle, or high) contains it is
   * the optimum; the adjacent region is suboptimum, the far one critical.
   * Defaults to the midpoint of `min` and `max`.
   */
  optimum?: number;
}

/**
 * Mirrors the HTML `<meter>` gauge regions as browsers implement them,
 * including which side each boundary belongs to. Returns `undefined` when no
 * thresholds are set so the meter stays a neutral color.
 */
function getMeterStatus(
  value: number,
  min: number,
  max: number,
  low: number | undefined,
  high: number | undefined,
  optimum: number | undefined,
): MeterStatus | undefined {
  if (low === undefined && high === undefined && optimum === undefined) {
    return undefined;
  }

  const current = clamp(value, min, max);
  const lowBound = clamp(low ?? min, min, max);
  const highBound = clamp(high ?? max, lowBound, max);
  const ideal = clamp(optimum ?? (min + max) / 2, min, max);

  // Higher is better: a boundary counts toward the optimum's side
  if (ideal > highBound) {
    if (current >= highBound) return "optimum";
    if (current > lowBound) return "suboptimum";
    return "critical";
  }
  // Lower is better
  if (ideal < lowBound) {
    if (current <= lowBound) return "optimum";
    if (current < highBound) return "suboptimum";
    return "critical";
  }
  // Middle is best: both outer regions are only suboptimum
  if (current >= lowBound && current <= highBound) return "optimum";
  return "suboptimum";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return clamp(((value - min) / (max - min)) * 100, 0, 100);
}

/** A mask that cuts a thin transparent notch at each position (in %). */
function notchMask(positions: number[]): string | undefined {
  // Notches at the very ends would only shave the rounded caps
  const inner = positions.filter((p) => p > 0 && p < 100).sort((a, b) => a - b);
  if (inner.length === 0) return undefined;

  const half = NOTCH_WIDTH / 2;
  const stops = inner.map(
    (p) =>
      `#000 0 calc(${p}% - ${half}px), transparent 0 calc(${p}% + ${half}px)`,
  );
  return `linear-gradient(var(--meter-direction), ${stops.join(", ")}, #000 0)`;
}

function MeterRoot({
  className,
  style,
  size = "md",
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  getAriaValueText,
  ...props
}: MeterRootProps) {
  const status = getMeterStatus(value, min, max, low, high, optimum);

  const thresholds = [low, high]
    .filter((t): t is number => t !== undefined)
    .map((t) => toPercent(t, min, max));
  const notches = notchMask(thresholds);

  return (
    <BaseMeter.Root
      data-slot="meter"
      data-size={size}
      data-status={status}
      getAriaValueText={
        getAriaValueText
          ? (formatted, current) => getAriaValueText(formatted, current, status)
          : undefined
      }
      value={value}
      min={min}
      max={max}
      className={cn(
        "group/meter grid w-full grid-flow-row-dense grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2",
        // Label and value share the first row; the track and anything else span both columns
        "[&>:not([data-slot=meter-label],[data-slot=meter-value])]:col-span-full",
        "[&>[data-slot=meter-value]]:col-start-2 [&>[data-slot=meter-value]]:justify-self-end",
        // Notches follow the fill, which starts at the inline start
        "[--meter-direction:to_right] rtl:[--meter-direction:to_left]",
        "[--meter-color:var(--primary)]",
        "data-[status=optimum]:[--meter-color:var(--success-foreground)]",
        "data-[status=suboptimum]:[--meter-color:var(--warning-foreground)]",
        "data-[status=critical]:[--meter-color:var(--danger-foreground)]",
        className,
      )}
      style={(state) =>
        ({
          "--meter-notches": notches,
          ...(typeof style === "function" ? style(state) : style),
        }) as React.CSSProperties
      }
      {...props}
    />
  );
}

export interface MeterTrackProps extends React.ComponentProps<
  typeof BaseMeter.Track
> {
  /** Divide the track into this many equal blocks separated by gaps. */
  segments?: number;
}

function MeterTrack({ className, style, segments, ...props }: MeterTrackProps) {
  const isSegmented = segments !== undefined && segments > 1;

  // Gaps are cut with a mask so they show whatever surface sits behind the
  // meter. Segments already give the track a scale, so they replace the
  // threshold notches rather than stacking with them.
  const gap = "var(--meter-segment-gap)";
  const maskImage = isSegmented
    ? `repeating-linear-gradient(to right, #000 0 calc((100% + ${gap}) / ${segments} - ${gap}), transparent 0 calc((100% + ${gap}) / ${segments}))`
    : "var(--meter-notches, none)";

  return (
    <BaseMeter.Track
      data-slot="meter-track"
      data-segmented={isSegmented || undefined}
      className={cn(
        "bg-foreground/9 relative w-full overflow-hidden rounded-full [--meter-segment-gap:3px]",
        "group-data-[size=lg]/meter:h-2.5 group-data-[size=md]/meter:h-1.5 group-data-[size=sm]/meter:h-1",
        "group-data-[size=sm]/meter:[--meter-segment-gap:2px] data-segmented:rounded-[3px]",
        className,
      )}
      style={(state) => ({
        maskImage,
        ...(typeof style === "function" ? style(state) : style),
      })}
      {...props}
    />
  );
}

function MeterIndicator({
  className,
  ...props
}: React.ComponentProps<typeof BaseMeter.Indicator>) {
  return (
    <BaseMeter.Indicator
      data-slot="meter-indicator"
      className={cn(
        "h-full rounded-full bg-(--meter-color)",
        "in-data-segmented:rounded-none",
        "ease-out-expo transition-[width,background-color] duration-500 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function MeterLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseMeter.Label>) {
  return (
    <BaseMeter.Label
      data-slot="meter-label"
      className={cn(
        "text-foreground col-start-1 text-sm font-medium",
        className,
      )}
      {...props}
    />
  );
}

function MeterValue({
  className,
  ...props
}: React.ComponentProps<typeof BaseMeter.Value>) {
  return (
    <BaseMeter.Value
      data-slot="meter-value"
      className={cn("text-muted-foreground text-sm tabular-nums", className)}
      {...props}
    />
  );
}

/** Root, track, and indicator in one. Children render above the track. */
function Meter({ children, ...props }: MeterRootProps) {
  return (
    <MeterRoot {...props}>
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterRoot>
  );
}

export { Meter, MeterRoot, MeterTrack, MeterIndicator, MeterLabel, MeterValue };
