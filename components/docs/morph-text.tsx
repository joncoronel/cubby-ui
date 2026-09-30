"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  TextMorph,
  type TextMorphSplit,
} from "@/registry/default/text-morph/text-morph";

/** Labels that answer a click (Copied, Hide code) move in 209ms. */
export const FEEDBACK_MS = 209;

/** Flattens a heading's React title (which may hold inline code) to text. */
export function toPlainText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toPlainText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return toPlainText(node.props.children);
  }
  return "";
}

/**
 * A label that animates when its text changes: the site's one way of
 * animating a label swap, on the registry `TextMorph` (registry/default/text-morph),
 * in its default mode.
 *
 * `feedback` is for labels that change because the reader clicked (Copied,
 * Hide code): the same look, moving in 209ms.
 *
 * `truncate` is for labels that can outgrow their space (the header crumb,
 * the mobile pill): it clips, and fades the right edge only while the
 * settled text doesn't fit.
 *
 * `split="word"` is for names (page and section titles): each word is one
 * kerned box, where letters split one per box read loosely spaced.
 */
export function MorphText({
  children,
  className,
  truncate = false,
  feedback = false,
  disableAnimation = false,
  split,
}: {
  children: string;
  className?: string;
  truncate?: boolean;
  feedback?: boolean;
  /** Swap without animating (a change the reader didn't cause). */
  disableAnimation?: boolean;
  split?: TextMorphSplit;
}) {
  const clipRef = React.useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);

  // Whether the settled text fits: the glyphs' layout width, since leaving
  // glyphs and transforms (which scrollWidth counts) take no space in it.
  // Not mid-change: the box is still easing to its new width, so the text
  // read as overflowing, and the clip and edge fade cut in (wiping a longer
  // label in, dimming its last letter) until it settled.
  const checkFit = React.useCallback((): void => {
    const clip = clipRef.current;
    const label = clip?.querySelector("[data-slot=text-morph]");
    if (label?.hasAttribute("data-animating")) return;
    const glyphs = clip?.querySelector<HTMLElement>(".text-morph-glyphs");
    if (clip && glyphs) {
      setOverflowing(glyphs.offsetWidth > clip.clientWidth + 1);
    }
  }, []);

  // Checked when the space it has changes, and when a change settles.
  React.useEffect(() => {
    const clip = clipRef.current;
    if (!truncate || !clip) return;
    const observer = new ResizeObserver(checkFit);
    observer.observe(clip);
    return () => observer.disconnect();
  }, [truncate, checkFit]);

  const text = (
    <TextMorph
      value={children}
      duration={feedback ? FEEDBACK_MS : undefined}
      disableAnimation={disableAnimation}
      split={split}
      onMorphComplete={truncate ? checkFit : undefined}
      className={truncate ? undefined : className}
    />
  );

  if (!truncate) return text;

  return (
    <span
      ref={clipRef}
      data-overflowing={overflowing ? "" : undefined}
      className={cn("docs-morph-clip", className)}
    >
      {text}
    </span>
  );
}
