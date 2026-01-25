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
      className={className}
    >
      <path
        d="M5 14L8.5 17.5L19 6.5"
        style={{
          strokeDasharray: 22,
        }}
        className="in-data-checked:not-in-data-indeterminate:[stroke-dashoffset:0] in-data-unchecked:[stroke-dashoffset:22] in-data-indeterminate:[stroke-dashoffset:22] transition-[stroke-dashoffset] duration-150 ease-out-cubic"
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
      className={className}
    >
      <path
        d="M20 12L4 12"
        style={{
          strokeDasharray: 16,
        }}
        className="in-data-indeterminate:[stroke-dashoffset:0] not-in-data-indeterminate:[stroke-dashoffset:16] transition-[stroke-dashoffset] duration-150 ease-out-cubic"
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
        "peer bg-input aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid aria-invalid:text-destructive data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground border-border focus-visible:outline-ring/50 flex size-4 items-center justify-center rounded-xs border shadow-[0_1px_2px_0_oklch(0.18_0_0/0.08)] outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,background-color,border-color] duration-150 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
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
