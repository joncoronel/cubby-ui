import type { TextMorphMode } from "./options";

/*
 * Which glyphs of the old text survive into the new one. Pure: works on
 * grapheme strings, so it can be tested without a DOM.
 *
 * Numbers are matched by place value (torph): the digits line up on the
 * decimal point, so 1,204 → 1,318 keeps the thousands and the comma, and a
 * digit that changes rolls in place. Everything else is matched by the
 * mode's text rule: roll keeps the shared ends and one run between them
 * (Scritto); morph matches whole words first, then letters within the
 * words it pairs, and letters anywhere only in a one-word value (torph).
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
  /** Morph matched by words (the value has more than one). */
  byWords: boolean;
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
  /**
   * Where the value is pinned as its length changes: 0 its start, 1 its end,
   * 0.5 its middle (centred). A roll run's travel is measured on screen,
   * against that, not along the text (Scritto's anchor).
   */
  anchor?: number;
};

type NumberToken = { start: number; end: number };

type Granularity = "grapheme" | "word";

/**
 * Made on first use, and without Intl.Segmenter (Firefox before 125) left
 * out: made when the module loaded, it threw there, taking down the whole
 * bundle that imported it.
 */
const segmenters = new Map<Granularity, Intl.Segmenter | null>();

/** Split into graphemes or words; by code point without Intl.Segmenter. */
function segment(text: string, granularity: Granularity): string[] {
  if (!segmenters.has(granularity)) {
    segmenters.set(
      granularity,
      typeof Intl.Segmenter === "function"
        ? new Intl.Segmenter(undefined, { granularity })
        : null,
    );
  }
  const segmenter = segmenters.get(granularity);
  if (!segmenter) return Array.from(text);
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

const graphemes = (text: string): string[] => segment(text, "grapheme");

/**
 * A letter or mark from a script whose letters shape together: ones that
 * join (Arabic and the scripts written with it, Syriac, N'Ko, Mongolian,
 * ...) and ones that stack or fuse consonants into conjuncts (Devanagari and
 * the other Indic scripts, Sinhala, Tibetan, Thai, Lao, Khmer, Myanmar).
 * Each glyph is its own box, shaped alone, so a conjunct split across two
 * showed a loose virama or subscript. Their digits don't shape together, so
 * they're left out.
 */
const JOINING =
  /(?=[\p{L}\p{M}])[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}\p{Script=Thaana}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Tibetan}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

/**
 * The units a value animates in: one per grapheme, except that a word
 * written in a script whose letters shape together stays whole. Its letters
 * take their joined or stacked forms only when drawn together, so splitting
 * it would render each alone. Everything else, digits included, is still
 * per grapheme.
 */
export function textUnits(text: string): string[] {
  if (!JOINING.test(text)) return graphemes(text);
  const words = segment(text, "word");
  return words.flatMap((word) =>
    JOINING.test(word) ? [word] : graphemes(word),
  );
}

/**
 * A caret given as a string index (an input's `selectionStart`, in UTF-16
 * code units) as a count of the units before it, which matching works in:
 * an emoji, an accented letter or a whole Arabic word before the caret is
 * several code units but one unit.
 */
export function caretUnits(units: string[], caret: number): number {
  let length = 0;
  let count = 0;
  for (const unit of units) {
    length += unit.length;
    if (length > caret) break;
    count++;
  }
  return count;
}

const SIGN = "+-−";
const GROUP = ".,'   \u066C\u066B";
/** Any script's decimal digits (0-9, ٠-٩, ۰-۹, ...). */
const DIGIT = /^\p{Nd}$/u;
/** Percent signs a number can end with, Latin and Arabic. */
const PERCENT = "%\u066A";
const CURRENCY = /^\p{Sc}$/u;
/** A punctuation mark, in any script. */
const PUNCTUATION = /^\p{P}$/u;

/** A decimal digit, in any script. */
export const isDigit = (g: string): boolean => DIGIT.test(g);

