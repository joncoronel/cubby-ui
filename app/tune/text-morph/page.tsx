"use client";

import * as React from "react";
import {
  DialStore,
  useDialKit,
  type DialConfig,
  type DialValue,
  type EasingConfig,
  type TransitionConfig,
} from "dialkit";
import { feedbackOf } from "@/components/docs/morph-text";
import { cn } from "@/lib/utils";
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import {
  MODE_DEFAULTS,
  type TextMorphMode,
  type TextMorphOptions,
  type Timing,
} from "@/registry/default/text-morph/lib/options";
import { Button } from "@/registry/default/button/button";
import { Input } from "@/registry/default/input/input";
import { Toggle } from "@/registry/default/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import { bezierOnly, toMs, transitionToCss } from "../_lib/transition-css";
import { TuneToolbar, useTuneState } from "../_lib/tune-toolbar";
import { useSlowMotion } from "../_lib/use-slow-motion";
import {
  CaseStage,
  ExampleNav,
  VIEWS,
  caseOf,
  isDemo,
  type Align,
  type View,
} from "./torph-playground";
import { TorphDemo } from "./torph-demos";

const PANEL_ID = "text-morph";
/** Remembers the example shown, per browser (a convenience only). */
const VIEW_KEY = "tune-text-morph-view";
const SCOPE = "[data-tune-scope]";

const EXPO: EasingConfig["ease"] = [0.19, 1, 0.22, 1];
const WIDTH_CURVE: EasingConfig["ease"] = [0.22, 1, 0.36, 1];
const LINEAR: EasingConfig["ease"] = [0, 0, 1, 1];
const easing = (
  duration: number,
  ease: EasingConfig["ease"],
): EasingConfig => ({
  type: "easing",
  duration,
  ease,
});

/**
 * Each mode's defaults as dial values. A mode runs its exact options until a
 * dial moves; these only position the dials. Two of roll's (Scritto's) can't
 * be shown exactly (its hand-tuned spring, and that same spring on opacity),
 * so its motion and fade dials start on the nearest match.
 */
type DialPositions = {
  mode: TextMorphMode;
  motion: TransitionConfig;
  fadeIn: EasingConfig;
  fadeInDelay: number;
  fadeOut: EasingConfig;
  width: EasingConfig;
  staggerMode: "each" | "spread";
  staggerMs: number;
  rollDistance: number;
  rollScale: number;
  rollRotate: number;
  morphScale: number;
  digitDistance: number;
  blendDistance: number;
  blendScale: number;
  blur: number;
  trend: TextMorphOptions["trend"];
};

const DIAL_MODES: Record<TextMorphMode, DialPositions> = {
  blend: {
    mode: "blend",
    motion: easing(0.24, WIDTH_CURVE),
    fadeIn: easing(0.24, WIDTH_CURVE),
    fadeInDelay: 0,
    fadeOut: easing(0.15, WIDTH_CURVE),
    width: easing(0.24, WIDTH_CURVE),
    staggerMode: "each",
    staggerMs: 0,
    rollDistance: 0.35,
    rollScale: 1,
    rollRotate: 0,
    morphScale: 1,
    digitDistance: 1,
    blendDistance: 0.08,
    blendScale: 0.9,
    blur: 0.1,
    trend: "auto",
  },
  roll: {
    mode: "roll",
    motion: { type: "spring", visualDuration: 0.35, bounce: 0.1 },
    fadeIn: easing(0.55, [0.3, 1, 0.5, 1]),
    fadeInDelay: 0,
    fadeOut: easing(0.55, [0.3, 1, 0.5, 1]),
    width: easing(0.55, WIDTH_CURVE),
    staggerMode: "spread",
    staggerMs: 165,
    rollDistance: 0.35,
    rollScale: 0.6,
    rollRotate: 2,
    morphScale: 0.6,
    digitDistance: 1,
    blendDistance: 0.15,
    blendScale: 1,
    blur: 0.1,
    trend: "auto",
  },
  morph: {
    mode: "morph",
    motion: easing(0.4, EXPO),
    fadeIn: easing(0.2, LINEAR),
    fadeInDelay: 100,
    fadeOut: easing(0.1, LINEAR),
    width: easing(0.4, EXPO),
    staggerMode: "each",
    staggerMs: 0,
    rollDistance: 0.35,
    rollScale: 0.95,
    rollRotate: 0,
    morphScale: 0.95,
    digitDistance: 1,
    blendDistance: 0.15,
    blendScale: 1,
    blur: 0,
    trend: "down",
  },
};

