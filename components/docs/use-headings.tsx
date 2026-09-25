"use client";

import * as React from "react";
import type { TOCItemType } from "fumadocs-core/toc";

type HeadingsState = {
  /** Id of the section being read, or null above the first heading. */
  active: string | null;
  /** Ids of every section that overlaps the viewport. */
  visible: string[];
};

const EMPTY: HeadingsState = { active: null, visible: [] };
const HeadingsContext = React.createContext<HeadingsState>(EMPTY);

/** The sticky header covers the top of the viewport. */
const HEADER = 56;
/** A heading becomes active once it rises past this share of the viewport. */
const READING_LINE = 0.25;

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/**
 * Tracks the reader's section from scroll position, measured once per frame.
 * An IntersectionObserver only reports headings as they cross a threshold,
 * so a fast scroll can skip past them and leave the TOC a section behind;
 * reading positions directly keeps it in step at any speed.
 */
export function HeadingsProvider({
  toc,
  children,
}: {
  toc: TOCItemType[];
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<HeadingsState>(EMPTY);

  React.useEffect(() => {
    const ids = toc.map((item) => item.url.slice(1));
    let frame = 0;

    const compute = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const line = HEADER + (viewport - HEADER) * READING_LINE;
      const tops = ids.map(
        (id) => document.getElementById(id)?.getBoundingClientRect().top,
      );

      let active = -1;
      tops.forEach((top, i) => {
        if (top !== undefined && top <= line) active = i;
      });

      // At the very bottom, short final sections can never reach the line:
      // hand the TOC to the last heading on screen.
      const scroller = document.documentElement;
      if (window.scrollY + viewport >= scroller.scrollHeight - 2) {
        tops.forEach((top, i) => {
          if (top !== undefined && top < viewport) active = i;
        });
      }

      const visible: string[] = [];
      tops.forEach((top, i) => {
        if (top === undefined) return;
        const next = tops.slice(i + 1).find((t) => t !== undefined);
        const bottom = next ?? Number.POSITIVE_INFINITY;
        if (bottom > HEADER && top < viewport) visible.push(ids[i]);
      });

      const nextActive = active === -1 ? null : ids[active];
      setState((prev) =>
        prev.active === nextActive && sameIds(prev.visible, visible)
          ? prev
          : { active: nextActive, visible },
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Content can change height without a scroll (opening code, images).
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [toc]);

  return (
    <HeadingsContext.Provider value={state}>{children}</HeadingsContext.Provider>
  );
}

export function useActiveHeading(): string | null {
  return React.useContext(HeadingsContext).active;
}

export function useVisibleHeadings(): string[] {
  return React.useContext(HeadingsContext).visible;
}
