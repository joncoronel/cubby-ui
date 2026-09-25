"use client";

import * as React from "react";
import { useDialKit, type DialConfig, type EasingConfig } from "dialkit";
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
import {
  bezierOnly,
  isChanged,
  toMs,
  transitionToCss,
} from "../_lib/transition-css";
import { TuneToolbar, useTuneState } from "../_lib/tune-toolbar";
import { useCssScrub } from "../_lib/use-css-scrub";
import { useSlowMotion } from "../_lib/use-slow-motion";

type Side = "bottom" | "top" | "left" | "right";
type PopoverContentProps = {
  side?: Side;
  sideOffset?: number;
  level?: SurfaceLevel;
  shadowLevel?: SurfaceLevel;
};

const PANEL_ID = "popover";
const SELECTOR = '[data-slot="popover-content"]';
// The positioner wraps the popup and moves on its own during a trigger switch,
// so slow motion has to reach it too.
const POSITIONER = '[data-slot="popover-positioner"]';

// Defaults mirror registry/default/popover/popover.tsx. A rule is only emitted
// once its dial leaves the default, so untouched dials show the real component.
const RADIUS = 12;
const PADDING = 12;
const SIDE = "bottom";
const SIDE_OFFSET = 8;
const LEVEL = 3;
const START_SCALE = 0.95;
// Scale and opacity are separate entries in the component's transition list,
// so each gets its own baseline even though they match today.
const SCALE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.1,
  ease: [0.19, 1, 0.22, 1], // --ease-out-expo
};
const FADE_DEFAULT: EasingConfig = { ...SCALE_DEFAULT };
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

// Component values only. Playback controls live in the TuneToolbar so they
// stay out of DialKit's Copy output and saved versions.
const CONFIG = {
  side: { type: "select", options: [SIDE, "top", "left", "right"] },
  sideOffset: [SIDE_OFFSET, 0, 24, 1],
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
    scale: { ...SCALE_DEFAULT },
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
} satisfies DialConfig;

export default function PopoverTune(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>("tune-short");
  const [tune, setTune] = useTuneState();
  const replayTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(replayTimer.current), []);
  const v = useDialKit("Popover", CONFIG, { id: PANEL_ID, persist: true });

  useCssScrub({
    selector: SELECTOR,
    enabled: tune.freeze,
    phase: tune.phase,
    time: tune.time,
  });
  useSlowMotion(POSITIONER, tune.rate);

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
    isChanged(scale, SCALE_DEFAULT) ||
    isChanged(fade, FADE_DEFAULT) ||
    isChanged(size, SIZE_DEFAULT);

  const longestMs = Math.max(toMs(scaleTiming), toMs(fadeTiming));

  function replay(): void {
    // Exit scrubbing needs an open popup to close; enter needs a closed one.
    // Wait out the current transition so the next starts from rest.
    const ms = Math.max(400, longestMs) / tune.rate + 100;
    const exit = tune.phase === "exit";
    window.clearTimeout(replayTimer.current);
    setOpen(exit);
    replayTimer.current = window.setTimeout(() => setOpen(!exit), ms);
  }

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

  // Same rule as the CSS: only props whose dial left the default. Spread onto
  // the component and copied by the toolbar as new defaults.
  const changedProps: PopoverContentProps = {
    ...(v.side !== SIDE && { side: v.side as Side }),
    ...(v.sideOffset !== SIDE_OFFSET && { sideOffset: v.sideOffset }),
    ...(v.surface.level !== LEVEL && {
      level: v.surface.level as SurfaceLevel,
    }),
    ...(v.surface.shadowLevel !== LEVEL && {
      shadowLevel: v.surface.shadowLevel as SurfaceLevel,
    }),
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      {!tune.original && css && <style>{css}</style>}

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
          // Clicking or tabbing into the dial panel or toolbar counts as
          // leaving the popup.
          const leaving =
            details.reason === "outside-press" ||
            details.reason === "focus-out";
          if (!next && tune.keepOpen && leaving) return;
          if (next && details.trigger) setTriggerId(details.trigger.id);
          setOpen(next);
        }}
      >
        {({ payload }) => (
          <PopoverContent {...(!tune.original && changedProps)}>
            <PopoverBody content={payload ?? "short"} />
          </PopoverContent>
        )}
      </Popover>

      <TuneToolbar
        state={tune}
        setState={setTune}
        panelId={PANEL_ID}
        file="registry/default/popover/popover.tsx"
        css={css}
        props={{ PopoverContent: changedProps }}
        onReplay={replay}
        showKeepOpen
        // Springs can settle past 1s; round up so the slider reaches the end.
        scrubMax={Math.max(1000, Math.ceil(longestMs / 100) * 100)}
      />
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
