"use client";

import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";

import { cn } from "@/lib/utils";

function Fieldset({ className, ...props }: BaseFieldset.Root.Props) {
  return (
    <BaseFieldset.Root
      data-slot="fieldset"
      className={cn("grid gap-4 border-none p-0", className)}
      {...props}
    />
  );
}

function FieldsetLegend({ className, ...props }: BaseFieldset.Legend.Props) {
  return (
    <BaseFieldset.Legend
      data-slot="fieldset-legend"
      className={cn("text-foreground text-base font-semibold leading-6", className)}
      {...props}
    />
  );
}

export { Fieldset, FieldsetLegend };
