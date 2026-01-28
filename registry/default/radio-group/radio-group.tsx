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
  ...props
}: React.ComponentProps<typeof Radio.Root>) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cn(
        "group relative inline-flex size-4 shrink-0 items-center justify-center rounded-full",
        "focus-visible:outline-ring/50 ease-out-cubic outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-150 outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",

        "before:bg-card dark:before:bg-input/35 hover:before:bg-muted dark:hover:before:bg-input/60 before:absolute before:size-full before:rounded-full before:border before:bg-clip-padding before:transition-colors before:content-['']",
        "after:shadow-inset dark:after:shadow-inset-highlight after:absolute after:inset-px after:rounded-full after:content-['']",

        className,
      )}
      {...props}
    >
      <Radio.Indicator
        keepMounted
        className={cn(
          "ease-out-cubic before:bg-primary-foreground bg-primary before:ease-out-cubic z-1 flex size-full items-center justify-center rounded-full transition-opacity duration-200 before:size-full before:origin-center before:rounded-full before:transition-[scale] before:duration-200 in-data-checked:before:scale-50 data-checked:opacity-100 data-unchecked:opacity-0",
        )}
      />
    </Radio.Root>
  );
}

export { RadioGroup, RadioGroupItem };
