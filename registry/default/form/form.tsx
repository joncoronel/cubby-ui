"use client";

import { Form as BaseForm } from "@base-ui/react/form";

import { cn } from "@/lib/utils";

function Form({ className, ...props }: BaseForm.Props) {
  return (
    <BaseForm
      data-slot="form"
      className={cn(className)}
      {...props}
    />
  );
}

export { Form };
