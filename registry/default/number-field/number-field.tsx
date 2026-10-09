"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/default/button/button";

// The group is a field-colored shell, like Button Group's: the input and the
// steppers fill it edge to edge, quiet, so the whole field reads as one
// control. Each carries a 2px transparent border with its paint inside, as
// in Button Group: borders round to whole device pixels the same on every
// side, so the inset stays even at fractional display scales, and the
// steppers' hit areas reach the shell's edges. The shell has Input's height
// and corners per size; the paint's corners are the shell's minus its
// border and the 2px, so they stay concentric and --radius drives both. Set
// [--radius:9999px] for a pill.
const numberFieldGroupVariants = cva(
  [
    "relative flex h-(--number-field-h) w-fit items-stretch rounded-(--number-field-radius) border bg-clip-padding",
    "[--number-field-item-radius:max(0px,calc(var(--number-field-radius)-3px))]",
    // One ring around the whole field while typing or invalid, not just the input.
    "outline-0 outline-offset-0 outline-transparent outline-solid transition-[outline-width,outline-offset,outline-color] duration-100 ease-out",
    "has-[[data-slot=number-field-input]:focus-visible]:outline-ring/50 has-[[data-slot=number-field-input]:focus-visible]:outline-2 has-[[data-slot=number-field-input]:focus-visible]:outline-offset-2",
    "has-[[data-slot=number-field-input][aria-invalid=true]]:outline-destructive/50 has-[[data-slot=number-field-input][aria-invalid=true]]:outline-2 has-[[data-slot=number-field-input][aria-invalid=true]]:outline-offset-2",
    "data-disabled:opacity-60",
    // A scrub label inside the shell is a leading prefix: the value sits
    // beside it instead of centered between steppers.
    "has-[>[data-slot=number-field-scrub-area]]:[&>[data-slot=number-field-input]]:text-left",
  ],
  {
    variants: {
      // Same surfaces as Input and Select.
      variant: {
        default: "bg-input",
        elevated: "bg-input-elevated",
      },
      // Outer height, matching Input (one step taller below sm), and
      // corners that step down with it.
      size: {
        default:
          "[--number-field-h:--spacing(10)] sm:[--number-field-h:--spacing(9)] [--number-field-radius:var(--radius)]",
        sm: "[--number-field-h:--spacing(9)] sm:[--number-field-h:--spacing(8)] [--number-field-radius:calc(var(--radius)-2px)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Steppers use the Button recipe (ghost, so labels go muted → foreground on
// hover), resized to fill the shell. Hover paint is the label color at 10%,
// as in Button Group, so it reads on both surfaces in both modes.
const stepperClasses = cn(
  // size: null drops Button's height ladder; the shell sets the size.
  buttonVariants({ variant: "ghost", size: null }),
  "aspect-square h-auto self-stretch border-2 border-transparent text-sm rounded-(--number-field-item-radius) [--btn-bg-hover:color-mix(in_oklab,currentColor_10%,transparent)] [--btn-bg-active:color-mix(in_oklab,currentColor_10%,transparent)]",
  // Base UI keeps stepper buttons out of the tab order (arrow keys step the
  // input), so they never show a focus ring of their own.
  "data-disabled:opacity-60",
);

type NumberFieldProps = BaseNumberField.Root.Props;

function NumberField({ className, ...props }: NumberFieldProps) {
  return (
    <BaseNumberField.Root
      data-slot="number-field"
      className={cn("flex flex-col items-start gap-1.5", className)}
      {...props}
    />
  );
}

type NumberFieldGroupProps = BaseNumberField.Group.Props &
  VariantProps<typeof numberFieldGroupVariants>;

function NumberFieldGroup({
  className,
  variant,
  size,
  ...props
}: NumberFieldGroupProps) {
  return (
    <BaseNumberField.Group
      data-slot="number-field-group"
      data-size={size ?? "default"}
      className={cn(numberFieldGroupVariants({ variant, size }), className)}
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
        // Bare: the shell carries the surface and the focus ring.
        "w-16 min-w-0 self-stretch border-2 border-transparent bg-transparent px-1 text-center text-base font-normal tabular-nums outline-none md:text-sm",
        // Short inset hairlines against a neighboring stepper, drawn as two
        // background layers on the input's outer (border-box) edges, midway
        // between its paint and the stepper's. Each has zero height until a
        // stepper sits beside it, and collapses to its center while that
        // stepper is hovered or pressed, so the paint never sits against a
        // line.
        "bg-[linear-gradient(var(--border),var(--border)),linear-gradient(var(--border),var(--border))] [background-size:1px_var(--number-field-divider-s,0px),1px_var(--number-field-divider-e,0px)] [background-position:left_center,right_center] bg-no-repeat [background-origin:border-box] transition-[background-size] duration-100 ease-out",
        "has-[+[data-slot=number-field-increment]]:[--number-field-divider-e:calc(100%_-_12px)] has-[+[data-slot=number-field-stepper]]:[--number-field-divider-e:calc(100%_-_12px)] [[data-slot=number-field-decrement]+&]:[--number-field-divider-s:calc(100%_-_12px)]",
        "has-[+[data-slot=number-field-increment]:is(:hover,:active)]:[--number-field-divider-e:0px] has-[+[data-slot=number-field-stepper]:hover]:[--number-field-divider-e:0px] [[data-slot=number-field-decrement]:is(:hover,:active)+&]:[--number-field-divider-s:0px]",
        "disabled:pointer-events-none disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  className,
  children,
  ...props
}: BaseNumberField.Decrement.Props) {
  return (
    <BaseNumberField.Decrement
      data-slot="number-field-decrement"
      aria-label="Decrease"
      className={cn(stepperClasses, className)}
      {...props}
    >
      {children ?? <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />}
    </BaseNumberField.Decrement>
  );
}

function NumberFieldIncrement({
  className,
  children,
  ...props
}: BaseNumberField.Increment.Props) {
  return (
    <BaseNumberField.Increment
      data-slot="number-field-increment"
      aria-label="Increase"
      className={cn(stepperClasses, className)}
      {...props}
    >
      {children ?? <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />}
    </BaseNumberField.Increment>
  );
}

// Increment over decrement on the trailing edge, the styled equivalent of a
// native number spinner. Each half is a quiet stepper: the one corner that
// sits in the shell's corner follows it, and the rest stay tight.
function NumberFieldStepper({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const stepClassName = cn(
    stepperClasses,
    "aspect-auto w-7 flex-1 [&_svg:not([class*='size-'])]:size-3.5",
  );

  return (
    <div
      data-slot="number-field-stepper"
      className={cn("flex flex-col self-stretch", className)}
      {...props}
    >
      <BaseNumberField.Increment
        data-slot="number-field-increment"
        aria-label="Increase"
        className={cn(
          stepClassName,
          "rounded-[3px] rounded-se-(--number-field-item-radius) border-b",
        )}
      >
        <HugeiconsIcon icon={ChevronUpIcon} strokeWidth={2} />
      </BaseNumberField.Increment>
      <BaseNumberField.Decrement
        data-slot="number-field-decrement"
        aria-label="Decrease"
        className={cn(
          stepClassName,
          "rounded-[3px] rounded-ee-(--number-field-item-radius) border-t",
        )}
      >
        <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
      </BaseNumberField.Decrement>
    </div>
  );
}

// Drag horizontally to change the value. Wrap a label outside the group, or
// place it inside the group as a leading prefix (a design tool's W / H
// field), where it sits quiet and brightens on hover and while scrubbing.
function NumberFieldScrubArea({
  className,
  ...props
}: BaseNumberField.ScrubArea.Props) {
  return (
    <BaseNumberField.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn(
        // Children inherit the cursor: a <label> otherwise resets it to the
        // default arrow over its own text.
        "cursor-ew-resize select-none [&_*]:cursor-[inherit]",
        "in-data-[slot=number-field-group]:text-muted-foreground in-data-[slot=number-field-group]:hover:text-foreground in-data-[slot=number-field-group]:data-scrubbing:text-foreground in-data-[slot=number-field-group]:flex in-data-[slot=number-field-group]:items-center in-data-[slot=number-field-group]:ps-2.5 in-data-[slot=number-field-group]:pe-1 in-data-[slot=number-field-group]:text-sm in-data-[slot=number-field-group]:font-medium in-data-[slot=number-field-group]:transition-colors in-data-[slot=number-field-group]:duration-100",
        className,
      )}
      {...props}
    />
  );
}

// The cursor shown while scrubbing (the real one is hidden and locked).
// Defaults to a two-way arrow drawn like a system resize cursor.
function NumberFieldScrubAreaCursor({
  className,
  children,
  ...props
}: BaseNumberField.ScrubAreaCursor.Props) {
  return (
    <BaseNumberField.ScrubAreaCursor
      data-slot="number-field-scrub-area-cursor"
      className={cn("drop-shadow-[0_1px_1px_oklch(0_0_0/0.4)]", className)}
      {...props}
    >
      {children ?? (
        <svg
          width="26"
          height="14"
          viewBox="0 0 26 14"
          fill="black"
          stroke="white"
          aria-hidden
        >
          <path d="M19.5 5.5L6.5 5.52V2L1 7l5.5 5-.01-3.5H19.5V12L25 7l-5.5-5v3.5Z" />
        </svg>
      )}
    </BaseNumberField.ScrubAreaCursor>
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
  numberFieldGroupVariants,
};

export type { NumberFieldProps, NumberFieldGroupProps };
