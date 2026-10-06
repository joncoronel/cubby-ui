/**
 * Geometry for the circular slider. Angles are degrees, 0° at 12 o'clock,
 * clockwise. Values map to a *progress* along the sweep (0 to `sweep`), and
 * progress maps to a screen angle through the start and direction. Keeping
 * the two apart lets partial, counterclockwise and wrapping dials share code.
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

/** Remainder that is never negative: `mod(-1, 360)` is 359. */
export function mod(x: number, n: number): number {
  return ((x % n) + n) % n;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Centers a partial sweep on 12 o'clock so its gap sits at the bottom. */
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
 * Snaps to the step grid from `min`, then clamps, or folds into `[min, max)`
 * on a wrapping dial, where max and min share a position.
 */
export function snapValue(dial: Dial, value: number): number {
  const { min, max, step } = dial;
  const range = max - min;
  const steps = Math.round((value - min) / step);
  let snapped = Number((min + steps * step).toFixed(stepDecimals(step)));
  if (dial.wrap) {
    snapped = min + mod(snapped - min, range);
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
 * Like `angleToProgress`, but angles in the gap run past the nearer end
 * instead of clamping to it. A thumb held at an offset from the pointer needs
 * this, or clamping before the offset stops it short of the end.
 */
export function angleToUnclampedProgress(dial: Dial, angle: number): number {
  const offset = normalizeAngle((angle - dial.start) * dial.dir);
  if (offset <= dial.sweep) return offset;
  const gap = 360 - dial.sweep;
  return offset - dial.sweep < gap / 2 ? offset : offset - 360;
}

/** Progress for a screen angle; angles in the gap clamp to the nearer end. */
export function angleToProgress(dial: Dial, angle: number): number {
  return clamp(angleToUnclampedProgress(dial, angle), 0, dial.sweep);
}

/**
 * A jump of over half the sweep between samples means the pointer crossed
 * the seam or the gap, so a non-wrapping dial pins to the end it came from
 * instead of flipping to the other.
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
  const delta = mod(to - from, period);
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
 * The span the indicator and lit ticks cover: between a range's values
 * (clockwise from the first on a wrapping dial, so 22:00 to 07:00 runs through
 * midnight), or between `origin` and a single value.
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
      return { from: a, length: mod(b - a, 360) };
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
    const offset = mod(progress - span.from, 360);
    return offset <= span.length + epsilon;
  }
  return (
    progress >= span.from - epsilon &&
    progress <= span.from + span.length + epsilon
  );
}

/**
 * Draws an arc on a `<circle>` as one dash, rotated from the stroke's 3
 * o'clock start. A value change is then two numbers CSS can transition, so
 * the arc sweeps along the ring instead of being redrawn as path data.
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

/** Tick positions; a full circle skips the last, which would land on the first. */
export function tickProgresses(dial: Dial, count: number): number[] {
  const intervals = Math.max(1, Math.round(count));
  const total = dial.sweep >= 360 ? intervals : intervals + 1;
  return Array.from({ length: total }, (_, i) =>
    round((i / intervals) * dial.sweep),
  );
}

/**
 * Inverse of ease-out-expo: the share of the duration the arc needs to cover
 * `x` of its distance, so ticks light as its head passes them.
 */
export function easeOutExpoTimeAt(x: number): number {
  if (x <= 0) return 0;
  if (x >= 0.999) return 1;
  return clamp(-Math.log2(1 - x) / 10, 0, 1);
}

/**
 * Pulls the indicator's origin end in by its round cap, so an arc from a
 * reference reading starts at the reading, not half a stroke behind it.
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
 * Height a ring needs from the top of its square: the band's lowest point (an
 * end, or 6 o'clock if the sweep passes it) plus the cap and any pill `inset`.
 * A 180° dial comes out about half as tall as it is wide.
 */
export function ringHeight(
  dial: Dial,
  size: number,
  thickness: number,
  inset = 0,
): number {
  const c = size / 2;
  const r = size / 2 - inset - thickness / 2;
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
  // Leave room for the centered value below a shallow sweep.
  const contentFloor = c + size * 0.1;
  return round(
    Math.min(size, Math.max(lowest + thickness / 2 + inset, contentFloor)),
  );
}

export type ThumbCollision = "push" | "none";

/**
 * Moves one thumb of a range, keeping the thumbs `gap` apart: `push` carries
 * the other along, as in Base UI's Slider, and `none` stops at it. On a
 * wrapping dial moves go the short way, so a thumb can push through the seam.
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
  const span = mod(b - a, range);
  let delta = wrapDelta(values[index], candidate, range);
  // The span must stay within [gap, range - gap].
  const after = index === 0 ? span - delta : span + delta;
  const short = after < gap ? gap - after : 0;
  const long = after > range - gap ? after - (range - gap) : 0;
  const other = 1 - index;
  if (short || long) {
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

/** Grows a span by `by` degrees at both ends. */
export function widenSpan(span: Span, by: number): Span {
  return { from: span.from - by, length: span.length + by * 2 };
}

/**
 * For a press on both of a range's thumbs: the one that can move the way the
 * pointer went, the thumb ahead going forward and the one behind going back.
 */
export function pickOverlappedThumb(
  dial: Dial,
  values: readonly number[],
  forward: boolean,
): number {
  const range = dial.max - dial.min;
  const endAhead = dial.wrap
    ? mod(values[1] - values[0], range) < range / 2
    : values[1] >= values[0];
  const ahead = endAhead ? 1 : 0;
  return forward ? ahead : 1 - ahead;
}
