"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";

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

// Vertically-stacked increment (top) / decrement (bottom) cluster for the
// right edge of the group — the styled equivalent of a native number spinner.
// Pair with `<NumberFieldInput className="rounded-l-lg border-l" />` so the
// input caps the left side of the cluster.
function NumberFieldStepper({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const stepClassName = cn(
    "hover:bg-(--number-field-hover) flex flex-1 items-center justify-center px-2 select-none",
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-60",
  );

  return (
    <div
      data-slot="number-field-stepper"
      className={cn(
        // `border` (all four sides): the left edge is the divider against the input.
        "flex flex-col self-stretch overflow-hidden rounded-r-lg border bg-(--number-field-bg) bg-clip-padding",
        className,
      )}
      {...props}
    >
      <BaseNumberField.Increment
        data-slot="number-field-increment"
        className={cn(stepClassName, "border-b")}
        aria-label="Increase"
      >
        <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" strokeWidth={2} />
      </BaseNumberField.Increment>
      <BaseNumberField.Decrement
        data-slot="number-field-decrement"
        className={stepClassName}
        aria-label="Decrease"
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-3.5"
          strokeWidth={2}
        />
      </BaseNumberField.Decrement>
    </div>
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
  NumberFieldStepper,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
};
