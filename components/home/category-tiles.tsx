import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/* Abstract, non-interactive illustrations. Deliberately NOT real components:
   each is a small skeleton motif that hints at the category. They share a frame
   and palette so the row reads as a set, while the interior of each differs so
   it never collapses into an identical-card grid. */

function PrimitivesArt() {
  // Discrete atomic shapes: a circle, a pill, a bar, a square.
  return (
    <div className="flex h-full w-full items-center justify-center gap-3">
      <span className="bg-foreground/10 size-9 rounded-full" />
      <div className="flex flex-col gap-2.5">
        <span className="bg-primary/70 h-3 w-16 rounded-full" />
        <span className="bg-foreground/10 h-3 w-12 rounded-full" />
      </div>
      <span className="bg-foreground/10 size-9 rounded-lg" />
    </div>
  );
}

function ComposablesArt() {
  // The same kind of pieces, now assembled into one composed unit.
  return (
    <div className="bg-card border-border/70 flex w-40 flex-col gap-2.5 rounded-lg border p-3 shadow-[var(--surface-shadow-2)]">
      <div className="flex items-center gap-2">
        <span className="bg-foreground/10 size-5 rounded-full" />
        <span className="bg-foreground/10 h-2.5 w-14 rounded-full" />
      </div>
      <span className="bg-foreground/[0.07] h-2.5 w-full rounded-full" />
      <div className="flex items-center justify-between">
        <span className="bg-foreground/[0.07] h-2.5 w-12 rounded-full" />
        <span className="bg-primary h-4 w-10 rounded-md" />
      </div>
    </div>
  );
}

function ThemingArt() {
  // The surface ladder + brand + status hues: the token system itself.
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5">
      <div className="flex items-end gap-1.5">
        {["bg-surface-1", "bg-surface-3", "bg-surface-5", "bg-surface-8"].map(
          (s, i) => (
            <span
              key={s}
              className={cn("border-border/60 w-7 rounded-md border", s)}
              style={{ height: `${20 + i * 6}px` }}
            />
          ),
        )}
        <span className="bg-primary ml-1 h-[38px] w-7 rounded-md" />
      </div>
      <div className="flex gap-1.5">
        <span className="bg-success-foreground size-2 rounded-full" />
        <span className="bg-warning-foreground size-2 rounded-full" />
        <span className="bg-info-foreground size-2 rounded-full" />
        <span className="bg-danger-foreground size-2 rounded-full" />
      </div>
    </div>
  );
}

const TILES = [
  {
    href: "/docs/components/button",
    label: "Primitives",
    desc: "46 accessible building blocks",
    Art: PrimitivesArt,
  },
  {
    href: "/docs/components/command",
    label: "Composables",
    desc: "22 higher-level pieces",
    Art: ComposablesArt,
  },
  {
    href: "/docs/getting-started/theming",
    label: "Theming",
    desc: "OKLCH tokens & surfaces",
    Art: ThemingArt,
  },
];

export function CategoryTiles() {
  return (
    <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
      {TILES.map((tile, i) => (
        <li key={tile.href}>
          <Link
            href={tile.href}
            className={cn(
              "group bg-card block overflow-hidden rounded-2xl",
              "shadow-[var(--surface-shadow-3),var(--surface-rim-3)]",
              "ease-out-expo transition-[transform,box-shadow,translate] duration-300",
              "hover:-translate-y-1 hover:shadow-[var(--surface-shadow-6),var(--surface-rim-6)]",
              "focus-visible:outline-ring/60 outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
              "home-reveal",
            )}
            style={{ ["--reveal-delay" as string]: `${440 + i * 80}ms` }}
          >
            {/* Illustration stage */}
            <div className="bg-muted/40 relative h-28 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                <tile.Art />
              </div>
            </div>
            {/* Caption */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground font-(family-name:--font-display) text-base leading-none font-semibold tracking-tight">
                  {tile.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {tile.desc}
                </span>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="text-muted-foreground size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
