import { cn } from "@/lib/utils";
import { solidSurface } from "@/registry/default/lib/elevated";

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Visualizes each `solidSurface(level)` token as a circle. Renders in the
 * reader's current theme — flip the site theme to see the other side.
 */
export function SurfaceTokensDemo() {
  return (
    <div className="not-prose bg-background flex flex-col gap-6 rounded-xl border px-4 py-8">
      <div className="flex items-end justify-between gap-2">
        {LEVELS.map((level) => (
          <div key={level} className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "size-12 rounded-full sm:size-14",
                solidSurface(level, level),
              )}
            />
            <span className="text-muted-foreground text-xs">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
