"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, MinusSignIcon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

// Both marks draw themselves in. `pathLength` restates each path as 1 unit
// long, so the dash values are fractions of the stroke and survive a HugeIcons
// reshape. Deriving the icon array is the only way to reach the path.
const checkIcon = CheckIcon.map(([tag, attrs]) => [
  tag,
  { ...attrs, pathLength: 1 },
]) as typeof CheckIcon;

const minusIcon = MinusSignIcon.map(([tag, attrs]) => [
  tag,
  { ...attrs, pathLength: 1 },
]) as typeof MinusSignIcon;

// Shared crossfade: the two marks stack in one grid cell, so each scales and
// blurs past the other instead of popping. `base` holds the hidden resting
// state; the active state is restored by the per-mark variant.
const markBase =
  "scale-90 opacity-0 ease-out-expo transition-[opacity,filter,transform,scale] duration-200 in-data-starting-style:scale-90 in-data-starting-style:opacity-0 motion-reduce:transition-none";

// Draw-on: dasharray 1 is the whole stroke (see `pathLength` above), so
// offset 1 -> 0 sweeps the mark in. The delay lets the outgoing mark clear
// first during an indeterminate swap.
const checkClasses = cn(
  markBase,
  "not-in-data-indeterminate:scale-100 not-in-data-indeterminate:opacity-100 in-data-indeterminate:blur-[2px]",
  "[&_path]:ease-out-expo [&_path]:transition-[stroke-dashoffset] [&_path]:duration-200 [&_path]:[stroke-dasharray:1]",
  "not-in-data-indeterminate:[&_path]:delay-15 not-in-data-indeterminate:[&_path]:[stroke-dashoffset:0]",
  "in-data-indeterminate:[&_path]:[stroke-dashoffset:1] in-data-starting-style:[&_path]:[stroke-dashoffset:1]",
  "motion-reduce:[&_path]:transition-none",
);

const minusClasses = cn(
  markBase,
  "in-data-indeterminate:scale-100 in-data-indeterminate:opacity-100 not-in-data-indeterminate:blur-[2px]",
  "[&_path]:ease-out-expo [&_path]:transition-[stroke-dashoffset] [&_path]:duration-200 [&_path]:[stroke-dasharray:1]",
  "not-in-data-indeterminate:[&_path]:[stroke-dashoffset:1] in-data-starting-style:[&_path]:[stroke-dashoffset:1]",
  "in-data-indeterminate:[&_path]:delay-15 in-data-indeterminate:[&_path]:[stroke-dashoffset:0]",
  "motion-reduce:[&_path]:transition-none",
);

function Checkbox({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof BaseCheckbox.Root> & {
  variant?: "default" | "elevated";
}) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={cn(
        "peer text-primary-foreground aria-invalid:outline-destructive/50 aria-invalid:text-destructive focus-visible:outline-ring/50 ease-out-expo relative flex aspect-square size-4.5 shrink-0 items-center justify-center rounded-xs outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-200 outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid data-disabled:cursor-not-allowed data-disabled:opacity-60 motion-reduce:transition-none sm:size-4",
        // Edge: real border + bg-clip-padding so the border draws on the
        // substrate (matches Input). The ::before fill uses -inset-px to
        // extend over the border area when checked, hiding it completely.
        "border bg-clip-padding",
        variant === "default" ? "bg-input" : "bg-input-elevated",
        // Background scale animation using ::before pseudo-element
        "before:bg-primary before:absolute before:-inset-px before:rounded-xs before:content-['']",
        "before:ease-out-expo before:origin-center before:scale-80 before:transform-gpu before:opacity-0 before:transition-[transform,opacity,scale] before:duration-200 before:will-change-transform motion-reduce:before:transition-none",
        "data-checked:before:scale-100 data-checked:before:opacity-100",
        "data-indeterminate:before:scale-100 data-indeterminate:before:opacity-100",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        className="ease-out-expo grid place-items-center transition-opacity duration-200 *:col-start-1 *:row-start-1 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        <HugeiconsIcon
          icon={checkIcon}
          strokeWidth={2.5}
          className={cn("size-3.5", checkClasses)}
        />
        <HugeiconsIcon
          icon={minusIcon}
          strokeWidth={2.5}
          className={cn("size-3.5", minusClasses)}
        />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

export { Checkbox };
