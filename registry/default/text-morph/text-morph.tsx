"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import {
  caretUnits,
  decimalFor,
  matchText,
  textUnits,
  type GlyphKind,
} from "./lib/match";
import {
  resolveOptions,
  type TextMorphOptions,
  type TextMorphOverrides,
} from "./lib/options";
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
 * glyph landing where its own text is still leaving takes that ghost back.
 * The slots fade only while a change plays (`data-playing`); at rest they're
 * inert wrappers.
 */

/** Escapes text for use as element content (never in an attribute). */
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/** Spaces are where lines may break; everything else sits in a word. */
const isSpace = (glyph: string): boolean =>
  glyph === " " || glyph === "\t" || glyph === "\n";

/** Server markup: words of glyphs, with spaces between them. */
function glyphsHtml(text: string): string {
  let html = "";
  let word = "";
  for (const glyph of textUnits(text)) {
    if (isSpace(glyph)) {
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
  if (isSpace(text)) span.setAttribute("data-space", "");
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
 * Stagger delays for the glyphs that change. `each`: every successive glyph
 * `ms` later. `spread` (Scritto's sweep): delay from where the glyph sits,
 * across `ms` over the changed stretch only, so a one-digit change in a long
 * number isn't left waiting, and a glyph leaving and its replacement in the
 * same spot cross over together. Positions count from the start of the
 * line in reading order.
 */
function staggerDelays(
  o: TextMorphOptions,
  entering: number[],
  leaving: number[],
): { entering: number[]; leaving: number[] } {
  if (o.stagger.mode === "each") {
    return {
      entering: entering.map((_, k) => k * o.stagger.ms),
      leaving: leaving.map((_, k) => k * o.stagger.ms),
    };
  }
  const all = [...entering, ...leaving];
  const min = Math.min(...all);
  const span = Math.max(...all) - min;
  const at = (left: number): number =>
    span > 0 ? (o.stagger.ms * (left - min)) / span : 0;
  return { entering: entering.map(at), leaving: leaving.map(at) };
}

/**
 * Transform keyframe for a glyph away from home: `offset` is 1 below the
 * line, -1 above. Morph letters scale in place; morph digits roll whole
 * lines (`line` is the line height in px).
 */
function awayState(
  o: TextMorphOptions,
  kind: GlyphKind,
  offset: 1 | -1,
  line: number,
): Keyframe {
  if (o.mode === "roll") {
    return {
      translate: `0 ${offset * o.roll.distance}em`,
      scale: String(o.roll.scale),
      rotate: `${o.roll.rotate}deg`,
    };
  }
  if (kind === "number") {
    return {
      translate: `0 ${offset * o.morph.digits.distance * line}px`,
      scale: "1",
      rotate: "0deg",
    };
  }
  return { translate: "0 0", scale: String(o.morph.scale), rotate: "0deg" };
}

/** Fade timings for a glyph of this kind. */
function fadesFor(
  o: TextMorphOptions,
  kind: GlyphKind,
): {
  fadeIn: TextMorphOptions["fadeIn"];
  fadeOut: TextMorphOptions["fadeOut"];
} {
  if (o.mode === "morph" && kind === "number") {
    return {
      fadeIn: { ...o.morph.digits.fadeIn, delay: 0 },
      fadeOut: o.morph.digits.fadeOut,
    };
  }
  return { fadeIn: o.fadeIn, fadeOut: o.fadeOut };
}
const HOME: Keyframe = { translate: "0 0", scale: "1", rotate: "0deg" };

/**
 * How a change plays: in full, as a crossfade only (the reader prefers
 * reduced motion: remove the movement, keep the change visible), or not at
 * all (disabled, or nobody can see it).
 */
type Playback = "full" | "reduced" | "none";

/** The options with nothing that moves, scales, tilts or blurs. */
function stillOptions(o: TextMorphOptions): TextMorphOptions {
  return {
    ...o,
    stagger: { ...o.stagger, ms: 0 },
    roll: { distance: 0, scale: 1, rotate: 0 },
    morph: { ...o.morph, scale: 1, digits: { ...o.morph.digits, distance: 0 } },
    blur: 0,
  };
}

/** How far `a`'s centre sits from `b`'s (scale and tilt pivot on centres). */
function centreDelta(a: DOMRect, b: DOMRect): [number, number] {
  return [
    a.left + a.width / 2 - (b.left + b.width / 2),
    a.top + a.height / 2 - (b.top + b.height / 2),
  ];
}

/** Whether a change here would be seen: rendered, and in the viewport. */
function isOnScreen(el: HTMLElement): boolean {
  if (el.checkVisibility && !el.checkVisibility()) return false;
  const rect = el.getBoundingClientRect();
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

/** The edge fade's ramp, and how far past the box edge it ends (em). */
const EDGE_RAMP = 0.3;
const EDGE_SLACK = 0.4;
/** Room around a ghost for its blur, tilt and scale (em). */
const INK_MARGIN = 0.3;
/** A ghost slot's room beside its glyph (em), for tilt, scale and blur. */
const SLOT_PAD_X = 0.5;
/** Its room above and below, which it fades across (em). */
const SLOT_PAD_Y = 0.3;

type Side = "start" | "end";

/**
 * Whether old ink escaping the box on this side would land on something:
 * a neighbour on the line, or the edge of the box that holds the value (a
 * pill, a card, a clipping wrapper). With room around it, ink is left to
 * dissolve on its own opacity. Reads the final layout.
 */
function inkEscapes(root: HTMLElement, side: Side, inkEdge: number): boolean {
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
      if (visible) return true;
      sibling = toRight ? sibling.nextSibling : sibling.previousSibling;
    }
    const parent = el.parentElement;
    if (!parent) return false;
    const style = getComputedStyle(parent);
    if (!style.display.startsWith("inline") && style.display !== "contents") {
      const box = parent.getBoundingClientRect();
      if (side === "end") {
        const edge =
          box.right -
          parseFloat(style.borderRightWidth) -
          parseFloat(style.paddingRight);
        return inkEdge > edge + 0.5;
      }
      const edge =
        box.left +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.paddingLeft);
      return inkEdge < edge - 0.5;
    }
    el = parent;
  }
  return false;
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

/** A leaving glyph's animations, so a change that brings it back can stop them. */
const ghostAnimations = new WeakMap<HTMLElement, Animation[]>();

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
  const startBefore = parseFloat(getComputedStyle(root).marginInlineStart) || 0;
  const linesBefore = root.getClientRects().length;
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
      trend: o.trend,
      caret:
        place.caret === undefined ? undefined : caretUnits(next, place.caret),
    },
  );
  const used = new Set(match.kept);
  const kept = match.kept.map((from) => (from === -1 ? null : old[from]));
  const leaving = old.flatMap((node, i) =>
    used.has(i) || spaceNode(node) ? [] : [{ node, kind: match.oldKinds[i] }],
  );
  const nodes = next.map((glyph, i) => kept[i] ?? createGlyph(glyph));
  yield;

  // 2. Write: stop what's running (a style change, not a structural one).
  const running = [
    ...nodes,
    ...leaving.map((l) => l.node),
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
  const newSlots = leaving.flatMap(({ node, kind }) => {
    const home = homes.get(node);
    if (!home) return [];
    const slot = document.createElement("span");
    slot.className = "text-morph-ghost";
    slot.style.setProperty("--w", `${home.width}px`);
    slot.style.setProperty("--h", `${home.height}px`);
    slot.append(node);
    ghostLayer.append(slot);
    return [{ slot, node, kind, home }];
  });
  yield;

  // 5. Read: a change that stays on one line is animated as a box; one that
  // wraps keeps its lines as they fall. An empty value has no line box at
  // all; it counts as one line.
  // `box` below means that: the label's space eases as one box.
  const box = !reduced && linesBefore <= 1 && root.getClientRects().length <= 1;
  // And the rest of the final layout, with the start margin the author set.
  const rootAfter = root.getBoundingClientRect();
  const startAfter = parseFloat(getComputedStyle(root).marginInlineStart) || 0;
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
    if (Math.abs(home.top - after[i].top) > SLOT_PAD_Y * em) {
      changesLine.push(node);
      return;
    }
    const slide = Math.abs(centreDelta(was.rect, after[i])[0]);
    if (slide > 0.5) reach.push([node, Math.ceil(slide)]);
  });
  const letter = nodes.findIndex((node) => !spaceNode(node));
  const line = letter === -1 ? em * 1.2 : after[letter].height;

  // A new glyph whose text is still leaving from where it lands (a quick
  // 5 -> 6 -> 5) takes that ghost back rather than crossing it: the ghost
  // turns around from wherever it's drawn, like a kept glyph. Where a ghost
  // sat in the layout is its slot's place, which holds still on screen.
  const reclaimed: { index: number; slot: HTMLElement; node: HTMLElement }[] =
    [];
  const claimed = new Set<HTMLElement>();
  nodes.forEach((node, i) => {
    if (kept[i] || spaceNode(node)) return;
    const target = after[i];
    const ghost = ghosts.find(
      (g) =>
        !claimed.has(g.slot) &&
        g.node.textContent === next[i] &&
        Math.abs(originBefore.left + px(g.slot, "--x") - target.left) <
          target.width / 2 &&
        Math.abs(originBefore.top + px(g.slot, "--y") - target.top) <
          SLOT_PAD_Y * em,
    );
    if (!ghost) return;
    claimed.add(ghost.slot);
    reclaimed.push({ index: i, slot: ghost.slot, node: ghost.node });
    before.set(ghost.node, ghost.drawn);
    const slide = Math.abs(centreDelta(ghost.drawn.rect, target)[0]);
    if (slide > 0.5) reach.push([ghost.node, Math.ceil(slide)]);
  });
  const staying = ghosts.filter((g) => !claimed.has(g.slot));

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
  const inkRects = [
    ...staying.map((g) => g.drawn.rect),
    ...leaving.flatMap(({ node }) => {
      const rect = before.get(node)?.rect;
      return rect ? [rect] : [];
    }),
  ];
  // The glyph boxes decide whether ink sticks out; the room also covers
  // their blur and tilt.
  const glyphStart =
    Math.min(Infinity, ...inkRects.map((r) => r.left)) - origin.left;
  const glyphEnd =
    Math.max(-Infinity, ...inkRects.map((r) => r.right)) - origin.left;
  const wasArmed = ghostLayer.dataset.armed ?? "";
  const armed = (side: Side): boolean => {
    if (!box || o.edgeFade === "never" || inkRects.length === 0) return false;
    if (wasArmed.includes(side)) return true;
    const travels =
      side === "start"
        ? Math.abs(boxStart - finalStart) > 0.5
        : Math.abs(boxEnd - finalEnd) > 0.5;
    const overhangs =
      side === "start"
        ? glyphStart < finalStart - 0.5
        : glyphEnd > finalEnd + 0.5;
    if (!travels || !overhangs) return false;
    return (
      o.edgeFade === "always" ||
      inkEscapes(
        root,
        side,
        origin.left + (side === "start" ? glyphStart : glyphEnd),
      )
    );
  };
  const armStart = armed("start");
  const armEnd = armed("end");
  // The space it takes eases from what it visibly took (its box plus any
  // start margin still easing) to its new width.
  const from = box
    ? rootBefore.width + (startBefore - startAfter) - rootAfter.width
    : 0;
  const resizes = Math.abs(from) > 0.5;
  yield;

  // 6. Write: the label at the start of its resize.
  const authorStart = root.style.marginInlineStart;
  if (resizes) root.style.marginInlineStart = `${startAfter + from}px`;
  yield;

  // 7. Read: where the label begins there, which the stage rides against.
  const rootAt0 = resizes ? root.getBoundingClientRect() : rootAfter;
  yield;

  // 8. Write: everything else, attributes and styles only. Nothing below
  // reads layout or changes the DOM's structure.
  root.style.marginInlineStart = authorStart;
  glyphLayer.dataset.playing = "";
  // Reclaimed ghosts take their new glyph's place, which measured the same.
  for (const { index, slot, node } of reclaimed) {
    for (const animation of ghostAnimations.get(node) ?? []) {
      animation.cancel();
    }
    nodes[index].replaceWith(node);
    nodes[index] = node;
    kept[index] = node;
    slot.remove();
  }
  for (const { slot } of staying) {
    placeSlot(slot, px(slot, "--x") + shiftX, px(slot, "--y") + shiftY);
  }
  for (const node of changesLine) {
    node.parentElement?.setAttribute("data-travel", "");
  }
  for (const [node, px] of reach) {
    node.parentElement?.style.setProperty("--reach", `${px}px`);
  }

  // A rise brings new glyphs up from below and sends old ones up and away.
  const arrive = match.trend;
  const away = match.trend === 1 ? -1 : 1;

  if (resizes) {
    const resize = { duration: o.width.duration, easing: o.width.easing };
    // While its space eases open, the value stays on one line. No-wrap
    // changes line breaking, not display, and the value sits on one line
    // either way.
    const sizing = String(++sizings);
    root.dataset.sizing = sizing;
    const ease = run(
      root,
      [
        { marginInlineStart: `${startAfter + from}px` },
        { marginInlineStart: `${startAfter}px` },
      ],
      resize,
    );
    const release = (): void => {
      if (root.dataset.sizing === sizing) delete root.dataset.sizing;
    };
    ease.finished.then(release, release);

    // The label's start moves while its space eases (its own margin, and a
    // centred or pinned container around it); ride the other way on the
    // same curve, so the glyphs hold their final place.
    const ride = rootAfter.left - rootAt0.left;
    if (Math.abs(ride) > 0.5) {
      run(stage, [{ left: `${ride}px` }, { left: "0px" }], resize);
    }
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
    if (!was) {
      const delay = delays.entering[entering++];
      run(node, [awayState(o, kind, arrive, line), HOME], {
        ...motion,
        delay,
        fill: "backwards",
      });
      run(node, [fade(0, blur), fade(1, sharp(blur))], {
        duration: fadeIn.duration,
        easing: fadeIn.easing,
        delay: delay + fadeIn.delay,
        fill: "backwards",
      });
      return;
    }
    // Under reduced motion a kept glyph takes its new place directly.
    const [dx, dy] = centreDelta(was.rect, after[i]);
    if (
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
        motion,
      );
    }
    // Mid-fade (or mid-blur, from an earlier change) it finishes coming in.
    const blurred = was.filter !== "blur(0px)" ? was.filter : null;
    if (was.opacity < 0.999 || blurred !== null) {
      run(node, [fade(was.opacity, blurred), fade(1, sharp(blurred))], {
        duration: fadeIn.duration,
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
    ...staying.map((g) => g.slot),
    ...newSlots.map((s) => s.slot),
  ];
  if (allSlots.length === 0) {
    resetLayer(ghostLayer);
    return started;
  }
  const slack = EDGE_SLACK * em;
  const padX = SLOT_PAD_X * em;
  const padY = SLOT_PAD_Y * em;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const slot of allSlots) {
    const x = px(slot, "--x");
    const y = px(slot, "--y");
    minX = Math.min(minX, x - padX - INK_MARGIN * em);
    maxX = Math.max(maxX, x + px(slot, "--w") + padX + INK_MARGIN * em);
    minY = Math.min(minY, y - padY);
    maxY = Math.max(maxY, y + px(slot, "--h") + padY);
  }
  if (armStart || armEnd) {
    minX = Math.min(minX, boxStart - slack, finalStart - slack);
    maxX = Math.max(maxX, boxEnd + slack, finalEnd + slack);
  }
  const ox = Math.floor(minX) - 1;
  const oy = Math.floor(minY) - 1;
  const layerWidth = Math.ceil(maxX) + 1 - ox;
  ghostLayer.style.setProperty("--ox", `${ox}px`);
  ghostLayer.style.setProperty("--oy", `${oy}px`);
  ghostLayer.style.width = `${layerWidth}px`;
  ghostLayer.style.height = `${Math.ceil(maxY) + 1 - oy}px`;

  // The edge fade: a band on each armed edge that follows the box edge on
  // the width's curve, ending a little past it.
  if (armStart || armEnd) {
    const ramp = EDGE_RAMP * em;
    const window = (start: number, end: number) => {
      const left = armStart ? start - slack - ox : 0;
      const right = armEnd ? end + slack - ox : layerWidth;
      return {
        maskPosition: `${left}px 0`,
        maskSize: `${right - left}px 100%`,
      };
    };
    ghostLayer.dataset.armed = `${armStart ? "start " : ""}${armEnd ? "end" : ""}`;
    ghostLayer.style.setProperty(
      "--text-morph-edge",
      `linear-gradient(to right, ${armStart ? `transparent, #000 ${ramp}px` : "#000"}, ${
        armEnd ? `#000 calc(100% - ${ramp}px), transparent` : "#000"
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
    const move = run(
      node,
      [drawn, reduced ? drawn : awayState(o, kind, away, line)],
      // Both: its starting place holds through the stagger delay too.
      { ...motion, delay, fill: "both" },
    );
    const blurred = was.filter !== "blur(0px)" ? was.filter : null;
    const out = run(
      node,
      [
        fade(was.opacity, blurred ?? (blur && "blur(0px)")),
        fade(0, blur ?? (blurred && "blur(0px)")),
      ],
      {
        duration: fadeOut.duration,
        easing: fadeOut.easing,
        delay,
        fill: "both",
      },
    );
    ghostAnimations.set(node, [move, out]);
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
  disabled?: boolean;
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
   * for a change that didn't animate (disabled, off screen). Each change
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

function formatValue(
  value: string | number,
  locale: string,
  decimals: number | undefined,
): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat(
    locale,
    decimals === undefined
      ? undefined
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
  ).format(value);
}

export function TextMorph({
  value: rawValue,
  options,
  locale = "en",
  decimals,
  disabled = false,
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
    disabled,
    respectReducedMotion,
    onAnimationStart,
    onAnimationComplete,
    onAnimationCancel,
    cursorIndex,
  });
  React.useLayoutEffect(() => {
    latest.current = {
      options: resolved,
      disabled,
      respectReducedMotion,
      onAnimationStart,
      onAnimationComplete,
      onAnimationCancel,
      cursorIndex,
    };
  });

  // The change in flight, so the next one can cancel it.
  const inFlight = React.useRef<(() => void) | null>(null);

  // Unmounted, a change in flight ends without calling back.
  const mounted = React.useRef(false);
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      inFlight.current = null;
    };
  }, []);

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
    inFlight.current?.();
    inFlight.current = null;

    const current = latest.current;
    const reduce =
      current.respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let over = false;
    const cancel = (): void => {
      if (over || !mounted.current) return;
      over = true;
      latest.current.onAnimationCancel?.();
    };
    inFlight.current = cancel;
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
          current.disabled || !isOnScreen(root)
            ? "none"
            : reduce
              ? "reduced"
              : "full",
      ),
      done: (started) => {
        if (over || !mounted.current) return;
        if (started.length === 0) {
          delete glyphs.dataset.playing;
          over = true;
          if (inFlight.current === cancel) inFlight.current = null;
          latest.current.onAnimationComplete?.();
          return;
        }
        latest.current.onAnimationStart?.();
        void Promise.allSettled(started.map((a) => a.finished)).then(() => {
          if (over || !mounted.current) return;
          over = true;
          if (inFlight.current === cancel) inFlight.current = null;
          delete glyphs.dataset.playing;
          latest.current.onAnimationComplete?.();
        });
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

export { faster, MODE_DEFAULTS } from "./lib/options";
export type {
  TextMorphMode,
  TextMorphOptions,
  TextMorphOverrides,
  Timing,
} from "./lib/options";
