import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground aria-invalid:outline-destructive/50 aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-solid bg-input border-border/50 flex field-sizing-content min-h-20 w-full rounded-lg border px-4 py-3 text-base shadow-[0_1px_3px_0_oklch(0.18_0_0_/_0.04)] transition-colors duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        "focus-visible:outline-ring/50 outline-0 outline-offset-0 outline-transparent transition-[outline-width,outline-offset,outline-color] duration-100 ease-out outline-solid focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
