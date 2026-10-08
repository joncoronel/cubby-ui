"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";

import { cn } from "@/lib/utils";

import { readMeter, type MeterStatus } from "./lib/meter-thresholds";

export type { MeterStatus };

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
  const { status, notches, targetRange } = readMeter({
    value,
    min,
    max,
    low,
    high,
    optimum,
  });

  return (
    <BaseMeter.Root
      data-slot="meter"
      data-size={size}
      data-status={status}
      data-target-range={targetRange ? "" : undefined}
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
          "--meter-notches": notchMask(notches),
          "--meter-target-start": targetRange && `${targetRange.start}%`,
          "--meter-target-size":
            targetRange && `${targetRange.end - targetRange.start}%`,
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

/**
 * Underlines the target range when `optimum` sits between `low` and `high`.
 * Place it after `MeterTrack`; it renders nothing visible otherwise.
 */
function MeterTargetRange({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="meter-target-range"
      className={cn(
        // Its own grid row, pulled up to sit 4px under the track
        "bg-success-foreground -mt-1 hidden h-0.5 rounded-full",
        "ms-(--meter-target-start) w-(--meter-target-size)",
        "group-data-target-range/meter:block",
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

/** Root, track, indicator, and target range in one. Children render above the track. */
function Meter({ children, ...props }: MeterRootProps) {
  return (
    <MeterRoot {...props}>
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
      <MeterTargetRange />
    </MeterRoot>
  );
}

export {
  Meter,
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterTargetRange,
  MeterLabel,
  MeterValue,
};
