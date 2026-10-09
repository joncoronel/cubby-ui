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

// A field-colored shell, like Button Group's. The input and steppers fill it
// with a 2px transparent-border inset (even at fractional display scales).
// Paint corners are the shell's minus its border and the 2px.
const numberFieldGroupVariants = cva(
  [
    "relative flex h-(--number-field-h) w-fit items-stretch rounded-(--number-field-radius) border bg-clip-padding",
    "[--number-field-item-radius:max(0px,calc(var(--number-field-radius)-3px))]",
    // Focus and invalid rings
    "outline-0 outline-offset-0 outline-transparent outline-solid transition-[outline-width,outline-offset,outline-color] duration-100 ease-out",
    "has-[[data-slot=number-field-input]:focus-visible]:outline-ring/50 has-[[data-slot=number-field-input]:focus-visible]:outline-2 has-[[data-slot=number-field-input]:focus-visible]:outline-offset-2",
    "has-[[data-slot=number-field-input][aria-invalid=true]]:outline-destructive/50 has-[[data-slot=number-field-input][aria-invalid=true]]:outline-2 has-[[data-slot=number-field-input][aria-invalid=true]]:outline-offset-2",
    // Disabled: dims once here; the steppers' own disabled opacity is
    // cancelled so it doesn't stack. A stepper alone at min or max still dims.
    "data-disabled:opacity-60 data-disabled:[&_button]:opacity-100",
    // Inline scrub prefix
    "has-[>[data-slot=number-field-scrub-area]]:[&>[data-slot=number-field-input]]:text-left",
  ],
  {
    variants: {
      // Input's surfaces
      variant: {
        default: "bg-input",
        elevated: "bg-input-elevated",
      },
      // Input's heights (one step taller below sm); corners step with them.
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

// Ghost Button recipe, sized by the shell. Hover and press are the label
// color at 10% / 14%, as in Button Group.
const stepperClasses = cn(
  buttonVariants({ variant: "ghost", size: null }),
  "aspect-square h-auto self-stretch border-2 border-transparent text-sm rounded-(--number-field-item-radius) [--btn-bg-hover:color-mix(in_oklab,currentColor_10%,transparent)] [--btn-bg-active:color-mix(in_oklab,currentColor_14%,transparent)]",
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
      data-variant={variant ?? "default"}
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
        "w-16 min-w-0 self-stretch border-2 border-transparent bg-transparent px-1 text-center text-base font-normal tabular-nums outline-none md:text-sm",
        // Dividers: two background layers on the input's edges. Each shows
        // only beside a stepper and collapses while that stepper is lit.
        "bg-[linear-gradient(var(--border),var(--border)),linear-gradient(var(--border),var(--border))] [background-size:1px_var(--number-field-divider-s,0px),1px_var(--number-field-divider-e,0px)] [background-position:left_center,right_center] bg-no-repeat [background-origin:border-box] transition-[background-size] duration-100 ease-out motion-reduce:transition-none",
        "has-[+[data-slot=number-field-increment]]:[--number-field-divider-e:calc(100%_-_12px)] has-[+[data-slot=number-field-stepper]]:[--number-field-divider-e:calc(100%_-_12px)] [[data-slot=number-field-decrement]+&]:[--number-field-divider-s:calc(100%_-_12px)]",
        // Hover is gated to real hover: a raw :hover sticks after a tap.
        "has-[+[data-slot=number-field-increment]:active]:[--number-field-divider-e:0px] has-[+[data-slot=number-field-stepper]:active]:[--number-field-divider-e:0px] [[data-slot=number-field-decrement]:active+&]:[--number-field-divider-s:0px]",
        "[@media(hover:hover)]:has-[+[data-slot=number-field-increment]:hover]:[--number-field-divider-e:0px] [@media(hover:hover)]:has-[+[data-slot=number-field-stepper]:hover]:[--number-field-divider-e:0px] [@media(hover:hover)]:[[data-slot=number-field-decrement]:hover+&]:[--number-field-divider-s:0px]",
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

// Appends a consumer className, including Base UI's function-of-state form.
function withClassName<State>(
  base: string,
  className: string | ((state: State) => string | undefined) | undefined,
): string | ((state: State) => string) {
  if (typeof className === "function") {
    return (state) => cn(base, className(state));
  }
  return cn(base, className);
}

type NumberFieldStepperProps = React.ComponentProps<"div"> & {
  /** Props for the increment half, e.g. a localized `aria-label`. */
  incrementProps?: BaseNumberField.Increment.Props;
  /** Props for the decrement half, e.g. a localized `aria-label`. */
  decrementProps?: BaseNumberField.Decrement.Props;
};

// Stacked chevrons, like a native spinner. Only the corner inside the
// shell's corner follows it; the rest stay tight.
function NumberFieldStepper({
  className,
  incrementProps,
  decrementProps,
  ...props
}: NumberFieldStepperProps) {
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
        {...incrementProps}
        className={withClassName(
          cn(
            stepClassName,
            "rounded-[3px] rounded-se-(--number-field-item-radius) border-b",
          ),
          incrementProps?.className,
        )}
      >
        <HugeiconsIcon icon={ChevronUpIcon} strokeWidth={2} />
      </BaseNumberField.Increment>
      <BaseNumberField.Decrement
        data-slot="number-field-decrement"
        aria-label="Decrease"
        {...decrementProps}
        className={withClassName(
          cn(
            stepClassName,
            "rounded-[3px] rounded-ee-(--number-field-item-radius) border-t",
          ),
          decrementProps?.className,
        )}
      >
        <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
      </BaseNumberField.Decrement>
    </div>
  );
}

// Wraps a label outside the group, or sits inside it as a quiet prefix.
function NumberFieldScrubArea({
  className,
  ...props
}: BaseNumberField.ScrubArea.Props) {
  return (
    <BaseNumberField.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn(
        // A <label> otherwise resets the cursor over its text.
        "cursor-ew-resize select-none [&_*]:cursor-[inherit]",
        // As a plain span it takes the body line height, leaving space under
        // the label.
        "flex w-fit items-center",
        "in-data-[slot=number-field-group]:text-muted-foreground in-data-[slot=number-field-group]:hover:text-foreground in-data-[slot=number-field-group]:data-scrubbing:text-foreground in-data-[slot=number-field-group]:flex in-data-[slot=number-field-group]:items-center in-data-[slot=number-field-group]:ps-2.5 in-data-[slot=number-field-group]:pe-1 in-data-[slot=number-field-group]:text-sm in-data-[slot=number-field-group]:font-medium in-data-[slot=number-field-group]:transition-colors in-data-[slot=number-field-group]:duration-100",
        className,
      )}
      {...props}
    />
  );
}

// Replaces the locked pointer while scrubbing. Defaults to a two-way arrow.
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

export type {
  NumberFieldProps,
  NumberFieldGroupProps,
  NumberFieldStepperProps,
};
