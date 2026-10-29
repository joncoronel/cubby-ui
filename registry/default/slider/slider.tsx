import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The inset thumb's box, in px, for the step-mark math. Keep in step with
// --inset-thumb-size on the inset variant.
const INSET_THUMB_SIZE = 18;

const sliderVariants = cva(
  "relative w-full touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-60 data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col ",
  {
    variants: {
      variant: {
        default: "",
        inset: "[--inset-thumb-size:18px]",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderTrackVariants = cva(
  "bg-control-track flex flex-1 size-[inherit] min-size-[inherit] relative grow rounded-full data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-full data-[orientation=vertical]:w-3",
  {
    variants: {
      variant: {
        default: "",
        // A tall track the thumb sits inside.
        inset:
          "rounded-xs data-[orientation=horizontal]:h-6 data-[orientation=vertical]:w-6",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const sliderIndicatorVariants = cva(
  "bg-(--slider-fill) absolute rounded-full shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.1)] data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
  {
    variants: {
      variant: {
        default: "",
        // Ends at the thumb's center, under the thumb, so only the outer end
        // is rounded. The half-pixel spread covers the track's anti-aliased
        // edge, which otherwise rims the fill's corners in grey.
        inset:
          "shadow-[0_0_0_0.5px_var(--slider-fill)] data-[orientation=horizontal]:rounded-s-xs data-[orientation=horizontal]:rounded-e-none data-[orientation=vertical]:rounded-b-xs data-[orientation=vertical]:rounded-t-none",
        squareThumb: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// A borderless white knob like the Switch thumb: a hairline and a soft drop
// give it its edge, so it reads on the filled range and the bare track alike.
const sliderThumbVariants = cva(
  "bg-white relative block size-5 shrink-0 rounded-full shadow-[0_0_0_0.5px_oklch(0_0_0/0.08),0_1px_3px_0_oklch(0.18_0_0/0.2)] duration-200 hover:shadow-[0_0_0_0.5px_oklch(0_0_0/0.08),0_2px_8px_0_oklch(0.18_0_0/0.24)] outline-0 -outline-offset-1 outline-transparent outline-solid transition-[box-shadow,outline-width,outline-color] has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring forced-colors:border forced-colors:border-[CanvasText]",
  {
    variants: {
      variant: {
        default: "",
        // The box is fill-colored, so the range runs on past the white handle
        // and frames it; the handle is a ::before inside the box's border. A
        // border, not an inset, because borders snap to whole device pixels:
        // an inset rounds differently top and bottom at fractional DPRs.
        inset: [
          "border-2 border-(--slider-fill) bg-(--slider-fill) rounded-xs shadow-[0_0_0_0.5px_var(--slider-fill)] hover:shadow-[0_0_0_0.5px_var(--slider-fill)]",
          "data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-(--inset-thumb-size)",
          "data-[orientation=vertical]:w-full data-[orientation=vertical]:h-(--inset-thumb-size)",
          "before:absolute before:inset-0 before:rounded-[calc(var(--radius-xs)-2px)] before:bg-white before:shadow-[0_1px_2px_0_oklch(0.18_0_0/0.15)] before:content-['']",
          // Press: the handle gives a little, felt more than seen. The thumb
          // gets its own layer, or the scaled handle repaints at a new subpixel
          // offset on every drag move and shimmers. The whole thumb, not the
          // handle alone, so the frame and handle snap together and stay
          // centered.
          "will-change-transform before:transition-[scale] before:duration-150 before:ease-out data-[dragging]:before:scale-95 motion-reduce:before:transition-none",
          "forced-colors:before:border forced-colors:before:border-[CanvasText]",
        ],
        squareThumb:
          "h-5 w-2.5 rounded-[.125rem] data-[orientation=vertical]:h-2.5 data-[orientation=vertical]:w-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Filled range: the shared selection-control grey, or the brand fill.
const sliderColors = {
  neutral:
    "[--slider-fill:var(--emphasis)] [--slider-fill-foreground:var(--emphasis-foreground)]",
  primary:
    "[--slider-fill:var(--primary)] [--slider-fill-foreground:var(--primary-foreground)]",
};

function toArray(value: number | readonly number[]): number[] {
  return Array.isArray(value) ? [...value] : [value as number];
}

export interface SliderProps
  extends
    React.ComponentProps<typeof BaseSlider.Root>,
    VariantProps<typeof sliderVariants> {
  color?: "neutral" | "primary";
  showSteps?: boolean;
  getAriaLabel?: ((index: number) => string) | null;
}

function Slider({
  className,
  children,
  defaultValue,
  value,
  onValueChange,
  min = 0,
  max = 100,
  variant,
  color = "neutral",
  showSteps = false,
  getAriaLabel,
  ...props
}: SliderProps) {
  // Uncontrolled sliders still need the live value to color the inset
  // variant's step marks, so mirror it.
  const [uncontrolledValues, setUncontrolledValues] = React.useState(() =>
    defaultValue !== undefined ? toArray(defaultValue) : [min],
  );
  const values = value !== undefined ? toArray(value) : uncontrolledValues;

  const isRange = values.length > 1;
  const inset = variant === "inset";
  const vertical = props.orientation === "vertical";

  const steps = React.useMemo(() => {
    if (!showSteps) return [];
    const step = props.step ?? 1;
    const stepCount = Math.floor((max - min) / step) + 1;
    return Array.from({ length: stepCount }, (_, i) => min + i * step);
  }, [showSteps, props.step, min, max]);

  const handleValueChange: SliderProps["onValueChange"] = (next, details) => {
    if (value === undefined) setUncontrolledValues(toArray(next));
    onValueChange?.(next, details);
  };

  return (
    <BaseSlider.Root
      data-slot="slider"
      data-color={color}
      defaultValue={defaultValue}
      value={value}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      className={cn(
        sliderColors[color],
        sliderVariants({ variant }),
        className,
      )}
      thumbAlignment={inset ? "edge" : "center"}
      // Drags along the slider's axis are the slider's, so a Base UI drawer
      // or toast doesn't swipe; across it, a drawer still can.
      data-base-ui-swipe-ignore={vertical ? "y" : "x"}
      {...props}
    >
      {children}
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
              isRange && "rounded-none",
            )}
          />

          {steps.map((step, index) => {
            // Centered thumbs cover the end marks, so skip them.
            if (!inset && (index === 0 || index === steps.length - 1)) {
              return null;
            }

            const percentage = ((step - min) / (max - min)) * 100;
            // Edge-aligned thumbs travel the track minus their own size.
            const position = inset
              ? `calc(${INSET_THUMB_SIZE / 2}px + ${percentage}% * (100% - ${INSET_THUMB_SIZE}px) / 100%)`
              : `${percentage}%`;
            const filled = isRange
              ? step >= values[0] && step <= values[values.length - 1]
              : step <= values[0];

            return (
              <div
                key={step}
                data-slot="slider-step"
                data-filled={filled ? "" : undefined}
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  inset
                    ? cn(
                        vertical ? "h-0.5 w-1.5" : "h-1.5 w-0.5",
                        "bg-[color-mix(in_oklab,var(--foreground)_22%,transparent)] data-filled:bg-[color-mix(in_oklab,var(--slider-fill-foreground)_45%,transparent)]",
                      )
                    : "bg-border size-1.5",
                )}
                style={
                  vertical
                    ? {
                        bottom: position,
                        left: "50%",
                        transform: "translate(-50%, 50%)",
                      }
                    : {
                        left: position,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }
                }
              />
            );
          })}

          {values.map((_, index) => (
            <BaseSlider.Thumb
              data-slot="slider-thumb"
              data-orientation={vertical ? "vertical" : "horizontal"}
              key={index}
              index={index}
              getAriaLabel={getAriaLabel}
              className={cn(sliderThumbVariants({ variant }))}
            />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
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
      className={cn("text-foreground text-sm font-medium", className)}
      {...props}
    >
      {children}
    </BaseSlider.Value>
  );
}

function SliderLabel({ className, ...props }: BaseSlider.Label.Props) {
  return (
    <BaseSlider.Label
      data-slot="slider-label"
      className={cn(
        "text-foreground text-sm leading-5 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Slider, SliderValue, SliderLabel };
