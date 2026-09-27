import { describe, expect, it } from "vitest";
import type { GlyphKind } from "@/registry/default/text-morph/lib/match";
import {
  crossesLines,
  nearestTrip,
  neighbourScope,
  planTrips,
  rollWith,
  type Trip,
} from "@/registry/default/text-morph/lib/anchors";

const LINE = 20;

describe("crossesLines and rollWith", () => {
  it("counts a trip of more than three quarters of a line", () => {
    expect(crossesLines([0, 15], LINE)).toBe(false);
    expect(crossesLines([0, 16], LINE)).toBe(true);
    expect(crossesLines([40, -16], LINE)).toBe(true);
  });

  it("rolls with a trip that crosses lines, else the given way", () => {
    expect(rollWith([0, 40], -1, LINE)).toBe(1);
    expect(rollWith([0, -40], 1, LINE)).toBe(-1);
    expect(rollWith([0, 10], -1, LINE)).toBe(-1);
    expect(rollWith(undefined, 1, LINE)).toBe(1);
  });
});

describe("neighbourScope", () => {
  const kinds: GlyphKind[] = ["text", "number", "number", "text", "number"];

  it("morph: the whole value", () => {
    expect(neighbourScope("morph", false, kinds, 0)).toEqual([0, 4]);
  });

  it("roll: a digit within its own number, nothing for letters", () => {
    expect(neighbourScope("roll", false, kinds, 2)).toEqual([1, 2]);
    expect(neighbourScope("roll", false, kinds, 4)).toEqual([4, 4]);
    expect(neighbourScope("roll", false, kinds, 0)).toBeNull();
  });

  it("nothing under reduced motion", () => {
    expect(neighbourScope("morph", true, kinds, 0)).toBeNull();
  });
});

describe("nearestTrip", () => {
  const trips = new Map<number, Trip>([
    [1, [1, 0]],
    [5, [5, 0]],
  ]);
  const at = (i: number): Trip | undefined => trips.get(i);

  it("looks the preferred way first, then the other", () => {
    expect(nearestTrip(3, [0, 9], at, true)).toEqual([5, 0]);
    expect(nearestTrip(3, [0, 9], at, false)).toEqual([1, 0]);
    expect(nearestTrip(6, [0, 9], at, true)).toEqual([5, 0]);
  });

  it("stays within its range", () => {
    expect(nearestTrip(3, [2, 4], at, true)).toBeUndefined();
  });
});

/**
 * A one-line change: old `ab` becomes `xab` with `a` and `b` kept (old 0, 1
 * at new 1, 2), both moving 10px right; `x` arrives at 0.
 */
function base() {
  const moves = new Map<number, Trip>([
    [1, [10, 0]],
    [2, [10, 0]],
  ]);
  return {
    mode: "morph" as const,
    reduced: false,
    line: LINE,
    kept: [-1, 0, 1],
    nextKinds: ["text", "text", "text"] as GlyphKind[],
    oldKinds: ["text", "text"] as GlyphKind[],
    moves,
    nextTop: () => 0,
    keptTop: () => 0,
    arriving: (i: number) => i === 0,
    leaving: [] as { index: number; top: number }[],
    grouped: () => false,
  };
}

describe("planTrips", () => {
  it("an arriving glyph starts where its nearest survivor started", () => {
    const { arrivals } = planTrips(base());
    expect(arrivals.get(0)).toEqual([10, 0]);
  });

  it("a leaving glyph goes where its nearest survivor goes", () => {
    // Old `abc`: `c` (old 2) leaves; `a`, `b` survive moving 10px right.
    const { departures } = planTrips({
      ...base(),
      kept: [0, 1],
      nextKinds: ["text", "text"],
      oldKinds: ["text", "text", "text"],
      moves: new Map<number, Trip>([
        [0, [10, 0]],
        [1, [10, 0]],
      ]),
      arriving: () => false,
      leaving: [{ index: 2, top: 0 }],
    });
    // It travels opposite to the survivor's offset from its final place.
    expect(departures.get(2)).toEqual([-10, -0]);
  });

  it("ignores a neighbour on another line", () => {
    const { arrivals } = planTrips({
      ...base(),
      nextTop: (i) => (i === 0 ? 40 : 0),
    });
    expect(arrivals.size).toBe(0);
  });

  it("roll: only digits, and only across lines", () => {
    const digits = ["number", "number", "number"] as GlyphKind[];
    const onLine = planTrips({ ...base(), mode: "roll", nextKinds: digits });
    expect(onLine.arrivals.size).toBe(0);
    const acrossLines = planTrips({
      ...base(),
      mode: "roll",
      nextKinds: digits,
      moves: new Map<number, Trip>([
        [1, [10, 40]],
        [2, [10, 40]],
      ]),
    });
    expect(acrossLines.arrivals.get(0)).toEqual([10, 40]);
    const letters = planTrips({
      ...base(),
      mode: "roll",
      moves: new Map<number, Trip>([[1, [10, 40]]]),
    });
    expect(letters.arrivals.size).toBe(0);
  });

  it("a glyph in a shape swapped as one doesn't travel", () => {
    const { arrivals } = planTrips({ ...base(), grouped: () => true });
    expect(arrivals.size).toBe(0);
  });
});
