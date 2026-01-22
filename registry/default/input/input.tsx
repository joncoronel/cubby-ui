import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({
  className,
  ...props
}: React.ComponentProps<typeof BaseInput>) {
  return (
    <BaseInput
      data-slot="input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input dark:bg-input/35 border-border flex h-10 w-full min-w-0 rounded-lg border bg-clip-padding px-3 py-2 text-base shadow-xs transition-colors duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:h-9 md:text-sm",
        "file:text-foreground file:inline-flex file:h-7 file:rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        "aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid font-normal",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
