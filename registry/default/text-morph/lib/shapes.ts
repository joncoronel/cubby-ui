import type { GlyphKind } from "./match";

/**
 * Morph mode, one-word values: a run of this many replaced glyphs,
 * with no survivor inside, is swapped as one shape rather than glyph by
 * glyph. It recedes further, to GROUP_SCALE about its own centre, and its
 * fades take these shares of the movement's duration.
 */
export const GROUP_MIN = 6;
export const GROUP_SCALE = 0.8;
export const GROUP_FADE_IN = 0.35;
export const GROUP_FADE_OUT = 0.45;

/** How a glyph arriving or leaving as part of a shape scales. */
export type Shape = {
  /** Its scale's pivot, the shape's centre from its own box (CSS). */
  origin: string;
  /** A run swapped as one shape (further, faster), not a word. */
  group: boolean;
};

/** Where a glyph sits: any rect (a DOMRect will do). */
export type Box = { left: number; right: number; top: number; bottom: number };

/**
 * The runs of changed glyphs (arriving, or leaving) to shape: whole words,
 * a word being a run between spaces with every glyph changed, or runs of at
 * least `min` changed glyphs between survivors.
 */
export function shapeRuns(
  count: number,
  isSpace: (i: number) => boolean,
  changed: (i: number) => boolean,
  byWords: boolean,
  min = GROUP_MIN,
): number[][] {
  const runs: number[][] = [];
  let run: number[] = [];
  let whole = true;
  const flush = (): void => {
    if (byWords ? whole && run.length > 0 : run.length >= min) {
      runs.push(run);
    }
    run = [];
    whole = true;
  };
  for (let i = 0; i < count; i++) {
    if (isSpace(i)) flush();
    else if (changed(i)) run.push(i);
    else if (byWords) whole = false;
    else flush();
  }
  flush();
  return runs;
}

/**
 * Each run's pivots, into `shapes`: the centre of the whole run, from each
 * member's own box. A glyph without a box is left out of its run.
 */
function addRuns(
  runs: number[][],
  boxOf: (i: number) => Box | undefined,
  group: boolean,
  shapes: Map<number, Shape>,
): void {
  for (const run of runs) {
    const members = run.flatMap((index) => {
      const box = boxOf(index);
      return box ? [{ index, box }] : [];
    });
    if (members.length > 0) origins(members, group, shapes);
  }
}

/** Each member's pivot: the centre of the whole run, from its own box. */
function origins(
  members: { index: number; box: Box }[],
  group: boolean,
  into: Map<number, Shape>,
): void {
  const left = Math.min(...members.map((m) => m.box.left));
  const right = Math.max(...members.map((m) => m.box.right));
  const top = Math.min(...members.map((m) => m.box.top));
  const bottom = Math.max(...members.map((m) => m.box.bottom));
  for (const { index, box } of members) {
    into.set(index, {
      origin: `${(left + right) / 2 - box.left}px ${(top + bottom) / 2 - box.top}px`,
      group,
    });
  }
}

/**
 * Blend: every run of changed glyphs, a whole word or the changed middle
 * of one (`Copy` → `Copied` changes `ied`), scales about its own centre,
 * as one unit. Runs end at a survivor or a space. Pivots only; none is a
 * group.
 */
export function planRuns({
  count,
  isSpace,
  changed,
  boxOf,
}: {
  count: number;
  isSpace: (i: number) => boolean;
  changed: (i: number) => boolean;
  boxOf: (i: number) => Box | undefined;
}): Map<number, Shape> {
  const shapes = new Map<number, Shape>();
  addRuns(shapeRuns(count, isSpace, changed, false, 1), boxOf, false, shapes);
  return shapes;
}

/**
 * The shapes the changed glyphs of one side of a change (the arriving ones,
 * or the leaving ones) scale as, by index. By words (a value of several
 * words): whole words of letters, as words, and runs of GROUP_MIN or more
 * changed digits, as groups. Otherwise (one word): runs of GROUP_MIN or more
 * changed glyphs, digits included, as groups, since morph splits numbers
 * glyph by glyph either way (`$12,345,678` → `$99` shrinks its old digits in
 * place rather than sending them after the `$`).
 */
export function planShapes({
  count,
  isSpace,
  changed,
  kinds,
  byWords,
  boxOf,
}: {
  count: number;
  isSpace: (i: number) => boolean;
  changed: (i: number) => boolean;
  kinds: GlyphKind[];
  byWords: boolean;
  boxOf: (i: number) => Box | undefined;
}): Map<number, Shape> {
  const shapes = new Map<number, Shape>();
  const add = (runs: number[][], group: boolean): void =>
    addRuns(runs, boxOf, group, shapes);
  if (!byWords) {
    add(shapeRuns(count, isSpace, changed, false), true);
    return shapes;
  }
  const of =
    (kind: GlyphKind) =>
    (i: number): boolean =>
      changed(i) && kinds[i] === kind;
  add(shapeRuns(count, isSpace, of("text"), true), false);
  add(shapeRuns(count, isSpace, of("number"), false), true);
  return shapes;
}
