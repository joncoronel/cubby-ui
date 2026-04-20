import * as React from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = React.ComponentProps<"div"> & {
  visible?: boolean;
  animate?: boolean;
  inverted?: boolean;
};

function Skeleton({
  className,
  children,
  visible = true,
  animate = true,
  inverted = false,
  ...props
}: SkeletonProps) {
  if (!visible && children) {
    return <>{children}</>;
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent rounded-md",
        animate && [
          "animate-shimmer bg-fixed",
          inverted
            ? "bg-[linear-gradient(120deg,transparent_25%,oklch(0_0_0/15%),transparent_75%)]"
            : "bg-[linear-gradient(120deg,transparent_25%,oklch(1_0_0/75%),transparent_75%)]",
          "bg-size-[200%_100%]",
          inverted
            ? "dark:bg-[linear-gradient(120deg,transparent_25%,oklch(0_0_0/75%),transparent_75%)]"
            : "dark:bg-[linear-gradient(120deg,transparent_25%,oklch(1_0_0/15%),transparent_75%)]",
        ],
        children && "*:invisible",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
export { Skeleton };
