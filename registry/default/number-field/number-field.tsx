"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";

import { cn } from "@/lib/utils";

const numberFieldGroupVariants = cva(
  [
    "flex rounded-lg",
    // Outline on the wrapper so focus/invalid rings wrap the full cluster, not just the input.
    "outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid",
    "has-[[data-slot=number-field-input]:focus-visible]:outline-ring/50 has-[[data-slot=number-field-input]:focus-visible]:outline-2 has-[[data-slot=number-field-input]:focus-visible]:outline-offset-2",
    "has-[[data-slot=number-field-input][aria-invalid=true]]:outline-destructive/50 has-[[data-slot=number-field-input][aria-invalid=true]]:outline-2 has-[[data-slot=number-field-input][aria-invalid=true]]:outline-offset-2",
  ],
  {
    variants: {
      variant: {
        // Opaque base: --outline-hover is a -5% darken, giving a sharp hover delta.
        default:
          "[--number-field-bg:var(--input)] [--number-field-hover:var(--outline-hover)]",
        // Translucent base: --surface-hover is an alpha overlay, preserving translucency.
        elevated:
          "[--number-field-bg:var(--input-elevated)] [--number-field-hover:var(--surface-hover)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function NumberField({ className, ...props }: BaseNumberField.Root.Props) {
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
        // border-y only — left/right edges come from the adjacent buttons, fusing into one cluster.
        "border-y bg-(--number-field-bg) bg-clip-padding",
        "h-10 w-24 text-center text-base font-normal tabular-nums transition-colors duration-200 outline-none sm:h-9 md:text-sm",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
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
        // No left border — fuses seamlessly with the input's right edge.
        "rounded-r-lg border-y border-r bg-(--number-field-bg) bg-clip-padding",
        "hover:bg-(--number-field-hover)",
        "flex size-10 items-center justify-center select-none sm:size-9",
        "disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,scale] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        "origin-left active:scale-[0.98]",
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
        // No right border — fuses seamlessly with the input's left edge.
        "rounded-l-lg border-y border-l bg-(--number-field-bg) bg-clip-padding",
        "hover:bg-(--number-field-hover)",
        "flex size-10 items-center justify-center select-none sm:size-9",
        "disabled:pointer-events-none disabled:opacity-60",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,scale] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        "origin-right active:scale-[0.98]",
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
      className={cn(
        "drop-shadow-[0_1px_1px_oklch(0_0_0/0.53)] filter",
        className,
      )}
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
