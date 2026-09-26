import { describe, expect, it } from "vitest";
import {
  decimalFor,
  findNumbers,
  matchText,
  parseNumber,
  placeKeys,
  type MatchOptions,
} from "@/registry/default/text-morph/lib/match";

const chars = (text: string): string[] => Array.from(text);
const OPTIONS: MatchOptions = { numbers: true, decimal: ".", trend: 0 };

/** The new text with every kept glyph shown and every new one as `_`. */
function keptView(
  mode: "roll" | "morph",
  from: string,
  to: string,
  options: MatchOptions = OPTIONS,
): string {
  const { kept } = matchText(mode, chars(from), chars(to), options);
  return chars(to)
    .map((glyph, i) => (kept[i] === -1 ? "_" : glyph))
    .join("");
}

describe("findNumbers", () => {
  it("finds numbers with separators, signs, currency and percent", () => {
    const text = chars("Pay -$1,204.50 now, 12% off");
    const found = findNumbers(text).map(({ start, end }) =>
      text.slice(start, end).join(""),
    );
    expect(found).toEqual(["-$1,204.50", "12%"]);
  });

  it("leaves a trailing separator out of the number", () => {
    const text = chars("Chapter 3.");
    const [token] = findNumbers(text);
    expect(text.slice(token.start, token.end).join("")).toBe("3");
  });

  it("keeps separate numbers apart across a plain space", () => {
    expect(findNumbers(chars("1 of 12"))).toHaveLength(2);
  });
});

describe("placeKeys", () => {
  it("names places from the decimal point outward", () => {
    expect(placeKeys(chars("$1,204.5"), ".")).toEqual([
      "p1",
      "i3",
      "g3",
      "i2",
      "i1",
      "i0",
      "d",
      "f0",
    ]);
  });

  it("uses the locale's decimal separator", () => {
    expect(placeKeys(chars("1.204,5"), ",")).toEqual([
      "i3",
      "g3",
      "i2",
      "i1",
      "i0",
      "d",
      "f0",
    ]);
  });
});

describe("parseNumber", () => {
  it("reads signs, separators and decimals", () => {
    expect(parseNumber(chars("-$1,204.50"), ".")).toBe(-1204.5);
    expect(parseNumber(chars("−0,5"), ",")).toBe(-0.5);
  });
});

describe("matchText", () => {
  it("keeps only the digits that stay in the same place", () => {
    expect(keptView("morph", "$1,204", "$1,318")).toBe("$1,___");
  });

  it("aligns digits on the decimal point, not the start", () => {
    expect(keptView("morph", "9.50", "19.50")).toBe("_9.50");
  });

  it("matches numbers inside surrounding text by place", () => {
    expect(keptView("roll", "Track 1 of 12", "Track 2 of 12")).toBe(
      "Track _ of 12",
    );
  });

  it("marks number glyphs as numbers and the rest as text", () => {
    const { nextKinds } = matchText(
      "morph",
      chars("5 new"),
      chars("6 new"),
      OPTIONS,
    );
    expect(nextKinds).toEqual(["number", "text", "text", "text", "text"]);
  });

  it("falls back to the mode's text rule when numbers are off", () => {
    const off = { ...OPTIONS, numbers: false };
    // Morph matches letters anywhere, so the 1 and 0 of 10 are reused.
    expect(keptView("morph", "10", "01", off)).toBe("01");
    expect(keptView("morph", "10", "01")).toBe("__");
  });

  it("keeps the shared start and end in roll mode", () => {
    expect(keptView("roll", "Hide code", "Show code")).toBe("____ code");
  });

  it("keeps a shared run in the middle in roll mode", () => {
    expect(keptView("roll", "xxlightxx", "yylightyy")).toBe("__light__");
    expect(keptView("roll", "Draft saved", "Now saved!")).toBe("___ saved_");
  });

  it("ignores a single shared letter in the middle", () => {
    expect(keptView("roll", "seven", "nine")).toBe("____");
  });

  it("caps how far a middle run may travel", () => {
    // "ab" would slide 10 slots, more than its length plus two.
    expect(keptView("roll", "Xab.........Y", "Z----------abW")).toBe(
      "______________",
    );
    // Within the cap (3 slots) it's kept.
    expect(keptView("roll", "Xab..Y", "Z---abW")).toBe("____ab_");
  });

  it("matches letters anywhere in morph mode", () => {
    // The e comes from "page"; roll would only keep the shared "Cop".
    expect(keptView("morph", "Copy page", "Copied")).toBe("Cop_e_");
    expect(keptView("roll", "Copy page", "Copied")).toBe("Cop___");
  });

  it("reads the trend off the first number that changed", () => {
    const up = matchText("roll", chars("9"), chars("10"), OPTIONS);
    const down = matchText("roll", chars("$1,318"), chars("$987"), OPTIONS);
    expect(up.trend).toBe(1);
    expect(down.trend).toBe(-1);
  });

  it("treats a negative number growing toward zero as a rise", () => {
    expect(matchText("roll", chars("-5"), chars("-4"), OPTIONS).trend).toBe(1);
  });

  it("rolls up when nothing numeric changed, or trend is forced", () => {
    expect(matchText("roll", chars("Code"), chars("Hide"), OPTIONS).trend).toBe(
      1,
    );
    const forced = { ...OPTIONS, trend: -1 as const };
    expect(matchText("roll", chars("1"), chars("2"), forced).trend).toBe(-1);
  });
});

describe("decimalFor", () => {
  it("returns the locale's decimal separator", () => {
    expect(decimalFor("en")).toBe(".");
    expect(decimalFor("de-DE")).toBe(",");
  });
});
