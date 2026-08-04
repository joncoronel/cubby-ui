"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

import "./switch.css";

const switchVariants = cva(
  [
    // Containing block for the thumb, which is pinned by left and right so its
    // two edges can move on separate schedules. That is the stretch motion.
    "peer relative inline-block shrink-0 cursor-pointer",
    "touch-manipulation [-webkit-tap-highlight-color:transparent]",
    // Track and thumb need separate radii: the track is 4px larger in both
    // axes, so one shared value leaves its corners proportionally tighter.
    // Only `squircle` sets --switch-corner-shape, so that fallback is real.
    "rounded-(--switch-track-radius) [corner-shape:var(--switch-corner-shape,round)]",
    // All geometry derives from --thumb-size, so overriding that one value
    // still works. No var() fallbacks here: the prop types reject `null`, so
    // cva cannot drop a defaultVariant and leave one unset.
    "[--thumb-h:var(--thumb-size)]",
    "[--thumb-w:calc(var(--thumb-size)*var(--thumb-aspect))]",
    "[--travel:calc(var(--thumb-w)*var(--travel-ratio))]",
    // Snapped to whole pixels, or the 2px inset lands mid-pixel and renders
    // thicker on one side. The unrounded values above cover no round() support.
    "supports-[width:round(1px,1px)]:[--thumb-h:round(var(--thumb-size),1px)]",
    "supports-[width:round(1px,1px)]:[--thumb-w:round(calc(var(--thumb-size)*var(--thumb-aspect)),1px)]",
    "supports-[width:round(1px,1px)]:[--travel:round(calc(var(--thumb-w)*var(--travel-ratio)),1px)]",
    "h-[calc(var(--thumb-h)+4px)]",
    "w-[calc(var(--thumb-w)+var(--travel)+4px)]",
    // How far the thumb reaches into the empty half of the track, and how far
    // it flattens under a press. Whole pixels because a pointer can rest in
    // either state.
    "[--switch-hover-ext:round(calc(var(--thumb-h)*0.125),1px)]",
    "[--switch-press-ext:round(calc(var(--thumb-h)*0.25),1px)]",
    "[--switch-press-squash:4px]",
    // --switch-p is the whole toggle: every thumb declaration is a calc() of
    // it, which is how one mechanism serves both motions.
    "[--switch-p:0] data-checked:[--switch-p:1]",
    // Hover and press write to separate variables and --switch-ext takes the
    // larger. A press always happens while hovering, so both rules match at
    // once, and whichever Tailwind ordered last would win. Press has to.
    "[--switch-hover-part:0px] [--switch-press-part:0px] [--switch-press:0px]",
    "[--switch-ext:max(var(--switch-hover-part),var(--switch-press-part))]",
    // Gestures read from the control and from a `group/switch` ancestor, so a
    // switch in a labelled row answers the row. Named, not bare: `group-hover:`
    // compiles to a descendant selector, so an unnamed group would let any
    // `.group` a consumer puts on a card drive every switch inside it. Menu
    // indicators are inert, so data-highlighted stands in for hover.
    // motion-safe rather than a motion-reduce reset: a reset carries fewer
    // selectors than the rule it undoes and loses on specificity.
    "motion-safe:not-data-disabled:hover:[--switch-hover-part:var(--switch-hover-ext)]",
    "motion-safe:not-data-disabled:group-hover/switch:[--switch-hover-part:var(--switch-hover-ext)]",
    "motion-safe:not-data-disabled:data-highlighted:[--switch-hover-part:var(--switch-hover-ext)]",
    "motion-safe:not-data-disabled:active:[--switch-press-part:var(--switch-press-ext)]",
    "motion-safe:not-data-disabled:group-active/switch:[--switch-press-part:var(--switch-press-ext)]",
    // Unchecked track. Values live here rather than in the theme so the
    // component works the moment it is installed; set --switch-track /
    // --switch-track-hover on any ancestor to retune. Translucent, so one
    // colour works on any substrate and hover steps along the same overlay.
    "[--switch-track-bg:var(--switch-track,oklch(0_0_0/8%))]",
    "[--switch-track-bg-hover:var(--switch-track-hover,oklch(0_0_0/12%))]",
    "dark:[--switch-track-bg:var(--switch-track,oklch(1_0_0/20%))]",
    "dark:[--switch-track-bg-hover:var(--switch-track-hover,oklch(1_0_0/24%))]",
    // Checked fill and thumb both read through an indirection: `color` supplies
    // the preset, and --switch-fill / --switch-thumb from an ancestor or
    // className win over it.
    "[--switch-fill-bg:var(--switch-fill,var(--switch-fill-preset))]",
    // The data-checked: qualifier sits on --switch-thumb-bg, never on
    // --switch-thumb: qualifying the consumer-facing variable would raise its
    // specificity and silently outrank a className override.
    "[--switch-thumb-bg:var(--switch-thumb,var(--color-white))]",
    "data-checked:[--switch-thumb-bg:var(--switch-thumb,var(--switch-thumb-preset))]",
    // Hover derives from the resolved fill, so one rule covers every colour.
    // An absolute lightness step, not a percentage of black: a percentage is
    // proportional, so 8% moves --primary (L 0.6) by 0.048 but --neutral in
    // light (L 0.22) by 0.018, at the JND. It also leaves `c` and `h` alone,
    // where mixing black desaturates. Darkens in both themes deliberately, a
    // lighter checked track reads as disabled, which is also why the
    // --primary-hover / --neutral-hover tokens are unused: they lighten in one
    // theme or the other.
    "[--switch-fill-hover:oklch(from_var(--switch-fill-bg)_calc(l-0.05)_c_h)]",
    "data-unchecked:bg-(--switch-track-bg) data-checked:bg-(--switch-fill-bg)",
    "not-data-disabled:hover:data-unchecked:bg-(--switch-track-bg-hover)",
    "not-data-disabled:group-hover/switch:data-unchecked:bg-(--switch-track-bg-hover)",
    "not-data-disabled:data-highlighted:data-unchecked:bg-(--switch-track-bg-hover)",
    "not-data-disabled:hover:data-checked:bg-(--switch-fill-hover)",
    "not-data-disabled:group-hover/switch:data-checked:bg-(--switch-fill-hover)",
    "not-data-disabled:data-highlighted:data-checked:bg-(--switch-fill-hover)",
    // Colour runs at half the speed of anything that moves, so the track reads
    // as filling ahead of the thumb. One gentle curve for all of it: the two
    // edges split a single timeline, so a front-loaded curve would spend the
    // trailing edge's budget on the leading one.
    "transition-[background-color,--switch-p,--switch-ext,--switch-press]",
    "duration-[80ms,var(--switch-duration),160ms,160ms]",
    "ease-out-cubic",
    "motion-reduce:transition-none",
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
    // The border box is the painted box, so a mouse already has an exact
    // target. Coarse pointers get 24px (WCAG 2.5.8), where reach matters and
    // there is no hover to mismatch.
    "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:content-['']",
    "pointer-coarse:before:inset-y-[calc((100%-24px)/2)]",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60",
  ],
  {
    variants: {
      // Each colour pairs a fill with the foreground that sits on it, as Button
      // pairs --btn-bg with text-*-foreground. Not decoration: --neutral is
      // light in dark mode, where a white thumb would vanish into it. The base
      // array applies these while checked only, since the unchecked track is a
      // translucent overlay that a dark thumb disappears into.
      color: {
        primary:
          "[--switch-fill-preset:var(--primary)] [--switch-thumb-preset:var(--primary-foreground)]",
        neutral:
          "[--switch-fill-preset:var(--neutral)] [--switch-thumb-preset:var(--neutral-foreground)]",
      },
      // Shape sets the thumb's silhouette, size sets its height. They are
      // independent, so radii are fractions of --thumb-size rather than fixed
      // pixels that would read too round at xs and too sharp at default.
      shape: {
        circle: [
          "[--switch-radius:9999px] [--switch-track-radius:9999px]",
          "[--thumb-aspect:1] [--travel-ratio:0.8]",
        ].join(" "),
        pill: [
          "[--switch-radius:9999px] [--switch-track-radius:9999px]",
          "[--thumb-aspect:1.8] [--travel-ratio:0.45]",
        ].join(" "),
        // A superellipse, not a rounded rect. corner-shape needs a radius near
        // 50%, but that same radius without corner-shape support is just a
        // circle, so the plain-radius fallback is smaller and degrades to a
        // rounded square instead.
        squircle: [
          "[--switch-radius:calc(var(--thumb-h)*0.3)]",
          "[--switch-track-radius:calc((var(--thumb-h)+4px)*0.3)]",
          "supports-[corner-shape:squircle]:[--switch-radius:calc(var(--thumb-h)*0.5)]",
          "supports-[corner-shape:squircle]:[--switch-track-radius:calc((var(--thumb-h)+4px)*0.5)]",
          "[--switch-corner-shape:squircle]",
          "[--thumb-aspect:1] [--travel-ratio:0.8]",
        ].join(" "),
      },
      size: {
        xs: "[--thumb-size:--spacing(3.5)]",
        sm: "[--thumb-size:--spacing(4)]",
        default: "[--thumb-size:--spacing(5)]",
      },
      // --switch-split is the fraction of the timeline each edge of the thumb
      // gets. At 1 they move together and the width never changes, so the thumb
      // slides. At 0.5 they run back to back and it spans the track mid-toggle.
      motion: {
        default: [
          "[--switch-split:1] [--switch-duration:160ms]",
          "motion-safe:not-data-disabled:active:[--switch-press:var(--switch-press-squash)]",
          "motion-safe:not-data-disabled:group-active/switch:[--switch-press:var(--switch-press-squash)]",
        ].join(" "),
        // No press squash: the stretch derives its own from how far it has
        // spread. Longer than the slide because this timeline has to show the
        // thumb both spread and gather inside it.
        stretch: "[--switch-split:0.5] [--switch-duration:200ms]",
      },
    },
    defaultVariants: {
      color: "primary",
      shape: "circle",
      size: "default",
      motion: "default",
    },
  },
);

