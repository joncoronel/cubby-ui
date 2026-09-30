"use client";

import * as React from "react";
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field";

import { cn } from "@/lib/utils";
import { TextMorph } from "@/registry/default/text-morph/text-morph";

import "./otp-field.css";

function OTPField({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseOTPField.Root>) {
  return (
    <BaseOTPField.Root
      data-slot="otp-field"
      className={cn(
        "group/otp-field relative flex items-center gap-2",
        className,
      )}
      {...props}
    >
      {children}
      {/* One focus ring for the field, anchored to the focused slot in CSS. */}
      <span
        aria-hidden="true"
        data-slot="otp-field-indicator"
        className="otp-field-indicator outline-ring/50 group-data-[invalid]/otp-field:outline-destructive/50 outline-2 outline-offset-2 outline-solid"
      />
    </BaseOTPField.Root>
  );
}

export type OTPFieldInputProps = Omit<
  React.ComponentProps<typeof BaseOTPField.Input>,
  "className" | "style" | "render"
> & {
  /** Applied to the visible slot around the input. */
  className?: string;
  style?: React.CSSProperties;
  variant?: "default" | "elevated";
};

function OTPFieldInput({
  className,
  style,
  variant = "default",
  ...props
}: OTPFieldInputProps) {
  return (
    <BaseOTPField.Input
      data-slot="otp-field-input"
      {...props}
      render={(inputProps, state) => {
        const invalid =
          inputProps["aria-invalid"] === true ||
          inputProps["aria-invalid"] === "true";
        // A masked slot shows a dot instead of the character.
        const masked = inputProps.type === "password";
        const shown = masked && state.value ? "•" : state.value;

        return (
          <span
            data-slot="otp-field-slot"
            data-filled={state.filled ? "" : undefined}
            data-invalid={invalid ? "" : undefined}
            data-disabled={state.disabled ? "" : undefined}
            className={cn(
              // Base styling
              "relative flex h-10 w-10 cursor-text items-center justify-center rounded-[var(--otp-field-radius,var(--radius-lg))] border bg-clip-padding text-base font-medium tabular-nums sm:h-9 sm:w-9 md:text-sm",
              variant === "default" ? "bg-input" : "bg-input-elevated",
              // Invalid state (the focused slot's ring comes from the root)
              "data-[invalid]:outline-destructive/50 data-[invalid]:outline-2 data-[invalid]:outline-offset-2 data-[invalid]:outline-solid",
              // Disabled state
              "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
              className,
            )}
            style={style}
          >
            {/* The real input fills the slot, its own text and selection
                hidden: the character is drawn above. */}
            <input
              {...inputProps}
              className={cn(
                "absolute inset-0 size-full cursor-text rounded-[inherit] bg-transparent text-center outline-none [font:inherit]",
                // Text and caret color are set in otp-field.css.
                "selection:bg-transparent",
                "placeholder:text-muted-foreground placeholder:[-webkit-text-fill-color:currentColor] focus:placeholder:text-transparent",
              )}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <TextMorph
                value={shown}
                className={cn(
                  "otp-field-glyph",
                  masked && "text-[1.5em] leading-none",
                )}
                mode="roll"
                duration={380}
                options={{ trend: "up", roll: { rotate: 0 } }}
              />
            </span>
          </span>
        );
      }}
    />
  );
}

function OTPFieldSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseOTPField.Separator>) {
  return (
    <BaseOTPField.Separator
      data-slot="otp-field-separator"
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children ?? <SeparatorDash />}
    </BaseOTPField.Separator>
  );
}

function OTPFieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="otp-field-group"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function SeparatorDash(props: React.ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 2"
      width="8"
      height="2"
      fill="none"
      {...props}
    >
      <path
        d="M1 1H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { OTPField, OTPFieldInput, OTPFieldSeparator, OTPFieldGroup };
