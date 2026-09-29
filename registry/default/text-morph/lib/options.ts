/**
 * How changes animate. `blend` (the default) changes only what changed (a
 * similar word keeps what it shares at its ends), crossfading each changed
 * run as one unit, a touch smaller and blurred: calm enough for anything.
 * `morph` matches whole words, then letters within similar words (anywhere,
 * in a one-word value): shared ones slide to their new place, the rest scale
 * and fade, travelling with the nearest glyph that stays. `roll` keeps the
 * old and new text's shared start and end, and rolls the glyphs between
 * vertically, on a spring. In every mode numbers change digit by digit, and
 * each mode brings its own defaults for every option.
 */
export type TextMorphMode = "blend" | "roll" | "morph";

/** One CSS timing: a duration in ms and any CSS easing, `linear()` included. */
export type TextMorphTiming = { duration: number; easing: string };

/** Everything a mode tunes. Each mode sets all of it (`MODE_DEFAULTS`). */
export type TextMorphOptions = {
  /** Glyph movement: roll travel, enter/exit scale, shared glyphs sliding. */
  motion: TextMorphTiming;
  /** Opacity and blur of arriving glyphs, optionally starting late. */
  fadeIn: TextMorphTiming & { delay: number };
  /** Opacity and blur of leaving glyphs. */
  fadeOut: TextMorphTiming;
  /** The box's width. */
  width: TextMorphTiming;
  /**
   * `each`: every successive entering or leaving glyph starts `ms` later.
   * `spread`: a sweep from left to right across `ms` in total, by where
   * each glyph sits along the changed stretch.
   */
  stagger: { mode: "each" | "spread"; ms: number };
  /** Roll: travel (em), and the scale and tilt glyphs arrive and leave with. */
  roll: { distance: number; scale: number; rotate: number };
  /**
   * Morph: the scale letters grow from and shrink to. Digits of a number
   * roll instead, `distance` line heights, on their own fades.
   */
  morph: {
    scale: number;
    digits: {
      distance: number;
      fadeIn: TextMorphTiming;
      fadeOut: TextMorphTiming;
    };
  };
  /**
   * Blend: a changed run, letters or digits, grows into place from `scale`
   * about its own centre, as one unit; changed digits also drift
   * `distance` (em) the way the value went.
   */
  blend: { distance: number; scale: number };
  /** Blur on arriving and leaving glyphs, in em. */
  blur: number;
  /**
   * Match numbers by place value: digits line up on the decimal point, so
   * only the ones that changed roll.
   */
  numbers: boolean;
  /**
   * Which way glyphs roll. `auto` reads it off the value:
   * a number that grew brings new glyphs up from below, one that shrank
   * brings them down, and anything else rolls up. `up` and `down` hold one
   * way. Roll defaults to `auto`; morph to `down`: digits
   * fall in from above and leave downward, and a number's other marks
   * (separators, currency) arrive from below.
   */
  trend: "auto" | "up" | "down";
  /**
   * Fade old ink at an edge the box is shrinking away from. `auto` only
   * where it would land on something: a neighbour on the line, or the edge
   * of the pill or card holding the value.
   */
  edgeFade: "auto" | "always" | "never";
};

/** Morph's digits: a full line of travel, fading out over 45% of the
 * duration and in over the first 25%. */
const MORPH_DIGITS: TextMorphOptions["morph"]["digits"] = {
  distance: 1,
  fadeIn: { duration: 100, easing: "linear" },
  fadeOut: { duration: 180, easing: "linear" },
};

/** The curve the box width eases on: fast out, no overshoot. */
const WIDTH_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Ease-out expo: morph's movement, width and everything. */
const EXPO_EASING = "cubic-bezier(0.19, 1, 0.22, 1)";

/**
 * Roll's defaults: a 550ms hand-tuned spring (1.5%
 * overshoot) on transform, opacity and blur alike; glyphs travel 0.35em while
 * scaling to 0.6 and tilting 2deg, blurred 0.1em; delays fan out over 30% of
 * the duration; the box eases on its own non-overshooting curve.
 */
const ROLL_SPRING =
  "linear(0,.1052,.3155,.532,.7112,.8414,.9265,.9765,1.0023,1.013,1.0151,1.0133,1.01,1.0068,1.0041,1.0022,1.001,1)";
const ROLL_OPTIONS: TextMorphOptions = {
  motion: { duration: 550, easing: ROLL_SPRING },
  fadeIn: { duration: 550, easing: ROLL_SPRING, delay: 0 },
  fadeOut: { duration: 550, easing: ROLL_SPRING },
  width: { duration: 550, easing: WIDTH_EASING },
  stagger: { mode: "spread", ms: 165 },
  roll: { distance: 0.35, scale: 0.6, rotate: 2 },
  morph: { scale: 0.6, digits: MORPH_DIGITS },
  blend: { distance: 0.15, scale: 1 },
  blur: 0.1,
  numbers: true,
  trend: "auto",
  edgeFade: "auto",
};

