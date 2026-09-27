import { describe, expect, it } from "vitest";
import {
  caretUnits,
  decimalFor,
  digitValue,
  findNumbers,
  matchText,
  parseNumber,
  matchPlaces,
  textUnits,
  type MatchOptions,
} from "@/registry/default/text-morph/lib/match";

const chars = (text: string): string[] => Array.from(text);
const OPTIONS: MatchOptions = { numbers: true, decimal: ".", trend: 0 };

/**
 * The new text with every kept glyph shown and every new one as `_`.
 * Spaces and line breaks show as themselves: they never animate, so
 * whether one is kept doesn't matter.
 */
function keptView(
  mode: "roll" | "morph",
  from: string,
  to: string,
  options: MatchOptions = OPTIONS,
): string {
  const { kept } = matchText(mode, chars(from), chars(to), options);
  return chars(to)
    .map((glyph, i) =>
      glyph === " " || glyph === "\n" || kept[i] !== -1 ? glyph : "_",
    )
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

// torph's number cases (packages/test-cases/src/number-cases.ts): for each
// new glyph, the old glyph it keeps, or null.
describe("matchPlaces", () => {
  const places = (
    from: string,
    to: string,
    decimal = ".",
  ): (number | null)[] => {
    const pairs = new Map(matchPlaces(chars(from), chars(to), decimal));
    return chars(to).map((_, i) => pairs.get(i) ?? null);
  };

  it("keeps digits in their columns", () => {
    expect(places("100", "101")).toEqual([0, 1, null]);
    expect(places("1,234", "1,834")).toEqual([0, 1, null, 3, 4]);
  });

  it("grows new places on the left", () => {
    expect(places("99", "199")).toEqual([null, 0, 1]);
  });

  it("slides the comma a group along as the number grows", () => {
    expect(places("999,999", "1,000,000")).toEqual([
      null,
      null,
      null,
      null,
      null,
      3,
      null,
      null,
      null,
    ]);
  });

  it("slides carried digits over when the count changes, and drops the comma", () => {
    expect(places("12,345", "1,234")).toEqual([0, null, 1, 3, 4]);
    expect(places("1.234,56", "12.345,67", ",")).toEqual([
      0,
      2,
      null,
      3,
      4,
      null,
      5,
      null,
      null,
    ]);
  });

  it("replaces a number three or more digits bigger, keeping only its affixes", () => {
    expect(places("$999.50", "$1,000,000.00")).toEqual([
      0,
      ...new Array<null>(12).fill(null),
    ]);
    expect(places("$12,345,678", "$99")).toEqual([0, null, null]);
  });

  it("keeps a fraction's columns", () => {
    expect(places("1.5", "1.55")).toEqual([0, 1, 2, null]);
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

  it("matches letters anywhere in a one-word value in morph mode", () => {
    expect(keptView("morph", "listen", "silent")).toBe("silent");
    expect(keptView("roll", "listen", "silent")).toBe("___en_");
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

describe("matchText with a caret", () => {
  const at = (caret: number): MatchOptions => ({ ...OPTIONS, caret });

  it("puts a typed digit at the caret, not wherever the digits carry", () => {
    // Typing 1 at index 1 of 1,111: by place, the new 1 would be the first.
    const byPlace = matchText(
      "morph",
      chars("1,111"),
      chars("11,111"),
      OPTIONS,
    );
    const atCaret = matchText("morph", chars("1,111"), chars("11,111"), at(2));
    expect(byPlace.kept[0]).toBe(-1);
    expect(atCaret.kept[0]).toBe(0);
    expect(atCaret.kept[1]).toBe(-1);
  });

  it("keeps everything after a deletion, shifted back", () => {
    // Deleted the 2 of 1,204; the field reformats to 104.
    expect(keptView("morph", "1,204", "104", at(1))).toBe("104");
  });

  it("pairs group separators from the end as the field reformats", () => {
    expect(keptView("morph", "999", "9,999", at(1))).toBe("__999");
    expect(keptView("morph", "1,999", "11,999", at(1))).toBe("_1,999");
  });

  it("keeps matching glyphs in place when typing over a selection", () => {
    expect(keptView("roll", "cat", "cut", at(2))).toBe("c_t");
  });

  it("still marks numbers and reads the trend", () => {
    const { nextKinds, trend } = matchText(
      "morph",
      chars("20"),
      chars("210"),
      at(2),
    );
    expect(nextKinds).toEqual(["number", "number", "number"]);
    expect(trend).toBe(1);
  });
});

describe("textUnits", () => {
  it("splits text without joining scripts into graphemes, as before", () => {
    expect(textUnits("Copy page")).toEqual(Array.from("Copy page"));
    expect(textUnits("$1,204.50")).toEqual(Array.from("$1,204.50"));
    // Hebrew is right-to-left but its letters don't join.
    expect(textUnits("שלום")).toEqual(Array.from("שלום"));
  });

  it("keeps a word in a joining script whole", () => {
    expect(textUnits("التجربة النهائية")).toEqual(["التجربة", " ", "النهائية"]);
  });

  it("still splits the other words and numbers in mixed text", () => {
    expect(textUnits("Order ١٢ طلب")).toEqual([
      "O",
      "r",
      "d",
      "e",
      "r",
      " ",
      "١",
      "٢",
      " ",
      "طلب",
    ]);
  });

  it("keeps Arabic-Indic digits as separate units", () => {
    expect(textUnits("١٬٢٠٤")).toEqual(["١", "٬", "٢", "٠", "٤"]);
  });
});

describe("numbers in other scripts", () => {
  it("reads the value of any script's digits", () => {
    expect(digitValue("٧")).toBe(7);
    expect(digitValue("۴")).toBe(4);
    expect(digitValue("9")).toBe(9);
    expect(parseNumber(chars("١٬٢٠٤٫٥"), "٫")).toBe(1204.5);
  });

  it("matches Arabic-Indic numbers by place value", () => {
    const arabic = { ...OPTIONS, decimal: "٫" };
    // ١٬٢٠٤ -> ١٬٣١٨: the thousands and the separator stay.
    expect(keptView("morph", "١٬٢٠٤", "١٬٣١٨", arabic)).toBe("١٬___");
    expect(findNumbers(chars("٪١٢ خصم"))).toHaveLength(1);
  });

  it("reads the trend from Arabic-Indic numbers", () => {
    const arabic = { ...OPTIONS, decimal: "٫" };
    expect(matchText("roll", chars("٩"), chars("١٠"), arabic).trend).toBe(1);
    expect(matchText("roll", chars("١٬٣١٨"), chars("٩٨٧"), arabic).trend).toBe(
      -1,
    );
  });

  it("counts the Arabic percent sign as part of a number", () => {
    const text = chars("خصم ١٢٪");
    const [token] = findNumbers(text);
    expect(text.slice(token.start, token.end).join("")).toBe("١٢٪");
  });
});

describe("caretUnits", () => {
  it("counts plain text one unit per character", () => {
    expect(caretUnits(textUnits("1200"), 3)).toBe(3);
  });

  it("counts an emoji or accented letter before the caret as one unit", () => {
    // "👍" is two code units, "é" typed as e + a combining accent two more.
    const units = textUnits("👍é 12");
    expect(units).toEqual(["👍", "é", " ", "1", "2"]);
    expect(caretUnits(units, "👍é 1".length)).toBe(4);
  });

  it("counts a whole Arabic word as one unit", () => {
    const value = "طلب 12";
    expect(caretUnits(textUnits(value), value.length)).toBe(4);
  });

  it("matches around the right place with an emoji before the caret", () => {
    // Typed 5 between 2 and 0, after an emoji.
    const old = textUnits("👍 120");
    const next = textUnits("👍 1250");
    const { kept } = matchText("morph", old, next, {
      ...OPTIONS,
      caret: caretUnits(next, "👍 125".length),
    });
    expect(next.map((g, i) => (kept[i] === -1 ? "_" : g)).join("")).toBe(
      "👍 12_0",
    );
  });
});

describe("decimalFor", () => {
  it("returns the locale's decimal separator", () => {
    expect(decimalFor("en")).toBe(".");
    expect(decimalFor("de-DE")).toBe(",");
  });
});

// torph's playground cases (packages/test-cases/src/cases.ts).
describe("matchText by words in morph mode", () => {
  const morph = (from: string, to: string): string =>
    keptView("morph", from, to);

  it("keeps a word whole as it moves", () => {
    expect(morph("Transaction Safe", "Processing Transaction")).toBe(
      "__________ Transaction",
    );
    expect(morph("Processing Transaction", "Transaction Safe")).toBe(
      "Transaction ____",
    );
  });

  it("swaps reordered words whole", () => {
    expect(morph("hello world", "world hello")).toBe("world hello");
  });

  it("adds and removes whole words", () => {
    expect(morph("hello", "hello world")).toBe("hello _____");
    expect(morph("hello world", "hello")).toBe("hello");
  });

  it("replaces dissimilar words whole", () => {
    expect(morph("cat and dog", "fish and bird")).toBe("____ and ____");
  });

  it("morphs a similar word letter by letter", () => {
    expect(morph("npm i torph", "pnpm i torph")).toBe("_npm i torph");
    expect(morph("npm i torph", "pnpm add torph")).toBe("_npm ___ torph");
    expect(morph("Hello World", "hello world")).toBe("_ello _orld");
  });

  it("keeps a copied letter from another word", () => {
    // Its only similar word sits on the other side of a surviving one.
    expect(morph("Copy Address", "Address Copied")).toBe("Address ______");
    // The e of "page" no longer joins "Copied".
    expect(morph("Copy page", "Copied")).toBe("Cop___");
  });

  it("leaves numbers to place value and never pairs one with a word", () => {
    expect(morph("2 of 10 done", "2 of 15 done")).toBe("2 of 1_ done");
    expect(morph("5 items", "five items")).toBe("____ items");
  });

  it("works across lines and graphemes", () => {
    expect(morph("hello\nworld", "hello\nuniverse")).toBe("hello\n________");
    expect(morph("Hello 👋", "Goodbye 👋")).toBe("_______ 👋");
  });
});

// torph's rule: a number is a whole word, opened and closed only by marks.
describe("findNumbers keeps words that aren't quantities as text", () => {
  const found = (text: string): string[] => {
    const glyphs = chars(text);
    return findNumbers(glyphs).map(({ start, end }) =>
      glyphs.slice(start, end).join(""),
    );
  };

  it("leaves versions, dates and names with digits alone", () => {
    expect(found("v1.2.3")).toEqual([]);
    expect(found("2024-01-01")).toEqual([]);
    expect(found("COVID-19")).toEqual([]);
  });

  it("still finds numbers wrapped in marks", () => {
    expect(found("(1,234)")).toEqual(["1,234"]);
    expect(found("#1 of 12!")).toEqual(["1", "12"]);
    expect(found("Total: -$5.")).toEqual(["-$5"]);
  });

  it("reads no trend from a name with digits", () => {
    const up = matchText("roll", chars("COVID-19"), chars("COVID-20"), OPTIONS);
    expect(up.trend).toBe(1);
    expect(up.nextKinds.every((kind) => kind === "text")).toBe(true);
  });
});

describe("a number without a partner", () => {
  it("still animates as a number, while its affix matches as text", () => {
    // torph's "Emptying a number to its affix": $4 → $ → $4.
    const emptied = matchText("morph", chars("$4"), chars("$"), OPTIONS);
    expect(emptied.kept).toEqual([0]);
    expect(emptied.oldKinds).toEqual(["number", "number"]);
    const refilled = matchText("morph", chars("$"), chars("$4"), OPTIONS);
    expect(refilled.kept).toEqual([0, -1]);
    expect(refilled.nextKinds).toEqual(["number", "number"]);
  });
});
