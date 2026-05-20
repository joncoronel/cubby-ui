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

function RadioGroupItem({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof Radio.Root> & {
  variant?: "default" | "elevated";
}) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cn(
        "group relative inline-flex size-4 shrink-0 items-center justify-center rounded-full",
        "focus-visible:outline-ring/50 ease-out-expo outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-150 outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",

        // Surface plate. Edge: light has no edge (lift from before:shadow-input
        // on default variant). Dark adds level-1 inset rim on the plate.
        "before:absolute before:size-full before:rounded-full before:transition-colors before:content-['']",
        "dark:before:shadow-surface-rim-1",
        variant === "default"
          ? "before:bg-input before:shadow-input"
          : "before:bg-input-elevated",

        className,
      )}
      {...props}
    >
      <Radio.Indicator
        className={cn(
          "bg-primary before:bg-primary-foreground z-1 flex size-full items-center justify-center rounded-full",
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
