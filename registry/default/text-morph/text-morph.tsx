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
 * The box width eases with a CSS transition, which always retargets from its
 * current value. When the box resizes, a pinned or centred container moves
 * its left edge; the stage rides the opposite way on the same curve, so the
 * glyphs never drift with it.
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

function glyphsHtml(text: string): string {
  return graphemes(text)
    .map((g) => `<span data-glyph>${escapeHtml(g)}</span>`)
    .join("");
}

function createGlyph(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.setAttribute("data-glyph", "");
  span.textContent = text;
  return span;
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

/** A ghost's place in stage coordinates, kept in custom properties. */
function ghostPlace(node: HTMLElement): { x: number; y: number } {
  return {
    x: parseFloat(node.style.getPropertyValue("--x")) || 0,
    y: parseFloat(node.style.getPropertyValue("--y")) || 0,
  };
}
function placeGhost(node: HTMLElement, x: number, y: number): void {
  node.style.setProperty("--x", `${x}px`);
  node.style.setProperty("--y", `${y}px`);
}

/** Lift the edge fade once the last ghost has left. */
function disarm(ghostLayer: HTMLElement): void {
  for (const animation of ghostLayer.getAnimations()) animation.cancel();
  ghostLayer.style.removeProperty("--text-morph-edge");
  delete ghostLayer.dataset.armed;
}

function morphTo(
  root: HTMLElement,
  stage: HTMLElement,
  glyphLayer: HTMLElement,
  ghostLayer: HTMLElement,
  value: string,
  o: TextMorphOptions,
  decimal: string,
  animate: boolean,
): Animation[] {
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
  const old = Array.from(glyphLayer.children) as HTMLElement[];
  const next = graphemes(value);

  // 1. Where everything is on screen right now.
  const rootBefore = root.getBoundingClientRect();
  const stageBefore = stage.getBoundingClientRect();
  const before = new Map(old.map((node) => [node, visualState(node)]));
  const ghosts = Array.from(ghostLayer.children) as HTMLElement[];
  const ghostRects = ghosts.map((node) => node.getBoundingClientRect());

  // 2. New glyph list.
  const match = matchText(
    o.mode,
    old.map((node) => node.textContent ?? ""),
    next,
    { numbers: o.numbers, decimal, trend: o.trend },
  );
  const used = new Set(match.kept);
  const kept = match.kept.map((from) => (from === -1 ? null : old[from]));
  const removed = old.filter((_, i) => !used.has(i));
  const removedKinds = old.flatMap((_, i) =>
    used.has(i) ? [] : [match.oldKinds[i]],
  );
  const nodes = next.map((glyph, i) => kept[i] ?? createGlyph(glyph));
  for (const node of [...nodes, ...removed, stage]) {
    for (const animation of node.getAnimations()) animation.cancel();
  }
  glyphLayer.replaceChildren(...nodes);

  window.clearTimeout(settleTimers.get(root));
  if (!animate) {
    root.style.transition = "";
    root.style.width = "";
    return started;
  }

  // 3. The final layout: the box at its new width, no ride.
  root.style.transition = "none";
  root.style.width = "";
  const width = glyphLayer.getBoundingClientRect().width;
  root.style.width = `${width}px`;
  const rootAfter = root.getBoundingClientRect();
  const stageAfter = stage.getBoundingClientRect();
  const after = nodes.map((node) => node.getBoundingClientRect());
  const line = glyphLayer.getBoundingClientRect().height;
  const em = parseFloat(getComputedStyle(root).fontSize) || 16;

  // Ghosts live in stage coordinates; the stage holds still on screen at
  // its final place for the whole change, so earlier ghosts shift by
  // however far it moved, and hold theirs.
  const shiftX = stageBefore.left - stageAfter.left;
  const shiftY = stageBefore.top - stageAfter.top;
  for (const node of ghosts) {
    const { x, y } = ghostPlace(node);
    placeGhost(node, x + shiftX, y + shiftY);
  }

  // Edge fade: the box (stage coordinates) before and after, and how far
  // old ink reaches past it.
  const boxStart = rootBefore.left - stageAfter.left;
  const boxEnd = rootBefore.right - stageAfter.left;
  const inkRects = [
    ...ghostRects,
    ...removed
      .map((node) => before.get(node)?.rect)
      .filter((r) => r !== undefined),
  ];
  // The glyph boxes decide whether ink sticks out; the room also covers
  // their blur and tilt.
  const glyphStart =
    Math.min(Infinity, ...inkRects.map((r) => r.left)) - stageAfter.left;
  const glyphEnd =
    Math.max(-Infinity, ...inkRects.map((r) => r.right)) - stageAfter.left;
  const inkStart = glyphStart - INK_MARGIN * em;
  const inkEnd = glyphEnd + INK_MARGIN * em;
  const wasArmed = ghostLayer.dataset.armed ?? "";
  const armed = (side: Side): boolean => {
    if (o.edgeFade === "never" || inkRects.length === 0) return false;
    if (wasArmed.includes(side)) return true;
    const travels =
      side === "start"
        ? Math.abs(boxStart) > 0.5
        : Math.abs(boxEnd - width) > 0.5;
    const overhangs =
      side === "start" ? glyphStart < -0.5 : glyphEnd > width + 0.5;
    if (!travels || !overhangs) return false;
    return (
      o.edgeFade === "always" ||
      inkEscapes(
        root,
        side,
        stageAfter.left + (side === "start" ? glyphStart : glyphEnd),
      )
    );
  };
  const armStart = armed("start");
  const armEnd = armed("end");

  // A rise brings new glyphs up from below and sends old ones up and away.
  const arrive = match.trend;
  const leave = match.trend === 1 ? -1 : 1;

  // Width: back to where it visibly was, then ease to the new width.
  root.style.width = `${rootBefore.width}px`;
  void root.offsetWidth;
  root.style.transition = `width ${o.width.duration}ms ${o.width.easing}`;
  root.style.width = `${width}px`;
  started.push(...root.getAnimations());
  settleTimers.set(
    root,
    window.setTimeout(() => {
      root.style.transition = "";
      root.style.width = "";
    }, o.width.duration + 50),
  );

  // The box's left edge moves while it resizes (a centred pill, a
  // right-pinned button); ride the other way on the same curve.
  const ride = rootAfter.left - rootBefore.left;
  if (Math.abs(ride) > 0.5) {
    run(stage, [{ translate: `${ride}px 0` }, { translate: "0 0" }], {
      duration: o.width.duration,
      easing: o.width.easing,
    });
  }

  const motion = { duration: o.motion.duration, easing: o.motion.easing };
  const blur = `blur(${o.blur}em)`;
  const delays = staggerDelays(
    o,
    nodes.flatMap((_, i) => (kept[i] ? [] : [after[i].left - rootAfter.left])),
    removed.map(
      (node) =>
        (before.get(node)?.rect.left ?? rootBefore.left) - rootBefore.left,
    ),
  );

  // Shared glyphs slide from wherever they were, including mid-animation.
  let entering = 0;
  nodes.forEach((node, i) => {
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
    const dx = was.rect.left - after[i].left;
    const dy = was.rect.top - after[i].top;
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

  // The ghost layer reaches past all the ink (a mask cuts whatever falls
  // outside its element), and wears a band on each armed edge that follows
  // the box edge on the width's curve, ending a little past it.
  const slack = EDGE_SLACK * em;
  const room = Math.ceil(
    Math.max(
      0,
      -inkStart,
      inkEnd - width,
      -(boxStart - slack),
      boxEnd + slack - width,
    ) + 1,
  );
  ghostLayer.style.setProperty("--text-morph-room", `${room}px`);
  for (const animation of ghostLayer.getAnimations()) animation.cancel();
  if (armStart || armEnd) {
    const ramp = EDGE_RAMP * em;
    const span = width + 2 * room;
    const window = (start: number, end: number) => {
      const left = armStart ? room + start - slack : 0;
      const right = armEnd ? room + end + slack : span;
      return {
        maskPosition: `0 0, ${left}px 0`,
        maskSize: `100% 100%, ${right - left}px 100%`,
      };
    };
    ghostLayer.dataset.armed = `${armStart ? "start " : ""}${armEnd ? "end" : ""}`;
    ghostLayer.style.setProperty(
      "--text-morph-edge",
      `linear-gradient(to right, ${armStart ? `transparent, #000 ${ramp}px` : "#000"}, ${
        armEnd ? `#000 calc(100% - ${ramp}px), transparent` : "#000"
      })`,
    );
    run(ghostLayer, [window(boxStart, boxEnd), window(0, width)], {
      duration: o.width.duration,
      easing: o.width.easing,
      fill: "forwards",
    });
  } else {
    disarm(ghostLayer);
  }

  // Removed glyphs leave from where they were, in the ghost layer.
  removed.forEach((node, i) => {
    const was = before.get(node);
    if (!was) return;
    placeGhost(
      node,
      was.rect.left - stageAfter.left,
      was.rect.top - stageAfter.top,
    );
    ghostLayer.append(node);
    const kind = removedKinds[i];
    const { fadeOut } = fadesFor(o, kind);
    const delay = delays.leaving[i];
    const move = run(
      node,
      [
        { translate: "0 0", scale: was.scale, rotate: was.rotate },
        awayState(o, kind, leave, line),
      ],
      { ...motion, delay, fill: "forwards" },
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
        fill: "forwards",
      },
    );
    const finish = (): void => {
      if (node.parentNode === ghostLayer) node.remove();
      if (ghostLayer.childElementCount === 0) disarm(ghostLayer);
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
  });
  React.useLayoutEffect(() => {
    optionsRef.current = resolved;
    latest.current = {
      disabled,
      respectReducedMotion,
      onAnimationStart,
      onAnimationComplete,
      onAnimationCancel,
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
    const started = morphTo(
      root,
      stage,
      glyphs,
      ghosts,
      value,
      optionsRef.current,
      decimalFor(locale),
      !current.disabled && !reduce && isOnScreen(root),
    );
    if (started.length === 0) {
      current.onAnimationComplete?.();
      return;
    }

    current.onAnimationStart?.();
    let over = false;
    const cancel = (): void => {
      if (over) return;
      over = true;
      latest.current.onAnimationCancel?.();
    };
    inFlight.current = cancel;
    void Promise.allSettled(started.map((a) => a.finished)).then(() => {
      if (over) return;
      over = true;
      if (inFlight.current === cancel) inFlight.current = null;
      latest.current.onAnimationComplete?.();
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
