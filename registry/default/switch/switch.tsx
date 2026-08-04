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
    // corner-shape is the one fallback that is load-bearing rather than a
    // default restated — only `squircle` sets it.
    "rounded-(--switch-track-radius) [corner-shape:var(--switch-corner-shape,round)]",
    // Geometry, all derived from --thumb-size so overriding that one value
    // still works. Every variable read here is supplied by a variant, and the
    // prop types below reject `null`, so cva can never drop a defaultVariant
    // and leave one unset.
    "[--thumb-h:var(--thumb-size)]",
    "[--thumb-w:calc(var(--thumb-size)*var(--thumb-aspect))]",
    "[--travel:calc(var(--thumb-w)*var(--travel-ratio))]",
    // Snapped to whole pixels, or the 2px inset lands mid-pixel and renders
    // thicker on one side than the other. The unrounded values above stand in
    // where round() is unsupported.
    "supports-[width:round(1px,1px)]:[--thumb-h:round(var(--thumb-size),1px)]",
    "supports-[width:round(1px,1px)]:[--thumb-w:round(calc(var(--thumb-size)*var(--thumb-aspect)),1px)]",
    "supports-[width:round(1px,1px)]:[--travel:round(calc(var(--thumb-w)*var(--travel-ratio)),1px)]",
    "h-[calc(var(--thumb-h)+4px)]",
    "w-[calc(var(--thumb-w)+var(--travel)+4px)]",
    // How far the thumb reaches into the empty half of the track, and how far
    // it flattens under a press. Whole pixels because a pointer can rest in
    // either state; the squash is flat and even because it gets halved to
    // re-centre the thumb.
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
    // switch in a labelled row answers the row. The group is named rather than
    // bare: Tailwind compiles `group-hover:` to a descendant selector
    // (`:where(.group):hover *`), so an unnamed one would let any `.group` a
    // consumer happens to put on a card or list drive every switch inside it,
    // which reads as the switch being hovered when it is not. Menu indicators
    // are inert, so Base UI's data-highlighted stands in, which also covers
    // arrow-key navigation.
    // motion-safe rather than a motion-reduce reset further down: a reset would
    // carry fewer selectors than the rule it means to undo and lose on
    // specificity, leaving reduced motion with the same displacement as
    // everyone else and none of the easing that makes it readable.
    "motion-safe:not-data-disabled:hover:[--switch-hover-part:var(--switch-hover-ext)]",
    "motion-safe:not-data-disabled:group-hover/switch:[--switch-hover-part:var(--switch-hover-ext)]",
    "motion-safe:not-data-disabled:data-highlighted:[--switch-hover-part:var(--switch-hover-ext)]",
    "motion-safe:not-data-disabled:active:[--switch-press-part:var(--switch-press-ext)]",
    "motion-safe:not-data-disabled:group-active/switch:[--switch-press-part:var(--switch-press-ext)]",
    // Track fill. The values sit here rather than in the theme so the component
    // works the moment it is installed, with no token to add first; set
    // --switch-track / --switch-track-hover on any ancestor to retune them.
    // Both are translucent, so one colour works on any substrate, and hover
    // steps further along that same overlay — which darkens in light and
    // lightens in dark from a single rule. Checked darkens in both, since a
    // lighter primary reads as disabled.
    "[--switch-track-bg:var(--switch-track,oklch(0_0_0/8%))]",
    "[--switch-track-bg-hover:var(--switch-track-hover,oklch(0_0_0/12%))]",
    "dark:[--switch-track-bg:var(--switch-track,oklch(1_0_0/20%))]",
    "dark:[--switch-track-bg-hover:var(--switch-track-hover,oklch(1_0_0/24%))]",
    // Checked fill. `color` sets --switch-fill; the hover step is mixed from
    // whatever that resolves to rather than from --primary, so a custom fill
    // gets a matching hover for free and there is no per-colour value to keep
    // in sync. Deliberately not the --primary-hover / --neutral-hover tokens:
    // those lighten in dark mode, and a lighter checked track reads as
    // disabled, so this darkens in both themes.
    "[--switch-fill-hover:color-mix(in_oklab,var(--switch-fill),var(--color-black)_8%)]",
    "data-unchecked:bg-(--switch-track-bg) data-checked:bg-(--switch-fill)",
    "not-data-disabled:hover:data-unchecked:bg-(--switch-track-bg-hover)",
    "not-data-disabled:group-hover/switch:data-unchecked:bg-(--switch-track-bg-hover)",
    "not-data-disabled:data-highlighted:data-unchecked:bg-(--switch-track-bg-hover)",
    "not-data-disabled:hover:data-checked:bg-(--switch-fill-hover)",
    "not-data-disabled:group-hover/switch:data-checked:bg-(--switch-fill-hover)",
    "not-data-disabled:data-highlighted:data-checked:bg-(--switch-fill-hover)",
    // Colour runs at half the speed of anything that moves, so on a toggle the
    // track reads as filling ahead of the thumb. One curve for all of it, and
    // it has to be gentle: the two edges split a single timeline, so whatever a
    // front-loaded curve spends on the leading edge is taken from the trailing.
    "transition-[background-color,--switch-p,--switch-ext,--switch-press]",
    "duration-[80ms,var(--switch-duration),160ms,160ms]",
    "ease-out-cubic",
    "motion-reduce:transition-none",
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
    // The border box is the painted box, so a mouse already has an exact target
    // and hover fires over the visual. Coarse pointers get 24px (WCAG 2.5.8),
    // where the reach matters and there is no hover to mismatch.
    "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:content-['']",
    "pointer-coarse:before:inset-y-[calc((100%-24px)/2)]",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60",
  ],
  {
    variants: {
      // Each colour pairs a fill with its foreground for the thumb, the way
      // Button pairs --btn-bg with text-*-foreground. Not decoration: --neutral
      // is dark in light mode and *light* in dark mode, so a hard-coded white
      // thumb disappears into the neutral track under dark. The hover step is
      // mixed from --switch-fill in the base, so a variant only names the rest
      // colour, and `className="[--switch-fill:…]"` is a complete override
      // rather than half of one.
      color: {
        primary:
          "[--switch-fill:var(--primary)] [--switch-thumb:var(--primary-foreground)]",
        neutral:
          "[--switch-fill:var(--neutral)] [--switch-thumb:var(--neutral-foreground)]",
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
 * so this is only ever correct as a direct child of an element carrying
 * `switchVariants`. Not exported for that reason: `Switch` and `SwitchVisual`
 * are the two things that know how to pair them.
 *
 * Deliberately animates layout properties rather than transform and opacity
 * alone. Nothing else moves the thumb's two edges independently, which is what
 * the stretch motion is, and the cost stays on one absolutely positioned
 * element with no layout dependents.
 */
const switchThumbClasses = cn([
  // White in both themes: in dark mode the thumb is the lit element against a
  // recessed track, the way physical switches read. Via a variable because a
  // light custom --switch-fill would swallow a hard-coded white thumb, and the
  // fix has to be reachable from the same className that set the fill.
  "pointer-events-none absolute top-0 block bg-[var(--switch-thumb,var(--color-white))]",
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
  // Only the horizontal axis needs two edges. Vertically an explicit height and
  // a single offset keep the inset one number, rather than whatever the layout
  // has left after resolving both edges, which would hand each its own rounding
  // at fractional device pixel ratios. That offset has to be a transform: as a
  // margin it snaps independently of the height, and the two gaps step out of
  // sync while the squash animates, which reads as the thumb shaking.
  "w-auto h-[calc(var(--thumb-h)-var(--switch-press-total))]",
  // Whichever is larger; only one is ever non-zero, since --switch-split
  // decides which motion is in play.
  "[--switch-press-total:max(var(--switch-press),calc(var(--switch-press-squash)*(var(--lead)-var(--trail))))]",
  "[transform:translateY(calc(2px+var(--switch-press-total)/2))]",
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
 * Pass that element childless. Owning the thumb as well as the track is the
 * point — the two only work as a pair — but the `render` element is one door
 * the type cannot close: Base UI merges its props *after* ours, so children on
 * it would replace the thumb and leave a dead track.
 */
// `children` is omitted from the props for the same reason, where a type can
// reach: mergeProps lets the rightmost object win for anything that is not a
// handler, className or style, so a caller-passed child would take the thumb's
// place. That closes the direct-prop route; the `render` route above is a
// convention, not an invariant.
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
