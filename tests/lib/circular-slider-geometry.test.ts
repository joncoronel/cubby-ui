import { describe, it, expect } from "vitest";
import {
  angleToProgress,
  angleToUnclampedProgress,
  arcStroke,
  continueDrag,
  createDial,
  getActiveSpan,
  isInSpan,
  ringHeight,
  trimOriginCap,
  placeRangeThumb,
  mod,
  pickOverlappedThumb,
  pointToAngle,
  progressToAngle,
  resolveStartAngle,
  snapValue,
  tickProgresses,
  valueToProgress,
  widenSpan,
  wrapDelta,
  type CreateDialOptions,
} from "@/registry/default/circular-slider/lib/geometry";

const base: CreateDialOptions = {
  min: 0,
  max: 100,
  step: 1,
  sweep: 270,
  direction: "clockwise",
  wrap: false,
};

describe("resolveStartAngle", () => {
  it("centres a partial sweep on the top", () => {
    expect(resolveStartAngle(270, "clockwise")).toBe(225);
    expect(resolveStartAngle(180, "clockwise")).toBe(270);
    expect(resolveStartAngle(270, "counterclockwise")).toBe(135);
  });

  it("starts a full circle at the top", () => {
    expect(resolveStartAngle(360, "clockwise")).toBe(0);
  });

  it("keeps an explicit start angle", () => {
    expect(resolveStartAngle(270, "clockwise", 90)).toBe(90);
  });
});

describe("createDial", () => {
  it("only wraps a full circle", () => {
    expect(createDial({ ...base, wrap: true }).wrap).toBe(false);
    expect(createDial({ ...base, sweep: 360, wrap: true }).wrap).toBe(true);
  });

  it("clamps the sweep to 1..360", () => {
    expect(createDial({ ...base, sweep: 720 }).sweep).toBe(360);
    expect(createDial({ ...base, sweep: 0 }).sweep).toBe(1);
  });
});

describe("snapValue", () => {
  it("snaps to the step grid and clamps", () => {
    const dial = createDial({ ...base, step: 5 });
    expect(snapValue(dial, 12)).toBe(10);
    expect(snapValue(dial, 13)).toBe(15);
    expect(snapValue(dial, 140)).toBe(100);
    expect(snapValue(dial, -3)).toBe(0);
  });

  it("avoids floating-point noise on decimal steps", () => {
    const dial = createDial({ ...base, step: 0.1 });
    expect(snapValue(dial, 0.30000000000000004)).toBe(0.3);
  });

  it("folds into [min, max) on a wrapping dial", () => {
    const dial = createDial({ ...base, max: 360, sweep: 360, wrap: true });
    expect(snapValue(dial, 360)).toBe(0);
    expect(snapValue(dial, -1)).toBe(359);
    expect(snapValue(dial, 725)).toBe(5);
  });

  it("stays on the step grid when the step does not divide the range", () => {
    const dial = createDial({ ...base, sweep: 360, wrap: true, step: 3 });
    // Grid: 0, 3, ... 99. One step past 99 wraps to 0, one before 0 to 99.
    expect(snapValue(dial, 102)).toBe(0);
    expect(snapValue(dial, -3)).toBe(99);
    expect(snapValue(dial, 50)).toBe(51);
  });
});

describe("angles and progress", () => {
  it("maps values onto the sweep", () => {
    const dial = createDial(base);
    expect(valueToProgress(dial, 0)).toBe(0);
    expect(valueToProgress(dial, 50)).toBe(135);
    expect(progressToAngle(dial, 135)).toBe(360);
  });

  it("runs counterclockwise from the start", () => {
    const dial = createDial({ ...base, direction: "counterclockwise" });
    expect(progressToAngle(dial, 0)).toBe(135);
    expect(progressToAngle(dial, 135)).toBe(0);
  });

  it("measures pointer angles from 12 o'clock, clockwise", () => {
    expect(pointToAngle(0, -10, 0, 0)).toBe(0);
    expect(pointToAngle(10, 0, 0, 0)).toBe(90);
    expect(pointToAngle(0, 10, 0, 0)).toBe(180);
    expect(pointToAngle(-10, 0, 0, 0)).toBe(270);
  });

  it("projects angles in the gap onto the nearer end", () => {
    const dial = createDial(base);
    // Gap runs from 135° (max) to 225° (min), centred on 180°.
    expect(angleToProgress(dial, 150)).toBe(270);
    expect(angleToProgress(dial, 210)).toBe(0);
    expect(angleToProgress(dial, 0)).toBe(135);
  });
});

