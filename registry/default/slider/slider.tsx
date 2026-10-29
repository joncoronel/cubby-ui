import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// The inset thumb's box, in px, for the step-mark math. Keep in step with
// --edge-thumb-size on the inset variant.
const INSET_THUMB_SIZE = 18;
// How far the bar handle sits inside the fill's end, in px.
const BAR_HANDLE_INSET = 7;
// A SliderValue passed as a bar label takes the layer's text, so it turns
// the fill's foreground color with the rest.
const BAR_LABEL_VALUE =
  "**:data-[slot=slider-value]:text-inherit **:data-[slot=slider-value]:text-[length:inherit] **:data-[slot=slider-value]:[font-weight:inherit]";

const sliderVariants = cva(
  "relative w-full touch-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-60 data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col ",
  {
    variants: {
      variant: {
        default: "",
        inset: "[--edge-thumb-size:18px]",
        bar: "",
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
        // Tall enough to hold the labels. The grey is a gradient set inline,
        // left out under the fill; the clip rounds the fill's outer corners.
        // The thumb is invisible, so focus shows on the track.
        bar: "bg-transparent overflow-hidden rounded-sm data-[orientation=horizontal]:h-8 data-[orientation=vertical]:w-8 outline-0 outline-offset-2 outline-transparent outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
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
        // Unused: the bar variant draws its own fill.
        bar: "",
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
          "data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-(--edge-thumb-size)",
          "data-[orientation=vertical]:w-full data-[orientation=vertical]:h-(--edge-thumb-size)",
          "before:absolute before:inset-0 before:rounded-[calc(var(--radius-xs)-2px)] before:bg-white before:shadow-[0_1px_2px_0_oklch(0.18_0_0/0.15)] before:content-['']",
          // Press: the handle gives a little, felt more than seen. The thumb
          // gets its own layer, or the scaled handle repaints at a new subpixel
          // offset on every drag move and shimmers. The whole thumb, not the
          // handle alone, so the frame and handle snap together and stay
          // centered.
          "will-change-transform before:transition-[scale] before:duration-150 before:ease-out data-[dragging]:before:scale-95 motion-reduce:before:transition-none",
          "forced-colors:before:border forced-colors:before:border-[CanvasText]",
        ],
        // An invisible hit area; the handle the user sees is drawn in the
        // track's layers, where it can sit behind the pointer.
        bar: "bg-transparent shadow-none hover:shadow-none has-[:focus-visible]:outline-0 forced-colors:border-0 data-[orientation=horizontal]:h-full data-[orientation=horizontal]:w-3.5 data-[orientation=vertical]:h-3.5 data-[orientation=vertical]:w-full",
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
  /** Marks steps on the track; `"hover"` shows them only while in use. */
  showSteps?: boolean | "hover";
  /** The spacing between marks, in value units. Defaults to `step`. */
  markStep?: number;
  /** Text inside the track at its start. `bar` variant only. */
  startLabel?: React.ReactNode;
  /** Text inside the track at its end. `bar` variant only. */
  endLabel?: React.ReactNode;
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
  markStep,
  startLabel,
  endLabel,
  getAriaLabel,
  ...props
}: SliderProps) {
  // Uncontrolled sliders still need the live value to color step marks and
  // draw the bar variant's fill, so mirror it.
  const [uncontrolledValues, setUncontrolledValues] = React.useState(() =>
    defaultValue !== undefined ? toArray(defaultValue) : [min],
  );
  const values = value !== undefined ? toArray(value) : uncontrolledValues;

  const isRange = values.length > 1;
  const inset = variant === "inset";
  const bar = variant === "bar";
  const vertical = props.orientation === "vertical";

  const percent = (v: number): number => ((v - min) / (max - min)) * 100;
  const first = percent(values[0]);
  const last = percent(values[values.length - 1]);

  // The bar's fill ends exactly at the value, so it follows the pointer and
  // is nothing at the minimum. The track's grey starts a pixel under the
  // fill's ends rather than running beneath it, where it would rim the fill's
  // anti-aliased edges.
  const barTrackStyle = bar
    ? ({
        "--fill-start": isRange ? `${first}%` : "0px",
        "--fill-end": `${last}%`,
        "--grey-until": isRange ? `calc(${first}% + 1px)` : "0px",
        "--grey-from": `calc(${last}% - 1px)`,
      } as React.CSSProperties)
    : undefined;
  // The handle sits just inside the fill's end, but never past the track's
  // edge, so at the minimum it waits at the start with no fill behind it.
  // It's drawn in both layers like the labels, so it turns the fill's
  // foreground color exactly where the fill covers it.
  const barContent = (handleClass: string): React.ReactElement => (
    <>
      <span>{startLabel}</span>
      <span>{endLabel}</span>
      {values.map((v, index) => {
        const p = percent(v);
        const position =
          isRange && index === 0
            ? `min(calc(100% - ${BAR_HANDLE_INSET}px), calc(${p}% + ${BAR_HANDLE_INSET}px))`
            : `max(${BAR_HANDLE_INSET}px, calc(${p}% - ${BAR_HANDLE_INSET}px))`;
        return (
          <span
            key={index}
            className={cn(
              "absolute rounded-full",
              // Press: the bar reaches a little further, as if picked up. Its
              // own layer, or it repaints at a new subpixel offset on every
              // drag move and shimmers.
              "transition-[scale] duration-150 ease-out will-change-transform motion-reduce:transition-none",
              vertical
                ? "left-1/2 h-0.5 w-3.5 -translate-x-1/2 translate-y-1/2 group-data-dragging/slider:scale-x-[1.15]"
                : "top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 group-data-dragging/slider:scale-y-[1.15] rtl:translate-x-1/2",
              handleClass,
            )}
            style={
              vertical ? { bottom: position } : { insetInlineStart: position }
            }
          />
        );
      })}
    </>
  );

  const steps = React.useMemo(() => {
    if (!showSteps) return [];
    const step = markStep ?? props.step ?? 1;
    const stepCount = Math.floor((max - min) / step) + 1;
    return Array.from({ length: stepCount }, (_, i) => min + i * step);
  }, [showSteps, markStep, props.step, min, max]);

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
        "group/slider",
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
          style={barTrackStyle}
          className={cn(
            sliderTrackVariants({ variant }),
            bar &&
              (vertical
                ? "bg-[linear-gradient(to_top,var(--color-control-track)_var(--grey-until),transparent_var(--grey-until)_var(--grey-from),var(--color-control-track)_var(--grey-from))]"
                : "bg-[linear-gradient(to_right,var(--color-control-track)_var(--grey-until),transparent_var(--grey-until)_var(--grey-from),var(--color-control-track)_var(--grey-from))] rtl:bg-[linear-gradient(to_left,var(--color-control-track)_var(--grey-until),transparent_var(--grey-until)_var(--grey-from),var(--color-control-track)_var(--grey-from))]"),
          )}
        >
          {bar ? (
            <>
              <div
                aria-hidden
                data-slot="slider-labels"
                className={cn(
                  // Muted-foreground falls under 4.5:1 on the light track.
                  "text-foreground/80 pointer-events-none absolute inset-0 flex justify-between text-[0.8125rem] leading-none font-medium",
                  BAR_LABEL_VALUE,
                  vertical
                    ? "flex-col-reverse items-center py-2.5"
                    : "items-center px-3",
                )}
              >
                {barContent("bg-(--slider-fill) forced-colors:bg-[CanvasText]")}
              </div>
              {/* The fill is a full-size layer clipped to the range, with the
                  labels and handle again in the fill's foreground, so they
                  change color exactly where the fill crosses them. */}
              <div
                aria-hidden
                data-slot="slider-indicator"
                className={cn(
                  "pointer-events-none absolute inset-0 flex justify-between bg-(--slider-fill) text-[0.8125rem] leading-none font-medium text-(--slider-fill-foreground)",
                  "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
                  BAR_LABEL_VALUE,
                  vertical
                    ? "flex-col-reverse items-center py-2.5 [clip-path:inset(calc(100%-var(--fill-end))_0_var(--fill-start)_0)]"
                    : "items-center px-3 [clip-path:inset(0_calc(100%-var(--fill-end))_0_var(--fill-start))] rtl:[clip-path:inset(0_var(--fill-start)_0_calc(100%-var(--fill-end)))]",
                )}
              >
                {barContent(
                  "bg-(--slider-fill-foreground) forced-colors:bg-[HighlightText]",
                )}
              </div>
            </>
          ) : (
            <BaseSlider.Indicator
              data-slot="slider-indicator"
              className={cn(
                sliderIndicatorVariants({ variant }),
                isRange && "rounded-none",
              )}
            />
          )}

          {steps.map((step, index) => {
            // Centered thumbs and the bar handle cover the end marks, so skip
            // them.
            if (!inset && (index === 0 || index === steps.length - 1)) {
              return null;
            }

            // Edge-aligned thumbs travel the track minus their own size.
            const position = inset
              ? `calc(${INSET_THUMB_SIZE / 2}px + ${percent(step)}% * (100% - ${INSET_THUMB_SIZE}px) / 100%)`
              : `${percent(step)}%`;
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
                  // Hover-only marks also show while dragging or focused, so
                  // touch and keyboard users still see them.
                  showSteps === "hover" &&
                    "opacity-0 transition-opacity duration-150 ease-out group-hover/slider:opacity-100 group-has-[:focus-visible]/slider:opacity-100 group-data-dragging/slider:opacity-100",
                  inset && (vertical ? "h-0.5 w-2" : "h-2 w-0.5"),
                  bar && (vertical ? "h-0.5 w-2.5" : "h-2.5 w-0.5"),
                  inset || bar
                    ? "bg-[color-mix(in_oklab,var(--foreground)_22%,transparent)] data-filled:bg-[color-mix(in_oklab,var(--slider-fill-foreground)_45%,transparent)]"
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
      className={cn(
        "text-foreground text-sm font-medium tabular-nums",
        className,
      )}
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
