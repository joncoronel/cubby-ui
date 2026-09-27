import { describe, expect, it } from "vitest";
import { MODE_DEFAULTS } from "@/registry/default/text-morph/lib/options";
import {
  HOME,
  awayState,
  fadesFor,
  staggerDelays,
  stillOptions,
} from "@/registry/default/text-morph/lib/timing";

const roll = MODE_DEFAULTS.roll;
const morph = MODE_DEFAULTS.morph;

describe("staggerDelays", () => {
  it("each: every successive glyph ms later, entering and leaving apart", () => {
    const o = { ...morph, stagger: { mode: "each" as const, ms: 30 } };
    expect(staggerDelays(o, [50, 10, 90], [0, 5])).toEqual({
      entering: [0, 30, 60],
      leaving: [0, 30],
    });
  });

  it("spread: sweeps by position across the changed stretch only", () => {
    // Roll's 165ms sweep over three entering glyphs spans 165 * 2/3 = 110ms.
    const { entering } = staggerDelays(roll, [100, 110, 120], []);
    expect(entering).toEqual([0, 55, 110]);
  });

  it("spread: a glyph and its replacement in one spot cross over together", () => {
    const { entering, leaving } = staggerDelays(roll, [0, 20], [0, 20]);
    expect(entering).toEqual(leaving);
  });

  it("spread: one glyph, or glyphs all in one place, wait for nothing", () => {
    expect(staggerDelays(roll, [40], []).entering).toEqual([0]);
    expect(staggerDelays(roll, [7, 7], [7]).entering).toEqual([0, 0]);
  });
});

describe("awayState", () => {
  it("roll: travels its distance, scaled and tilted, the way it's sent", () => {
    expect(awayState(roll, "text", 1, 20)).toEqual({
      translate: "0 0.35em",
      scale: "0.6",
      rotate: "2deg",
    });
    expect(awayState(roll, "number", -1, 20).translate).toBe("0 -0.35em");
  });

  it("morph: letters scale in place; digits roll whole lines", () => {
    expect(awayState(morph, "text", 1, 20)).toEqual({
      translate: "0 0",
      scale: "0.95",
      rotate: "0deg",
    });
    expect(awayState(morph, "number", -1, 36)).toEqual({
      translate: "0 -36px",
      scale: "1",
      rotate: "0deg",
    });
  });

  it("HOME is no offset, scale or tilt", () => {
    expect(HOME).toEqual({ translate: "0 0", scale: "1", rotate: "0deg" });
  });
});

describe("fadesFor", () => {
  it("morph digits take their own fades, with no delay", () => {
    expect(fadesFor(morph, "number")).toEqual({
      fadeIn: { ...morph.morph.digits.fadeIn, delay: 0 },
      fadeOut: morph.morph.digits.fadeOut,
    });
  });

  it("everything else takes the mode's fades", () => {
    expect(fadesFor(morph, "text")).toEqual({
      fadeIn: morph.fadeIn,
      fadeOut: morph.fadeOut,
    });
    expect(fadesFor(roll, "number")).toEqual({
      fadeIn: roll.fadeIn,
      fadeOut: roll.fadeOut,
    });
  });
});

describe("stillOptions", () => {
  it("removes travel, scale, tilt, blur, stagger and the fade-in delay", () => {
    for (const o of [roll, morph]) {
      const still = stillOptions(o);
      expect(still.roll).toEqual({ distance: 0, scale: 1, rotate: 0 });
      expect(still.morph.scale).toBe(1);
      expect(still.morph.digits.distance).toBe(0);
      expect(still.blur).toBe(0);
      expect(still.stagger.ms).toBe(0);
      expect(still.fadeIn.delay).toBe(0);
      // Timings stay: it still crossfades.
      expect(still.fadeIn.duration).toBe(o.fadeIn.duration);
      expect(still.fadeOut).toEqual(o.fadeOut);
    }
  });

  it("with nothing moving, a glyph away from home is at home", () => {
    for (const o of [roll, morph]) {
      const still = stillOptions(o);
      for (const kind of ["text", "number"] as const) {
        const away = awayState(still, kind, 1, 36);
        expect(away.scale).toBe("1");
        expect(away.rotate).toBe("0deg");
        expect(String(away.translate)).toMatch(/^0 0(em|px)?$/);
      }
    }
  });
});

describe("settle", () => {
  const settle = MODE_DEFAULTS.settle;

  it("crossfades a changed run as one unit, a touch smaller", () => {
    expect(awayState(settle, "text", 1, 36)).toEqual({
      translate: "0 0",
      scale: "0.94",
      rotate: "0deg",
    });
    expect(settle.stagger.ms).toBe(0);
    expect(settle.blur).toBe(0.1);
  });

  it("drifts digits the way the value went, unscaled", () => {
    expect(awayState(settle, "number", 1, 36)).toEqual({
      translate: "0 0.15em",
      scale: "1",
      rotate: "0deg",
    });
    expect(awayState(settle, "number", -1, 36).translate).toBe("0 -0.15em");
  });

  it("runs on one curve and leaves faster than it enters", () => {
    const curves = [
      settle.motion.easing,
      settle.fadeIn.easing,
      settle.fadeOut.easing,
      settle.width.easing,
    ];
    expect(new Set(curves).size).toBe(1);
    expect(settle.fadeOut.duration).toBeLessThan(settle.fadeIn.duration);
  });

  it("holds still under reduced motion", () => {
    const still = stillOptions(settle);
    expect(awayState(still, "text", 1, 36).scale).toBe("1");
    expect(awayState(still, "number", 1, 36).translate).toBe("0 0em");
  });
});
