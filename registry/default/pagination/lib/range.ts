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
  // Non-finite input (NaN from Number(searchParams.get("page"))) falls back
  // to no pages, or to page 1.
  const count = Number.isFinite(pageCount)
    ? Math.max(0, Math.floor(pageCount))
    : 0;
  if (count === 0) return [];
  const current = Number.isFinite(page)
    ? Math.min(Math.max(1, Math.floor(page)), count)
    : 1;
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundaries = Math.max(0, Math.floor(boundaryCount));

  // Everything fits: boundaries, siblings, the current page, and the two
  // slots the ellipses would take.
  if (count <= boundaries * 2 + siblings * 2 + 3) return range(1, count);

  // From here count > 2 * boundaries + 2 * siblings + 3, so the boundary
  // runs never overlap and need no clamping.
  const startPages = range(1, boundaries);
  const endPages = range(count - boundaries + 1, count);

  // The sibling window, pushed inward at either end so the total stays fixed.
  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    count - boundaries - 1,
  );

  return [
    ...startPages,
    siblingsStart > boundaries + 2 ? "start-ellipsis" : boundaries + 1,
    ...range(siblingsStart, siblingsEnd),
    siblingsEnd < count - boundaries - 1 ? "end-ellipsis" : count - boundaries,
    ...endPages,
  ];
}