/** Marks a number may open with, besides a currency symbol. */
const PREFIX = SIGN + "(#" + PERCENT;
/** Marks a number may close with, besides a currency symbol. */
const SUFFIX = PERCENT + ".,!?:;)\"'\u201D\u2019";

/** A space, tab or line break: where words and lines may break. */
export const isBreak = (g: string): boolean =>
  g === " " || g === "\t" || g === "\n";

/**
 * Numbers in a grapheme list. A number is a whole word (torph's rule):
 * digits with group or decimal separators between them, opened only by a
 * sign, currency symbol, `(` or `#` and closed only by punctuation, so
 * `v1.2.3`, `2024-01-01` and `COVID-19` stay text. The number itself takes
 * in a sign and currency symbol before it and a `%` after it.
 */
export function findNumbers(glyphs: string[]): NumberToken[] {
  const tokens: NumberToken[] = [];
  const isAffix = (g: string, marks: string): boolean =>
    marks.includes(g) || CURRENCY.test(g);
  let wordStart = 0;
  for (let i = 0; i <= glyphs.length; i++) {
    if (i < glyphs.length && !isBreak(glyphs[i])) continue;
    const wordFrom = wordStart;
    const wordEnd = i;
    let first = wordFrom;
    let last = wordEnd;
    wordStart = i + 1;
    while (first < last && isAffix(glyphs[first], PREFIX)) first++;
    while (last > first && isAffix(glyphs[last - 1], SUFFIX)) last--;
    if (first >= last || !isDigit(glyphs[first]) || !isDigit(glyphs[last - 1]))
      continue;
    const core = glyphs.slice(first, last);
    if (!core.every((g) => isDigit(g) || GROUP.includes(g))) continue;
    let start = first;
    // Leading currency symbol, then sign, either order.
    for (let k = 0; k < 2; k++) {
      const before = glyphs[start - 1];
      if (start > wordFrom && (CURRENCY.test(before) || SIGN.includes(before)))
        start--;
    }
    let end = last;
    if (end < wordEnd && PERCENT.includes(glyphs[end])) end++;
    tokens.push({ start, end });
  }
  return tokens;
}

/** Past this many digits gained or lost, a number is replaced, not moved. */
const MAGNITUDE_JUMP = 3;

/**
 * Pair two numbers' glyphs by place (torph's placeMatch), as [new, old]
 * index pairs. The shared prefix and suffix (a currency symbol, a `%`)
 * hold. Digits pair on the decimal point: by column while the count stays
 * the same, and as the longest run carried from the units column when it
 * changes, so `12,345` → `1,234` keeps 1234 sliding over. A separator holds
 * its distance from the point (sliding the comma one group along on
 * `999,999` → `1,000,000`) unless digits carried a reshape, when it would
 * have to cross them and leaves instead. Gaining or losing three digits or
 * more replaces the number: the two no longer read as one figure moving.
 */
