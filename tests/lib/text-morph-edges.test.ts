import { describe, expect, it } from "vitest";
import {
  armMark,
  arrivalClip,
  edgeBand,
  readArm,
} from "@/registry/default/text-morph/lib/edges";

describe("arrivalClip", () => {
  const button = { left: 100, right: 200 };
  const pinnedRight = { left: 120, right: 190 };

  it("hides text arriving past an edge the label holds still", () => {
    const grown = { left: 110, right: 190 };
    expect(
      arrivalClip([{ left: 170, right: 215 }], button, pinnedRight, grown),
    ).toBe("inset(-100vh -10px -100vh -100vw)");
  });

  it("leaves an edge that moves unclipped", () => {
    const moved = { left: 120, right: 195 };
    expect(
      arrivalClip([{ left: 170, right: 215 }], button, pinnedRight, moved),
    ).toBeNull();
  });

  it("does nothing when everything arrives inside", () => {
    expect(
      arrivalClip(
        [{ left: 150, right: 180 }],
        button,
        pinnedRight,
        pinnedRight,
      ),
    ).toBeNull();
  });
});

describe("edgeBand", () => {
  const layer = { left: 10, width: 300 };

  it("follows the box a little past its edges", () => {
    expect(edgeBand(50, 150, { start: "box", end: "box" }, layer, 4)).toEqual({
      left: 36,
      right: 144,
    });
  });

  it("holds at a container edge, and reaches the layer's side unarmed", () => {
    expect(edgeBand(50, 150, { start: false, end: 200 }, layer, 4)).toEqual({
      left: 0,
      right: 190,
    });
  });
});

describe("armMark and readArm", () => {
  it("keep a held edge on screen as the layer's origin moves", () => {
    const mark = armMark(40, 100);
    expect(mark).toBe("140");
    expect(readArm(mark, 120)).toBe(20);
  });

  it("round-trip following the box and not fading", () => {
    expect(readArm(armMark("box", 100), 50)).toBe("box");
    expect(armMark(false, 100)).toBeUndefined();
    expect(readArm(undefined, 50)).toBe(false);
  });
});
