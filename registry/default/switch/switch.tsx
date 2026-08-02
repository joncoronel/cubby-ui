import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    // `relative` is the thumb's containing block. The thumb is pinned by left
    // and right rather than sized and translated, so each edge can move on its
    // own schedule — that is what lets the thumb stretch across the track.
    "peer relative inline-block shrink-0 outline-none cursor-pointer",
    "touch-manipulation",
    // Corner shape is inherited by the thumb so the two silhouettes agree. The
    // radii are separate variables because the track is 4px larger in both
    // axes; one shared value would leave its corners proportionally tighter.
    "rounded-[var(--switch-track-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
    // The 2px inset around the thumb is the track's own background showing
    // through, so every dimension has to land on a whole pixel: multiplying by
    // the aspect and travel ratios otherwise puts the thumb's leading edge
    // mid-pixel and the inset renders thicker on one side than the other.
    // Derived from --thumb-size so overriding that one value still works.
    "[--thumb-h:var(--thumb-size)]",
    "[--thumb-w:calc(var(--thumb-size)*var(--thumb-aspect))]",
    "[--travel:calc(var(--thumb-w)*var(--travel-ratio))]",
    // The unrounded values above are the fallback for browsers without round();
    // they reproduce the pre-rounding geometry exactly rather than collapsing.
    "supports-[width:round(1px,1px)]:[--thumb-h:round(var(--thumb-size),1px)]",
    "supports-[width:round(1px,1px)]:[--thumb-w:round(calc(var(--thumb-size)*var(--thumb-aspect)),1px)]",
    "supports-[width:round(1px,1px)]:[--travel:round(calc(var(--thumb-w)*var(--travel-ratio)),1px)]",
    "h-[calc(var(--thumb-h)+4px)]",
    "w-[calc(var(--thumb-w)+var(--travel)+4px)]",
    // How far the thumb reaches into the empty half of the track. Rounded to
    // whole pixels because hover and press are both states a pointer can rest
    // in indefinitely, so they have to land as cleanly as the rest state does.
    "[--switch-hover-ext:round(calc(var(--thumb-h)*0.125),1px)]",
    "[--switch-press-ext:round(calc(var(--thumb-h)*0.25),1px)]",
    // Flat rather than a ratio because the squash is halved to re-centre the
    // thumb, so it has to be even, and 4px is what every size in the scale
    // rounds to anyway. The ratio it produces slackens as the thumb grows
    // (29% at xs, 20% at default), which is the right direction: a bigger
    // element needs proportionally less deformation to read as squashed.
    "[--switch-press-squash:4px]",
    // --switch-p is the whole animation. Every declaration on the thumb is a
    // calc() of it, so the toggle needs no keyframes and no second timeline.
    "[--switch-p:0] data-checked:[--switch-p:1]",
    // Hover and press write to separate variables and --switch-ext takes the
    // larger, rather than both writing to --switch-ext and relying on source
    // order to break the tie. A press happens while still hovering, so those
    // rules always match together; whichever the cascade happened to put last
    // would win, and press has to.
    "[--switch-hover-part:0px] [--switch-press-part:0px] [--switch-press:0px]",
    "[--switch-ext:max(var(--switch-hover-part),var(--switch-press-part))]",
    // Gestures read from the control and from any `group` ancestor, so a
    // switch composed into a labelled row responds to the whole row. In menus
    // the indicator is inert, so Base UI's data-highlighted stands in — which
    // also covers arrow-key navigation, where there is no pointer at all.
    "not-data-disabled:hover:[--switch-hover-part:var(--switch-hover-ext)]",
    "not-data-disabled:group-hover:[--switch-hover-part:var(--switch-hover-ext)]",
    "not-data-disabled:data-highlighted:[--switch-hover-part:var(--switch-hover-ext)]",
    "not-data-disabled:active:[--switch-press-part:var(--switch-press-ext)]",
    "not-data-disabled:group-active:[--switch-press-part:var(--switch-press-ext)]",
    // --switch-track is translucent, so one track color works on any substrate
    // (page, Card, toolbar) without needing a default/elevated variant pair.
    "data-unchecked:bg-switch-track data-checked:bg-primary",
    // Hover steps further along the overlay's own direction, which darkens the
    // track in light mode and lightens it in dark from a single rule. The
    // checked track darkens in both, since a lighter primary reads as disabled.
    "not-data-disabled:hover:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:group-hover:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:data-highlighted:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:hover:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    "not-data-disabled:group-hover:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    "not-data-disabled:data-highlighted:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    // Three clocks, because they answer different questions: colour has to feel
    // instant, gestures nearly so, and only the toggle itself is worth 200ms.
    // The two gesture entries repeat because transition lists are positional,
    // not because they are separately tuned.
    //
    // One curve for all of them, and it has to be a gentle one. Under
    // ease-out-expo the stretch reaches half its progress in the first tenth
    // of the travel, so the thumb snaps open and then oozes shut over the
    // remaining nine — the two edges split a single timeline between them, so
    // whatever the curve front-loads is taken out of the trailing edge's share.
    "transition-[background-color,--switch-p,--switch-ext,--switch-press]",
    "duration-[100ms,200ms,120ms,120ms]",
    "ease-out-cubic",
    "motion-reduce:transition-none motion-reduce:[--switch-hover-part:0px] motion-reduce:[--switch-press-part:0px] motion-reduce:[--switch-press:0px]",
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
    // The border box is the painted box, so a mouse already has an exact
    // target and hover fires precisely over the visual. Coarse pointers get a
    // 24px one (WCAG 2.5.8), where the extra reach matters and there is no
    // hover to mismatch. Inert wherever the switch is a decorative indicator,
    // since those set pointer-events-none on the root.
    "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:content-['']",
    "pointer-coarse:before:inset-y-[calc((100%-24px)/2)]",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60",
  ],
  {
    variants: {
      // Shape sets the thumb's silhouette — proportions and corner radius —
      // size sets its height. They're independent: every shape works at every
      // size, so the radius is a fraction of --thumb-size rather than a fixed
      // px value that would read as too round at xs and too sharp at default.
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
        // 50% to read as a squircle, but that same radius without corner-shape
        // support is just a circle — so the plain-radius fallback is the
        // smaller value, which degrades to a rounded square instead.
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
      // is given. At 1 both edges move together and the width never changes,
      // so the thumb simply slides. At 0.5 they run back to back: the leading
      // edge crosses first and the trailing edge follows, so the thumb spans
      // the track mid-toggle. One number, two very different motions.
      motion: {
        default: [
          "[--switch-split:1]",
          "not-data-disabled:active:[--switch-press:var(--switch-press-squash)]",
          "not-data-disabled:group-active:[--switch-press:var(--switch-press-squash)]",
        ].join(" "),
        // No press squash here: the stretch derives its own from how far it
        // has spread, so pressing as well would spend the same deformation
        // twice within a tenth of a second.
        stretch: "[--switch-split:0.5]",
      },
    },
    defaultVariants: {
      shape: "circle",
      size: "default",
      motion: "default",
    },
  },
);

