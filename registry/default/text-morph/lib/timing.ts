import type { GlyphKind } from "./match";
import type { TextMorphOptions } from "./options";

/**
 * Stagger delays for the glyphs that change, from where each sits (its
 * distance from the start of the line, in reading order). `each`: every
 * successive glyph `ms` later. `spread` (Scritto's sweep): delay from where
 * the glyph sits, across `ms` over the changed stretch only, so a one-digit
 * change in a long number isn't left waiting, and a glyph leaving and its
 * replacement in the same spot cross over together. The sweep spans `ms`
 * less one glyph's step, as Scritto's ladder does, so two glyphs are half of
 * it apart, not all of it.
 */
export function staggerDelays(
  o: TextMorphOptions,
  entering: number[],
  leaving: number[],
): { entering: number[]; leaving: number[] } {
  if (o.stagger.mode === "each") {
    return {
      entering: entering.map((_, k) => k * o.stagger.ms),
      leaving: leaving.map((_, k) => k * o.stagger.ms),
    };
  }
  const all = [...entering, ...leaving];
  const min = Math.min(...all);
  const span = Math.max(...all) - min;
  const sweep = (count: number) => (left: number) =>
    span > 0
      ? (((o.stagger.ms * Math.max(count - 1, 0)) / count) * (left - min)) /
        span
      : 0;
  return {
    entering: entering.map(sweep(entering.length)),
    leaving: leaving.map(sweep(leaving.length)),
  };
}

/** A glyph at home: where every arriving glyph ends and kept glyph lands. */
export const HOME: Keyframe = { translate: "0 0", scale: "1", rotate: "0deg" };

/**
 * Transform keyframe for a glyph away from home: `offset` is 1 below the
 * line, -1 above. Settle drifts digits and scales letters about their
 * run's centre (the glyph's transform origin), so a changed run grows in as
 * one unit. Morph letters scale in place; morph digits roll whole lines
 * (`line` is the line height in px).
 */
export function awayState(
  o: TextMorphOptions,
  kind: GlyphKind,
  offset: 1 | -1,
  line: number,
): Keyframe {
  if (o.mode === "settle") {
    return kind === "number"
      ? {
          translate: `0 ${offset * o.settle.distance}em`,
          scale: "1",
          rotate: "0deg",
        }
      : { translate: "0 0", scale: String(o.settle.scale), rotate: "0deg" };
  }
  if (o.mode === "roll") {
    return {
      translate: `0 ${offset * o.roll.distance}em`,
      scale: String(o.roll.scale),
      rotate: `${o.roll.rotate}deg`,
    };
  }
  if (kind === "number") {
    return {
      translate: `0 ${offset * o.morph.digits.distance * line}px`,
      scale: "1",
      rotate: "0deg",
    };
  }
  return { translate: "0 0", scale: String(o.morph.scale), rotate: "0deg" };
}

/** Fade timings for a glyph of this kind: morph's digits have their own. */
export function fadesFor(
  o: TextMorphOptions,
  kind: GlyphKind,
): {
  fadeIn: TextMorphOptions["fadeIn"];
  fadeOut: TextMorphOptions["fadeOut"];
} {
  if (o.mode === "morph" && kind === "number") {
    return {
      fadeIn: { ...o.morph.digits.fadeIn, delay: 0 },
      fadeOut: o.morph.digits.fadeOut,
    };
  }
  return { fadeIn: o.fadeIn, fadeOut: o.fadeOut };
}

/**
 * The options with nothing that moves, scales, tilts or blurs, for reduced
 * motion. New glyphs fade in straight away: morph's delay leaves a gap after
 * the old ones have gone that its travel covers, and standing still in place
 * it read as a blink rather than a crossfade.
 */
export function stillOptions(o: TextMorphOptions): TextMorphOptions {
  return {
    ...o,
    fadeIn: { ...o.fadeIn, delay: 0 },
    stagger: { ...o.stagger, ms: 0 },
    roll: { distance: 0, scale: 1, rotate: 0 },
    morph: { ...o.morph, scale: 1, digits: { ...o.morph.digits, distance: 0 } },
    settle: { distance: 0, scale: 1 },
    blur: 0,
  };
}
