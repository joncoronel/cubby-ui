"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TextMorphOptions } from "@/registry/default/text-morph/lib/options";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Slider } from "@/registry/default/slider/slider";
import { Toggle } from "@/registry/default/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import {
  Stage,
  StageHeader,
  StageTools,
  StageValue,
  type Align,
  type DemoView,
} from "./playground";

/*
 * Playground demos: free-form screens beside the cases, where nothing is asserted.
 */

type DemoProps = {
  options: TextMorphOptions;
  align: Align;
  onAlign: (align: Align) => void;
  tabular: boolean;
  onTabular: (tabular: boolean) => void;
  /** Bumped by the page's Next, Auto, Replay and Space. */
  tick: number;
  /** The longest part of a change, for the ticker's interrupt warning. */
  duration: number;
};

/** Runs `step` each time the page's tick moves on (not on mount). */
function useStepOn(tick: number, step: () => void): void {
  const latest = React.useRef(step);
  React.useLayoutEffect(() => {
    latest.current = step;
  });
  const seen = React.useRef(tick);
  React.useEffect(() => {
    if (tick === seen.current) return;
    seen.current = tick;
    latest.current();
  }, [tick]);
}

const LOCALES = ["en", "de-DE", "en-IN"] as const;
type Locale = (typeof LOCALES)[number];

function LocalePicker({
  value,
  onChange,
}: {
  value: Locale;
  onChange: (locale: Locale) => void;
}): React.ReactElement {
  return (
    <ToggleGroup
      size="sm"
      value={[value]}
      onValueChange={(next) => {
        if (next[0]) onChange(next[0] as Locale);
      }}
      aria-label="Locale"
    >
      {LOCALES.map((locale) => (
        <ToggleGroupItem key={locale} value={locale}>
          {locale}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

/** Morph between any two values: Morph, Space or a click on the stage. */
function TextSandbox(props: DemoProps): React.ReactElement {
  const [from, setFrom] = React.useState("hello world");
  const [to, setTo] = React.useState("world hello");
  const [current, setCurrent] = React.useState("hello world");
  const toggle = (): void => setCurrent((c) => (c === from ? to : from));
  useStepOn(props.tick, toggle);

  return (
    <section className="flex flex-col gap-4">
      <StageHeader
        title="Sandbox"
        tags={["custom"]}
        description="Morph between any two values. Not part of the case corpus, so nothing here is asserted."
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Field label="From">
          <Input
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setCurrent(event.target.value);
            }}
          />
        </Field>
        <Field label="To">
          <Input value={to} onChange={(event) => setTo(event.target.value)} />
        </Field>
      </div>
      <Stage align={props.align} tabular={props.tabular} onAdvance={toggle}>
        <StageValue value={current} options={props.options} />
      </Stage>
      <StageTools {...props}>
        <Button size="sm" onClick={toggle}>
          Morph
        </Button>
      </StageTools>
    </section>
  );
}

type Decomposed = {
  prefix: string;
  suffix: string;
  value: number;
  fractionDigits: number;
};

/** A typed value's fixed affixes and the quantity between them. */
function decompose(value: string, decimal: string): Decomposed | null {
  const first = value.search(/\d/);
  if (first === -1) return null;
  let last = value.length - 1;
  while (last >= 0 && !/\d/.test(value[last])) last--;
  const digits = [...value.slice(first, last + 1)].filter(
    (c) => /\d/.test(c) || c === decimal,
  );
  const point = digits.indexOf(decimal);
  const parsed = Number(digits.join("").replace(decimal, "."));
  if (!Number.isFinite(parsed)) return null;
  return {
    prefix: value.slice(0, first),
    suffix: value.slice(last + 1),
    value: parsed,
    fractionDigits: point === -1 ? 0 : digits.length - point - 1,
  };
}

function recompose(
  parts: Decomposed,
  next: number,
  locale: string,
  fractionDigits: number,
): string {
  return (
    parts.prefix +
    next.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }) +
    parts.suffix
  );
}

function decimalOf(locale: string): string {
  return (
    new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === "decimal")?.value ?? "."
  );
}

/** Module scope keeps the impurity out of render. */
function randomQuantity(): number {
  const magnitude = 10 ** Math.floor(Math.random() * 7);
  return Math.floor(Math.random() * magnitude);
}

const STEPS: [label: string, apply: (n: number) => number][] = [
  ["−1", (n) => n - 1],
  ["+1", (n) => n + 1],
  ["÷10", (n) => n / 10],
  ["×10", (n) => n * 10],
  ["±", (n) => -n],
];

