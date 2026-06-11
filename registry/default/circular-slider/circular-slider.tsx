"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import {
  valueToAngle,
  getThumbPosition,
  describeArc,
  roundToStep,
  clamp,
} from "./lib/angle-calculations";
import {
  SVG_CONFIG,
  RADIUS_CONFIG,
  SLOT_NAMES,
  VARIANT_COLOR_MAP,
} from "./lib/svg-constants";
import {
  pixelsToSvgUnits,
  createSvgOverlayProps,
  strokeWidthToSvgUnits,
  getTrackInnerEdge,
} from "./lib/svg-utils";
import { getValueFromPointerPosition } from "./lib/pointer-utils";

export type ChangeReason = "drag" | "keyboard" | "click";

interface CircularSliderContextValue {
  value: number;
  min: number;
  max: number;
  step: number;
  startAngle: number;
  direction: "clockwise" | "counterclockwise";
  continuous: boolean;
  disabled: boolean;
  size: number;
  variant: "default" | "filled";
  isDragging: boolean;
  isFocused: boolean;
  handleValueChange: (newValue: number, reason: ChangeReason) => void;
  handleValueCommitted: (value: number) => void;
}

const CircularSliderContext = React.createContext<
  CircularSliderContextValue | undefined
>(undefined);

function useCircularSliderContext() {
  const context = React.useContext(CircularSliderContext);
  if (!context) {
    throw new Error(
      "CircularSlider components must be used within CircularSliderRoot",
    );
  }
  return context;
}

const circularSliderVariants = cva(
  "group relative inline-block touch-none select-none outline-none",
  {
    variants: {
      variant: {
        default: "",
        filled: "",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      disabled: false,
    },
  },
);

const thumbVariants = cva(
  "absolute transition-[box-shadow] duration-200 ease-out",
  {
    variants: {
      variant: {
        default:
          "rounded-full border-3 border-primary bg-background group-data-focused:z-10 group-data-focused:ring-2 group-data-focused:ring-ring group-data-focused:ring-offset-2 group-data-focused:ring-offset-background",
        filled: "rounded-none bg-foreground",
      },
      dragging: {
        true: "cursor-grabbing",
        false: "cursor-grab",
      },
    },
    defaultVariants: {
      variant: "default",
      dragging: false,
    },
  },
);

/**
 * Wraps `value` into [min, max] for continuous mode, detecting boundary
 * crossings via `previousValue` so crossing max→min resolves to min (not max)
 * and vice-versa.
 */
function wrapValueWithDirection(
  value: number,
  min: number,
  max: number,
  previousValue: number | null,
): number {
  const range = max - min;

  if (previousValue !== null) {
    const diff = value - previousValue;
    const absDiff = Math.abs(diff);

    if (absDiff > range / 2) {
      if (previousValue > min + range * 0.75 && value < min + range * 0.25) {
        return min;
      }
      if (previousValue < min + range * 0.25 && value > min + range * 0.75) {
        return max;
      }
    }
  }

  if (value > max) {
    return min + (value - max);
  }
  if (value < min) {
    return max - (min - value);
  }

  return value;
}

export interface CircularSliderRootProps
  extends
    Omit<
      useRender.ComponentProps<"div">,
      "onChange" | "defaultValue" | "aria-valuetext"
    >,
    VariantProps<typeof circularSliderVariants> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number, reason: ChangeReason) => void;
  onValueCommitted?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  startAngle?: number;
  direction?: "clockwise" | "counterclockwise";
  continuous?: boolean;
  disabled?: boolean;
  size?: number;
  // Form integration props
  name?: string;
  id?: string;
  required?: boolean;
  form?: string;
  // Accessibility props
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-valuetext"?: string | ((value: number) => string);
}

