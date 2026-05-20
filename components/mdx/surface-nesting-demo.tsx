import { cn } from "@/lib/utils";
import { solidSurface } from "@/registry/default/lib/elevated";

/**
 * Visualizes the elevation system as a nested stack of substrates:
 * Page → Card → Popover → Menu. Each level uses its canonical level + shadow
 * pairing, so the demo doubles as documentation for the defaults.
 *
 * Renders in the reader's current theme — flip the site theme to see the
 * other side.
 */
export function SurfaceNestingDemo() {
  return (
    <div className="not-prose bg-background flex flex-col gap-2 rounded-xl border p-4">
      <Layer label="Page">
        <Layer level={3} shadow={1} label="Card">
          <Layer level={5} shadow={3} label="Popover">
            <Layer level={7} shadow={5} label="Menu" leaf />
          </Layer>
        </Layer>
      </Layer>
    </div>
  );
}

function Layer({
  level,
  shadow,
  label,
  leaf,
  children,
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  shadow?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  label: string;
  leaf?: boolean;
  children?: React.ReactNode;
}) {
  // Top "Page" layer renders as a flat surface using bg-background so it
  // matches the actual page substrate; inner layers use the elevation helpers.
  const isPage = level === undefined;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl p-5",
        isPage ? "bg-background border" : solidSurface(level, shadow ?? level),
        leaf && "p-4",
      )}
    >
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}