const switchThumbVariants = cva([
  // White in both themes. In dark mode the thumb is the lit element against a
  // recessed track, the same way physical switches read.
  "pointer-events-none absolute top-0 block bg-white",
  "rounded-[var(--switch-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
  // Progress of each edge along its own half of the timeline. Reversing
  // --switch-p swaps which edge leads for free, because each half of the
  // timeline belongs to a different edge — so there is no per-direction code.
  "[--lead:min(1,var(--switch-p)/var(--switch-split))]",
  "[--trail:max(0,(var(--switch-p)-(1-var(--switch-split)))/var(--switch-split))]",
  "left-[calc(2px+var(--travel)*var(--trail))]",
  "right-[calc(2px+var(--travel)*(1-var(--lead)))]",
  // A negative margin pushes one edge outward: with both left and right set,
  // width resolves to containing block - left - right - margins. Each margin
  // carries its own edge's factor, so the reach retracts exactly as that edge
  // arrives at its inset and the thumb can never overhang the track.
  "ml-[calc(-1*var(--switch-ext)*var(--trail))]",
  "mr-[calc(-1*var(--switch-ext)*(1-var(--lead)))]",
  // Only the horizontal axis needs two edges. The vertical keeps an explicit
  // height and a single offset, so the 2px inset is one number rather than
  // whatever the layout has left after resolving both top and bottom — which
  // would hand each edge its own rounding at fractional device pixel ratios
  // and read as an off-centre thumb.
  //
  // The re-centring offset rides on the transform below rather than on a
  // margin. A margin is laid out, so it snaps to whole device pixels, and a
  // squash that animates through fractional values then makes the top gap step
  // while the bottom gap steps at different moments — measured at 1.2 device
  // px of swing, which reads as the thumb shaking vertically. A transform
  // offset is applied after layout and stays continuous, so both gaps glide.
  "w-auto h-[calc(var(--thumb-h)-var(--switch-press-total))]",
  // Whichever is larger: the press, or the stretch's own deformation. Only one
  // is ever non-zero, since --switch-split decides which motion is in play.
  "[--switch-press-total:max(var(--switch-press),calc(var(--switch-press-squash)*(var(--lead)-var(--trail))))]",
  "[transform:translateY(calc(2px+var(--switch-press-total)/2))]",
  // Only 2px of track shows around the thumb, so a shadow much heavier than
  // this darkens the inset below it and the thumb reads as sitting low.
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
