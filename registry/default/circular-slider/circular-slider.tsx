"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import { useControllableState } from "@/registry/default/hooks/use-controllable-state";
import {
  angleToProgress,
  angleToUnclampedProgress,
  angularDistance,
  arcStroke,
  clamp,
  continueDrag,
  createDial,
  easeOutExpoTimeAt,
  getActiveSpan,
  isInSpan,
  mod,
  pickOverlappedThumb,
  pointToAngle,
  ringHeight,
  trimOriginCap,
  progressToAngle,
  progressToValue,
  round,
  snapValue,
  tickProgresses,
  valueToProgress,
  widenSpan,
  wrapDelta,
  placeRangeThumb,
  type CircularSliderDirection,
  type Dial,
  type Span,
  type ThumbCollision,
} from "./lib/geometry";

/** Duration of a value change that animates (click, Home/End/Page, external). */
const SETTLE_MS = 350;
/** Gap between a knob face and the tick band around it, in px. */
const KNOB_GAP = 6;
/** Pixels of vertical drag that cover the whole sweep in `dragMode="vertical"`. */
const VERTICAL_DRAG_PX = 200;

export type CircularSliderChangeReason = "drag" | "click" | "keyboard";

export interface CircularSliderChangeDetails {
  reason: CircularSliderChangeReason;
  /** Index of the thumb that moved; `-1` when a range span moved as a whole. */
  activeThumbIndex: number;
}

type SliderValue = number | readonly number[];

interface CircularSliderContextValue {
  dial: Dial;
  values: readonly number[];
  /** Values before the latest change, for timing the tick sweep. */
  previousValues: readonly number[];
  origin: number;
  size: number;
  thickness: number;
  /** How far the band sits in from the edge, making room for a pill thumb. */
  inset: number;
  thumbShape: "bead" | "pill";
  variant: "ring" | "knob";
  pressed: boolean;
  dragging: boolean;
  activeIndex: number;
  focusVisibleIndex: number | null;
  /** The latest change lands without a transition. */
  instant: boolean;
  formatValue?: (value: number, index: number) => string;
}

const CircularSliderContext =
  React.createContext<CircularSliderContextValue | null>(null);

function useCircularSliderContext(): CircularSliderContextValue {
  const context = React.useContext(CircularSliderContext);
  if (!context) {
    throw new Error(
      "CircularSlider parts must be rendered inside <CircularSliderRoot>.",
    );
  }
  return context;
}

function toArray(value: SliderValue): readonly number[] {
  return typeof value === "number" ? [value] : value;
}

