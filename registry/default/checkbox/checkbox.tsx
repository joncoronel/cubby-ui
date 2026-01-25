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
        "opacity-0 scale-90 in-data-checked:not-in-data-indeterminate:opacity-100 in-data-checked:not-in-data-indeterminate:scale-100",
        "transition-[opacity,filter,transform,scale] duration-150 ease-out-cubic motion-reduce:transition-none",
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
        className="in-data-checked:not-in-data-indeterminate:[stroke-dashoffset:0] in-data-unchecked:[stroke-dashoffset:22] in-data-indeterminate:[stroke-dashoffset:22] transition-[stroke-dashoffset] duration-150 ease-out-cubic in-data-checked:delay-15 motion-reduce:transition-none"
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
        "opacity-0 scale-90 in-data-indeterminate:opacity-100 in-data-indeterminate:scale-100",
        "transition-[opacity,filter,transform,scale] duration-150 ease-out-cubic motion-reduce:transition-none",
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
        className="in-data-indeterminate:[stroke-dashoffset:0] not-in-data-indeterminate:[stroke-dashoffset:16] transition-[stroke-dashoffset] duration-150 ease-out-cubic in-data-indeterminate:delay-15 motion-reduce:transition-none"
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
        "peer relative bg-card bg-clip-padding text-primary-foreground aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid aria-invalid:text-destructive focus-visible:outline-ring/50 flex size-4 items-center justify-center rounded-xs border outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-150 ease-out-cubic outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none",
        // Background scale animation using ::before pseudo-element
        "before:absolute before:size-[calc(100%+2px)] before:rounded-xs before:bg-primary before:content-['']",
        "before:scale-90 before:opacity-0 before:transition-[transform,opacity,scale] before:duration-150 before:ease-out-cubic before:origin-center before:transform-gpu before:will-change-transform motion-reduce:before:transition-none",
        "data-checked:before:scale-100 data-checked:before:opacity-100",
        "data-indeterminate:before:scale-100 data-indeterminate:before:opacity-100",
        // Inset shadow using ::after pseudo-element (sits inside border)
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[calc(var(--radius-xs)-1px)] after:content-['']",
        "after:shadow-inset dark:after:shadow-inset-highlight",
        "after:transition-opacity after:duration-150 after:ease-out-cubic",
        "data-checked:after:opacity-0 data-indeterminate:after:opacity-0",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className="z-10 grid place-items-center *:col-start-1 *:row-start-1"
      >
        <CheckmarkIcon className="size-3.5" />
        <MinusIcon className="size-3.5" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}

export { Checkbox };
