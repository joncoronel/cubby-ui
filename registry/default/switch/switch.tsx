import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    "peer relative inline-flex shrink-0 items-center rounded-full outline-none cursor-pointer",
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
    // 24px pointer target (WCAG 2.5.8) without touching the visual or layout.
    // Inert wherever the switch is a decorative indicator, since those set
    // pointer-events-none on the root.
    "before:absolute before:inset-x-0 before:top-1/2 before:h-6 before:-translate-y-1/2 before:content-['']",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60",
  ],
  {
    variants: {
      // Shape sets the thumb's proportions, size sets its height. They're
      // independent: every shape works at every size.
      shape: {
        circle: "[--thumb-aspect:1] [--travel-ratio:0.8]",
        pill: "[--thumb-aspect:1.8] [--travel-ratio:0.45]",
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
  "pointer-events-none block rounded-full bg-white",
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