describe("continueDrag", () => {
  it("pins to the end a drag came from instead of flipping", () => {
    const dial = createDial({ ...base, sweep: 360 });
    expect(continueDrag(dial, 355, 3)).toBe(360);
    expect(continueDrag(dial, 4, 357)).toBe(0);
    expect(continueDrag(dial, 100, 110)).toBe(110);
  });

  it("lets a wrapping dial pass the seam", () => {
    const dial = createDial({ ...base, sweep: 360, wrap: true });
    expect(continueDrag(dial, 355, 3)).toBe(3);
  });
});

describe("wrapDelta", () => {
  it("takes the short way round", () => {
    expect(wrapDelta(350, 10, 360)).toBe(20);
    expect(wrapDelta(10, 350, 360)).toBe(-20);
  });
});

describe("getActiveSpan", () => {
  it("spans from origin to value in either direction", () => {
    const dial = createDial({ ...base, sweep: 360, min: -50, max: 50 });
    expect(getActiveSpan(dial, [25], 0)).toEqual({ from: 180, length: 90 });
    expect(getActiveSpan(dial, [-25], 0)).toEqual({ from: 90, length: 90 });
  });

  it("runs a wrapping range clockwise through the seam", () => {
    const dial = createDial({
      ...base,
      max: 24,
      sweep: 360,
      wrap: true,
    });
    const span = getActiveSpan(dial, [22, 7], 0);
    expect(span).toEqual({ from: 330, length: 135 });
    expect(isInSpan(dial, 0, span)).toBe(true);
    expect(isInSpan(dial, 180, span)).toBe(false);
  });
});

describe("arcStroke", () => {
  it("draws a dash of the span's length, rotated to its start", () => {
    const dial = createDial({ ...base, sweep: 360 });
    const { strokeDasharray, rotate } = arcStroke(dial, 10, {
      from: 0,
      length: 90,
    });
    const circumference = 2 * Math.PI * 10;
    const [dash, gap] = strokeDasharray.split(" ").map(Number);
    expect(dash).toBeCloseTo(circumference / 4, 3);
    expect(gap).toBeCloseTo(circumference, 3);
    expect(rotate).toBe("-90deg");
  });

  it("starts a counterclockwise arc from its far end", () => {
    const dial = createDial({
      ...base,
      sweep: 360,
      direction: "counterclockwise",
    });
    expect(arcStroke(dial, 10, { from: 0, length: 90 }).rotate).toBe("-180deg");
  });
});

describe("tickProgresses", () => {
  it("puts ticks on both ends of a partial sweep", () => {
    const dial = createDial(base);
    expect(tickProgresses(dial, 3)).toEqual([0, 90, 180, 270]);
  });

  it("skips the duplicate last tick on a full circle", () => {
    const dial = createDial({ ...base, sweep: 360 });
    expect(tickProgresses(dial, 4)).toEqual([0, 90, 180, 270]);
  });
});

describe("trimOriginCap", () => {
  it("pulls the origin end in when the value is above it", () => {
    expect(trimOriginCap({ from: 10, length: 30 }, 40, 10, 5)).toEqual({
      from: 15,
      length: 25,
    });
  });

  it("pulls the origin end in when the value is below it", () => {
    expect(trimOriginCap({ from: 10, length: 30 }, 10, 40, 5)).toEqual({
      from: 10,
      length: 25,
    });
  });

  it("never goes negative", () => {
    expect(trimOriginCap({ from: 10, length: 2 }, 12, 10, 5).length).toBe(0);
  });
});

describe("ringHeight", () => {
  it("keeps a full circle square", () => {
    expect(ringHeight(createDial({ ...base, sweep: 360 }), 100, 10)).toBe(100);
  });

  it("is square when the sweep passes 6 o'clock", () => {
    const dial = createDial({ ...base, sweep: 270, startAngle: 90 });
    expect(ringHeight(dial, 100, 10)).toBe(100);
  });

  it("stops at the cap below a half dial's ends", () => {
    // Ends at 9 and 3 o'clock: center line plus half the band.
    expect(ringHeight(createDial({ ...base, sweep: 180 }), 100, 20)).toBe(60);
  });

  it("leaves room below the center for centered content", () => {
    expect(ringHeight(createDial({ ...base, sweep: 180 }), 100, 4)).toBe(60);
  });
});

