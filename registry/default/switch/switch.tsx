import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    "peer relative inline-flex shrink-0 items-center outline-none cursor-pointer",
    // Radius and corner shape come from the shape variant and are inherited by
    // the thumb, so the two silhouettes always agree. The fallbacks keep the
    // thumb styles usable on their own, where no track has set the variables.
    "rounded-[var(--switch-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
    // The 2px inset around the thumb is a ring, not padding. A ring is one
    // shape expanded uniformly from the border box, so its thickness is
    // constant at any sub-pixel offset. As padding, the inset is instead the
    // leftover space between two independently rasterized shapes — the track's
    // rounded rect and the thumb — which can round a device pixel thicker on
    // one side and reads as an off-center thumb on fractional-DPR displays.
    "h-(--thumb-size)",
    "w-[calc(var(--thumb-size)*var(--thumb-aspect)*(1+var(--travel-ratio)))]",
    // The ring paints outside the border box, so a margin reserves its space:
    // the margin box is the old footprint, keeping layout and alignment put.
    "m-0.5",
    // One variable drives the fill and the ring so the two can never disagree.
    // --switch-track is translucent, so one track color works on any substrate
    // (page, Card, toolbar) without needing a default/elevated variant pair.
    "data-unchecked:[--track:var(--switch-track)] data-checked:[--track:var(--primary)]",
    // Hover steps further along the overlay's own direction, which darkens the
    // track in light mode and lightens it in dark from a single rule. The
    // checked track darkens in both, since a lighter primary reads as disabled.
    "not-data-disabled:hover:data-unchecked:[--track:var(--switch-track-hover)]",
    "not-data-disabled:hover:data-checked:[--track:color-mix(in_oklab,var(--primary),var(--color-black)_8%)]",
    "bg-(--track) ring-2 ring-(--track)",
    // Thumb travel is declared on the track so the thumb styles work wherever
    // the checked state lives — on this root, or on a menu item's indicator
    // when the switch is reused as a decorative indicator.
    "[--thumb-travel:0px] data-checked:[--thumb-travel:calc(var(--thumb-size)*var(--thumb-aspect)*var(--travel-ratio))]",
    // Color runs at about half the thumb's travel time: hover has to feel
    // immediate, and on toggle the track reads as filling ahead of the thumb
    // rather than lagging it.
    // box-shadow carries the ring, so it has to transition alongside the fill
    // or the ring snaps while the track fades.
    "transition-[background-color,box-shadow,outline-color] duration-100 motion-reduce:transition-none",
    // outline-offset measures from the border box, which now sits 2px inside
    // the painted edge, so 4 keeps the focus ring the same 2px clear of it.
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-4",
    // Pointer target. It has to reach the painted edge, which the ring puts 2px
    // outside the border box — otherwise the visible rim is not clickable.
    // On a mouse it stops exactly there, so hover never fires over blank space.
    // Coarse pointers get the 24px minimum (WCAG 2.5.8) instead, where the
    // extra reach matters and there is no hover to mismatch. Inert wherever the
    // switch is a decorative indicator, since those set pointer-events-none.
    "before:absolute before:-inset-0.5 before:content-['']",
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
        circle:
          "[--switch-radius:9999px] [--thumb-aspect:1] [--travel-ratio:0.8]",
        pill: "[--switch-radius:9999px] [--thumb-aspect:1.8] [--travel-ratio:0.45]",
        // A superellipse, not a rounded rect. corner-shape needs a radius near
        // 50% to read as a squircle, but that same radius without corner-shape
        // support is just a circle — so the plain-radius fallback is the
        // smaller value, which degrades to a rounded square instead.
        squircle: [
          "[--switch-radius:calc(var(--thumb-size)*0.3)]",
          "supports-[corner-shape:squircle]:[--switch-radius:calc(var(--thumb-size)*0.5)]",
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
  "pointer-events-none block bg-white",
  "rounded-[var(--switch-radius,9999px)] [corner-shape:var(--switch-corner-shape,round)]",
  "aspect-(--thumb-aspect) h-(--thumb-size)",
  // Only 2px of track shows around the thumb, so a heavier shadow darkens the
  // gap below it and the thumb reads as sitting low. Balanced against the
  // track's inset shadow, which darkens the gap above by about as much.
  "shadow-[0_1px_1px_0_oklch(0.18_0_0/0.1)]",
  "ease-out-expo transition-all duration-200 motion-reduce:transition-none",
  // `translate` is set directly rather than through translate-x-(--thumb-travel):
  // that utility routes the value through the registered --tw-translate-x
  // @property, which misbehaves in Safari.
  " [translate:var(--thumb-travel)]",
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