function sameValues(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Thumb nearest a screen angle; ties go to the last one moved. */
function nearestThumb(
  dial: Dial,
  values: readonly number[],
  angle: number,
  preferred: number,
): number {
  let best = preferred;
  let bestDistance = Infinity;
  values.forEach((value, index) => {
    const distance = angularDistance(
      progressToAngle(dial, valueToProgress(dial, value)),
      angle,
    );
    if (
      distance < bestDistance - 0.001 ||
      (Math.abs(distance - bestDistance) <= 0.001 && index === preferred)
    ) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

/** Radial slop, in px, a press may land outside the band and still count. */
const BAND_SLOP = 8;
/** Pointer travel, in px of arc, that settles which overlapped thumb is held. */
const PICK_TRAVEL = 4;
/** Share of a knob's radius around its center where drags are ignored. */
const KNOB_DEAD_ZONE = 0.15;

interface PointerGeometry {
  /** Screen angle of the pointer around the dial's center. */
  angle: number;
  /** Distance from the center, in screen px. */
  distance: number;
  /** Rendered px per authored px, for a root resized with CSS. */
  scale: number;
  /** Radius of the band's center line, in screen px. */
  bandRadius: number;
  /** Degrees of arc a thumb answers to either side of its center. */
  grabDegrees: number;
}

/**
 * Where a pointer sits relative to the dial. Press and hover both read this,
 * so what a hover marks as grabbable is exactly what a press grabs.
 */
function measurePointer(
  event: React.PointerEvent<HTMLElement>,
  size: number,
  thickness: number,
  inset: number,
): PointerGeometry {
  const rect = event.currentTarget.getBoundingClientRect();
  const scale = rect.width / size;
  const cx = rect.left + rect.width / 2;
  // The dial is the square at the top of the root (a half dial is shorter).
  const cy = rect.top + rect.width / 2;
  const bandRadiusPx = rect.width / 2 - (inset + thickness / 2) * scale || 1;
  return {
    angle: pointToAngle(event.clientX, event.clientY, cx, cy),
    distance: Math.hypot(event.clientX - cx, event.clientY - cy),
    scale,
    bandRadius: bandRadiusPx,
    grabDegrees:
      ((thickness * scale * 0.75 + 8 * scale) / bandRadiusPx) * (180 / Math.PI),
  };
}

/** Degrees of arc a slop of `px` covers at the band's radius. */
function slopDegrees(px: number, radius: number): number {
  return ((px / radius) * 180) / Math.PI;
}

interface DragBase {
  pointerId: number;
  /** A value changed during the gesture, so release commits. */
  changed: boolean;
}

/** Holding one thumb; it follows the pointer at the offset it was grabbed. */
interface ThumbDrag extends DragBase {
  mode: "thumb";
  index: number;
  /** Raw pointer progress at the last sample. */
  lastPointer: number;
  grabOffset: number;
}

/**
 * Pressed where both of a range's thumbs sit. Which one is held is decided
 * by the first clear move, so the drag takes the thumb that can go that way.
 */
interface PendingDrag extends DragBase {
  mode: "pending";
  downPointer: number;
  bandRadius: number;
}

/** Holding a range's filled span; both ends shift together. */
interface SpanDrag extends DragBase {
  mode: "span";
  lastPointer: number;
  /** Thumb progresses when the drag began; the shift is measured from these. */
  start: number[];
  shift: number;
}

/** Turning a knob, or dragging up and down in `dragMode="vertical"`. */
interface TurnDrag extends DragBase {
  mode: "knob" | "vertical";
  index: number;
  /** Progress the gesture has accumulated, unsnapped. */
  progress: number;
  lastAngle: number;
  lastY: number;
}

type DragState = ThumbDrag | PendingDrag | SpanDrag | TurnDrag;

export interface CircularSliderRootProps<
  Value extends SliderValue = number,
> extends Omit<
  useRender.ComponentProps<"div">,
  "defaultValue" | "onChange" | "dir"
> {
  /** Controlled value. Pass an array of two numbers for a range. */
  value?: Value;
  /** Uncontrolled initial value. Pass an array of two numbers for a range. */
  defaultValue?: Value;
  onValueChange?: (value: Value, details: CircularSliderChangeDetails) => void;
  /** Fires when an interaction ends: pointer release or a keyboard step. */
  onValueCommitted?: (value: Value) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Step for Page Up / Page Down and Shift + arrow keys. */
  largeStep?: number;
  /** Arc length of the dial in degrees, from 1 to 360. */
  sweep?: number;
  /**
   * Screen angle of `min`, in degrees clockwise from 12 o'clock. Defaults to
   * centering the sweep on the top so a partial dial's gap sits at the bottom.
   */
  startAngle?: number;
  direction?: CircularSliderDirection;
  /**
   * On a full circle, let values loop past `max` back to `min` (angles,
   * hours). Max and min then share a position.
   */
  wrap?: boolean;
  /**
   * Where the indicator grows from. Defaults to `min`; set it to a midpoint
   * for a bipolar control, or to a live reading to show the distance to a
   * target. Ignored by ranges.
   */
  origin?: number;
  /** Diameter in px. */
  size?: number;
  /** Width in px of the outer band: the ring's stroke or the knob's ticks. */
  thickness?: number;
  /**
   * `ring` is a stroke you grab anywhere along. `knob` is a raised face you
   * turn: grabbing it never jumps the value.
   */
  variant?: "ring" | "knob";
  /**
   * `angular` follows the pointer around the center. `vertical` turns the
   * value with up and down drags, like an audio knob.
   */
  dragMode?: "angular" | "vertical";
  disabled?: boolean;
  name?: string;
  form?: string;
  /**
   * The thumb's look. On a ring, `bead` sits inside the band at the end of
   * the indicator and `pill` is a slim handle across the band that overhangs
   * it (the band moves in to make room, so the dial keeps its size). On a
   * knob it is the face's marker: a dot or a line. Defaults to `bead` on a
   * ring and `pill` on a knob.
   */
  thumbShape?: "bead" | "pill";
  /** Least distance, in steps, between a range's thumbs. */
  minStepsBetweenValues?: number;
  /**
   * What a range thumb does when it runs into the other: `push` carries the
   * other along, `none` stops it there.
   */
  thumbCollisionBehavior?: ThumbCollision;
  /**
   * Formats each value for display, e.g. `(v) => \`${v}°\``. Read by
   * `CircularSliderValue`, and spoken by screen readers unless
   * `getAriaValueText` says otherwise.
   */
  formatValue?: (value: number, index: number) => string;
  /**
   * Accessible name for each thumb of a range. Defaults to "Start" and
   * "End", with `aria-label` naming the range as a whole.
   */
  getAriaLabel?: (index: number) => string;
  /** Spoken value for a thumb. Defaults to `formatValue`. */
  getAriaValueText?: (value: number, index: number) => string;
}

function CircularSliderRoot<Value extends SliderValue = number>({
  className,
  render,
  style,
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  largeStep = 10,
  sweep = 270,
  startAngle,
  direction = "clockwise",
  wrap = false,
  origin: originProp,
  size = 144,
  thickness: thicknessProp = 12,
  variant = "ring",
  dragMode = "angular",
  disabled = false,
  name,
  form,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  formatValue,
  getAriaLabel,
  getAriaValueText,
  thumbShape: thumbShapeProp,
  minStepsBetweenValues = 0,
  thumbCollisionBehavior = "push",
  ...props
}: CircularSliderRootProps<Value>) {
  // Past about 30% of the diameter a band stops reading as a ring and the
  // middle closes into a disc, so cap it there.
  const thickness = Math.min(thicknessProp, size * 0.3);
  const thumbShape = thumbShapeProp ?? (variant === "knob" ? "pill" : "bead");
  const dial = React.useMemo(
    () => createDial({ min, max, step, sweep, startAngle, direction, wrap }),
    [min, max, step, sweep, startAngle, direction, wrap],
  );

  const [rawValue, setRawValue] = useControllableState<SliderValue>({
    value: valueProp,
    defaultValue: defaultValue ?? min,
  });
  // Normalized once, so the text, the arc, the hidden input and what a screen
  // reader announces all agree: a value past either end clamps (or folds, on a
  // wrapping dial) and lands on the step grid, the way the native input would.
  const values = toArray(rawValue).map((v) => snapValue(dial, v));
  const isRange = typeof rawValue !== "number";
  const origin = clamp(originProp ?? min, min, max);
  const inset =
    variant === "ring" && thumbShape === "pill" ? pillOverhang(thickness) : 0;
  const height =
    variant === "ring" ? ringHeight(dial, size, thickness, inset) : size;
  const thumbGap = Math.max(0, minStepsBetweenValues) * step;
  const spokenValue = getAriaValueText ?? formatValue;

  // Latest values for event handlers, which outlive the render they came from.
  const valuesRef = React.useRef(values);
  React.useEffect(() => {
    valuesRef.current = values;
  });

  // Arrow-key steps repeat many times a second while a key is held, so they
  // land instantly; a sweep per step would trail the value. Keyed by the
  // values they produced, and cleared by any other change, so a later change
  // from anywhere else animates even if it lands on the same values.
  const [instantKey, setInstantKey] = React.useState<string | null>(null);

  // The values before the latest change, kept for the tick sweep. Stored
  // during render (the "previous props" pattern) so the first frame of a
  // change already knows where it came from.
  const valuesKey = values.join(",");
  const [history, setHistory] = React.useState({
    key: valuesKey,
    previous: values,
    current: values,
  });
  if (history.key !== valuesKey) {
    setHistory({ key: valuesKey, previous: history.current, current: values });
    if (instantKey !== valuesKey) setInstantKey(null);
  }

  // A small step across the seam of a wrapping dial (359° to 0°) would spin
  // the arc and thumb nearly a full turn the wrong way, so it lands without
  // a transition. A large jump (a click across the dial) still sweeps.
  const crossedSeam =
    dial.wrap &&
    history.previous.length === values.length &&
    history.previous.some((previous, i) => {
      const from = valueToProgress(dial, previous);
      const to = valueToProgress(dial, values[i]);
      return (
        Math.abs(to - from) > 180 && Math.abs(wrapDelta(from, to, 360)) < 90
      );
    });
  const instant = crossedSeam || instantKey === valuesKey;

  const [pressed, setPressed] = React.useState(false);
  // Over a thumb, or a range's filled span: something a press would hold
  // rather than jump.
  const [grabHover, setGrabHover] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [focusVisibleIndex, setFocusVisibleIndex] = React.useState<
    number | null
  >(null);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const dragRef = React.useRef<DragState | null>(null);
  // `:focus-visible` always matches a focused range input, so pointer-driven
  // focus is told apart by hand: set before the pointer focuses the input,
  // consumed by its focus handler.
  const focusFromPointer = React.useRef(false);

  // Move keyboard focus to a thumb's input after a pointer interaction, so
  // arrow keys keep working. An input that already has focus fires no focus
  // event, so the flag is only set when one will.
  const focusThumbInput = React.useCallback((index: number) => {
    const input = inputRefs.current[index];
    if (!input || document.activeElement === input) return;
    focusFromPointer.current = true;
    input.focus({ preventScroll: true });
  }, []);

  const emit = React.useCallback(
    (next: readonly number[]): Value =>
      (isRange ? next : next[0]) as unknown as Value,
    [isRange],
  );

  const commitValues = React.useCallback(
    (next: number[], details: CircularSliderChangeDetails): boolean => {
      if (sameValues(next, valuesRef.current)) return false;
      valuesRef.current = next;
      setRawValue(isRange ? next : next[0]);
      onValueChange?.(emit(next), details);
      return true;
    },
    [isRange, setRawValue, onValueChange, emit],
  );

  // The one path every input takes to move a thumb: pointer, keyboard and
  // assistive tech all go through the same gap and collision rules.
  const moveThumb = React.useCallback(
    (
      index: number,
      candidate: number,
      reason: CircularSliderChangeReason,
    ): number[] => {
      const next = placeRangeThumb(
        dial,
        valuesRef.current,
        index,
        snapValue(dial, candidate),
        thumbGap,
        thumbCollisionBehavior,
      );
      commitValues(next, { reason, activeThumbIndex: index });
      return next;
    },
    [dial, thumbGap, thumbCollisionBehavior, commitValues],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;
      const root = event.currentTarget;
      const g = measurePointer(event, size, thickness, inset);
      const outer = (size / 2) * g.scale;
      const slop = BAND_SLOP * g.scale;

      if (variant === "ring") {
        // A ring only answers along its band, so whatever sits in the middle
        // stays clickable, and not in the gap of a partial sweep.
        const bandInner = outer - (inset + thickness) * g.scale;
        if (g.distance < bandInner - slop || g.distance > outer + slop) return;
        if (!dial.wrap && dial.sweep < 360) {
          const p = angleToUnclampedProgress(dial, g.angle);
          const edge = slopDegrees(
            (thickness * g.scale) / 2 + slop,
            g.bandRadius,
          );
          if (p < -edge || p > dial.sweep + edge) return;
        }
      } else if (g.distance > outer + slop) {
        // A knob answers anywhere on its face.
        return;
      }

      const current = valuesRef.current;
      const pointer = angleToProgress(dial, g.angle);
      const index =
        current.length > 1
          ? nearestThumb(dial, current, g.angle, activeIndex)
          : 0;
      const thumbProgress = valueToProgress(dial, current[index]);
      const base = { pointerId: event.pointerId, changed: false };
      let drag: DragState;

      if (dragMode === "vertical" || variant === "knob") {
        drag = {
          ...base,
          mode: dragMode === "vertical" ? "vertical" : "knob",
          index,
          progress: thumbProgress,
          lastAngle: g.angle,
          lastY: event.clientY,
        };
      } else {
        const near = (v: number) =>
          angularDistance(
            progressToAngle(dial, valueToProgress(dial, v)),
            g.angle,
          ) <= g.grabDegrees;
        if (current.filter(near).length > 1) {
          drag = {
            ...base,
            mode: "pending",
            downPointer: pointer,
            bandRadius: g.bandRadius,
          };
        } else if (near(current[index])) {
          // Grabbing the thumb itself holds on without moving it.
          drag = {
            ...base,
            mode: "thumb",
            index,
            lastPointer: pointer,
            grabOffset: dial.wrap
              ? wrapDelta(pointer, thumbProgress, 360)
              : thumbProgress - pointer,
          };
        } else if (
          current.length > 1 &&
          isInSpan(dial, pointer, getActiveSpan(dial, current, origin))
        ) {
          drag = {
            ...base,
            mode: "span",
            lastPointer: pointer,
            start: current.map((v) => valueToProgress(dial, v)),
            shift: 0,
          };
        } else {
          // Anywhere else on the band jumps (and animates) the nearest thumb
          // there, then holds it.
          const next = moveThumb(
            index,
            progressToValue(dial, pointer),
            "click",
          );
          drag = {
            ...base,
            changed: !sameValues(next, current),
            mode: "thumb",
            index,
            lastPointer: pointer,
            grabOffset: 0,
          };
        }
      }

      dragRef.current = drag;
      // Synthetic events (tests, automation) carry no live pointer to capture.
      try {
        root.setPointerCapture(event.pointerId);
      } catch {}
      setPressed(true);
      const held = "index" in drag ? drag.index : 0;
      if ("index" in drag) setActiveIndex(drag.index);
      // preventDefault stops the compatibility mousedown from moving focus
      // straight back off the input.
      event.preventDefault();
      focusThumbInput(held);
    },
    [
      disabled,
      size,
      thickness,
      inset,
      variant,
      dragMode,
      dial,
      origin,
      activeIndex,
      moveThumb,
      focusThumbInput,
    ],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) {
        if (variant === "ring" && event.pointerType === "mouse") {
          const g = measurePointer(event, size, thickness, inset);
          const current = valuesRef.current;
          const overThumb = current.some(
            (v) =>
              angularDistance(
                progressToAngle(dial, valueToProgress(dial, v)),
                g.angle,
              ) <= g.grabDegrees,
          );
          const overSpan =
            current.length > 1 &&
            isInSpan(
              dial,
              angleToProgress(dial, g.angle),
              getActiveSpan(dial, current, origin),
            );
          const over = overThumb || overSpan;
          if (over !== grabHover) setGrabHover(over);
        }
        return;
      }
      if (drag.pointerId !== event.pointerId) return;
      if (!dragging) setDragging(true);

      const g = measurePointer(event, size, thickness, inset);
      const period = dial.sweep;
      const settle = (progress: number): number =>
        dial.wrap ? mod(progress, period) : clamp(progress, 0, period);
      const mark = (changed: boolean) => {
        if (changed) drag.changed = true;
      };

      if (drag.mode === "knob" || drag.mode === "vertical") {
        if (drag.mode === "knob") {
          // Near the center a pixel of travel swings the angle wildly, so
          // ignore it there, without moving the reference angle.
          const radius = (size / 2) * g.scale;
          if (g.distance < radius * KNOB_DEAD_ZONE) return;
        }
        const delta =
          drag.mode === "knob"
            ? wrapDelta(drag.lastAngle, g.angle, 360) * dial.dir
            : ((drag.lastY - event.clientY) / VERTICAL_DRAG_PX) * period;
        drag.lastAngle = g.angle;
        drag.lastY = event.clientY;
        drag.progress = settle(drag.progress + delta);
        const before = valuesRef.current;
        const next = moveThumb(
          drag.index,
          progressToValue(dial, drag.progress),
          "drag",
        );
        mark(!sameValues(next, before));
        // Blocked by the other thumb or a gap: restart from where the thumb
        // actually is, so turning back responds at once.
        const wanted = snapValue(dial, progressToValue(dial, drag.progress));
        if (next[drag.index] !== wanted) {
          drag.progress = valueToProgress(dial, next[drag.index]);
        }
        return;
      }

      if (drag.mode === "span") {
        const pointer = continueDrag(
          dial,
          drag.lastPointer,
          angleToProgress(dial, g.angle),
        );
        drag.shift += dial.wrap
          ? wrapDelta(drag.lastPointer, pointer, 360)
          : pointer - drag.lastPointer;
        drag.lastPointer = pointer;
        // Shift both ends by the pointer's total travel since the drag began
        // (re-snapping per sample would drift), stopping at the dial's ends.
        if (!dial.wrap) {
          drag.shift = clamp(
            drag.shift,
            -Math.min(...drag.start),
            period - Math.max(...drag.start),
          );
        }
        const next = drag.start.map((p) =>
          snapValue(dial, progressToValue(dial, settle(p + drag.shift))),
        );
        mark(commitValues(next, { reason: "drag", activeThumbIndex: -1 }));
        return;
      }

      // The pointer may run past an end into the gap; add the grab offset
      // before clamping so a thumb held off-center still reaches min and max.
      const raw = dial.wrap
        ? angleToProgress(dial, g.angle)
        : angleToUnclampedProgress(dial, g.angle);

      let held: ThumbDrag;
      if (drag.mode === "pending") {
        const moved = dial.wrap
          ? wrapDelta(drag.downPointer, raw, 360)
          : raw - drag.downPointer;
        // Wait for a clear direction, measured on screen so finger jitter
        // does not decide it.
        if ((Math.abs(moved) * Math.PI * drag.bandRadius) / 180 < PICK_TRAVEL) {
          return;
        }
        const index = pickOverlappedThumb(dial, valuesRef.current, moved > 0);
        const thumbProgress = valueToProgress(dial, valuesRef.current[index]);
        held = {
          pointerId: drag.pointerId,
          changed: drag.changed,
          mode: "thumb",
          index,
          lastPointer: drag.downPointer,
          grabOffset: dial.wrap
            ? wrapDelta(drag.downPointer, thumbProgress, 360)
            : thumbProgress - drag.downPointer,
        };
        dragRef.current = held;
        setActiveIndex(index);
        focusThumbInput(index);
      } else if (drag.mode === "thumb") {
        held = drag;
      } else {
        return;
      }

      const pointer = continueDrag(dial, held.lastPointer, raw);
      held.lastPointer = pointer;
      // Pinned at an end after crossing the seam or the gap's far side: sit
      // exactly on that end rather than an offset away from it.
      const target =
        pointer !== raw ? pointer : settle(pointer + held.grabOffset);
      const before = valuesRef.current;
      const next = moveThumb(held.index, progressToValue(dial, target), "drag");
      if (!sameValues(next, before)) held.changed = true;
    },
    [
      dragging,
      dial,
      variant,
      size,
      thickness,
      inset,
      origin,
      grabHover,
      moveThumb,
      commitValues,
      focusThumbInput,
    ],
  );

  const handlePointerEnd = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setPressed(false);
      setDragging(false);
      // Guarded: on the cancel and lost-capture paths the capture may already
      // be gone, and releasing an inactive pointer throws.
      const root = event.currentTarget;
      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId);
      }
      if (drag.changed) onValueCommitted?.(emit(valuesRef.current));
    },
    [onValueCommitted, emit],
  );

  const handleKeyDown = React.useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      // Keyboard use means keyboard modality, even if focus arrived by pointer.
      setFocusVisibleIndex(index);

      const current = valuesRef.current[index];
      const big = event.shiftKey ? largeStep : step;
      let candidate: number | null = null;
      switch (event.key) {
        case "ArrowUp":
        case "ArrowRight":
          candidate = current + big;
          break;
        case "ArrowDown":
        case "ArrowLeft":
          candidate = current - big;
          break;
        case "PageUp":
          candidate = current + largeStep;
          break;
        case "PageDown":
          candidate = current - largeStep;
          break;
        case "Home":
          candidate = min;
          break;
        case "End":
          // On a wrapping dial max is min's position, so stop one step short.
          candidate = dial.wrap ? max - step : max;
          break;
        default:
          return;
      }
      event.preventDefault();
      const before = valuesRef.current;
      const next = moveThumb(index, candidate, "keyboard");
      setInstantKey(event.key.startsWith("Arrow") ? next.join(",") : null);
      setActiveIndex(index);
      if (!sameValues(next, before)) onValueCommitted?.(emit(next));
    },
    [
      disabled,
      largeStep,
      step,
      min,
      max,
      dial,
      moveThumb,
      onValueCommitted,
      emit,
    ],
  );

  // Assistive tech that adjusts the native input directly (VoiceOver swipes)
  // lands here rather than in keydown.
  const handleInputChange = React.useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const before = valuesRef.current;
      const next = moveThumb(index, Number(event.target.value), "keyboard");
      setInstantKey(next.join(","));
      if (!sameValues(next, before)) onValueCommitted?.(emit(next));
    },
    [moveThumb, onValueCommitted, emit],
  );

  const contextValue = React.useMemo<CircularSliderContextValue>(
    () => ({
      dial,
      values,
      previousValues: history.previous,
      origin,
      size,
      thickness,
      inset,
      thumbShape,
      variant,
      pressed,
      dragging,
      activeIndex,
      focusVisibleIndex,
      instant,
      formatValue,
    }),
    // `values` is a fresh array for scalar values; key it by content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dial,
      valuesKey,
      history.previous,
      origin,
      size,
      thickness,
      inset,
      thumbShape,
      variant,
      pressed,
      dragging,
      activeIndex,
      focusVisibleIndex,
      instant,
      formatValue,
    ],
  );

  const vertical = dragMode === "vertical";

  const defaultProps = {
    "data-slot": "circular-slider",
    "data-variant": variant,
    "data-drag-mode": dragMode,
    "data-pressed": pressed || undefined,
    "data-dragging": dragging || undefined,
    "data-instant": instant || undefined,
    "data-disabled": disabled || undefined,
    "data-range": isRange || undefined,
    "data-grab-hover": grabHover || undefined,
    // A range is two sliders; the group carries the shared name and each
    // thumb its own ("Start", "End").
    ...(isRange && {
      role: "group",
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
    }),
    className: cn(
      // A knob is all face, so it owns every touch on it. A ring only owns
      // touches on its band (the band layer below); swipes that start in the
      // middle still scroll the page.
      "group/circular-slider relative shrink-0 select-none",
      variant === "knob" && "touch-none",
      "data-disabled:pointer-events-none data-disabled:opacity-60",
      // A partial ring is shorter than its dial's square. Clip just below the
      // bottom so the empty rest of the square never covers (or catches
      // clicks meant for) whatever sits beneath; clip-path clips hit-testing
      // too. The other sides keep room for focus rings and the pill.
      height < size && "[clip-path:inset(-24px_-24px_-8px_-24px)]",
      variant === "knob" &&
        !disabled &&
        (vertical
          ? "cursor-ns-resize"
          : "cursor-grab data-pressed:cursor-grabbing"),
      className,
    ),
    style: {
      width: size,
      aspectRatio: `${size} / ${height}`,
      "--circular-slider-size": `${size}px`,
      // The open middle of the dial, for content centered in it.
      "--circular-slider-hole": `${Math.max(0, size - 2 * (variant === "knob" ? thickness + KNOB_GAP : inset + thickness))}px`,
      ...style,
    } as React.CSSProperties,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    // An OS-cancelled gesture (touch interruption, context menu) never sends
    // pointerup; these still end the drag and commit.
    onPointerCancel: handlePointerEnd,
    onLostPointerCapture: handlePointerEnd,
    onPointerLeave: () => setGrabHover(false),
    children: (
      // The dial's square, anchored to the top so a half dial can be shorter.
      <div
        data-slot="circular-slider-dial"
        className="absolute inset-x-0 top-0 isolate grid aspect-square place-items-center"
      >
        {variant === "ring" && (
          <div
            data-slot="circular-slider-band"
            aria-hidden
            className={cn(
              "absolute inset-0 z-1 touch-none",
              // A vertical drag never jumps, so no click-to-jump pointer.
              vertical
                ? "cursor-ns-resize"
                : "cursor-pointer group-data-grab-hover/circular-slider:cursor-grab group-data-pressed/circular-slider:cursor-grabbing",
            )}
            style={{ clipPath: bandClipPath(dial, size, thickness, inset) }}
          />
        )}
        {values.map((thumbValue, index) => (
          <input
            // Thumbs are positional and never reorder.
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            type="range"
            min={min}
            max={max}
            step={step}
            value={thumbValue}
            disabled={disabled}
            name={name}
            form={form}
            id={index === 0 ? id : undefined}
            aria-label={
              getAriaLabel?.(index) ??
              (isRange ? (index === 0 ? "Start" : "End") : ariaLabel)
            }
            aria-labelledby={isRange ? undefined : ariaLabelledby}
            aria-describedby={ariaDescribedby}
            aria-valuetext={spokenValue?.(thumbValue, index)}
            className="sr-only"
            onChange={(event) => handleInputChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={() => {
              setActiveIndex(index);
              setFocusVisibleIndex(focusFromPointer.current ? null : index);
              focusFromPointer.current = false;
            }}
            onBlur={() => setFocusVisibleIndex(null)}
          />
        ))}
        {children}
      </div>
    ),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return (
    <CircularSliderContext.Provider value={contextValue}>
      {element}
    </CircularSliderContext.Provider>
  );
}

/**
 * The band's hit layer clip: the swept arc plus a little slop on each side,
 * radially and past each end. clip-path also clips hit-testing, so the
 * middle and the gap of a partial sweep stay free, and a short half dial's
 * hidden lower half never catches clicks or touches below the component.
 */
function bandClipPath(
  dial: Dial,
  size: number,
  thickness: number,
  inset: number,
): string {
  const c = size / 2;
  const outer = c + BAND_SLOP;
  const inner = Math.max(0, c - inset - thickness - BAND_SLOP);
  const circle = (r: number): string =>
    `M ${c - r} ${c} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  if (dial.sweep >= 360) {
    return `path(evenodd, "${circle(outer)} ${circle(inner)}")`;
  }
  const radius = bandRadius(size, thickness, inset);
  const edge = slopDegrees(thickness / 2 + BAND_SLOP, radius);
  // Clockwise screen angles of the arc's two ends, past each by the slop.
  const first = (dial.dir === 1 ? dial.start : dial.start - dial.sweep) - edge;
  const span = Math.min(359.9, dial.sweep + edge * 2);
  const last = first + span;
  const at = (r: number, angle: number): string => {
    const rad = (angle * Math.PI) / 180;
    return `${round(c + r * Math.sin(rad))} ${round(c - r * Math.cos(rad))}`;
  };
  const large = span > 180 ? 1 : 0;
  return `path("M ${at(outer, first)} A ${outer} ${outer} 0 ${large} 1 ${at(outer, last)} L ${at(inner, last)} A ${inner} ${inner} 0 ${large} 0 ${at(inner, first)} Z")`;
}

/** Classes that animate a value change and stand still while dragging. */
const SETTLE_TRANSITION =
  "duration-350 ease-(--ease-out-expo) group-data-dragging/circular-slider:transition-none group-data-instant/circular-slider:transition-none motion-reduce:transition-none";

function overlayProps(slot: string, size: number, className?: string) {
  return {
    "data-slot": slot,
    "aria-hidden": true,
    viewBox: `0 0 ${size} ${size}`,
    className: cn(
      "pointer-events-none absolute inset-0 size-full overflow-visible",
      className,
    ),
  };
}

/** Radius of the center line of the outer band. */
function bandRadius(size: number, thickness: number, inset = 0): number {
  return size / 2 - inset - thickness / 2;
}

/**
 * How far a pill thumb reaches past each side of the band. The band moves in
 * by the same amount so the pill stays inside the dial's box.
 */
function pillOverhang(thickness: number): number {
  // At least long enough (12px) to see and aim at, however thin the band.
  return Math.max(
    3,
    Math.round(thickness * 0.3),
    Math.ceil((12 - thickness) / 2),
  );
}

/** Pill thumb width: slim, but never a hairline. */
function pillWidth(thickness: number): number {
  return clamp(Math.round(thickness / 3), 4, 6);
}

/**
 * The stretch of progress the track is drawn over.
 *
 * A round cap reaches half the band past each end, and a pill thumb is
 * slimmer than that, so at min or max a sliver of cap would show beyond it.
 * With a pill the track is pulled in at both ends until its rounded tip
 * lands on the pill's outer edge: the thumb sits flush with the end, as
 * Base UI's `thumbAlignment="edge"` does for a straight slider. A full
 * circle has no ends to pull in.
 */
function trackSpan(
  dial: Dial,
  radius: number,
  thickness: number,
  thumbShape: "bead" | "pill",
): Span {
  if (thumbShape !== "pill" || dial.sweep >= 360) {
    return { from: 0, length: dial.sweep };
  }
  const px = thickness / 2 - pillWidth(thickness) / 2;
  const degrees = ((px / radius) * 180) / Math.PI;
  return { from: degrees, length: Math.max(0, dial.sweep - degrees * 2) };
}

const svgRotateStyle = {
  transformBox: "view-box",
  transformOrigin: "50% 50%",
} as const satisfies React.CSSProperties;

export type CircularSliderTrackProps = useRender.ComponentProps<"svg">;

/** The full sweep of the band, drawn behind the indicator. */
function CircularSliderTrack({
  className,
  render,
  ...props
}: CircularSliderTrackProps) {
  const { dial, size, thickness, inset, thumbShape } =
    useCircularSliderContext();
  const radius = bandRadius(size, thickness, inset);
  const stroke = arcStroke(
    dial,
    radius,
    trackSpan(dial, radius, thickness, thumbShape),
  );

  return useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(
      overlayProps("circular-slider-track", size, className),
      props,
      {
        children: (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            className="stroke-foreground/9 dark:stroke-foreground/10"
            style={{
              ...svgRotateStyle,
              strokeDasharray: stroke.strokeDasharray,
              rotate: stroke.rotate,
            }}
          />
        ),
      },
    ),
  });
}

export type CircularSliderIndicatorProps = useRender.ComponentProps<"svg">;

/**
 * The filled arc: from `origin` to the value, or between a range's thumbs.
 * Sweeps along the ring on click, Home/End/Page and outside changes; arrow
 * steps land at once, and drags track the pointer 1:1
 * while dragging.
 */
function CircularSliderIndicator({
  className,
  render,
  ...props
}: CircularSliderIndicatorProps) {
  const { dial, values, origin, size, thickness, inset, thumbShape } =
    useCircularSliderContext();
  const radius = bandRadius(size, thickness, inset);
  const capDegrees = ((thickness / 2 / radius) * 180) / Math.PI;
  const span = getActiveSpan(dial, values, origin);
  // From a reference reading (not min), start the arc at the reading itself.
  const fromReference = values.length === 1 && origin !== dial.min;
  const drawn = fromReference
    ? trimOriginCap(
        span,
        valueToProgress(dial, values[0]),
        valueToProgress(dial, origin),
        capDegrees,
      )
    : span;
  const hidden = fromReference && drawn.length === 0;

  // useId output can hold characters that break a url(#...) reference.
  const maskId = `circular-slider-mask-${React.useId().replace(/[^\w-]/g, "")}`;
  const isPill = thumbShape === "pill";
  // A pill thumb is slimmer than the band, so the indicator's ends are cut
  // flat (a round end would bulge out past the pill) and the whole arc is
  // masked to the track's silhouette. That lets the free end run on into the
  // track's rounded tip and fill it exactly, while an end under a thumb stops
  // flat at the thumb's center, and nothing ever pokes outside the track.
  let pillSpan: Span | null = null;
  if (isPill) {
    const startsAtMin = values.length === 1 && origin === dial.min;
    const reach = dial.sweep < 360 && startsAtMin ? capDegrees : 0;
    pillSpan = { from: span.from - reach, length: span.length + reach };
  }
  const track = trackSpan(dial, radius, thickness, thumbShape);

  const indicatorArc = (piece: Span, cap: "round" | "butt") => {
    const stroke = arcStroke(dial, radius, piece);
    return (
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={thickness}
        strokeLinecap={cap}
        className={cn(
          "stroke-primary transition-[stroke-dasharray,rotate,opacity]",
          SETTLE_TRANSITION,
          hidden && "opacity-0",
        )}
        style={{
          ...svgRotateStyle,
          strokeDasharray: stroke.strokeDasharray,
          rotate: stroke.rotate,
        }}
      />
    );
  };
  const trackStroke = arcStroke(dial, radius, track);
  const c = size / 2;

  return useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(
      overlayProps("circular-slider-indicator", size, className),
      props,
      {
        children: isPill ? (
          <>
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse">
                <circle
                  cx={c}
                  cy={c}
                  r={radius}
                  fill="none"
                  stroke="white"
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  strokeDasharray={trackStroke.strokeDasharray}
                  // An attribute rather than CSS: CSS transforms inside mask
                  // content are not reliable across engines.
                  transform={`rotate(${parseFloat(trackStroke.rotate)} ${c} ${c})`}
                />
              </mask>
            </defs>
            <g mask={`url(#${maskId})`}>
              {indicatorArc(pillSpan as Span, "butt")}
            </g>
          </>
        ) : (
          indicatorArc(drawn, "round")
        ),
      },
    ),
  });
}

