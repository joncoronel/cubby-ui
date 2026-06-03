"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

import { cn } from "@/lib/utils";

// strokeDasharray 22 matches this path's computed length (~20px, rounded up for a clean draw-on).
function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        // Crossfade: visible when checked (not indeterminate), hidden when indeterminate
        "not-in-data-indeterminate:scale-100 not-in-data-indeterminate:opacity-100",
        "scale-90 opacity-0",
        "ease-out-expo transition-[opacity,filter,transform,scale] duration-200 motion-reduce:transition-none",
        // Start hidden on mount for enter animation
        "in-data-starting-style:scale-90 in-data-starting-style:opacity-0",
        // Subtle blur during indeterminate crossfade
        "in-data-indeterminate:blur-[2px]",
        className,
      )}
    >
      <path
        d="M5 14L8.5 17.5L19 6.5"
        style={{
          strokeDasharray: 22,
        }}
        className="ease-out-expo transition-[stroke-dashoffset] duration-200 not-in-data-indeterminate:delay-15 not-in-data-indeterminate:[stroke-dashoffset:0] in-data-indeterminate:[stroke-dashoffset:22] in-data-starting-style:[stroke-dashoffset:22] motion-reduce:transition-none"
      />
    </svg>
  );
}

// strokeDasharray 16 = exact length of the M20,12 L4,12 segment.
function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        // Crossfade: visible when indeterminate, hidden when checked
        "in-data-indeterminate:scale-100 in-data-indeterminate:opacity-100",
        "scale-90 opacity-0",
        "ease-out-expo transition-[opacity,filter,transform,scale] duration-200 motion-reduce:transition-none",
        // Start hidden on mount for enter animation
        "in-data-starting-style:scale-90 in-data-starting-style:opacity-0",
        // Subtle blur when transitioning away from indeterminate
        "not-in-data-indeterminate:blur-[2px]",
        className,
      )}
    >
      <path
        d="M20 12L4 12"
        style={{
          strokeDasharray: 16,
        }}
        className="ease-out-expo transition-[stroke-dashoffset] duration-200 not-in-data-indeterminate:[stroke-dashoffset:16] in-data-indeterminate:delay-15 in-data-indeterminate:[stroke-dashoffset:0] in-data-starting-style:[stroke-dashoffset:16] motion-reduce:transition-none"
      />
    </svg>
  );
}

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
        <CheckmarkIcon className="size-3.5 sm:size-3" />
        <MinusIcon className="size-3.5 sm:size-3" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

export { Checkbox };
