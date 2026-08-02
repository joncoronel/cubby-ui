"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/**
 * Scratch comparison page for thumb micro-interactions on hover and press.
 * Not part of the registry or the docs — delete once a direction is picked.
 *
 * Every variant keeps the shipped rest geometry exactly: thumb sits at a 2px
 * inset, track is thumb + 4 in both axes, travel is a whole number. Only what
 * happens between rest states differs.
 *
 *   A. none        what ships today — thumb only translates
 *   B. ff          Fluid Functionalism: hover widens, press widens more and
 *                  squashes the height, both anchored to the near edge
 *   C. widen       B without the squash — press just reaches further
 *   D. cross       leading edge crosses first, trailing edge catches up, so
 *                  the thumb spans the track mid-toggle
 *   E. cross       D plus B's press squash — the two are independent, since
 *      + squash    one is a gesture and the other is the state change
 *   F. rails       B's behaviour on D's mechanism: same widen and squash, no
 *                  cross, and no jitter, because nothing cancels a layout
 *                  property against a transform
 *
 * B, C and E's squash are driven by :hover / :active. D and E's cross is
 * driven by the checked state, which is why it needs a different mechanism.
 */

type Size = "xs" | "sm" | "default";

/** Matches the shipped component: travel is round(thumb * 0.8). */
const GEOMETRY: Record<Size, { thumb: number; travel: number }> = {
  xs: { thumb: 14, travel: 11 },
  sm: { thumb: 16, travel: 13 },
  default: { thumb: 20, travel: 16 },
};

const INSET = 2;

/**
 * FF hardcodes +2 hover, +4 press and -4 squash against a 16px thumb. Scaled
 * to a ratio so xs doesn't lose a third of its height, then rounded, because a
 * held press is a rest state a finger can sit in for as long as it likes.
 */
const HOVER_EXTEND = 0.125;
const PRESS_EXTEND = 0.25;
const PRESS_SQUASH = 0.25;

/**
 * The squash is halved to re-centre the thumb, so it has to round to an even
 * number or the press parks the thumb on a half pixel — and a held press is a
 * rest state a finger can sit in for as long as it likes.
 *
 * Ties round down rather than to nearest, so default takes 4 instead of 6. The
 * ratio slackens as the thumb grows (29% at xs, 25% at sm, 20% at default),
 * which is the right direction: a bigger element needs proportionally less
 * deformation to read as squashed.
 */
const evenPx = (n: number) => 2 * Math.ceil(n / 2 - 0.5);

/** Falls back to the hover width so press can never narrow the thumb. */
const pressExt = (on: boolean, px: number) =>
  on ? `${px}px` : "var(--hover-ext)";

const corner = (squircle: boolean) =>
  ({ cornerShape: squircle ? "squircle" : "round" }) as React.CSSProperties;

const radiusFor = (box: number, squircle: boolean) =>
  squircle ? box * 0.5 : 9999;

type MechProps = {
  size: Size;
  squircle: boolean;
  checked: boolean;
  duration: number;
  /** D/E only: fraction of the timeline each edge gets. 0.5 = widest stretch. */
  split: number;
  /** E only: what drives the vertical squash. */
  squashMode: SquashMode;
  /**
   * Whether press does anything beyond hover — both the extra width and the
   * squash. Off holds at the hover width rather than dropping to zero, which
   * would snap the thumb *narrower* under your finger than a moment earlier.
   * F ignores this: its press state is the point of it.
   */
  pressEffect: boolean;
  onCheckedChange: (v: boolean) => void;
};

type SquashMode = "press" | "cross" | "both";

const rootClasses =
  "relative inline-block shrink-0 cursor-pointer outline-none " +
  "focus-visible:outline-ring/50 focus-visible:outline-2 focus-visible:outline-offset-2";

const trackStyle = (
  { thumb, travel }: { thumb: number; travel: number },
  checked: boolean,
  squircle: boolean,
): React.CSSProperties => ({
  height: thumb + INSET * 2,
  width: thumb + travel + INSET * 2,
  borderRadius: radiusFor(thumb + INSET * 2, squircle),
  ...corner(squircle),
  background: checked ? "var(--primary)" : "var(--switch-track)",
  transitionProperty: "background-color",
  transitionDuration: "100ms",
});

const thumbBase = (squircle: boolean, thumb: number): React.CSSProperties =>
  ({
    position: "absolute",
    top: 0,
    left: 0,
    background: "#fff",
    borderRadius: radiusFor(thumb, squircle),
    ...corner(squircle),
    boxShadow: "0 1px 1px 0 oklch(0.18 0 0 / 0.1)",
  }) as React.CSSProperties;

