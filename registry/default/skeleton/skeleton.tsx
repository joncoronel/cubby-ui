import * as React from "react";

import { cn } from "@/lib/utils";

import "./skeleton.css";

type SkeletonProps = React.ComponentProps<"div"> & {
  visible?: boolean;
  animate?: boolean;
  inverted?: boolean;
  multiline?: boolean;
};

function Skeleton({
  className,
  children,
  visible = true,
  animate = true,
  inverted = false,
  multiline = false,
  ...props
}: SkeletonProps) {
  if (!visible && children) {
    return <>{children}</>;
  }

  const classes = cn(
    "bg-accent rounded-md",
    animate && [
      "skeleton-shimmer bg-fixed",
      inverted
        ? "bg-[linear-gradient(90deg,transparent_25%,oklch(0_0_0/15%)_50%,transparent_60%)]"
        : "bg-[linear-gradient(90deg,transparent_25%,oklch(1_0_0/75%)_50%,transparent_60%)]",
      "bg-size-[200%_100%]",
      inverted
        ? "dark:bg-[linear-gradient(90deg,transparent_25%,oklch(0_0_0/75%)_50%,transparent_60%)]"
        : "dark:bg-[linear-gradient(90deg,transparent_25%,oklch(1_0_0/15%)_50%,transparent_60%)]",
    ],
    className,
  );

  if (multiline) {
    return (
      <span
        data-slot="skeleton"
        className={cn(
          classes,
          "inline text-transparent [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
        )}
        {...(props as React.ComponentProps<"span">)}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(classes, children && "*:invisible")}
      {...props}
    >
      {children}
    </div>
  );
}
export { Skeleton };
