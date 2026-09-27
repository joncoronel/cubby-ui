"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import {
  caretUnits,
  decimalFor,
  isBreak,
  isDigit,
  matchText,
  textUnits,
  type GlyphKind,
} from "./lib/match";
import {
  resolveOptions,
  type TextMorphOptions,
  type TextMorphOverrides,
} from "./lib/options";
import {
  HOME,
  awayState,
  fadesFor,
  staggerDelays,
  stillOptions,
} from "./lib/timing";
import "./text-morph.css";

/*
 * Animated text for labels that change in place.
 *
 * The server renders the label already split into one span per glyph, as
 * fixed HTML that this component owns from then on. The browser receives
 * identical markup, so hydration changes nothing and nothing is measured at
 * load. Work happens only when the value changes:
 *
 *   1. Snapshot every visible glyph's on-screen box, including whatever
 *      animation it's mid-way through. Starting from there is what makes a
 *      change that lands mid-animation pick up smoothly instead of jumping.
 *   2. Reuse the glyph nodes the old and new text share, create the new
 *      ones, and move the removed ones to a ghost layer to animate out.
 *   3. Measure the final layout, then animate each glyph from its snapshot.
 *
 * The label flows inline like the text around it, grouped into words so
 * lines only break between them, and it never changes display: switching
 * an element between inline and inline-block repaints its text snapped
 * differently, a visible shimmer as it settles. A change that stays on one
 * line eases the space it takes with its start margin, so the text after
 * it slides rather than jumps. A start margin rather than an end one: line
 * breaking counts it before the glyphs, so a growing value never overruns
 * the space it had and breaks away from the text before it. The stage rides
 * against the label's moving start (`left`, which inline boxes honour) on
 * the same curve, so the glyphs never drift with it. Both
 * run on the main thread from one clock: a transform would run on the
 * compositor and keep going while a busy main thread held the layout
 * still. A change that wraps keeps the lines as the layout, and glyphs
 * travel to their new places across them.
 *
 * Leaving glyphs (ghosts) sit in a layer measured and sized each change,
 * each in a slot at its own line that fades it out above and below. A new
 * glyph always arrives fresh, even where its own text is still leaving
 * (torph's way), so quick changes look like slow ones. The slots fade only while a change plays (`data-playing`); at rest they're
 * inert wrappers.
 */

/** Escapes text for use as element content (never in an attribute). */
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/** Server markup: words of glyphs, with spaces between them. */
function glyphsHtml(text: string): string {
  let html = "";
  let word = "";
  for (const glyph of textUnits(text)) {
    if (isBreak(glyph)) {
      if (word) html += `<span data-word>${word}</span>`;
      word = "";
      html += `<span data-glyph data-space>${escapeHtml(glyph)}</span>`;
    } else {
      word += `<span data-glyph>${escapeHtml(glyph)}</span>`;
    }
  }
  if (word) html += `<span data-word>${word}</span>`;
  return html;
}

function createGlyph(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.setAttribute("data-glyph", "");
  if (isBreak(text)) span.setAttribute("data-space", "");
  span.textContent = text;
  return span;
}

const spaceNode = (node: HTMLElement): boolean =>
  node.hasAttribute("data-space");

/**
 * Lay glyphs out as words, the same structure the server renders, each
 * glyph in a slot: room above and below its line that fades it out while a
 * change plays, taking no space of its own. A glyph that travels turns its
 * slot's fade off (`data-travel`) only when it moves to another line; one
 * that slides along its line keeps the fade and gets room beside it for the
 * slide (`--reach`).
 */
function layOut(layer: HTMLElement, nodes: HTMLElement[]): void {
  const parts: HTMLElement[] = [];
  let word: HTMLElement | null = null;
  for (const node of nodes) {
    if (spaceNode(node)) {
      word = null;
      parts.push(node);
      continue;
    }
    if (!word) {
      word = document.createElement("span");
      word.setAttribute("data-word", "");
      parts.push(word);
    }
    const slot = document.createElement("span");
    slot.className = "text-morph-slot";
    slot.append(node);
    word.append(slot);
  }
  layer.replaceChildren(...parts);
}

type VisualState = {
  rect: DOMRect;
  opacity: number;
  scale: string;
  rotate: string;
  filter: string;
};

function visualState(node: HTMLElement): VisualState {
  const style = getComputedStyle(node);
  return {
    rect: node.getBoundingClientRect(),
    opacity: Number(style.opacity),
    scale: style.scale === "none" ? "1" : style.scale,
    rotate: style.rotate === "none" ? "0deg" : style.rotate,
    filter: style.filter === "none" ? "blur(0px)" : style.filter,
  };
}

/**
 * Morph mode, one-word values (torph): a run of this many replaced glyphs,
 * with no survivor inside, is swapped as one shape rather than glyph by
 * glyph. It recedes further, to GROUP_SCALE about its own centre, and its
 * fades take these shares of the movement's duration.
 */
const GROUP_MIN = 6;
const GROUP_SCALE = 0.8;
const GROUP_FADE_IN = 0.35;
const GROUP_FADE_OUT = 0.45;

/** Its scale's pivot, written only when it changes. */
function setOrigin(node: HTMLElement, origin: string): void {
  if (node.style.transformOrigin !== origin) {
    node.style.transformOrigin = origin;
  }
}

/** How a glyph arriving or leaving as part of a shape scales. */
type Shape = { origin: string; group: boolean };

/** Scale each member about the centre of the whole run. */
function shapeRun(
  shapes: Map<HTMLElement, Shape>,
  members: { node: HTMLElement; rect: DOMRect }[],
  group: boolean,
): void {
  const left = Math.min(...members.map((m) => m.rect.left));
  const right = Math.max(...members.map((m) => m.rect.right));
  const top = Math.min(...members.map((m) => m.rect.top));
  const bottom = Math.max(...members.map((m) => m.rect.bottom));
  for (const { node, rect } of members) {
    shapes.set(node, {
      origin: `${(left + right) / 2 - rect.left}px ${(top + bottom) / 2 - rect.top}px`,
      group,
    });
  }
}

/**
 * The runs of changed glyphs (arriving, or leaving) to shape: whole words,
 * or runs of at least GROUP_MIN between survivors.
 */
function shapeRuns(
  nodes: HTMLElement[],
  changed: (i: number) => boolean,
  byWords: boolean,
): number[][] {
  const runs: number[][] = [];
  let run: number[] = [];
  let whole = true;
  const flush = (): void => {
    if (byWords ? whole && run.length > 0 : run.length >= GROUP_MIN) {
      runs.push(run);
    }
    run = [];
    whole = true;
  };
  nodes.forEach((node, i) => {
    if (spaceNode(node)) return flush();
    if (changed(i)) run.push(i);
    else if (byWords) whole = false;
    else flush();
  });
  flush();
  return runs;
}