/* ------------------------------------------------------------------ A. none */

function None({
  size,
  squircle,
  checked,
  duration,
  onCheckedChange,
}: MechProps) {
  const g = GEOMETRY[size];
  return (
    <BaseSwitch.Root
      checked={checked}
      className={rootClasses}
      onCheckedChange={onCheckedChange}
      style={trackStyle(g, checked, squircle)}
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbBase(squircle, g.thumb),
          height: g.thumb,
          width: g.thumb,
          transform: `translate(${INSET + (checked ? g.travel : 0)}px, ${INSET}px)`,
          transitionProperty: "transform",
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
        }}
      />
    </BaseSwitch.Root>
  );
}

/* --------------------------------------------------------------------- B/C */

/**
 * Anchored stretch. --ext and --squash come from :hover / :active on the root,
 * so the thumb reads them the same way it already reads --thumb-travel.
 *
 * The anchor is the key line: unchecked, the thumb grows rightward from its
 * left edge; checked, the transform is pulled back by --ext so the right edge
 * stays pinned and it grows leftward. Either way it reaches into the empty
 * side of the track rather than out of it.
 */
function anchored(
  { size, squircle, checked, duration, onCheckedChange }: MechProps,
  stateClasses: string,
  vars: React.CSSProperties,
) {
  const g = GEOMETRY[size];
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(rootClasses, "[--ext:0px] [--squash:0px]", stateClasses)}
      onCheckedChange={onCheckedChange}
      style={{ ...trackStyle(g, checked, squircle), ...vars }}
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbBase(squircle, g.thumb),
          height: `calc(${g.thumb}px - var(--squash))`,
          width: `calc(${g.thumb}px + var(--ext))`,
          transform: checked
            ? `translate(calc(${INSET + g.travel}px - var(--ext)), calc(${INSET}px + var(--squash) / 2))`
            : `translate(${INSET}px, calc(${INSET}px + var(--squash) / 2))`,
          transitionProperty: "transform, width, height",
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
        }}
      />
    </BaseSwitch.Root>
  );
}

// The group-* variants are inert unless an ancestor carries `group`, so they
// cost nothing on a bare switch and give the row-scoped behaviour for free
// when one is composed into a labelled row — which is how FF drives theirs.
function Ff(props: MechProps) {
  const { thumb } = GEOMETRY[props.size];
  return anchored(
    props,
    "hover:[--ext:var(--hover-ext)] active:[--ext:var(--press-ext)] " +
      "group-hover:[--ext:var(--hover-ext)] group-active:[--ext:var(--press-ext)] " +
      (props.pressEffect
        ? "active:[--squash:var(--press-squash)] group-active:[--squash:var(--press-squash)]"
        : ""),
    {
      "--hover-ext": `${Math.round(thumb * HOVER_EXTEND)}px`,
      "--press-ext": pressExt(
        props.pressEffect,
        Math.round(thumb * PRESS_EXTEND),
      ),
      "--press-squash": `${evenPx(thumb * PRESS_SQUASH)}px`,
    } as React.CSSProperties,
  );
}

function Widen(props: MechProps) {
  const { thumb, travel } = GEOMETRY[props.size];
  return anchored(
    props,
    "hover:[--ext:var(--hover-ext)] active:[--ext:var(--press-ext)] " +
      "group-hover:[--ext:var(--hover-ext)] group-active:[--ext:var(--press-ext)]",
    {
      "--hover-ext": `${Math.round(thumb * HOVER_EXTEND)}px`,
      // No squash to trade against, so the press can reach most of the way
      // across the empty side and still read as one gesture.
      "--press-ext": pressExt(props.pressEffect, Math.round(travel * 0.6)),
    } as React.CSSProperties,
  );
}

/* ------------------------------------------------------- F. B on layout rails */

/**
 * B's behaviour, D's mechanism. Same widen and squash, no cross, no jitter.
 *
 * B pins its anchored edge by cancelling `translateX` against `width`. The sum
 * is constant on paper, but `width` is a layout property whose painted box is
 * pixel-snapped while `transform` is applied at raster time unsnapped, so the
 * residual wanders about an eighth of a device pixel every frame of the widen.
 * That is the shake, and it is only visible while the widen runs, because at
 * rest --ext is a whole number and the two land clean.
 *
 * Here every animating quantity is a layout property, so there is nothing to
 * cancel. Horizontally the thumb is pinned by left and right and grown by a
 * negative margin. Vertically the squash moves `height` and `margin-top`
 * together — both layout — while the constant 2px offset stays on a transform
 * that never changes, which keeps the rest structure identical to D's.
 *
 * With no stagger there is no shared progress variable, so unlike D this needs
 * no registered custom property, no state and no effect. Plain transitions.
 */
