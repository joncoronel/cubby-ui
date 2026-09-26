"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import {
  DEFAULT_OPTIONS,
  faster,
  type TextMorphOptions,
} from "@/registry/default/text-morph/lib/options";

/** Labels that answer a click (Copied, Hide code) move in 209ms. */
const FEEDBACK_MS = 209;
export function feedbackOf(o: TextMorphOptions): TextMorphOptions {
  return faster(o, FEEDBACK_MS / o.motion.duration);
}
const FEEDBACK_OPTIONS = feedbackOf(DEFAULT_OPTIONS);

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
 * animating a label swap, on the registry `TextMorph` (registry/default/text-morph).
 * Defaults live in `text-morph/options.ts`, which the /tune/text-morph page
 * reads too.
 *
 * `feedback` is for labels that change because the reader clicked (Copied,
 * Hide code): the same look, moving in 209ms.
 *
 * `truncate` is for labels that can outgrow their space (the header crumb,
 * the mobile pill): it clips, and fades the right edge only while the
 * settled text doesn't fit.
 */
export function MorphText({
  children,
  className,
  truncate = false,
  feedback = false,
  disabled = false,
}: {
  children: string;
  className?: string;
  truncate?: boolean;
  feedback?: boolean;
  /** Swap without animating (a change the reader didn't cause). */
  disabled?: boolean;
}) {
  const clipRef = React.useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);
  const options = feedback ? FEEDBACK_OPTIONS : DEFAULT_OPTIONS;

  // Check the fit once the label has settled at its new width.
  React.useEffect(() => {
    const clip = clipRef.current;
    if (!truncate || !clip) return;
    const check = () => {
      // The glyphs' layout width: leaving glyphs and transforms (which
      // scrollWidth counts) don't take up space in the settled text.
      const glyphs = clip.querySelector<HTMLElement>(".text-morph-glyphs");
      if (glyphs) setOverflowing(glyphs.offsetWidth > clip.clientWidth + 1);
    };
    const timer = window.setTimeout(check, options.width.duration + 80);
    const observer = new ResizeObserver(check);
    observer.observe(clip);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [truncate, children, options.width.duration]);

  const text = (
    <TextMorph
      value={children}
      options={options}
      disabled={disabled}
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