/** Share of its fade a glyph interrupted mid-fade takes to finish. */
const CATCH_UP = 0.25;

/**
 * How a change plays: in full, as a crossfade only (the reader prefers
 * reduced motion: remove the movement, keep the change visible), or not at
 * all (disableAnimation, or nobody can see it).
 */
type Playback = "full" | "reduced" | "none";

/** How far `a`'s centre sits from `b`'s (scale and tilt pivot on centres). */
function centreDelta(a: DOMRect, b: DOMRect): [number, number] {
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
 * and every ancestor that clips it (Scritto's), so a label scrolled out of
 * view inside a scrolling panel swaps without animating.
 */
function isOnScreen(el: HTMLElement): boolean {
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

/** The edge fade's ramp, and how far past the box edge it ends (em). */
const EDGE_RAMP = 0.3;
const EDGE_SLACK = 0.4;
/** Room around a ghost for its blur, tilt and scale (em). */
const INK_MARGIN = 0.3;
/** A ghost slot's room beside its glyph (em), for tilt, scale and blur. */
const SLOT_PAD_X = 0.5;
/**
 * Its room above and below (em): roll's, and at least what morph's minimum
 * slot height (1.4em, in the CSS) adds in a tight line height.
 */
const SLOT_PAD_Y = 0.3;
const SLOT_MIN_HEIGHT = 1.4;
/** A kept glyph whose top moves further than this (em) changes line. */
const LINE_CHANGE = 0.3;

type Side = "start" | "end";

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
 * The inner edges of what a reader sees as holding the value (Scritto's
 * bounds): the nearest ancestor that shows an edge, itself or through a
 * pseudo-element (our Button paints its fill on `::before`), or clips; else
 * the viewport. A plain block around it has no edge to see.
 */
function visibleBounds(el: HTMLElement): { left: number; right: number } {
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
function inkEscapes(
  root: HTMLElement,
  side: Side,
  inkEdge: number,
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
  const bounds = visibleBounds(root);
  if (side === "end")
    return inkEdge > bounds.right + 0.5 ? bounds.right : false;
  return inkEdge < bounds.left - 0.5 ? bounds.left : false;
}

/**
 * How many lines an inline element's text runs over: rows, not the
 * fragments `getClientRects` reports (a line can come back in pieces, split
 * around a space or a line break).
 */
function lineCount(el: HTMLElement): number {
  const tops: number[] = [];
  for (const rect of el.getClientRects()) {
    if (!tops.some((top) => Math.abs(top - rect.top) < 1)) tops.push(rect.top);
  }
  return tops.length;
}

type Axis = "width" | "height";

/** A box's content width or height, from its rect: less padding and borders. */
function contentSize(
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
function sizeOf(style: CSSStyleDeclaration, rect: DOMRect, axis: Axis): number {
  return style.boxSizing === "border-box"
    ? rect[axis]
    : contentSize(style, rect, axis);
}

const px = (el: HTMLElement, name: string): number =>
  parseFloat(el.style.getPropertyValue(name)) || 0;

/** A ghost slot at x/y (its glyph's box, layer coordinates). */
function placeSlot(slot: HTMLElement, x: number, y: number): void {
  slot.style.setProperty("--x", `${x}px`);
  slot.style.setProperty("--y", `${y}px`);
}

/** Lift the edge fade (its band animation already cancelled). */
function disarm(ghostLayer: HTMLElement): void {
  ghostLayer.style.removeProperty("--text-morph-edge");
  delete ghostLayer.dataset.armed;
}

/**
 * Fold the ghost layer away, its animations already cancelled. (Asking for
 * them would flush style, which a change avoids after moving nodes.)
 */
function resetLayer(ghostLayer: HTMLElement): void {
  disarm(ghostLayer);
  ghostLayer.style.width = "";
  ghostLayer.style.height = "";
}

/**
 * A change runs in phases, yielding between them: reads, then writes, then
 * reads again. Every label that changes in the same update is stepped
 * through the phases together, so all of them read before any of them
 * writes. Reading after the DOM changes forces the browser to restyle, and
 * on a page with complex `:has()` selectors each such restyle can cover the
 * whole document; batched, a set of changes costs one instead of several
 * per label.
 */
type MorphSteps = Generator<void, Animation[], void>;

type MorphJob = {
  root: HTMLElement;
  steps: MorphSteps;
  done: (started: Animation[]) => void;
};

const queue: MorphJob[] = [];

/**
 * Where each label was last seen pinned as it resized (0 start, 1 end, 0.5
 * centred), from how far each edge travelled: what a roll run's travel is
 * measured against (Scritto's anchor).
 */
const anchors = new WeakMap<HTMLElement, number>();

/** Until a label has resized, a guess from its alignment. */
function anchorHint(style: CSSStyleDeclaration): number {
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

/** Tags a label's current resize, so an older one can't release it. */
let sizings = 0;

function flushMorphs(): void {
  let active = queue.splice(0);
  while (active.length > 0) {
    active = active.filter((job) => {
      const step = job.steps.next();
      if (!step.done) return true;
      job.done(step.value);
      return false;
    });
  }
}

/** Run a change with the others from this update, before the next paint. */
function scheduleMorph(job: MorphJob): void {
  // A second change to the same label before the batch runs goes after it.
  if (queue.some((queued) => queued.root === job.root)) flushMorphs();
  queue.push(job);
  if (queue.length === 1) queueMicrotask(flushMorphs);
}

function* morphTo(
  root: HTMLElement,
  stage: HTMLElement,
  glyphLayer: HTMLElement,
  ghostAnchor: HTMLElement,
  ghostLayer: HTMLElement,
  value: string,
  options: TextMorphOptions,
  place: { decimal: string; caret: number | undefined },
  playback: () => Playback,
): MorphSteps {
  // Everything this change starts, so the caller can tell when it's over.
  const started: Animation[] = [];
  const run = (
    el: Element,
    keyframes: Keyframe[],
    timing: KeyframeAnimationOptions,
  ): Animation => {
    const animation = el.animate(keyframes, timing);
    started.push(animation);
    return animation;
  };
  if (!root.isConnected) return started;
  const old = Array.from(
    glyphLayer.querySelectorAll<HTMLElement>("[data-glyph]"),
  );
  const next = textUnits(value);

  // 1. Read: where everything is on screen right now.
  const play = playback();
  const reduced = play === "reduced";
  const o = reduced ? stillOptions(options) : options;
  const rootBefore = root.getBoundingClientRect();
  const styleBefore = getComputedStyle(root);
  const startBefore = parseFloat(styleBefore.marginInlineStart) || 0;
  const linesBefore = lineCount(glyphLayer);
  // A label laid out as a box (a block, an inline-block, a flex item) can
  // take a height, so a change that adds or removes a line eases it, as
  // torph's inline-block root does. An inline label's height is its lines'.
  const boxed = styleBefore.display !== "inline";
  const heightBefore = sizeOf(styleBefore, rootBefore, "height");
  const originBefore = ghostAnchor.getBoundingClientRect();
  const before = new Map(old.map((node) => [node, visualState(node)]));
  // Ghosts still leaving; ones already gone are cleared in step 4.
  const gone: HTMLElement[] = [];
  const slots = (Array.from(ghostLayer.children) as HTMLElement[]).filter(
    (slot) => {
      if (slot.dataset.gone === undefined) return true;
      gone.push(slot);
      return false;
    },
  );
  const ghosts = slots.flatMap((slot) => {
    const node = slot.firstElementChild;
    return node instanceof HTMLElement
      ? [{ slot, node, drawn: visualState(node) }]
      : [];
  });

  // 2. New glyph list.
  const match = matchText(
    o.mode,
    old.map((node) => node.textContent ?? ""),
    next,
    {
      numbers: o.numbers,
      decimal: place.decimal,
      trend: o.trend === "up" ? 1 : o.trend === "down" ? -1 : 0,
      anchor: anchors.get(root) ?? anchorHint(styleBefore),
      caret:
        place.caret === undefined ? undefined : caretUnits(next, place.caret),
    },
  );
  const used = new Set(match.kept);
  const kept = match.kept.map((from) => (from === -1 ? null : old[from]));
  const leaving = old.flatMap((node, i) =>
    used.has(i) || spaceNode(node)
      ? []
      : [{ node, kind: match.oldKinds[i], index: i }],
  );
  const nodes = next.map((glyph, i) => kept[i] ?? createGlyph(glyph));
  yield;

  // 2. Write: stop what's running (a style change, not a structural one).
  const slotOf = (node: HTMLElement): HTMLElement[] => {
    const slot = node.parentElement;
    return slot?.classList.contains("text-morph-slot") ? [slot] : [];
  };
  // A kept glyph's roll in progress, kept to carry on (step 8) if its place
  // doesn't change: restarted from where it's drawn, a held key sent every
  // digit still settling off again on a fresh curve each press, lurching
  // forward, and one within half a pixel of home snapped there.
  const rolling = new Map<
    HTMLElement,
    { keyframes: Keyframe[]; timing: EffectTiming; time: CSSNumberish | null }[]
  >();
  nodes.forEach((node, i) => {
    if (!kept[i]) return;
    const rolls = node.getAnimations().flatMap((animation) => {
      const effect = animation.effect as KeyframeEffect | null;
      const keyframes = effect?.getKeyframes() ?? [];
      if (!effect || !keyframes.some((k) => "translate" in k)) return [];
      return [
        {
          keyframes,
          timing: effect.getTiming(),
          time: animation.currentTime,
        },
      ];
    });
    if (rolls.length > 0) rolling.set(node, rolls);
  });
  const running = [
    ...nodes,
    ...leaving.map((l) => l.node),
    ...nodes.flatMap(slotOf),
    ...leaving.flatMap((l) => slotOf(l.node)),
    stage,
    root,
    ghostLayer,
  ];
  for (const el of running) {
    for (const animation of el.getAnimations()) animation.cancel();
  }
  yield;

  // 3. Read: where leaving glyphs sit in the layout, with nothing moving
  // them.
  const homes = new Map(
    leaving.map(({ node }) => [node, node.getBoundingClientRect()]),
  );
  // And which line each kept glyph sits on, whatever a roll in progress is
  // drawing it at.
  const keptHomes = new Map(
    nodes.flatMap((node, i) =>
      kept[i] && !spaceNode(node) ? [[node, node.getBoundingClientRect()]] : [],
    ),
  );
  yield;

  // 4. Write: the new glyphs, back to flowing inline, the resting layout.
  // Every structural change happens here, so the batch restyles once.
  layOut(glyphLayer, nodes);
  // Free to wrap again, so step 5 sees how the new value falls.
  delete root.dataset.sizing;
  stage.style.left = "";
  for (const slot of gone) slot.remove();
  // The slots fade from step 8 on, while this change plays.
  delete glyphLayer.dataset.playing;
  if (play === "none") {
    // Swapped without a change to watch: an earlier change's ghosts and
    // edge fade go too (their animations were stopped in step 2).
    ghostLayer.replaceChildren();
    resetLayer(ghostLayer);
    return started;
  }
  // Leaving glyphs move into slots in the ghost layer (placed in step 8).
  const newSlots = leaving.flatMap(({ node, kind, index }) => {
    const home = homes.get(node);
    if (!home) return [];
    const slot = document.createElement("span");
    slot.className = "text-morph-ghost";
    slot.style.setProperty("--w", `${home.width}px`);
    slot.style.setProperty("--h", `${home.height}px`);
    slot.append(node);
    ghostLayer.append(slot);
    return [{ slot, node, kind, home, index }];
  });
  yield;

  // 5. Read: a change that stays on one line is animated as a box; one that
  // wraps keeps its lines as they fall. An empty value has no line box at
  // all; it counts as one line.
  // `box` below means that: the label's space eases as one box.
  const oneLine = lineCount(glyphLayer) <= 1;
  const box = !reduced && linesBefore <= 1 && oneLine;
  // And the rest of the final layout, with the start margin the author set.
  const rootAfter = root.getBoundingClientRect();
  const glyphsAfter = glyphLayer.getBoundingClientRect();
  const styleAfter = getComputedStyle(root);
  const startAfter = parseFloat(styleAfter.marginInlineStart) || 0;
  const heightAfter = sizeOf(styleAfter, rootAfter, "height");
  const reheights =
    boxed && !reduced && Math.abs(heightAfter - heightBefore) > 0.5;
  const origin = ghostAnchor.getBoundingClientRect();
  // Reading direction, for the stagger's sweep.
  const rtl = getComputedStyle(glyphLayer).direction === "rtl";
  const after = nodes.map((node) => node.getBoundingClientRect());
  const em = parseFloat(getComputedStyle(root).fontSize) || 16;

  // Glyphs that travel further than their slot's room go unmasked.
  // A kept glyph moving to another line (wrapped text) goes unmasked, or
  // its slot would hide it on the way. One sliding along its line keeps the
  // fade, since it may be mid-roll and meant to fade back in, and its slot
  // gets room beside it for the slide.
  const changesLine: HTMLElement[] = [];
  const reach: [HTMLElement, number][] = [];
  nodes.forEach((node, i) => {
    const was = kept[i] ? before.get(node) : undefined;
    const home = keptHomes.get(node);
    if (!was || !home) return;
    if (Math.abs(home.top - after[i].top) > LINE_CHANGE * em) {
      changesLine.push(node);
      return;
    }
    const slide = Math.abs(centreDelta(was.rect, after[i])[0]);
    if (slide > 0.5) reach.push([node, Math.ceil(slide)]);
  });
  const letter = nodes.findIndex((node) => !spaceNode(node));
  const line = letter === -1 ? em * 1.2 : after[letter].height;

  // Which way glyphs roll (`trend`, read off the value when `auto`): a rise
  // brings new glyphs up from below and sends old ones up and away. Morph's
  // `down` is torph's: digits fall in from above and leave downward while a
  // number's other marks arrive from below, so each reads as its own event.
  const rise = match.trend === 1;
  const marksRise = o.mode === "morph" && o.trend === "down";
  const arriveFor = (glyph: string): 1 | -1 =>
    rise || (marksRise && !isDigit(glyph)) ? 1 : -1;
  const away = rise ? -1 : 1;

  // What arrives or leaves travels with its nearest surviving neighbour
  // (torph's anchoring), looking before it first when arriving and after it
  // first when leaving. Its slot takes the trip and the glyph its own
  // entrance inside it (torph's slot and mover), so a digit rolls within a
  // number that moves line, where adding the two up cancelled them (a
  // morph digit rolls exactly one line). Morph anchors everything; roll
  // only digits, to the rest of their own number, and only across lines:
  // its glyphs still roll in place on their line (a number that resizes
  // doesn't drag them after its `$`), and a number that moves to another
  // line takes its digits with it.
  //
  // Morph also scales a whole word arriving or leaving about its own
  // centre, as one shape; in a one-word value, only a run of GROUP_MIN or
  // more replaced glyphs, further and faster.
  const shaping = o.mode === "morph" && !reduced;
  // How far each survivor moved in the layout, from its old place to its
  // final one. The layout, not where it's drawn (torph measures with
  // transforms taken out): a digit still falling in is drawn above its
  // place, and anchoring the next one to that stacked each fall on the
  // last, so typing fast brought digits in from ever higher.
  const startsAt = new Map<number, [number, number]>();
  nodes.forEach((node, i) => {
    const home = kept[i] && !spaceNode(node) ? keptHomes.get(node) : null;
    if (home) startsAt.set(i, centreDelta(home, after[i]));
  });
  /** Where a glyph may find its neighbour: anywhere, or its own number. */
  const scope = (kinds: GlyphKind[], i: number): [number, number] | null => {
    if (reduced) return null;
    if (o.mode === "morph") return [0, kinds.length - 1];
    if (kinds[i] !== "number") return null;
    let first = i;
    let last = i;
    while (first > 0 && kinds[first - 1] === "number") first--;
    while (last < kinds.length - 1 && kinds[last + 1] === "number") last++;
    return [first, last];
  };
  const nearest = (
    index: number,
    [first, last]: [number, number],
    offsetAt: (i: number) => [number, number] | undefined,
    forwardFirst: boolean,
  ): [number, number] | undefined => {
    const scan = (step: 1 | -1): [number, number] | undefined => {
      for (let j = index + step; j >= first && j <= last; j += step) {
        const offset = offsetAt(j);
        if (offset) return offset;
      }
      return undefined;
    };
    const [one, two]: [1 | -1, 1 | -1] = forwardFirst ? [1, -1] : [-1, 1];
    return scan(one) ?? scan(two);
  };
  // A trip to another line, not a centred value recentring by half a line
  // as its line count changes.
  const crossesLines = ([, dy]: [number, number]): boolean =>
    Math.abs(dy) > line * 0.75;
  const travels = (trip: [number, number]): boolean =>
    o.mode === "morph" || crossesLines(trip);
  const isArriving = (i: number): boolean => !kept[i] && !spaceNode(nodes[i]);
  const shapes = new Map<HTMLElement, Shape>();
  if (shaping) {
    // Whole words of letters (by words), and runs of GROUP_MIN or more
    // replaced glyphs, digits included: torph splits numbers glyph by glyph
    // either way, so `$12,345,678` → `$99` shrinks its old digits in place
    // rather than sending them after the `$`.
    const shapeAll = (
      glyphs: HTMLElement[],
      changed: (i: number) => boolean,
      kinds: GlyphKind[],
      rectOf: (i: number) => DOMRect | undefined,
    ): void => {
      const add = (runs: number[][], group: boolean): void => {
        for (const run of runs) {
          const members = run.flatMap((i) => {
            const rect = rectOf(i);
            return rect ? [{ node: glyphs[i], rect }] : [];
          });
          if (members.length > 0) shapeRun(shapes, members, group);
        }
      };
      if (!match.byWords) return add(shapeRuns(glyphs, changed, false), true);
      const of = (kind: GlyphKind) => (i: number) =>
        changed(i) && kinds[i] === kind;
      add(shapeRuns(glyphs, of("text"), true), false);
      add(shapeRuns(glyphs, of("number"), false), true);
    };
    shapeAll(nodes, isArriving, match.nextKinds, (i) => after[i]);
    const leavingAt = new Set(leaving.map((l) => l.index));
    shapeAll(
      old,
      (i) => leavingAt.has(i),
      match.oldKinds,
      (i) => homes.get(old[i]),
    );
  }
  // A neighbour is one on the same line: in wrapped text the glyph before
  // a line's first is at the end of the line above, and travelling with it
  // would carry the glyph off the start of its own line (torph never wraps).
  const sameLine = (a: DOMRect | undefined, b: DOMRect | undefined): boolean =>
    a !== undefined && b !== undefined && Math.abs(a.top - b.top) < line / 2;
  // An arriving glyph starts where its neighbour starts; a shape swapped
  // as one doesn't travel.
  const arrivals = new Map<number, [number, number]>();
  nodes.forEach((node, i) => {
    const range = scope(match.nextKinds, i);
    if (!range || !isArriving(i) || shapes.get(node)?.group) return;
    const shift = nearest(
      i,
      range,
      (j) => (sameLine(after[j], after[i]) ? startsAt.get(j) : undefined),
      false,
    );
    if (shift && travels(shift)) arrivals.set(i, shift);
  });
  // A leaving glyph goes where its neighbour goes.
  const newIndexOf = new Map(
    match.kept.flatMap((from, to) => (from === -1 ? [] : [[from, to]])),
  );
  const departures = new Map<HTMLElement, [number, number]>();
  for (const { node, index } of newSlots) {
    const range = scope(match.oldKinds, index);
    if (!range || shapes.get(node)?.group) continue;
    const start = nearest(
      index,
      range,
      (j) => {
        const to = newIndexOf.get(j);
        if (to === undefined) return undefined;
        return sameLine(keptHomes.get(old[j]), homes.get(node))
          ? startsAt.get(to)
          : undefined;
      },
      true,
    );
    if (start && travels(start)) departures.set(node, [-start[0], -start[1]]);
  }

  // Ghost coordinates start at the layer's place in the flow, which holds
  // still on screen for the whole change, so earlier ghosts shift by however
  // far it moved, and hold theirs (placed in step 8).
  const shiftX = originBefore.left - origin.left;
  const shiftY = originBefore.top - origin.top;

  // Edge fade (boxes only): the box before and after, and how far old ink
  // reaches past it, in layer coordinates.
  const boxStart = rootBefore.left - origin.left;
  const boxEnd = rootBefore.right - origin.left;
  const finalStart = rootAfter.left - origin.left;
  const finalEnd = rootAfter.right - origin.left;
  // And where leaving ink ends up when it travels with a neighbour: past an
  // edge that doesn't move (a right-pinned button's), carried out by the
  // survivor sliding toward it.
  const carried = leaving.flatMap(({ node }) => {
    const rect = before.get(node)?.rect;
    const trip = departures.get(node);
    return rect && trip
      ? [
          new DOMRect(
            rect.x + trip[0],
            rect.y + trip[1],
            rect.width,
            rect.height,
          ),
        ]
      : [];
  });
  const inkRects = [
    ...ghosts.map((g) => g.drawn.rect),
    ...leaving.flatMap(({ node }) => {
      const rect = before.get(node)?.rect;
      return rect ? [rect] : [];
    }),
    ...carried,
  ];
  // The glyph boxes decide whether ink sticks out; the room also covers
  // their blur and tilt.
  const glyphStart =
    Math.min(Infinity, ...inkRects.map((r) => r.left)) - origin.left;
  const glyphEnd =
    Math.max(-Infinity, ...inkRects.map((r) => r.right)) - origin.left;
  const wasArmed = ghostLayer.dataset.armed ?? "";
  // How each edge fades: not at all, following the box's edge (a neighbour
  // moves with it), or held at the container's edge (layer coordinates):
  // there only ink crossing it needs fading, and a band following the box
  // swept across letters still well inside (clearing a long value).
  const armed = (side: Side): false | "box" | number => {
    if (!box || o.edgeFade === "never" || inkRects.length === 0) return false;
    if (wasArmed.includes(side)) return "box";
    const travels =
      side === "start"
        ? Math.abs(boxStart - finalStart) > 0.5
        : Math.abs(boxEnd - finalEnd) > 0.5;
    const overhangs =
      side === "start"
        ? glyphStart < finalStart - 0.5
        : glyphEnd > finalEnd + 0.5;
    const carriedOut = carried.some((rect) =>
      side === "start"
        ? rect.left - origin.left < finalStart - 0.5
        : rect.right - origin.left > finalEnd + 0.5,
    );
    if (!(travels && overhangs) && !carriedOut) return false;
    if (o.edgeFade === "always") return "box";
    const escapes = inkEscapes(
      root,
      side,
      origin.left + (side === "start" ? glyphStart : glyphEnd),
    );
    if (escapes === false) return false;
    return escapes === "neighbour" ? "box" : escapes - origin.left;
  };
  const armStart = armed("start");
  const armEnd = armed("end");
  // The space it takes eases from what it visibly took (its box plus any
  // start margin still easing) to its new width.
  const from = box
    ? rootBefore.width + (startBefore - startAfter) - rootAfter.width
    : 0;
  const resizes = Math.abs(from) > 0.5;
  // A box eases its width, as torph's root does, and the stage rides by a
  // share of it in CSS (step 8). An inline label can't take a width, so it
  // eases its start margin, and the stage rides against the move by the
  // margin's exact value.
  const widthAfter = sizeOf(styleAfter, rootAfter, "width");
  // What the stage's percentages count: the label's content box.
  const contentAfter = contentSize(styleAfter, rootAfter, "width");
  const sizeFrom = boxed
    ? { width: `${widthAfter + from}px` }
    : { marginInlineStart: `${startAfter + from}px` };
  const sizeTo = boxed
    ? { width: `${widthAfter}px` }
    : { marginInlineStart: `${startAfter}px` };
  yield;

  // 6. Write: the label at the start of its resize.
  const authorStart = root.style.marginInlineStart;
  const authorWidth = root.style.width;
  const authorHeight = root.style.height;
  if (resizes && boxed) {
    root.style.width = sizeFrom.width ?? "";
    // Its text sits at its start while it resizes (text-align in the CSS),
    // so the stage's ride alone places it, whichever way the width goes.
    root.dataset.sizing = "";
  } else if (resizes)
    root.style.marginInlineStart = sizeFrom.marginInlineStart ?? "";
  if (reheights) root.style.height = `${heightBefore}px`;
  yield;

  // 7. Read: where the label begins there, which the stage rides against.
  // Read even when it doesn't resize: a neighbour changing in the same
  // update may be easing its own space, which moves this label too.
  const rootAt0 =
    oneLine || reheights ? root.getBoundingClientRect() : rootAfter;
  const glyphsAt0 =
    oneLine || reheights ? glyphLayer.getBoundingClientRect() : glyphsAfter;
  // Which edge the label is pinned by, for the next change's run.
  if (resizes) {
    const leftTravel = Math.abs(rootAfter.left - rootAt0.left);
    const rightTravel = Math.abs(rootAfter.right - rootAt0.right);
    const rtl = styleAfter.direction === "rtl";
    const startTravel = rtl ? rightTravel : leftTravel;
    const travel = leftTravel + rightTravel;
    if (travel > 0.5) anchors.set(root, startTravel / travel);
  }
  yield;

  // 8. Write: everything else, attributes and styles only. Nothing below
  // reads layout or changes the DOM's structure.
  root.style.marginInlineStart = authorStart;
  root.style.width = authorWidth;
  root.style.height = authorHeight;
  glyphLayer.dataset.playing = "";
  for (const { slot } of ghosts) {
    placeSlot(slot, px(slot, "--x") + shiftX, px(slot, "--y") + shiftY);
  }
  for (const node of changesLine) {
    node.parentElement?.setAttribute("data-travel", "");
  }
  for (const { slot, node } of newSlots) {
    const [dx, dy] = departures.get(node) ?? [0, 0];
    slot.style.setProperty("--trip-x", `${Math.ceil(Math.abs(dx))}px`);
    slot.style.setProperty("--trip-y", `${Math.ceil(Math.abs(dy))}px`);
  }
  for (const [node, px] of reach) {
    node.parentElement?.style.setProperty("--reach", `${px}px`);
  }

  // A glyph travelling to another line rolls the way it travels instead,
  // so a number that moves up scrolls up as it changes: rolling against
  // its trip, it would hold still on screen while its slot slid past.
  const rollWith = (
    trip: [number, number] | undefined,
    otherwise: 1 | -1,
  ): 1 | -1 =>
    trip && crossesLines(trip) ? (trip[1] > 0 ? 1 : -1) : otherwise;

  if (resizes) {
    const resize = { duration: o.width.duration, easing: o.width.easing };
    // While its space eases open, the value stays on one line. No-wrap
    // changes line breaking, not display, and the value sits on one line
    // either way.
    const sizing = String(++sizings);
    root.dataset.sizing = sizing;
    const ease = run(root, [sizeFrom, sizeTo], resize);
    const release = (): void => {
      if (root.dataset.sizing !== sizing) return;
      delete root.dataset.sizing;
      stage.style.left = "";
    };
    ease.finished.then(release, release);
  }

  // A box's height eases the same way, from what it was to what its new
  // lines take; the value's lines are laid out as they end up throughout.
  if (reheights) {
    run(
      root,
      [{ height: `${heightBefore}px` }, { height: `${heightAfter}px` }],
      { duration: o.width.duration, easing: o.width.easing },
    );
  }

  // The label moves while space eases (its own margin or height, a centred
  // or pinned container around it, or a neighbour changing in the same
  // update easing its space); ride the other way on the width's curve, so
  // the glyphs and ghosts hold the final places they were measured at.
  // A move that is just the label's own margin (all of it pinned at the
  // start or end, half of it centred) rides by the margin's exact value:
  // the measured one is rounded to layout units (1/64px), and the two
  // easing from values that far apart round apart frame to frame, so the
  // glyphs flickered a device pixel side to side (116 flips in one change
  // at 125% scaling).
  // A box rides by how far its glyphs moved (its alignment inside mostly
  // holds them); an inline label by how far it moved.
  const measuredX = boxed
    ? glyphsAfter.left - glyphsAt0.left
    : rootAfter.left - rootAt0.left;
  const ownX =
    resizes && !boxed
      ? [from, -from, from / 2, -from / 2].find(
          (x) => Math.abs(x - measuredX) < 0.05,
        )
      : undefined;
  // A box whose glyphs move with its width (all of the change pinned at the
  // end, half centred) rides by that share of its width as it eases, in
  // CSS: layout rounds the ride and the width it follows from the same
  // number each frame, where a ride animated beside the width rounded on
  // its own and stepped the glyphs back and forth.
  const share = boxed && resizes ? -measuredX / from : NaN;
  const follows = [-1, -0.5, 0.5, 1].find((f) => Math.abs(f - share) < 0.01);
  if (follows !== undefined) {
    stage.style.left = `calc(${follows} * (${contentAfter}px - 100%))`;
  }
  const rideX = follows !== undefined ? 0 : (ownX ?? measuredX);
  const rideY = boxed
    ? glyphsAfter.top - glyphsAt0.top
    : rootAfter.top - rootAt0.top;
  if (Math.abs(rideX) > 0.5 || Math.abs(rideY) > 0.5) {
    run(
      stage,
      [
        { left: `${rideX}px`, top: `${rideY}px` },
        { left: "0px", top: "0px" },
      ],
      { duration: o.width.duration, easing: o.width.easing },
    );
  }

  const motion = { duration: o.motion.duration, easing: o.motion.easing };
  // A filter animates only when there's blur to show: morph's default has
  // none, and a filter animation per glyph costs even when it changes
  // nothing.
  const blur = o.blur > 0 ? `blur(${o.blur}em)` : null;
  const fade = (opacity: number, filter: string | null): Keyframe =>
    filter === null ? { opacity } : { opacity, filter };
  const sharp = (filter: string | null): string | null =>
    filter === null ? null : "blur(0px)";
  const lineStart = (rect: DOMRect, box: DOMRect): number =>
    rtl ? box.right - rect.right : rect.left - box.left;
  const delays = staggerDelays(
    o,
    nodes.flatMap((node, i) =>
      kept[i] || spaceNode(node) ? [] : [lineStart(after[i], rootAfter)],
    ),
    leaving.map(({ node }) => {
      const rect = before.get(node)?.rect;
      return rect ? lineStart(rect, rootBefore) : 0;
    }),
  );

  // Shared glyphs slide from wherever they were, including mid-animation.
  let entering = 0;
  nodes.forEach((node, i) => {
    if (spaceNode(node)) return;
    const was = kept[i] ? before.get(node) : undefined;
    const kind = match.nextKinds[i];
    const { fadeIn } = fadesFor(o, kind);
    // Scale pivots on the glyph's own centre unless it arrives in a shape.
    const shape = shapes.get(node);
    setOrigin(node, shape?.origin ?? "");
    // A shape's glyph slides toward the shape's centre as it scales, out of
    // its slot, whose fade would cut it off; it doesn't roll, so it needs
    // no fade.
    if (shape?.group) node.parentElement?.setAttribute("data-travel", "");
    if (!was) {
      const delay = delays.entering[entering++];
      const awayFrame = shape?.group
        ? { translate: "0 0", scale: String(GROUP_SCALE), rotate: "0deg" }
        : awayState(
            o,
            kind,
            rollWith(arrivals.get(i), arriveFor(next[i])),
            line,
          );
      // Under reduced motion it only fades in, where it lands.
      if (!reduced) {
        run(node, [awayFrame, HOME], {
          ...motion,
          delay,
          fill: "backwards",
        });
      }
      const shift = arrivals.get(i);
      const slot = node.parentElement;
      if (shift && slot) {
        run(
          slot,
          [{ translate: `${shift[0]}px ${shift[1]}px` }, { translate: "0 0" }],
          { ...motion, delay, fill: "backwards" },
        );
      }
      const fadeTiming = shape?.group
        ? {
            duration: o.motion.duration * GROUP_FADE_IN,
            easing: "linear",
            delay,
          }
        : {
            duration: fadeIn.duration,
            easing: fadeIn.easing,
            delay: delay + fadeIn.delay,
          };
      run(node, [fade(0, blur), fade(1, sharp(blur))], {
        ...fadeTiming,
        fill: "backwards",
      });
      return;
    }
    // Under reduced motion a kept glyph takes its new place directly.
    const [dx, dy] = centreDelta(was.rect, after[i]);
    const home = keptHomes.get(node);
    const rolls = rolling.get(node);
    const stays =
      home !== undefined &&
      centreDelta(home, after[i]).every((d) => Math.abs(d) < 0.01);
    if (!reduced && rolls && stays) {
      // Its place holds: the roll it was on carries on where it was.
      for (const { keyframes, timing, time } of rolls) {
        run(node, keyframes, timing).currentTime = time;
      }
    } else if (
      !reduced &&
      (Math.abs(dx) > 0.5 ||
        Math.abs(dy) > 0.5 ||
        was.scale !== "1" ||
        was.rotate !== "0deg")
    ) {
      run(
        node,
        [
          {
            translate: `${dx}px ${dy}px`,
            scale: was.scale,
            rotate: was.rotate,
          },
          HOME,
        ],
        // Roll (Scritto): on the box's curve, not the roll's spring, or a
        // kept run outruns the box resizing around it.
        o.mode === "roll"
          ? { duration: o.width.duration, easing: o.width.easing }
          : motion,
      );
    }
    // Mid-fade (or mid-blur, from an earlier change) it catches up: the next
    // change means a newer value is what to read, so it finishes over a
    // quarter of its fade at most (50ms in morph) rather than hanging
    // half-faded. Restarting the whole fade left a run of quick changes (a
    // held key) crawling in; torph snaps it to full in one frame instead.
    const blurred = was.filter !== "blur(0px)" ? was.filter : null;
    if (was.opacity < 0.999 || blurred !== null) {
      const left = Math.max(1 - was.opacity, blurred !== null ? 0.25 : 0);
      run(node, [fade(was.opacity, blurred), fade(1, sharp(blurred))], {
        duration: fadeIn.duration * Math.min(left, CATCH_UP),
        easing: fadeIn.easing,
      });
    }
  });

  // Leaving glyphs sit at the place they had in the layout, and start from
  // wherever they were drawn.
  for (const { slot, home } of newSlots) {
    placeSlot(slot, home.left - origin.left, home.top - origin.top);
  }

  // Size the layer around every slot (a mask cuts whatever falls outside
  // its element) and, when the edge fade is armed, the band's reach.
  const allSlots = [
    ...ghosts.map((g) => g.slot),
    ...newSlots.map((s) => s.slot),
  ];
  if (allSlots.length === 0) {
    resetLayer(ghostLayer);
    return started;
  }
  const slack = EDGE_SLACK * em;
  const padX = SLOT_PAD_X * em;
  const padY = Math.max(SLOT_PAD_Y * em, (SLOT_MIN_HEIGHT * em - line) / 2);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const slot of allSlots) {
    const x = px(slot, "--x");
    const y = px(slot, "--y");
    const room = padX + px(slot, "--trip-x") + INK_MARGIN * em;
    const roomY = padY + px(slot, "--trip-y");
    minX = Math.min(minX, x - room);
    maxX = Math.max(maxX, x + px(slot, "--w") + room);
    minY = Math.min(minY, y - roomY);
    maxY = Math.max(maxY, y + px(slot, "--h") + roomY);
  }
  const fades = armStart !== false || armEnd !== false;
  if (fades) {
    minX = Math.min(minX, boxStart - slack, finalStart - slack);
    maxX = Math.max(maxX, boxEnd + slack, finalEnd + slack);
    if (typeof armStart === "number") minX = Math.min(minX, armStart);
    if (typeof armEnd === "number") maxX = Math.max(maxX, armEnd);
  }
  const ox = Math.floor(minX) - 1;
  const oy = Math.floor(minY) - 1;
  const layerWidth = Math.ceil(maxX) + 1 - ox;
  ghostLayer.style.setProperty("--ox", `${ox}px`);
  ghostLayer.style.setProperty("--oy", `${oy}px`);
  ghostLayer.style.width = `${layerWidth}px`;
  ghostLayer.style.height = `${Math.ceil(maxY) + 1 - oy}px`;

  // The edge fade: a band on each armed edge that follows the box edge on
  // the width's curve, ending a little past it, or holds at the container's.
  if (fades) {
    const ramp = EDGE_RAMP * em;
    const window = (start: number, end: number) => {
      const left =
        armStart === false
          ? 0
          : typeof armStart === "number"
            ? armStart - ox
            : start - slack - ox;
      const right =
        armEnd === false
          ? layerWidth
          : typeof armEnd === "number"
            ? armEnd - ox
            : end + slack - ox;
      return {
        maskPosition: `${left}px 0`,
        maskSize: `${right - left}px 100%`,
      };
    };
    ghostLayer.dataset.armed = `${armStart !== false ? "start " : ""}${armEnd !== false ? "end" : ""}`;
    ghostLayer.style.setProperty(
      "--text-morph-edge",
      `linear-gradient(to right, ${armStart !== false ? `transparent, #000 ${ramp}px` : "#000"}, ${
        armEnd !== false ? `#000 calc(100% - ${ramp}px), transparent` : "#000"
      })`,
    );
    run(ghostLayer, [window(boxStart, boxEnd), window(finalStart, finalEnd)], {
      duration: o.width.duration,
      easing: o.width.easing,
      fill: "forwards",
    });
  } else {
    disarm(ghostLayer);
  }

  newSlots.forEach(({ slot, node, kind, home }, i) => {
    const was = before.get(node);
    if (!was) return;
    const { fadeOut } = fadesFor(o, kind);
    const delay = delays.leaving[i];
    // Drawn where it was: the offset its animation had it at. Under
    // reduced motion it fades out there.
    const [dx, dy] = centreDelta(was.rect, home);
    const drawn: Keyframe = {
      translate: `${dx}px ${dy}px`,
      scale: was.scale,
      rotate: was.rotate,
    };
    // A shape's pivot applies only to a glyph at rest, or its first frame
    // would jump.
    const atRest = was.scale === "1" && was.rotate === "0deg";
    const shape = atRest ? shapes.get(node) : undefined;
    setOrigin(node, shape?.origin ?? "");
    if (shape?.group) slot.setAttribute("data-travel", "");
    const awayFrame = shape?.group
      ? { translate: "0 0", scale: String(GROUP_SCALE), rotate: "0deg" }
      : awayState(
          o,
          kind,
          // It leaves the way its trip goes.
          rollWith(departures.get(node), away),
          line,
        );
    const move = run(
      node,
      [drawn, reduced ? drawn : awayFrame],
      // Both: its starting place holds through the stagger delay too.
      { ...motion, delay, fill: "both" },
    );
    const trip = departures.get(node);
    if (trip) {
      run(
        slot,
        [{ translate: "0 0" }, { translate: `${trip[0]}px ${trip[1]}px` }],
        { ...motion, delay, fill: "both" },
      );
    }
    const blurred = was.filter !== "blur(0px)" ? was.filter : null;
    // One caught before it showed (still in its fade-in delay) leaves from
    // full, as torph's do: leaving from nothing, a run of quick changes (spam
    // clicking) showed nothing fading out at all.
    const shown = was.opacity === 0 ? 1 : was.opacity;
    const out = run(
      node,
      [
        fade(shown, blurred ?? (blur && "blur(0px)")),
        fade(0, blur ?? (blurred && "blur(0px)")),
      ],
      {
        ...(shape?.group
          ? { duration: o.motion.duration * GROUP_FADE_OUT, easing: "linear" }
          : { duration: fadeOut.duration, easing: fadeOut.easing }),
        delay,
        fill: "both",
      },
    );
    // A ghost that has left stays in place, invisible, until the last one
    // has: removing them together is one change to the DOM's structure (one
    // restyle) instead of one per ghost.
    const finish = (): void => {
      if (slot.parentNode !== ghostLayer) return;
      slot.dataset.gone = "";
      const slots = Array.from(ghostLayer.children) as HTMLElement[];
      if (slots.every((ghost) => ghost.dataset.gone !== undefined)) {
        for (const animation of ghostLayer.getAnimations()) animation.cancel();
        ghostLayer.replaceChildren();
        resetLayer(ghostLayer);
      }
    };
    // Cancelled by a later change, which already moved on without it.
    Promise.all([move.finished, out.finished]).then(finish, finish);
  });
  return started;
}

export type TextMorphProps = Omit<
  useRender.ComponentProps<"span">,
  "children" | "onAnimationStart" | "onAnimationEnd"
> & {
  /** The text. A number is formatted with `locale` and `decimals`. */
  value: string | number;
  /**
   * How changes animate. `mode` picks the defaults for everything else; any
   * field set here, nested ones included, overrides that mode's value.
   */
  options?: TextMorphOverrides;
  /**
   * Formats a number `value` and names the decimal separator numbers are
   * aligned on. Fixed rather than the browser's, so the server and the
   * browser render the same text.
   */
  locale?: string;
  /** Fraction digits for a number `value`. */
  decimals?: number;
  /** Swap the text without animating. */
  disableAnimation?: boolean;
  /**
   * When the reader prefers reduced motion, crossfade in place: nothing
   * travels, scales, tilts, blurs or resizes.
   */
  respectReducedMotion?: boolean;
  /**
   * A change started animating. (These three are TextMorph's own events, not
   * the DOM's CSS animation events.)
   */
  onAnimationStart?: () => void;
  /**
   * A change finished, every glyph and the box settled. Fires right away
   * for a change that didn't animate (`disableAnimation`, off screen). Each change
   * ends in exactly one of this and `onAnimationCancel`, unless the label
   * unmounts first.
   */
  onAnimationComplete?: () => void;
  /** A change was interrupted by the next one. */
  onAnimationCancel?: () => void;
  /**
   * For a field someone is typing in: where the caret sits in `value` after
   * the edit, as a string index (an input's `selectionStart`). Glyphs are
   * matched around it, so typing 1 in front of 20 inserts a digit instead of
   * renumbering the column. Leave it unset for values that change on their
   * own.
   */
  cursorIndex?: number;
};

/** One formatter per locale and decimals: making one is Intl's slow part. */
const formatters = new Map<string, Intl.NumberFormat>();

function formatValue(
  value: string | number,
  locale: string,
  decimals: number | undefined,
): string {
  if (typeof value === "string") return value;
  const key = `${locale}|${decimals ?? ""}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(
      locale,
      decimals === undefined
        ? undefined
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
    );
    formatters.set(key, formatter);
  }
  return formatter.format(value);
}

function TextMorph({
  value: rawValue,
  options,
  locale = "en",
  decimals,
  disableAnimation = false,
  respectReducedMotion = true,
  onAnimationStart,
  onAnimationComplete,
  onAnimationCancel,
  cursorIndex,
  className,
  render,
  ...props
}: TextMorphProps): React.ReactElement {
  const value = formatValue(rawValue, locale, decimals);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const stageRef = React.useRef<HTMLSpanElement>(null);
  const glyphsRef = React.useRef<HTMLSpanElement>(null);
  const ghostsRef = React.useRef<HTMLSpanElement>(null);
  const sheetRef = React.useRef<HTMLSpanElement>(null);
  // Set once: after that this component owns the glyph markup.
  const [initialHtml] = React.useState(() => ({ __html: glyphsHtml(value) }));
  const shown = React.useRef(value);
  const resolved = resolveOptions(options);
  const latest = React.useRef({
    options: resolved,
    disableAnimation,
    respectReducedMotion,
    onAnimationStart,
    onAnimationComplete,
    onAnimationCancel,
    cursorIndex,
  });
  React.useLayoutEffect(() => {
    latest.current = {
      options: resolved,
      disableAnimation,
      respectReducedMotion,
      onAnimationStart,
      onAnimationComplete,
      onAnimationCancel,
      cursorIndex,
    };
  });

  // The change in flight: the next one cancels it. Unmounting, or an
  // Activity or Suspense boundary hiding the label, silences it: it still
  // settles, but calls nothing back (dropping it instead let a label shown
  // again report it complete).
  const inFlight = React.useRef<{
    cancel: () => void;
    silence: () => void;
  } | null>(null);
  React.useLayoutEffect(
    () => () => {
      inFlight.current?.silence();
      inFlight.current = null;
    },
    [],
  );

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const glyphs = glyphsRef.current;
    const ghosts = ghostsRef.current;
    const sheet = sheetRef.current;
    if (
      !root ||
      !stage ||
      !glyphs ||
      !ghosts ||
      !sheet ||
      value === shown.current
    )
      return;
    shown.current = value;
    inFlight.current?.cancel();
    inFlight.current = null;

    const current = latest.current;
    const reduce =
      current.respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let over = false;
    let silent = false;
    const handle = {
      cancel: (): void => {
        if (over) return;
        over = true;
        if (!silent) latest.current.onAnimationCancel?.();
      },
      silence: (): void => {
        silent = true;
      },
    };
    inFlight.current = handle;
    const settle = (): void => {
      if (over) return;
      over = true;
      if (inFlight.current === handle) inFlight.current = null;
      delete glyphs.dataset.playing;
      if (!silent) latest.current.onAnimationComplete?.();
    };
    scheduleMorph({
      root,
      steps: morphTo(
        root,
        stage,
        glyphs,
        ghosts,
        sheet,
        value,
        current.options,
        { decimal: decimalFor(locale), caret: current.cursorIndex },
        // Read in the batch's first read phase, with the others.
        () =>
          current.disableAnimation || !isOnScreen(root)
            ? "none"
            : reduce
              ? "reduced"
              : "full",
      ),
      done: (started) => {
        if (over) return;
        if (started.length === 0) {
          settle();
          return;
        }
        if (!silent) latest.current.onAnimationStart?.();
        void Promise.allSettled(started.map((a) => a.finished)).then(settle);
      },
    });
  }, [value, locale]);

  const defaultProps = {
    "data-slot": "text-morph",
    "data-mode": resolved.mode,
    className: cn("text-morph", className),
    children: (
      <>
        <span className="sr-only">{value}</span>
        <span
          ref={stageRef}
          aria-hidden="true"
          translate="no"
          className="text-morph-stage"
        >
          {/* Each glyph is its own box, which bidi treats as direction-
              neutral: without its own direction, a Latin value in a
              right-to-left paragraph would be laid out backwards. auto
              reads it off the value's first strong character. */}
          <span
            ref={glyphsRef}
            dir="auto"
            className="text-morph-glyphs"
            dangerouslySetInnerHTML={initialHtml}
          />
          <span ref={ghostsRef} className="text-morph-ghosts">
            <span ref={sheetRef} className="text-morph-ghost-sheet" />
          </span>
        </span>
      </>
    ),
  };

  return useRender({
    defaultTagName: "span",
    render,
    ref: rootRef,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export { TextMorph };
export { faster, MODE_DEFAULTS } from "./lib/options";
export type {
  TextMorphMode,
  TextMorphOptions,
  TextMorphOverrides,
  Timing,
} from "./lib/options";
