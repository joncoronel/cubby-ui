import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const separatorVariants = cva(
  "shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
  {
    variants: {
      variant: {
        default: "bg-border",
        thick:
          "bg-border data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5",
        dashed:
          "border-t-2 border-dashed border-border bg-transparent data-[orientation=horizontal]:h-0 data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:border-t-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface SeparatorProps
  extends Omit<React.ComponentProps<typeof BaseSeparator>, "className">,
    VariantProps<typeof separatorVariants> {
  className?: string;
}

function Separator({
  className,
  orientation = "horizontal",
  variant,
  ...props
}: SeparatorProps) {
  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      className={cn(
        separatorVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
}

export { Separator, separatorVariants };
