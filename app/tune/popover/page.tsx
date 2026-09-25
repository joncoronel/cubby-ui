"use client";

import * as React from "react";
import {
  DialStore,
  useDialKit,
  type DialConfig,
  type EasingConfig,
  type TransitionConfig,
} from "dialkit";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  createPopoverHandle,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import type { SurfaceLevel } from "@/registry/default/lib/elevated";
import { transitionToCss, type CssTiming } from "../_lib/transition-css";
import { useCssScrub, type ScrubPhase } from "../_lib/use-css-scrub";
import { useSlowMotion } from "../_lib/use-slow-motion";

type Side = "bottom" | "top" | "left" | "right";

const SELECTOR = '[data-slot="popover-content"]';
// The positioner wraps the popup and moves on its own during a trigger switch,
// so slow motion has to reach it too.
const POSITIONER = '[data-slot="popover-positioner"]';

// Defaults mirror registry/default/popover/popover.tsx. A rule is only emitted
// once its dial leaves the default, so untouched dials show the real component.
const RADIUS = 12;
const PADDING = 12;
const LEVEL = 3;
const START_SCALE = 0.95;
const FADE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.1,
  ease: [0.19, 1, 0.22, 1], // --ease-out-expo
};
// A trigger switch runs three transitions together: the popup resizes, the
// positioner (and arrow) re-centers, and the old/new content crossfades.
const SIZE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.15,
  ease: [0.22, 1, 0.36, 1],
};
const POSITION_DEFAULT: EasingConfig = { ...SIZE_DEFAULT, duration: 0.2 };
const CROSSFADE_DEFAULT: EasingConfig = { ...SIZE_DEFAULT };

const CONTENTS = ["short", "long", "list"] as const;
type Content = (typeof CONTENTS)[number];

// Switching triggers while open is what runs the width/height morph.
const handle = createPopoverHandle<Content>();

const SPEEDS: Record<string, number> = { "1x": 1, "0.25x": 0.25, "0.1x": 0.1 };

const CONFIG = {
  original: false,
  keepOpen: true,
  speed: { type: "select", options: Object.keys(SPEEDS) },
  side: { type: "select", options: ["bottom", "top", "left", "right"] },
  sideOffset: [8, 0, 24, 1],
  surface: {
    radius: [RADIUS, 0, 32, 1],
    padding: [PADDING, 0, 32, 1],
    level: [LEVEL, 1, 8, 1],
    shadowLevel: [LEVEL, 1, 8, 1],
  },
  motion: {
    // Springs overshoot and swing back. Scale shows that as bounce; opacity
    // is capped at 1, so it only shows the swing-back as a flicker. Hence
    // separate dials, and fade ignores springs.
    scale: { ...FADE_DEFAULT },
    fade: { ...FADE_DEFAULT }, // easing only
    startScale: [START_SCALE, 0.8, 1, 0.01],
  },
  // Runs when switching triggers while open. Easing only: none of these
  // should overshoot.
  morph: {
    size: { ...SIZE_DEFAULT },
    position: { ...POSITION_DEFAULT },
    crossfade: { ...CROSSFADE_DEFAULT },
  },
  scrub: {
    freeze: false,
    phase: { type: "select", options: ["enter", "exit"] },
    time: [0, 0, 1000, 1],
  },
  replay: { type: "action" },
  theme: { type: "action", label: "Toggle light/dark" },
  reset: { type: "action", label: "Reset to component" },
} satisfies DialConfig;

function isChanged(transition: TransitionConfig, base: EasingConfig): boolean {
  return (
    transition.type !== "easing" ||
    transition.duration !== base.duration ||
    transition.ease.some((n, i) => n !== base.ease[i])
  );
}

function bezierOnly(
  transition: TransitionConfig,
  base: EasingConfig,
): EasingConfig {
  return transition.type === "easing" ? transition : base;
}

function toMs({ duration }: CssTiming): number {
  return parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
}

