"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { solidSurface, type SurfaceLevel } from "@/registry/default/lib/elevated";
import { CopyButton } from "@/registry/default/copy-button/copy-button";

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

/**
 * Interactive teaching aid for the elevation system. The reader dials the two
 * knobs (`level` = surface color, `shadowLevel` = shadow weight) and watches a
 * floating panel respond, with the matching `solidSurface(level, shadow)` call
 * shown live. Demonstrates the light-mode subtlety too: levels 3+ share one
 * white, so only the shadow moves until you switch to dark.
 */
export function SurfacePlayground() {
  const [level, setLevel] = React.useState<SurfaceLevel>(5);
  const [shadow, setShadow] = React.useState<SurfaceLevel>(5);

  const code = `solidSurface(${level}, ${shadow})`;

  return (
    <div className="not-prose bg-background @container my-6 overflow-hidden rounded-xl border">
      {/* Stage: the floating panel sits over a faux page so its shadow reads. */}
      <div className="bg-muted/40 relative flex min-h-64 items-center justify-center overflow-hidden p-8">
        {/* Faint placeholder page content behind the panel. */}
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col gap-3 p-6 opacity-60 select-none"
        >
          <div className="bg-foreground/[0.06] h-2.5 w-1/3 rounded-full" />
          <div className="bg-foreground/[0.05] h-2 w-2/3 rounded-full" />
          <div className="bg-foreground/[0.05] h-2 w-1/2 rounded-full" />
        </div>

        {/* The floating panel — a mini menu, so it reads as a real popover. */}
        <div
          className={cn(
            "ease-out-expo relative w-56 rounded-xl p-1.5 transition-[background-color,box-shadow] duration-500 motion-reduce:transition-none",
            solidSurface(level, shadow),
          )}
        >
          <div className="text-muted-foreground px-2.5 pt-1.5 pb-1 text-[0.6875rem] font-medium tracking-wide">
            Menu
          </div>
          {["Profile", "Settings", "Sign out"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "text-foreground rounded-md px-2.5 py-1.5 text-sm transition-colors",
                i === 0 && "bg-(--surface-selected) font-medium",
                i !== 0 && "hover:bg-(--surface-hover)",
              )}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Controls + live code. */}
      <div className="flex flex-col gap-5 border-t p-4 sm:p-5">
        {/* Grid so both steppers share one auto-sized label column: it fits the
            widest label (`shadowLevel`) exactly and keeps the pills aligned. */}
        <div className="flex flex-col gap-4 @sm:grid @sm:grid-cols-[auto_1fr] @sm:items-center @sm:gap-x-4 @sm:gap-y-4">
          <Stepper label="Surface" hint="level" value={level} onChange={setLevel} />
          <Stepper
            label="Shadow"
            hint="shadowLevel"
            value={shadow}
            onChange={setShadow}
          />
        </div>

        <div className="bg-muted/60 flex items-center justify-between gap-2 rounded-lg border py-1 pr-1 pl-3">
          <code className="text-foreground font-mono text-sm">
            <span className="text-muted-foreground">solidSurface</span>(
            <span className="text-primary-soft-foreground">{level}</span>,{" "}
            <span className="text-primary-soft-foreground">{shadow}</span>)
          </code>
          <CopyButton content={code} />
        </div>
      </div>
    </div>
  );
}

function Stepper({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: SurfaceLevel;
  onChange: (v: SurfaceLevel) => void;
}) {
  const groupLabel = `${label} (${hint})`;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(8, value + 1) as SurfaceLevel);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, value - 1) as SurfaceLevel);
    }
  }

  return (
    <div className="contents">
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-foreground text-sm font-medium">{label}</span>
        <code className="text-muted-foreground font-mono text-xs">{hint}</code>
      </div>
      <div
        role="radiogroup"
        aria-label={groupLabel}
        onKeyDown={handleKeyDown}
        className="flex gap-1"
      >
        {LEVELS.map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${label} ${n}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(n)}
              className={cn(
                "ease-out-expo focus-visible:ring-ring flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md font-mono text-xs transition-[background-color,color,box-shadow] duration-150 outline-none focus-visible:ring-2",
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-(--surface-hover) hover:text-foreground border",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
