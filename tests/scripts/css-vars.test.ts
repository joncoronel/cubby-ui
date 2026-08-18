import { describe, it, expect } from "vitest";
import { extractCssVars, stripCssComments } from "@/scripts/lib/css-vars";

describe("extractCssVars", () => {
  it("reads plain declarations", () => {
    expect(extractCssVars("--a: 1px; --b: red;")).toEqual({
      a: "1px",
      b: "red",
    });
  });

  it("keeps multi-line and comma-separated values", () => {
    const body = `
      --surface-shadow-combined-1:
        var(--surface-shadow-1), var(--surface-rim-1);
    `;
    expect(extractCssVars(body)["surface-shadow-combined-1"]).toBe(
      "var(--surface-shadow-1), var(--surface-rim-1)",
    );
  });

  // The regression this guards: prose inside a comment that reads like a
  // declaration used to mint a token AND swallow the real one after it,
  // shipping a corrupted `--border` to installers.
  it("ignores declarations that appear inside comments", () => {
    const body = `
      /* Re-declared in .dark for the same reason as --border: a custom
         property resolves its var()s where it is DECLARED. */
      --border: color-mix(in oklab, var(--foreground) 10%, transparent);
      --surface-shadow-combined-1: var(--surface-shadow-1);
    `;
    const vars = extractCssVars(body);
    expect(vars.border).toBe(
      "color-mix(in oklab, var(--foreground) 10%, transparent)",
    );
    expect(vars["surface-shadow-combined-1"]).toBe("var(--surface-shadow-1)");
  });

  it("ignores a trailing comment on the same line", () => {
    const vars = extractCssVars("--a: 1px; /* --b: 2px; */");
    expect(vars).toEqual({ a: "1px" });
  });

  it("returns nothing for a comment-only body", () => {
    expect(extractCssVars("/* --a: 1px; */")).toEqual({});
  });
});

describe("stripCssComments", () => {
  it("removes block comments and leaves the rest intact", () => {
    expect(stripCssComments("a /* x */ b")).toBe("a  b");
  });

  it("removes multiple and multi-line comments", () => {
    expect(stripCssComments("a /* x\ny */ b /* z */ c")).toBe("a  b  c");
  });
});
