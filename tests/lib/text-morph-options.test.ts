import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPTIONS,
  MODE_DEFAULTS,
  faster,
  resolveOptions,
} from "@/registry/default/text-morph/lib/options";

describe("resolveOptions", () => {
  it("fills in the chosen mode's defaults", () => {
    expect(resolveOptions()).toEqual(DEFAULT_OPTIONS);
    expect(resolveOptions({ mode: "roll" })).toEqual(MODE_DEFAULTS.roll);
  });

  it("overrides a nested field and keeps its siblings", () => {
    const o = resolveOptions({ motion: { duration: 200 } });
    expect(o.motion).toEqual({
      duration: 200,
      easing: MODE_DEFAULTS.morph.motion.easing,
    });
    expect(o.fadeIn).toEqual(MODE_DEFAULTS.morph.fadeIn);
  });

  it("merges two levels down", () => {
    const o = resolveOptions({ morph: { digits: { distance: 0.5 } } });
    expect(o.morph.scale).toBe(MODE_DEFAULTS.morph.morph.scale);
    expect(o.morph.digits.distance).toBe(0.5);
    expect(o.morph.digits.fadeIn).toEqual(
      MODE_DEFAULTS.morph.morph.digits.fadeIn,
    );
  });

  it("takes the chosen mode's defaults under the overrides", () => {
    const o = resolveOptions({ mode: "roll", stagger: { ms: 50 } });
    expect(o.stagger).toEqual({ mode: "spread", ms: 50 });
    expect(o.roll).toEqual(MODE_DEFAULTS.roll.roll);
  });

  it("doesn't change the defaults it merges into", () => {
    resolveOptions({ motion: { duration: 1 }, morph: { scale: 0.1 } });
    expect(MODE_DEFAULTS.morph.motion.duration).toBe(400);
    expect(MODE_DEFAULTS.morph.morph.scale).toBe(0.95);
  });
});

describe("faster", () => {
  it("scales every duration, delay and stagger, keeping the look", () => {
    const o = faster(MODE_DEFAULTS.roll, 0.5);
    expect(o.motion).toEqual({
      duration: 275,
      easing: MODE_DEFAULTS.roll.motion.easing,
    });
    expect(o.stagger.ms).toBe(83);
    expect(o.width.duration).toBe(275);
    expect(o.roll).toEqual(MODE_DEFAULTS.roll.roll);
    expect(faster(MODE_DEFAULTS.morph, 0.5).fadeIn).toEqual({
      duration: 100,
      easing: "linear",
      delay: 50,
    });
  });
});
