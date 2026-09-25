"use client";

import * as React from "react";
import { TextMorph } from "torph/react";
import { cn } from "@/lib/utils";

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
 * Text that morphs letter by letter when it changes: the site's one way of
 * animating a label swap. torph's own defaults (400ms on the expo curve, which
 * is also our --ease-out-expo) and it steps straight to the new text under
 * reduced motion.
 *
 * `feedback` is for labels that change because the reader clicked (Copied,
 * Hide code): those answer the click, so they run at 250ms instead of 400.
 *
 * `truncate` clips long labels on a wrapper, never on torph's root: torph
 * animates the root's width from the old text to the new one, so an ellipsis
 * there flashes "…" while a longer label grows in. The wrapper only fades its
 * edge when the settled text really doesn't fit, checked after each morph.
 */
export function MorphText({
  children,
  className,
  truncate = false,
  feedback = false,
}: {
  children: string;
  className?: string;
  truncate?: boolean;
  feedback?: boolean;
}) {
  const clipRef = React.useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);

  const measure = React.useCallback(() => {
    const el = clipRef.current;
    if (el) setOverflowing(el.scrollWidth > el.clientWidth + 1);
  }, []);

  React.useEffect(() => {
    const el = clipRef.current;
    if (!truncate || !el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [truncate, measure]);

  const morph = (
    <TextMorph
      {...(feedback ? { duration: 250 } : null)}
      className={truncate ? undefined : className}
      onAnimationComplete={truncate ? measure : undefined}
    >
      {children}
    </TextMorph>
  );

  if (!truncate) return morph;

  return (
    <span
      ref={clipRef}
      data-overflowing={overflowing ? "" : undefined}
      className={cn("docs-morph-clip", className)}
    >
      {morph}
    </span>
  );
}
