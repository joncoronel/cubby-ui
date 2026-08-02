import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    // `relative` is the thumb's containing block: the thumb is absolutely
    // positioned and placed entirely by transform, so nothing here centers it.
    "peer relative inline-block shrink-0 outline-none cursor-pointer",
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
    // --switch-track is translucent, so one track color works on any substrate
    // (page, Card, toolbar) without needing a default/elevated variant pair.
    "data-unchecked:bg-switch-track data-checked:bg-primary",
    // Hover steps further along the overlay's own direction, which darkens the
    // track in light mode and lightens it in dark from a single rule. The
    // checked track darkens in both, since a lighter primary reads as disabled.
    "not-data-disabled:hover:data-unchecked:bg-switch-track-hover",
    "not-data-disabled:hover:data-checked:bg-[color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    // Thumb travel is declared on the track so the thumb styles work wherever
    // the checked state lives — on this root, or on a menu item's indicator
    // when the switch is reused as a decorative indicator.
    "[--thumb-travel:0px] data-checked:[--thumb-travel:var(--travel)]",
    // Color runs at about half the thumb's travel time: hover has to feel
    // immediate, and on toggle the track reads as filling ahead of the thumb
    // rather than lagging it.
    "transition-colors duration-100 motion-reduce:transition-none",
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
    },
    defaultVariants: {
      shape: "circle",
      size: "default",
    },
  },
);

const switchThumbVariants = cva([
  // White in both themes. In dark mode the thumb is the lit element against a
  // recessed track, the same way physical switches read.
  // Taken out of flow and placed purely by transform, so the 2px inset is one
  // offset rather than something the layout has to divide: no centering step
  // that could round differently on the top edge than the bottom.
  "pointer-events-none absolute top-0 left-0 block bg-white",
  "rounded-[var(--switch-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
  // Width is explicit rather than via aspect-ratio, which would re-derive a
  // fractional width from the height and undo the rounding on the track.
  "h-(--thumb-h) w-(--thumb-w)",
  // Only 2px of track shows around the thumb, so a shadow much heavier than
  // this darkens the inset below it and the thumb reads as sitting low.
  "shadow-[0_1px_1px_0_oklch(0.18_0_0/0.1)]",
  "ease-out-expo transition-all duration-200 motion-reduce:transition-none",
  // Written as a literal transform rather than through translate-x-(--thumb-travel):
  // that utility routes the value through the registered --tw-translate-x
  // @property, which misbehaves in Safari.
  "[transform:translate(calc(2px+var(--thumb-travel)),2px)]",
]);

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> &
  VariantProps<typeof switchVariants>;

function Switch({ className, shape, size, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      data-shape={shape}
      data-size={size}
      className={cn(switchVariants({ shape, size }), className)}
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
