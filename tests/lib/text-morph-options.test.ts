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
      easing: DEFAULT_OPTIONS.motion.easing,
    });
    expect(o.fadeIn).toEqual(DEFAULT_OPTIONS.fadeIn);
  });

  it("merges two levels down", () => {
    const o = resolveOptions({ morph: { digits: { distance: 0.5 } } });
    expect(o.morph.scale).toBe(DEFAULT_OPTIONS.morph.scale);
    expect(o.morph.digits.distance).toBe(0.5);
    expect(o.morph.digits.fadeIn).toEqual(DEFAULT_OPTIONS.morph.digits.fadeIn);
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

describe("trend", () => {
  it("defaults to each library's own: auto for roll, down for morph", () => {
    expect(resolveOptions({ mode: "roll" }).trend).toBe("auto");
    expect(resolveOptions({ mode: "morph" }).trend).toBe("down");
    expect(resolveOptions({ mode: "morph", trend: "auto" }).trend).toBe("auto");
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

  it("takes overrides, filled in from their mode", () => {
    expect(faster({ mode: "roll" }, 0.5)).toEqual(
      faster(MODE_DEFAULTS.roll, 0.5),
    );
    expect(faster({ stagger: { ms: 100 } }, 0.5).stagger).toEqual({
      mode: MODE_DEFAULTS.morph.stagger.mode,
      ms: 50,
    });
  });
});