export interface CircularSliderThumbProps extends useRender.ComponentProps<"svg"> {
  /**
   * Bead diameter in px. Defaults to the band's thickness less 4px. Applies
   * to `thumbShape="bead"` only; a pill's shape follows the band.
   */
  beadSize?: number;
}

/**
 * A bead set into the end of the indicator, one per value.
 *
 * Drawn in SVG, in the same rotated space as the indicator, so the bead and
 * the round end it sits in go through one rasterizer: an HTML bead over an
 * SVG arc rounds its edges differently at fractional display scales and
 * reads as off-center even when the two are mathematically concentric.
 * Each bead rotates about the center, so a change of value travels along
 * the arc rather than cutting across it.
 *
 * Renders the thumb for each value. When a range's two beads come within a
 * bead's width of each other, a bridge fills the gap between them so they
 * read as one pill along the arc instead of stacking.
 */
function CircularSliderThumb({
  className,
  render,
  beadSize,
  ...props
}: CircularSliderThumbProps) {
  const {
    dial,
    values,
    size,
    thickness,
    inset,
    thumbShape,
    pressed,
    activeIndex,
    focusVisibleIndex,
  } = useCircularSliderContext();
  const isPill = thumbShape === "pill";
  const bead = beadSize ?? Math.max(4, thickness - 4);
  const radius = bandRadius(size, thickness, inset);
  const c = size / 2;
  // Center of the band at 12 o'clock, before each thumb is rotated into place.
  const cy = inset + thickness / 2;
  const pillW = pillWidth(thickness);
  const pillH = thickness + inset * 2;
  const progresses = values.map((v) => valueToProgress(dial, v));

  // The short way between a range's two thumbs. When the beads would touch,
  // a bridge the width of a bead fills it, so the pair reads as one pill.
  // The bridge is always mounted and sweeps with the beads; it only fades in
  // once they have nearly arrived, so a merge never pops in ahead of them.
  let bridge: Span | null = null;
  let merged = false;
  if (!isPill && progresses.length === 2) {
    const [p0, p1] = progresses;
    let from = Math.min(p0, p1);
    let length = Math.abs(p1 - p0);
    if (dial.wrap) {
      const forward = mod(p1 - p0, 360);
      from = forward <= 180 ? p0 : p1;
      length = Math.min(forward, 360 - forward);
    }
    bridge = { from, length };
    // Closer than a bead plus a hairline: the two would touch.
    merged = (length * Math.PI * radius) / 180 < bead + 2;
  }

  // The thumb in front is the one last moved.
  const order = values
    .map((_, index) => index)
    .sort((a, b) => Number(a === activeIndex) - Number(b === activeIndex));

  const rotated = (angle: number): React.CSSProperties => ({
    ...svgRotateStyle,
    rotate: `${round(angle)}deg`,
  });

  // A rounded rect centered on the band at 12 o'clock.
  const capsule = (
    w: number,
    h: number,
    extra: React.SVGProps<SVGRectElement>,
  ) => (
    <rect
      x={c - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      rx={w / 2}
      {...extra}
    />
  );

  const thumbState = (index: number) => ({
    "data-slot": "circular-slider-thumb",
    "data-index": index,
    "data-shape": thumbShape,
    "data-active": index === activeIndex || undefined,
    "data-pressed": (pressed && index === activeIndex) || undefined,
  });

  // Grows on hover and on grab. A bead stays inside the band, so a ring of
  // indicator always frames it.
  const growClasses = cn(
    "[transform-origin:center] [transform-box:fill-box]",
    "transition-[scale] duration-150 ease-out motion-reduce:transition-none",
    // Only over the grab zone: hovering the empty middle does nothing.
    isPill
      ? "group-data-grab-hover/circular-slider:scale-108 data-pressed:scale-112 group-data-grab-hover/circular-slider:data-pressed:scale-112"
      : "group-data-grab-hover/circular-slider:scale-110 data-pressed:scale-115 group-data-grab-hover/circular-slider:data-pressed:scale-115",
  );

  const focusIndex =
    focusVisibleIndex !== null && progresses[focusVisibleIndex] !== undefined
      ? focusVisibleIndex
      : null;
  const ring = isPill ? { w: pillW + 7, h: pillH + 7 } : null;

  const children = (
    <>
      {bridge && (
        <circle
          data-slot="circular-slider-thumb-bridge"
          data-merged={merged || undefined}
          cx={c}
          cy={c}
          r={radius}
          fill="none"
          strokeWidth={bead}
          strokeLinecap="butt"
          className={cn(
            "stroke-primary-foreground transition-[stroke-dasharray,rotate,opacity]",
            SETTLE_TRANSITION,
            merged ? "opacity-100" : "opacity-0",
          )}
          style={{
            ...svgRotateStyle,
            strokeDasharray: arcStroke(dial, radius, bridge).strokeDasharray,
            rotate: arcStroke(dial, radius, bridge).rotate,
            // Appears late, once the beads have nearly met; leaves at once.
            transitionDelay: merged ? "0ms, 0ms, 200ms" : "0ms",
          }}
        />
      )}
      {order.map((index) => (
        <g
          key={index}
          className={cn("transition-[rotate]", SETTLE_TRANSITION)}
          style={rotated(progressToAngle(dial, progresses[index]))}
        >
          {isPill ? (
            // The pill crosses the grey track as well as the blue, so it
            // carries a single hairline edge, even all round so neither side
            // reads heavier.
            <g {...thumbState(index)} className={growClasses}>
              {capsule(pillW + 1, pillH + 1, { className: "fill-black/14" })}
              {capsule(pillW, pillH, {
                className: "fill-primary-foreground",
              })}
            </g>
          ) : (
            <circle
              {...thumbState(index)}
              cx={c}
              cy={cy}
              r={bead / 2}
              className={cn("fill-primary-foreground", growClasses)}
            />
          )}
        </g>
      ))}
      {/* Focus: a full-strength ring, edged with the page color on both
          sides so it stays distinct where it crosses the blue arc. */}
      {focusIndex !== null && (
        <g
          data-slot="circular-slider-thumb-focus"
          className={cn("transition-[rotate]", SETTLE_TRANSITION)}
          style={rotated(progressToAngle(dial, progresses[focusIndex]))}
        >
          {ring ? (
            <>
              {capsule(ring.w, ring.h, {
                fill: "none",
                strokeWidth: 5,
                className: "stroke-background",
              })}
              {capsule(ring.w, ring.h, {
                fill: "none",
                strokeWidth: 2,
                className: "stroke-ring",
              })}
            </>
          ) : (
            <>
              <circle
                cx={c}
                cy={cy}
                r={bead / 2 + 3.5}
                fill="none"
                strokeWidth={5}
                className="stroke-background"
              />
              <circle
                cx={c}
                cy={cy}
                r={bead / 2 + 3.5}
                fill="none"
                strokeWidth={2}
                className="stroke-ring"
              />
            </>
          )}
        </g>
      )}
    </>
  );

  return useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(
      overlayProps("circular-slider-thumbs", size, className),
      props,
      { children },
    ),
  });
}

