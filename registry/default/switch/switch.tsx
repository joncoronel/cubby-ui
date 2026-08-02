import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    // Containing block for the thumb, which is pinned by left and right so its
    // two edges can move on separate schedules. That is the stretch motion.
    "peer relative inline-block shrink-0 cursor-pointer",
    "touch-manipulation [-webkit-tap-highlight-color:transparent]",
    // Track and thumb need separate radii: the track is 4px larger in both
    // axes, so one shared value leaves its corners proportionally tighter.
    "rounded-[var(--switch-track-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
    // Geometry, all derived from --thumb-size so overriding that one value
    // still works. Each variant-supplied variable is read with a fallback
    // because cva drops its defaultVariants on an explicit null and
    // VariantProps types null as valid, so `size={cond ? "sm" : null}` would
    // otherwise invalidate these calc()s and the thumb would not render.
    "[--thumb-h:var(--thumb-size,--spacing(5))]",
    "[--thumb-w:calc(var(--thumb-size,--spacing(5))*var(--thumb-aspect,1))]",
    "[--travel:calc(var(--thumb-w)*var(--travel-ratio,0.8))]",
    // Snapped to whole pixels, or the 2px inset lands mid-pixel and renders
    // thicker on one side than the other. The unrounded values above stand in
    // where round() is unsupported.
    "supports-[width:round(1px,1px)]:[--thumb-h:round(var(--thumb-size,--spacing(5)),1px)]",
    "supports-[width:round(1px,1px)]:[--thumb-w:round(calc(var(--thumb-size,--spacing(5))*var(--thumb-aspect,1)),1px)]",
    "supports-[width:round(1px,1px)]:[--travel:round(calc(var(--thumb-w)*var(--travel-ratio,0.8)),1px)]",
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
    // Gestures read from the control and from any `group` ancestor, so a switch
    // in a labelled row answers the row. Menu indicators are inert, so Base UI's
    // data-highlighted stands in, which also covers arrow-key navigation.
    "not-data-disabled:hover:[--switch-hover-part:var(--switch-hover-ext)]",
    "not-data-disabled:group-hover:[--switch-hover-part:var(--switch-hover-ext)]",
    "not-data-disabled:data-highlighted:[--switch-hover-part:var(--switch-hover-ext)]",
    "not-data-disabled:active:[--switch-press-part:var(--switch-press-ext)]",
    "not-data-disabled:group-active:[--switch-press-part:var(--switch-press-ext)]",
    // --switch-track is translucent, so one colour works on any substrate.
    // Hover steps further along that same overlay, which darkens in light mode
    // and lightens in dark from a single rule. Checked darkens in both, since a
    // lighter primary reads as disabled.
    "data-unchecked:bg-switch-track data-checked:bg-primary",
    "not-data-disabled:hover:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:group-hover:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:data-highlighted:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:hover:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    "not-data-disabled:group-hover:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    "not-data-disabled:data-highlighted:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    // Colour runs at half the speed of anything that moves, so on a toggle the
    // track reads as filling ahead of the thumb. One curve for all of it, and
    // it has to be gentle: the two edges split a single timeline, so whatever a
    // front-loaded curve spends on the leading edge is taken from the trailing.
    "transition-[background-color,--switch-p,--switch-ext,--switch-press]",
    "duration-[80ms,var(--switch-duration,160ms),160ms,160ms]",
    "ease-out-cubic",
    "motion-reduce:transition-none motion-reduce:[--switch-hover-part:0px] motion-reduce:[--switch-press-part:0px] motion-reduce:[--switch-press:0px]",
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
          "not-data-disabled:active:[--switch-press:var(--switch-press-squash)]",
          "not-data-disabled:group-active:[--switch-press:var(--switch-press-squash)]",
        ].join(" "),
        // No press squash: the stretch derives its own from how far it has
        // spread. Longer than the slide because this timeline has to show the
        // thumb both spread and gather inside it.
        stretch: "[--switch-split:0.5] [--switch-duration:200ms]",
      },
    },
    defaultVariants: {
      shape: "circle",
      size: "default",
      motion: "default",
    },
  },
);

/**
 * Pair with an element carrying `switchVariants`: every declaration here reads
 * a custom property the root supplies.
 *
 * Deliberately animates layout properties rather than transform and opacity
 * alone. Nothing else moves the thumb's two edges independently, which is what
 * the stretch motion is, and the cost stays on one absolutely positioned
 * element with no layout dependents.
 */
const switchThumbVariants = cva([
  // White in both themes: in dark mode the thumb is the lit element against a
  // recessed track, the way physical switches read.
  "pointer-events-none absolute top-0 block bg-white",
  "rounded-[var(--switch-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
  // Progress of each edge along its own half of the timeline. Reversing
  // --switch-p swaps which edge leads for free, so there is no per-direction
  // code.
  "[--lead:min(1,var(--switch-p)/var(--switch-split,1))]",
  "[--trail:max(0,(var(--switch-p)-(1-var(--switch-split,1)))/var(--switch-split,1))]",
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

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> &
  VariantProps<typeof switchVariants>;

function Switch({ className, shape, size, motion, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      data-shape={shape}
      data-size={size}
      data-motion={motion}
      className={cn(switchVariants({ shape, size, motion }), className)}
      {...props}
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={switchThumbVariants()}
      />
    </BaseSwitch.Root>
  );
}

export { Switch, switchVariants, switchThumbVariants };
