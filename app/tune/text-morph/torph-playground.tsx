"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import type { TextMorphOptions } from "@/registry/default/text-morph/lib/options";
import { Toggle } from "@/registry/default/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import {
  TORPH_NUMBER_CASES,
  TORPH_TEXT_CASES,
  type TorphCase,
} from "./torph-cases";

/** torph's playground demos: free-form screens, not cases (nothing asserted). */
export type DemoView =
  | "text-sandbox"
  | "number-sandbox"
  | "ticker"
  | "chart"
  | "input";

/** What the page shows: its own examples, a torph demo or a torph case. */
export type View = "site" | DemoView | `text-${number}` | `number-${number}`;

export type Align = "left" | "center" | "right";

const GROUPS: {
  title: string;
  prefix: "text" | "number";
  demos: { id: DemoView; label: string }[];
  cases: TorphCase[];
}[] = [
  {
    title: "torph · text",
    prefix: "text",
    demos: [{ id: "text-sandbox", label: "Sandbox" }],
    cases: TORPH_TEXT_CASES,
  },
  {
    title: "torph · numbers",
    prefix: "number",
    demos: [
      { id: "number-sandbox", label: "Sandbox" },
      { id: "ticker", label: "Ticker" },
      { id: "chart", label: "Chart" },
      { id: "input", label: "Input" },
    ],
    cases: TORPH_NUMBER_CASES,
  },
];

const DEMO_VIEWS = GROUPS.flatMap((group) => group.demos.map((d) => d.id));

export function isDemo(view: View): view is DemoView {
  return (DEMO_VIEWS as View[]).includes(view);
}

/** The torph case a view shows, if it shows one. */
export function caseOf(view: View): TorphCase | null {
  if (view === "site" || isDemo(view)) return null;
  const [prefix, index] = view.split("-");
  const cases = prefix === "text" ? TORPH_TEXT_CASES : TORPH_NUMBER_CASES;
  return cases[Number(index)] ?? null;
}

/** Every view, in sidebar order: for restoring a saved one. */
export const VIEWS: View[] = [
  "site",
  ...GROUPS.flatMap((group) => [
    ...group.demos.map((d) => d.id),
    ...group.cases.map((_, i): View => `${group.prefix}-${i}`),
  ]),
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
            <ul className="border-border/70 mb-1 border-b pb-1">
              {group.demos.map((d) => item(d.id, d.label))}
            </ul>
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
            {group.demos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
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

/** A screen's title, tags and description, as torph's playground heads it. */
export function StageHeader({
  title,
  tags,
  description,
  children,
}: {
  title: string;
  tags: string[];
  description: string;
  /** Controls beside the tags (a demo's format picker). */
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold">{title}</h1>
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase"
          >
            {tag}
          </span>
        ))}
        {children}
      </div>
      <p className="text-muted-foreground text-sm text-pretty">{description}</p>
    </header>
  );
}

/**
 * The card a value morphs in. Centred in room for two lines, as torph's
 * stage is (176px): one or two lines hold the card's size, and a third
 * grows it, easing as the label's height does. With `onAdvance` it's a
 * button that steps the screen.
 */
export function Stage({
  align,
  tabular,
  onAdvance,
  children,
}: {
  align: Align;
  tabular: boolean;
  onAdvance?: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  const card =
    "border-border/70 flex items-center rounded-xl border px-8 py-10 text-4xl leading-tight font-medium";
  const inner = (
    <div
      className={cn("w-full", ALIGN_CLASS[align], tabular && "tabular-nums")}
    >
      {children}
    </div>
  );
  const style = { minHeight: "calc(2 * 1.25em + 5rem)" };
  if (!onAdvance) {
    return (
      <div className={card} style={style}>
        {inner}
      </div>
    );
  }
  return (
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
      className={cn(
        card,
        "hover:bg-muted/40 focus-visible:ring-ring/50 cursor-pointer transition-colors outline-none select-none focus-visible:ring-2",
      )}
      style={style}
    >
      {inner}
    </div>
  );
}

/** A value on the stage: a box, as torph's root is. */
export function StageValue(
  props: React.ComponentProps<typeof TextMorph>,
): React.ReactElement {
  return (
    <TextMorph
      // Top-aligned too (torph's is), or an inline-block's last-line
      // baseline stretches its line to the new height at once as it grows.
      className="inline-block align-top"
      {...props}
    />
  );
}

/** Tabular digits and alignment, beside whatever a screen reports. */
export function StageTools({
  align,
  onAlign,
  tabular,
  onTabular,
  children,
}: {
  align: Align;
  onAlign: (align: Align) => void;
  /** Equal-width digits, to rule out a font's digit widths when text shifts. */
  tabular: boolean;
  onTabular: (tabular: boolean) => void;
  /** What the screen reports on the left. */
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="text-muted-foreground flex flex-wrap items-center gap-3">
        {children}
      </div>
      <div className="flex items-center gap-2">
        <Toggle size="sm" pressed={tabular} onPressedChange={onTabular}>
          Tabular
        </Toggle>
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
      </div>
    </footer>
  );
}

/** One torph case, as its playground shows it: click or Space for the next value. */
export function CaseStage({
  c,
  step,
  align,
  onAlign,
  tabular,
  onTabular,
  options,
  onAdvance,
}: {
  c: TorphCase;
  step: number;
  align: Align;
  onAlign: (align: Align) => void;
  tabular: boolean;
  onTabular: (tabular: boolean) => void;
  options: TextMorphOptions;
  onAdvance: () => void;
}): React.ReactElement {
  const index = step % c.values.length;
  const value = c.values[index];

  return (
    <section className="flex flex-col gap-4">
      <StageHeader title={c.label} tags={c.tags} description={c.description} />
      <Stage align={align} tabular={tabular} onAdvance={onAdvance}>
        <StageValue
          // A new case starts fresh rather than morphing from the last.
          key={c.label}
          value={value}
          options={options}
          locale={c.locale}
          decimals={c.decimals}
          cursorIndex={c.cursors?.[index]}
        />
      </Stage>
      <StageTools
        align={align}
        onAlign={onAlign}
        tabular={tabular}
        onTabular={onTabular}
      >
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
      </StageTools>
    </section>
  );
}