const base = DIAL_MODES.blend;

// Component values only; playback lives in the page controls. Defaults are
// the component's default mode's. Picking a mode moves every dial to that
// mode's values.
const CONFIG = {
  mode: {
    type: "select",
    options: ["blend", "roll", "morph"],
    default: base.mode,
  },
  motion: easing(0.4, EXPO),
  fade: {
    in: { ...base.fadeIn },
    inDelay: [base.fadeInDelay, 0, 400, 10],
    out: { ...base.fadeOut },
  },
  width: { ...base.width },
  stagger: {
    mode: {
      type: "select",
      options: ["each", "spread"],
      default: base.staggerMode,
    },
    ms: [base.staggerMs, 0, 300, 1],
  },
  roll: {
    distance: [base.rollDistance, 0, 1.5, 0.05],
    scale: [base.rollScale, 0.2, 1, 0.05],
    rotate: [base.rollRotate, -15, 15, 0.5],
  },
  morph: {
    scale: [base.morphScale, 0.2, 1, 0.05],
    digitDistance: [base.digitDistance, 0, 2, 0.05],
  },
  blend: {
    scale: [base.blendScale, 0.8, 1, 0.01],
    distance: [base.blendDistance, 0, 1, 0.01],
  },
  blur: [base.blur, 0, 0.4, 0.01],
  numbers: true,
  trend: {
    type: "select",
    options: ["auto", "up", "down"],
    default: base.trend,
  },
  edgeFade: {
    type: "select",
    options: ["auto", "always", "never"],
    default: "auto",
  },
} satisfies DialConfig;

/** Dial paths for DialStore.updateValues. */
function dialUpdates(p: DialPositions): Record<string, DialValue> {
  return {
    mode: p.mode,
    motion: p.motion,
    "fade.in": p.fadeIn,
    "fade.inDelay": p.fadeInDelay,
    "fade.out": p.fadeOut,
    width: p.width,
    "stagger.mode": p.staggerMode,
    "stagger.ms": p.staggerMs,
    "roll.distance": p.rollDistance,
    "roll.scale": p.rollScale,
    "roll.rotate": p.rollRotate,
    "morph.scale": p.morphScale,
    "morph.digitDistance": p.digitDistance,
    "blend.distance": p.blendDistance,
    "blend.scale": p.blendScale,
    blur: p.blur,
    trend: p.trend,
  };
}

const same = (a: unknown, b: unknown): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

function timingOf(transition: TransitionConfig): Timing {
  const css = transitionToCss(transition);
  return { duration: toMs(css), easing: css.easing };
}

