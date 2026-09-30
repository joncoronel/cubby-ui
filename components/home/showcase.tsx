"use client";

import * as React from "react";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { CopyButton } from "@/registry/default/copy-button/copy-button";
import { solidSurface } from "@/registry/default/lib/elevated";
import { usePackageManager } from "@/components/mdx/use-package-manager";
import { packageManagerCommands } from "@/components/mdx/package-manager-commands";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  slug: string;
  name: string;
  demo: React.ReactNode;
}

/** How long each showpiece stays before the next one comes in. */
const DWELL_MS = 5200;

/**
 * The hero's proof: one install command joined to the component it
 * installs. The command's component name changes letter by letter and the
 * component above it swaps in, live. It moves on by itself until the reader
 * picks one, points at it, or focuses inside it.
 */
export function Showcase({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [chosen, setChosen] = React.useState(false);
  const [pm] = usePackageManager();
  const tablistId = React.useId();

  React.useEffect(() => {
    if (held || chosen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(
      () => setIndex((i) => (i + 1) % items.length),
      DWELL_MS,
    );
    return () => window.clearTimeout(id);
  }, [index, held, chosen, items.length]);

  const item = items[index];
  const command = packageManagerCommands(
    `shadcn@latest add @cubby-ui/${item.slug}`,
    "run",
  )[pm];
  // The scope and name always stay on screen; on a narrow screen the
  // start of the command gives way instead.
  const scope = "@cubby-ui/";
  const head = command.slice(
    0,
    command.length - item.slug.length - scope.length,
  );
  const auto = !held && !chosen;

  return (
    <div
      className="flex w-full flex-col gap-3"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
    >
      <div
        role="tablist"
        aria-label="Showcased components"
        id={tablistId}
        className="scroll-fade-x -mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <button
            key={it.slug}
            type="button"
            role="tab"
            aria-selected={i === index}
            onClick={() => {
              setChosen(true);
              setIndex(i);
            }}
            className={cn(
              "relative h-8 shrink-0 overflow-hidden rounded-full px-3 text-sm font-medium outline-0 outline-offset-2 outline-transparent outline-solid focus-visible:outline-2 focus-visible:outline-(--land-on-field)",
              i === index
                ? "bg-(--land-on-field) text-(--land-field)"
                : "text-(--land-on-field-muted) hover:bg-(--land-field-line) hover:text-(--land-on-field)",
            )}
          >
            {i === index && auto && (
              <span
                key={index}
                aria-hidden="true"
                style={{ ["--dwell" as string]: `${DWELL_MS}ms` }}
                className="land-dwell absolute inset-x-3 bottom-1 h-px bg-(--land-field)/40"
              />
            )}
            {it.name}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "text-foreground overflow-hidden rounded-[1.25rem]",
          solidSurface(3, 6),
        )}
      >
        {/* Every demo stays laid out, stacked in one cell, and only fades:
            a hidden one measured zero, so its text morph animated its box
            from nothing when it came back, and a scaling swap threw off the
            morph's measurements mid-change. */}
        <div className="grid h-[15rem] sm:h-[16rem]">
          {items.map((it, i) => (
            <div
              key={it.slug}
              role="tabpanel"
              aria-label={it.name}
              inert={i !== index}
              aria-hidden={i !== index}
              className={cn(
                "flex items-center justify-center p-5 transition-[opacity,filter] duration-300 ease-out [grid-area:1/1]",
                i === index ? "opacity-100" : "opacity-0 blur-[3px]",
              )}
            >
              {it.demo}
            </div>
          ))}
        </div>

        {/* The command that installs what's above it. */}
        <div className="flex items-center gap-2 bg-(--land-field-deep) py-3 pr-2.5 pl-4 text-(--land-on-field)">
          {/* Plain inline text, like the docs' command: a flex row here
              shifted the morph's leaving glyphs as the line's baseline moved.
              Right-to-left overflow clips the start of the command on a
              narrow screen, so the component's name always shows; the text
              itself stays left-to-right. */}
          <code
            dir="rtl"
            className="block min-w-0 flex-1 overflow-hidden text-left font-mono text-[0.875rem] text-ellipsis whitespace-nowrap sm:text-[0.9375rem]"
          >
            <span dir="ltr">
              <span className="opacity-60">$ </span>
              {head}
              {scope}
              <TextMorph
                value={item.slug}
                className="font-medium text-(--land-spark)"
              />
            </span>
          </code>
          <CopyButton
            content={command}
            className="text-(--land-on-field-muted) hover:bg-(--land-field-line) hover:text-(--land-on-field)"
          />
        </div>
      </div>
    </div>
  );
}
