import * as React from "react";

// Chips arrive and leave by opening and closing their own space in the flex
// row, so the neighbours slide instead of jumping. The space is a negative
// `margin-inline-end` equal to the element's width plus the row gap, eased to
// zero on the way in and out to it on the way out. It is real layout, so it
// wraps, retargets and stays correct with any number of siblings, with no
// measuring of the siblings themselves.

const ENTER_MS = 220;
const EXIT_MS = 150;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ANIMATION_ID = "filters-flow";

/** Marks the bar ready once its first render has painted. */
const READY_ATTR = "data-flow-ready";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The width the element takes in the row, its trailing gap included. */
function flowSpan(el: HTMLElement): number {
  const parent = el.parentElement;
  const gap = parent ? parseFloat(getComputedStyle(parent).columnGap) || 0 : 0;
  return el.offsetWidth + gap;
}

/** The element and the siblings after it that take part in the row. */
function trailingFlow(el: HTMLElement): HTMLElement[] {
  const nodes = [el];
  for (let node = el.nextElementSibling; node; node = node.nextElementSibling) {
    if (
      node instanceof HTMLElement &&
      !node.dataset.slot?.endsWith("-ghost") &&
      !["absolute", "fixed"].includes(getComputedStyle(node).position)
    ) {
      nodes.push(node);
    }
  }
  return nodes;
}

/**
 * Whether opening or closing `span` of space at `el` would move anything to
 * another row. Space eased across a wrap makes the neighbours hop between
 * lines mid-animation, so those changes fade in place instead. Measured by
 * applying the collapsed margin for one synchronous layout, then restoring.
 */
function crossesRows(el: HTMLElement, span: number): boolean {
  const nodes = trailingFlow(el);
  const rows = nodes.map((node) => node.offsetTop);
  const previous = el.style.marginInlineEnd;
  el.style.marginInlineEnd = `${-span}px`;
  const moved = nodes.some((node, index) => node.offsetTop !== rows[index]);
  el.style.marginInlineEnd = previous;
  return moved;
}

function startOrigin(el: HTMLElement): string {
  return getComputedStyle(el).direction === "rtl" ? "100% 50%" : "0% 50%";
}

function enterInFlow(el: HTMLElement): void {
  for (const animation of el.getAnimations()) {
    if (animation.id === ANIMATION_ID) animation.cancel();
  }
  if (prefersReducedMotion()) {
    const fade = el.animate({ opacity: [0, 1] }, { duration: 150 });
    fade.id = ANIMATION_ID;
    return;
  }
  const fullSpan = flowSpan(el);
  const span = crossesRows(el, fullSpan) ? 0 : fullSpan;
  const animation = el.animate(
    [
      {
        marginInlineEnd: `${-span}px`,
        opacity: 0,
        scale: 0.94,
        filter: "blur(3px)",
        transformOrigin: startOrigin(el),
      },
      {
        opacity: 0.7,
        filter: "blur(1px)",
        offset: 0.4,
      },
      {
        marginInlineEnd: "0px",
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transformOrigin: startOrigin(el),
      },
    ],
    { duration: ENTER_MS, easing: EASE },
  );
  animation.id = ANIMATION_ID;
}

/**
 * Leaves a non-interactive copy of `el` in its place and closes the space it
 * took. Runs while `el` is still in the document, just before React removes
 * it. The copy is dropped at once when `el` turns out to still be attached
 * (Strict Mode's rehearsal unmount) or the whole row went with it.
 */
function exitInFlow(el: HTMLElement): void {
  const parent = el.parentElement;
  if (!parent || prefersReducedMotion()) return;
  const span = flowSpan(el);
  const inFlow = !crossesRows(el, span);
  const origin = startOrigin(el);
  const { offsetLeft, offsetTop, offsetWidth } = el;
  const ghost = el.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  for (const node of ghost.querySelectorAll("[id]")) node.removeAttribute("id");
  // A distinct slot so nothing that looks up live chips finds the copy.
  ghost.setAttribute("data-slot", `${el.dataset.slot ?? "flow"}-ghost`);
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  ghost.style.pointerEvents = "none";
  if (!inFlow) {
    // Out of the row, over the spot it held, while the rows reflow at once.
    Object.assign(ghost.style, {
      position: "absolute",
      left: `${offsetLeft}px`,
      top: `${offsetTop}px`,
      width: `${offsetWidth}px`,
      margin: "0px",
    });
  }
  el.before(ghost);

  queueMicrotask(() => {
    if (el.isConnected || !parent.isConnected) {
      ghost.remove();
      return;
    }
    const animation = ghost.animate(
      [
        {
          marginInlineEnd: "0px",
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          transformOrigin: origin,
        },
        {
          marginInlineEnd: inFlow ? `${-span}px` : "0px",
          opacity: 0,
          scale: 0.96,
          filter: "blur(2px)",
          transformOrigin: origin,
        },
      ],
      { duration: EXIT_MS, easing: EASE, fill: "forwards" },
    );
    animation.onfinish = () => ghost.remove();
    animation.oncancel = () => ghost.remove();
  });
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Callback ref that animates the element into and out of its flex row. Only
 * elements that mount after the row's first paint animate in, so a bar that
 * renders with filters already set appears settled. `forwardedRef` is kept in
 * sync, so the element can still take a caller's ref.
 */
function useFlowPresence<T extends HTMLElement>(
  forwardedRef?: React.Ref<T>,
): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      assignRef(forwardedRef, node);
      if (!node) return;
      const row = node.closest(`[${READY_ATTR}]`);
      if (row) enterInFlow(node);
      return () => {
        assignRef(forwardedRef, null);
        exitInFlow(node);
      };
    },
    [forwardedRef],
  );
}

/**
 * Callback ref for the row itself: marks it ready after its first paint, so
 * children mounted from then on animate in.
 */
function useFlowRow<T extends HTMLElement>(
  forwardedRef?: React.Ref<T>,
): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      assignRef(forwardedRef, node);
      if (!node) return;
      const frame = requestAnimationFrame(() =>
        node.setAttribute(READY_ATTR, ""),
      );
      return () => {
        cancelAnimationFrame(frame);
        assignRef(forwardedRef, null);
      };
    },
    [forwardedRef],
  );
}

export { useFlowPresence, useFlowRow };
