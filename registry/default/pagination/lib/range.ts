export type PaginationRangeItem = number | "start-ellipsis" | "end-ellipsis";

export type PaginationRangeOptions = {
  /** The current page, 1-based. Clamped to `1..pageCount`. */
  page: number;
  /** How many pages there are. */
  pageCount: number;
  /** Pages shown on each side of the current one. Defaults to 1. */
  siblingCount?: number;
  /** Pages always shown at the start and the end. Defaults to 1. */
  boundaryCount?: number;
};

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return length > 0 ? Array.from({ length }, (_, i) => start + i) : [];
}

/**
 * The pages and ellipses to render for `page` of `pageCount`.
 *
 * The result always has the same length for a given pageCount, siblingCount,
 * and boundaryCount (once there are enough pages to need an ellipsis): an
 * ellipsis that would hide a single page shows that page instead. So the row
 * keeps its width as the current page moves, and the current-page indicator
 * glides instead of the links shuffling under it.
 */
export function getPaginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  if (count === 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundaries = Math.max(0, Math.floor(boundaryCount));

  // Everything fits: boundaries, siblings, the current page, and the two
  // slots the ellipses would take.
  if (count <= boundaries * 2 + siblings * 2 + 3) return range(1, count);

  const startPages = range(1, Math.min(boundaries, count));
  const endPages = range(
    Math.max(count - boundaries + 1, boundaries + 1),
    count,
  );

  // The sibling window, pushed inward at either end so the total stays fixed.
  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    siblingsStart > boundaries + 2 ? "start-ellipsis" : boundaries + 1,
    ...range(siblingsStart, siblingsEnd),
    siblingsEnd < count - boundaries - 1 ? "end-ellipsis" : count - boundaries,
    ...endPages,
  ];
}
