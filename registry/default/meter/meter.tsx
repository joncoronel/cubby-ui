"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const meterRootVariants = cva("max-w-[300px] w-full flex flex-col", {
  variants: {
    size: {
      sm: "gap-2",
      md: "gap-2",
      lg: "gap-2",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface MeterRootProps
  extends React.ComponentProps<typeof BaseMeter.Root>,
    VariantProps<typeof meterRootVariants> {
  animated?: boolean;
  low?: number;
  high?: number;
  optimumMin?: number;
  optimumMax?: number;
  showOptimumMarkers?: boolean;
  showThresholdColors?: boolean;
}

function MeterRoot({
  className,
  children,
  size = "md",
  animated = false,
  value = 0,
  min = 0,
  max = 100,
  low,
  high,
  optimumMin,
  optimumMax,
  showOptimumMarkers = true,
  showThresholdColors = true,
  ...props
}: MeterRootProps) {
  const optimumStyles =
    optimumMin !== undefined && optimumMax !== undefined
      ? {
          "--meter-optimum-min-percent": `${((optimumMin - min) / (max - min)) * 100}%`,
          "--meter-optimum-max-percent": `${((optimumMax - min) / (max - min)) * 100}%`,
          "--meter-optimum-width-percent": `${((optimumMax - optimumMin) / (max - min)) * 100}%`,
        }
      : {};

  // Status from thresholds, most-specific config first:
  const getStatus = () => {
    // Range (optimumMin + optimumMax): in-range is optimal, low/high mark danger
    if (optimumMin !== undefined && optimumMax !== undefined) {
      if (low !== undefined && value < low) return "danger";
      if (high !== undefined && value > high) return "danger";
      if (value >= optimumMin && value <= optimumMax) return "optimal";
      return "suboptimal";
    }

    // Directional three-tier, higher is better (e.g. battery: low=15, optimumMin=75)
    if (optimumMin !== undefined && low !== undefined) {
      if (value < low) return "danger";
      if (value >= optimumMin) return "optimal";
      return "suboptimal";
    }

    // Directional three-tier, lower is better (e.g. temp: optimumMax=60, high=80)
    if (optimumMax !== undefined && high !== undefined) {
      if (value > high) return "danger";
      if (value <= optimumMax) return "optimal";
      return "suboptimal";
    }

    // Two-tier: low only (higher is better)
    if (low !== undefined && high === undefined) {
      if (value < low) return "danger";
      return "optimal";
    }

    // Two-tier: high only (lower is better)
    if (high !== undefined && low === undefined) {
      if (value > high) return "danger";
      return "optimal";
    }

    // Two-tier: both (middle is best)
    if (low !== undefined && high !== undefined) {
      if (value < low || value > high) return "danger";
      return "optimal";
    }

    return "normal";
  };

  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      data-slot="meter"
      data-size={size}
      data-animated={animated}
      data-low={low}
      data-high={high}
      data-optimum-min={showOptimumMarkers ? optimumMin : undefined}
      data-optimum-max={showOptimumMarkers ? optimumMax : undefined}
      data-status={showThresholdColors ? getStatus() : "normal"}
      className={cn("group/meter", meterRootVariants({ size }), className)}
      style={optimumStyles as React.CSSProperties}
      {...props}
    >
      {children}
    </BaseMeter.Root>
  );
}

interface MeterTrackProps extends React.ComponentProps<typeof BaseMeter.Track> {
  segments?: number;
  striped?: boolean;
  gradient?: boolean;
}

function MeterTrack({
  className,
  children,
  segments,
  striped,
  gradient,
  ...props
}: MeterTrackProps) {
  return (
    <div className="relative">
      <BaseMeter.Track
        data-slot="meter-track"
        data-segments={segments}
        data-striped={striped}
        data-gradient={gradient}
        className={cn(
          "bg-primary/20 relative w-full overflow-hidden rounded-md",
          "group-data-[size=lg]/meter:h-3 group-data-[size=md]/meter:h-2 group-data-[size=sm]/meter:h-1.5",
          striped &&
            "from-primary/20 to-primary/30 bg-gradient-to-r bg-[length:1rem_1rem]",
          gradient &&
            "from-primary/10 via-primary/20 to-primary/10 bg-gradient-to-r",
          className,
        )}
        {...props}
      >
        {children}
        {segments && segments > 1 && <MeterSegments segments={segments} />}
        <MeterOptimumTicks />
      </BaseMeter.Track>
      <MeterOptimumRangeLine />
    </div>
  );
}

function MeterSegments({ segments }: { segments: number }) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: segments - 1 }).map((_, i) => (
        <div
          key={i}
          className="bg-background/50 absolute top-0 bottom-0 w-px"
          style={{ left: `${((i + 1) / segments) * 100}%` }}
        />
      ))}
    </div>
  );
}

// Vertical tick markers above the track. Shown only when both optimumMin and
// optimumMax are set (the doubled group-data selector).
function MeterOptimumTicks() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden group-data-[optimum-min]/meter:group-data-[optimum-max]/meter:block">
      {/* Start marker */}
      <div
        className="absolute -top-2 h-3 w-px"
        style={{ left: "calc(var(--meter-optimum-min-percent) - 0.5px)" }}
      >
        <div className="bg-foreground ring-background h-full w-full rounded-full ring-1" />
      </div>
      {/* End marker */}
      <div
        className="absolute -top-2 h-3 w-px"
        style={{ left: "calc(var(--meter-optimum-max-percent) - 0.5px)" }}
      >
        <div className="bg-foreground ring-background h-full w-full rounded-full ring-1" />
      </div>
    </div>
  );
}

// Horizontal range line below the track. Same dual-optimum visibility gate.
function MeterOptimumRangeLine() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-full hidden group-data-[optimum-min]/meter:group-data-[optimum-max]/meter:block">
      <div
        className="absolute top-0.5 h-0.5"
        style={{
          left: "calc(var(--meter-optimum-min-percent) - 0.25px)",
          width: "calc(var(--meter-optimum-width-percent) + 0.5px)",
        }}
      >
        <div className="bg-foreground/70 ring-background h-full w-full rounded-full ring-1" />
      </div>
    </div>
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
        "h-full",
        "group-data-[animated=true]/meter:transition-all group-data-[animated=true]/meter:duration-300 group-data-[animated=true]/meter:ease-out",
        // Status-based colors using semantic theme colors
        "group-data-[status=normal]/meter:bg-primary",
        "group-data-[status=optimal]/meter:bg-success",
        "group-data-[status=suboptimal]/meter:bg-warning",
        "group-data-[status=danger]/meter:bg-danger",
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
        "font-medium",
        "group-data-[size=lg]/meter:text-base group-data-[size=md]/meter:text-sm group-data-[size=sm]/meter:text-xs",
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
      className={cn(
        "text-muted-foreground",
        "group-data-[size=lg]/meter:text-base group-data-[size=md]/meter:text-sm group-data-[size=sm]/meter:text-xs",
        className,
      )}
      {...props}
    />
  );
}

// Legacy default export for backward compatibility
function Meter({
  className,
  children,
  low,
  high,
  optimumMin,
  optimumMax,
  ...props
}: MeterRootProps) {
  return (
    <MeterRoot
      className={className}
      low={low}
      high={high}
      optimumMin={optimumMin}
      optimumMax={optimumMax}
      {...props}
    >
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterRoot>
  );
}

export {
  Meter,
  MeterRoot,
  MeterTrack,
  MeterIndicator,
  MeterLabel,
  MeterValue,
  type MeterRootProps,
  type MeterTrackProps,
};
