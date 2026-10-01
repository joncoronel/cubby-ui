import * as React from "react";

// Chips enter and leave by easing a negative `margin-inline-end` (their width
// plus the row gap) so neighbours slide instead of jumping. It is real layout,
// so it wraps and retargets without measuring the siblings.

// One clock for opening and closing; only the exit fade is quicker, so
// removal feels immediate.
const FLOW_MS = 220;
const EXIT_FADE_MS = 130;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ANIMATION_ID = "filters-flow";

/** Marks the bar ready once its first render has painted. */
const READY_ATTR = "data-flow-ready";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Exit copies to drop if their element remounts (Strict Mode), before it measures the row. */
const pendingGhosts = new WeakMap<HTMLElement, HTMLElement>();

/** Fractional width: a rounded `offsetWidth` leaves a sub-pixel snap when motion ends. */
function widthOf(el: HTMLElement): number {
  return el.getBoundingClientRect().width;
}

/**
 * Holds the element at its current width and returns the undo. Chips are
 * `max-w-full`, so a shrink-to-fit row narrowing as space closes would shrink
 * the chip and break a margin measured from its full width.
 */
function pinWidth(el: HTMLElement): () => void {
  const previous = el.style.maxWidth;
  el.style.maxWidth = `${widthOf(el)}px`;
  // Safe unconditionally: a replacing entrance releases the old pin first.
  return () => {
    el.style.maxWidth = previous;
  };
}

function isLiveFlowItem(node: Element): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    !node.hasAttribute("data-flow-ghost") &&
    !["absolute", "fixed"].includes(getComputedStyle(node).position)
  );
}

function columnGap(el: Element | null): number {
  return el ? parseFloat(getComputedStyle(el).columnGap) || 0 : 0;
}

/**
 * Width plus the gap that goes with it. A lone item has no gap, which also
 * keeps a cleared row from closing one gap more than it had.
 */
function flowSpan(el: HTMLElement): number {
  return widthOf(el) + (isAlone(el) ? 0 : columnGap(el.parentElement));
}

function isAlone(el: HTMLElement): boolean {
  const parent = el.parentElement;
  return (
    !parent ||
    !Array.from(parent.children).some(
      (node) => node !== el && isLiveFlowItem(node),
    )
  );
}

function asScroller(row: HTMLElement | null): HTMLElement | null {
  if (!row) return null;
  const { overflowX } = getComputedStyle(row);
  return overflowX === "auto" || overflowX === "scroll" ? row : null;
}

function inlineScroller(el: HTMLElement): HTMLElement | null {
  return asScroller(el.parentElement);
}

function overflows(scroller: HTMLElement): boolean {
  return scroller.scrollWidth > scroller.clientWidth + 1;
}

