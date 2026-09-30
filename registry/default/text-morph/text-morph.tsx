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
  type ResolvedOptions,
  type TextMorphMode,
  type TextMorphOverrides,
} from "./lib/options";
import {
  HOME,
  awayState,
  fadesFor,
  staggerDelays,
  stillOptions,
} from "./lib/timing";
import {
  GROUP_FADE_IN,
  GROUP_FADE_OUT,
  GROUP_SCALE,
  planRuns,
  planShapes,
  type Shape,
} from "./lib/shapes";
import { planTrips, rollWith, type Trip } from "./lib/anchors";
import {
  anchorHint,
  centreDelta,
  contentSize,
  inkEscapes,
  isOnScreen,
  lineCount,
  sizeOf,
  visibleBounds,
  visualState,
  type Bounds,
  type Side,
} from "./lib/measure";
import { scheduleMorph, type MorphSteps } from "./lib/scheduler";
import { armMark, arrivalClip, edgeBand, readArm, type Arm } from "./lib/edges";
import { followShare, ownShift } from "./lib/ride";
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
 * glyph always arrives fresh, even where its own text is still leaving, so
 * quick changes look like slow ones. The slots fade only while a change
 * plays (`data-playing`); at rest they're inert wrappers.
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
 * change plays, taking no space of its own. Only a glyph that rolls or is
 * drawn off its line has its slot fade (`data-fade`), so glyphs that hold
 * still carry no mask. One moving to another line turns the fade off
 * (`data-travel`); one sliding along its line gets room beside it for the
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

/** Its scale's pivot, written only when it changes. */
function setOrigin(node: HTMLElement, origin: string): void {
  if (node.style.transformOrigin !== origin) {
    node.style.transformOrigin = origin;
  }
}

/** Share of its fade a glyph interrupted mid-fade takes to finish. */
const CATCH_UP = 0.25;

/**
 * How a change plays: in full, as a crossfade only (the reader prefers
 * reduced motion: remove the movement, keep the change visible), or not at
 * all (disableAnimation, or nobody can see it).
 */
type Playback = "full" | "reduced" | "none";

/** The edge fade's ramp, and how far past the box edge it ends (em). */
const EDGE_RAMP = 0.3;
const EDGE_SLACK = 0.4;
/** Room around a ghost for its blur, tilt and scale (em). */
const INK_MARGIN = 0.3;
/**
 * A ghost slot's room beside its glyph (em), for tilt, scale and blur: the
 * CSS gives `.text-morph-ghost` the same padding.
 */
const SLOT_PAD_X = 0.5;
/**
 * Its room above and below (em): roll's, and at least what morph's minimum
 * slot height (1.4em, in the CSS) adds in a tight line height.
 */
const SLOT_PAD_Y = 0.3;
const SLOT_MIN_HEIGHT = 1.4;
/** A kept glyph whose top moves further than this (em) changes line. */
const LINE_CHANGE = 0.3;

/**
 * A ghost slot's glyph box and trip (layer coordinates), for sizing the layer
 * around every ghost. Only --x/--y reach the CSS.
 */
type GhostBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  tripX: number;
  tripY: number;
};
const ghostBoxes = new WeakMap<HTMLElement, GhostBox>();

/** A ghost slot at x/y (its glyph's box, layer coordinates). */
function placeSlot(
  slot: HTMLElement,
  box: GhostBox,
  x: number,
  y: number,
): void {
  box.x = x;
  box.y = y;
  slot.style.setProperty("--x", `${x}px`);
  slot.style.setProperty("--y", `${y}px`);
}

