/**
 * Geometry for the circular slider.
 *
 * Everything is measured in degrees with 0° at 12 o'clock, increasing
 * clockwise. Values map to a *progress* along the dial's sweep (0 at the
 * start, `sweep` at the end); progress maps to a screen angle through the
 * start angle and direction. Keeping the two spaces apart is what lets one
 * set of functions handle partial sweeps, counterclockwise dials, and
 * wrapping without special cases.
 */

export type CircularSliderDirection = "clockwise" | "counterclockwise";

export interface Dial {
  min: number;
  max: number;
  step: number;
  /** Arc length of the dial in degrees, 1 to 360. */
  sweep: number;
  /** Screen angle of progress 0. */
  start: number;
  /** 1 for clockwise, -1 for counterclockwise. */
  dir: 1 | -1;
  /** Max and min share a position and values loop. Full sweeps only. */
  wrap: boolean;
}

export interface CreateDialOptions {
  min: number;
  max: number;
  step: number;
  sweep: number;
  startAngle?: number;
  direction: CircularSliderDirection;
  wrap: boolean;
}

/** Rounds to 4 decimals so server and client render identical markup. */
export function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Default start angle: a partial sweep is centered on 12 o'clock so its gap
 * sits at the bottom (a 270° dial starts at 225°, a 180° dial at 270°). A
 * full circle starts at the top.
 */
export function resolveStartAngle(
  sweep: number,
  direction: CircularSliderDirection,
  startAngle?: number,
): number {
  if (startAngle !== undefined) return startAngle;
  if (sweep >= 360) return 0;
  const half = sweep / 2;
  return direction === "clockwise" ? 360 - half : half;
}

export function createDial({
  min,
  max,
  step,
  sweep,
  startAngle,
  direction,
  wrap,
}: CreateDialOptions): Dial {
  const clampedSweep = clamp(sweep, 1, 360);
  return {
    min,
    max,
    step,
    sweep: clampedSweep,
    start: resolveStartAngle(clampedSweep, direction, startAngle),
    dir: direction === "clockwise" ? 1 : -1,
    wrap: wrap && clampedSweep >= 360,
  };
}

