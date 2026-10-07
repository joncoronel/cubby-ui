"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "./progress.css";

const progressRootVariants = cva(
  [
    // Label and value share the first row; the track and anything else span both columns
    "group/progress grid w-full grid-flow-row-dense grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2",
    "[&>:not([data-slot=progress-label],[data-slot=progress-value])]:col-span-full",
    "[&>[data-slot=progress-value]]:col-start-2 [&>[data-slot=progress-value]]:justify-self-end",
    // With a ring, everything sits inline: ring, then label and value
    "has-[>[data-slot=progress-circle]]:flex has-[>[data-slot=progress-circle]]:w-auto has-[>[data-slot=progress-circle]]:items-center has-[>[data-slot=progress-circle]]:gap-x-2",
  ],
  {
    variants: {
      variant: {
        default: "[--progress-color:var(--primary)]",
        success: "[--progress-color:var(--success-foreground)]",
        warning: "[--progress-color:var(--warning-foreground)]",
        danger: "[--progress-color:var(--danger-foreground)]",
        info: "[--progress-color:var(--info-foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Lets the indicator and ring remount when the value switches to or from
// null, so neither tweens between the sweep and a real value.
const ProgressIndeterminateContext = React.createContext(false);

export interface ProgressRootProps
  extends
    React.ComponentProps<typeof BaseProgress.Root>,
    VariantProps<typeof progressRootVariants> {
  /** Track thickness. */
  size?: "sm" | "md" | "lg";
  /** A secondary value drawn behind the indicator, such as how much of a video has loaded. */
  buffer?: number;
}

function ProgressRoot({
  className,
  style,
  variant,
  size = "md",
  buffer,
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressRootProps) {
  const percent = value === null ? undefined : toPercent(value, min, max);

  // Unitless so ProgressCircle can use it directly as a stroke length
  const vars = {
    "--progress-percent": percent,
    "--progress-buffer":
      buffer !== undefined ? `${toPercent(buffer, min, max)}%` : undefined,
  } as React.CSSProperties;

  return (
    <ProgressIndeterminateContext.Provider value={value === null}>
      <BaseProgress.Root
        data-slot="progress"
        data-size={size}
        data-empty={percent === 0 || undefined}
        value={value}
        min={min}
        max={max}
        className={cn(progressRootVariants({ variant }), className)}
        style={(state) => ({
          ...vars,
          ...(typeof style === "function" ? style(state) : style),
        })}
        {...props}
      />
    </ProgressIndeterminateContext.Provider>
  );
}

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function ProgressTrack({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress.Track>) {
  return (
    <BaseProgress.Track
      data-slot="progress-track"
      className={cn(
        "bg-foreground/9 relative w-full overflow-hidden rounded-full",
        // The sweep is physical (left-0, moving right); mirroring the track reverses it for RTL
        "rtl:data-indeterminate:-scale-x-100",
        "group-data-[size=lg]/progress:h-2.5 group-data-[size=md]/progress:h-1.5 group-data-[size=sm]/progress:h-1",
        className,
      )}
      {...props}
    />
  );
}

function ProgressIndicator({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress.Indicator>) {
  const indeterminate = React.useContext(ProgressIndeterminateContext);

  return (
    <BaseProgress.Indicator
      key={indeterminate ? "indeterminate" : "determinate"}
      data-slot="progress-indicator"
      className={cn(
        "relative h-full rounded-full bg-(--progress-color)",
        "ease-out-expo transition-[width,background-color] duration-500 motion-reduce:transition-none",
        // Indeterminate: a 40% sweep, or a slow full-width breathe under reduced motion
        "data-indeterminate:absolute data-indeterminate:inset-y-0 data-indeterminate:left-0 data-indeterminate:w-2/5",
        "data-indeterminate:animate-[progress-indeterminate_1.6s_var(--ease-in-out-cubic)_infinite]",
        "motion-reduce:data-indeterminate:w-full motion-reduce:data-indeterminate:animate-[progress-breathe_2.4s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Draws the root's `buffer` value behind the indicator. Place it before
 * `ProgressIndicator` inside the track. Hidden while indeterminate.
 */
function ProgressBuffer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="progress-buffer"
      className={cn(
        "absolute inset-y-0 start-0 w-(--progress-buffer,0%) rounded-full bg-(--progress-color) opacity-25",
        "ease-out-expo transition-[width] duration-500 motion-reduce:transition-none",
        "group-data-indeterminate/progress:hidden",
        className,
      )}
      {...props}
    />
  );
}

export interface ProgressCircleProps extends Omit<
  React.ComponentProps<"span">,
  "children"
> {
  /** Diameter in px. */
  size?: number;
  /** Stroke width in px. Defaults to a tenth of `size`, at least 2. */
  thickness?: number;
  /** Content centered inside the ring, typically `ProgressValue`. */
  children?: React.ReactNode;
}

/**
 * A ring alternative to `ProgressTrack`. Use it in place of the track inside
 * `ProgressRoot`; the root's value, variant, and indeterminate state apply.
 */
function ProgressCircle({
  className,
  style,
  size = 20,
  thickness,
  children,
  ...props
}: ProgressCircleProps) {
  const indeterminate = React.useContext(ProgressIndeterminateContext);
  const stroke = thickness ?? Math.max(2, size / 10);
  const radius = (size - stroke) / 2;
  const center = size / 2;

  return (
    <span
      data-slot="progress-circle"
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        // A centered ProgressValue scales with the ring instead of using its own text size
        "[&>[data-slot=progress-value]]:text-foreground [&>[data-slot=progress-value]]:text-[length:inherit] [&>[data-slot=progress-value]]:leading-none [&>[data-slot=progress-value]]:font-medium",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.24),
        ...style,
      }}
      {...props}
    >
      <svg
        aria-hidden
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn(
          "absolute inset-0 -rotate-90",
          // Indeterminate: a quarter arc spinning, or breathing in place under reduced motion
          "group-data-indeterminate/progress:animate-spin motion-reduce:group-data-indeterminate/progress:animate-none",
        )}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-foreground/9"
        />
        <circle
          key={indeterminate ? "indeterminate" : "determinate"}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100 100"
          className={cn(
            "stroke-(--progress-color) [stroke-dashoffset:calc(100_-_var(--progress-percent,0))]",
            "ease-out-expo transition-[stroke-dashoffset,stroke,opacity] duration-500 motion-reduce:transition-none",
            // A round cap still paints a dot at zero length; fade it once the arc has drained
            "group-data-empty/progress:opacity-0 group-data-empty/progress:[transition-delay:0s,0s,300ms]",
            "group-data-indeterminate/progress:[stroke-dashoffset:75]",
            "motion-reduce:group-data-indeterminate/progress:animate-[progress-breathe_2.4s_ease-in-out_infinite]",
          )}
        />
      </svg>
      {children}
    </span>
  );
}

function ProgressLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress.Label>) {
  return (
    <BaseProgress.Label
      data-slot="progress-label"
      className={cn(
        "text-foreground col-start-1 text-sm font-medium",
        className,
      )}
      {...props}
    />
  );
}

function ProgressValue({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress.Value>) {
  return (
    <BaseProgress.Value
      data-slot="progress-value"
      className={cn(
        "text-muted-foreground text-sm tabular-nums",
        // Base UI prints "indeterminate" when value is null
        "data-indeterminate:hidden",
        className,
      )}
      {...props}
    />
  );
}

/** Root, track, and indicator in one. Children render above the track. */
function Progress({ children, buffer, ...props }: ProgressRootProps) {
  return (
    <ProgressRoot buffer={buffer} {...props}>
      {children}
      <ProgressTrack>
        {buffer !== undefined && <ProgressBuffer />}
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}

export {
  Progress,
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressBuffer,
  ProgressCircle,
  ProgressLabel,
  ProgressValue,
  progressRootVariants,
};
