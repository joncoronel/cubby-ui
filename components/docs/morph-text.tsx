"use client";

import * as React from "react";
import { useTextMorph } from "torph/react";
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * torph, mounted on `from` and immediately updated to `to`, so the first
 * change still morphs. torph owns this element's children from here on,
 * which is why they're set once through innerHTML rather than by React.
 */
function LiveMorph({
  from,
  to,
  className,
  duration,
  onAnimationComplete,
}: {
  from: string;
  to: string;
  className?: string;
  duration?: number;
  onAnimationComplete?: () => void;
}) {
  const { ref, update } = useTextMorph({
    ...(duration ? { duration } : null),
    onAnimationComplete,
  });
  // Set once: after mount torph owns the children.
  const [initialHtml] = React.useState(() => ({ __html: escapeHtml(from) }));
  const started = React.useRef(false);
  const settled = React.useRef(false);

  React.useEffect(() => {
    // First, settle torph on the old text; morph to the new one a frame
    // later (both in the same tick skips the transition). The frame is
    // rescheduled if an effect re-run cancels it before it fires.
    if (!started.current) {
      started.current = true;
      update(from);
    }
    if (settled.current) {
      update(to);
      return;
    }
    const frame = requestAnimationFrame(() => {
      settled.current = true;
      update(to);
    });
    return () => cancelAnimationFrame(frame);
  }, [from, to, update]);

  return (
    <span
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={className}
      dangerouslySetInnerHTML={initialHtml}
    />
  );
}

/**
 * Text that morphs letter by letter when it changes: the site's one way of
 * animating a label swap, on torph's defaults (400ms on the expo curve, which
 * is also our --ease-out-expo), stepping straight to the new text under
 * reduced motion.
 *
 * torph is mounted lazily. On first render (and so during hydration) this is
 * plain text; torph only attaches the first time the text changes. Attaching
 * splits the label into one span per letter and measures each of them, and
 * with a dozen labels on a page doing that at load forced dozens of
 * whole-page style recalculations while the page hydrated.
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

  // The text torph starts from, set the first time the label changes.
  const [from, setFrom] = React.useState<string | null>(null);
  const [prev, setPrev] = React.useState(children);
  if (children !== prev) {
    setPrev(children);
    if (from === null) setFrom(prev);
  }

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

  const textClassName = truncate ? undefined : className;
  const text =
    from === null ? (
      <span className={textClassName}>{children}</span>
    ) : (
      <LiveMorph
        from={from}
        to={children}
        className={textClassName}
        duration={feedback ? 250 : undefined}
        onAnimationComplete={truncate ? measure : undefined}
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
