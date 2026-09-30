"use client";

import * as React from "react";
import type { TOCItemType } from "fumadocs-core/toc";
import { resetDocsPageState, setDocsPageState } from "./docs-page-store";

/** The header plus the frame's top edge cover the top of the viewport. */
const HEADER = 64;
/** A heading becomes active once it rises past this share of the viewport. */
const READING_LINE = 0.25;

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/**
 * Tracks the reader's place and publishes it to the docs page store: the
 * section from scroll position, measured once per frame, and whether the
 * title has scrolled away. An IntersectionObserver only reports headings as
 * they cross a threshold, so a fast scroll can skip past them and leave the
 * TOC a section behind; reading positions directly keeps it in step at any
 * speed.
 */
export function useTrackHeadings(toc: TOCItemType[]): void {
  React.useEffect(() => {
    setDocsPageState({ toc });
    return () => resetDocsPageState();
  }, [toc]);

  React.useEffect(() => {
    const ids = toc.map((item) => item.url.slice(1));
    let frame = 0;
    let lastVisible: string[] = [];

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
      // Keep the same array while the ids match, so readers of `visible`
      // only re-render when it really changes.
      if (!sameIds(lastVisible, visible)) lastVisible = visible;

      setDocsPageState({
        activeId: active === -1 ? null : ids[active],
        visible: lastVisible,
      });
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

  React.useEffect(() => {
    const title = document.getElementById("docs-title");
    if (!title) return;
    const observer = new IntersectionObserver(
      ([entry]) => setDocsPageState({ pastTitle: !entry.isIntersecting }),
      // The header and the frame's top edge cover the top ~64px.
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, []);
}
