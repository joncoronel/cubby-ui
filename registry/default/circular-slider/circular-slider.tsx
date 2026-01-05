"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import {
  valueToAngle,
  angleToValue,
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

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Variants
// ============================================================================

const circularSliderVariants = cva(
  "group relative inline-block touch-none select-none outline-none",
  {
    variants: {
      variant: {
        default: "",
        filled: "",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
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
  "absolute outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid",
  {
    variants: {
      variant: {
        default:
          "rounded-full border-3 border-primary dark:bg-black bg-white group-data-focused:outline-ring group-data-focused:outline-2 group-data-focused:outline-offset-2",
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Wrap value for continuous mode with direction tracking (max inclusive)
 * Detects boundary crossings to determine if position should show min or max
 */
function wrapValueWithDirection(
  value: number,
  min: number,
  max: number,
  previousValue: number | null,
): number {
  const range = max - min;

  // If we have a previous value, detect boundary crossing
  if (previousValue !== null) {
    // Check if we crossed the boundary (value jumped more than half the range)
    const diff = value - previousValue;
    const absDiff = Math.abs(diff);

    if (absDiff > range / 2) {
      // Boundary crossing detected
      // If previous was near max and new is near min → crossing clockwise → allow max
      if (previousValue > min + range * 0.75 && value < min + range * 0.25) {
        // User is incrementing past max, wrap to min
        return min;
      }
      // If previous was near min and new is near max → crossing counterclockwise → wrap to max
      if (previousValue < min + range * 0.25 && value > min + range * 0.75) {
        // User is decrementing past min, wrap to max
        return max;
      }
    }
  }

  // Standard wrapping when not crossing boundary
  if (value > max) {
    return min + (value - max);
  }
  if (value < min) {
    return max - (min - value);
  }

  return value;
}

// ============================================================================
// Root Component
// ============================================================================

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
  endAngle?: number;
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
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = 10,
  startAngle = 0,
  endAngle,
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previousValue = React.useRef<number | null>(null);

  const handleValueChange = React.useCallback(
    (newValue: number, reason: ChangeReason) => {
      if (disabled) return;

      // Apply step rounding
      let processedValue = roundToStep(newValue, step, min);

      // Handle wrapping and clamping
      if (continuous) {
        // Wrapping for continuous mode with direction tracking (max is inclusive)
        processedValue = wrapValueWithDirection(
          processedValue,
          min,
          max,
          previousValue.current,
        );
      } else {
        // Clamp to min/max in non-continuous mode
        processedValue = clamp(processedValue, min, max);
      }

      // Update previous value for direction tracking
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

  // Handle pointer events
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;

      const container = containerRef.current;
      if (!container) return;

      const newValue = getValueFromPointerPosition(
        e,
        container,
        min,
        max,
        startAngle,
        direction,
        continuous,
      );

      // Initialize previous value for direction tracking
      previousValue.current = value;

      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      // Update value immediately
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
    (e: React.PointerEvent) => {
      if (!isDragging || disabled) return;

      const container = containerRef.current;
      if (!container) return;

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
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      handleValueCommitted(value);
    },
    [isDragging, value, handleValueCommitted],
  );

  // Handle input change from native range input
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      previousValue.current = value;
      handleValueChange(parseFloat(e.target.value), "keyboard");
    },
    [value, handleValueChange],
  );

  // Handle keyboard navigation for largeStep (PageUp/PageDown)
  // Native input handles arrows, Home, End automatically
  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

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
    ref: containerRef,
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
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  const resolvedAriaValuetext =
    typeof ariaValuetext === "function" ? ariaValuetext(value) : ariaValuetext;

  return (
    <CircularSliderContext.Provider value={contextValue}>
      {/* Hidden native input for accessibility and form integration */}
      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={() => setIsFocused(true)}
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

// ============================================================================
// Track Component
// ============================================================================

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
      {/* Filled background circle for filled variant */}
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
        // Full circle for continuous mode
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
        // 270° arc for non-continuous mode (gap centered at bottom)
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

// ============================================================================
// Indicator Component
// ============================================================================

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

  // In continuous mode, when value equals max, show full circle instead of arc
  const isFullCircle = continuous && value === max;

  let indicatorElement: React.ReactNode = null;

  if (isFullCircle) {
    // Draw full circle when at max in continuous mode
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
    // Draw arc for normal cases
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

// ============================================================================
// Thumb Component
// ============================================================================

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

  // Calculate position on circle
  // Default variant: position at track edge
  // Filled variant: position so outer tip is at background circle edge
  let radius = RADIUS_CONFIG.TRACK;
  if (variant === "filled") {
    // Convert thumbSize pixels to SVG units
    const thumbSizeInSvgUnits = pixelsToSvgUnits(thumbSize, containerSize);
    // Position center so outer tip is at background circle edge
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

  // For filled variant, the thumb is a line that points toward the center
  // We rotate it by the angle to make it radial (pointing inward)
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

// ============================================================================
// Value Component
// ============================================================================

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

// ============================================================================
// Markers Component
// ============================================================================

export interface CircularSliderMarkersProps extends useRender.ComponentProps<"svg"> {
  count?: number;
  showLabels?: boolean;
  length?: number;
}

export function CircularSliderMarkers({
  className,
  render,
  count = 12,
  showLabels = false,
  length,
  ...props
}: CircularSliderMarkersProps) {
  const { min, max, startAngle, direction, continuous, size, variant } =
    useCircularSliderContext();

  // Convert marker length from pixels to SVG units
  // Default length: 10px for filled variant, 5px for default variant
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
      // For filled variant, position outer end at background circle edge
      outerRadius = RADIUS_CONFIG.FILLED_BACKGROUND;
      innerRadius = RADIUS_CONFIG.FILLED_BACKGROUND - markerLengthInSvgUnits;
    } else {
      // For default variant, position outer end at track inner edge
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
