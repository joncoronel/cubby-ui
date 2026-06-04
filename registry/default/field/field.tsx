"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/registry/default/input/input";

function Field({ className, ...props }: BaseField.Root.Props) {
  return (
    <BaseField.Root
      data-slot="field"
      className={cn("space-y-2", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: BaseField.Label.Props) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn(
        "text-foreground flex items-center gap-2 text-sm leading-5 font-medium select-none",
        "data-disabled:pointer-events-none data-disabled:opacity-60",
        "data-invalid:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FieldControl({ className, ...props }: BaseField.Control.Props) {
  return (
    <BaseField.Control
      data-slot="field-control"
      className={cn(inputVariants(), className)}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: BaseField.Description.Props) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: BaseField.Error.Props) {
  return (
    <BaseField.Error
      data-slot="field-error"
      className={cn("text-destructive text-sm", className)}
      {...props}
    />
  );
}

function FieldErrorSlot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-error-slot"
      className={cn(
        "-mt-2 grid h-0 overflow-clip [interpolate-size:allow-keywords] *:col-start-1 *:row-start-1",
        "ease-out-expo transition-[height,margin-top] duration-140 motion-reduce:transition-none",
        "has-[[data-slot=field-error]:not([data-ending-style])]:mt-0 has-[[data-slot=field-error]:not([data-ending-style])]:h-auto",
        // Opacity fade on child FieldError
        "*:data-[slot=field-error]:transition-opacity *:data-[slot=field-error]:duration-140 motion-reduce:*:data-[slot=field-error]:transition-none",
        "[&>[data-slot=field-error][data-ending-style]]:opacity-0 [&>[data-slot=field-error][data-starting-style]]:opacity-0",
        // When swapping errors: instantly hide the exiting one, show the entering one.
        "[&:has(>[data-slot=field-error]:not([data-ending-style]))>[data-slot=field-error][data-ending-style]]:hidden",
        "[&:has(>[data-slot=field-error][data-ending-style])>[data-slot=field-error][data-starting-style]]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function FieldItem({ className, ...props }: BaseField.Item.Props) {
  return (
    <BaseField.Item
      data-slot="field-item"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  );
}

const FieldValidity = BaseField.Validity;

export {
  Field,
  FieldLabel,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldErrorSlot,
  FieldItem,
  FieldValidity,
};