function Rails({
  size,
  squircle,
  checked,
  duration,
  onCheckedChange,
}: MechProps) {
  const g = GEOMETRY[size];
  const far = INSET + g.travel;
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(
        rootClasses,
        "[--ext:0px] [--press:0px]",
        "hover:[--ext:var(--hover-ext)] active:[--ext:var(--press-ext)] active:[--press:var(--press-squash)]",
        "group-hover:[--ext:var(--hover-ext)] group-active:[--ext:var(--press-ext)] group-active:[--press:var(--press-squash)]",
        "motion-reduce:[--ext:0px] motion-reduce:[--press:0px]",
      )}
      onCheckedChange={onCheckedChange}
      style={
        {
          ...trackStyle(g, checked, squircle),
          "--hover-ext": `${Math.round(g.thumb * HOVER_EXTEND)}px`,
          // Deliberately not wired to pressEffect: F's press state is the
          // whole point of it, and it's the only option where press says
          // something the widen isn't already saying.
          "--press-ext": `${Math.round(g.thumb * PRESS_EXTEND)}px`,
          "--press-squash": `${evenPx(g.thumb * PRESS_SQUASH)}px`,
        } as React.CSSProperties
      }
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbBase(squircle, g.thumb),
          left: checked ? far : INSET,
          right: checked ? INSET : far,
          marginLeft: checked ? "calc(-1 * var(--ext))" : "0px",
          marginRight: checked ? "0px" : "calc(-1 * var(--ext))",
          top: 0,
          height: `calc(${g.thumb}px - var(--press))`,
          marginTop: "calc(var(--press) / 2)",
          width: "auto",
          transform: `translateY(${INSET}px)`,
          transitionProperty:
            "left, right, margin-left, margin-right, height, margin-top",
          // The travel is the toggle; everything else is a gesture and wants to
          // feel immediate. Margins carry both jobs, so they take the gesture
          // timing — with no stagger the edges still can't overrun their inset.
          transitionDuration: `${duration}ms, ${duration}ms, 120ms, 120ms, 120ms, 120ms`,
          transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)",
        }}
      />
    </BaseSwitch.Root>
  );
}

/* ----------------------------------------------------------------- D. cross */

/**
 * The thumb is pinned by left and right instead of sized and translated, so
 * each edge is its own animatable property. Staggering their delays makes the
 * leading edge move first (the thumb stretches across) and the trailing edge
 * catch up (it shrinks in from behind).
 *
 * Width can't do this: it would have to run thumb -> full -> thumb, and a
 * transition only interpolates one direction. Two edges, each monotonic, can.
 *
 * The hover/press stretch has to move an edge too, but it must not inherit the
 * stagger — transition-delay is per property, not per cause, so routing both
 * through left/right delays the stretch by the full lag. It goes through a
 * negative margin instead: for an absolutely positioned box with both left and
 * right set, width resolves to cb - left - right - margins, so a negative
 * margin pushes that one edge outward. Separate property, its own zero delay.
 *
 * That fixes the delay but not the contention. The margin swaps sides the
 * instant checked flips, while the edge it lands on is still waiting out the
 * lag, so a live --ext pads an edge that is already at its extreme and the
 * thumb overhangs the track for the whole lag window.
 *
 * So stop staggering delays at all. Nothing below transitions. Both edges and
 * both margins are pure functions of one registered custom property, --p, and
 * --p is the only thing that animates:
 *
 *   L (leading)  = min(1, p / s)              s = the fraction of the timeline
 *   T (trailing) = max(0, (p - (1 - s)) / s)      each edge is given
 *
 * s = 0.5 runs the edges back to back for the widest stretch; s = 1 collapses
 * to a plain slide. Reversing p swaps which edge leads for free, because each
 * half of the timeline belongs to a different edge.
 *
 * The overhang is now impossible rather than merely tuned away. Each margin
 * carries the same factor as the edge it sits on, so the extension retracts
 * exactly as that edge reaches its inset:
 *
 *   left edge  = INSET + (travel - ext) * T
 *   right edge = INSET + (travel - ext) * (1 - L)
 *
 * Both bottom out at INSET, so mid-cross the thumb spans exactly inset to
 * inset and can never be wider than the track's inner span. --ext animates on
 * its own clock, so hover stays independent of the toggle.
 */