function stepDecimals(step: number): number {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/**
 * Snaps to the step grid anchored at `min`, then keeps the value in range:
 * clamped normally, folded back into `[min, max)` on a wrapping dial (where
 * max and min are the same position).
 */
export function snapValue(dial: Dial, value: number): number {
  const { min, max, step } = dial;
  const range = max - min;
  const steps = Math.round((value - min) / step);
  let snapped = Number((min + steps * step).toFixed(stepDecimals(step)));
  if (dial.wrap) {
    snapped = min + ((((snapped - min) % range) + range) % range);
    return Number(snapped.toFixed(stepDecimals(step)));
  }
  return clamp(snapped, min, max);
}

export function valueToProgress(dial: Dial, value: number): number {
  const range = dial.max - dial.min;
  if (range <= 0) return 0;
  return clamp(((value - dial.min) / range) * dial.sweep, 0, dial.sweep);
}

export function progressToValue(dial: Dial, progress: number): number {
  return dial.min + (progress / dial.sweep) * (dial.max - dial.min);
}

export function progressToAngle(dial: Dial, progress: number): number {
  return round(dial.start + dial.dir * progress);
}

/** Screen angle of a point around a center (0° at 12 o'clock, clockwise). */
export function pointToAngle(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
): number {
  const degrees = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 90;
  return normalizeAngle(degrees);
}

/**
 * Progress for a screen angle. Angles in the gap of a partial sweep project
 * onto the nearer end.
 */
export function angleToProgress(dial: Dial, angle: number): number {
  const offset = normalizeAngle((angle - dial.start) * dial.dir);
  if (offset <= dial.sweep) return offset;
  const gap = 360 - dial.sweep;
  return offset - dial.sweep < gap / 2 ? dial.sweep : 0;
}

/**
 * Like `angleToProgress`, but an angle in the gap keeps going past the nearer
 * end (negative before the start, above `sweep` after the end) instead of
 * snapping onto it. A drag that holds the thumb at an offset from the pointer
 * needs this to reach the ends: clamping before the offset is added stops it
 * short by the offset.
 */
export function angleToUnclampedProgress(dial: Dial, angle: number): number {
  const offset = normalizeAngle((angle - dial.start) * dial.dir);
  if (offset <= dial.sweep) return offset;
  const gap = 360 - dial.sweep;
  return offset - dial.sweep < gap / 2 ? offset : offset - 360;
}

/**
 * Keeps a drag from teleporting across the ends. A jump of more than half
 * the sweep between two pointer samples can only mean the pointer crossed
 * the seam (or the gap), so a non-wrapping dial pins to the end it came
 * from instead of flipping to the other one.
 */
export function continueDrag(
  dial: Dial,
  previous: number,
  next: number,
): number {
  if (dial.wrap) return next;
  if (Math.abs(next - previous) > dial.sweep / 2) {
    return previous > dial.sweep / 2 ? dial.sweep : 0;
  }
  return next;
}

/** Signed shortest difference between two progresses on a wrapping dial. */
export function wrapDelta(from: number, to: number, period: number): number {
  const delta = (((to - from) % period) + period) % period;
  return delta > period / 2 ? delta - period : delta;
}

/** Positive distance between two screen angles, 0 to 180. */
export function angularDistance(a: number, b: number): number {
  const delta = normalizeAngle(a - b);
  return delta > 180 ? 360 - delta : delta;
}

export interface Span {
  /** Progress where the span begins. */
  from: number;
  /** Length in degrees of progress; may run past `sweep` on a wrapping dial. */
  length: number;
}

/**
 * The active span the indicator and lit ticks cover. A range covers the
 * stretch between its two values (clockwise from the first on a wrapping
 * dial, so 22:00 to 07:00 runs through midnight). A single value covers the
 * stretch between `origin` and the value, in whichever direction.
 */
export function getActiveSpan(
  dial: Dial,
  values: readonly number[],
  origin: number,
): Span {
  if (values.length > 1) {
    const a = valueToProgress(dial, values[0]);
    const b = valueToProgress(dial, values[values.length - 1]);
    if (dial.wrap) {
      return { from: a, length: (((b - a) % 360) + 360) % 360 };
    }
    return { from: Math.min(a, b), length: Math.abs(b - a) };
  }
  const value = valueToProgress(dial, values[0]);
  const originProgress = valueToProgress(dial, origin);
  return {
    from: Math.min(value, originProgress),
    length: Math.abs(value - originProgress),
  };
}

export function isInSpan(dial: Dial, progress: number, span: Span): boolean {
  const epsilon = 0.0001;
  if (dial.wrap) {
    const offset = (((progress - span.from) % 360) + 360) % 360;
    return offset <= span.length + epsilon;
  }
  return (
    progress >= span.from - epsilon &&
    progress <= span.from + span.length + epsilon
  );
}

/**
 * Stroke props that draw an arc on a `<circle>` as a single dash.
 *
 * A circle's stroke starts at 3 o'clock, so the circle is rotated to put the
 * dash's start on the arc's first screen angle. Drawing arcs this way rather
 * than as path data means a change of value is two numbers that CSS can
 * transition (the dash length and the rotation), so the arc sweeps along the
 * ring instead of being re-drawn.
 */
export function arcStroke(
  dial: Dial,
  radius: number,
  span: Span,
): { strokeDasharray: string; rotate: string } {
  const circumference = 2 * Math.PI * radius;
  const length = (span.length / 360) * circumference;
  // Counterclockwise arcs are drawn clockwise from their far end.
  const firstAngle =
    dial.dir === 1
      ? dial.start + span.from
      : dial.start - span.from - span.length;
  return {
    strokeDasharray: `${round(length)} ${round(circumference)}`,
    rotate: `${round(firstAngle - 90)}deg`,
  };
}

/**
 * Progress of each tick. A partial sweep gets a tick at both ends; a full
 * circle skips the last one, which would land on the first.
 */
export function tickProgresses(dial: Dial, count: number): number[] {
  const intervals = Math.max(1, Math.round(count));
  const total = dial.sweep >= 360 ? intervals : intervals + 1;
  return Array.from({ length: total }, (_, i) =>
    round((i / intervals) * dial.sweep),
  );
}

/**
 * Inverse of the ease-out-expo curve (`1 - 2^(-10t)`): the share of the
 * duration the indicator needs to cover `x` of its distance. Ticks use it to
 * light up as the arc's head passes them rather than on a linear schedule.
 */
export function easeOutExpoTimeAt(x: number): number {
  if (x <= 0) return 0;
  if (x >= 0.999) return 1;
  return clamp(-Math.log2(1 - x) / 10, 0, 1);
}

/**
 * Pulls an indicator's `origin` end in by its round cap, so an arc drawn from
 * a reference reading starts at the reading instead of half a stroke behind
 * it. The value end keeps its cap, which sits under the thumb.
 */
export function trimOriginCap(
  span: Span,
  valueProgress: number,
  originProgress: number,
  capDegrees: number,
): Span {
  const length = Math.max(0, span.length - capDegrees);
  if (originProgress <= valueProgress) {
    return { from: span.from + (span.length - length), length };
  }
  return { from: span.from, length };
}

/**
 * Height a ring needs to show its whole arc, measured from the top of its
 * square: the lowest point of the band (an end, or 6 o'clock when the sweep
 * passes it) plus the round cap. A 180° dial is about half as tall as it is
 * wide; a full circle, or any sweep through the bottom, is square.
 */
export function ringHeight(
  dial: Dial,
  size: number,
  thickness: number,
): number {
  const c = size / 2;
  const r = size / 2 - thickness / 2;
  const yAt = (angle: number): number =>
    c - r * Math.cos((angle * Math.PI) / 180);
  const startAngle = dial.start;
  const endAngle = dial.start + dial.dir * dial.sweep;
  const passesBottom =
    dial.sweep >= 360 ||
    normalizeAngle((180 - startAngle) * dial.dir) <= dial.sweep;
  const lowest = passesBottom
    ? c + r
    : Math.max(yAt(startAngle), yAt(endAngle));
  // Content centered in the dial (the value) hangs below the center, so a
  // shallow sweep still leaves it a little room.
  const contentFloor = c + size * 0.1;
  return round(Math.min(size, Math.max(lowest + thickness / 2, contentFloor)));
}

export type ThumbCollision = "push" | "none";

/**
 * Moves one thumb of a two-value range to `candidate`, keeping the thumbs at
 * least `gap` apart. When the moving thumb reaches the other one, `push`
 * carries the other along (as Base UI's Slider does) and `none` stops it.
 *
 * On a wrapping dial a range is the clockwise stretch from the first value to
 * the second, and the move is measured the short way round, so a thumb can
 * push the other through the seam.
 */
export function placeRangeThumb(
  dial: Dial,
  values: readonly number[],
  index: number,
  candidate: number,
  gap: number,
  collision: ThumbCollision,
): number[] {
  const next = [...values];
  if (values.length !== 2) {
    next[index] = candidate;
    return next;
  }
  const [a, b] = values;

  if (!dial.wrap) {
    if (index === 0) {
      let c = clamp(candidate, dial.min, dial.max - gap);
      if (c > b - gap) {
        if (collision === "push") next[1] = c + gap;
        else c = Math.max(dial.min, b - gap);
      }
      next[0] = c;
    } else {
      let c = clamp(candidate, dial.min + gap, dial.max);
      if (c < a + gap) {
        if (collision === "push") next[0] = c - gap;
        else c = Math.min(dial.max, a + gap);
      }
      next[1] = c;
    }
    return next;
  }

  const range = dial.max - dial.min;
  const span = (((b - a) % range) + range) % range;
  let delta = wrapDelta(values[index], candidate, range);
  // Moving the start forward shortens the span; moving the end forward
  // lengthens it. Either way the span must stay within [gap, range - gap].
  const after = index === 0 ? span - delta : span + delta;
  const short = after < gap ? gap - after : 0;
  const long = after > range - gap ? after - (range - gap) : 0;
  const other = 1 - index;
  if (short || long) {
    // Which way the other thumb has to go to restore the gap.
    const shift = index === 0 ? short - long : long - short;
    if (collision === "push") {
      next[other] = snapValue(dial, values[other] + shift);
    } else {
      delta -= index === 0 ? short - long : long - short;
    }
  }
  next[index] = snapValue(dial, values[index] + delta);
  return next;
}
