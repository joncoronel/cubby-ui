"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import type { TextMorphOptions } from "@/registry/default/text-morph/lib/options";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import {
  TORPH_NUMBER_CASES,
  TORPH_TEXT_CASES,
  type TorphCase,
} from "./torph-cases";

/** What the page shows: its own examples, or one of torph's cases. */
export type View = "site" | `text-${number}` | `number-${number}`;

export type Align = "left" | "center" | "right";

const GROUPS: {
  title: string;
  prefix: "text" | "number";
  cases: TorphCase[];
}[] = [
  { title: "torph · text", prefix: "text", cases: TORPH_TEXT_CASES },
  { title: "torph · numbers", prefix: "number", cases: TORPH_NUMBER_CASES },
];

/** The torph case a view shows, if it shows one. */
export function caseOf(view: View): TorphCase | null {
  if (view === "site") return null;
  const [prefix, index] = view.split("-");
  const cases = prefix === "text" ? TORPH_TEXT_CASES : TORPH_NUMBER_CASES;
  return cases[Number(index)] ?? null;
}

/** Every view, in sidebar order: for restoring a saved one. */
export const VIEWS: View[] = [
  "site",
  ...GROUPS.flatMap((group) =>
    group.cases.map((_, i): View => `${group.prefix}-${i}`),
  ),
];

/** The list of examples: a sidebar on wide screens, a select on narrow ones. */
export function ExampleNav({
  view,
  onSelect,
}: {
  view: View;
  onSelect: (view: View) => void;
}): React.ReactElement {
  const item = (id: View, label: string): React.ReactElement => (
    <li key={id}>
      <button
        type="button"
        aria-current={view === id ? "page" : undefined}
        onClick={() => onSelect(id)}
        className={cn(
          "text-muted-foreground hover:bg-muted hover:text-foreground w-full rounded-md px-2 py-1 text-left text-[13px] transition-colors",
          view === id && "bg-muted text-foreground font-medium",
        )}
      >
        {label}
      </button>
    </li>
  );

  return (
    <>
      <nav
        aria-label="Examples"
        className="border-border/70 bg-background fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-5 overflow-y-auto border-r px-3 pt-6 pb-32 lg:flex"
      >
        <section className="flex flex-col gap-1">
          <h2 className="text-muted-foreground px-2 text-xs font-medium">
            Cubby
          </h2>
          <ul>{item("site", "Site examples")}</ul>
        </section>
        {GROUPS.map((group) => (
          <section key={group.prefix} className="flex flex-col gap-1">
            <h2 className="text-muted-foreground px-2 text-xs font-medium">
              {group.title}
            </h2>
            <ul>
              {group.cases.map((c, i) => item(`${group.prefix}-${i}`, c.label))}
            </ul>
          </section>
        ))}
      </nav>
      <select
        aria-label="Example"
        value={view}
        onChange={(event) => onSelect(event.target.value as View)}
        className="border-border bg-background w-full max-w-xl rounded-md border px-3 py-2 text-sm lg:hidden"
      >
        <option value="site">Site examples</option>
        {GROUPS.map((group) => (
          <optgroup key={group.prefix} label={group.title}>
            {group.cases.map((c, i) => (
              <option key={c.label} value={`${group.prefix}-${i}`}>
                {c.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </>
  );
}

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/** One torph case, as its playground shows it: click or Space for the next value. */
export function CaseStage({
  c,
  step,
  align,
  onAlign,
  options,
  onAdvance,
}: {
  c: TorphCase;
  step: number;
  align: Align;
  onAlign: (align: Align) => void;
  options: TextMorphOptions;
  onAdvance: () => void;
}): React.ReactElement {
  const index = step % c.values.length;
  const value = c.values[index];

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold">{c.label}</h1>
          {c.tags.map((tag) => (
            <span
              key={tag}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm text-pretty">
          {c.description}
        </p>
      </header>

      <div
        role="button"
        tabIndex={0}
        aria-label="Next value"
        onClick={onAdvance}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onAdvance();
        }}
        className="border-border/70 hover:bg-muted/40 focus-visible:ring-ring/50 cursor-pointer rounded-xl border px-8 py-16 transition-colors outline-none select-none focus-visible:ring-2"
      >
        <div
          className={cn(
            "text-4xl leading-tight font-medium",
            ALIGN_CLASS[align],
            c.tabular && "tabular-nums",
          )}
          style={{
            minHeight: `${(c.minLines ?? 1) * 1.25}em`,
          }}
        >
          <TextMorph
            // A new case starts fresh rather than morphing from the last.
            key={c.label}
            value={value}
            options={options}
            locale={c.locale}
            decimals={c.decimals}
            cursorIndex={c.cursors?.[index]}
          />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-muted-foreground flex items-center gap-3">
          <span className="tabular-nums">
            {index + 1} / {c.values.length}
          </span>
          <code className="bg-muted rounded px-1.5 py-0.5">
            {JSON.stringify(value)}
          </code>
          {c.cursors?.[index] !== undefined && (
            <span>caret {c.cursors[index]}</span>
          )}
          {c.locale && <span>{c.locale}</span>}
        </div>
        <ToggleGroup
          size="sm"
          value={[align]}
          onValueChange={(next) => {
            if (next[0]) onAlign(next[0] as Align);
          }}
          aria-label="Alignment"
        >
          <ToggleGroupItem value="left">L</ToggleGroupItem>
          <ToggleGroupItem value="center">C</ToggleGroupItem>
          <ToggleGroupItem value="right">R</ToggleGroupItem>
        </ToggleGroup>
      </footer>
    </section>
  );
}
