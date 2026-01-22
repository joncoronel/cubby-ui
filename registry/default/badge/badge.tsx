import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid overflow-hidden shadow-[0_1px_2px_0_oklch(0.18_0_0_/_0.06)] ",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-transparent text-primary-foreground shadow-[0_1px_3px_0_oklch(0.22_0_0_/_0.12)]",
        outline: "text-foreground bg-background border-border/60",
        secondary: "bg-secondary border-secondary/40 text-secondary-foreground",
        success:
          "bg-success border-transparent text-success-foreground shadow-[0_1px_3px_0_oklch(0.48_0.08_140_/_0.10)]",
        warning:
          "bg-warning border-transparent text-warning-foreground shadow-[0_1px_3px_0_oklch(0.62_0.08_50_/_0.10)]",
        info: "bg-info border-transparent text-info-foreground shadow-[0_1px_3px_0_oklch(0.48_0.08_220_/_0.10)]",
        danger:
          "bg-danger border-transparent text-danger-foreground shadow-[0_1px_3px_0_oklch(0.55_0.12_20_/_0.10)]",
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
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