/** Typed edits follow the caret; the steppers match by place. */
function NumberSandbox(props: DemoProps): React.ReactElement {
  const [value, setValue] = React.useState("$1,234.50");
  const [caret, setCaret] = React.useState<number>();
  const [useCaret, setUseCaret] = React.useState(true);
  const [locale, setLocale] = React.useState<Locale>("en");
  const parts = decompose(value, decimalOf(locale));

  const commit = (next: string, at?: number): void => {
    setValue(next);
    setCaret(at);
  };
  // A stepper is a counter, not an edit: no caret, so place matching.
  const step = (apply: (n: number) => number): void => {
    if (!parts) return;
    const next = apply(parts.value);
    const digits = Number.isInteger(next) ? parts.fractionDigits : 2;
    commit(recompose(parts, next, locale, digits));
  };
  useStepOn(props.tick, () => step(STEPS[1][1]));

  return (
    <section className="flex flex-col gap-4">
      <StageHeader
        title="Sandbox"
        tags={["custom"]}
        description="Type in the field and the morph follows your caret, the shape a currency input takes. The steppers have no caret, so they match by place value, the shape a counter takes. Nothing here is asserted."
      />
      <Field label="Value">
        <Input
          value={value}
          onChange={(event) =>
            commit(event.target.value, event.target.selectionStart ?? undefined)
          }
        />
      </Field>
      <Stage align={props.align} tabular={props.tabular}>
        <StageValue
          value={value}
          options={props.options}
          locale={locale}
          cursorIndex={useCaret ? caret : undefined}
        />
      </Stage>
      <StageTools {...props}>
        {STEPS.map(([label, apply]) => (
          <Button
            key={label}
            size="sm"
            variant="outline"
            disabled={!parts}
            onClick={() => step(apply)}
          >
            {label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="outline"
          disabled={!parts}
          onClick={() =>
            parts &&
            commit(
              recompose(parts, randomQuantity(), locale, parts.fractionDigits),
            )
          }
        >
          Random
        </Button>
        <Toggle
          size="sm"
          pressed={useCaret}
          onPressedChange={setUseCaret}
          title="Off, typed edits match by place value instead of by caret"
        >
          Caret
        </Toggle>
        <LocalePicker value={locale} onChange={setLocale} />
      </StageTools>
    </section>
  );
}

const FORMATS = ["count", "currency", "percent", "compact"] as const;
type Format = (typeof FORMATS)[number];

function formatTick(value: number, kind: Format, locale: string): string {
  switch (kind) {
    case "currency":
      return `$${value.toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    case "percent":
      return `${(value / 100).toFixed(1)}%`;
    case "compact":
      return value >= 1000
        ? `${(value / 1000).toFixed(1)}K`
        : `${Math.round(value)}`;
    default:
      return Math.round(value).toLocaleString(locale);
  }
}

/** A random walk, module scope to keep the impurity out of render. */
function walkFrom(value: number): number {
  const next = value * (1 + (Math.random() - 0.48) * 0.15);
  return Math.max(1, Math.min(999999, next));
}

/** A live value on a timer: below the duration, every update interrupts. */
function Ticker(props: DemoProps): React.ReactElement {
  const [value, setValue] = React.useState(1234.56);
  const [kind, setKind] = React.useState<Format>("currency");
  const [gap, setGap] = React.useState(700);
  const [running, setRunning] = React.useState(false);
  const [locale, setLocale] = React.useState<Locale>("en");
  const walk = React.useCallback(() => setValue(walkFrom), []);
  useStepOn(props.tick, walk);

  React.useEffect(() => {
    if (!running) return;
    const id = window.setInterval(walk, gap);
    return () => window.clearInterval(id);
  }, [running, gap, walk]);

  // Eight updates 60ms apart, inside any duration.
  const burst = (): void => {
    for (let i = 0; i < 8; i++) window.setTimeout(walk, i * 60);
  };
  const interrupting = gap < props.duration;

  return (
    <section className="flex flex-col gap-4">
      <StageHeader
        title="Ticker"
        tags={[]}
        description="A live value on a timer. Set the interval below the duration and each update interrupts the change before it lands, which the cases never do, since each waits for the last to finish."
      >
        <ToggleGroup
          size="sm"
          value={[kind]}
          onValueChange={(next) => {
            if (next[0]) setKind(next[0] as Format);
          }}
          aria-label="Format"
        >
          {FORMATS.map((f) => (
            <ToggleGroupItem key={f} value={f}>
              {f}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </StageHeader>
      <Stage align={props.align} tabular={props.tabular}>
        <StageValue
          value={formatTick(value, kind, locale)}
          options={props.options}
          locale={locale}
        />
      </Stage>
      <StageTools {...props}>
        <Button size="sm" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Run"}
        </Button>
        <Button size="sm" variant="outline" onClick={burst}>
          Burst ×8
        </Button>
        <Button size="sm" variant="outline" onClick={walk}>
          Step
        </Button>
        <div className="flex w-44 items-center gap-2">
          <Slider
            aria-label="Interval between updates"
            min={50}
            max={2000}
            step={50}
            value={gap}
            onValueChange={(next) =>
              setGap(Array.isArray(next) ? next[0] : next)
            }
          />
          <code className="tabular-nums">{gap}ms</code>
        </div>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-medium",
            interrupting
              ? "bg-destructive/15 text-destructive-soft-foreground"
              : "bg-success text-success-foreground",
          )}
        >
          {interrupting ? `interrupting ${props.duration}ms` : "settles"}
        </span>
        <LocalePicker value={locale} onChange={setLocale} />
      </StageTools>
    </section>
  );
}

const MONTHS = [
  { month: "Jan", value: 4120 },
  { month: "Feb", value: 3840 },
  { month: "Mar", value: 5230 },
  { month: "Apr", value: 4780 },
  { month: "May", value: 6150 },
  { month: "Jun", value: 5890 },
  { month: "Jul", value: 7240 },
  { month: "Aug", value: 6870 },
  { month: "Sep", value: 7590 },
  { month: "Oct", value: 8120 },
  { month: "Nov", value: 7430 },
  { month: "Dec", value: 9210 },
];
const MAX_MONTH = Math.max(...MONTHS.map((m) => m.value));

/** Hover (or focus) a bar and the figure above morphs to it. */
function Chart(props: DemoProps): React.ReactElement {
  const [active, setActive] = React.useState(MONTHS.length - 1);
  useStepOn(props.tick, () => setActive((i) => (i + 1) % MONTHS.length));
  const { month, value } = MONTHS[active];

  return (
    <section className="flex flex-col gap-4">
      <StageHeader
        title="Chart"
        tags={[]}
        description="A figure that follows the pointer across a chart: hover or focus a bar."
      />
      <div className="border-border/70 flex flex-col gap-2 rounded-xl border p-8">
        <div className="text-4xl font-semibold tabular-nums">
          <TextMorph
            value={`$${value.toLocaleString("en-US")}`}
            options={props.options}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          Monthly revenue · {month}
        </p>
        <div className="mt-6 flex h-40 items-end gap-2">
          {MONTHS.map((m, i) => (
            <button
              key={m.month}
              type="button"
              aria-label={`${m.month}: $${m.value.toLocaleString("en-US")}`}
              aria-pressed={i === active}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "focus-visible:ring-ring/50 flex-1 rounded-sm transition-colors outline-none focus-visible:ring-2",
                i === active ? "bg-foreground" : "bg-muted hover:bg-muted/70",
              )}
              style={{ height: `${(m.value / MAX_MONTH) * 100}%` }}
            />
          ))}
        </div>
        <div className="text-muted-foreground flex gap-2 text-xs">
          {MONTHS.map((m) => (
            <span key={m.month} className="flex-1 text-center">
              {m.month}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A number field: the figure above follows it by caret. */
function InputDemo(props: DemoProps): React.ReactElement {
  const [query, setQuery] = React.useState<number>();
  const [caret, setCaret] = React.useState<number>();

  return (
    <section className="flex flex-col gap-4">
      <StageHeader
        title="Input"
        tags={[]}
        description="Type a number: the figure follows the field, matched around the caret where the browser reports one."
      />
      <div className="border-border/70 flex flex-col items-center gap-6 rounded-xl border p-8">
        <div
          // The field's own value, drawn large; reading it back doubles it.
          aria-hidden="true"
          className={cn(
            // A 1.6 line height: text-5xl's own (1) put a comma's
            // tail in the slot's fade.
            "text-5xl leading-[1.6] font-medium tabular-nums transition-opacity",
            query === undefined && "opacity-50",
          )}
        >
          <TextMorph
            value={query ?? 0}
            options={props.options}
            cursorIndex={caret}
          />
        </div>
        <Input
          aria-label="Number to morph"
          placeholder="Type something..."
          type="number"
          value={query ?? ""}
          onChange={(event) => {
            setCaret(event.target.selectionStart ?? undefined);
            setQuery(
              Number.isNaN(event.target.valueAsNumber)
                ? undefined
                : event.target.valueAsNumber,
            );
          }}
          className="h-12 text-2xl"
        />
      </div>
    </section>
  );
}

const DEMOS: Record<DemoView, (props: DemoProps) => React.ReactElement> = {
  "text-sandbox": TextSandbox,
  "number-sandbox": NumberSandbox,
  ticker: Ticker,
  chart: Chart,
  input: InputDemo,
};

export function PlaygroundDemo({
  view,
  ...props
}: DemoProps & { view: DemoView }): React.ReactElement {
  const Demo = DEMOS[view];
  return <Demo {...props} />;
}