function cross(
  {
    size,
    squircle,
    checked,
    duration,
    split,
    squashMode,
    pressEffect,
    onCheckedChange,
  }: MechProps,
  squash: boolean,
) {
  const g = GEOMETRY[size];
  const lead = "min(1, var(--p) / var(--s))";
  const trail = "max(0, (var(--p) - (1 - var(--s))) / var(--s))";
  const mode = squash ? squashMode : "none";
  // Excess width over rest is travel * (lead - trail): zero at both ends,
  // peaking mid-cross. Scaling it to --press-squash gives a deformation that
  // is exactly 0 at rest without needing its own clock or a rounding rule.
  const fromCross =
    mode === "cross" || mode === "both"
      ? `calc(var(--press-squash) * (${lead} - ${trail}))`
      : "0px";
  return (
    <BaseSwitch.Root
      checked={checked}
      className={cn(
        rootClasses,
        "[--p:0] data-checked:[--p:1]",
        "[--ext:0px] hover:[--ext:var(--hover-ext)] active:[--ext:var(--press-ext)]",
        "group-hover:[--ext:var(--hover-ext)] group-active:[--ext:var(--press-ext)]",
        "[--press:0px] motion-reduce:transition-none motion-reduce:[--ext:0px]",
        pressEffect &&
          (mode === "press" || mode === "both") &&
          "group-active:[--press:var(--press-squash)] active:[--press:var(--press-squash)]",
      )}
      onCheckedChange={onCheckedChange}
      style={
        {
          ...trackStyle(g, checked, squircle),
          "--s": split,
          "--hover-ext": `${Math.round(g.thumb * HOVER_EXTEND)}px`,
          "--press-ext": pressExt(
            pressEffect,
            Math.round(g.thumb * PRESS_EXTEND),
          ),
          "--press-squash": `${evenPx(g.thumb * PRESS_SQUASH)}px`,
          // max(), not sum: on release the press unwinds while the cross winds
          // up, so taking the larger keeps the thumb continuously deformed
          // instead of popping back to full height between the two.
          "--squash": `max(var(--press), ${fromCross})`,
          // Nothing on the thumb transitions, so every animated quantity has
          // to be a registered property the root can drive. Each gets its own
          // clock: the toggle is slow, the two gestures are quick.
          transitionProperty: "background-color, --p, --ext, --press",
          transitionDuration: `100ms, ${duration}ms, 120ms, 120ms`,
          transitionTimingFunction: "linear, var(--e), var(--e), var(--e)",
          "--e": "cubic-bezier(0.33, 1, 0.68, 1)",
        } as React.CSSProperties
      }
    >
      <BaseSwitch.Thumb
        style={{
          ...thumbBase(squircle, g.thumb),
          left: `calc(${INSET}px + ${g.travel}px * ${trail})`,
          right: `calc(${INSET}px + ${g.travel}px * (1 - ${lead}))`,
          // A negative margin pushes one edge outward: for an absolutely
          // positioned box with both left and right set, width resolves to
          // cb - left - right - margins. Each margin carries its own edge's
          // factor, which is what retracts the extension as that edge lands.
          marginLeft: `calc(-1 * var(--ext) * ${trail})`,
          marginRight: `calc(-1 * var(--ext) * (1 - ${lead}))`,
          // Only the horizontal axis needs two edges. The vertical keeps the
          // FF structure — explicit height, pinned to the top, offset by a
          // single transform — so the inset is one number rather than
          // whatever the layout has left over after resolving top and bottom.
          // Pinning both would hand each edge its own rounding at fractional
          // device pixel ratios, which is what reads as an off-centre thumb.
          top: 0,
          height: `calc(${g.thumb}px - var(--squash))`,
          width: "auto",
          transform: `translateY(calc(${INSET}px + var(--squash) / 2))`,
        }}
      />
    </BaseSwitch.Root>
  );
}

function Cross(props: MechProps) {
  return cross(props, false);
}

function CrossSquash(props: MechProps) {
  return cross(props, true);
}

/* ------------------------------------------------------------------- page */

const MECHANISMS = [
  { key: "none", label: "A. none (shipped)", Component: None },
  { key: "ff", label: "B. FF: widen + squash", Component: Ff },
  { key: "widen", label: "C. widen only", Component: Widen },
  { key: "cross", label: "D. cross the track", Component: Cross },
  { key: "crossSquash", label: "E. cross + squash", Component: CrossSquash },
  { key: "rails", label: "F. B, jitter-free", Component: Rails },
] as const;

