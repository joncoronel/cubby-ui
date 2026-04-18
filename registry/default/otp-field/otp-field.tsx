"use client";

import * as React from "react";
import { OTPFieldPreview as BaseOTPField } from "@base-ui/react/otp-field";

import { cn } from "@/lib/utils";

function OTPField({
  className,
  ...props
}: React.ComponentProps<typeof BaseOTPField.Root>) {
  return (
    <BaseOTPField.Root
      data-slot="otp-field"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function OTPFieldInput({
  className,
  ...props
}: React.ComponentProps<typeof BaseOTPField.Input>) {
  return (
    <BaseOTPField.Input
      data-slot="otp-field-input"
      className={cn(
        // Base styling
        "bg-input dark:bg-input/35 border-border flex h-10 w-10 items-center justify-center rounded-lg border text-center text-base font-medium shadow-xs sm:h-9 sm:w-9 md:text-sm",
        // Selection
        "selection:bg-primary selection:text-primary-foreground",
        // Placeholder
        "placeholder:text-muted-foreground focus:placeholder:text-transparent",
        // Focus ring (use :focus not data-[focused], which applies to all inputs)
        "outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid",
        "focus:outline-ring/50 focus:outline-2 focus:outline-offset-2",
        // Invalid state
        "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
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

function OTPFieldGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