export function CircularSliderRoot({
  className,
  render,
  ref: forwardedRef,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = 10,
  startAngle = 0,
  direction = "clockwise",
  continuous = true,
  disabled = false,
  size = 96,
  variant = "default",
  // Form integration props
  name,
  id,
  required,
  form: formProp,
  // Accessibility props
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  "aria-valuetext": ariaValuetext,
  ...props
}: CircularSliderRootProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const value = isControlled ? valueProp : internalValue;

  const [isDragging, setIsDragging] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previousValue = React.useRef<number | null>(null);
  // Focus modality: `:focus-visible` can't distinguish pointer-initiated
  // programmatic focus on a range input (inputs that accept keyboard always
  // match it), so track it ourselves. Set before the pointer-down focus call,
  // consumed by the input's onFocus.
  const focusFromPointer = React.useRef(false);

  const handleValueChange = React.useCallback(
    (newValue: number, reason: ChangeReason) => {
      if (disabled) return;

      let processedValue = roundToStep(newValue, step, min);

      if (continuous) {
        processedValue = wrapValueWithDirection(
          processedValue,
          min,
          max,
          previousValue.current,
        );
      } else {
        processedValue = clamp(processedValue, min, max);
      }

      previousValue.current = processedValue;

      if (!isControlled) {
        setInternalValue(processedValue);
      }

      onValueChange?.(processedValue, reason);
    },
    [disabled, step, min, max, continuous, isControlled, onValueChange],
  );

  const handleValueCommitted = React.useCallback(
    (committedValue: number) => {
      if (disabled) return;
      onValueCommitted?.(committedValue);
    },
    [disabled, onValueCommitted],
  );

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;

      // `currentTarget` is always the root div; no element ref needed.
      const container = e.currentTarget;

      const newValue = getValueFromPointerPosition(
        e,
        container,
        min,
        max,
        startAngle,
        direction,
        continuous,
      );

      previousValue.current = value;

      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      // Move focus to the hidden input so arrow keys work right after a
      // pointer interaction. `preventDefault` stops the compatibility
      // mousedown's native focus action from undoing it a moment later;
      // `focusFromPointer` keeps the focus ring hidden for this path (see the
      // input's onFocus).
      e.preventDefault();
      focusFromPointer.current = true;
      inputRef.current?.focus({ preventScroll: true });

      handleValueChange(newValue, "drag");
    },
    [
      disabled,
      value,
      min,
      max,
      startAngle,
      direction,
      continuous,
      handleValueChange,
    ],
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || disabled) return;

      const container = e.currentTarget;

      const newValue = getValueFromPointerPosition(
        e,
        container,
        min,
        max,
        startAngle,
        direction,
        continuous,
      );

      handleValueChange(newValue, "drag");
    },
    [
      isDragging,
      disabled,
      min,
      max,
      startAngle,
      direction,
      continuous,
      handleValueChange,
    ],
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      setIsDragging(false);
      // Guarded: on the cancel/lost-capture paths capture may already be gone,
      // and releasing an inactive pointer throws `NotFoundError`.
      const target = e.target as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
      handleValueCommitted(value);
    },
    [isDragging, value, handleValueCommitted],
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      previousValue.current = value;
      handleValueChange(parseFloat(e.target.value), "keyboard");
    },
    [value, handleValueChange],
  );

  // Only PageUp/PageDown need handling — arrows, Home, End are native range input behavior.
  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      // Keyboard use while focused = keyboard modality: show the ring even if
      // focus originally arrived via pointer (mirrors :focus-visible).
      setIsFocused(true);

      previousValue.current = value;

      if (e.key === "PageUp") {
        e.preventDefault();
        handleValueChange(value + largeStep, "keyboard");
      } else if (e.key === "PageDown") {
        e.preventDefault();
        handleValueChange(value - largeStep, "keyboard");
      }
    },
    [disabled, value, largeStep, handleValueChange],
  );

  const contextValue: CircularSliderContextValue = React.useMemo(
    () => ({
      value,
      min,
      max,
      step,
      startAngle,
      direction,
      continuous,
      disabled,
      size,
      variant: variant ?? "default",
      isDragging,
      isFocused,
      handleValueChange,
      handleValueCommitted,
    }),
    [
      value,
      min,
      max,
      step,
      startAngle,
      direction,
      continuous,
      disabled,
      size,
      variant,
      isDragging,
      isFocused,
      handleValueChange,
      handleValueCommitted,
    ],
  );

  const defaultProps = {
    "data-slot": SLOT_NAMES.ROOT,
    "data-size": size,
    "data-variant": variant,
    "data-dragging": isDragging || undefined,
    "data-disabled": disabled || undefined,
    "data-continuous": continuous || undefined,
    "data-focused": isFocused || undefined,
    className: cn(circularSliderVariants({ disabled }), className),
    style: {
      width: `${size}px`,
      height: `${size}px`,
    },
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    // Mirror pointer-up so an OS-cancelled gesture (touch interruption, context
    // menu) or any lost capture still clears `isDragging` and commits — without
    // these, `pointerup` never fires and the drag stays stuck. `handlePointerUp`'s
    // `isDragging` guard makes the post-`pointerup` `lostpointercapture` a no-op.
    onPointerCancel: handlePointerUp,
    onLostPointerCapture: handlePointerUp,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    ref: forwardedRef ?? null,
    // Pointer handlers close over `previousValue` (a ref). mergeProps never
    // invokes them or reads `.current` — the React Compiler false-positive is safe.
    // eslint-disable-next-line react-hooks/refs
    props: mergeProps<"div">(defaultProps, props),
  });

  const resolvedAriaValuetext =
    typeof ariaValuetext === "function" ? ariaValuetext(value) : ariaValuetext;

  return (
    <CircularSliderContext.Provider value={contextValue}>
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        // Show the ring for keyboard focus (Tab) but not for the programmatic
        // focus from a pointer interaction. (`:focus-visible` can't make this
        // distinction — keyboard-accepting inputs always match it.)
        onFocus={() => {
          setIsFocused(!focusFromPointer.current);
          focusFromPointer.current = false;
        }}
        onBlur={() => {
          setIsFocused(false);
          handleValueCommitted(value);
        }}
        disabled={disabled}
        name={name}
        id={id}
        required={required}
        form={formProp}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-valuetext={resolvedAriaValuetext}
        className="sr-only"
      />
      {element}
    </CircularSliderContext.Provider>
  );
}