describe("angleToUnclampedProgress", () => {
  it("runs past the ends into the gap", () => {
    const dial = createDial(base);
    // Gap 135°..225°: just before the start reads negative, just past the end
    // reads above the sweep.
    expect(angleToUnclampedProgress(dial, 215)).toBe(-10);
    expect(angleToUnclampedProgress(dial, 145)).toBe(280);
    expect(angleToUnclampedProgress(dial, 0)).toBe(135);
  });

  it("pins a jump across the gap's middle to the end it came from", () => {
    const dial = createDial(base);
    const before = angleToUnclampedProgress(dial, 185); // -40, near min
    const after = angleToUnclampedProgress(dial, 175); // 310, near max
    expect(continueDrag(dial, before, after)).toBe(0);
  });
});

describe("placeRangeThumb", () => {
  const dial = createDial(base);

  it("moves freely while the thumbs are apart", () => {
    expect(placeRangeThumb(dial, [20, 60], 0, 30, 0, "push")).toEqual([30, 60]);
  });

  it("pushes the other thumb on collision", () => {
    expect(placeRangeThumb(dial, [20, 60], 0, 70, 0, "push")).toEqual([70, 70]);
    expect(placeRangeThumb(dial, [20, 60], 1, 10, 5, "push")).toEqual([5, 10]);
  });

  it("stops the pushed thumb at the end of the dial", () => {
    expect(placeRangeThumb(dial, [20, 98], 0, 99, 5, "push")).toEqual([
      95, 100,
    ]);
  });

  it("stops at the other thumb without push", () => {
    expect(placeRangeThumb(dial, [20, 60], 0, 70, 5, "none")).toEqual([55, 60]);
  });

  describe("on a wrapping dial", () => {
    const clock = createDial({
      ...base,
      max: 24,
      sweep: 360,
      wrap: true,
    });

    it("pushes the end through midnight", () => {
      // Start 22:00 pushed forward to 08:00 against an end at 07:00.
      expect(placeRangeThumb(clock, [22, 7], 1, 6, 0, "push")).toEqual([22, 6]);
      expect(placeRangeThumb(clock, [6, 7], 0, 8, 0, "push")).toEqual([8, 8]);
    });

    it("pushes the start backward when the end runs into it", () => {
      expect(placeRangeThumb(clock, [22, 23], 1, 21, 1, "push")).toEqual([
        20, 21,
      ]);
    });

    it("stops at the gap without push", () => {
      expect(placeRangeThumb(clock, [6, 7], 0, 8, 1, "none")).toEqual([6, 7]);
    });
  });
});

describe("widenSpan", () => {
  it("lights the tick a value stops just short of", () => {
    const dial = createDial(base);
    // 24 intervals over 270°: a tick every 11.25°. 58 sits at 156.6°, just
    // short of the tick at 157.5°.
    const span = getActiveSpan(dial, [58], 0);
    expect(isInSpan(dial, 157.5, span)).toBe(false);
    const half = (270 / 24 / 2) * 0.999;
    expect(isInSpan(dial, 157.5, widenSpan(span, half))).toBe(true);
    // The next tick along stays dark.
    expect(isInSpan(dial, 168.75, widenSpan(span, half))).toBe(false);
  });
});

describe("mod", () => {
  it("never goes negative", () => {
    expect(mod(-1, 360)).toBe(359);
    expect(mod(725, 360)).toBe(5);
  });
});

describe("pickOverlappedThumb", () => {
  it("takes the thumb that can move the way the pointer went", () => {
    const dial = createDial(base);
    expect(pickOverlappedThumb(dial, [40, 40], true)).toBe(1);
    expect(pickOverlappedThumb(dial, [40, 40], false)).toBe(0);
  });

  it("follows the short way round on a wrapping dial", () => {
    const clock = createDial({ ...base, max: 24, sweep: 360, wrap: true });
    // End just ahead of the start, through midnight.
    expect(pickOverlappedThumb(clock, [23.75, 0], true)).toBe(1);
    // End just behind the start: the start is the one ahead.
    expect(pickOverlappedThumb(clock, [0, 23.75], true)).toBe(0);
  });
});
