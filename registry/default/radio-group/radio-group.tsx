import * as React from "react";
import { Radio } from "@base-ui-components/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui-components/react/radio-group";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof BaseRadioGroup>) {
  return (
    <BaseRadioGroup
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof Radio.Root>) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cn(
        "group relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full",
        "border-border/80 bg-input border-1 shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.08)]",
        "data-checked:border-primary data-checked:bg-primary",
        "transition-colors duration-200",
        "focus-visible:ring-ring/30 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-destructive",

        className,
      )}
      {...props}
    >
      <Radio.Indicator className="before:bg-primary-foreground before:animate-in before:zoom-in-50 flex items-center justify-center before:size-2 before:rounded-full before:duration-200" />
    </Radio.Root>
  );
}

export { RadioGroup, RadioGroupItem };