export interface CircularSliderTrackProps extends useRender.ComponentProps<"svg"> {
  strokeWidth?: number;
}

export function CircularSliderTrack({
  className,
  render,
  strokeWidth,
  ...props
}: CircularSliderTrackProps) {
  const { continuous, size, variant } = useCircularSliderContext();

  const svgStrokeWidth = strokeWidthToSvgUnits(strokeWidth, size);

  // For non-continuous mode, render 270° arc from 225° to 135° (gap at bottom)
  const trackArcPath = continuous
    ? null
    : describeArc(
        SVG_CONFIG.CENTER_X,
        SVG_CONFIG.CENTER_Y,
        RADIUS_CONFIG.TRACK,
        225,
        135,
      );

  const trackElement = (
    <>
      {variant === "filled" && (
        <circle
          cx={SVG_CONFIG.CENTER_X}
          cy={SVG_CONFIG.CENTER_Y}
          r={RADIUS_CONFIG.FILLED_BACKGROUND}
          className="fill-muted group-data-focused:stroke-ring/50 stroke-transparent outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,stroke,fill] duration-100 ease-out outline-solid group-data-focused:stroke-4"
          strokeWidth="2"
        />
      )}

      {continuous ? (
        <circle
          cx={SVG_CONFIG.CENTER_X}
          cy={SVG_CONFIG.CENTER_Y}
          r={RADIUS_CONFIG.TRACK}
          fill="none"
          strokeWidth={svgStrokeWidth}
          className={cn(
            VARIANT_COLOR_MAP.track[
              variant as keyof typeof VARIANT_COLOR_MAP.track
            ],
            "transition-colors",
          )}
        />
      ) : (
        <path
          d={trackArcPath || ""}
          fill="none"
          strokeWidth={svgStrokeWidth}
          strokeLinecap="round"
          className={cn(
            VARIANT_COLOR_MAP.track[
              variant as keyof typeof VARIANT_COLOR_MAP.track
            ],
            "transition-colors",
          )}
        />
      )}
    </>
  );

  const defaultProps = createSvgOverlayProps(SLOT_NAMES.TRACK, className);

  const element = useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(defaultProps, {
      ...props,
      children: trackElement,
    }),
  });

  return element;
}

