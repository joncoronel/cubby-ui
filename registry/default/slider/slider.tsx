import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const sliderVariants = cva(
  "relative w-full touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-60 data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col ",
  {
    variants: {
      variant: {
        default: "",
        contained: "",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderTrackVariants = cva(
  "bg-muted flex flex-1 ring-border/60 size-[inherit] min-size-[inherit] ring-1 relative grow rounded-full data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-3",
  {
    variants: {
      variant: {
        default: "",
        contained:
          "data-[orientation=horizontal]:h-6 data-[orientation=vertical]:w-6 rounded-full overflow-clip",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderIndicatorVariants = cva(
  "bg-primary absolute rounded-full shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.1)] data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
  {
    variants: {
      variant: {
        default: "",
        contained:
          "rounded-full data-[orientation=vertical]:rounded-t-none data-[orientation=horizontal]:rounded-r-none",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderThumbVariants = cva(
  "bg-background border-primary relative block size-5 shrink-0 rounded-full border-2 shadow-[0_2px_4px_0_oklch(0.18_0_0_/_0.15)] transition-[box-shadow] duration-200 hover:shadow-[0_3px_8px_0_oklch(0.18_0_0_/_0.2)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring/60 has-[:focus-visible]:outline-hidden",
  {
    variants: {
      variant: {
        default: "",
        contained:
          "h-full w-6 bg-primary border-none hover:shadow-none shadow-none rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border/70 data-[orientation=vertical]:h-6 data-[orientation=vertical]:w-full after:bg-primary-foreground flex items-center justify-center after:size-[60%]  after:rounded-full  after:origin-center data-[dragging]:after:scale-85 after:transition-transform after:ease-out after:duration-100 after:shadow-[0_2px_4px_0_oklch(0.18_0_0_/_0.15)]",
        squareThumb:
          "h-5 w-2.5 bg-card border-1 border-border/70 rounded-[.125rem] data-[orientation=vertical]:h-2.5 data-[orientation=vertical]:w-5",

        // Add more variants here as needed
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface SliderProps
  extends React.ComponentProps<typeof BaseSlider.Root>,
    VariantProps<typeof sliderVariants> {
  showSteps?: boolean;
}

function Slider({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  variant,
  showSteps = false,
  ...props
}: SliderProps) {
  const thumbCount = React.useMemo(() => {
    if (Array.isArray(value)) return value.length;
    if (Array.isArray(defaultValue)) return defaultValue.length;
    return 1; // Single thumb for single values
  }, [value, defaultValue]);

  const steps = React.useMemo(() => {
    if (!showSteps) return [];
    const step = props.step ?? 1;
    const stepCount = Math.floor((max - min) / step) + 1;
    return Array.from({ length: stepCount }, (_, i) => min + i * step);
  }, [showSteps, props.step, min, max]);

  return (
    <BaseSlider.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(sliderVariants({ variant }), className)}
      thumbAlignment={variant === "contained" ? "edge" : "center"}
      {...props}
    >
      <BaseSlider.Control
        data-slot="slider-control"
        className="flex flex-1 items-center data-[orientation=horizontal]:py-1 data-[orientation=vertical]:min-h-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:justify-center data-[orientation=vertical]:px-1"
      >
        <BaseSlider.Track
          data-slot="slider-track"
          className={cn(sliderTrackVariants({ variant }))}
        >
          <BaseSlider.Indicator
            data-slot="slider-indicator"
            className={cn(
              sliderIndicatorVariants({ variant }),
              ((Array.isArray(defaultValue) && defaultValue.length > 1) ||
                (Array.isArray(value) && value.length > 1)) &&
                "rounded-none",
            )}
          />

          {/* Step dots */}
          {showSteps &&
            steps.map((step, index) => {
              // Skip first and last step when using center alignment
              if (
                variant !== "contained" &&
                (index === 0 || index === steps.length - 1)
              ) {
                return null;
              }

              const percentage = ((step - min) / (max - min)) * 100;

              // For contained variant with edge alignment, we need to adjust positioning
              // because the thumb width affects the available track space
              const isContained = variant === "contained";
              const thumbWidth = isContained ? 24 : 0; // w-6 = 24px for contained variant

              return (
                <div
                  key={step}
                  className="bg-border pointer-events-none absolute size-1.5 rounded-full"
                  data-orientation={props.orientation}
                  style={
                    props.orientation === "vertical"
                      ? isContained
                        ? {
                            bottom: `calc(${thumbWidth / 2}px + ${percentage}% * (100% - ${thumbWidth}px) / 100%)`,
                            left: "50%",
                            transform: "translate(-50%, 50%)",
                          }
                        : {
                            bottom: `${percentage}%`,
                            left: "50%",
                            transform: "translate(-50%, 50%)",
                          }
                      : isContained
                        ? {
                            left: `calc(${thumbWidth / 2}px + ${percentage}% * (100% - ${thumbWidth}px) / 100%)`,
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                          }
                        : {
                            left: `${percentage}%`,
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                          }
                  }
                />
              );
            })}

          {/* Automatically render the correct number of thumbs based on value/defaultValue */}
          {Array.from({ length: thumbCount }, (_, index) => (
            <BaseSlider.Thumb
              data-slot="slider-thumb"
              data-orientation={props.orientation}
              key={index}
              index={index}
              className={cn(sliderThumbVariants({ variant }))}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
      {children}
    </BaseSlider.Root>
  );
}

function SliderValue({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseSlider.Value>) {
  return (
    <BaseSlider.Value
      data-slot="slider-value"
      className={cn(
        "text-foreground mt-2 flex justify-end text-sm font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </BaseSlider.Value>
  );
}

export { Slider, SliderValue };
