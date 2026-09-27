import { describe, expect, it } from "vitest";
import type { GlyphKind } from "@/registry/default/text-morph/lib/match";
import {
  GROUP_MIN,
  planGathers,
  planShapes,
  shapeRuns,
  type Box,
} from "@/registry/default/text-morph/lib/shapes";

/**
 * A value as characters: `_` marks a changed glyph, a letter or digit an
 * unchanged one, a space a space.
 */
function parse(pattern: string) {
  const chars = Array.from(pattern);
  return {
    count: chars.length,
    isSpace: (i: number) => chars[i] === " ",
    changed: (i: number) => chars[i] === "_",
  };
}

const runsOf = (pattern: string, byWords: boolean): number[][] => {
  const { count, isSpace, changed } = parse(pattern);
  return shapeRuns(count, isSpace, changed, byWords);
};

describe("shapeRuns", () => {
  it("by words: only words with every glyph changed", () => {
    // "___ a__ ___": the middle word keeps a glyph, so it isn't a shape.
    expect(runsOf("___ a__ ___", true)).toEqual([
      [0, 1, 2],
      [8, 9, 10],
    ]);
  });

  it("by words: a word ends at a space, whatever follows", () => {
    expect(runsOf("__ __", true)).toEqual([
      [0, 1],
      [3, 4],
    ]);
  });

  it("one word: runs of at least GROUP_MIN between survivors", () => {
    const long = "_".repeat(GROUP_MIN);
    const short = "_".repeat(GROUP_MIN - 1);
    expect(runsOf(`a${long}b${short}`, false)).toEqual([
      Array.from({ length: GROUP_MIN }, (_, k) => 1 + k),
    ]);
  });

  it("one word: a survivor or a space splits a run", () => {
    expect(runsOf("___a___", false)).toEqual([]);
    expect(runsOf("___ ___", false)).toEqual([]);
  });
});

/** Glyphs 10px wide on one line, 20px tall, starting at x = 0. */
const box = (i: number): Box => ({
  left: i * 10,
  right: i * 10 + 10,
  top: 0,
  bottom: 20,
});

describe("planShapes", () => {
  it("pivots every member on the centre of its run", () => {
    const { count, isSpace, changed } = parse("___");
    const shapes = planShapes({
      count,
      isSpace,
      changed,
      kinds: ["text", "text", "text"],
      byWords: true,
      boxOf: box,
    });
    // The run spans 0..30, so its centre is at 15, 10 down.
    expect(shapes.get(0)).toEqual({
      origin: "15px 10px",
      group: false,
      toCentre: [10, 0],
    });
    expect(shapes.get(1)).toEqual({
      origin: "5px 10px",
      group: false,
      toCentre: [0, 0],
    });
    expect(shapes.get(2)).toEqual({
      origin: "-5px 10px",
      group: false,
      toCentre: [-10, 0],
    });
  });

  it("by words: letters shape as words, runs of digits as groups", () => {
    const pattern = "___ " + "_".repeat(GROUP_MIN);
    const kinds: GlyphKind[] = [
      "text",
      "text",
      "text",
      "text",
      ...Array<GlyphKind>(GROUP_MIN).fill("number"),
    ];
    const { count, isSpace, changed } = parse(pattern);
    const shapes = planShapes({
      count,
      isSpace,
      changed,
      kinds,
      byWords: true,
      boxOf: box,
    });
    expect(shapes.get(0)?.group).toBe(false);
    expect(shapes.get(4)?.group).toBe(true);
    expect(shapes.get(3)).toBeUndefined();
  });

  it("one word: a long enough run is a group, digits included", () => {
    const { count, isSpace, changed } = parse("_".repeat(GROUP_MIN));
    const shapes = planShapes({
      count,
      isSpace,
      changed,
      kinds: Array<GlyphKind>(GROUP_MIN).fill("number"),
      byWords: false,
      boxOf: box,
    });
    expect(shapes.size).toBe(GROUP_MIN);
    expect([...shapes.values()].every((s) => s.group)).toBe(true);
  });

  it("leaves out a glyph without a box, centring on the rest", () => {
    const { count, isSpace, changed } = parse("___");
    const shapes = planShapes({
      count,
      isSpace,
      changed,
      kinds: ["text", "text", "text"],
      byWords: true,
      boxOf: (i) => (i === 2 ? undefined : box(i)),
    });
    expect(shapes.has(2)).toBe(false);
    expect(shapes.get(0)?.origin).toBe("10px 10px");
  });
});

describe("planGathers", () => {
  it("gathers each changed run, whole word or not, about its own centre", () => {
    // "Cop___": the changed `ied` gathers alone.
    const { count, isSpace, changed } = parse("Cop___ ___");
    const shapes = planGathers({ count, isSpace, changed, boxOf: box });
    expect([...shapes.keys()]).toEqual([3, 4, 5, 7, 8, 9]);
    expect(shapes.get(3)?.toCentre).toEqual([10, 0]);
    expect(shapes.get(4)?.toCentre).toEqual([0, 0]);
    expect([...shapes.values()].every((s) => !s.group)).toBe(true);
  });
});