export interface CircularSliderTicksProps extends useRender.ComponentProps<"svg"> {
  /** Number of intervals across the sweep. */
  count?: number;
  /** Tick length in px. */
  length?: number;
}

/**
 * A scale of ticks. On a ring they sit just inside the band as a quiet
 * scale; on a knob they are the band, and the ones inside the value light
 * up. When the value animates, ticks change as the indicator's head passes
 * them rather than all at once.
 */
function CircularSliderTicks({
  className,
  render,
  count,
  length,
  ...props
}: CircularSliderTicksProps) {
  const {
    dial,
    values,
    previousValues,
    origin,
    size,
    thickness,
    inset,
    variant,
    dragging,
    instant,
  } = useCircularSliderContext();

  const isKnob = variant === "knob";
  const tickCount = count ?? (isKnob ? 30 : 20);
  const tickLength = length ?? (isKnob ? thickness : 4);
  const outerY = isKnob ? 1 : inset + thickness + 4;
  const tickWidth = isKnob ? 2 : 1.5;

  // Light the tick a value is nearest to, not only the ticks it has passed:
  // a value a fraction short of a tick would otherwise leave the tick its
  // marker points at dark. Just under half an interval, so a value midway
  // between two ticks never lights both.
  const halfInterval =
    (dial.sweep / Math.max(1, Math.round(tickCount)) / 2) * 0.999;
  const span = widenSpan(getActiveSpan(dial, values, origin), halfInterval);
  const previousSpan = widenSpan(
    getActiveSpan(dial, previousValues, origin),
    halfInterval,
  );

  // The tick sweep follows the one thumb that moved. A range shifted as a
  // whole, or several thumbs at once, changes its ticks together.
  const movedIndex =
    previousValues.length === values.length
      ? values.findIndex((v, i) => v !== previousValues[i])
      : -1;
  const movedCount = values.filter((v, i) => v !== previousValues[i]).length;
  const headFrom =
    movedIndex >= 0 ? valueToProgress(dial, previousValues[movedIndex]) : 0;
  const headTo =
    movedIndex >= 0 ? valueToProgress(dial, values[movedIndex]) : 0;
  const travel = Math.abs(headTo - headFrom);

  const ticks = tickProgresses(dial, tickCount).map((progress) => {
    const lit = isInSpan(dial, progress, span);
    const wasLit = isInSpan(dial, progress, previousSpan);
    let delay = 0;
    if (
      !dragging &&
      !instant &&
      lit !== wasLit &&
      movedCount === 1 &&
      travel > 0
    ) {
      const share = clamp(Math.abs(progress - headFrom) / travel, 0, 1);
      delay = Math.round(easeOutExpoTimeAt(share) * SETTLE_MS);
    }
    return { progress, lit, delay };
  });

  return useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(
      overlayProps("circular-slider-ticks", size, className),
      props,
      {
        children: ticks.map((tick) => (
          <line
            key={tick.progress}
            data-active={tick.lit || undefined}
            x1={size / 2}
            x2={size / 2}
            y1={outerY}
            y2={outerY + tickLength}
            strokeWidth={tickWidth}
            strokeLinecap="round"
            transform={`rotate(${progressToAngle(dial, tick.progress)} ${size / 2} ${size / 2})`}
            className={cn(
              "transition-[stroke] [transition-delay:var(--tick-delay)] duration-150 ease-out motion-reduce:[transition-delay:0ms]",
              isKnob
                ? "stroke-foreground/14 data-active:stroke-primary"
                : "stroke-foreground/14 data-active:stroke-foreground/40",
            )}
            style={{ "--tick-delay": `${tick.delay}ms` } as React.CSSProperties}
          />
        )),
      },
    ),
  });
}

