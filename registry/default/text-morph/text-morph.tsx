"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";
import { decimalFor, matchText, type GlyphKind } from "./lib/match";
import { resolveOptions, type TextMorphOptions } from "./lib/options";
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
 * At rest the label flows inline like the text around it, grouped into
 * words so lines only break between them. A change that stays on one line
 * turns the label into a box for its duration: the width eases from
 * wherever it visibly is, and when a pinned or centred container moves the
 * box's left edge, the stage rides the opposite way on the same curve, so
 * the glyphs never drift with it. Both run on the main thread from one
 * clock (width, and `left` rather than a transform): a transform would run
 * on the compositor and keep going while a busy main thread held the width
 * still, sliding the text out of its box. A
 * change that wraps keeps the lines as the layout, and glyphs travel to
 * their new places across them.
 *
 * Leaving glyphs (ghosts) sit in a layer measured and sized each change,
 * each in a slot at its own line that fades it out above and below.
 */

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function graphemes(text: string): string[] {
  return segmenter
    ? Array.from(segmenter.segment(text), (s) => s.segment)
    : Array.from(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Spaces are where lines may break; everything else sits in a word. */
const isSpace = (glyph: string): boolean =>
  glyph === " " || glyph === "\t" || glyph === "\n";

/** Server markup: words of glyphs, with spaces between them. */
function glyphsHtml(text: string): string {
  let html = "";
  let word = "";
  for (const glyph of graphemes(text)) {
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
 * glyph in a slot: room above and below its line that fades it out, taking
 * no space of its own. A glyph that travels turns its slot's fade off
 * (`data-travel`), so nothing cuts it off on the way.
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
 * same spot cross over together. `left` is measured from the box's start.
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

/** Pending "drop the explicit width" timers, per root. */
const settleTimers = new WeakMap<HTMLElement, number>();

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
    let sibling = side === "end" ? el.nextSibling : el.previousSibling;
    while (sibling) {
      const visible =
        sibling instanceof Element
          ? sibling.getBoundingClientRect().width >= 1
          : Boolean(sibling.textContent?.trim());
      if (visible) return true;
      sibling = side === "end" ? sibling.nextSibling : sibling.previousSibling;
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

/**
 * Where the ghost layer's coordinates start on screen: its place in the
 * flow, before the offset that sizes it around its ghosts.
 */
function layerOrigin(layer: HTMLElement): { left: number; top: number } {
  const rect = layer.getBoundingClientRect();
  return {
    left: rect.left - px(layer, "--ox"),
    top: rect.top - px(layer, "--oy"),
  };
}

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

/** Once the last ghost has left, the layer folds away. */
function clearLayer(ghostLayer: HTMLElement): void {
  for (const animation of ghostLayer.getAnimations()) animation.cancel();
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
  ghostLayer: HTMLElement,
  value: string,
  o: TextMorphOptions,
  place: { decimal: string; caret: number | undefined },
  animate: () => boolean,
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
  const next = graphemes(value);

  // 1. Read: where everything is on screen right now.
  const moving = animate();
  const rootBefore = root.getBoundingClientRect();
  const linesBefore = root.getClientRects().length;
  const originBefore = layerOrigin(ghostLayer);
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
  const ghostRects = slots.flatMap((slot) =>
    slot.firstElementChild
      ? [slot.firstElementChild.getBoundingClientRect()]
      : [],
  );

  // 2. New glyph list.
  const match = matchText(
    o.mode,
    old.map((node) => node.textContent ?? ""),
    next,
    {
      numbers: o.numbers,
      decimal: place.decimal,
      trend: o.trend,
      caret: place.caret,
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
  window.clearTimeout(settleTimers.get(root));
  yield;

  // 3. Read: where leaving glyphs sit in the layout, with nothing moving
  // them.
  const homes = new Map(
    leaving.map(({ node }) => [node, node.getBoundingClientRect()]),
  );
  yield;

  // 4. Write: the new glyphs, back to flowing inline, the resting layout.
  // Every structural change happens here, so the batch restyles once.
  layOut(glyphLayer, nodes);
  for (const slot of gone) slot.remove();
  delete root.dataset.box;
  root.style.width = "";
  if (!moving) return started;
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
  const box = linesBefore <= 1 && root.getClientRects().length <= 1;
  const width = root.getBoundingClientRect().width;
  yield;

  // 6. Write: the box at its new width.
  if (box) {
    root.dataset.box = "";
    root.style.width = `${width}px`;
  }
  yield;

  // 7. Read: the final layout.
  const rootAfter = root.getBoundingClientRect();
  const origin = layerOrigin(ghostLayer);
  const after = nodes.map((node) => node.getBoundingClientRect());
  const em = parseFloat(getComputedStyle(root).fontSize) || 16;

  // Glyphs that travel further than their slot's room go unmasked.
  const travelling = nodes.filter((node, i) => {
    const was = kept[i] ? before.get(node) : undefined;
    return (
      was !== undefined &&
      !spaceNode(node) &&
      (Math.abs(was.rect.left - after[i].left) > SLOT_PAD_X * em ||
        Math.abs(was.rect.top - after[i].top) > SLOT_PAD_Y * em)
    );
  });
  const letter = nodes.findIndex((node) => !spaceNode(node));
  const line = letter === -1 ? em * 1.2 : after[letter].height;

  // Ghost coordinates start at the layer's place in the flow, which holds
  // still on screen for the whole change, so earlier ghosts shift by however
  // far it moved, and hold theirs.
  const shiftX = originBefore.left - origin.left;
  const shiftY = originBefore.top - origin.top;
  for (const slot of slots) {
    placeSlot(slot, px(slot, "--x") + shiftX, px(slot, "--y") + shiftY);
  }

  // Edge fade (boxes only): the box before and after, and how far old ink
  // reaches past it, in layer coordinates.
  const boxStart = rootBefore.left - origin.left;
  const boxEnd = rootBefore.right - origin.left;
  const finalStart = rootAfter.left - origin.left;
  const finalEnd = rootAfter.right - origin.left;
  const inkRects = [
    ...ghostRects,
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
  yield;

  // 8. Write: everything else, attributes and styles only. Nothing below
  // reads layout or changes the DOM's structure.
  for (const node of travelling)
    node.parentElement?.setAttribute("data-travel", "");

  // A rise brings new glyphs up from below and sends old ones up and away.
  const arrive = match.trend;
  const away = match.trend === 1 ? -1 : 1;

  if (box) {
    // Width: from where it visibly was to the new width.
    const resize = { duration: o.width.duration, easing: o.width.easing };
    run(root, [{ width: `${rootBefore.width}px` }, { width: `${width}px` }], {
      ...resize,
      fill: "both",
    });
    settleTimers.set(
      root,
      window.setTimeout(() => {
        const from = layerOrigin(ghostLayer);
        for (const animation of root.getAnimations()) animation.cancel();
        delete root.dataset.box;
        root.style.width = "";
        // Back to flowing inline, the layer's place in the flow can move;
        // ghosts still leaving (and the layer's box) hold where they are.
        if (ghostLayer.childElementCount === 0) return;
        const to = layerOrigin(ghostLayer);
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
        for (const slot of Array.from(ghostLayer.children) as HTMLElement[]) {
          placeSlot(slot, px(slot, "--x") + dx, px(slot, "--y") + dy);
        }
        ghostLayer.style.setProperty(
          "--ox",
          `${px(ghostLayer, "--ox") + dx}px`,
        );
        ghostLayer.style.setProperty(
          "--oy",
          `${px(ghostLayer, "--oy") + dy}px`,
        );
      }, o.width.duration + 50),
    );

    // The box's left edge moves while it resizes (a centred pill, a
    // right-pinned button); ride the other way on the same curve.
    const ride = rootAfter.left - rootBefore.left;
    if (Math.abs(ride) > 0.5) {
      run(stage, [{ left: `${ride}px` }, { left: "0px" }], resize);
    }
  }

  const motion = { duration: o.motion.duration, easing: o.motion.easing };
  const blur = `blur(${o.blur}em)`;
  const delays = staggerDelays(
    o,
    nodes.flatMap((node, i) =>
      kept[i] || spaceNode(node) ? [] : [after[i].left - rootAfter.left],
    ),
    leaving.map(
      ({ node }) =>
        (before.get(node)?.rect.left ?? rootBefore.left) - rootBefore.left,
    ),
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
      run(
        node,
        [
          { opacity: 0, filter: blur },
          { opacity: 1, filter: "blur(0px)" },
        ],
        {
          duration: fadeIn.duration,
          easing: fadeIn.easing,
          delay: delay + fadeIn.delay,
          fill: "backwards",
        },
      );
      return;
    }
    // Centres, since scale and tilt pivot on them.
    const dx =
      was.rect.left + was.rect.width / 2 - (after[i].left + after[i].width / 2);
    const dy =
      was.rect.top + was.rect.height / 2 - (after[i].top + after[i].height / 2);
    if (
      Math.abs(dx) > 0.5 ||
      Math.abs(dy) > 0.5 ||
      was.scale !== "1" ||
      was.rotate !== "0deg"
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
    if (was.opacity < 0.999 || was.filter !== "blur(0px)") {
      run(
        node,
        [
          { opacity: was.opacity, filter: was.filter },
          { opacity: 1, filter: "blur(0px)" },
        ],
        { duration: fadeIn.duration, easing: fadeIn.easing },
      );
    }
  });

  // Leaving glyphs sit at the place they had in the layout, and start from
  // wherever they were drawn.
  for (const { slot, home } of newSlots) {
    placeSlot(slot, home.left - origin.left, home.top - origin.top);
  }

  // Size the layer around every slot (a mask cuts whatever falls outside
  // its element) and, when the edge fade is armed, the band's reach.
  const allSlots = [...slots, ...newSlots.map((s) => s.slot)];
  if (allSlots.length === 0) {
    disarm(ghostLayer);
    ghostLayer.style.width = "";
    ghostLayer.style.height = "";
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
    // Drawn where it was: the offset its animation had it at.
    const dx =
      was.rect.left + was.rect.width / 2 - (home.left + home.width / 2);
    const dy =
      was.rect.top + was.rect.height / 2 - (home.top + home.height / 2);
    const move = run(
      node,
      [
        { translate: `${dx}px ${dy}px`, scale: was.scale, rotate: was.rotate },
        awayState(o, kind, away, line),
      ],
      // Both: its starting place holds through the stagger delay too.
      { ...motion, delay, fill: "both" },
    );
    const out = run(
      node,
      [
        { opacity: was.opacity, filter: was.filter },
        { opacity: 0, filter: blur },
      ],
      {
        duration: fadeOut.duration,
        easing: fadeOut.easing,
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
        ghostLayer.replaceChildren();
        clearLayer(ghostLayer);
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
  options?: Partial<TextMorphOptions>;
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
  /** Swap without animating when the reader prefers reduced motion. */
  respectReducedMotion?: boolean;
  /** A change started animating. */
  onAnimationStart?: () => void;
  /**
   * A change finished, every glyph and the box settled. Fires right away
   * for a change that didn't animate (disabled, reduced motion, off screen).
   * Each change ends in exactly one of this and `onAnimationCancel`.
   */
  onAnimationComplete?: () => void;
  /** A change was interrupted by the next one. */
  onAnimationCancel?: () => void;
  /**
   * For a field someone is typing in: where the caret sits in `value` after
   * the edit. Glyphs are matched around it, so typing 1 in front of 20
   * inserts a digit instead of renumbering the column. Leave it unset for
   * values that change on their own.
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
  // Set once: after that this component owns the glyph markup.
  const [initialHtml] = React.useState(() => ({ __html: glyphsHtml(value) }));
  const shown = React.useRef(value);
  const resolved = resolveOptions(options);
  const optionsRef = React.useRef(resolved);
  const latest = React.useRef({
    disabled,
    respectReducedMotion,
    onAnimationStart,
    onAnimationComplete,
    onAnimationCancel,
    cursorIndex,
  });
  React.useLayoutEffect(() => {
    optionsRef.current = resolved;
    latest.current = {
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

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const glyphs = glyphsRef.current;
    const ghosts = ghostsRef.current;
    if (!root || !stage || !glyphs || !ghosts || value === shown.current)
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
      if (over) return;
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
        value,
        optionsRef.current,
        { decimal: decimalFor(locale), caret: current.cursorIndex },
        // Read in the batch's first read phase, with the others.
        () => !current.disabled && !reduce && isOnScreen(root),
      ),
      done: (started) => {
        if (over) return;
        if (started.length === 0) {
          over = true;
          if (inFlight.current === cancel) inFlight.current = null;
          latest.current.onAnimationComplete?.();
          return;
        }
        latest.current.onAnimationStart?.();
        void Promise.allSettled(started.map((a) => a.finished)).then(() => {
          if (over) return;
          over = true;
          if (inFlight.current === cancel) inFlight.current = null;
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
        <span ref={stageRef} aria-hidden="true" className="text-morph-stage">
          <span
            ref={glyphsRef}
            className="text-morph-glyphs"
            dangerouslySetInnerHTML={initialHtml}
          />
          <span ref={ghostsRef} className="text-morph-ghosts" />
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

export type { TextMorphMode, TextMorphOptions } from "./lib/options";