const SECTIONS = [
  "Preview",
  "Installation",
  "Usage",
  "Examples",
  "Variants",
  "Sizes",
  "With Icons",
  "Accessibility",
  "Label icon-only buttons",
  "API Reference",
];
// torph's playground cases (packages/test-cases/src/cases.ts), to compare.
const REORDER = ["Transaction Safe", "Processing Transaction"];
const SWAP = ["hello world", "world hello"];
const LINES = ["1,234", "Total\n1,234", "Total\n5,678"];
const EMPTY = ["hello world", ""];
const PRICES = ["$1,204", "$1,318", "$987", "$12,450", "$12,455", "$9"];
const COUNTS = [8, 9, 10, 11, 12, 99, 100, 101, 100, 99, 42, 41];
const PERCENTS = [2.4, 2.45, 3.1, -0.6, -1.25, 0.8];
const TARGETS = ["production-eu", "staging", "preview-4821", "dev"];
const UPDATES = [
  "Your order has shipped and is on its way to the sorting center.",
  "Your order left the sorting center and is out for delivery today.",
  "Delivered to the front door at 2:14 pm. Thanks for shopping with us.",
];
const STATUSES = [
  "Draft saved.",
  "Changes saved!",
  "Not saved yet",
  "Autosaved at 9:41",
];
const INTERVALS = [120, 250, 700] as const;
const MODE_LABELS: Record<TextMorphMode, string> = {
  blend: "Blend (Cubby)",
  roll: "Roll (Scritto)",
  morph: "Morph (torph)",
};

/**
 * Freezes every animation under the scope (the component's own Web
 * Animations and its CSS width transition) at one playhead, catching new
 * ones as they start.
 */
