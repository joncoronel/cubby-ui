"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border border-border/70 px-4 py-3 pl-6 text-sm grid has-[>svg]:grid-cols-[auto_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:row-span-2 [&>svg]:text-current shadow-sm has-[*[data-slot=alert-action]]:grid-cols-[0_1fr] has-[>svg]:has-[*[data-slot=alert-action]]:grid-cols-[auto_1fr] sm:has-[*[data-slot=alert-action]]:grid-cols-[0_1fr_auto] sm:has-[>svg]:has-[*[data-slot=alert-action]]:grid-cols-[auto_1fr_auto] [&>svg]:size-5 group before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:rounded-full bg-card dark:bg-muted",
  {
    variants: {
      variant: {
        default: "[&>svg]:text-card-foreground  before:bg-border",
        warning:
          "  [&>svg]:text-warning-foreground before:bg-warning-foreground",
        danger: " [&>svg]:text-danger-foreground  before:bg-danger-foreground",
        info: "  [&>svg]:text-info-foreground  before:bg-info-foreground",
        success:
          "  [&>svg]:text-success-foreground before:bg-success-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AlertProps
  extends useRender.ComponentProps<"div">, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, render, ...props }: AlertProps) {
  const defaultProps = {
    "data-slot": "alert",
    role: "alert" as const,
    className: cn(alertVariants({ variant }), className),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

export type AlertTitleProps = useRender.ComponentProps<"h4">;

function AlertTitle({ className, render, ...props }: AlertTitleProps) {
  const defaultProps = {
    "data-slot": "alert-title",
    className: cn(
      "col-start-2 min-h-4 font-medium tracking-tight row-span-2 self-center group-has-[*[data-slot=alert-description]]:row-span-1 text-card-foreground",
      className,
    ),
  };

  const element = useRender({
    defaultTagName: "h4",
    render,
    props: mergeProps<"h4">(defaultProps, props),
  });

  return element;
}

export type AlertDescriptionProps = useRender.ComponentProps<"div">;

function AlertDescription({
  className,
  render,
  ...props
}: AlertDescriptionProps) {
  const defaultProps = {
    "data-slot": "alert-description",
    className: cn(
      "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed row-span-2 self-center group-has-[*[data-slot=alert-title]]:row-span-1 text-muted-foreground",
      className,
    ),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

export type AlertActionProps = useRender.ComponentProps<"div">;

function AlertAction({ className, render, ...props }: AlertActionProps) {
  const defaultProps = {
    "data-slot": "alert-action",
    className: cn(
      "col-start-2 flex gap-2 mt-2 sm:col-start-3 sm:row-start-1 sm:row-span-2 sm:self-center sm:ml-4 sm:mt-0 ",
      className,
    ),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
