"use client";

import * as React from "react";
import Scritto from "@scritto/react";
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

// Scritto 0.1.0 doesn't read the server-rendered text inside <scritto-text>
// when the element upgrades, and its shadow root has no slot, so from the
// upgrade until React hydrates the label (and calls update) the text was
// blank. Seed each existing element with its own text the moment the
// element is defined: this runs in a microtask right after the upgrade,
// before the next paint. Setting `value` is Scritto's instant (no-roll)
// setter, and React's later update() with the same value is a no-op.
if (typeof window !== "undefined") {
  void customElements.whenDefined("scritto-text").then(() => {
    for (const el of document.querySelectorAll("scritto-text")) {
      const text = el.textContent;
      if (text && !el.value) el.value = text;
    }
  });
}

/** Ambient labels (they change as you scroll or navigate). */
const TRANSITION = { duration: 400 };
/** Labels that answer a click settle faster. */
const FEEDBACK_TRANSITION = { duration: 209 };

/**
 * Text that rolls glyph by glyph when it changes, the site's one way of
 * animating a label swap. Built on Scritto: it doesn't animate on mount,
 * animates every change after on its own spring (400ms here), and steps
 * straight to the new text under reduced motion. `@scritto/core/ssr.css`
 * (imported in globals.css) keeps the width identical through the upgrade.
 *
 * `feedback` is for labels that change because the reader clicked (Copied,
 * Hide code): those answer the click, so they run at 209ms.
 *
 * `truncate` is for labels that change as you scroll or navigate: the
 * wrapper animates its own width (see below), clips, and fades the right
 * edge only when the settled text doesn't fit. An ellipsis on the animating
 * element would flash mid-roll as its width eases between old and new text.
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
  const sizerRef = React.useRef<HTMLSpanElement>(null);
  const [width, setWidth] = React.useState<number | null>(null);
  const [overflowing, setOverflowing] = React.useState(false);
  const transition = feedback ? FEEDBACK_TRANSITION : TRANSITION;

  // Scroll-driven labels (`truncate`) can change again before a roll ends.
  // Scritto doesn't retarget the box-width and glyph-offset animations of a
  // roll in flight, so after a fast scroll the final label sat shifted by a
  // stale amount and then slid into place. A change that lands mid-roll
  // therefore starts on a fresh element: it mounts showing the previous
  // label (settled), then rolls to the new one a frame later. Spaced-out
  // changes keep the same element.
  const [prev, setPrev] = React.useState(children);
  const [shown, setShown] = React.useState(children);
  const [generation, setGeneration] = React.useState(0);
  const [rolling, setRolling] = React.useState(false);
  if (children !== prev) {
    setPrev(children);
    if (truncate && rolling) {
      setGeneration((g) => g + 1);
      setShown(prev);
    } else {
      setShown(children);
    }
    setRolling(true);
  }
  React.useEffect(() => {
    if (shown === children) return;
    const frame = requestAnimationFrame(() => setShown(children));
    return () => cancelAnimationFrame(frame);
  }, [generation, shown, children]);
  React.useEffect(() => {
    if (!rolling) return;
    const timer = window.setTimeout(
      () => setRolling(false),
      transition.duration,
    );
    return () => window.clearTimeout(timer);
  }, [rolling, prev, transition.duration]);

  // Truncating labels are the ones that change rapidly (scroll-driven), and
  // they size themselves rather than trusting Scritto's box: Scritto keeps a
  // width animation that's already running instead of retargeting it, so on
  // a fast scroll the box eased toward a stale width behind the text. A
  // hidden copy of the text measures the new natural width, and the wrapper
  // transitions to it in CSS, which always retargets from where it is.
  React.useEffect(() => {
    const sizer = sizerRef.current;
    if (!truncate || !sizer) return;
    const observer = new ResizeObserver(() =>
      setWidth(sizer.getBoundingClientRect().width),
    );
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [truncate]);

  // Re-check the fit once a roll has settled: does the settled text fit the
  // room the wrapper actually gets?
  React.useEffect(() => {
    const el = clipRef.current;
    const sizer = sizerRef.current;
    if (!truncate || !el || !sizer) return;
    const timer = window.setTimeout(
      () =>
        setOverflowing(
          sizer.getBoundingClientRect().width > el.clientWidth + 1,
        ),
      transition.duration + 120,
    );
    return () => window.clearTimeout(timer);
  }, [truncate, children, width, transition.duration]);

  const text = (
    <Scritto
      key={generation}
      value={shown}
      transition={transition}
      className={truncate ? undefined : className}
    />
  );

  if (!truncate) return text;

  return (
    <span
      ref={clipRef}
      data-overflowing={overflowing ? "" : undefined}
      className={cn("docs-morph-clip", className)}
      style={
        width === null
          ? undefined
          : ({
              width,
              "--morph-duration": `${transition.duration}ms`,
            } as React.CSSProperties)
      }
    >
      <span ref={sizerRef} aria-hidden="true" className="docs-morph-sizer">
        {children}
      </span>
      {text}
    </span>
  );
}
