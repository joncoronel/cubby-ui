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
import { TextMorph } from "@/registry/default/text-morph/text-morph";
import {
  MODE_DEFAULTS,
  type TextMorphMode,
  type TextMorphOptions,
  type Timing,
} from "@/registry/default/text-morph/lib/options";
import { Button } from "@/registry/default/button/button";
import { Toggle } from "@/registry/default/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import { bezierOnly, toMs, transitionToCss } from "../_lib/transition-css";
import { TuneToolbar, useTuneState } from "../_lib/tune-toolbar";
import { useSlowMotion } from "../_lib/use-slow-motion";

const PANEL_ID = "text-morph";
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
  blur: number;
};

const DIAL_MODES: Record<TextMorphMode, DialPositions> = {
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
    blur: 0.1,
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
    blur: 0,
  },
};

const base = DIAL_MODES.morph;

// Component values only; playback lives in the page controls. Defaults are
// morph's (production). Picking a mode moves every dial to that mode's values.
const CONFIG = {
  mode: { type: "select", options: ["roll", "morph"], default: base.mode },
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
  blur: [base.blur, 0, 0.4, 0.01],
  numbers: true,
  trend: { type: "select", options: ["auto", "up", "down"], default: "auto" },
  edgeFade: {
    type: "select",
    options: ["auto", "always", "never"],
    default: "auto",
  },
} satisfies DialConfig;

const TRENDS = { auto: 0, up: 1, down: -1 } as const;

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
    blur: p.blur,
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
const PRICES = ["$1,204", "$1,318", "$987", "$12,450", "$12,455", "$9"];
const COUNTS = [8, 9, 10, 11, 12, 99, 100, 101, 100, 99, 42, 41];
const PERCENTS = [2.4, 2.45, 3.1, -0.6, -1.25, 0.8];
const TARGETS = ["production-eu", "staging", "preview-4821", "dev"];
const STATUSES = [
  "Draft saved.",
  "Changes saved!",
  "Not saved yet",
  "Autosaved at 9:41",
];
const INTERVALS = [120, 250, 700] as const;
const MODE_LABELS: Record<TextMorphMode, string> = {
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
  const [auto, setAuto] = React.useState(false);
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
    const id = window.setInterval(
      () => setStep((s) => s + 1),
      interval / tune.rate,
    );
    return () => window.clearInterval(id);
  }, [auto, interval, tune.rate]);

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
    blur: v.blur,
    numbers: v.numbers,
    trend: TRENDS[v.trend as keyof typeof TRENDS],
    edgeFade: v.edgeFade as TextMorphOptions["edgeFade"],
  };

  // Copy: every option that differs from the mode's defaults.
  const copied: Record<string, unknown> = Object.fromEntries(
    (Object.keys(resolved) as (keyof TextMorphOptions)[])
      .filter((key) => !same(resolved[key], exact[key]))
      .map((key) => [key, resolved[key]]),
  );
  const copiedName = mode === "roll" ? "SCRITTO_OPTIONS" : "TORPH_OPTIONS";

  const ambient = tune.original ? exact : resolved;
  const feedback = feedbackOf(ambient);

  const section = SECTIONS[step % SECTIONS.length];
  const price = PRICES[step % PRICES.length];
  const count = COUNTS[step % COUNTS.length];
  const percent = PERCENTS[step % PERCENTS.length];
  const status = STATUSES[step % STATUSES.length];
  const target = TARGETS[step % TARGETS.length];
  const flip = step % 2 === 1;
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8 pb-32">
      <div data-tune-scope className="flex w-full max-w-xl flex-col gap-8">
        <Demo label="Header crumb (scroll-driven)">
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <span className="text-border">/</span>
            <TextMorph value={section} options={ambient} />
          </span>
        </Demo>

        <Demo label="Mobile pill (centred, resizes both ways)">
          <div className="flex justify-center">
            <span className="bg-card flex h-10 items-center rounded-full px-4 text-sm font-medium shadow-(--surface-shadow-combined-5)">
              <TextMorph value={section} options={ambient} />
            </span>
          </div>
        </Demo>

        <Demo label="Price (digits line up by place; only changed ones roll)">
          <span className="font-display text-3xl font-semibold tabular-nums">
            <TextMorph value={price} options={ambient} />
          </span>
        </Demo>

        <Demo label="In a sentence (old ink fades at the edge instead of running over the next word)">
          <p className="text-sm">
            Deploying to{" "}
            <TextMorph
              value={target}
              options={ambient}
              className="font-mono font-medium"
            />{" "}
            now
          </p>
        </Demo>

        <Demo label="Status (roll: the shared word in the middle stays put)">
          <span className="text-sm">
            <TextMorph value={status} options={ambient} />
          </span>
        </Demo>

        <Demo label="Counter (a number value; rolls up when it grows, down when it shrinks)">
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

        <Demo label="Events (each change ends in exactly one of complete or cancel; try every 120ms)">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <TextMorph
              value={price}
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
            <Button variant="ghost" size="xs">
              <TextMorph
                value={flip ? "Hide code" : "Code"}
                options={feedback}
              />
            </Button>
            <Button variant="secondary" size="xs">
              <TextMorph
                value={flip ? "Copied" : "Copy page"}
                options={feedback}
              />
            </Button>
          </div>
        </Demo>
      </div>

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStep((s) => s + 1)}
          >
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
        onReplay={() => setStep((s) => s + 1)}
        scrubMax={Math.max(1000, Math.ceil(longestMs / 100) * 100)}
      />
    </div>
  );
}

function Demo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-muted-foreground font-sans text-xs font-medium">
        {label}
      </h2>
      <div className="border-border/70 rounded-xl border px-5 py-6">
        {children}
      </div>
    </section>
  );
}
