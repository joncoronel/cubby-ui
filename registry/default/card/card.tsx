import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("text-card-foreground flex flex-col", {
  variants: {
    variant: {
      default: "bg-card gap-6 rounded-2xl border dark:border-border/50 py-6",
      inset: "rounded-2xl p-1 bg-muted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-[[data-slot=card-action]]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        "[[data-variant=default]>_&]:gap-1.5 [[data-variant=default]>_&]:px-6",
        "[[data-variant=inset]>_&]:px-3 [[data-variant=inset]>_&]:py-2 [[data-variant=inset]>_&]:pt-1",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-semibold [[data-variant=default]_&]:leading-none",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "[[data-variant=default]>_&]:px-6",
        "[[data-variant=inset]>_&]:bg-card [[data-variant=inset]>_&]:border-border/25 [[data-variant=inset]>_&]:flex [[data-variant=inset]>_&]:flex-1 [[data-variant=inset]>_&]:flex-col [[data-variant=inset]>_&]:rounded-lg [[data-variant=inset]>_&]:border [[data-variant=inset]>_&]:bg-clip-padding [[data-variant=inset]>_&]:p-4",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center [.border-t]:pt-6",
        "[[data-variant=default]>_&]:px-6",
        "[[data-variant=inset]>_&]:mt-auto [[data-variant=inset]>_&]:justify-end [[data-variant=inset]>_&]:pt-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardAction,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
