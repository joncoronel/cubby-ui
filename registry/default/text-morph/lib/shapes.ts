import type { GlyphKind } from "./match";

/**
 * Morph mode, one-word values (torph): a run of this many replaced glyphs,
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
  /** How far the shape's centre sits from the glyph's own, [x, y] in px. */
  toCentre: [number, number];
};

/** Where a glyph sits: any rect (a DOMRect will do). */
export type Box = { left: number; right: number; top: number; bottom: number };

/**
 * The runs of changed glyphs (arriving, or leaving) to shape: whole words,
 * a word being a run between spaces with every glyph changed, or runs of at
 * least GROUP_MIN changed glyphs between survivors.
 */
export function shapeRuns(
  count: number,
  isSpace: (i: number) => boolean,
  changed: (i: number) => boolean,
  byWords: boolean,
): number[][] {
  const runs: number[][] = [];
  let run: number[] = [];
  let whole = true;
  const flush = (): void => {
    if (byWords ? whole && run.length > 0 : run.length >= GROUP_MIN) {
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
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  for (const { index, box } of members) {
    into.set(index, {
      origin: `${cx - box.left}px ${cy - box.top}px`,
      group,
      toCentre: [
        cx - (box.left + box.right) / 2,
        cy - (box.top + box.bottom) / 2,
      ],
    });
  }
}

/**
 * Settle: every run of changed glyphs, a whole word or the changed middle
 * of one (`Copy` → `Copied` changes `ied`), gathers about its own centre.
 * Runs end at a survivor or a space. Pivots only; none is a group.
 */
export function planGathers({
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
  let run: { index: number; box: Box }[] = [];
  const flush = (): void => {
    if (run.length > 0) origins(run, false, shapes);
    run = [];
  };
  for (let i = 0; i < count; i++) {
    const box = !isSpace(i) && changed(i) ? boxOf(i) : undefined;
    if (box) run.push({ index: i, box });
    else flush();
  }
  flush();
  return shapes;
}

/**
 * The shapes the changed glyphs of one side of a change (the arriving ones,
 * or the leaving ones) scale as, by index. By words (a value of several
 * words): whole words of letters, as words, and runs of GROUP_MIN or more
 * changed digits, as groups. Otherwise (one word): runs of GROUP_MIN or more
 * changed glyphs, digits included, as groups, since torph splits numbers
 * glyph by glyph either way (`$12,345,678` → `$99` shrinks its old digits in
 * place rather than sending them after the `$`). A glyph without a box is
 * left out of its run.
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
  const add = (runs: number[][], group: boolean): void => {
    for (const run of runs) {
      const members = run.flatMap((index) => {
        const box = boxOf(index);
        return box ? [{ index, box }] : [];
      });
      if (members.length > 0) origins(members, group, shapes);
    }
  };
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