export interface CircularSliderIndicatorProps extends useRender.ComponentProps<"svg"> {
  strokeWidth?: number;
}

export function CircularSliderIndicator({
  className,
  render,
  strokeWidth,
  ...props
}: CircularSliderIndicatorProps) {
  const { value, min, max, startAngle, direction, continuous, size, variant } =
    useCircularSliderContext();

  const svgStrokeWidth = strokeWidthToSvgUnits(strokeWidth, size);

  // At max in continuous mode, a zero-length arc degenerates — use a full circle instead.
  const isFullCircle = continuous && value === max;

  let indicatorElement: React.ReactNode = null;

  if (isFullCircle) {
    indicatorElement = (
      <circle
        cx={SVG_CONFIG.CENTER_X}
        cy={SVG_CONFIG.CENTER_Y}
        r={RADIUS_CONFIG.TRACK}
        fill="none"
        strokeWidth={svgStrokeWidth}
        strokeLinecap="round"
        className={cn(
          VARIANT_COLOR_MAP.indicator[
            variant as keyof typeof VARIANT_COLOR_MAP.indicator
          ],
          "transition-colors",
        )}
      />
    );
  } else {
    const arcStartAngle = valueToAngle(
      min,
      min,
      max,
      startAngle,
      direction,
      continuous,
    );
    const arcEndAngle = valueToAngle(
      value,
      min,
      max,
      startAngle,
      direction,
      continuous,
    );
    const arcPath = describeArc(
      SVG_CONFIG.CENTER_X,
      SVG_CONFIG.CENTER_Y,
      RADIUS_CONFIG.TRACK,
      arcStartAngle,
      arcEndAngle,
      direction,
    );

    indicatorElement = arcPath ? (
      <path
        d={arcPath}
        fill="none"
        strokeWidth={svgStrokeWidth}
        strokeLinecap="round"
        className={cn(
          VARIANT_COLOR_MAP.indicator[
            variant as keyof typeof VARIANT_COLOR_MAP.indicator
          ],
          "transition-colors",
        )}
      />
    ) : null;
  }

  const defaultProps = createSvgOverlayProps(
    SLOT_NAMES.INDICATOR,
    className,
    false,
  );

  const element = useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(defaultProps, {
      ...props,
      children: indicatorElement,
    }),
  });

  return element;
}

export interface CircularSliderThumbProps extends useRender.ComponentProps<"div"> {
  size?: number;
}

