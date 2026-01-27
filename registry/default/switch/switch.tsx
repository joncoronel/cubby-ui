import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 items-center rounded-full p-0.5 outline-none cursor-pointer",
    "h-[calc(var(--thumb-size)+4px)]",
    "w-[calc(var(--thumb-size)*var(--thumb-aspect)*(1+var(--travel-ratio))+4px)]",
    "data-checked:bg-primary data-unchecked:bg-accent bg-muted",
    "inset-shadow-xs transition-all duration-200",
    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
    "data-disabled:cursor-not-allowed data-disabled:opacity-60",
  ],
  {
    variants: {
      shape: {
        circle:
          "[--thumb-size:--spacing(5)] [--thumb-aspect:1] [--travel-ratio:0.8]",
        pill: "[--thumb-size:--spacing(5)] [--thumb-aspect:1.8] [--travel-ratio:0.45]",
      },
    },
    defaultVariants: {
      shape: "circle",
    },
  },
);

type SwitchProps = React.ComponentProps<typeof BaseSwitch.Root> &
  VariantProps<typeof switchVariants>;

function Switch({ className, shape, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      data-shape={shape}
      className={cn(switchVariants({ shape }), className)}
      {...props}
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={cn(
          " pointer-events-none block rounded-full bg-white dark:bg-background",
          "aspect-(--thumb-aspect) h-(--thumb-size)",
          "shadow-[0_1px_2px_0_oklch(0.18_0_0/0.15)]",
          "ease-out-cubic transition-all duration-200",
          "transform-gpu will-change-transform data-checked:translate-x-[calc(var(--thumb-size)*var(--thumb-aspect)*var(--travel-ratio))]",
        )}
      />
    </BaseSwitch.Root>
  );
}

export { Switch, switchVariants };