/** Lift the edge fade (its band animation already cancelled). */
function disarm(ghostLayer: HTMLElement): void {
  ghostLayer.style.removeProperty("--text-morph-edge");
  delete ghostLayer.dataset.armedStart;
  delete ghostLayer.dataset.armedEnd;
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
 * Where each label was last seen pinned as it resized (0 start, 1 end, 0.5
 * centred), from how far each edge travelled: what a roll run's travel is
 * measured against.
 */
const anchors = new WeakMap<HTMLElement, number>();

/** Tags a label's current resize, so an older one can't release it. */
let sizings = 0;
/** Tags a label's current edge clip, so an older change can't lift it. */
let edgeClips = 0;

/** A label's parts: the root, the stage that rides, and its two layers. */
type MorphElements = {
  root: HTMLElement;
  stage: HTMLElement;
  glyphLayer: HTMLElement;
  /** Holds still where the value starts; ghost coordinates count from it. */
  ghostAnchor: HTMLElement;
  ghostLayer: HTMLElement;
};

function* morphTo(
  { root, stage, glyphLayer, ghostAnchor, ghostLayer }: MorphElements,
  value: string,
  options: ResolvedOptions,
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

  // 1. Read: where everything is on screen right now, and what's running.
  const play = playback();
  const animations = root.getAnimations({ subtree: true });
  if (play === "none") {
    yield;
    // Write: swapped without a change to watch, so nothing is measured.
    // Everything running stops, an earlier change's ghosts and edge fade
    // included.
    for (const animation of animations) animation.cancel();
    layOut(glyphLayer, next.map(createGlyph));
    delete root.dataset.sizing;
    stage.style.left = "";
    delete root.dataset.edgeClip;
    delete glyphLayer.dataset.playing;
    ghostLayer.replaceChildren();
    resetLayer(ghostLayer);
    return started;
  }
  const reduced = play === "reduced";
  const o = reduced ? stillOptions(options) : options;
  const rootBefore = root.getBoundingClientRect();
  const styleBefore = getComputedStyle(root);
  const startBefore = parseFloat(styleBefore.marginInlineStart) || 0;
  const linesBefore = lineCount(glyphLayer);
  // A label laid out as a box (a block, an inline-block, a flex item) can
  // take a height, so a change that adds or removes a line eases it. An inline label's height is its lines'.
  const boxed = styleBefore.display !== "inline";
  const heightBefore = sizeOf(styleBefore, rootBefore, "height");
  const originBefore = ghostAnchor.getBoundingClientRect();
  const before = old.map(visualState);
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
    const box = ghostBoxes.get(slot);
    return node instanceof HTMLElement && box
      ? [{ slot, node, box, drawn: visualState(node) }]
      : [];
  });

  // The new glyph list.
  const match = matchText(
    o.mode,
    old.map((node) => node.textContent ?? ""),
    next,
    {
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
      : [{ node, kind: match.oldKinds[i], index: i, was: before[i] }],
  );
  const nodes = next.map((glyph, i) => kept[i] ?? createGlyph(glyph));

  // What to stop: everything on the glyphs, their slots and the label, but
  // not earlier ghosts, which carry on leaving. Found here with the reads:
  // asking for animations flushes style, which in step 2 would restyle once
  // per label.
  const slotOf = (node: HTMLElement): HTMLElement[] => {
    const slot = node.parentElement;
    return slot?.classList.contains("text-morph-slot") ? [slot] : [];
  };
  const stops = new Set<Element>([
    ...nodes,
    ...leaving.map((l) => l.node),
    ...nodes.flatMap(slotOf),
    ...leaving.flatMap((l) => slotOf(l.node)),
    stage,
    root,
    ghostLayer,
  ]);
  const keptNodes = new Set(kept.filter((node) => node !== null));
  const stopping: Animation[] = [];
  // A kept glyph's roll in progress, kept to carry on (step 8) if its place
  // doesn't change: restarted from where it's drawn, a held key sent every
  // digit still settling off again on a fresh curve each press, lurching
  // forward, and one within half a pixel of home snapped there.
  const rolling = new Map<
    HTMLElement,
    { keyframes: Keyframe[]; timing: EffectTiming; time: CSSNumberish | null }[]
  >();
  for (const animation of animations) {
    const effect = animation.effect as KeyframeEffect | null;
    const target = effect?.target;
    if (!effect || !target || !stops.has(target)) continue;
    stopping.push(animation);
    if (!(target instanceof HTMLElement) || !keptNodes.has(target)) continue;
    const keyframes = effect.getKeyframes();
    if (!keyframes.some((k) => "translate" in k)) continue;
    const rolls = rolling.get(target) ?? [];
    rolls.push({
      keyframes,
      timing: effect.getTiming(),
      time: animation.currentTime,
    });
    rolling.set(target, rolls);
  }
  yield;

  // 2. Write: stop what's running (a style change, not a structural one).
  for (const animation of stopping) animation.cancel();
  yield;

  // 3. Read: where leaving glyphs sit in the layout, with nothing moving
  // them.
  const homes = leaving.map(({ node }) => node.getBoundingClientRect());
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
  delete root.dataset.edgeClip;
  for (const slot of gone) slot.remove();
  // The slots fade from step 8 on, while this change plays.
  delete glyphLayer.dataset.playing;
  // Leaving glyphs move into slots in the ghost layer (placed in step 8).
  const newSlots = leaving.map((glyph, k) => {
    const home = homes[k];
    const slot = document.createElement("span");
    slot.className = "text-morph-ghost";
    slot.append(glyph.node);
    ghostLayer.append(slot);
    const box: GhostBox = {
      x: 0,
      y: 0,
      width: home.width,
      height: home.height,
      tripX: 0,
      tripY: 0,
    };
    ghostBoxes.set(slot, box);
    return { ...glyph, slot, box, home };
  });
  yield;

  // 5. Read: a change that stays on one line is animated as a box; one that
  // wraps keeps its lines as they fall. An empty value has no line box at
  // all; it counts as one line.
  const oneLine = lineCount(glyphLayer) <= 1;
  const easesAsBox = !reduced && linesBefore <= 1 && oneLine;
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
    const was = kept[i] ? before[match.kept[i]] : undefined;
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
  // `down`: digits fall in from above and leave downward while a
  // number's other marks arrive from below, so each reads as its own event.
  const rise = match.trend === 1;
  const marksRise = o.mode === "morph" && o.trend === "down";
  const arriveFor = (glyph: string): 1 | -1 =>
    rise || (marksRise && !isDigit(glyph)) ? 1 : -1;
  const away = rise ? -1 : 1;

  // What arrives or leaves travels with its nearest surviving neighbour
  // on its line, looking before it first when arriving and after it
  // first when leaving. Its slot takes the trip and the glyph its own
  // entrance inside it, so a digit rolls within a
  // number that moves line, where adding the two up cancelled them (a
  // morph digit rolls exactly one line). Morph and blend anchor everything; roll
  // only digits, to the rest of their own number, and only across lines:
  // its glyphs still roll in place on their line (a number that resizes
  // doesn't drag them after its `$`), and a number that moves to another
  // line takes its digits with it.
  //
  // Morph also scales a whole word arriving or leaving about its own
  // centre, as one shape; in a one-word value, only a run of GROUP_MIN or
  // more replaced glyphs, further and faster.
  // Blend plans too: each changed run of letters scales about its centre.
  const shaping = (o.mode === "morph" || o.mode === "blend") && !reduced;
  // How far each survivor moved in the layout, from its old place to its
  // final one. The layout, not where it's drawn: a digit still falling in is drawn above its
  // place, and anchoring the next one to that stacked each fall on the
  // last, so typing fast brought digits in from ever higher.
  const startsAt = new Map<number, [number, number]>();
  nodes.forEach((node, i) => {
    const home = kept[i] && !spaceNode(node) ? keptHomes.get(node) : null;
    if (home) startsAt.set(i, centreDelta(home, after[i]));
  });
  const isArriving = (i: number): boolean => !kept[i] && !spaceNode(nodes[i]);
  const shapes = new Map<HTMLElement, Shape>();
  if (shaping) {
    // Planned by index (lib/shapes), then kept by node.
    const plan = (
      glyphs: HTMLElement[],
      changed: (i: number) => boolean,
      kinds: GlyphKind[],
      boxOf: (i: number) => DOMRect | undefined,
    ): void => {
      const isSpace = (i: number): boolean => spaceNode(glyphs[i]);
      // Blend: each changed run, letters or digits, whole word or not.
      // Morph: whole words and long runs.
      const planned =
        o.mode === "blend"
          ? planRuns({
              count: glyphs.length,
              isSpace,
              changed,
              boxOf,
            })
          : planShapes({
              count: glyphs.length,
              isSpace,
              changed,
              kinds,
              byWords: match.byWords,
              boxOf,
            });
      for (const [i, shape] of planned) shapes.set(glyphs[i], shape);
    };
    plan(nodes, isArriving, match.nextKinds, (i) => after[i]);
    const homeAt = new Map(newSlots.map(({ index, home }) => [index, home]));
    plan(
      old,
      (i) => homeAt.has(i),
      match.oldKinds,
      (i) => homeAt.get(i),
    );
  }
  // Arriving and leaving glyphs travel with their neighbours (lib/anchors),
  // planned by index, then leaving ones kept by node.
  const trips = planTrips({
    mode: o.mode,
    reduced,
    line,
    kept: match.kept,
    nextKinds: match.nextKinds,
    oldKinds: match.oldKinds,
    moves: startsAt,
    nextTop: (i) => after[i]?.top,
    keptTop: (i) => keptHomes.get(old[i])?.top,
    arriving: isArriving,
    leaving: newSlots.map(({ index, home }) => ({ index, top: home.top })),
    grouped: (side, i) =>
      shapes.get(side === "next" ? nodes[i] : old[i])?.group ?? false,
  });
  const arrivals = trips.arrivals;
  // What holds the value, read at most once per change: it walks every
  // ancestor, pseudo-elements too.
  let seenBounds: Bounds | undefined;
  const visible = (): Bounds => (seenBounds ??= visibleBounds(root));
  // Arriving text carried in from past the edge a reader sees around the
  // value (a right-pinned button's: `Copied` → `Copy page` brings `page`
  // in from past its right edge) stays hidden past that edge while the
  // change plays, the way leaving text carried out dissolves there under the
  // edge fade. Blend needs it: its new text shows from its first frame,
  // where morph's waits 100ms, by when it has come most of the way in.
  // Clipped, since a mask can't hide what's outside its element.
  const edgeClip =
    o.mode === "blend" &&
    easesAsBox &&
    o.edgeFade !== "never" &&
    arrivals.size > 0
      ? arrivalClip(
          [...arrivals].map(([i, [dx]]) => ({
            left: after[i].left + dx,
            right: after[i].right + dx,
          })),
          visible(),
          rootBefore,
          rootAfter,
        )
      : null;
  const departures = new Map<HTMLElement, Trip>();
  for (const { node, index } of newSlots) {
    const trip = trips.departures.get(index);
    if (trip) departures.set(node, trip);
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
  const carried = leaving.flatMap(({ node, was }) => {
    const trip = departures.get(node);
    const { x, y, width, height } = was.rect;
    return trip ? [new DOMRect(x + trip[0], y + trip[1], width, height)] : [];
  });
  const inkRects = [
    ...ghosts.map((g) => g.drawn.rect),
    ...leaving.map((l) => l.was.rect),
    ...carried,
  ];
  // The glyph boxes decide whether ink sticks out; the room also covers
  // their blur and tilt.
  const glyphStart =
    Math.min(Infinity, ...inkRects.map((r) => r.left)) - origin.left;
  const glyphEnd =
    Math.max(-Infinity, ...inkRects.map((r) => r.right)) - origin.left;
  // How the last change armed each edge, for its ghosts still leaving: a
  // band held at the container's edge stays there (kept on screen, since
  // layer coordinates move) and one following the box keeps following it.
  const wasArmed = (side: Side): Arm =>
    readArm(
      side === "start"
        ? ghostLayer.dataset.armedStart
        : ghostLayer.dataset.armedEnd,
      origin.left,
    );
  // How each edge fades: not at all, following the box's edge (a neighbour
  // moves with it), or held at the container's edge (layer coordinates):
  // there only ink crossing it needs fading, and a band following the box
  // swept across letters still well inside (clearing a long value).
  const armed = (side: Side): Arm => {
    if (!easesAsBox || o.edgeFade === "never" || inkRects.length === 0) {
      return false;
    }
    const held = wasArmed(side);
    if (held !== false) return held;
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
      visible,
    );
    if (escapes === false) return false;
    return escapes === "neighbour" ? "box" : escapes - origin.left;
  };
  const armStart = armed("start");
  const armEnd = armed("end");
  // The space it takes eases from what it visibly took (its box plus any
  // start margin still easing) to its new width.
  const from = easesAsBox
    ? rootBefore.width + (startBefore - startAfter) - rootAfter.width
    : 0;
  const resizes = Math.abs(from) > 0.5;
  // A box eases its width, and the stage rides by a
  // share of it in CSS (step 8). An inline label can't take a width, so it
  // eases its start margin, and the stage rides against the move by the
  // margin's exact value.
  const widthAfter = sizeOf(styleAfter, rootAfter, "width");
  // What the stage's percentages count: the label's content box.
  const contentAfter = contentSize(styleAfter, rootAfter, "width");
  const sizeProp = boxed ? "width" : "marginInlineStart";
  const sizeTo = boxed ? widthAfter : startAfter;
  yield;

  // 6. Write: the label at the start of its resize.
  const authorSize = root.style[sizeProp];
  const authorHeight = root.style.height;
  if (resizes) root.style[sizeProp] = `${sizeTo + from}px`;
  // Its text sits at its start while it resizes (text-align in the CSS), so
  // the stage's ride alone places it, whichever way the width goes.
  if (resizes && boxed) root.dataset.sizing = "";
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
    const rootRtl = styleAfter.direction === "rtl";
    const startTravel = rootRtl ? rightTravel : leftTravel;
    const travel = leftTravel + rightTravel;
    if (travel > 0.5) anchors.set(root, startTravel / travel);
  }
  yield;

  // 8. Write: everything else, attributes and styles only. Nothing below
  // reads layout or changes the DOM's structure.
  root.style[sizeProp] = authorSize;
  root.style.height = authorHeight;
  glyphLayer.dataset.playing = "";
  const clip = edgeClip === null ? null : String(++edgeClips);
  if (clip !== null && edgeClip !== null) {
    root.dataset.edgeClip = clip;
    root.style.setProperty("--text-morph-clip", edgeClip);
  }
  for (const { slot, box } of ghosts) {
    placeSlot(slot, box, box.x + shiftX, box.y + shiftY);
  }
  for (const node of changesLine) {
    node.parentElement?.setAttribute("data-travel", "");
  }
  for (const { node, box } of newSlots) {
    const [dx, dy] = departures.get(node) ?? [0, 0];
    box.tripX = Math.ceil(Math.abs(dx));
    box.tripY = Math.ceil(Math.abs(dy));
  }
  for (const [node, room] of reach) {
    node.parentElement?.style.setProperty("--reach", `${room}px`);
  }

  if (resizes) {
    const resize = { duration: o.width.duration, easing: o.width.easing };
    // While its space eases open, the value stays on one line. No-wrap
    // changes line breaking, not display, and the value sits on one line
    // either way.
    const sizing = String(++sizings);
    root.dataset.sizing = sizing;
    const ease = run(
      root,
      [{ [sizeProp]: `${sizeTo + from}px` }, { [sizeProp]: `${sizeTo}px` }],
      resize,
    );
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
  const ownX = resizes && !boxed ? ownShift(from, measuredX) : undefined;
  // A box whose glyphs move with its width rides by that share of its width
  // as it eases, in CSS.
  const follows = boxed && resizes ? followShare(from, measuredX) : undefined;
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
  // A glyph in a shape slides toward its centre as it scales, out of its
  // slot, whose fade would cut it off; it doesn't roll, so it goes unmasked.
  // So does one in a blend run, scaling about the run's centre.
  const unmaskedBy = (shape: Shape | undefined): boolean =>
    shape !== undefined && (shape.group || o.mode === "blend");
  // Where an arriving glyph starts, or a leaving one ends: a group recedes
  // about its centre; anything else takes its mode's entrance, rolling
  // with its trip.
  const awayFor = (
    shape: Shape | undefined,
    kind: GlyphKind,
    trip: Trip | undefined,
    direction: 1 | -1,
  ): Keyframe =>
    shape?.group
      ? { translate: "0 0", scale: String(GROUP_SCALE), rotate: "0deg" }
      : awayState(o, kind, rollWith(trip, direction, line), line);
  // A filter animates only when there's blur to show: morph's default has
  // none, and a filter animation per glyph costs even when it changes
  // nothing.
  const blur = o.blur > 0 ? `blur(${o.blur}em)` : null;
  const fade = (opacity: number, filter: string | null): Keyframe =>
    filter === null ? { opacity } : { opacity, filter };
  const sharp = (filter: string | null): string | null =>
    filter === null ? null : "blur(0px)";
  const lineStart = (rect: DOMRect, bounds: DOMRect): number =>
    rtl ? bounds.right - rect.right : rect.left - bounds.left;
  const delays = staggerDelays(
    o,
    nodes.flatMap((node, i) =>
      kept[i] || spaceNode(node) ? [] : [lineStart(after[i], rootAfter)],
    ),
    leaving.map(({ was }) => lineStart(was.rect, rootBefore)),
  );

  // Shared glyphs slide from wherever they were, including mid-animation.
  let entering = 0;
  nodes.forEach((node, i) => {
    if (spaceNode(node)) return;
    const was = kept[i] ? before[match.kept[i]] : undefined;
    const kind = match.nextKinds[i];
    const { fadeIn } = fadesFor(o, kind);
    // Scale pivots on the glyph's own centre unless it arrives in a shape.
    const shape = shapes.get(node);
    setOrigin(node, shape?.origin ?? "");
    const unmasked = unmaskedBy(shape);
    if (unmasked) node.parentElement?.setAttribute("data-travel", "");
    // Only what rolls, or is drawn off its line, fades in its slot.
    const fadesInSlot = (): void => {
      if (!unmasked) node.parentElement?.setAttribute("data-fade", "");
    };
    if (!was) {
      fadesInSlot();
      const delay = delays.entering[entering++];
      const awayFrame = awayFor(
        shape,
        kind,
        arrivals.get(i),
        arriveFor(next[i]),
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
          // With its neighbour from the start: the stagger delays its own
          // entrance, not the trip, or it lagged behind the neighbour it
          // travels with (a swept `!` ran over the `d` before it).
          { ...motion, fill: "backwards" },
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
      fadesInSlot();
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
      // A slide along its line needs no fade; drawn off it (mid-roll,
      // scaled or tilted) it does.
      if (Math.abs(dy) > 0.5 || was.scale !== "1" || was.rotate !== "0deg") {
        fadesInSlot();
      }
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
        // Roll: on the box's curve, not the roll's spring, or a
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
    // held key) crawling in, so it snaps to full in one frame instead.
    const blurred = was.filter !== "blur(0px)" ? was.filter : null;
    if (was.opacity < 0.999 || blurred !== null) {
      const left = Math.max(1 - was.opacity, blurred !== null ? CATCH_UP : 0);
      run(node, [fade(was.opacity, blurred), fade(1, sharp(blurred))], {
        duration: fadeIn.duration * Math.min(left, CATCH_UP),
        easing: fadeIn.easing,
      });
    }
  });

  // Leaving glyphs sit at the place they had in the layout, and start from
  // wherever they were drawn.
  for (const { slot, box, home } of newSlots) {
    placeSlot(slot, box, home.left - origin.left, home.top - origin.top);
  }

  // Size the layer around every slot (a mask cuts whatever falls outside
  // its element) and, when the edge fade is armed, the band's reach.
  const boxes = [...ghosts, ...newSlots].map((g) => g.box);
  if (boxes.length === 0) {
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
  for (const { x, y, width, height, tripX, tripY } of boxes) {
    const room = padX + tripX + INK_MARGIN * em;
    const roomY = padY + tripY;
    minX = Math.min(minX, x - room);
    maxX = Math.max(maxX, x + width + room);
    minY = Math.min(minY, y - roomY);
    maxY = Math.max(maxY, y + height + roomY);
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
    // The mask's band for a box spanning start..end (layer coordinates).
    const maskAt = (start: number, end: number): Keyframe => {
      const { left, right } = edgeBand(
        start,
        end,
        { start: armStart, end: armEnd },
        { left: ox, width: layerWidth },
        slack,
      );
      return {
        maskPosition: `${left}px 0`,
        maskSize: `${right - left}px 100%`,
      };
    };
    const markStart = armMark(armStart, origin.left);
    const markEnd = armMark(armEnd, origin.left);
    if (markStart === undefined) delete ghostLayer.dataset.armedStart;
    else ghostLayer.dataset.armedStart = markStart;
    if (markEnd === undefined) delete ghostLayer.dataset.armedEnd;
    else ghostLayer.dataset.armedEnd = markEnd;
    ghostLayer.style.setProperty(
      "--text-morph-edge",
      `linear-gradient(to right, ${armStart !== false ? `transparent, #000 ${ramp}px` : "#000"}, ${
        armEnd !== false ? `#000 calc(100% - ${ramp}px), transparent` : "#000"
      })`,
    );
    run(ghostLayer, [maskAt(boxStart, boxEnd), maskAt(finalStart, finalEnd)], {
      duration: o.width.duration,
      easing: o.width.easing,
      fill: "forwards",
    });
  } else {
    disarm(ghostLayer);
  }

  newSlots.forEach(({ slot, node, kind, home, was }, i) => {
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
    if (unmaskedBy(shape)) slot.setAttribute("data-travel", "");
    // It leaves the way its trip goes.
    const awayFrame = awayFor(shape, kind, departures.get(node), away);
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
        // With its neighbour from the start, whatever its own delay.
        { ...motion, fill: "both" },
      );
    }
    const blurred = was.filter !== "blur(0px)" ? was.filter : null;
    // One caught before it showed (still in its fade-in delay) leaves from
    // full: leaving from nothing, a run of quick changes (spam
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
  if (clip !== null) {
    const lift = (): void => {
      if (root.dataset.edgeClip === clip) delete root.dataset.edgeClip;
    };
    void Promise.allSettled(started.map((a) => a.finished)).then(lift);
  }
  return started;
}

export type TextMorphProps = Omit<
  useRender.ComponentProps<"span">,
  "children"
> & {
  /** The text. A number is formatted with `locale` and `format`. */
  value: string | number;
  /** How changes animate; each mode brings its own defaults. */
  mode?: TextMorphMode;
  /**
   * How long movement takes, in ms: the mode's whole clock (fades, width,
   * stagger) scales with it, so the look holds. Shorter for labels that
   * answer a click or mirror typing.
   */
  duration?: number;
  /**
   * Fine tuning: any option, nested fields included, over the mode's
   * defaults (`MODE_DEFAULTS`).
   */
  options?: TextMorphOverrides;
  /**
   * The locale a number `value` is formatted in, and whose decimal
   * separator numbers in a string `value` are aligned on. Fixed rather than
   * the browser's, so the server and the browser render the same text.
   */
  locale?: string;
  /** How a number `value` is formatted (`Intl.NumberFormat` options). */
  format?: Intl.NumberFormatOptions;
  /** Swap the text without animating. */
  disableAnimation?: boolean;
  /**
   * When changes crossfade in place instead (nothing travels, scales,
   * tilts, blurs or resizes): `user` when the reader prefers reduced
   * motion, `always`, or `never`.
   */
  reducedMotion?: "user" | "always" | "never";
  /** A change started animating. */
  onMorphStart?: () => void;
  /**
   * A change finished, every glyph and the box settled. Fires right away
   * for a change that didn't animate (`disableAnimation`, off screen). Each
   * change ends in exactly one of this and `onMorphCancel`, unless the label
   * unmounts or is hidden first.
   */
  onMorphComplete?: () => void;
  /** A change was interrupted by the next one. */
  onMorphCancel?: () => void;
  /**
   * For a field someone is typing in: where the caret sits in `value` after
   * the edit, as a string index (an input's `selectionStart`). Glyphs are
   * matched around it, so typing 1 in front of 20 inserts a digit instead of
   * renumbering the column. Leave it unset for values that change on their
   * own.
   */
  cursorIndex?: number;
};

/** One formatter per locale and format: making one is Intl's slow part. */
const formatters = new Map<string, Intl.NumberFormat>();

function formatValue(
  value: string | number,
  locale: string,
  format: Intl.NumberFormatOptions | undefined,
): string {
  if (typeof value === "string") return value;
  const key = `${locale}|${format ? JSON.stringify(format) : ""}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, format);
    formatters.set(key, formatter);
  }
  return formatter.format(value);
}

function TextMorph({
  value: rawValue,
  mode = "blend",
  duration,
  options,
  locale = "en",
  format,
  disableAnimation = false,
  reducedMotion = "user",
  onMorphStart,
  onMorphComplete,
  onMorphCancel,
  cursorIndex,
  className,
  render,
  ...props
}: TextMorphProps): React.ReactElement {
  const value = formatValue(rawValue, locale, format);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const stageRef = React.useRef<HTMLSpanElement>(null);
  const glyphsRef = React.useRef<HTMLSpanElement>(null);
  const ghostAnchorRef = React.useRef<HTMLSpanElement>(null);
  const ghostLayerRef = React.useRef<HTMLSpanElement>(null);
  // Set once: after that this component owns the glyph markup.
  const [initialHtml] = React.useState(() => ({ __html: glyphsHtml(value) }));
  const shown = React.useRef(value);
  const resolved = resolveOptions(mode, options, duration);
  const latest = React.useRef({
    options: resolved,
    disableAnimation,
    reducedMotion,
    onMorphStart,
    onMorphComplete,
    onMorphCancel,
    cursorIndex,
  });
  React.useLayoutEffect(() => {
    latest.current = {
      options: resolved,
      disableAnimation,
      reducedMotion,
      onMorphStart,
      onMorphComplete,
      onMorphCancel,
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
    const glyphLayer = glyphsRef.current;
    const ghostAnchor = ghostAnchorRef.current;
    const ghostLayer = ghostLayerRef.current;
    if (
      !root ||
      !stage ||
      !glyphLayer ||
      !ghostAnchor ||
      !ghostLayer ||
      value === shown.current
    )
      return;
    shown.current = value;
    inFlight.current?.cancel();
    inFlight.current = null;

    const current = latest.current;
    const reduce =
      current.reducedMotion === "always" ||
      (current.reducedMotion === "user" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let over = false;
    let silent = false;
    const handle = {
      cancel: (): void => {
        if (over) return;
        over = true;
        if (!silent) latest.current.onMorphCancel?.();
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
      delete glyphLayer.dataset.playing;
      delete root.dataset.animating;
      if (!silent) latest.current.onMorphComplete?.();
    };
    scheduleMorph({
      root,
      steps: morphTo(
        { root, stage, glyphLayer, ghostAnchor, ghostLayer },
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
        root.dataset.animating = "";
        if (!silent) latest.current.onMorphStart?.();
        void Promise.allSettled(started.map((a) => a.finished)).then(settle);
      },
    });
  }, [value, locale]);

  const defaultProps = {
    "data-slot": "text-morph",
    "data-mode": mode,
    className: cn(className),
    children: (
      <>
        {/* Keyed by the value: a page machine-translated in place swaps
            this text for its own nodes, which React would then leave
            stale. Remounted, the copy screen readers hear stays current. */}
        <span key={value} className="sr-only">
          {value}
        </span>
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
          <span ref={ghostAnchorRef} className="text-morph-ghosts">
            <span ref={ghostLayerRef} className="text-morph-ghost-sheet" />
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
export { MODE_DEFAULTS } from "./lib/options";
export type {
  TextMorphMode,
  TextMorphOptions,
  TextMorphOverrides,
  TextMorphTiming,
} from "./lib/options";
