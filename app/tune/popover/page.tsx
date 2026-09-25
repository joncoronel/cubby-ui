"use client";

import * as React from "react";
import {
  DialStore,
  useDialKit,
  type DialConfig,
  type EasingConfig,
  type TransitionConfig,
} from "dialkit";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/default/popover/popover";
import { Button } from "@/registry/default/button/button";
import { transitionToCss, type CssTiming } from "../_lib/transition-css";
import { useCssScrub, type ScrubPhase } from "../_lib/use-css-scrub";

type Side = "bottom" | "top" | "left" | "right";

// Defaults mirror registry/default/popover/popover.tsx. A rule is only emitted
// once its dial leaves the default, so untouched dials show the real component.
const RADIUS = 12;
const PADDING = 12;
const DURATION = 0.1;
const EASE: EasingConfig["ease"] = [0.19, 1, 0.22, 1]; // --ease-out-expo
const START_SCALE = 0.95;
const SIZE_EASE = "cubic-bezier(0.22,1,0.36,1)";
const DEFAULT_TIMING: EasingConfig = {
  type: "easing",
  duration: DURATION,
  ease: EASE,
};

function isChanged(transition: TransitionConfig): boolean {
  return (
    transition.type !== "easing" ||
    transition.duration !== DURATION ||
    transition.ease.some((n, i) => n !== EASE[i])
  );
}

function toMs({ duration }: CssTiming): number {
  return parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
}

const CONFIG = {
  original: false,
  keepOpen: true,
  side: { type: "select", options: ["bottom", "top", "left", "right"] },
  sideOffset: [8, 0, 24, 1],
  surface: {
    radius: [RADIUS, 0, 32, 1],
    padding: [PADDING, 0, 32, 1],
  },
  motion: {
    // Springs overshoot and swing back. Scale shows that as bounce; opacity
    // is capped at 1, so it only shows the swing-back as a flicker. Hence two
    // dials, and the fade one ignores springs.
    scale: { type: "easing", duration: DURATION, ease: EASE },
    fade: { type: "easing", duration: DURATION, ease: EASE }, // easing only
    startScale: [START_SCALE, 0.8, 1, 0.01],
  },
  scrub: {
    freeze: false,
    phase: { type: "select", options: ["enter", "exit"] },
    time: [0, 0, 1000, 1],
  },
  replay: { type: "action" },
  reset: { type: "action", label: "Reset to component" },
} satisfies DialConfig;

export default function PopoverTune(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  // Read by onAction, which DialKit may hold from an earlier render.
  const replayRef = React.useRef({ phase: "enter" as ScrubPhase, ms: 400 });

  const v = useDialKit("Popover", CONFIG, {
    id: "popover",
    persist: true,
    onAction: (path) => {
      // Back to the component's values; saved versions are kept.
      if (path === "reset") return DialStore.resetValues("popover");
      if (path !== "replay") return;
      // Exit scrubbing needs an open popup to close; enter needs a closed one.
      // Wait out the current transition so the next one starts from rest.
      const { phase, ms } = replayRef.current;
      const exit = phase === "exit";
      setOpen(exit);
      window.setTimeout(() => setOpen(!exit), ms);
    },
  });

  const phase = v.scrub.phase as ScrubPhase;
  useCssScrub({
    selector: '[data-slot="popover-content"]',
    enabled: v.scrub.freeze,
    phase,
    time: v.scrub.time,
  });

  // Easing tab gives a bezier; Time and Physics tabs give a spring.
  const { scale, fade } = v.motion;
  const fadeEasing = fade.type === "easing" ? fade : DEFAULT_TIMING;
  const scaleTiming = transitionToCss(scale);
  const fadeTiming = transitionToCss(fadeEasing);
  const timingChanged = isChanged(scale) || isChanged(fadeEasing);

  const replayMs = Math.max(400, toMs(scaleTiming), toMs(fadeTiming)) + 100;
  React.useEffect(() => {
    replayRef.current = { phase, ms: replayMs };
  }, [phase, replayMs]);

  // Keeps the width/height entries of the component's 4-value transition list.
  const css = [
    v.surface.radius !== RADIUS &&
      `[data-slot="popover-content"] { border-radius: ${v.surface.radius}px; }`,
    timingChanged &&
      `[data-slot="popover-content"] {
        transition-duration: 150ms, 150ms, ${scaleTiming.duration}, ${fadeTiming.duration};
        transition-timing-function: ${SIZE_EASE}, ${SIZE_EASE}, ${scaleTiming.easing}, ${fadeTiming.easing};
      }`,
    v.motion.startScale !== START_SCALE &&
      `[data-slot="popover-content"]:is([data-starting-style], [data-ending-style]) { scale: ${v.motion.startScale}; }`,
    v.surface.padding !== PADDING &&
      `[data-slot="popover-viewport"] { padding: ${v.surface.padding}px; --viewport-padding: ${v.surface.padding}px; }`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      {!v.original && css && <style>{css}</style>}

      <Popover
        open={open}
        onOpenChange={(next, details) => {
          // Clicking the dial panel counts as an outside press.
          if (!next && v.keepOpen && details.reason === "outside-press") return;
          setOpen(next);
        }}
      >
        <PopoverTrigger render={<Button variant="outline" />}>
          Open popover
        </PopoverTrigger>
        <PopoverContent
          side={v.original ? undefined : (v.side as Side)}
          sideOffset={v.original ? undefined : v.sideOffset}
        >
          <PopoverTitle>Notifications</PopoverTitle>
          <PopoverDescription>
            You are all caught up. Good job!
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  );
}
