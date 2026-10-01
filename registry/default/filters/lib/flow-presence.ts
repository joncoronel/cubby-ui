import * as React from "react";

// Chips arrive and leave by opening and closing their own space in the flex
// row, so the neighbours slide instead of jumping. The space is a negative
// `margin-inline-end` equal to the element's width plus the row gap, eased to
// zero on the way in and out to it on the way out. It is real layout, so it
// wraps, retargets and stays correct with any number of siblings, with no
// measuring of the siblings themselves.

// Space opens and closes on the same clock, so a chip's neighbours move at
// one pace both ways. Only the chip's own fade on the way out is quicker,
// which keeps removal feeling immediate.
const FLOW_MS = 220;
const EXIT_FADE_MS = 130;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const ANIMATION_ID = "filters-flow";

/** Marks the bar ready once its first render has painted. */
const READY_ATTR = "data-flow-ready";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Copies made by `exitInFlow` whose element might still come back: Strict
 * Mode rehearses an unmount and remount in one go, and the copy has to be
 * gone before the remount measures the row.
 */
const pendingGhosts = new WeakMap<HTMLElement, HTMLElement>();

/**
 * The element's exact width. `offsetWidth` rounds to whole pixels, and a
 * rounded figure here leaves a fraction of a pixel to snap when the motion
 * ends. Elements are measured at rest (nothing here scales them), so the
 * box width is the layout width.
 */
function widthOf(el: HTMLElement): number {
  return el.getBoundingClientRect().width;
}

/**
 * Holds the element at its current width. Chips cap themselves at the row's
 * width (`max-w-full`), and a row that sizes to its content (centred in a
 * preview, say) narrows as space closes, which would shrink the chip in turn
 * and throw off a margin measured from its full width. Returns the undo.
 */
function pinWidth(el: HTMLElement): () => void {
  const previous = el.style.maxWidth;
  el.style.maxWidth = `${widthOf(el)}px`;
  // Read back rather than kept: the style normalizes a fractional length
  // ("248.3123px" reads "248.312px"), and the check below has to match.
  const pinned = el.style.maxWidth;
  return () => {
    if (el.style.maxWidth === pinned) el.style.maxWidth = previous;
  };
}

/** Whether a node takes part in the row's layout and isn't a leaving copy. */
function isLiveFlowItem(node: Element): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    !node.dataset.slot?.endsWith("-ghost") &&
    !["absolute", "fixed"].includes(getComputedStyle(node).position)
  );
}

function columnGap(el: Element | null): number {
  return el ? parseFloat(getComputedStyle(el).columnGap) || 0 : 0;
}

/**
 * The width the element takes in its row, plus the gap that comes and goes
 * with it: none when it's the row's only live item, since a lone item sits
 * between no gaps (the last of several leaving at once lands here too, which
 * keeps a cleared row from closing one gap more than it had).
 */