export interface CircularSliderMarkProps extends useRender.ComponentProps<"svg"> {
  /** The reading to mark, e.g. the current temperature. */
  value: number;
}

/**
 * A read-only mark across the band for a second value: the current reading
 * against a target, a recommended level, a previous setting. Glides when
 * the reading changes.
 */
function CircularSliderMark({
  className,
  render,
  value,
  ...props
}: CircularSliderMarkProps) {
  const { dial, size, thickness, inset, thumbShape, variant } =
    useCircularSliderContext();
  const angle = progressToAngle(
    dial,
    valueToProgress(dial, clamp(value, dial.min, dial.max)),
  );
  // The rotation actually rendered, kept unwrapped so a reading that crosses
  // the seam of a wrapping dial (355 to 5) turns the short way, not almost a
  // full turn backwards. Updated during render, the "previous props" pattern.
  const [shown, setShown] = React.useState(angle);
  let rotation = shown;
  if (round(mod(shown, 360)) !== round(mod(angle, 360))) {
    rotation = dial.wrap
      ? shown + wrapDelta(mod(shown, 360), mod(angle, 360), 360)
      : angle;
    setShown(rotation);
  }
  const isKnob = variant === "knob";
  // Beside a pill thumb the mark spans the same length, so the reading and
  // the target read as a matching pair of lines bracketing the span.
  const matchPill = !isKnob && thumbShape === "pill";
  const y1 = isKnob ? -2 : matchPill ? 0 : inset + 1;
  const y2 = isKnob
    ? thickness + 2
    : matchPill
      ? inset * 2 + thickness
      : inset + thickness + 4;

  return useRender({
    defaultTagName: "svg",
    render,
    props: mergeProps<"svg">(
      overlayProps("circular-slider-mark", size, className),
      props,
      {
        children: (
          // Rotated as one group so the edge and the line never drift apart.
          <g
            className="transition-[rotate] duration-350 ease-(--ease-out-expo) motion-reduce:transition-none"
            style={{ ...svgRotateStyle, rotate: `${round(rotation)}deg` }}
          >
            {/* A page-colored edge keeps the mark legible on the blue arc. */}
            <line
              x1={size / 2}
              x2={size / 2}
              y1={y1}
              y2={y2}
              strokeWidth={5}
              strokeLinecap="round"
              className="stroke-background"
            />
            <line
              x1={size / 2}
              x2={size / 2}
              y1={y1}
              y2={y2}
              strokeWidth={2}
              strokeLinecap="round"
              className="stroke-foreground"
            />
          </g>
        ),
      },
    ),
  });
}

