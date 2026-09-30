/**
 * What happens at the edges of a label that resizes: arriving text hidden
 * past an edge it holds still, and the edge fade on leaving text. Pure
 * arithmetic on boxes; the engine measures them.
 */

/** A horizontal span on screen, or in the ghost layer's coordinates. */
export type Span = { left: number; right: number };

/**
 * The clip for arriving text carried in from past the edge a reader sees
 * around the value (`bounds`, a pinned button's): it stays hidden past that
 * edge while the change plays. Only on an edge the label holds still (the
 * one it's pinned by, the same `before` and `after`), so the clip holds still
 * with it. Null when nothing arrives from past a held edge.
 */
export function arrivalClip(
  arriving: Span[],
  bounds: Span,
  before: Span,
  after: Span,
): string | null {
  const pastStart = arriving.some((span) => span.left < bounds.left - 0.5);
  const pastEnd = arriving.some((span) => span.right > bounds.right + 0.5);
  const clipLeft = pastStart && Math.abs(before.left - after.left) < 0.5;
  const clipRight = pastEnd && Math.abs(before.right - after.right) < 0.5;
  if (!clipLeft && !clipRight) return null;
  const right = clipRight ? `${after.right - bounds.right}px` : "-100vw";
  const left = clipLeft ? `${bounds.left - after.left}px` : "-100vw";
  return `inset(-100vh ${right} -100vh ${left})`;
}

/**
 * How an edge of the ghost layer fades: not at all, following the box's
 * edge (a neighbour moves with it), or held at the container's edge (its
 * position, layer coordinates).
 */
export type Arm = false | "box" | number;

/**
 * The fade's opaque band for a box spanning start..end, in layer
 * coordinates: an edge following the box ends `slack` past it, a held one
 * stays put, and an unarmed one reaches the layer's side.
 */
export function edgeBand(
  start: number,
  end: number,
  arms: { start: Arm; end: Arm },
  layer: { left: number; width: number },
  slack: number,
): Span {
  const left =
    arms.start === false
      ? 0
      : typeof arms.start === "number"
        ? arms.start - layer.left
        : start - slack - layer.left;
  const right =
    arms.end === false
      ? layer.width
      : typeof arms.end === "number"
        ? arms.end - layer.left
        : end + slack - layer.left;
  return { left, right };
}

/**
 * An arm as the next change finds it: a held edge is kept as its place on
 * screen (`originX` is the layer's origin now), since layer coordinates move
 * between changes. Undefined for an edge that doesn't fade.
 */
export function armMark(arm: Arm, originX: number): string | undefined {
  if (arm === false) return undefined;
  return arm === "box" ? "box" : String(arm + originX);
}

/** An arm read back from its mark, in the layer's coordinates now. */
export function readArm(mark: string | undefined, originX: number): Arm {
  if (mark === undefined) return false;
  return mark === "box" ? "box" : parseFloat(mark) - originX;
}