export default function PopoverTune(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>("tune-short");
  const { resolvedTheme, setTheme } = useTheme();
  // Read by onAction, which DialKit may hold from an earlier render.
  const actionRef = React.useRef({
    phase: "enter" as ScrubPhase,
    ms: 400,
    theme: resolvedTheme,
  });

  const v = useDialKit("Popover", CONFIG, {
    id: "popover",
    persist: true,
    onAction: (path) => {
      const { phase, ms, theme } = actionRef.current;
      if (path === "reset") {
        // Back to the component's values; saved versions are kept.
        DialStore.resetValues("popover");
      } else if (path === "theme") {
        setTheme(theme === "dark" ? "light" : "dark");
      } else if (path === "replay") {
        // Exit scrubbing needs an open popup to close; enter needs a closed
        // one. Wait out the current transition so the next starts from rest.
        const exit = phase === "exit";
        setOpen(exit);
        window.setTimeout(() => setOpen(!exit), ms);
      }
    },
  });

  const phase = v.scrub.phase as ScrubPhase;
  const rate = SPEEDS[v.speed] ?? 1;
  useCssScrub({
    selector: SELECTOR,
    enabled: v.scrub.freeze,
    phase,
    time: v.scrub.time,
  });
  useSlowMotion(POSITIONER, rate);

  // Easing tab gives a bezier; Time and Physics tabs give a spring.
  const { scale } = v.motion;
  const fade = bezierOnly(v.motion.fade, FADE_DEFAULT);
  const size = bezierOnly(v.morph.size, SIZE_DEFAULT);
  const position = bezierOnly(v.morph.position, POSITION_DEFAULT);
  const crossfade = bezierOnly(v.morph.crossfade, CROSSFADE_DEFAULT);
  const positionTiming = transitionToCss(position);
  const crossfadeTiming = transitionToCss(crossfade);
  const scaleTiming = transitionToCss(scale);
  const fadeTiming = transitionToCss(fade);
  const sizeTiming = transitionToCss(size);
  const timingChanged =
    isChanged(scale, FADE_DEFAULT) ||
    isChanged(fade, FADE_DEFAULT) ||
    isChanged(size, SIZE_DEFAULT);

  const replayMs =
    Math.max(400, toMs(scaleTiming), toMs(fadeTiming)) / rate + 100;
  React.useEffect(() => {
    actionRef.current = { phase, ms: replayMs, theme: resolvedTheme };
  }, [phase, replayMs, resolvedTheme]);

  // Order matches the component's transition-[width,height,scale,opacity].
  const css = [
    v.surface.radius !== RADIUS &&
      `${SELECTOR} { border-radius: ${v.surface.radius}px; }`,
    timingChanged &&
      `${SELECTOR} {
        transition-duration: ${sizeTiming.duration}, ${sizeTiming.duration}, ${scaleTiming.duration}, ${fadeTiming.duration};
        transition-timing-function: ${sizeTiming.easing}, ${sizeTiming.easing}, ${scaleTiming.easing}, ${fadeTiming.easing};
      }`,
    isChanged(position, POSITION_DEFAULT) &&
      `${POSITIONER}, [data-slot="popover-arrow"] {
        transition-duration: ${positionTiming.duration};
        transition-timing-function: ${positionTiming.easing};
      }`,
    isChanged(crossfade, CROSSFADE_DEFAULT) &&
      `[data-slot="popover-viewport"] :is([data-current], [data-previous]) {
        transition-duration: ${crossfadeTiming.duration};
        transition-timing-function: ${crossfadeTiming.easing};
      }`,
    v.motion.startScale !== START_SCALE &&
      `${SELECTOR}:is([data-starting-style], [data-ending-style]) { scale: ${v.motion.startScale}; }`,
    v.surface.padding !== PADDING &&
      `[data-slot="popover-viewport"] { padding: ${v.surface.padding}px; --viewport-padding: ${v.surface.padding}px; }`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      {!v.original && css && <style>{css}</style>}

      <div className="flex gap-2">
        {CONTENTS.map((content) => (
          <PopoverTrigger
            key={content}
            id={`tune-${content}`}
            handle={handle}
            payload={content}
            render={<Button variant="outline" className="capitalize" />}
          >
            {content}
          </PopoverTrigger>
        ))}
      </div>

      <Popover
        handle={handle}
        open={open}
        triggerId={triggerId}
        onOpenChange={(next, details) => {
          // Clicking the dial panel counts as an outside press.
          if (!next && v.keepOpen && details.reason === "outside-press") return;
          if (next && details.trigger) setTriggerId(details.trigger.id);
          setOpen(next);
        }}
      >
        {({ payload }) => (
          <PopoverContent
            side={v.original ? undefined : (v.side as Side)}
            sideOffset={v.original ? undefined : v.sideOffset}
            level={v.original ? undefined : (v.surface.level as SurfaceLevel)}
            shadowLevel={
              v.original ? undefined : (v.surface.shadowLevel as SurfaceLevel)
            }
          >
            <PopoverBody content={payload ?? "short"} />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

function PopoverBody({ content }: { content: Content }): React.ReactElement {
  if (content === "long") {
    return (
      <div className="w-72">
        <PopoverTitle>Sync paused</PopoverTitle>
        <PopoverDescription>
          Your workspace stopped syncing because the storage quota was reached.
          Free up space or upgrade your plan, and syncing will resume from where
          it left off. Nothing has been lost.
        </PopoverDescription>
      </div>
    );
  }

  if (content === "list") {
    return (
      <div className="w-56">
        <PopoverTitle>Recent activity</PopoverTitle>
        <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
          {Array.from({ length: 40 }, (_, i) => (
            <li key={i}>Event {i + 1} updated the project</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      <PopoverTitle>Notifications</PopoverTitle>
      <PopoverDescription>You are all caught up. Good job!</PopoverDescription>
    </>
  );
}
