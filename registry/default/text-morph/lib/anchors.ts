import type { GlyphKind } from "./match";
import type { TextMorphMode } from "./options";

/** A trip on screen: how far a glyph travels, [x, y] in px. */
export type Trip = [number, number];

/**
 * A trip to another line, not a centred value recentring by half a line as
 * its line count changes.
 */
export function crossesLines([, dy]: Trip, line: number): boolean {
  return Math.abs(dy) > line * 0.75;
}

/**
 * Whether every arriving and leaving glyph travels with its neighbours, on
 * its line too. Morph and blend: new text appears where it ends up while
 * the words that stay slide into place, so without it they ran into each
 * other mid-change (`Draft saved.` → `Changes saved!` drew `Changesaved`).
 * Roll's glyphs roll in place on their line.
 */
const anchorsAll = (mode: TextMorphMode): boolean =>
  mode === "morph" || mode === "blend";

/**
 * Which way a glyph rolls (1 up from below, -1 down from above): with its
 * trip when that crosses lines, so a number that moves up scrolls up as it
 * changes (rolling against its trip, it would hold still on screen while its
 * slot slid past), and `otherwise` the way the change sends it.
 */
export function rollWith(
  trip: Trip | undefined,
  otherwise: 1 | -1,
  line: number,
): 1 | -1 {
  return trip && crossesLines(trip, line) ? (trip[1] > 0 ? 1 : -1) : otherwise;
}

/**
 * Where a glyph at `i` may find a neighbour to travel with, as an index
 * range: anywhere in the value in morph and blend; in roll mode only a
 * digit, and only within its own number. None under reduced motion.
 */
export function neighbourScope(
  mode: TextMorphMode,
  reduced: boolean,
  kinds: GlyphKind[],
  i: number,
): [number, number] | null {
  if (reduced) return null;
  if (anchorsAll(mode)) return [0, kinds.length - 1];
  if (kinds[i] !== "number") return null;
  let first = i;
  let last = i;
  while (first > 0 && kinds[first - 1] === "number") first--;
  while (last < kinds.length - 1 && kinds[last + 1] === "number") last++;
  return [first, last];
}

/**
 * The trip of the nearest glyph around `index` (within `range`) that has
 * one, looking after it first or before it first.
 */
export function nearestTrip(
  index: number,
  [first, last]: [number, number],
  tripAt: (i: number) => Trip | undefined,
  forwardFirst: boolean,
): Trip | undefined {
  const scan = (step: 1 | -1): Trip | undefined => {
    for (let j = index + step; j >= first && j <= last; j += step) {
      const trip = tripAt(j);
      if (trip) return trip;
    }
    return undefined;
  };
  const [one, two]: [1 | -1, 1 | -1] = forwardFirst ? [1, -1] : [-1, 1];
  return scan(one) ?? scan(two);
}

/**
 * What arrives or leaves travels with its nearest surviving neighbour on its
 * line: arriving glyphs look before them first and start where that
 * neighbour started; leaving glyphs look after them first and go where it
 * goes. Morph and blend anchor everything; roll only digits, and only across
 * lines. A glyph in a shape swapped as one doesn't travel.
 *
 * Survivors' trips (`moves`, by new index) are how far each moved in the
 * layout, not where it's drawn. A neighbour on another line doesn't count:
 * in wrapped text the glyph before a line's first ends the line above, and
 * travelling with it would carry the glyph off the start of its own line.
 */
export function planTrips({
  mode,
  reduced,
  line,
  kept,
  nextKinds,
  oldKinds,
  moves,
  nextTop,
  keptTop,
  arriving,
  leaving,
  grouped,
}: {
  mode: TextMorphMode;
  reduced: boolean;
  /** Line height, px. */
  line: number;
  /** For each new glyph, the old index it keeps, or -1. */
  kept: number[];
  nextKinds: GlyphKind[];
  oldKinds: GlyphKind[];
  /** How far each survivor moved, by new index. */
  moves: Map<number, Trip>;
  /** Where each new glyph's line is (its top), by new index. */
  nextTop: (i: number) => number | undefined;
  /** Where each surviving old glyph's line was, by old index. */
  keptTop: (i: number) => number | undefined;
  /** Whether the new glyph at `i` arrives (not kept, not a space). */
  arriving: (i: number) => boolean;
  /** The leaving glyphs: old index, and where their line was. */
  leaving: { index: number; top: number }[];
  /** Whether a glyph belongs to a shape swapped as one (new or old side). */
  grouped: (side: "next" | "old", i: number) => boolean;
}): { arrivals: Map<number, Trip>; departures: Map<number, Trip> } {
  const sameLine = (a: number | undefined, b: number | undefined): boolean =>
    a !== undefined && b !== undefined && Math.abs(a - b) < line / 2;
  const travels = (trip: Trip): boolean =>
    anchorsAll(mode) || crossesLines(trip, line);

  const arrivals = new Map<number, Trip>();
  for (let i = 0; i < nextKinds.length; i++) {
    const range = neighbourScope(mode, reduced, nextKinds, i);
    if (!range || !arriving(i) || grouped("next", i)) continue;
    const trip = nearestTrip(
      i,
      range,
      (j) => (sameLine(nextTop(j), nextTop(i)) ? moves.get(j) : undefined),
      false,
    );
    if (trip && travels(trip)) arrivals.set(i, trip);
  }

  const newIndexOf = new Map(
    kept.flatMap((from, to) => (from === -1 ? [] : [[from, to]])),
  );
  const departures = new Map<number, Trip>();
  for (const { index, top } of leaving) {
    const range = neighbourScope(mode, reduced, oldKinds, index);
    if (!range || grouped("old", index)) continue;
    const start = nearestTrip(
      index,
      range,
      (j) => {
        const to = newIndexOf.get(j);
        if (to === undefined) return undefined;
        return sameLine(keptTop(j), top) ? moves.get(to) : undefined;
      },
      true,
    );
    if (start && travels(start)) departures.set(index, [-start[0], -start[1]]);
  }
  return { arrivals, departures };
}