function flowSpan(el: HTMLElement): number {
  const parent = el.parentElement;
  if (!parent) return widthOf(el);
  return widthOf(el) + (isAlone(el) ? 0 : columnGap(parent));
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

/** The element's parent when that parent scrolls sideways. */
function inlineScroller(el: HTMLElement): HTMLElement | null {
  const parent = el.parentElement;
  if (!parent) return null;
  const { overflowX } = getComputedStyle(parent);
  return overflowX === "auto" || overflowX === "scroll" ? parent : null;
}

function overflows(scroller: HTMLElement): boolean {
  return scroller.scrollWidth > scroller.clientWidth + 1;
}

/**
 * Scrolls the element's sideways-scrolling parent until the element sits
 * clear of the parent's edge fades. Does nothing outside a scroller or when
 * the element is already in view.
 */
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

/** The element and the siblings after it that take part in the row. */
function trailingFlow(el: HTMLElement): HTMLElement[] {
  const nodes = [el];
  for (let node = el.nextElementSibling; node; node = node.nextElementSibling) {
    if (isLiveFlowItem(node)) nodes.push(node);
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
  const unpin = pinWidth(el);
  const previous = el.style.marginInlineEnd;
  el.style.marginInlineEnd = `${-span}px`;
  const moved = nodes.some((node, index) => node.offsetTop !== rows[index]);
  el.style.marginInlineEnd = previous;
  unpin();
  return moved;
}

/**
 * The undo for an entrance's width pin. Released synchronously when a new
 * entrance replaces a running one: an animation's cancel event fires later,
 * after the replacement has pinned the same width, and would take that pin
 * off with it.
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
  // In a scroller that already overflows, opening space moves nothing in
  // view, so the chip just appears and the scroller brings it into view.
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
  // The first chip into an empty strip also brings the strip's gap in the
  // bar with it (the strip is hidden while empty); ease that in alongside.
  if (scroller) {
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
  // The chip fades in place at full width, on a gentler curve than its
  // space: the space is mostly open while the chip is still faint, so
  // little of it shows over its neighbour.
  el.animate(
    { opacity: [0, 1] },
    { duration: FLOW_MS, easing: "ease-out" },
  ).id = ANIMATION_ID;
  animation.onfinish = () => {
    unpin();
    if (entrancePins.get(el) === unpin) entrancePins.delete(el);
    // Space that just opened may have pushed it past a scroller's edge.
    revealInScroller(el);
  };
  animation.oncancel = () => {
    unpin();
    if (entrancePins.get(el) === unpin) entrancePins.delete(el);
  };
}

/** How many motions currently hold each strip's edge fade off. */
const fadeHolds = new WeakMap<HTMLElement, number>();

/**
 * Switches a strip's edge fade off while space opens or closes inside it.
 * The moving chip's full width counts toward the strip's scroll width
 * before the strip itself has caught up, so for the length of the motion a
 * strip that fits reads as overflowing and would fade its edge. The fade
 * comes back once every hold has run out, so a strip that does end up
 * overflowing shows it from then on.
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

/** The strip's own animations: its outer gap, and its width. */
const SCROLLER_GAP_ID = "filters-flow-gap";
const SCROLLER_WIDTH_ID = "filters-flow-width";

/**
 * Eases the gap between a strip and the rest of the bar, which appears and
 * disappears with the strip's first and last chip, through a negative
 * margin on the strip. Closing holds at its end until the strip's last copy
 * leaves and the strip hides; `settleScroller` lets it go then.
 */
function animateOuterGap(scroller: HTMLElement, direction: "open" | "close") {
  for (const animation of scroller.getAnimations()) {
    if (animation.id === SCROLLER_GAP_ID) animation.cancel();
  }
  // From the strip's own resting margin, which isn't necessarily zero.
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

/** Drops a strip's held exit animations once nothing is left leaving it. */
function settleScroller(scroller: HTMLElement) {
  if (scroller.querySelector(":scope > [data-flow-ghost]")) return;
  for (const animation of scroller.getAnimations()) {
    if (
      animation.id === SCROLLER_GAP_ID ||
      animation.id === SCROLLER_WIDTH_ID
    ) {
      animation.cancel();
    }
  }
}

interface Exit {
  el: HTMLElement;
  ghost: HTMLElement;
  span: number;
  crosses: boolean;
}

/** Exits from one row in the same commit, played together. */
const exitBatches = new Map<
  HTMLElement,
  { exits: Exit[]; width: number; overflowed: boolean }
>();

/**
 * Leaves a non-interactive copy of `el` in its place, then closes the space
 * it took. Runs while `el` is still in the document, just before React
 * removes it; the copies from one commit play together a microtask later.
 */
function exitInFlow(el: HTMLElement): void {
  const parent = el.parentElement;
  if (!parent || prefersReducedMotion()) return;
  const span = flowSpan(el);
  const crosses = crossesRows(el, span);
  const ghost = el.cloneNode(true) as HTMLElement;
  ghost.removeAttribute("id");
  for (const node of ghost.querySelectorAll("[id]")) node.removeAttribute("id");
  // A distinct slot so nothing that looks up live chips finds the copy.
  ghost.setAttribute("data-slot", `${el.dataset.slot ?? "flow"}-ghost`);
  ghost.setAttribute("data-flow-ghost", "");
  ghost.setAttribute("aria-hidden", "true");
  ghost.inert = true;
  // Fixed at the size it left at, for the reason `pinWidth` gives.
  Object.assign(ghost.style, {
    pointerEvents: "none",
    width: `${widthOf(el)}px`,
    maxWidth: "none",
  });

  let batch = exitBatches.get(parent);
  if (!batch) {
    const created = {
      exits: [] as Exit[],
      width: widthOf(parent),
      overflowed: parent.scrollWidth > parent.clientWidth + 1,
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
  batch.exits.push({ el, ghost, span, crosses });
}

/** Takes a copy out of the row, over the spot it holds. */
function liftOut(ghost: HTMLElement) {
  const { offsetLeft, offsetTop } = ghost;
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${offsetLeft}px`,
    top: `${offsetTop}px`,
    margin: "0px",
  });
}

function fadeOut({ ghost }: Exit): Animation {
  return ghost.animate(
    {
      opacity: [1, 0],
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

  const { overflowX } = getComputedStyle(parent);
  const scroller =
    overflowX === "auto" || overflowX === "scroll" ? parent : null;
  const emptying =
    scroller !== null && !Array.from(parent.children).some(isLiveFlowItem);

  // How wide the strip ends up once the copies are gone.
  let settledWidth = width;
  if (scroller) {
    for (const { ghost } of exits) ghost.style.display = "none";
    settledWidth = emptying ? 0 : widthOf(scroller);
    for (const { ghost } of exits) ghost.style.display = "";
  }

  if (scroller && overflowed && settledWidth !== width) {
    // An overflowing strip changes width. Space closing inside it would
    // mostly happen out of view, so the bar would sit still and then jump.
    // Instead the copies fade where they stand and the strip eases to its
    // new width, moving the rest of the bar in one motion.
    scroller.style.position ||= "relative";
    for (const exit of exits) liftOut(exit.ghost);
    scroller.animate(
      { width: [`${width}px`, `${settledWidth}px`] },
      { duration: FLOW_MS, easing: EASE },
    ).id = SCROLLER_WIDTH_ID;
    if (emptying) animateOuterGap(scroller, "close");
    // Out of the row, a copy still widens the strip's scroll range, which
    // would keep its edge fade on after the copy has gone. So each goes as
    // soon as it has faded, and the strip is flagged busy so it doesn't
    // hide (it does once empty) before its own width has settled.
    scroller.setAttribute(BUSY_ATTR, "");
    // The strip only narrows here because it ends up fitting, so its edge
    // fade goes now, with the removal, rather than popping off mid-motion.
    holdFade(scroller);
    for (const exit of exits) {
      fadeOut(exit).finished.then(
        () => exit.ghost.remove(),
        () => exit.ghost.remove(),
      );
    }
  } else {
    // A strip that fit before the change only looks like it overflows
    // while the space closes.
    if (scroller && !overflowed) holdFade(scroller);
    if (emptying && scroller) animateOuterGap(scroller, "close");
    for (const exit of exits) {
      if (exit.crosses) {
        // Out of the row, over the spot it held, while the rows reflow.
        liftOut(exit.ghost);
      } else {
        collapse(exit);
      }
      fadeOut(exit);
    }
  }

  // Copies stay (invisible) until the space has closed, so a strip that
  // hides when empty doesn't vanish mid-animation.
  setTimeout(() => {
    for (const { ghost } of exits) ghost.remove();
    if (scroller) {
      scroller.removeAttribute(BUSY_ATTR);
      settleScroller(scroller);
    }
  }, FLOW_MS);
}

/**
 * Closes a copy's space by shrinking its box to nothing (content clipped as
 * it goes) and drawing it back over the gap before it. A negative margin
 * alone would leave the copy's own box standing, still counted in a
 * scroller's range: the edge fade would stay on, then the range would snap
 * once the copy went.
 */
function collapse({ ghost, span }: Exit) {
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
    },
    { duration: FLOW_MS, easing: EASE, fill: "forwards" },
  );
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

export { revealInScroller, useFlowPresence, useFlowRow };