export type CircularSliderKnobProps = useRender.ComponentProps<"div">;

/**
 * The raised face of a `knob` dial. It turns with the value, carrying a
 * notch, and presses in slightly while held.
 */
function CircularSliderKnob({
  className,
  render,
  children,
  ...props
}: CircularSliderKnobProps) {
  const {
    dial,
    values,
    previousValues,
    size,
    thickness,
    thumbShape,
    focusVisibleIndex,
  } = useCircularSliderContext();
  // The face follows the thumb whose value last changed, not the focused
  // one, so moving focus between a range's thumbs never turns it.
  const [faceIndex, setFaceIndex] = React.useState(0);
  const moved = values.findIndex((v, i) => v !== previousValues[i]);
  if (moved >= 0 && moved !== faceIndex) setFaceIndex(moved);
  const value =
    values[Math.min(moved >= 0 ? moved : faceIndex, values.length - 1)];
  const angle = progressToAngle(dial, valueToProgress(dial, value));
  const insetPercent = ((thickness + KNOB_GAP) / size) * 100;

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "aria-hidden": true,
        "data-slot": "circular-slider-knob",
        "data-focus-visible": focusVisibleIndex !== null || undefined,
        className: cn(
          "absolute overflow-hidden rounded-full bg-surface-4 shadow-(--surface-shadow-combined-4) group-hover/circular-slider:shadow-(--surface-shadow-combined-5) group-data-disabled/circular-slider:shadow-(--surface-shadow-combined-4)",
          "transition-[scale,box-shadow,outline-color] duration-150 ease-out",
          "group-data-pressed/circular-slider:scale-[0.98] motion-reduce:group-data-pressed/circular-slider:scale-100",
          "outline-2 outline-offset-2 outline-transparent data-focus-visible:outline-ring",
          className,
        ),
        style: { inset: `${insetPercent}%` },
        children: (
          <span
            data-slot="circular-slider-knob-face"
            className={cn(
              "absolute inset-0 rounded-full transition-[rotate]",
              SETTLE_TRANSITION,
            )}
            style={{ rotate: `${angle}deg` }}
          >
            {children ?? (
              <span
                data-slot="circular-slider-knob-notch"
                data-shape={thumbShape}
                className={cn(
                  "bg-foreground absolute left-1/2 -translate-x-1/2 rounded-full",
                  thumbShape === "bead"
                    ? "top-[11%] aspect-square w-[10%]"
                    : "top-[9%] h-[16%] w-[3px]",
                )}
              />
            )}
          </span>
        ),
      } as React.ComponentProps<"div">,
      props,
    ),
  });

  return element;
}

