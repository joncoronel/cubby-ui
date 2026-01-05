"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Variants
const timelineVariants = cva("group/timeline flex", {
  variants: {
    orientation: {
      horizontal: "w-full flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const timelineIndicatorVariants = cva(
  "absolute flex items-center justify-center rounded-full border-2 transition-all duration-200 size-6",
  {
    variants: {
      state: {
        pending:
          "border-border/80 bg-input shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.08)]",
        current:
          "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2 ring-offset-background shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.08)]",
        completed:
          "border-primary bg-primary text-primary-foreground shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.08)]",
      },
    },
    defaultVariants: {
      state: "pending",
    },
  },
);

const timelineSeparatorVariants = cva(
  "absolute bg-border transition-all duration-200 group-last/timeline-item:hidden",
  {
    variants: {
      orientation: {
        horizontal: "h-0.5 w-[calc(100%-2rem)] -top-6 left-7 -translate-y-1/2",
        vertical: "w-0.5 h-[calc(100%-2rem)] -left-6 top-7 -translate-x-1/2",
      },
      state: {
        pending: "bg-border",
        completed: "bg-primary/40",
      },
    },
    defaultVariants: {
      orientation: "vertical",
      state: "pending",
    },
  },
);

// Types
type TimelineContextValue = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  orientation: "horizontal" | "vertical";
};

// Context
const TimelineContext = React.createContext<TimelineContextValue | undefined>(
  undefined,
);

const TimelineItemContext = React.createContext<{ step: number } | undefined>(
  undefined,
);

const useTimeline = () => {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a Timeline");
  }
  return context;
};

// Base render function type
type RenderFunction<T> = (
  props: T,
  ref: React.Ref<HTMLElement>,
) => React.ReactElement | null;

// Components
interface TimelineProps
  extends
    useRender.ComponentProps<"div">,
    VariantProps<typeof timelineVariants> {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
}

function Timeline({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "vertical",
  className,
  render,
  ...props
}: TimelineProps) {
  const [activeStep, setInternalStep] = React.useState(defaultValue);

  const setActiveStep = React.useCallback(
    (step: number) => {
      if (value === undefined) {
        setInternalStep(step);
      }
      onValueChange?.(step);
    },
    [value, onValueChange],
  );

  const currentStep = value ?? activeStep;

  const defaultProps = {
    className: cn(
      timelineVariants({ orientation: orientation || "vertical" }),
      className,
    ),
    "data-orientation": orientation,
    "data-slot": "timeline",
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return (
    <TimelineContext.Provider
      value={{
        activeStep: currentStep,
        setActiveStep,
        orientation: orientation || "vertical",
      }}
    >
      {element}
    </TimelineContext.Provider>
  );
}

// TimelineContent
interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  render?: RenderFunction<React.HTMLAttributes<HTMLDivElement>>;
}

function TimelineContent({
  className,
  render,
  ...props
}: TimelineContentProps) {
  const contentProps = mergeProps(props, {
    className: cn("text-muted-foreground text-sm leading-relaxed", className),
    "data-slot": "timeline-content",
  });

  return render ? render(contentProps, null) : <div {...contentProps} />;
}

// TimelineDate
interface TimelineDateProps extends React.HTMLAttributes<HTMLTimeElement> {
  render?: RenderFunction<React.HTMLAttributes<HTMLTimeElement>>;
}

function TimelineDate({ className, render, ...props }: TimelineDateProps) {
  const dateProps = mergeProps(props, {
    className: cn(
      "text-muted-foreground mb-1 block text-xs font-medium tabular-nums",
      className,
    ),
    "data-slot": "timeline-date",
  });

  return render ? render(dateProps, null) : <time {...dateProps} />;
}

// TimelineHeader
interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  render?: RenderFunction<React.HTMLAttributes<HTMLDivElement>>;
}

function TimelineHeader({ className, render, ...props }: TimelineHeaderProps) {
  const headerProps = mergeProps(props, {
    className: cn(className),
    "data-slot": "timeline-header",
  });

  return render ? render(headerProps, null) : <div {...headerProps} />;
}

// TimelineIndicator
interface TimelineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  render?: RenderFunction<React.HTMLAttributes<HTMLDivElement>>;
}

function TimelineIndicator({
  className,
  children,
  render,
  ...props
}: TimelineIndicatorProps) {
  const { orientation, activeStep } = useTimeline();
  const currentItem = React.useContext(TimelineItemContext);

  const state = currentItem
    ? currentItem.step < activeStep
      ? "completed"
      : currentItem.step === activeStep
        ? "current"
        : "pending"
    : "pending";

  const indicatorProps = mergeProps(props, {
    className: cn(
      timelineIndicatorVariants({ state }),
      (orientation || "vertical") === "horizontal"
        ? "-top-6 left-0 -translate-y-1/2"
        : "top-0 -left-6 -translate-x-1/2",
      className,
    ),
    "aria-hidden": "true",
    "data-slot": "timeline-indicator",
    "data-state": state,
  });

  return render ? (
    render(indicatorProps, null)
  ) : (
    <div {...indicatorProps}>{children}</div>
  );
}

// TimelineItem
interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  render?: RenderFunction<React.HTMLAttributes<HTMLDivElement>>;
}

function TimelineItem({
  step,
  className,
  render,
  ...props
}: TimelineItemProps) {
  const { activeStep, orientation } = useTimeline();
  const isCompleted = step <= activeStep;
  const isCurrent = step === activeStep;

  const itemProps = mergeProps(props, {
    className: cn(
      "group/timeline-item relative flex flex-1 flex-col gap-2",
      orientation === "horizontal"
        ? "mt-8 not-last:pe-8"
        : "ms-8 not-last:pb-16",
      className,
    ),
    "data-completed": isCompleted || undefined,
    "data-current": isCurrent || undefined,
    "data-slot": "timeline-item",
  });

  return (
    <TimelineItemContext.Provider value={{ step }}>
      {render ? render(itemProps, null) : <div {...itemProps} />}
    </TimelineItemContext.Provider>
  );
}

// TimelineSeparator
interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  render?: RenderFunction<React.HTMLAttributes<HTMLDivElement>>;
}

function TimelineSeparator({
  className,
  render,
  ...props
}: TimelineSeparatorProps) {
  const { orientation, activeStep } = useTimeline();
  const currentItem = React.useContext(TimelineItemContext);

  const isCompleted = currentItem ? currentItem.step < activeStep : false;
  const state = isCompleted ? "completed" : "pending";

  const separatorProps = mergeProps(props, {
    className: cn(
      timelineSeparatorVariants({
        orientation: orientation || "vertical",
        state,
      }),
      className,
    ),
    "aria-hidden": "true",
    "data-slot": "timeline-separator",
    "data-state": state,
  });

  return render ? render(separatorProps, null) : <div {...separatorProps} />;
}

// TimelineTitle
interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  render?: RenderFunction<React.HTMLAttributes<HTMLHeadingElement>>;
}

function TimelineTitle({ className, render, ...props }: TimelineTitleProps) {
  const titleProps = mergeProps(props, {
    className: cn("text-sm font-semibold leading-none", className),
    "data-slot": "timeline-title",
  });

  return render ? render(titleProps, null) : <h3 {...titleProps} />;
}

export {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
};
