import { describe, expect, it } from "vitest";
import {
  MODE_DEFAULTS,
  resolveOptions,
  scaleTiming,
} from "@/registry/default/text-morph/lib/options";

const blend = MODE_DEFAULTS.blend;

describe("resolveOptions", () => {
  it("fills in the chosen mode's defaults, blend by default", () => {
    expect(resolveOptions()).toEqual({ ...blend, mode: "blend" });
    expect(resolveOptions("roll")).toEqual({
      ...MODE_DEFAULTS.roll,
      mode: "roll",
    });
  });

  it("overrides a nested field and keeps its siblings", () => {
    const o = resolveOptions("blend", { motion: { duration: 200 } });
    expect(o.motion).toEqual({ duration: 200, easing: blend.motion.easing });
    expect(o.fadeIn).toEqual(blend.fadeIn);
  });

  it("merges two levels down", () => {
    const o = resolveOptions("blend", { morph: { digits: { distance: 0.5 } } });
    expect(o.morph.scale).toBe(blend.morph.scale);
    expect(o.morph.digits.distance).toBe(0.5);
    expect(o.morph.digits.fadeIn).toEqual(blend.morph.digits.fadeIn);
  });

  it("takes the chosen mode's defaults under the overrides", () => {
    const o = resolveOptions("roll", { stagger: { ms: 50 } });
    expect(o.stagger).toEqual({ mode: "spread", ms: 50 });
    expect(o.roll).toEqual(MODE_DEFAULTS.roll.roll);
  });

  it("scales the whole clock to a duration, keeping the look", () => {
    const o = resolveOptions("roll", undefined, 275);
    expect(o.motion).toEqual({
      duration: 275,
      easing: MODE_DEFAULTS.roll.motion.easing,
    });
    expect(o.stagger.ms).toBe(83);
    expect(o.width.duration).toBe(275);
    expect(o.roll).toEqual(MODE_DEFAULTS.roll.roll);
  });

  it("scales after the overrides", () => {
    const o = resolveOptions("blend", { motion: { duration: 400 } }, 200);
    expect(o.motion.duration).toBe(200);
    expect(o.fadeIn.duration).toBe(120);
  });

  it("leaves the shared defaults untouched, and they can't be changed", () => {
    resolveOptions("morph", { motion: { duration: 1 }, morph: { scale: 0.1 } });
    expect(MODE_DEFAULTS.morph.motion.duration).toBe(400);
    expect(MODE_DEFAULTS.morph.morph.scale).toBe(0.95);
    expect(Object.isFrozen(MODE_DEFAULTS.morph.motion)).toBe(true);
  });
});

describe("trend", () => {
  it("defaults per mode: auto for roll, down for morph", () => {
    expect(resolveOptions("roll").trend).toBe("auto");
    expect(resolveOptions("morph").trend).toBe("down");
    expect(resolveOptions("morph", { trend: "auto" }).trend).toBe("auto");
  });
});

describe("scaleTiming", () => {
  it("scales every duration, delay and stagger", () => {
    expect(scaleTiming(resolveOptions("morph"), 0.5).fadeIn).toEqual({
      duration: 100,
      easing: "linear",
      delay: 50,
    });
    expect(
      scaleTiming(resolveOptions("morph"), 0.5).morph.digits.fadeOut,
    ).toEqual({ duration: 90, easing: "linear" });
  });
});
