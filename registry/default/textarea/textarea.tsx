import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  [
    "placeholder:text-muted-foreground",
    "border border-transparent",
    "aria-invalid:outline-destructive aria-invalid:outline-2 aria-invalid:-outline-offset-1 aria-invalid:outline-solid",
    "flex field-sizing-content min-h-20 w-full rounded-lg px-4 py-3 text-base transition-colors duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:not-pointer-coarse:text-sm",
    "focus-visible:outline-ring outline-0 -outline-offset-1 outline-transparent transition-[outline-width,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:-outline-offset-1",
  ],
  {
    variants: {
      variant: {
        default: "bg-input",
        outline: "bg-(--outline) border-(--outline-border) bg-clip-padding",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>;

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant ?? "default"}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Textarea, textareaVariants, type TextareaProps };