/**
 * Thumb classes. Every declaration reads a custom property the root supplies,
 * so this is only correct as a direct child of an element carrying
 * `switchVariants`. Unexported for that reason.
 *
 * Animates layout properties rather than transform alone, deliberately: nothing
 * else moves the thumb's two edges independently, and the cost stays on one
 * absolutely positioned element with no layout dependents.
 */
const switchThumbClasses = cn([
  // White unchecked in both themes: the thumb is the lit element against a
  // recessed track, the way physical switches read.
  "pointer-events-none absolute top-0 block bg-(--switch-thumb-bg)",
  "rounded-(--switch-radius) [corner-shape:var(--switch-corner-shape,round)]",
  // Progress of each edge along its own half of the timeline. Reversing
  // --switch-p swaps which edge leads for free, so there is no per-direction
  // code.
  "[--lead:min(1,var(--switch-p)/var(--switch-split))]",
  "[--trail:max(0,(var(--switch-p)-(1-var(--switch-split)))/var(--switch-split))]",
  "left-[calc(2px+var(--travel)*var(--trail))]",
  "right-[calc(2px+var(--travel)*(1-var(--lead)))]",
  // Negative margins push one edge outward. Each carries its own edge's factor,
  // so the reach retracts exactly as that edge lands on its inset, which is
  // what stops the thumb overhanging the track.
  "ml-[calc(-1*var(--switch-ext)*var(--trail))]",
  "mr-[calc(-1*var(--switch-ext)*(1-var(--lead)))]",
  // Only the horizontal axis needs two edges. Vertically, an explicit height
  // plus one offset keeps the inset a single number instead of two independent
  // roundings at fractional DPRs. The offset must be a transform: as a margin
  // it snaps separately from the height and the thumb reads as shaking.
  "w-auto h-[calc(var(--thumb-h)-var(--switch-press-total))]",
  // Whichever is larger; only one is ever non-zero, since --switch-split
  // decides which motion is in play.
  "[--switch-press-total:max(var(--switch-press),calc(var(--switch-press-squash)*(var(--lead)-var(--trail))))]",
  "[transform:translateY(calc(2px+var(--switch-press-total)/2))]",
  // The thumb's colour is state-dependent and transition-* does not inherit,
  // so it needs its own. Matched to the track's 80ms step so the two cross
  // together rather than the thumb snapping.
  "transition-[background-color] duration-80 ease-out-cubic motion-reduce:transition-none",
  // Only 2px of track shows around the thumb, so anything heavier darkens the
  // inset below it and the thumb reads as sitting low.
  "shadow-[0_1px_1px_0_oklch(0.18_0_0/0.1)]",
]);

