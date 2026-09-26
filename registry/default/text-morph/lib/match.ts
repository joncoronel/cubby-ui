import type { TextMorphMode } from "./options";

/*
 * Which glyphs of the old text survive into the new one. Pure: works on
 * grapheme strings, so it can be tested without a DOM.
 *
 * Numbers are matched by place value (torph): the digits line up on the
 * decimal point, so 1,204 → 1,318 keeps the thousands and the comma, and a
 * digit that changes rolls in place. Everything else is matched by the
 * mode's text rule.
 *
 * A field someone is typing in knows where the edit happened, so with a
 * caret the whole value is matched around it instead (torph's cursorIndex):
 * typing 1 in front of 20 inserts a digit rather than renumbering the
 * column.
 */

/** `number`: part of a number matched by place value. */
export type GlyphKind = "text" | "number";

export type MatchResult = {
  /** For each new glyph, the index of the old glyph it keeps, or -1. */
  kept: number[];
  nextKinds: GlyphKind[];
  oldKinds: GlyphKind[];
  /** 1: the value went up (new glyphs arrive from below), -1: down. */
  trend: 1 | -1;
};

export type MatchOptions = {
  /** Match numbers by place value. */
  numbers: boolean;
  /** The locale's decimal separator. */
  decimal: string;
  /** 1 up, -1 down, 0 read it off the numbers. */
  trend: -1 | 0 | 1;
  /**
   * Where the caret sits in the new value after an edit. Matches around it
   * instead of by place value and the mode's text rule.
   */
  caret?: number;
};

type NumberToken = { start: number; end: number };

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
const wordSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "word" })
    : null;

function graphemes(text: string): string[] {
  return graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(text), (s) => s.segment)
    : Array.from(text);
}

/**
 * A letter or mark from a script whose letters join (Arabic and the scripts
 * written with it, Syriac, N'Ko, Mongolian, ...). Their digits don't join,
 * so they're left out.
 */
const JOINING =
  /(?=[\p{L}\p{M}])[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}\p{Script=Thaana}]/u;

/**
 * The units a value animates in: one per grapheme, except that a word
 * written in a joining script stays whole. Its letters take their joined
 * forms only when drawn together, so splitting it would render each in its
 * isolated form. Everything else, digits included, is still per grapheme.
 */
export function textUnits(text: string): string[] {
  if (!JOINING.test(text)) return graphemes(text);
  const words = wordSegmenter
    ? Array.from(wordSegmenter.segment(text), (s) => s.segment)
    : text.split(/(\s+)/).filter(Boolean);
  return words.flatMap((word) =>
    JOINING.test(word) ? [word] : graphemes(word),
  );
}

const SIGN = "+-−";
const GROUP = ".,'   \u066C\u066B";
/** Any script's decimal digits (0-9, ٠-٩, ۰-۹, ...). */
const DIGIT = /^\p{Nd}$/u;
/** Percent signs a number can end with, Latin and Arabic. */
const PERCENT = "%\u066A";
const CURRENCY = /^\p{Sc}$/u;

const isDigit = (g: string): boolean => DIGIT.test(g);

/**
 * Numbers in a grapheme list: an optional sign and currency symbol, digits
 * with group or decimal separators between them, and an optional `%`.
 */
export function findNumbers(glyphs: string[]): NumberToken[] {
  const tokens: NumberToken[] = [];
  let i = 0;
  while (i < glyphs.length) {
    if (!isDigit(glyphs[i])) {
      i++;
      continue;
    }
    let start = i;
    // Leading currency symbol, then sign, either order.
    for (let k = 0; k < 2; k++) {
      const before = glyphs[start - 1];
      if (before && (CURRENCY.test(before) || SIGN.includes(before))) start--;
    }
    let end = i + 1;
    while (end < glyphs.length) {
      if (isDigit(glyphs[end])) end++;
      else if (GROUP.includes(glyphs[end]) && isDigit(glyphs[end + 1] ?? ""))
        end += 2;
      else break;
    }
    if (end < glyphs.length && PERCENT.includes(glyphs[end])) end++;
    tokens.push({ start, end });
    i = end;
  }
  return tokens;
}

/**
 * A key per glyph of one number, naming its place: `i2` is the hundreds,
 * `g3` the separator left of them, `f0` the first decimal, `d` the point.
 * Glyphs with the same key and character are the same glyph.
 */