export function matchPlaces(
  old: string[],
  next: string[],
  decimal: string,
): [number, number][] {
  const pairs = new Map<number, number>();
  let start = 0;
  while (
    start < old.length &&
    start < next.length &&
    old[start] === next[start] &&
    !isDigit(old[start])
  ) {
    pairs.set(start, start);
    start++;
  }
  let oldEnd = old.length;
  let nextEnd = next.length;
  while (
    oldEnd > start &&
    nextEnd > start &&
    old[oldEnd - 1] === next[nextEnd - 1] &&
    !isDigit(old[oldEnd - 1])
  ) {
    pairs.set(nextEnd - 1, oldEnd - 1);
    oldEnd--;
    nextEnd--;
  }

  // The decimal point, or the end where there is none.
  const pivotOf = (glyphs: string[], end: number): number => {
    for (let i = end - 1; i >= start; i--) if (glyphs[i] === decimal) return i;
    return end;
  };
  const digitsIn = (glyphs: string[], from: number, to: number): number[] => {
    const out: number[] = [];
    for (let i = from; i < to; i++) if (isDigit(glyphs[i])) out.push(i);
    return out;
  };
  const oldPivot = pivotOf(old, oldEnd);
  const nextPivot = pivotOf(next, nextEnd);
  const oldInt = digitsIn(old, start, oldPivot);
  const nextInt = digitsIn(next, start, nextPivot);
  // A side with no digits is a field being typed into or emptied.
  if (
    oldInt.length > 0 &&
    nextInt.length > 0 &&
    Math.abs(oldInt.length - nextInt.length) >= MAGNITUDE_JUMP
  ) {
    return [...pairs];
  }

  // Returns whether digits survived a change in their count.
  const pairDigits = (a: number[], b: number[], reshapes: boolean): boolean => {
    if (a.length === b.length || !reshapes) {
      for (let k = 0; k < Math.min(a.length, b.length); k++) {
        if (old[a[k]] === next[b[k]]) pairs.set(b[k], a[k]);
      }
      return false;
    }
    // From the units column, so ties on repeated digits resolve there.
    const carried = lcs(
      a.map((i) => old[i]).reverse(),
      b.map((i) => next[i]).reverse(),
    );
    for (const [to, from] of carried) {
      pairs.set(b[b.length - 1 - to], a[a.length - 1 - from]);
    }
    return carried.length > 0;
  };
  const separator = (from: number, to: number): void => {
    if (!isDigit(old[from]) && old[from] === next[to]) pairs.set(to, from);
  };

  if (!pairDigits(oldInt, nextInt, true)) {
    for (let k = 1; oldPivot - k >= start && nextPivot - k >= start; k++) {
      separator(oldPivot - k, nextPivot - k);
    }
  }
  // A fraction's columns are fixed by the point: 1.5 → 1.25 gains a
  // hundredths rather than sliding the 5.
  if (oldPivot < oldEnd && nextPivot < nextEnd) {
    pairs.set(nextPivot, oldPivot);
    for (let k = 1; oldPivot + k < oldEnd && nextPivot + k < nextEnd; k++) {
      separator(oldPivot + k, nextPivot + k);
    }
    pairDigits(
      digitsIn(old, oldPivot + 1, oldEnd),
      digitsIn(next, nextPivot + 1, nextEnd),
      false,
    );
  }
  return [...pairs];
}

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

