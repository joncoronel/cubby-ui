import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-2 [&>svg]:pointer-events-none focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-transparent text-primary-foreground shadow-[0_1px_3px_0_oklch(0.22_0_0_/_0.12)]",
        neutral: "bg-neutral border-transparent text-neutral-foreground",
        outline: "text-foreground bg-background border",
        secondary: "bg-secondary border-secondary/40 text-secondary-foreground",
        success: "bg-success border-success-border text-success-foreground",
        warning: "bg-warning border-warning-border text-warning-foreground",
        info: "bg-info border-info-border text-info-foreground",
        danger: "bg-danger border-danger-border text-danger-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
