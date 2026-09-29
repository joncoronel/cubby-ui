/**
 * How the stage rides against a label easing its space, so the glyphs hold
 * the places they were measured at. `from` is how much space the label
 * starts with beyond its final size; `measured` is how far its glyphs (or
 * the label) moved when it took that space.
 */

/**
 * An inline label's move that is just its own start margin (all of it
 * pinned at the start or end, half of it centred), as the margin's exact
 * value. The measured one is rounded to layout units (1/64px), and the two
 * easing from values that far apart round apart frame to frame, flickering
 * the glyphs a device pixel side to side.
 */
export function ownShift(from: number, measured: number): number | undefined {
  return [from, -from, from / 2, -from / 2].find(
    (x) => Math.abs(x - measured) < 0.05,
  );
}

/**
 * The share of its width a box's glyphs move by as it resizes (all of the
 * change pinned at the end, half centred), for a ride in CSS: layout rounds
 * the ride and the width it follows from the same number each frame, where
 * a ride animated beside the width rounded on its own and stepped the
 * glyphs back and forth.
 */
export function followShare(
  from: number,
  measured: number,
): number | undefined {
  const share = -measured / from;
  return [-1, -0.5, 0.5, 1].find((f) => Math.abs(f - share) < 0.01);
}
