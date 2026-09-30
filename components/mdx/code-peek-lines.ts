import type { ReactElement } from "react";
import type { BundledLanguage } from "shiki/langs";
import { highlight } from "@/registry/default/code-block/lib/shiki-shared";

/** Code this long or shorter shows in full; longer code opens as a peek. */
export const PEEK_LINES = 6;

/**
 * The first lines of long code, highlighted on their own for a closed peek
 * to show. Rendering only these (not the whole file, hidden) keeps a page of
 * peeks light: combobox's held 2,500 hidden lines, and building them made
 * every page switch stall. A grammar reads from the top, so the first lines
 * highlight the same alone as in the full file.
 */
export async function highlightPeek(
  code: string,
  language: BundledLanguage,
): Promise<ReactElement | undefined> {
  const lines = code.trimEnd().split("\n");
  if (lines.length <= PEEK_LINES) return undefined;
  return highlight(lines.slice(0, PEEK_LINES).join("\n"), language);
}