export function CircularSliderThumb({
  className,
  render,
  size: thumbSize = 16,
  ...props
}: CircularSliderThumbProps) {
  const {
    value,
    min,
    max,
    startAngle,
    direction,
    continuous,
    isDragging,
    size: containerSize,
    variant,
  } = useCircularSliderContext();

  const angle = valueToAngle(
    value,
    min,
    max,
    startAngle,
    direction,
    continuous,
  );

  let radius = RADIUS_CONFIG.TRACK;
  if (variant === "filled") {
    const thumbSizeInSvgUnits = pixelsToSvgUnits(thumbSize, containerSize);
    // Center offset so the thumb's outer tip aligns with the background circle edge.
    radius = RADIUS_CONFIG.FILLED_BACKGROUND - thumbSizeInSvgUnits / 2;
  }

  const thumbPos = getThumbPosition(
    angle,
    radius,
    SVG_CONFIG.CENTER_X,
    SVG_CONFIG.CENTER_Y,
  );
  const leftPercent = (thumbPos.x / SVG_CONFIG.VIEWBOX_SIZE) * 100;
  const topPercent = (thumbPos.y / SVG_CONFIG.VIEWBOX_SIZE) * 100;

  // Filled thumb is a radial line — rotate by `angle` so it points toward the center.
  const transform =
    variant === "filled"
      ? `translate(-50%, -50%) rotate(${angle}deg)`
      : "translate(-50%, -50%)";

  // Dynamic sizing styles
  const thumbStyles: React.CSSProperties = {
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    transform,
    ...(variant === "default"
      ? {
          width: `${thumbSize}px`,
          height: `${thumbSize}px`,
        }
      : {
          width: "2px",
          height: `${thumbSize}px`,
        }),
  };

  const defaultProps = {
    "data-slot": SLOT_NAMES.THUMB,
    className: cn(thumbVariants({ variant, dragging: isDragging }), className),
    style: thumbStyles,
    role: "presentation",
    "aria-hidden": true,
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

export interface CircularSliderValueProps extends useRender.ComponentProps<"div"> {
  formatValue?: (value: number) => string;
}

export function CircularSliderValue({
  className,
  render,
  formatValue: formatValueProp,
  ...props
}: CircularSliderValueProps) {
  const { value } = useCircularSliderContext();

  const displayValue = formatValueProp
    ? formatValueProp(value)
    : Math.round(value).toString();

  const defaultProps = {
    "data-slot": SLOT_NAMES.VALUE,
    className: cn(
      "absolute inset-0 flex items-center justify-center font-medium tabular-nums text-sm",
      className,
    ),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, {
      ...props,
      children: displayValue,
    }),
  });

  return element;
}

export interface CircularSliderMarkersProps extends useRender.ComponentProps<"svg"> {
  count?: number;
  length?: number;
}

export function CircularSliderMarkers({
  className,
  render,
  count = 12,
  length,
  ...props
}: CircularSliderMarkersProps) {
  const { min, max, startAngle, direction, continuous, size, variant } =
    useCircularSliderContext();

  // Default marker length: 10px (filled) / 5px (default)
  const defaultLength = variant === "filled" ? 10 : 5;
  const markerLengthInPixels = length ?? defaultLength;
  const markerLengthInSvgUnits = pixelsToSvgUnits(markerLengthInPixels, size);

  const markers = Array.from({ length: count }, (_, i) => {
    const value = min + (i / count) * (max - min);
    const angle = valueToAngle(
      value,
      min,
      max,
      startAngle,
      direction,
      continuous,
    );

    let outerRadius: number;
    let innerRadius: number;

    if (variant === "filled") {
      outerRadius = RADIUS_CONFIG.FILLED_BACKGROUND;
      innerRadius = RADIUS_CONFIG.FILLED_BACKGROUND - markerLengthInSvgUnits;
    } else {
      const trackInnerEdge = getTrackInnerEdge(16, size);
      outerRadius = trackInnerEdge;
      innerRadius = trackInnerEdge - markerLengthInSvgUnits;
    }

    const outerPos = getThumbPosition(
      angle,
      outerRadius,
      SVG_CONFIG.CENTER_X,
      SVG_CONFIG.CENTER_Y,
    );
    const innerPos = getThumbPosition(
      angle,
      innerRadius,
      SVG_CONFIG.CENTER_X,
      SVG_CONFIG.CENTER_Y,
    );

    return {
      value,
      angle,
      outerPos,
      innerPos,
    };
  });

  // Calculate dynamic marker strokeWidth: scales from md baseline (1.5 at 96px)
  const markerStrokeWidth = (size / 96) * 1.5;

  const markerElements = (
    <g className="stroke-muted-foreground/50">
      {markers.map((marker, i) => (
        <line
          key={i}
          x1={marker.innerPos.x}
          y1={marker.innerPos.y}
          x2={marker.outerPos.x}
          y2={marker.outerPos.y}
          strokeWidth={markerStrokeWidth}
          strokeLinecap="round"
        />
      ))}
    </g>
  );

  const defaultProps = createSvgOverlayProps(
    SLOT_NAMES.MARKERS,
    className,
    false,
  );

  const element = useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(defaultProps, {
      ...props,
      children: markerElements,
    }),
  });

  return element;
}
