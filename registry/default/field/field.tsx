"use client";

import { Field as BaseField } from "@base-ui/react/field";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/registry/default/input/input";

function Field({ className, ...props }: BaseField.Root.Props) {
  return (
    <BaseField.Root
      data-slot="field"
      className={cn("grid gap-2", className)}
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
        "data-disabled:pointer-events-none data-disabled:opacity-50",
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

function FieldDescription({ className, ...props }: BaseField.Description.Props) {
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
  FieldItem,
  FieldValidity,
};
