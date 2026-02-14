"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";

import { cn } from "@/lib/utils";

// Custom checkmark with stroke-dashoffset animation
// Path length ≈ 20 (calculated from the path geometry)
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
        // Opacity + scale crossfade: visible when checked (not indeterminate), hidden otherwise
        "scale-90 opacity-0 in-data-checked:not-in-data-indeterminate:scale-100 in-data-checked:not-in-data-indeterminate:opacity-100",
        "ease-out-cubic transition-[opacity,filter,transform,scale] duration-150 motion-reduce:transition-none",
        // Subtle blur during transition for smoother crossfade
        "in-data-indeterminate:blur-[2px]",
        className,
      )}
    >
      <path
        d="M5 14L8.5 17.5L19 6.5"
        style={{
          strokeDasharray: 22,
        }}
        className="ease-out-cubic transition-[stroke-dashoffset] duration-150 in-data-checked:delay-15 in-data-checked:not-in-data-indeterminate:[stroke-dashoffset:0] in-data-indeterminate:[stroke-dashoffset:22] in-data-unchecked:[stroke-dashoffset:22] motion-reduce:transition-none"
      />
    </svg>
  );
}

// Custom minus icon with stroke-dashoffset animation
// Path length = 16 (horizontal line from x=4 to x=20)
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
        // Opacity + scale crossfade: visible when indeterminate, hidden otherwise
        "scale-90 opacity-0 in-data-indeterminate:scale-100 in-data-indeterminate:opacity-100",
        "ease-out-cubic transition-[opacity,filter,transform,scale] duration-150 motion-reduce:transition-none",
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
        className="ease-out-cubic transition-[stroke-dashoffset] duration-150 not-in-data-indeterminate:[stroke-dashoffset:16] in-data-indeterminate:delay-15 in-data-indeterminate:[stroke-dashoffset:0] motion-reduce:transition-none"
      />
    </svg>
  );
}

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-card text-primary-foreground aria-invalid:outline-destructive/50 aria-invalid:text-destructive focus-visible:outline-ring/50 ease-out-cubic relative flex size-4.5 items-center justify-center rounded-xs border bg-clip-padding outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-150 outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid data-disabled:cursor-not-allowed data-disabled:opacity-60 motion-reduce:transition-none sm:size-4",
        // Background scale animation using ::before pseudo-element
        "before:bg-primary before:absolute before:-inset-px before:rounded-xs before:content-['']",
        "before:ease-out-cubic before:origin-center before:scale-80 before:transform-gpu before:opacity-0 before:transition-[transform,opacity,scale] before:duration-150 before:will-change-transform motion-reduce:before:transition-none",
        "data-checked:before:scale-100 data-checked:before:opacity-100",
        "data-indeterminate:before:scale-100 data-indeterminate:before:opacity-100",
        // Inset shadow using ::after pseudo-element (sits inside border)
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[calc(var(--radius-xs)-1px)] after:content-['']",
        "after:shadow-inset dark:after:shadow-inset-highlight",
        "after:ease-out-cubic after:transition-opacity after:duration-150",
        "data-checked:after:opacity-0 data-indeterminate:after:opacity-0",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className="grid place-items-center *:col-start-1 *:row-start-1"
      >
        <CheckmarkIcon className="size-3.5" />
        <MinusIcon className="size-3.5" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

export { Checkbox };
