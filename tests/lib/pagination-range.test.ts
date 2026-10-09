import { describe, expect, it } from "vitest";
import { getPaginationRange } from "@/registry/default/pagination/lib/range";

describe("getPaginationRange", () => {
  it("lists every page when they all fit", () => {
    expect(getPaginationRange({ page: 1, pageCount: 5 })).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(getPaginationRange({ page: 4, pageCount: 7 })).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("returns nothing for zero pages", () => {
    expect(getPaginationRange({ page: 1, pageCount: 0 })).toEqual([]);
  });

  it("collapses the far end near the start", () => {
    expect(getPaginationRange({ page: 1, pageCount: 20 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      "end-ellipsis",
      20,
    ]);
  });

  it("collapses the near end near the end", () => {
    expect(getPaginationRange({ page: 20, pageCount: 20 })).toEqual([
      1,
      "start-ellipsis",
      16,
      17,
      18,
      19,
      20,
    ]);
  });

  it("collapses both ends in the middle", () => {
    expect(getPaginationRange({ page: 10, pageCount: 20 })).toEqual([
      1,
      "start-ellipsis",
      9,
      10,
      11,
      "end-ellipsis",
      20,
    ]);
  });

  it("shows a single hidden page instead of an ellipsis", () => {
    // Page 2 would be the only page behind a start ellipsis.
    expect(getPaginationRange({ page: 4, pageCount: 20 })).toEqual([
      1,
      2,
      3,
      4,
      5,
      "end-ellipsis",
      20,
    ]);
  });

  it("keeps the same length at every page", () => {
    const lengths = new Set(
      Array.from(
        { length: 30 },
        (_, i) => getPaginationRange({ page: i + 1, pageCount: 30 }).length,
      ),
    );
    expect(lengths).toEqual(new Set([7]));
  });

  it("widens with siblingCount and boundaryCount", () => {
    expect(
      getPaginationRange({
        page: 50,
        pageCount: 100,
        siblingCount: 2,
        boundaryCount: 2,
      }),
    ).toEqual([
      1,
      2,
      "start-ellipsis",
      48,
      49,
      50,
      51,
      52,
      "end-ellipsis",
      99,
      100,
    ]);
  });

  it("supports no boundaries", () => {
    expect(
      getPaginationRange({ page: 10, pageCount: 20, boundaryCount: 0 }),
    ).toEqual(["start-ellipsis", 9, 10, 11, "end-ellipsis"]);
  });

  it("clamps an out-of-range page", () => {
    expect(getPaginationRange({ page: 99, pageCount: 10 })).toEqual(
      getPaginationRange({ page: 10, pageCount: 10 }),
    );
    expect(getPaginationRange({ page: -3, pageCount: 10 })).toEqual(
      getPaginationRange({ page: 1, pageCount: 10 }),
    );
  });

  it("treats a non-finite page as page 1", () => {
    expect(getPaginationRange({ page: NaN, pageCount: 20 })).toEqual(
      getPaginationRange({ page: 1, pageCount: 20 }),
    );
    expect(getPaginationRange({ page: Infinity, pageCount: 20 })).toEqual(
      getPaginationRange({ page: 1, pageCount: 20 }),
    );
  });

  it("returns nothing for a non-finite page count", () => {
    expect(getPaginationRange({ page: 1, pageCount: NaN })).toEqual([]);
  });

  it("includes the current page", () => {
    for (let page = 1; page <= 25; page++) {
      expect(getPaginationRange({ page, pageCount: 25 })).toContain(page);
    }
  });
});
