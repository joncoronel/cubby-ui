"use client";

import * as React from "react";
import type { TOCItemType } from "fumadocs-core/toc";

/**
 * The reader's place on the page, in one store: the page's tracker writes
 * it; the header's section crumb, the minimap and the phone TOC each read
 * just the fields they draw, so a change to one doesn't re-render the rest.
 */
export type DocsPageState = {
  toc: TOCItemType[];
  /** Hash-less id of the heading the reader is in, if any. */
  activeId: string | null;
  /** Hash-less ids of every section that overlaps the viewport. */
  visible: string[];
  /** True once the page title has scrolled under the header. */
  pastTitle: boolean;
};

const INITIAL: DocsPageState = {
  toc: [],
  activeId: null,
  visible: [],
  pastTitle: false,
};

let state = INITIAL;
const listeners = new Set<() => void>();

export function setDocsPageState(next: Partial<DocsPageState>): void {
  const changed = (Object.keys(next) as (keyof DocsPageState)[]).some(
    (key) => next[key] !== state[key],
  );
  if (!changed) return;
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

export function resetDocsPageState(): void {
  setDocsPageState(INITIAL);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** One field of the page state; re-renders only when that field changes. */
export function useDocsPage<K extends keyof DocsPageState>(
  key: K,
): DocsPageState[K] {
  return React.useSyncExternalStore(
    subscribe,
    () => state[key],
    () => INITIAL[key],
  );
}