export function placeKeys(glyphs: string[], decimal: string): string[] {
  const first = glyphs.findIndex(isDigit);
  let last = glyphs.length - 1;
  while (last > first && !isDigit(glyphs[last])) last--;
  let point = -1;
  for (let i = last; i > first; i--) {
    if (glyphs[i] === decimal) {
      point = i;
      break;
    }
  }
  const intEnd = point === -1 ? last + 1 : point;

  const keys: string[] = new Array(glyphs.length);
  for (let i = 0; i < first; i++) keys[i] = `p${first - i}`;
  for (let i = last + 1; i < glyphs.length; i++) keys[i] = `s${i - last}`;
  let place = 0;
  for (let i = intEnd - 1; i >= first; i--) {
    if (isDigit(glyphs[i])) keys[i] = `i${place++}`;
    else keys[i] = `g${place}`;
  }
  if (point !== -1) {
    keys[point] = "d";
    let decimals = 0;
    for (let i = point + 1; i <= last; i++) {
      if (isDigit(glyphs[i])) keys[i] = `f${decimals++}`;
      else keys[i] = `h${decimals}`;
    }
  }
  return keys;
}

/** The numeric value of a number token, or NaN. */
/**
 * A decimal digit's value, in any script: digits run in blocks of ten from
 * zero, so it's the distance from the start of its run.
 */
export function digitValue(digit: string): number {
  const code = digit.codePointAt(0) ?? 0;
  let start = code;
  while (DIGIT.test(String.fromCodePoint(start - 1))) start--;
  return (code - start) % 10;
}

export function parseNumber(glyphs: string[], decimal: string): number {
  let text = "";
  for (const g of glyphs) {
    if (isDigit(g)) text += digitValue(g);
    else if (g === decimal) text += ".";
    else if (g === "-" || g === "−") text = `-${text}`;
  }
  return Number(text);
}

/** Keep the shared start and end. Returns [newIndex, oldIndex] pairs. */
function matchEnds(old: string[], next: string[]): [number, number][] {
  const pairs: [number, number][] = [];
  let start = 0;
  while (
    start < old.length &&
    start < next.length &&
    old[start] === next[start]
  ) {
    pairs.push([start, start]);
    start++;
  }
  let end = 0;
  while (
    end < old.length - start &&
    end < next.length - start &&
    old[old.length - 1 - end] === next[next.length - 1 - end]
  ) {
    pairs.push([next.length - 1 - end, old.length - 1 - end]);
    end++;
  }

  // Between them, one shared run flush with neither end (Scritto's
  // floating run): xxlightxx → yylightyy keeps "light". It must be at
  // least two glyphs (one shared letter is a coincidence) and may travel at
  // most its own length plus two slots, so a word never swims across the
  // value while everything around it dissolves.
  const run = floatingRun(
    old.slice(start, old.length - end),
    next.slice(start, next.length - end),
  );
  if (run) {
    for (let k = 0; k < run.length; k++) {
      pairs.push([start + run.to + k, start + run.from + k]);
    }
  }
  return pairs;
}

const MIN_RUN = 2;
const RUN_SLACK = 2;

/** The longest shared run within its travel cap; the shorter trip on ties. */
export function floatingRun(
  old: string[],
  next: string[],
): { from: number; to: number; length: number } | null {
  let best: { from: number; to: number; length: number } | null = null;
  // lengths[j]: the shared run ending at old[i - 1] and next[j - 1].
  let previous = new Array<number>(next.length + 1).fill(0);
  for (let i = 1; i <= old.length; i++) {
    const lengths = new Array<number>(next.length + 1).fill(0);
    for (let j = 1; j <= next.length; j++) {
      if (old[i - 1] !== next[j - 1]) continue;
      const length = previous[j - 1] + 1;
      lengths[j] = length;
      const from = i - length;
      const to = j - length;
      const travel = Math.abs(to - from);
      if (length < MIN_RUN || travel > length + RUN_SLACK) continue;
      if (
        !best ||
        length > best.length ||
        (length === best.length && travel < Math.abs(best.to - best.from))
      ) {
        best = { from, to, length };
      }
    }
    previous = lengths;
  }
  return best;
}

/** Match each glyph to the first unused old copy of it, in order. */
function matchAnywhere(old: string[], next: string[]): [number, number][] {
  const pool = new Map<string, number[]>();
  old.forEach((glyph, i) => pool.set(glyph, [...(pool.get(glyph) ?? []), i]));
  const pairs: [number, number][] = [];
  next.forEach((glyph, i) => {
    const from = pool.get(glyph)?.shift();
    if (from !== undefined) pairs.push([i, from]);
  });
  return pairs;
}

/**
 * Match around the caret of an edit. Group separators are set aside first,
 * since a field that formats as you type moves them around: the rest is
 * shared before the edit and shifted by its length after it, and the
 * separators pair up from the end.
 */