export default function SwitchLabPage() {
  const [checked, setChecked] = React.useState(false);
  const [squircle, setSquircle] = React.useState(false);
  const [duration, setDuration] = React.useState(200);
  const [split, setSplit] = React.useState(0.5);
  const [squashMode, setSquashMode] = React.useState<SquashMode>("press");
  const [pressEffect, setPressEffect] = React.useState(true);

  const btn =
    "border-border hover:bg-surface-hover rounded-md border px-3 py-1.5 text-sm";

  return (
    <div className="min-h-screen p-10">
      {/*
        A custom property only animates if it's registered — an unregistered
        one has no type, so there's nothing to interpolate and it steps.
        Both inherit so the thumb can read what the root animates.
      */}
      <style>{`
        @property --p { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --ext { syntax: "<length>"; inherits: true; initial-value: 0px; }
        @property --press { syntax: "<length>"; inherits: true; initial-value: 0px; }
      `}</style>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold">Switch micro-interactions</h1>
          <p className="text-muted-foreground text-sm">
            Hover and press each switch — the difference is in the gesture, not
            the rest state. Every variant paints identically at rest. B, C and
            E&apos;s squash come from <code>:hover</code> and{" "}
            <code>:active</code>, so they end the instant you release, exactly
            when the toggle starts. D and E&apos;s cross is driven by the
            checked state, so it plays during the travel instead. E is D and B
            together.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={btn}
              onClick={() => setChecked((c) => !c)}
              type="button"
            >
              Toggle all ({checked ? "on" : "off"})
            </button>
            <button
              className={btn}
              onClick={() => setSquircle((s) => !s)}
              type="button"
            >
              Corners: {squircle ? "squircle" : "round"}
            </button>
            <button
              className={btn}
              onClick={() =>
                setSquashMode((m) =>
                  m === "press" ? "cross" : m === "cross" ? "both" : "press",
                )
              }
              type="button"
            >
              E squash: {squashMode}
            </button>
            <button
              className={btn}
              onClick={() => setPressEffect((p) => !p)}
              type="button"
            >
              Press effect: {pressEffect ? "on" : "off"}
            </button>
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              travel {duration}ms
              <input
                max={1200}
                min={80}
                onChange={(e) => setDuration(+e.target.value)}
                step={20}
                type="range"
                value={duration}
              />
            </label>
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              D split {split.toFixed(2)}
              <input
                max={1}
                min={0.5}
                onChange={(e) => setSplit(+e.target.value)}
                step={0.05}
                type="range"
                value={split}
              />
            </label>
          </div>
        </header>

        {(Object.keys(GEOMETRY) as Size[]).map((size) => (
          <section
            className="border-border flex flex-col gap-4 rounded-lg border p-6"
            key={size}
          >
            <h2 className="text-sm font-medium">
              size={size}{" "}
              <span className="text-muted-foreground font-normal">
                (thumb {GEOMETRY[size].thumb}px, travel {GEOMETRY[size].travel}
                px)
              </span>
            </h2>
            {MECHANISMS.map(({ key, label, Component }) => (
              <div className="flex items-center gap-4" key={key}>
                <span className="text-muted-foreground w-44 shrink-0 text-xs">
                  {label}
                </span>
                <Component
                  checked={checked}
                  duration={duration}
                  onCheckedChange={setChecked}
                  size={size}
                  split={split}
                  pressEffect={pressEffect}
                  squashMode={squashMode}
                  squircle={squircle}
                />
              </div>
            ))}
          </section>
        ))}

        {/*
          FF puts its pointer handlers on the row that wraps the switch and its
          label, so their hover target is the whole labelled row, not the
          control. Our Switch is a bare control, so the row is whatever the
          consumer composes — a `group` ancestor is the CSS equivalent.
        */}
        <section className="border-border flex flex-col gap-1 rounded-lg border p-6">
          <h2 className="mb-3 text-sm font-medium">
            Row-scoped{" "}
            <span className="text-muted-foreground font-normal">
              (hover anywhere on the row, the way FF does)
            </span>
          </h2>
          {MECHANISMS.filter((m) => m.key !== "none").map(
            ({ key, label, Component }) => (
              <label
                className="group hover:bg-surface-hover -mx-2 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 select-none"
                key={key}
              >
                <span className="text-sm">{label.replace(/^\w\. /, "")}</span>
                <Component
                  checked={checked}
                  duration={duration}
                  onCheckedChange={setChecked}
                  size="sm"
                  split={split}
                  pressEffect={pressEffect}
                  squashMode={squashMode}
                  squircle={squircle}
                />
              </label>
            ),
          )}
        </section>
      </div>
    </div>
  );
}