/** The numeric value of a number token, or NaN. */
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
function matchEnds(
  old: string[],
  next: string[],
  anchor: number,
): [number, number][] {
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
    anchor,
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

/**
 * The longest shared run within its travel cap; the shorter trip on ties.
 * Travel is how far it moves on screen: in centred or end-pinned text the
 * value grows or shrinks about that point, so a run shifted along the text
 * by the change in length (or half of it) holds still.
 */
function floatingRun(
  old: string[],
  next: string[],
  anchor: number,
): { from: number; to: number; length: number } | null {
  const grown = next.length - old.length;
  const travelOf = (from: number, to: number): number =>
    Math.abs(to - from - anchor * grown);
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
      const travel = travelOf(from, to);
      if (length < MIN_RUN || travel > length + RUN_SLACK) continue;
      if (
        !best ||
        length > best.length ||
        (length === best.length && travel < travelOf(best.from, best.to))
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
  old.forEach((glyph, i) => {
    const at = pool.get(glyph);
    if (at) at.push(i);
    else pool.set(glyph, [i]);
  });
  const pairs: [number, number][] = [];
  next.forEach((glyph, i) => {
    const from = pool.get(glyph)?.shift();
    if (from !== undefined) pairs.push([i, from]);
  });
  return pairs;
}

/** Longest common subsequence of two lists, as [bIndex, aIndex] pairs. */
function lcs(a: string[], b: string[]): [number, number][] {
  // lengths[i][j]: the LCS of a[i..] and b[j..].
  const lengths = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.push([j, i]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

/** Stands in for a whole number when comparing words: numbers pair by place. */
const NUMBER_KEY = "\u0000#";

type Word = {
  /** Its glyphs' indices in the value. */
  glyphs: number[];
  /** What it's compared by: its text, with each number as one token. */
  key: string[];
};

/** Words: runs of glyphs between spaces. */
function wordsOf(glyphs: string[], kinds: GlyphKind[]): Word[] {
  const words: Word[] = [];
  let word: Word | null = null;
  glyphs.forEach((glyph, i) => {
    if (isBreak(glyph)) {
      word = null;
      return;
    }
    if (!word) {
      word = { glyphs: [], key: [] };
      words.push(word);
    }
    // A number counts once, however many glyphs it has.
    if (kinds[i] === "text") word.key.push(glyph);
    else if (word.glyphs.length === 0 || kinds[i - 1] !== "number") {
      word.key.push(NUMBER_KEY);
    }
    word.glyphs.push(i);
  });
  return words;
}

/** Shared letters over the longer word's length; 1 for numbers alone. */
function similarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  return lcs(a, b).length / Math.max(a.length, b.length);
}

/** Below this a new word enters whole rather than morphing from an old one. */
const MIN_SIMILARITY = 0.4;

/** How many surviving words sit before each word: the gap it's in. */
function gaps(count: number, survivors: Set<number>): number[] {
  const out: number[] = [];
  let before = 0;
  for (let i = 0; i < count; i++) {
    out.push(before);
    if (survivors.has(i)) before++;
  }
  return out;
}

/**
 * The glyphs two runs share at their start and end, as [next, old] pairs,
 * and, when what's between is the same length on both sides (a clock, a
 * date, a version), any glyph that's the same in the same place there:
 * `09:59` → `10:00` keeps its colon, `v1.3.0` → `v2.0.0` its dots.
 * Nothing moves to another place, as a reused letter would.
 */
function sharedEnds(old: string[], next: string[]): [number, number][] {
  let start = 0;
  while (
    start < old.length &&
    start < next.length &&
    old[start] === next[start]
  ) {
    start++;
  }
  let end = 0;
  while (
    end < old.length - start &&
    end < next.length - start &&
    old[old.length - 1 - end] === next[next.length - 1 - end]
  ) {
    end++;
  }
  const pairs: [number, number][] = [];
  for (let k = 0; k < start; k++) pairs.push([k, k]);
  for (let k = 1; k <= end; k++) {
    pairs.push([next.length - k, old.length - k]);
  }
  if (old.length === next.length) {
    for (let k = start; k < old.length - end; k++) {
      if (old[k] === next[k]) pairs.push([k, k]);
    }
  }
  return pairs;
}

/**
 * Match by words (torph): words that survive in order keep every glyph, and
 * so do words that only moved (`hello world` → `world hello` swaps them
 * whole); a new word takes the letters it shares with the most similar old
 * word in the same gap between survivors, when they share enough; anything
 * else enters or leaves as a whole word. Only text glyphs pair here; numbers
 * were paired by place.
 *
 * `within` is what a changed word keeps of the old word it pairs with:
 * `letters` (morph), the letters they share anywhere, in order; `ends`
 * (settle), only what they share at the start and end, so the change is one
 * run in the middle: `2024-01-01` → `2024-01-02` changes the last digit,
 * where letters reused from anywhere in a word read as busy.
 */
function matchWords(
  old: string[],
  next: string[],
  oldKinds: GlyphKind[],
  nextKinds: GlyphKind[],
  within: "letters" | "ends",
): [number, number][] {
  const oldWords = wordsOf(old, oldKinds);
  const nextWords = wordsOf(next, nextKinds);
  // Keeping only ends (settle), a word is the same word whatever
  // punctuation it ends or starts with: `saved.` → `saved!` keeps `saved`
  // and swaps the mark. A word of punctuation alone is itself.
  const core = (key: string[]): string[] => {
    let start = 0;
    let end = key.length;
    while (start < end && PUNCTUATION.test(key[start])) start++;
    while (end > start && PUNCTUATION.test(key[end - 1])) end--;
    return start === end ? key : key.slice(start, end);
  };
  const keyOf = (word: Word): string =>
    (within === "letters" ? word.key : core(word.key)).join("\u0001");
  const pairsOf = new Map<number, number>();

  const inOrder = lcs(oldWords.map(keyOf), nextWords.map(keyOf));
  for (const [to, from] of inOrder) pairsOf.set(to, from);
  const oldGaps = gaps(oldWords.length, new Set(inOrder.map(([, f]) => f)));
  const nextGaps = gaps(nextWords.length, new Set(inOrder.map(([t]) => t)));
  const taken = new Set(inOrder.map(([, from]) => from));

  // Words that moved: the same word, anywhere.
  nextWords.forEach((word, to) => {
    if (pairsOf.has(to)) return;
    const from = oldWords.findIndex(
      (old, i) => !taken.has(i) && keyOf(old) === keyOf(word),
    );
    if (from === -1) return;
    pairsOf.set(to, from);
    taken.add(from);
  });

  // Words that changed: the most similar old word in the same gap. Keeping
  // ends (settle), a gap holding one changed word on each side pairs them
  // however little they share, since only their shared ends are kept: a
  // one-word value like `1.2K` → `12.4M` keeps its `1` rather than
  // replaying whole for falling short of the similarity bar.
  const changed = new Set<number>();
  const free =
    (words: Word[], gapsOf: number[], used: (i: number) => boolean) =>
    (gap: number): number =>
      words.filter((_, i) => gapsOf[i] === gap && !used(i)).length;
  const oldFree = free(oldWords, oldGaps, (i) => taken.has(i));
  const nextFree = free(nextWords, nextGaps, (i) => pairsOf.has(i));
  nextWords.forEach((word, to) => {
    if (pairsOf.has(to)) return;
    let best = -1;
    let bestSimilarity = MIN_SIMILARITY;
    const alone =
      within === "ends" &&
      oldFree(nextGaps[to]) === 1 &&
      nextFree(nextGaps[to]) === 1;
    oldWords.forEach((old, from) => {
      if (taken.has(from) || oldGaps[from] !== nextGaps[to]) return;
      if (alone) {
        best = from;
        return;
      }
      const shared = similarity(old.key, word.key);
      if (shared > bestSimilarity) {
        best = from;
        bestSimilarity = shared;
      }
    });
    if (best === -1) return;
    pairsOf.set(to, best);
    taken.add(best);
    changed.add(to);
  });

  // Within each pair, the letters they share: in order, or at the ends of a
  // changed word.
  const pairs: [number, number][] = [];
  for (const [to, from] of pairsOf) {
    const a = oldWords[from].glyphs.filter((i) => oldKinds[i] === "text");
    const b = nextWords[to].glyphs.filter((i) => nextKinds[i] === "text");
    const shared =
      within === "ends" && changed.has(to)
        ? sharedEnds(
            a.map((k) => old[k]),
            b.map((k) => next[k]),
          )
        : lcs(
            a.map((k) => old[k]),
            b.map((k) => next[k]),
          );
    for (const [j, i] of shared) pairs.push([b[j], a[i]]);
  }
  return pairs;
}

/**
 * Match around the caret of an edit. Group separators are set aside first,
 * since a field that formats as you type moves them around: the rest is
 * shared before the edit and shifted by its length after it, and the
 * separators pair up from the end.
 */
function matchCaret(
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
  // Glyphs before the edit stay where they were; after it, they shift by
  // its length. Typing `grew` glyphs ends at the caret, deleting starts
  // there, and typing over a selection (grew 0) keeps everything in place.
  const grew = nextRest.length - oldRest.length;
  const before = grew > 0 ? at - grew : at;
  for (let k = 0; k < before; k++) pair(k, k);
  for (let k = at; k < nextRest.length; k++) pair(k, k - grew);

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
  // Settle always works by words; morph once a value has more than one.
  const byWords =
    caret === undefined &&
    (mode === "settle" ||
      (mode === "morph" &&
        (next.some(isBreak) || wordsOf(old, oldKinds).length > 1)));

  // Numbers, paired in order, matched by place.
  let trend: 1 | -1 | 0 = options.trend;
  // Matching treats a number without a partner as text (a `$` left behind
  // by `$4` → `$` still matches), but its glyphs animate as a number's:
  // the 4 rolls out rather than fading like a letter, as torph's does.
  // A value that gains or loses a number, or changes none, reads as a rise.
  const result = (): MatchResult => {
    const asNumbers = (kinds: GlyphKind[], tokens: NumberToken[]) => {
      const shown = [...kinds];
      for (const { start, end } of tokens) shown.fill("number", start, end);
      return shown;
    };
    return {
      kept,
      nextKinds: asNumbers(nextKinds, nextNumbers),
      oldKinds: asNumbers(oldKinds, oldNumbers),
      trend: trend === -1 ? -1 : 1,
      byWords,
    };
  };
  for (let n = 0; n < paired; n++) {
    const a = oldNumbers[n];
    const b = nextNumbers[n];
    const aGlyphs = old.slice(a.start, a.end);
    const bGlyphs = next.slice(b.start, b.end);
    if (caret === undefined) {
      for (const [to, from] of matchPlaces(aGlyphs, bGlyphs, options.decimal)) {
        kept[b.start + to] = a.start + from;
      }
    }
    for (let i = a.start; i < a.end; i++) oldKinds[i] = "number";
    for (let i = b.start; i < b.end; i++) nextKinds[i] = "number";

    if (trend === 0) {
      const before = parseNumber(aGlyphs, options.decimal);
      const after = parseNumber(bGlyphs, options.decimal);
      // Not a number it can read (`1.2.3`, `192.168.0.1`) has no direction:
      // NaN compares unequal to itself and never greater, so it read as a
      // fall and held there.
      if (!Number.isNaN(before) && !Number.isNaN(after) && after !== before) {
        trend = after > before ? 1 : -1;
      }
    }
  }

  // An edit at a caret: everything is matched around it.
  if (caret !== undefined) {
    for (const [to, from] of matchCaret(old, next, caret, options.decimal)) {
      kept[to] = from;
    }
    return result();
  }

  // Everything else, by the mode's text rule.
  if (byWords) {
    const within = mode === "morph" ? "letters" : "ends";
    for (const [to, from] of matchWords(
      old,
      next,
      oldKinds,
      nextKinds,
      within,
    )) {
      kept[to] = from;
    }
    return result();
  }
  const oldText = old.flatMap((_, i) => (oldKinds[i] === "text" ? [i] : []));
  const nextText = next.flatMap((_, i) => (nextKinds[i] === "text" ? [i] : []));
  // A one-word value with digits in it that isn't a number (a clock, a
  // version) keeps its letters in order, as torph does: a digit reused from
  // another column would read as the time running backwards.
  const hasDigits = options.numbers && [...old, ...next].some(isDigit);
  const oldTexts = oldText.map((i) => old[i]);
  const nextTexts = nextText.map((i) => next[i]);
  const pairs =
    mode === "roll"
      ? matchEnds(oldTexts, nextTexts, options.anchor ?? 0)
      : hasDigits
        ? lcs(oldTexts, nextTexts)
        : matchAnywhere(oldTexts, nextTexts);
  for (const [to, from] of pairs) {
    kept[nextText[to]] = oldText[from];
  }

  return result();
}

/** The decimal separator for a locale. */
export function decimalFor(locale: string): string {
  return (
    new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === "decimal")?.value ?? "."
  );
}
