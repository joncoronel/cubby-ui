import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      data-slot="switch"
      className={cn(
        "peer data-checked:bg-primary focus-visible:border-ring focus-visible:ring-ring/30 data-unchecked:bg-accent bg-muted inline-flex h-6 w-11 shrink-0 items-center rounded-full inset-shadow-xs transition-all duration-200 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background ease-out-cubic pointer-events-none block size-5 rounded-full shadow-[0_1px_2px_0_oklch(0.18_0_0/0.15)] ring-0 transition-all duration-200 data-checked:translate-x-[1.375rem] data-unchecked:translate-x-0.5",
        )}
      />
    </BaseSwitch.Root>
  );
}

export { Switch };
