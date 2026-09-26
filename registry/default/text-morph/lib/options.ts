export type TextMorphMode = "roll" | "morph";

/** One CSS timing: a duration in ms and any CSS easing, `linear()` included. */
export type Timing = { duration: number; easing: string };

export type TextMorphOptions = {
  /**
   * `roll` keeps the old and new text's shared start and end, and rolls the
   * glyphs between vertically, on Scritto's defaults. `morph` matches letters
   * anywhere: shared ones slide to their new place, the rest scale and fade
   * in place, on torph's defaults. Each mode brings its own defaults.
   */
  mode: TextMorphMode;
  /** Glyph movement: roll travel, enter/exit scale, shared glyphs sliding. */
  motion: Timing;
  /** Opacity and blur of arriving glyphs, optionally starting late. */
  fadeIn: Timing & { delay: number };
  /** Opacity and blur of leaving glyphs. */
  fadeOut: Timing;
  /** The box's width. */
  width: Timing;
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
    digits: { distance: number; fadeIn: Timing; fadeOut: Timing };
  };
  /** Blur on arriving and leaving glyphs, in em. */
  blur: number;
  /**
   * Match numbers by place value: digits line up on the decimal point, so
   * only the ones that changed roll.
   */
  numbers: boolean;
  /**
   * Which way glyphs roll: 1 up (new ones arrive from below), -1 down, 0
   * read it off the value (a number that grew rolls up).
   */
  trend: -1 | 0 | 1;
  /**
   * Fade old ink at an edge the box is shrinking away from. `auto` only
   * where it would land on something: a neighbour on the line, or the edge
   * of the pill or card holding the value.
   */
  edgeFade: "auto" | "always" | "never";
};

/** torph's digits: a full line of travel, fading out over 45% of the
 * duration and in over the first 25%. */
const TORPH_DIGITS: TextMorphOptions["morph"]["digits"] = {
  distance: 1,
  fadeIn: { duration: 100, easing: "linear" },
  fadeOut: { duration: 180, easing: "linear" },
};

/** The curve the box width eases on: fast out, no overshoot. */
export const WIDTH_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Ease-out expo: torph's movement, width and everything. */
export const EXPO_EASING = "cubic-bezier(0.19, 1, 0.22, 1)";

/**
 * Scritto 0.1.0's defaults, from its source: a 550ms hand-tuned spring (1.5%
 * overshoot) on transform, opacity and blur alike; glyphs travel 0.35em while
 * scaling to 0.6 and tilting 2deg, blurred 0.1em; delays fan out over 30% of
 * the duration; the box eases on its own non-overshooting curve.
 */
const SCRITTO_SPRING =
  "linear(0,.1052,.3155,.532,.7112,.8414,.9265,.9765,1.0023,1.013,1.0151,1.0133,1.01,1.0068,1.0041,1.0022,1.001,1)";
export const SCRITTO_OPTIONS: TextMorphOptions = {
  mode: "roll",
  motion: { duration: 550, easing: SCRITTO_SPRING },
  fadeIn: { duration: 550, easing: SCRITTO_SPRING, delay: 0 },
  fadeOut: { duration: 550, easing: SCRITTO_SPRING },
  width: { duration: 550, easing: WIDTH_EASING },
  stagger: { mode: "spread", ms: 165 },
  roll: { distance: 0.35, scale: 0.6, rotate: 2 },
  morph: { scale: 0.6, digits: TORPH_DIGITS },
  blur: 0.1,
  numbers: true,
  trend: 0,
  edgeFade: "auto",
};

/**
 * torph 0.1.3's defaults, from its source: 400ms ease-out expo for movement
 * and width; arriving and leaving glyphs scale by 0.95; opacity is linear,
 * leaving over the first quarter of the duration and arriving over half of it
 * from a quarter in; no blur, no stagger.
 */
export const TORPH_OPTIONS: TextMorphOptions = {
  mode: "morph",
  motion: { duration: 400, easing: EXPO_EASING },
  fadeIn: { duration: 200, easing: "linear", delay: 100 },
  fadeOut: { duration: 100, easing: "linear" },
  width: { duration: 400, easing: EXPO_EASING },
  stagger: { mode: "each", ms: 0 },
  roll: { distance: 0.35, scale: 0.95, rotate: 0 },
  morph: { scale: 0.95, digits: TORPH_DIGITS },
  blur: 0,
  numbers: true,
  trend: 0,
  edgeFade: "auto",
};

/** Each mode brings its own defaults: roll is Scritto's, morph is torph's. */
export const MODE_DEFAULTS: Record<TextMorphMode, TextMorphOptions> = {
  roll: SCRITTO_OPTIONS,
  morph: TORPH_OPTIONS,
};

/** Production: morph. */
export const DEFAULT_OPTIONS: TextMorphOptions = MODE_DEFAULTS.morph;

/** Options for `overrides`, filled in from the chosen mode's defaults. */
export function resolveOptions(
  overrides: Partial<TextMorphOptions> = {},
): TextMorphOptions {
  return {
    ...MODE_DEFAULTS[overrides.mode ?? DEFAULT_OPTIONS.mode],
    ...overrides,
  };
}

/** The same look on a shorter clock (every duration, delay and stagger). */
export function faster(o: TextMorphOptions, factor: number): TextMorphOptions {
  const t = (timing: Timing): Timing => ({
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
