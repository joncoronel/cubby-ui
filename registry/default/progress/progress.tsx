"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Context for sharing progress configuration
interface ProgressContextValue {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  value?: number | null;
  min?: number;
  max?: number;
  completed?: boolean;
}

const ProgressContext = React.createContext<ProgressContextValue>({});

// Root component with size variants and animation support
const progressRootVariants = cva("w-full", {
  variants: {
    size: {
      sm: "space-y-1",
      md: "space-y-1.5",
      lg: "space-y-2",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface ProgressRootProps
  extends React.ComponentProps<typeof BaseProgress.Root>,
    VariantProps<typeof progressRootVariants> {
  animated?: boolean;
}

function ProgressRoot({
  className,
  children,
  size,
  animated = false,
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressRootProps) {
  const completed = value !== null && value !== undefined && value >= max;

  const contextValue = React.useMemo(
    () => ({
      size: size ?? undefined,
      animated,
      value,
      min,
      max,
      completed,
    }),
    [size, animated, value, min, max, completed],
  );

  return (
    <ProgressContext.Provider value={contextValue}>
      <BaseProgress.Root
        value={value}
        min={min}
        max={max}
        data-slot="progress"
        className={cn(progressRootVariants({ size }), className)}
        {...props}
      >
        {children}
      </BaseProgress.Root>
    </ProgressContext.Provider>
  );
}

// Track component with size variants and animation support
const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-primary/15 shadow-[inset_0_1px_2px_0_oklch(0.18_0_0_/_0.06)]",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-2.5",
        lg: "h-3.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface ProgressTrackProps
  extends React.ComponentProps<typeof BaseProgress.Track> {
  striped?: boolean;
}

function ProgressTrack({
  className,
  children,
  striped,
  ...props
}: ProgressTrackProps) {
  const { size } = React.useContext(ProgressContext);

  return (
    <BaseProgress.Track
      data-slot="progress-track"
      className={cn(
        progressTrackVariants({ size }),
        striped &&
          "from-primary/10 to-primary/20 bg-gradient-to-r bg-[length:1rem_1rem]",
        className,
      )}
      {...props}
    >
      {children}
    </BaseProgress.Track>
  );
}

// Indicator component with animation and indeterminate support
function ProgressIndicator({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress.Indicator>) {
  const { animated, completed } = React.useContext(ProgressContext);

  return (
    <BaseProgress.Indicator
      data-slot="progress-indicator"
      className={cn(
        "bg-primary h-full rounded-full shadow-[0_1px_2px_0_oklch(0.22_0_0_/_0.10)]",
        animated && "transition-all duration-500 ease-out",
        completed && "bg-green-500",
        className,
      )}
      {...props}
    />
  );
}

// Label component with size variants
const progressLabelVariants = cva("font-medium", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

function ProgressLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseProgress.Label>) {
  const { size } = React.useContext(ProgressContext);

  return (
    <BaseProgress.Label
      data-slot="progress-label"
      className={cn(progressLabelVariants({ size }), className)}
      {...props}
    />
  );
}

// Value component with formatting support
const progressValueVariants = cva("text-muted-foreground", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface ProgressValueProps
  extends React.ComponentProps<typeof BaseProgress.Value> {
  format?: (value: number | null, min: number, max: number) => string;
}

function ProgressValue({
  className,
  format,
  children,
  ...props
}: ProgressValueProps) {
  const {
    size,
    value,
    min = 0,
    max = 100,
    completed,
  } = React.useContext(ProgressContext);

  if (completed) {
    return (
      <span
        data-slot="progress-value"
        className={cn(
          progressValueVariants({ size }),
          "text-green-600",
          className,
        )}
      >
        Complete
      </span>
    );
  }

  if (format && value !== null && value !== undefined) {
    return (
      <span
        data-slot="progress-value"
        className={cn(progressValueVariants({ size }), className)}
      >
        {format(value, min, max)}
      </span>
    );
  }

  return (
    <BaseProgress.Value
      data-slot="progress-value"
      className={cn(progressValueVariants({ size }), className)}
      {...props}
    >
      {children}
    </BaseProgress.Value>
  );
}

// Legacy default export for backward compatibility
function Progress({ className, children, ...props }: ProgressRootProps) {
  return (
    <ProgressRoot className={className} {...props}>
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressRoot>
  );
}

// Named exports for subcomponents
export {
  Progress,
  ProgressRoot,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  type ProgressRootProps,
  type ProgressTrackProps,
  type ProgressValueProps,
};
