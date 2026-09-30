import { CubbyUILogo } from "@/components/cubbyui-logo";
import { cn } from "@/lib/utils";

/** The Cubby mark with its name, as the nav, phone menu and footer set it. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <CubbyUILogo className="h-5 w-auto" />
      <span className="font-(family-name:--font-display) text-[1.1rem] leading-none font-semibold tracking-tight">
        Cubby UI
      </span>
    </span>
  );
}
