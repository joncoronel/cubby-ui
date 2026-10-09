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
 * The pages and ellipses to render for `page` of `pageCount`. The length is
 * fixed for given counts (an ellipsis that would hide one page shows it), so
 * the row keeps its width as the page changes.
 */
export function getPaginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationRangeItem[] {
  // NaN (e.g. from Number(searchParams.get("page"))) means no pages or page 1.
  const count = Number.isFinite(pageCount)
    ? Math.max(0, Math.floor(pageCount))
    : 0;
  if (count === 0) return [];
  const current = Number.isFinite(page)
    ? Math.min(Math.max(1, Math.floor(page)), count)
    : 1;
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundaries = Math.max(0, Math.floor(boundaryCount));

  // Everything fits, ellipsis slots included.
  if (count <= boundaries * 2 + siblings * 2 + 3) return range(1, count);

  // From here the boundary runs can't overlap.
  const startPages = range(1, boundaries);
  const endPages = range(count - boundaries + 1, count);

  // Sibling window, pushed inward at the ends so the length stays fixed.
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
