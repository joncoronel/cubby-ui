"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";

import { cn } from "@/lib/utils";

const numberFieldGroupVariants = cva(
  [
    // Composite group surface — shadow lives here (not on the individual
    // input/buttons) so the [-][input][+] cluster reads as a single lifted
    // element. Light: shadow-input. Dark: level-1 inset rim.
    "flex rounded-lg overflow-hidden dark:shadow-surface-rim-1",
  ],
  {
    variants: {
      variant: {
        default: "bg-input shadow-input",
        elevated: "bg-input-elevated",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function NumberField({
  className,
  ...props
}: BaseNumberField.Root.Props) {
  return (
    <BaseNumberField.Root
      data-slot="number-field"
      className={cn("flex flex-col items-start gap-1", className)}
      {...props}
    />
  );
}

function NumberFieldGroup({
  className,
  variant,
  ...props
}: BaseNumberField.Group.Props &
  VariantProps<typeof numberFieldGroupVariants>) {
  return (
    <BaseNumberField.Group
      data-slot="number-field-group"
      className={cn(numberFieldGroupVariants({ variant }), className)}
      {...props}
    />
  );
}

function NumberFieldInput({
  className,
  ...props
}: BaseNumberField.Input.Props) {
  return (
    <BaseNumberField.Input
      data-slot="number-field-input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-10 w-24 bg-transparent text-center text-base font-normal tabular-nums transition-colors duration-200 sm:h-9 md:text-sm",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-2",
        "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldIncrement({
  className,
  ...props
}: BaseNumberField.Increment.Props) {
  return (
    <BaseNumberField.Increment
      data-slot="number-field-increment"
      className={cn(
        // Hairline divider on the left only (between input and button).
        "border-border border-l hover:bg-accent/50 active:bg-accent",
        "flex size-10 items-center justify-center bg-transparent select-none sm:size-9",
        "disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  className,
  ...props
}: BaseNumberField.Decrement.Props) {
  return (
    <BaseNumberField.Decrement
      data-slot="number-field-decrement"
      className={cn(
        // Hairline divider on the right only (between button and input).
        "border-border border-r hover:bg-accent/50 active:bg-accent",
        "flex size-10 items-center justify-center bg-transparent select-none sm:size-9",
        "disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldScrubArea({
  className,
  ...props
}: BaseNumberField.ScrubArea.Props) {
  return (
    <BaseNumberField.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  );
}

function NumberFieldScrubAreaCursor({
  className,
  ...props
}: BaseNumberField.ScrubAreaCursor.Props) {
  return (
    <BaseNumberField.ScrubAreaCursor
      data-slot="number-field-scrub-area-cursor"
      className={cn("drop-shadow-[0_1px_1px_#0008] filter", className)}
      {...props}
    />
  );
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
};
