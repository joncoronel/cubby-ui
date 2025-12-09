"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-input aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:focus:outline-destructive/50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground data-[indeterminate]:text-foreground border-border focus-visible:outline-ring/20 flex size-4 items-center justify-center rounded-[.25rem] border shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.08)] outline-0 transition-colors duration-0 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        className="block data-[unchecked]:hidden"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <MinusIcon className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  );
}

export { Checkbox };
