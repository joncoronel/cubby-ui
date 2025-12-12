"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "@/lib/utils";

const fancyButtonVariants = cva(
  "relative inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-sm font-medium transition-[color,background-color,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,transform,scale,opacity,outline-width,outline-offset,outline-color]  outline-0 outline-offset-0 outline-transparent  disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 rounded-lg active:scale-[0.98] focus-visible:outline-ring/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid",
  {
    variants: {
      variant: {
        default:
          "bg-[oklch(0.3_0_0)] hover:bg-[oklch(0.35_0_0)] dark:hover:bg-[oklch(0.22_0_0)] dark:bg-[oklch(0.2_0_0)] text-primary-foreground ring-1 ring-[oklch(0.15_0_0)] dark:text-secondary-foreground shadow-[inset_0_1px_1px_oklch(1_0_0_/_0.2),0_1px_2px_0_oklch(0.1_0_0_/_0.07)]",
        custom:
          "shadow-[inset_0_1px_1px_oklch(1_0_0_/_0.4),0_1px_2px_0_oklch(0.1_0_0_/_0.07),inset_0_-0.5px_1px_oklch(0_0_0_/_0.1)] dark:shadow-[inset_0_1px_1px_oklch(1_0_0_/_0.2),0_1px_2px_0_oklch(0.1_0_0_/_0.07),inset_0_-1px_1px_oklch(0_0_0_/_0.1)] text-white ring-1 hover:opacity-90",
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
      variant: "default",
      size: "default",
    },
  },
);

type FancyButtonProps = BaseButton.Props &
  VariantProps<typeof fancyButtonVariants> & {
    color?: string;
    leftSection?: React.ReactNode;
    rightSection?: React.ReactNode;
  };

export const FancyButton = ({
  children,
  size,
  color,
  leftSection,
  rightSection,
  className,
  style,
  ...props
}: FancyButtonProps) => {
  const variant = color ? "custom" : "default";

  let dynamicClasses = "";
  let dynamicStyle: React.CSSProperties = {};

  if (color && variant === "custom") {
    // Set CSS variables for color-mix values, then use them in Tailwind classes
    dynamicStyle = {
      "--btn-from": `color-mix(in oklch, ${color}, black 0%)`,
      "--btn-to": `color-mix(in oklch, ${color}, black 10%)`,
      "--btn-ring": `color-mix(in oklch, ${color}, black 10%)`,
      backgroundColor: color,
    } as React.CSSProperties;

    dynamicClasses =
      "bg-gradient-to-b from-[var(--btn-from)] to-[var(--btn-to)] ring-[var(--btn-ring)]";
  }

  const buttonContent = (
    <>
      {leftSection}
      <span className="px-1">{children}</span>
      {rightSection}
    </>
  );

  return (
    <BaseButton
      data-slot="fancy-button"
      data-size={size}
      data-variant={variant}
      className={cn(
        fancyButtonVariants({ variant, size }),
        dynamicClasses,

        className,
      )}
      style={{
        ...dynamicStyle,
        ...style,
      }}
      {...props}
    >
      {buttonContent}
    </BaseButton>
  );
};

export default FancyButton;
