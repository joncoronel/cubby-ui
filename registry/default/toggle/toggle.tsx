"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";

import { cn } from "@/lib/utils";

// Same paint model as Button: the fill and border render on a ::before
// pseudo-element that scales down on press, so the plate shrinks while the
// label and icon stay put.
//
// Paint: variants set per-state tokens (--tgl-bg, --tgl-bg-hover,
// --tgl-bg-active, --tgl-bg-selected, --tgl-border), the state machine below
// resolves them into
// --tgl-paint, and togglePaint renders it on the pseudo (custom properties
// inherit into pseudo-elements). Consumers recolor by overriding the tokens
// (className="[--tgl-bg-selected:...]") and restyle the border via `before:`
// classes (className="before:border-dashed").
const toggleBase = cn(
  // Label + icon stay full-contrast (text-foreground) in every state; the
  // background carries the state, not the text — so resting toggles read as
  // legible options, not dimmed ones.
  "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap text-foreground select-none data-disabled:pointer-events-none data-disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 transition-[outline-width,outline-offset,outline-color,opacity,color] duration-100 ease-out focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
  // State machine: unset tokens fall through to transparent. Selection is
  // terminal, so neither hover nor press alters a selected toggle; both are
  // scoped to the off state. The pressed-down step exists because the scale
  // alone is invisible on a variant that paints nothing at rest (ghost), which
  // is every attached group cell and every toggle on touch, where `hover:`
  // never matches.
  "[--tgl-paint:var(--tgl-bg,transparent)] hover:not-data-pressed:[--tgl-paint:var(--tgl-bg-hover,var(--tgl-bg,transparent))] active:not-data-pressed:[--tgl-paint:var(--tgl-bg-active,var(--tgl-bg-hover,var(--tgl-bg,transparent)))] data-pressed:[--tgl-paint:var(--tgl-bg-selected,var(--tgl-bg,transparent))]",
);

// The paint pseudo-element: 1px border + fill from the resolved vars,
// transparent when unset. -z-10 keeps it under the content (the root's
// `isolate` contains it), and pressing scales only the pseudo.
const togglePaint =
  "before:content-[''] before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:border before:border-[color:var(--tgl-border,transparent)] before:bg-[var(--tgl-paint,transparent)] before:transition-[background-color,border-color,scale] before:duration-100 before:ease-out active:before:scale-[0.97]";

const toggleVariants = cva(cn(toggleBase, togglePaint), {
  variants: {
    variant: {
      // Borderless: transparent when off, a neutral selected overlay when on.
      ghost:
        "[--tgl-bg-hover:var(--surface-hover)] [--tgl-bg-active:var(--surface-active)] [--tgl-bg-selected:var(--surface-selected)]",
      // Filled: an opaque muted plate that never changes color. Hover/selected
      // are the shared surface-hover / surface-selected overlays composited on
      // a second ::after layer that scales with the plate, so a
      // standalone/detached solid cell matches the group track exactly.
      solid:
        "[--tgl-bg:var(--muted)] after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:content-[''] after:bg-surface-hover after:opacity-0 after:transition-[opacity,background-color,scale] after:duration-100 after:ease-out hover:not-data-pressed:after:opacity-100 data-pressed:after:bg-surface-selected data-pressed:after:opacity-100 active:after:scale-[0.97]",
      // Framed card. The border color is a token like every other, so it stays
      // through press (only the fill changes) — the frame never drops out, and
      // in a group the collapsed outline stays continuous when a cell is
      // selected. bg-clip-padding keeps the card fill out from under the
      // translucent border.
      outline:
        "[--tgl-border:var(--border)] [--tgl-bg:var(--card)] [--tgl-bg-hover:var(--outline-hover)] [--tgl-bg-active:var(--outline-active)] [--tgl-bg-selected:var(--secondary)] before:bg-clip-padding",
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
});

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
