import * as React from "react";

import { cn } from "@/lib/utils";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number | `${number}/${number}`;
}

function AspectRatio({
  children,
  className,
  ratio = 1,
  style,
  ...props
}: AspectRatioProps) {
  const aspectRatio =
    typeof ratio === "string"
      ? ratio
          .split("/")
          .map(Number)
          .reduce((a, b) => a / b)
      : ratio;

  return (
    <div
      data-slot="aspect-ratio"
      style={{
        ...style,
        aspectRatio: aspectRatio.toString(),
      }}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { AspectRatio };
