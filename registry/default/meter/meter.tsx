"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";

import { cn } from "@/lib/utils";

export type MeterStatus = "optimum" | "suboptimum" | "critical";

/** Threshold notch width, in px. */
const NOTCH_WIDTH = 2;

export interface MeterRootProps extends Omit<
  React.ComponentProps<typeof BaseMeter.Root>,
  "getAriaValueText"
> {
  /** Screen-reader text for the value. Gets the status too, since color alone isn't announced. */
  getAriaValueText?: (
    formattedValue: string,
    value: number,
    status: MeterStatus | undefined,
  ) => string;
  /** Track thickness. */
  size?: "sm" | "md" | "lg";
  /** Indicator color when no thresholds are set. */
  variant?: "default" | "neutral";
  /** Upper bound of the low region. Values below it are "low". */
  low?: number;
  /** Lower bound of the high region. Values above it are "high". */
  high?: number;
  /**
   * The ideal value. Its region is optimum, the adjacent one suboptimum, the
   * far one critical. Defaults to the midpoint of `min` and `max`.
   */
  optimum?: number;
}

/**
 * Native `<meter>` gauge regions, boundaries included. Returns `undefined`
 * without thresholds so the meter stays neutral.
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

  // Higher is better; boundaries go to the better side
  if (ideal > highBound) {
    if (current >= highBound) return "optimum";
    if (current >= lowBound) return "suboptimum";
    return "critical";
  }
  // Lower is better
  if (ideal < lowBound) {
    if (current <= lowBound) return "optimum";
    if (current <= highBound) return "suboptimum";
    return "critical";
  }
  // Middle is best; both outer regions are suboptimum
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

/** Mask with a transparent notch at each position (in %). */
function notchMask(positions: number[]): string | undefined {
  // End notches would only shave the rounded caps
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
  variant = "default",
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
        // Label and value share row one; everything else spans below
        "[&>:not([data-slot=meter-label],[data-slot=meter-value])]:col-span-full",
        "[&>[data-slot=meter-value]]:col-start-2 [&>[data-slot=meter-value]]:justify-self-end",
        // Notches follow the fill direction
        "[--meter-direction:to_right] rtl:[--meter-direction:to_left]",
        variant === "neutral"
          ? "[--meter-color:var(--neutral)]"
          : "[--meter-color:var(--primary)]",
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

  // Masked gaps show whatever surface is behind the meter. Segments replace
  // the threshold notches, since they already give the track a scale.
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
