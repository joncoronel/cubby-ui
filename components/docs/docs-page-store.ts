"use client";

import * as React from "react";
import type { TOCItemType } from "fumadocs-core/toc";

/**
 * Bridges the page (which owns the TOC and scroll position) and the header
 * (which lives in the layout and never remounts). The page publishes; the
 * header's section crumb subscribes.
 */
export type DocsPageState = {
  toc: TOCItemType[];
  /** Hash-less id of the heading the reader is in, if any. */
  activeId: string | null;
  /** True once the page title has scrolled under the header. */
  pastTitle: boolean;
};

const INITIAL: DocsPageState = { toc: [], activeId: null, pastTitle: false };

let state = INITIAL;
const listeners = new Set<() => void>();

export function setDocsPageState(next: Partial<DocsPageState>): void {
  const merged = { ...state, ...next };
  if (
    merged.toc === state.toc &&
    merged.activeId === state.activeId &&
    merged.pastTitle === state.pastTitle
  ) {
    return;
  }
  state = merged;
  listeners.forEach((listener) => listener());
}

export function resetDocsPageState(): void {
  setDocsPageState(INITIAL);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDocsPageState(): DocsPageState {
  return React.useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}
