/**
 * Helpers for scanning CSS custom properties out of `registry/theme.css`.
 *
 * Extracted from `registry-sync.ts` so they can be tested: that script runs
 * `syncRegistry()` at import time, so a test cannot import it directly.
 */

/** Matches a single `--name: value;` declaration. */
export const CSS_VAR_RE = /--([a-z0-9-]+):\s*([^;]+);/g;

/**
 * Strip comments BEFORE scanning for variables, rather than filtering matches
 * afterwards. `CSS_VAR_RE` has no idea it is inside a comment, so prose that
 * happens to read like `--name: value` mints a token and swallows the real
 * declaration that follows it. That shipped a corrupted `--border` once.
 */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Every `--name: value` declaration in a block body, comments ignored. */
export function extractCssVars(blockBody: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const match of stripCssComments(blockBody).matchAll(CSS_VAR_RE)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
}
