"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center cursor-pointer justify-center whitespace-nowrap rounded-lg text-sm font-medium data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color,scale,opacity,shadow] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid active:shadow-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        neutral: "bg-neutral text-neutral-foreground  hover:bg-neutral/90",
        destructive:
          "bg-destructive text-destructive-foreground  hover:bg-destructive/90  border border-black/5 dark:border-white/5",
        outline:
          "border bg-clip-padding bg-card dark:bg-input/35 hover:bg-accent/50 dark:hover:bg-input/60 hover:text-accent-foreground in-data-[slot=button-group]:shadow-xs not-disabled:not-active:not-data-pressed:not-in-data-[slot=button-group]:before:shadow-inset dark:not-disabled:not-active:not-data-pressed:not-in-data-[slot=button-group]:before:shadow-inset-highlight [:disabled,:active,[data-pressed]]:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent ",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent shadow-none border border-transparent",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 sm:h-9 px-3 py-2 gap-1",
        xs: "h-8 sm:h-7 px-2 py-1.5 gap-0.5 text-xs rounded-md",
        sm: "h-9 sm:h-8  px-2 py-1.5 gap-0.5",
        lg: "h-11 sm:h-10  px-3.5 py-2.5 gap-1",
        icon: "size-10 sm:size-9",
        icon_xs: "size-8 sm:size-7 rounded-md",
        icon_sm: "size-9 sm:size-8",
        icon_lg: "size-11 sm:size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = BaseButton.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
  };

function Button({
  className,
  variant,
  size,
  loading,
  children,
  disabled,
  leftSection,
  rightSection,
  ...props
}: ButtonProps) {
  const buttonContent = (
    <>
      {leftSection}
      <span className="px-1">{children}</span>
      {rightSection}
    </>
  );

  return (
    <BaseButton
      data-slot="button"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ variant, size }),

        className,
      )}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      {...props}
    >
      {buttonContent}
    </BaseButton>
  );
}

export { Button, buttonVariants };