/**
 * cva types an explicit `null` as valid and drops its defaultVariants when it
 * sees one, which would leave the geometry variables unset. Rejecting `null` at
 * the type level is what lets every `var()` above read a bare variable instead
 * of restating its default as a fallback.
 */
type SwitchVariants = {
  [K in keyof VariantProps<typeof switchVariants>]?: NonNullable<
    VariantProps<typeof switchVariants>[K]
  >;
};

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> &
  SwitchVariants;

function Switch({
  className,
  color = "primary",
  shape = "circle",
  size = "default",
  motion = "default",
  ...props
}: SwitchProps) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      data-color={color}
      data-shape={shape}
      data-size={size}
      data-motion={motion}
      className={cn(switchVariants({ color, shape, size, motion }), className)}
      {...props}
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={switchThumbClasses}
      />
    </BaseSwitch.Root>
  );
}

/**
 * The switch's look without the control, for rows that already own the role and
 * the click target — a menu's checkbox item, say, where nesting a real Switch
 * would put a focusable control inside a `menuitemcheckbox`. Pass the row's
 * indicator as `render`:
 *
 * ```tsx
 * <SwitchVisual render={<Menu.CheckboxItemIndicator keepMounted />} />
 * ```
 *
 * Pass that element childless: track and thumb only work as a pair, and
 * children on it would replace the thumb and leave a dead track.
 */
// mergeProps lets the rightmost object win, so a child reaches the thumb's slot
// from either direction. Omitting `children` closes the direct-prop route; the
// `render` route above is a convention the type cannot reach.
type SwitchVisualProps = Omit<useRender.ComponentProps<"span">, "children"> &
  SwitchVariants;

function SwitchVisual({
  className,
  color = "primary",
  shape = "circle",
  size = "xs",
  motion = "default",
  render,
  ...props
}: SwitchVisualProps) {
  const defaultProps = {
    "data-slot": "switch-visual",
    className: cn(
      switchVariants({ color, shape, size, motion }),
      // The row carries the state and the hit area; this is decoration.
      "pointer-events-none cursor-default",
      // The row already dims when disabled; don't compound the fade.
      "data-disabled:opacity-100",
      className,
    ),
    children: <span className={switchThumbClasses} />,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export { Switch, SwitchVisual, switchVariants };
export type { SwitchProps, SwitchVisualProps };
