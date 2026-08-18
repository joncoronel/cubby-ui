import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import {
  SURFACE_LEVELS,
  elevatedSurface,
  flushSurface,
  solidSurface,
  surfaceClasses,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";

const LEVELS = SURFACE_LEVELS;

/**
 * These assert the two properties the shadow class form exists to guarantee.
 * Both are invisible at the type level, so nothing else catches a regression
 * here: not `tsc`, not eslint, and not a visual diff in the default theme.
 */
describe("surface shadow classes", () => {
  describe("stay overridable through cn()", () => {
    // tailwind-merge only groups `shadow-(--var)` as `shadow`. A theme-key name
    // or a square-bracket arbitrary value lands in `shadow-color` instead, so
    // both classes survive the merge and stylesheet order picks the winner.
    it.each(LEVELS)("elevatedSurface(%i) drops its shadow", (level) => {
      const merged = cn(elevatedSurface(level, level), "shadow-none");
      expect(merged).toContain("shadow-none");
      expect(merged).not.toMatch(/(?<!after:)shadow-\(--surface-shadow-/);
    });

    it.each(LEVELS)("solidSurface(%i) drops its shadow", (level) => {
      const merged = cn(solidSurface(level, level), "shadow-none");
      expect(merged).toContain("shadow-none");
      expect(merged).not.toContain("shadow-(--surface-shadow-combined-");
    });

    it.each(LEVELS)("surfaceClasses(%i) drops its shadow", (level) => {
      const merged = cn(surfaceClasses(level, level), "shadow-none");
      expect(merged).toContain("shadow-none");
      expect(merged).not.toContain("shadow-(--surface-shadow-");
    });

    it.each(LEVELS)("elevatedSurface(%i) rim drops separately", (level) => {
      const merged = cn(elevatedSurface(level, level), "after:shadow-none");
      expect(merged).toContain("after:shadow-none");
      expect(merged).not.toContain("after:shadow-(--surface-rim-");
    });

    it("keeps the drop shadow when only the rim is cleared", () => {
      const merged = cn(elevatedSurface(5, 5), "after:shadow-none");
      expect(merged).toContain("shadow-(--surface-shadow-5)");
    });
  });

  describe("point at dark-aware source tokens", () => {
    // `--surface-*` tokens are re-declared under `.dark`, so they resolve per
    // element. A `@theme` alias is declared once on `:root`, which would make a
    // `.dark` scoped to a subtree inherit the light value.
    const shadowClass = /shadow-\((--[a-z-]+-\d)\)/g;

    it.each(LEVELS)("every level-based helper at level %i", (level) => {
      const classes = [
        surfaceClasses(level, level),
        elevatedSurface(level, level),
        solidSurface(level, level),
      ].join(" ");

      const vars = [...classes.matchAll(shadowClass)].map((m) => m[1]);
      expect(vars.length).toBeGreaterThan(0);
      for (const v of vars) {
        expect(v).toMatch(/^--surface-/);
      }
    });

    // `flushSurface` and the edge rims are deliberately not covered: their
    // shadows are per-edge multi-layer literals with no single token, so they
    // still use the arbitrary form and are not mergeable.
    it("flushSurface is a documented exception", () => {
      expect(flushSurface(5, "top")).not.toMatch(shadowClass);
    });
  });
});

describe("SURFACE_LEVELS", () => {
  it("covers every level the SurfaceLevel type allows", () => {
    expect(LEVELS).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    // Compile-time guard: widening SurfaceLevel without extending the tuple
    // makes this assignment fail.
    const _exhaustive: SurfaceLevel[] = [...LEVELS];
    expect(_exhaustive).toHaveLength(8);
  });
});
