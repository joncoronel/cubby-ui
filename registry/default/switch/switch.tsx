import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 items-center rounded-full p-0.5 outline-none cursor-pointer",
    "h-[calc(var(--thumb-size)+4px)]",
    "w-[calc(var(--thumb-size)*var(--thumb-aspect)*(1+var(--travel-ratio))+4px)]",
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
    "[--thumb-travel:0px] data-checked:[--thumb-travel:calc(var(--thumb-size)*var(--thumb-aspect)*var(--travel-ratio))]",
    // Color runs at about half the thumb's travel time: hover has to feel
    // immediate, and on toggle the track reads as filling ahead of the thumb
    // rather than lagging it.
    "inset-shadow-xs transition-colors duration-100 motion-reduce:transition-none",
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
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
  "transform-gpu will-change-transform [translate:var(--thumb-travel)]",
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
