import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Input as BaseInput } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    // Edge: light has no edge (lift comes from shadow-input on default).
    // Dark uses the elevation system's level-1 rim (inset 1px ring via
    // box-shadow) for definition without any layout impact.
    "dark:shadow-surface-rim-1",
    "flex w-full min-w-0 rounded-lg",
    "text-base transition-colors duration-200 md:text-sm",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    "file:text-foreground file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
    "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid font-normal",
  ],
  {
    variants: {
      variant: {
        // Opaque "lifted" bg + soft drop shadow (light only — see
        // --input-shadow). Use on the page or anywhere the substrate is not
        // pure white / surface-3. See the Surfaces docs.
        default: "bg-input shadow-input",
        // Translucent overlay that adapts to substrate. No shadow. Use inside
        // Cards, Dialogs, popovers, or any surface where the opaque default
        // would collapse into its parent.
        elevated: "bg-input-elevated",
      },
      size: {
        default: "h-10 px-3 py-2 sm:h-9",
        sm: "h-9 px-2.5 py-1.5 sm:h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type InputProps = Omit<React.ComponentProps<typeof BaseInput>, "size"> &
  VariantProps<typeof inputVariants>;

function Input({ className, size, variant, ...props }: InputProps) {
  return (
    <BaseInput
      data-slot="input"
      className={cn(inputVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants, type InputProps };