/**
 * Morph's defaults: 400ms ease-out expo for movement
 * and width; arriving and leaving glyphs scale by 0.95; opacity is linear,
 * leaving over the first quarter of the duration and arriving over half of it
 * from a quarter in; no blur, no stagger.
 */
const MORPH_OPTIONS: TextMorphOptions = {
  motion: { duration: 400, easing: EXPO_EASING },
  fadeIn: { duration: 200, easing: "linear", delay: 100 },
  fadeOut: { duration: 100, easing: "linear" },
  width: { duration: 400, easing: EXPO_EASING },
  stagger: { mode: "each", ms: 0 },
  roll: { distance: 0.35, scale: 0.95, rotate: 0 },
  morph: { scale: 0.95, digits: MORPH_DIGITS },
  blend: { distance: 0.15, scale: 1 },
  blur: 0,
  numbers: true,
  trend: "down",
  edgeFade: "auto",
};

/**
 * Cubby's own: a soft crossfade. Only what changed moves: each changed run
 * comes in as one unit, smaller (0.9, about its own centre) and blurred
 * (0.1em), and settles into focus as the old text blurs away under it, all
 * at once. Changed digits crossfade the same way and also drift 0.08em the
 * way the value went, so a number keeps a hint of direction. New text
 * enters over 240ms and old leaves over 150ms, and everything, the box's
 * width and the words that stay sliding to their places included, runs on
 * one strong ease-out.
 */
const BLEND_EASING = WIDTH_EASING;
const BLEND_OPTIONS: TextMorphOptions = {
  motion: { duration: 240, easing: BLEND_EASING },
  fadeIn: { duration: 240, easing: BLEND_EASING, delay: 0 },
  fadeOut: { duration: 150, easing: BLEND_EASING },
  width: { duration: 240, easing: BLEND_EASING },
  stagger: { mode: "each", ms: 0 },
  roll: { distance: 0.35, scale: 1, rotate: 0 },
  morph: { scale: 1, digits: MORPH_DIGITS },
  blend: { distance: 0.08, scale: 0.9 },
  blur: 0.1,
  numbers: true,
  trend: "auto",
  edgeFade: "auto",
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

function deepFreeze<T extends object>(value: T): DeepReadonly<T> {
  for (const field of Object.values(value)) {
    if (typeof field === "object" && field !== null) deepFreeze(field);
  }
  return Object.freeze(value) as DeepReadonly<T>;
}

/** Each mode's defaults for every option. Read-only: shared by every label. */
export const MODE_DEFAULTS: {
  readonly [M in TextMorphMode]: DeepReadonly<TextMorphOptions>;
} = deepFreeze({
  blend: BLEND_OPTIONS,
  roll: ROLL_OPTIONS,
  morph: MORPH_OPTIONS,
});

type Overrides<T> = {
  [K in keyof T]?: T[K] extends object ? Overrides<T[K]> : T[K];
};

/**
 * Any subset of the options, nested fields included: `{ motion: { duration:
 * 200 } }` keeps the mode's easing, `{ stagger: { ms: 50 } }` its stagger
 * mode.
 */
export type TextMorphOverrides = Overrides<TextMorphOptions>;

/** A mode with every option filled in: what a change runs on. */
export type ResolvedOptions = TextMorphOptions & { mode: TextMorphMode };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge<T>(base: T, overrides: Overrides<T> | undefined): T {
  if (!overrides) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    out[key] =
      isRecord(value) && isRecord(out[key])
        ? merge(out[key], value as Overrides<unknown>)
        : value;
  }
  return out as T;
}

/**
 * A mode's options with `overrides` applied, and, with `duration`, the
 * whole clock scaled so movement takes that long: every other duration,
 * delay and stagger in proportion, so the look holds on a shorter or longer
 * clock.
 */
export function resolveOptions(
  mode: TextMorphMode = "blend",
  overrides?: TextMorphOverrides,
  duration?: number,
): ResolvedOptions {
  const merged = merge(MODE_DEFAULTS[mode] as TextMorphOptions, overrides);
  const timed =
    duration === undefined
      ? merged
      : scaleTiming(merged, duration / merged.motion.duration);
  return { ...timed, mode };
}

/** Every duration, delay and stagger scaled by `factor`. */
export function scaleTiming(
  o: TextMorphOptions,
  factor: number,
): TextMorphOptions {
  const t = (timing: TextMorphTiming): TextMorphTiming => ({
    ...timing,
    duration: Math.round(timing.duration * factor),
  });
  return {
    ...o,
    motion: t(o.motion),
    fadeIn: { ...t(o.fadeIn), delay: Math.round(o.fadeIn.delay * factor) },
    fadeOut: t(o.fadeOut),
    width: t(o.width),
    stagger: { ...o.stagger, ms: Math.round(o.stagger.ms * factor) },
    morph: {
      ...o.morph,
      digits: {
        ...o.morph.digits,
        fadeIn: t(o.morph.digits.fadeIn),
        fadeOut: t(o.morph.digits.fadeOut),
      },
    },
  };
}