/** Scrolls the element's sideways-scrolling parent until it clears the edge fades. */
function revealInScroller(el: HTMLElement): void {
  const scroller = inlineScroller(el);
  if (!scroller || !overflows(scroller)) return;
  // Matches the edge fade's depth: min(12%, 2.5rem).
  const inset = Math.min(scroller.clientWidth * 0.12, 40);
  const bounds = scroller.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  const delta =
    rect.right > bounds.right - inset
      ? rect.right - (bounds.right - inset)
      : rect.left < bounds.left + inset
        ? rect.left - (bounds.left + inset)
        : 0;
  if (Math.abs(delta) < 1) return;
  scroller.scrollBy({
    left: delta,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function trailingFlow(el: HTMLElement): HTMLElement[] {
  const nodes = [el];
  for (let node = el.nextElementSibling; node; node = node.nextElementSibling) {
    if (isLiveFlowItem(node)) nodes.push(node);
  }
  return nodes;
}

/**
 * Whether `span` of space at `el` would move anything to another row. Easing
 * across a wrap makes neighbours hop lines mid-motion, so those fade instead.
 */
function crossesRows(el: HTMLElement, span: number): boolean {
  const nodes = trailingFlow(el);
  const rows = nodes.map((node) => node.offsetTop);
  const unpin = pinWidth(el);
  const previous = el.style.marginInlineEnd;
  el.style.marginInlineEnd = `${-span}px`;
  const moved = nodes.some((node, index) => node.offsetTop !== rows[index]);
  el.style.marginInlineEnd = previous;
  unpin();
  return moved;
}

/**
 * Entrance pin undos, released synchronously on replacement: the async cancel
 * event would otherwise fire after the new pin and remove it.
 */
const entrancePins = new WeakMap<HTMLElement, () => void>();

function enterInFlow(el: HTMLElement): void {
  pendingGhosts.get(el)?.remove();
  pendingGhosts.delete(el);
  for (const animation of el.getAnimations()) {
    if (animation.id !== ANIMATION_ID) continue;
    animation.onfinish = null;
    animation.oncancel = null;
    animation.cancel();
  }
  entrancePins.get(el)?.();
  entrancePins.delete(el);
  if (prefersReducedMotion()) {
    const fade = el.animate({ opacity: [0, 1] }, { duration: 150 });
    fade.id = ANIMATION_ID;
    return;
  }
  // An overflowing scroller has nothing in view to slide; fade and reveal.
  const scroller = inlineScroller(el);
  if (scroller && overflows(scroller)) {
    const animation = el.animate(
      {
        opacity: [0, 1],
      },
      { duration: FLOW_MS, easing: EASE },
    );
    animation.id = ANIMATION_ID;
    revealInScroller(el);
    return;
  }
  // The first chip into a hidden empty strip also brings back its outer gap.
  if (scroller) {
    // Start from the strip as it is now if it was still narrowing (undo a clear).
    cancelAnimations(scroller, SCROLLER_WIDTH_ID);
    holdFade(scroller);
    if (isAlone(el)) animateOuterGap(scroller, "open");
  }
  const fullSpan = flowSpan(el);
  const span = crossesRows(el, fullSpan) ? 0 : fullSpan;
  const unpin = pinWidth(el);
  entrancePins.set(el, unpin);
  const animation = el.animate(
    { marginInlineEnd: [`${-span}px`, "0px"] },
    { duration: FLOW_MS, easing: EASE },
  );
  animation.id = ANIMATION_ID;
  // Gentler curve than the space, so little of the chip shows over its neighbour.
  el.animate(
    { opacity: [0, 1] },
    { duration: FLOW_MS, easing: "ease-out" },
  ).id = ANIMATION_ID;
  animation.onfinish = () => {
    unpin();
    if (entrancePins.get(el) === unpin) entrancePins.delete(el);
    revealInScroller(el);
  };
  animation.oncancel = () => {
    unpin();
    if (entrancePins.get(el) === unpin) entrancePins.delete(el);
  };
}

const fadeHolds = new WeakMap<HTMLElement, number>();

/**
 * Turns a strip's edge fade off during motion: the moving chip's full width
 * counts toward scroll width early, so a fitting strip reads as overflowing.
 * Restored once every hold has run out.
 */
function holdFade(scroller: HTMLElement) {
  const holds = fadeHolds.get(scroller) ?? 0;
  fadeHolds.set(scroller, holds + 1);
  if (holds === 0) {
    scroller.style.maskImage = "none";
    scroller.style.setProperty("-webkit-mask-image", "none");
  }
  setTimeout(() => {
    const left = (fadeHolds.get(scroller) ?? 1) - 1;
    fadeHolds.set(scroller, left);
    if (left > 0) return;
    scroller.style.removeProperty("mask-image");
    scroller.style.removeProperty("-webkit-mask-image");
  }, FLOW_MS);
}

/** Keeps an emptied strip shown while its exit is still settling. */
const BUSY_ATTR = "data-flow-busy";

const SCROLLER_GAP_ID = "filters-flow-gap";
const SCROLLER_WIDTH_ID = "filters-flow-width";

/**
 * Eases the strip's outer gap (present only while it has chips) via a negative
 * margin. Closing holds its end state until `settleScroller` releases it.
 */
function animateOuterGap(scroller: HTMLElement, direction: "open" | "close") {
  for (const animation of scroller.getAnimations()) {
    if (animation.id === SCROLLER_GAP_ID) animation.cancel();
  }
  // The resting margin isn't necessarily zero.
  const rest = parseFloat(getComputedStyle(scroller).marginInlineEnd) || 0;
  const open = `${rest}px`;
  const closed = `${rest - columnGap(scroller.parentElement)}px`;
  scroller.animate(
    {
      marginInlineEnd: direction === "open" ? [closed, open] : [open, closed],
    },
    {
      duration: FLOW_MS,
      easing: EASE,
      fill: direction === "close" ? "forwards" : "none",
    },
  ).id = SCROLLER_GAP_ID;
}

function cancelAnimations(el: HTMLElement, id: string) {
  for (const animation of el.getAnimations()) {
    if (animation.id === id) animation.cancel();
  }
}

/**
 * In-flight exit batches per strip. Cleanup waits for the last, or an earlier
 * batch's cleanup would cut a later batch's motion short.
 */
const scrollerExits = new WeakMap<HTMLElement, number>();

function settleScroller(scroller: HTMLElement) {
  const left = (scrollerExits.get(scroller) ?? 1) - 1;
  scrollerExits.set(scroller, left);
  if (left > 0) return;
  scroller.removeAttribute(BUSY_ATTR);
  cancelAnimations(scroller, SCROLLER_GAP_ID);
  cancelAnimations(scroller, SCROLLER_WIDTH_ID);
}

interface Exit {
  el: HTMLElement;
  ghost: HTMLElement;
  span: number;
  crosses: boolean;
  /** Progress of an interrupted entrance. */
  opacity: number;
  margin: number;
}

/** Exits from one row in the same commit, played together. */
const exitBatches = new Map<
  HTMLElement,
  { exits: Exit[]; width: number; overflowed: boolean }
>();

/**
 * Leaves an inert copy of `el` in its place (just before React removes it)
 * and closes its space. One commit's copies play together a microtask later.
 */
function exitInFlow(el: HTMLElement): void {
  const parent = el.parentElement;
  if (!parent || prefersReducedMotion()) return;
  // Copies carry no animations, so capture an interrupted entrance's progress
  // (or the exit snaps), then cancel it so measurements see resting layout.
  const current = getComputedStyle(el);
  const opacity = parseFloat(current.opacity);
  const margin = parseFloat(current.marginInlineEnd) || 0;
  for (const animation of el.getAnimations()) {
    if (animation.id !== ANIMATION_ID) continue;
    animation.onfinish = null;
    animation.oncancel = null;
    animation.cancel();
  }
  entrancePins.get(el)?.();
  entrancePins.delete(el);
  const span = flowSpan(el);
  const crosses = crossesRows(el, span);
  const ghost = el.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  for (const node of ghost.querySelectorAll("[id]")) node.removeAttribute("id");
  // A distinct slot so lookups for live chips skip the copy.
  ghost.setAttribute("data-slot", `${el.dataset.slot ?? "flow"}-ghost`);
  ghost.setAttribute("data-flow-ghost", "");
  ghost.inert = true;
  // Fixed width, for the reason `pinWidth` gives.
  Object.assign(ghost.style, {
    width: `${widthOf(el)}px`,
    maxWidth: "none",
  });

  let batch = exitBatches.get(parent);
  if (!batch) {
    const created = {
      exits: [] as Exit[],
      width: widthOf(parent),
      overflowed: overflows(parent),
    };
    exitBatches.set(parent, created);
    queueMicrotask(() => {
      exitBatches.delete(parent);
      playExits(parent, created);
    });
    batch = created;
  }
  el.before(ghost);
  pendingGhosts.set(el, ghost);
  batch.exits.push({ el, ghost, span, crosses, opacity, margin });
}

function liftOut(ghost: HTMLElement) {
  const { offsetLeft, offsetTop } = ghost;
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${offsetLeft}px`,
    top: `${offsetTop}px`,
    margin: "0px",
  });
}

function fadeOut({ ghost, opacity }: Exit): Animation {
  return ghost.animate(
    {
      opacity: [opacity, 0],
    },
    { duration: EXIT_FADE_MS, easing: EASE, fill: "forwards" },
  );
}

function playExits(
  parent: HTMLElement,
  batch: { exits: Exit[]; width: number; overflowed: boolean },
) {
  const { width, overflowed } = batch;
  const exits = batch.exits.filter(({ el, ghost }) => {
    if (pendingGhosts.get(el) === ghost) pendingGhosts.delete(el);
    // Still attached: Strict Mode's rehearsal. Row gone: nothing to show.
    if (el.isConnected || !parent.isConnected) {
      ghost.remove();
      return false;
    }
    return true;
  });
  if (exits.length === 0) return;

  const scroller = asScroller(parent);
  const emptying =
    scroller !== null && !Array.from(parent.children).some(isLiveFlowItem);

  // The strip's final width. Stop an earlier batch's width motion first, or
  // it would be measured as the destination.
  let settledWidth = width;
  if (scroller) {
    cancelAnimations(scroller, SCROLLER_WIDTH_ID);
    scrollerExits.set(scroller, (scrollerExits.get(scroller) ?? 0) + 1);
    // Hide every copy, earlier batches' too, or one still collapsing counts.
    const ghosts = Array.from(
      scroller.querySelectorAll<HTMLElement>(":scope > [data-flow-ghost]"),
    );
    for (const ghost of ghosts) ghost.style.display = "none";
    settledWidth = emptying ? 0 : widthOf(scroller);
    for (const ghost of ghosts) ghost.style.display = "";
  }

  if (scroller && overflowed && settledWidth !== width) {
    // Closing space inside an overflowing strip happens mostly out of view,
    // then the bar jumps. Fade copies in place and ease the strip's width.
    scroller.style.position ||= "relative";
    for (const exit of exits) liftOut(exit.ghost);
    scroller.animate(
      { width: [`${width}px`, `${settledWidth}px`] },
      { duration: FLOW_MS, easing: EASE },
    ).id = SCROLLER_WIDTH_ID;
    if (emptying) animateOuterGap(scroller, "close");
    // A lifted copy still widens the scroll range (keeping the edge fade on),
    // so each goes once faded; busy keeps an emptied strip shown meanwhile.
    scroller.setAttribute(BUSY_ATTR, "");
    // It ends up fitting, so drop the fade now rather than mid-motion.
    holdFade(scroller);
    for (const exit of exits) {
      fadeOut(exit).finished.then(
        () => exit.ghost.remove(),
        () => exit.ghost.remove(),
      );
    }
  } else {
    // A fitting strip only looks overflowing while space closes.
    if (scroller && !overflowed) holdFade(scroller);
    if (emptying && scroller) animateOuterGap(scroller, "close");
    for (const exit of exits) {
      if (exit.crosses) {
        liftOut(exit.ghost);
      } else {
        collapse(exit);
      }
      fadeOut(exit);
    }
  }

  // Copies stay until the space closes, so an emptied strip doesn't hide mid-motion.
  setTimeout(() => {
    for (const { ghost } of exits) ghost.remove();
    if (scroller) settleScroller(scroller);
  }, FLOW_MS);
}

/**
 * Shrinks a copy's box to nothing and pulls it over the preceding gap. A
 * negative margin alone leaves the box in the scroll range, so the edge fade
 * would linger and the range snap on removal.
 */
function collapse({ ghost, span, margin }: Exit) {
  const styles = getComputedStyle(ghost);
  const box = widthOf(ghost);
  const gap = span - box;
  ghost.style.overflow = "hidden";
  ghost.animate(
    {
      width: [`${box}px`, "0px"],
      paddingInline: [
        `${styles.paddingInlineStart} ${styles.paddingInlineEnd}`,
        "0px",
      ],
      borderInlineWidth: [
        `${styles.borderInlineStartWidth} ${styles.borderInlineEndWidth}`,
        "0px",
      ],
      marginInlineStart: ["0px", `${-Math.max(0, gap)}px`],
      // Non-zero if it left mid-entrance.
      marginInlineEnd: [`${margin}px`, "0px"],
    },
    { duration: FLOW_MS, easing: EASE, fill: "forwards" },
  );
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Callback ref that animates the element into and out of its flex row; only
 * mounts after the row's first paint animate in. Kept stable (forwarded ref
 * synced separately), or an inline caller ref would replay exit and entrance
 * every render.
 */
function useFlowPresence<T extends HTMLElement>(
  forwardedRef?: React.Ref<T>,
): React.RefCallback<T> {
  const nodeRef = React.useRef<T | null>(null);
  const forwarded = React.useRef(forwardedRef);
  React.useLayoutEffect(() => {
    if (forwarded.current === forwardedRef) return;
    assignRef(forwarded.current, null);
    forwarded.current = forwardedRef;
    assignRef(forwardedRef, nodeRef.current);
  });
  return React.useCallback((node: T | null) => {
    nodeRef.current = node;
    assignRef(forwarded.current, node);
    if (!node) return;
    const row = node.closest(`[${READY_ATTR}]`);
    if (row) enterInFlow(node);
    return () => {
      nodeRef.current = null;
      assignRef(forwarded.current, null);
      exitInFlow(node);
    };
  }, []);
}

/** Callback ref for the row: marks it ready after first paint so later children animate in. */
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

export { revealInScroller, useFlowPresence, useFlowRow };
