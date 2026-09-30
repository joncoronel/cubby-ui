import { describe, expect, it } from "vitest";
import { followShare, ownShift } from "@/registry/default/text-morph/lib/ride";

describe("ownShift", () => {
  it("snaps a move that is the label's own margin to its exact value", () => {
    // Pinned at the end: the label moves by all of the margin.
    expect(ownShift(30, 29.98)).toBe(30);
    expect(ownShift(30, -30.03)).toBe(-30);
    // Centred: by half of it.
    expect(ownShift(30, 15.02)).toBe(15);
  });

  it("leaves any other move to be ridden as measured", () => {
    expect(ownShift(30, 12)).toBeUndefined();
  });
});

describe("followShare", () => {
  it("finds the share of its width a box's glyphs move by", () => {
    expect(followShare(40, -40)).toBe(1);
    expect(followShare(40, 20)).toBe(-0.5);
  });

  it("finds none when the glyphs don't follow the width", () => {
    expect(followShare(40, 0)).toBeUndefined();
    expect(followShare(40, -13)).toBeUndefined();
  });
});