export function matchCaret(
  old: string[],
  next: string[],
  caret: number,
  decimal: string,
): [number, number][] {
  const isSeparator = (g: string): boolean =>
    g !== decimal && GROUP.includes(g);
  const oldRest = old.flatMap((g, i) => (isSeparator(g) ? [] : [i]));
  const nextRest = next.flatMap((g, i) => (isSeparator(g) ? [] : [i]));
  const pairs: [number, number][] = [];
  const pair = (to: number, from: number): void => {
    if (old[oldRest[from]] === next[nextRest[to]]) {
      pairs.push([nextRest[to], oldRest[from]]);
    }
  };

  // The caret, counted in non-separator glyphs.
  const at = nextRest.filter((i) => i < caret).length;
  const grew = nextRest.length - oldRest.length;
  if (grew > 0) {
    // Typed `grew` glyphs, ending at the caret.
    for (let k = 0; k < at - grew; k++) pair(k, k);
    for (let k = at; k < nextRest.length; k++) pair(k, k - grew);
  } else if (grew < 0) {
    // Deleted glyphs, starting at the caret.
    for (let k = 0; k < at; k++) pair(k, k);
    for (let k = at; k < nextRest.length; k++) pair(k, k - grew);
  } else {
    // Typed over a selection: keep what still matches in place.
    for (let k = 0; k < nextRest.length; k++) pair(k, k);
  }

  const oldSeparators = old.flatMap((g, i) => (isSeparator(g) ? [i] : []));
  const nextSeparators = next.flatMap((g, i) => (isSeparator(g) ? [i] : []));
  for (
    let k = 1;
    k <= oldSeparators.length && k <= nextSeparators.length;
    k++
  ) {
    const from = oldSeparators[oldSeparators.length - k];
    const to = nextSeparators[nextSeparators.length - k];
    if (old[from] === next[to]) pairs.push([to, from]);
  }
  return pairs;
}

export function matchText(
  mode: TextMorphMode,
  old: string[],
  next: string[],
  options: MatchOptions,
): MatchResult {
  const kept = next.map(() => -1);
  const oldKinds: GlyphKind[] = old.map(() => "text");
  const nextKinds: GlyphKind[] = next.map(() => "text");
  const oldNumbers = options.numbers ? findNumbers(old) : [];
  const nextNumbers = options.numbers ? findNumbers(next) : [];
  const paired = Math.min(oldNumbers.length, nextNumbers.length);

  const caret = options.caret;

  // Numbers, paired in order, matched by place.
  let trend: 1 | -1 | 0 = options.trend;
  for (let n = 0; n < paired; n++) {
    const a = oldNumbers[n];
    const b = nextNumbers[n];
    const aGlyphs = old.slice(a.start, a.end);
    const bGlyphs = next.slice(b.start, b.end);
    if (caret === undefined) {
      const byKey = new Map<string, number>();
      placeKeys(aGlyphs, options.decimal).forEach((key, i) =>
        byKey.set(key, a.start + i),
      );
      placeKeys(bGlyphs, options.decimal).forEach((key, i) => {
        const from = byKey.get(key);
        if (from !== undefined && old[from] === next[b.start + i]) {
          kept[b.start + i] = from;
        }
      });
    }
    for (let i = a.start; i < a.end; i++) oldKinds[i] = "number";
    for (let i = b.start; i < b.end; i++) nextKinds[i] = "number";

    if (trend === 0) {
      const before = parseNumber(aGlyphs, options.decimal);
      const after = parseNumber(bGlyphs, options.decimal);
      if (after !== before) trend = after > before ? 1 : -1;
    }
  }

  // An edit at a caret: everything is matched around it.
  if (caret !== undefined) {
    for (const [to, from] of matchCaret(old, next, caret, options.decimal)) {
      kept[to] = from;
    }
    return { kept, nextKinds, oldKinds, trend: trend === -1 ? -1 : 1 };
  }

  // Everything else, by the mode's text rule.
  const oldText = old.flatMap((_, i) => (oldKinds[i] === "text" ? [i] : []));
  const nextText = next.flatMap((_, i) => (nextKinds[i] === "text" ? [i] : []));
  const match = mode === "roll" ? matchEnds : matchAnywhere;
  for (const [to, from] of match(
    oldText.map((i) => old[i]),
    nextText.map((i) => next[i]),
  )) {
    kept[nextText[to]] = oldText[from];
  }

  // A value that gains or loses a number, or changes none, reads as a rise.
  return { kept, nextKinds, oldKinds, trend: trend === -1 ? -1 : 1 };
}

const decimals = new Map<string, string>();

/** The decimal separator for a locale. */
export function decimalFor(locale: string): string {
  let decimal = decimals.get(locale);
  if (decimal === undefined) {
    decimal =
      new Intl.NumberFormat(locale)
        .formatToParts(1.1)
        .find((part) => part.type === "decimal")?.value ?? ".";
    decimals.set(locale, decimal);
  }
  return decimal;
}
