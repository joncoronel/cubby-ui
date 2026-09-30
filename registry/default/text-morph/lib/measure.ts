/**
 * Reading the page for a change: where glyphs are drawn, whether a label
 * would be seen, what holds it, and how its box is sized. Reads only; the
 * engine decides when, so they land in its read phases.
 */

export type VisualState = {
  rect: DOMRect;
  opacity: number;
  scale: string;
  rotate: string;
  filter: string;
};

export function visualState(node: HTMLElement): VisualState {
  const style = getComputedStyle(node);
  return {
    rect: node.getBoundingClientRect(),
    opacity: Number(style.opacity),
    scale: style.scale === "none" ? "1" : style.scale,
    rotate: style.rotate === "none" ? "0deg" : style.rotate,
    filter: style.filter === "none" ? "blur(0px)" : style.filter,
  };
}

/** How far `a`'s centre sits from `b`'s (scale and tilt pivot on centres). */
export function centreDelta(a: DOMRect, b: DOMRect): [number, number] {
  return [
    a.left + a.width / 2 - (b.left + b.width / 2),
    a.top + a.height / 2 - (b.top + b.height / 2),
  ];
}

const CLIPS = /auto|scroll|hidden|clip/;

/** Whether an element cuts off what overflows it (a scroller, a clip). */
const clips = (style: CSSStyleDeclaration): boolean =>
  CLIPS.test(style.overflowX) || CLIPS.test(style.overflowY);

/**
 * Whether a change here would be seen: rendered, and within the viewport
 * and every ancestor that clips it, so a label scrolled out of
 * view inside a scrolling panel swaps without animating.
 */
export function isOnScreen(el: HTMLElement): boolean {
  // A background tab: animations there don't finish until it's shown, so
  // every change would leave its ghosts piling up in the meantime.
  if (document.visibilityState === "hidden") return false;
  if (el.checkVisibility && !el.checkVisibility()) return false;
  let top = 0;
  let left = 0;
  let bottom = window.innerHeight;
  let right = window.innerWidth;
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (!clips(getComputedStyle(node))) continue;
    const box = node.getBoundingClientRect();
    top = Math.max(top, box.top);
    left = Math.max(left, box.left);
    bottom = Math.min(bottom, box.bottom);
    right = Math.min(right, box.right);
  }
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom > top &&
    rect.right > left &&
    rect.top < bottom &&
    rect.left < right
  );
}

export type Side = "start" | "end";

/**
 * Whether a box shows an edge: a background, a side border, a shadow (a
 * ring, a shadow-drawn outline) or a frosted backdrop.
 */
function showsEdge(style: CSSStyleDeclaration): boolean {
  return (
    style.backgroundImage !== "none" ||
    (style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      style.backgroundColor !== "transparent") ||
    parseFloat(style.borderLeftWidth) > 0 ||
    parseFloat(style.borderRightWidth) > 0 ||
    style.boxShadow !== "none" ||
    (style.backdropFilter !== "" && style.backdropFilter !== "none")
  );
}

/** Whether a pseudo-element draws a surface for its box (a button's fill). */
function pseudoShowsEdge(
  node: Element,
  which: "::before" | "::after",
): boolean {
  const style = getComputedStyle(node, which);
  return (
    style.content !== "none" && style.content !== "normal" && showsEdge(style)
  );
}

/**
 * The inner edges of what a reader sees as holding the value: the nearest ancestor that shows an edge, itself or through a
 * pseudo-element (our Button paints its fill on `::before`), or clips; else
 * the viewport. A plain block around it has no edge to see.
 */
export type Bounds = { left: number; right: number };

export function visibleBounds(el: HTMLElement): Bounds {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (
      showsEdge(style) ||
      clips(style) ||
      pseudoShowsEdge(node, "::before") ||
      pseudoShowsEdge(node, "::after")
    ) {
      const box = node.getBoundingClientRect();
      return {
        left: box.left + parseFloat(style.borderLeftWidth),
        right: box.right - parseFloat(style.borderRightWidth),
      };
    }
  }
  return { left: 0, right: window.innerWidth };
}

/**
 * Whether old ink escaping the box on this side would land on something:
 * a neighbour on the line, or past the edge a reader sees holding the value
 * (a pill, a card, a clipping wrapper), whose position it returns. With room
 * around it, ink is left to dissolve on its own opacity. Reads the final
 * layout.
 */
export function inkEscapes(
  root: HTMLElement,
  side: Side,
  inkEdge: number,
  visible: () => Bounds,
): false | "neighbour" | number {
  let el: Element = root;
  for (let depth = 0; depth < 8; depth++) {
    // `side` is physical (start: left, end: right); in right-to-left text
    // the next sibling sits to the left.
    const rtl =
      el.parentElement !== null &&
      getComputedStyle(el.parentElement).direction === "rtl";
    const toRight = (side === "end") !== rtl;
    let sibling = toRight ? el.nextSibling : el.previousSibling;
    while (sibling) {
      const visible =
        sibling instanceof Element
          ? sibling.getBoundingClientRect().width >= 1
          : Boolean(sibling.textContent?.trim());
      if (visible) return "neighbour";
      sibling = toRight ? sibling.nextSibling : sibling.previousSibling;
    }
    // Neighbours share the line up to the first block around it.
    const parent = el.parentElement;
    if (!parent) break;
    const { display } = getComputedStyle(parent);
    if (!display.startsWith("inline") && display !== "contents") break;
    el = parent;
  }
  // Past the container's edge: the edge itself, where the fade belongs.
  const bounds = visible();
  if (side === "end")
    return inkEdge > bounds.right + 0.5 ? bounds.right : false;
  return inkEdge < bounds.left - 0.5 ? bounds.left : false;
}

/**
 * How many lines an inline element's text runs over: rows, not the
 * fragments `getClientRects` reports (a line can come back in pieces, split
 * around a space or a line break).
 */
export function lineCount(el: HTMLElement): number {
  const tops: number[] = [];
  for (const rect of el.getClientRects()) {
    if (!tops.some((top) => Math.abs(top - rect.top) < 1)) tops.push(rect.top);
  }
  return tops.length;
}

type Axis = "width" | "height";

/** A box's content width or height, from its rect: less padding and borders. */
export function contentSize(
  style: CSSStyleDeclaration,
  rect: DOMRect,
  axis: Axis,
): number {
  const sides = axis === "width" ? ["left", "right"] : ["top", "bottom"];
  let size = rect[axis];
  for (const side of sides) {
    size -= parseFloat(style.getPropertyValue(`padding-${side}`)) || 0;
    size -= parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0;
  }
  return size;
}

/** The width or height to set to make a box this big, by its box-sizing. */
export function sizeOf(
  style: CSSStyleDeclaration,
  rect: DOMRect,
  axis: Axis,
): number {
  return style.boxSizing === "border-box"
    ? rect[axis]
    : contentSize(style, rect, axis);
}

/** Until a label has resized, a guess from its alignment. */
export function anchorHint(style: CSSStyleDeclaration): number {
  const rtl = style.direction === "rtl";
  switch (style.textAlign) {
    case "center":
      return 0.5;
    case "end":
      return 1;
    case "right":
      return rtl ? 0 : 1;
    case "left":
      return rtl ? 1 : 0;
    default:
      return 0;
  }
}
