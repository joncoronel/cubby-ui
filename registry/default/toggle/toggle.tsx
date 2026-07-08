"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  // Label + icon stay full-contrast (text-foreground) in every state; the
  // background carries the state, not the text — so resting toggles read as
  // legible options, not dimmed ones. Off: transparent. Hover: surface overlay.
  // On (pressed): a filled secondary chip. Selection is terminal — three states
  // only (rest / hover / selected); hover does not alter a pressed toggle.
  // Per-variant fills override the background below.
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-transparent text-sm font-medium whitespace-nowrap text-foreground select-none hover:not-data-pressed:bg-surface-hover data-pressed:bg-secondary active:scale-[0.97] data-disabled:pointer-events-none data-disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-[background-color,color,border-color,box-shadow,outline-width,outline-offset,outline-color,scale] duration-100 ease-out focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
  {
    variants: {
      variant: {
        // Borderless ghost: transparent when off, secondary chip when on (base).
        ghost: "",
        // Filled: an opaque muted plate. Hover/selected are the shared surface-hover /
        // surface-selected overlays composited on an ::after layer (the plate stays put
        // underneath — the base's ghost bg rules are pinned back to bg-muted), so a
        // standalone/detached solid cell matches the group track exactly.
        solid:
          "relative bg-muted hover:not-data-pressed:bg-muted data-pressed:bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:bg-surface-hover after:opacity-0 after:transition-opacity after:duration-100 after:ease-out hover:not-data-pressed:after:opacity-100 data-pressed:after:bg-surface-selected data-pressed:after:opacity-100",
        // Framed card. Border stays through press (only the fill changes), so the
        // frame never drops out — and in a group the collapsed outline stays
        // continuous when a cell is selected.
        outline:
          "border bg-card bg-clip-padding hover:not-data-pressed:bg-(--outline-hover)",
      },
      size: {
        sm: "h-9 min-w-9 gap-1.5 px-2 sm:h-8 sm:min-w-8",
        default: "h-10 min-w-10 px-2.5 sm:h-9 sm:min-w-9",
        lg: "h-11 min-w-11 px-3 sm:h-10 sm:min-w-10",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  },
);

export type ToggleProps = BaseToggle.Props &
  VariantProps<typeof toggleVariants>;

function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <BaseToggle
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
