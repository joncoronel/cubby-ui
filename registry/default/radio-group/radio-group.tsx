import * as React from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

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

// The selected fill. Neutral is the mid emphasis grey shared by every
// selection control; primary brings in the brand fill.
const radioColors = {
  neutral:
    "[--radio-fill:var(--emphasis)] [--radio-dot:var(--emphasis-foreground)]",
  primary:
    "[--radio-fill:var(--primary)] [--radio-dot:var(--primary-foreground)]",
};

function RadioGroupItem({
  className,
  color = "neutral",
  ...props
}: React.ComponentProps<typeof Radio.Root> & {
  color?: "neutral" | "primary";
}) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      data-color={color}
      className={cn(
        radioColors[color],
        "group relative inline-flex size-4 shrink-0 items-center justify-center rounded-full",
        "focus-visible:outline-ring ease-out-expo outline-0 -outline-offset-1 outline-transparent transition-[outline-width,outline-color] duration-150 outline-solid focus-visible:outline-2 focus-visible:-outline-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:outline-destructive aria-invalid:outline-2 aria-invalid:-outline-offset-1 aria-invalid:outline-solid",
        // Off: a 2px ring in the shared --control-off grey around a white
        // middle (the surface itself in dark), drawn as an inset shadow so the
        // Indicator at inset-0 covers it completely when selected.
        "bg-white shadow-[inset_0_0_0_2px_var(--control-off)] not-data-disabled:hover:shadow-[inset_0_0_0_2px_var(--control-off-hover)] dark:bg-transparent",
        className,
      )}
      {...props}
    >
      <Radio.Indicator
        className={cn(
          "absolute inset-0 z-1 flex items-center justify-center rounded-full bg-(--radio-fill) before:bg-(--radio-dot)",
          "ease-out-expo transition-opacity duration-150",
          "data-starting-style:opacity-0",
          "data-ending-style:opacity-0",
          "before:ease-out-expo before:size-full before:origin-center before:scale-50 before:rounded-full before:transition-[scale] before:duration-250 before:content-['']",
          "data-starting-style:before:scale-100",
          "data-ending-style:before:scale-100",
        )}
      />
    </Radio.Root>
  );
}

export { RadioGroup, RadioGroupItem };