export interface CircularSliderValueProps extends Omit<
  useRender.ComponentProps<"div">,
  "children"
> {
  /**
   * Formats each value. Defaults to the root's `formatValue`, which screen
   * readers also speak; set it on the root to keep the two in step.
   */
  formatValue?: (value: number, index: number) => string;
  /** Joins the two ends of a range. */
  separator?: string;
}

/** The current value as text, centered in the dial. */
function CircularSliderValue({
  className,
  render,
  formatValue,
  separator = " – ",
  ...props
}: CircularSliderValueProps) {
  const { values, formatValue: rootFormat } = useCircularSliderContext();
  const format = formatValue ?? rootFormat;
  const text = values
    .map((value, index) => (format ? format(value, index) : String(value)))
    .join(separator);

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "circular-slider-value",
        "aria-hidden": true,
        className: cn(
          // Sized to the dial with a legible floor, and held inside the open
          // middle: longer text truncates rather than running over the arc.
          // Screen readers get the whole value from the hidden input. The
          // line box is a little taller than the text so the clip that
          // truncation needs never cuts descenders or tall accents.
          "pointer-events-none relative max-w-[calc(var(--circular-slider-hole)-0.5rem)] truncate text-[length:max(0.6875rem,calc(var(--circular-slider-size)*0.17))] leading-tight font-semibold tabular-nums",
          className,
        ),
        children: text,
      } as React.ComponentProps<"div">,
      props,
    ),
  });
}

export interface CircularSliderProps<
  Value extends SliderValue = number,
> extends Omit<CircularSliderRootProps<Value>, "variant" | "formatValue"> {
  /**
   * Formats the centered value, and what screen readers speak unless
   * `getAriaValueText` says otherwise. Pass `null` to hide the value.
   */
  formatValue?: ((value: number, index: number) => string) | null;
}

/**
 * The ready-made ring: the band with its indicator, a thumb per value and
 * the value in the middle. Compose the parts with `CircularSliderRoot` for
 * anything else (a knob, ticks, a reference mark, custom center content).
 */
function CircularSlider<Value extends SliderValue = number>({
  formatValue,
  children,
  ...props
}: CircularSliderProps<Value>) {
  return (
    <CircularSliderRoot formatValue={formatValue ?? undefined} {...props}>
      <CircularSliderTrack />
      <CircularSliderIndicator />
      <CircularSliderThumb />
      {formatValue !== null && <CircularSliderValue />}
      {children}
    </CircularSliderRoot>
  );
}

export type { CircularSliderDirection, ThumbCollision };

export {
  CircularSlider,
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderThumb,
  CircularSliderTicks,
  CircularSliderMark,
  CircularSliderKnob,
  CircularSliderValue,
};