function useFreeze(enabled: boolean, time: number): void {
  React.useEffect(() => {
    if (!enabled) return;
    const held = new Set<Animation>();
    let frame = 0;
    const tick = () => {
      for (const animation of document.getAnimations()) {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        if (!target?.closest(SCOPE)) continue;
        animation.pause();
        animation.currentTime = time;
        held.add(animation);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      for (const animation of held) {
        if (animation.playState !== "finished") animation.play();
      }
    };
  }, [enabled, time]);
}

export default function TextMorphTune(): React.ReactElement {
  const [tune, setTune] = useTuneState();
  const [step, setStep] = React.useState(0);
  // Clicking an example steps just that one, on top of the shared step.
  const [bumps, setBumps] = React.useState<Record<string, number>>({});
  const bump = (key: string) => (): void =>
    setBumps((b) => ({ ...b, [key]: (b[key] ?? 0) + 1 }));
  const pick = <T,>(list: readonly T[], key: string): T =>
    list[(step + (bumps[key] ?? 0)) % list.length];
  // Which example: the site's own, or one of torph's playground cases,
  // each starting from its first value.
  const [view, setView] = React.useState<View>("site");
  const [caseStep, setCaseStep] = React.useState(0);
  const [align, setAlign] = React.useState<Align | null>(null);
  const [tabular, setTabular] = React.useState<boolean | null>(null);
  const shownCase = caseOf(view);
  const select = (next: View): void => {
    setView(next);
    setCaseStep(0);
    setAlign(null);
    setTabular(null);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Storage unavailable: the choice just isn't remembered.
    }
  };
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_KEY) as View | null;
      if (saved && VIEWS.includes(saved)) setView(saved);
    } catch {
      // Storage unavailable: start on the site examples.
    }
  }, []);
  // Next, Auto and Replay step whatever is shown.
  const advance = React.useCallback((): void => {
    if (view === "site") setStep((s) => s + 1);
    else setCaseStep((s) => s + 1);
  }, [view]);
  // Space steps a torph case, as in its playground.
  React.useEffect(() => {
    if (view === "site") return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== " " || event.defaultPrevented || event.repeat) return;
      // Typing and controls keep their own Space.
      const { target } = event;
      if (
        target instanceof Element &&
        target.closest("input, textarea, select, button, [contenteditable]")
      )
        return;
      event.preventDefault();
      advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, advance]);
  const [auto, setAuto] = React.useState(false);
  const [typed, setTyped] = React.useState("1200");
  const [caret, setCaret] = React.useState<number>();
  const [events, setEvents] = React.useState({
    start: 0,
    complete: 0,
    cancel: 0,
  });
  const tally = (key: keyof typeof events) => (): void =>
    setEvents((e) => ({ ...e, [key]: e[key] + 1 }));
  const [interval, setIntervalMs] = React.useState<number>(INTERVALS[1]);
  const v = useDialKit("TextMorph", CONFIG, { id: PANEL_ID, persist: true });

  useSlowMotion(SCOPE, tune.rate);
  useFreeze(tune.freeze, tune.time);

  React.useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(advance, interval / tune.rate);
    return () => window.clearInterval(id);
  }, [auto, interval, tune.rate, advance]);

  // A new mode (from the panel or the page) brings its own values.
  const mode = v.mode as TextMorphMode;
  const shownMode = React.useRef(mode);
  React.useEffect(() => {
    if (mode === shownMode.current) return;
    shownMode.current = mode;
    DialStore.updateValues(PANEL_ID, dialUpdates(DIAL_MODES[mode]));
  }, [mode]);

  // The mode's exact options, with a dial's value only where that dial left
  // the mode's position.
  const p = DIAL_MODES[mode];
  const exact = MODE_DEFAULTS[mode];
  const fadeIn = bezierOnly(v.fade.in, p.fadeIn);
  const fadeOut = bezierOnly(v.fade.out, p.fadeOut);
  const width = bezierOnly(v.width, p.width);
  const resolved: TextMorphOptions = {
    mode,
    motion: same(v.motion, p.motion) ? exact.motion : timingOf(v.motion),
    fadeIn:
      same(fadeIn, p.fadeIn) && v.fade.inDelay === p.fadeInDelay
        ? exact.fadeIn
        : {
            ...(same(fadeIn, p.fadeIn) ? exact.fadeIn : timingOf(fadeIn)),
            delay: v.fade.inDelay,
          },
    fadeOut: same(fadeOut, p.fadeOut) ? exact.fadeOut : timingOf(fadeOut),
    width: same(width, p.width) ? exact.width : timingOf(width),
    stagger: {
      mode: v.stagger.mode as "each" | "spread",
      ms: v.stagger.ms,
    },
    roll: {
      distance: v.roll.distance,
      scale: v.roll.scale,
      rotate: v.roll.rotate,
    },
    morph: {
      scale: v.morph.scale,
      digits: { ...exact.morph.digits, distance: v.morph.digitDistance },
    },
    blend: {
      distance: v.blend.distance,
      scale: v.blend.scale,
    },
    blur: v.blur,
    numbers: v.numbers,
    trend: v.trend as TextMorphOptions["trend"],
    edgeFade: v.edgeFade as TextMorphOptions["edgeFade"],
  };

  // Copy: every option that differs from the mode's defaults.
  const copied: Record<string, unknown> = Object.fromEntries(
    (Object.keys(resolved) as (keyof TextMorphOptions)[])
      .filter((key) => !same(resolved[key], exact[key]))
      .map((key) => [key, resolved[key]]),
  );
  const copiedName = {
    blend: "BLEND_OPTIONS",
    roll: "SCRITTO_OPTIONS",
    morph: "TORPH_OPTIONS",
  }[mode];

  const ambient = tune.original ? exact : resolved;
  const feedback = feedbackOf(ambient);

  const count = pick(COUNTS, "counter");
  const percent = pick(PERCENTS, "counter");
  const flip = pick([false, true], "feedback");
  const longestMs =
    Math.max(
      ambient.motion.duration,
      ambient.fadeIn.duration + ambient.fadeIn.delay,
      ambient.width.duration,
    ) +
    (ambient.stagger.mode === "each"
      ? ambient.stagger.ms * 12
      : ambient.stagger.ms);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8 pb-32 lg:pr-80 lg:pl-72">
      <ExampleNav view={view} onSelect={select} />
      {isDemo(view) ? (
        <div data-tune-scope className="w-full max-w-3xl">
          <TorphDemo
            // Each demo starts from its own first state.
            key={view}
            view={view}
            options={ambient}
            align={align ?? "left"}
            onAlign={setAlign}
            tabular={tabular ?? false}
            onTabular={setTabular}
            tick={caseStep}
            duration={longestMs}
          />
        </div>
      ) : shownCase ? (
        <div data-tune-scope className="w-full max-w-3xl">
          <CaseStage
            c={shownCase}
            step={caseStep}
            align={align ?? shownCase.align ?? "left"}
            onAlign={setAlign}
            tabular={tabular ?? shownCase.tabular ?? false}
            onTabular={setTabular}
            options={ambient}
            onAdvance={advance}
          />
        </div>
      ) : (
        <div data-tune-scope className="flex w-full max-w-xl flex-col gap-8">
          <Demo label="Header crumb (scroll-driven)" onAdvance={bump("crumb")}>
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <span className="text-border">/</span>
              <TextMorph value={pick(SECTIONS, "crumb")} options={ambient} />
            </span>
          </Demo>

          <Demo
            label="Mobile pill (centred, resizes both ways)"
            onAdvance={bump("pill")}
          >
            <div className="flex justify-center">
              <span className="bg-card flex h-10 items-center rounded-full px-4 text-sm font-medium shadow-(--surface-shadow-combined-5)">
                <TextMorph value={pick(SECTIONS, "pill")} options={ambient} />
              </span>
            </div>
          </Demo>

          <Demo
            label="Price (digits line up by place; only changed ones roll)"
            onAdvance={bump("price")}
          >
            <span className="font-display text-3xl font-semibold tabular-nums">
              <TextMorph value={pick(PRICES, "price")} options={ambient} />
            </span>
          </Demo>

          <Demo
            label="Wrapping (a long value flows over lines; glyphs travel across them)"
            onAdvance={bump("wrapping")}
          >
            <p className="max-w-64 text-sm leading-6">
              <TextMorph value={pick(UPDATES, "wrapping")} options={ambient} />
            </p>
          </Demo>

          <Demo label="Editable field (cursorIndex: typing 1 between 2 and 0 inserts it)">
            <div className="flex items-center gap-4">
              <Input
                aria-label="Amount"
                inputMode="numeric"
                value={typed}
                onChange={(event) => {
                  setCaret(event.target.selectionStart ?? undefined);
                  setTyped(event.target.value);
                }}
                className="w-40"
              />
              <span className="font-display text-2xl font-semibold tabular-nums">
                $
                <TextMorph
                  value={typed || "0"}
                  cursorIndex={caret}
                  options={ambient}
                />
              </span>
            </div>
          </Demo>

          <Demo
            label="In a sentence (old ink fades at the edge instead of running over the next word)"
            onAdvance={bump("sentence")}
          >
            <p className="text-sm">
              Deploying to{" "}
              <TextMorph
                value={pick(TARGETS, "sentence")}
                options={ambient}
                className="font-mono font-medium"
              />{" "}
              now
            </p>
          </Demo>

          <Demo
            label="Status (roll: the shared word in the middle stays put)"
            onAdvance={bump("status")}
          >
            <span className="text-sm">
              <TextMorph value={pick(STATUSES, "status")} options={ambient} />
            </span>
          </Demo>

          <Demo
            label="Word reorder + exit (torph: Transaction moves to its new place, Safe leaves, Processing arrives)"
            onAdvance={bump("reorder")}
          >
            <span className="text-2xl font-medium">
              <TextMorph value={pick(REORDER, "reorder")} options={ambient} />
            </span>
          </Demo>

          <Demo
            label="Same words, reversed order (torph: hello and world swap places, nothing enters or leaves)"
            onAdvance={bump("swap")}
          >
            <span className="text-2xl font-medium">
              <TextMorph value={pick(SWAP, "swap")} options={ambient} />
            </span>
          </Demo>

          <Demo
            label="Line break (torph: a new line arrives above the number, which holds its place value)"
            onAdvance={bump("lines")}
          >
            <span className="text-2xl font-medium tabular-nums">
              <TextMorph value={pick(LINES, "lines")} options={ambient} />
            </span>
          </Demo>

          <Demo
            label="Empty and back (torph: the line keeps its height while the text leaves)"
            onAdvance={bump("empty")}
          >
            <p className="text-2xl font-medium">
              <TextMorph value={pick(EMPTY, "empty")} options={ambient} />
            </p>
          </Demo>

          <Demo
            label="Counter (a number value; roll rolls up when it grows and down when it shrinks, morph drops digits in from above)"
            onAdvance={bump("counter")}
          >
            <span className="flex items-baseline gap-3 text-sm">
              <span className="font-display text-3xl font-semibold tabular-nums">
                <TextMorph value={count} options={ambient} />
              </span>
              <span className="text-muted-foreground tabular-nums">
                <TextMorph value={`${count} unread`} options={ambient} />
              </span>
              <span className="text-muted-foreground tabular-nums">
                <TextMorph
                  value={`${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`}
                  options={ambient}
                />
              </span>
            </span>
          </Demo>

          <Demo
            label="Events (each change ends in exactly one of complete or cancel; try every 120ms)"
            onAdvance={bump("events")}
          >
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <TextMorph
                value={pick(PRICES, "events")}
                options={ambient}
                onAnimationStart={tally("start")}
                onAnimationComplete={tally("complete")}
                onAnimationCancel={tally("cancel")}
                className="font-medium tabular-nums"
              />
              <span className="text-muted-foreground tabular-nums">
                start {events.start} · complete {events.complete} · cancel{" "}
                {events.cancel}
              </span>
            </div>
          </Demo>

          <Demo label="Click feedback (right-pinned buttons, the same look in 209ms)">
            <div className="flex justify-end gap-2">
              {/* The buttons step this one; the card around them doesn't, so
                there are no buttons inside a button. */}
              <Button variant="ghost" size="xs" onClick={bump("feedback")}>
                <TextMorph
                  value={flip ? "Hide code" : "Code"}
                  options={feedback}
                />
              </Button>
              <Button variant="secondary" size="xs" onClick={bump("feedback")}>
                <TextMorph
                  value={flip ? "Copied" : "Copy page"}
                  options={feedback}
                />
              </Button>
            </div>
          </Demo>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Mode</span>
          <ToggleGroup
            size="sm"
            value={[mode]}
            onValueChange={(value) => {
              if (value[0])
                DialStore.updateValues(PANEL_ID, { mode: value[0] });
            }}
          >
            {(Object.keys(MODE_DEFAULTS) as TextMorphMode[]).map((name) => (
              <ToggleGroupItem key={name} value={name}>
                {MODE_LABELS[name]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={advance}>
            Next
          </Button>
          <Toggle size="sm" pressed={auto} onPressedChange={setAuto}>
            Auto
          </Toggle>
          <ToggleGroup
            size="sm"
            value={[String(interval)]}
            onValueChange={(value) => {
              if (value[0]) setIntervalMs(Number(value[0]));
            }}
          >
            {INTERVALS.map((ms) => (
              <ToggleGroupItem key={ms} value={String(ms)}>
                every {ms}ms
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <TuneToolbar
        state={tune}
        setState={setTune}
        panelId={PANEL_ID}
        file="registry/default/text-morph/lib/options.ts"
        css=""
        props={Object.keys(copied).length ? { [copiedName]: copied } : {}}
        onReplay={advance}
        scrubMax={Math.max(1000, Math.ceil(longestMs / 100) * 100)}
      />
    </div>
  );
}

function Demo({
  label,
  onAdvance,
  children,
}: {
  label: string;
  /** Clicking the example (or Enter/Space on it) steps just this one. */
  onAdvance?: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  const card = "border-border/70 rounded-xl border px-5 py-6";
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-muted-foreground font-sans text-xs font-medium">
        {label}
      </h2>
      {onAdvance ? (
        // A div, not a button: some examples hold block content.
        <div
          role="button"
          tabIndex={0}
          aria-label={`Next: ${label}`}
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
        >
          {children}
        </div>
      ) : (
        <div className={card}>{children}</div>
      )}
    </section>
  );
}
