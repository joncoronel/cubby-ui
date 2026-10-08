"use client";

import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { useDialKit, type DialConfig, type EasingConfig } from "dialkit";
import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardTrigger,
  createPreviewCardHandle,
} from "@/registry/default/preview-card/preview-card";
import { Avatar, AvatarFallback } from "@/registry/default/avatar/avatar";
import {
  solidSurface,
  type SurfaceLevel,
} from "@/registry/default/lib/elevated";
import { cn } from "@/lib/utils";
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
type ContentProps = {
  side?: Side;
  sideOffset?: number;
  level?: SurfaceLevel;
  shadowLevel?: SurfaceLevel;
};
type TriggerProps = { delay?: number; closeDelay?: number };

const PANEL_ID = "preview-card";
const SELECTOR = '[data-slot="preview-card-content"]';
// The positioner wraps the popup and glides on its own during a trigger
// switch, so slow motion has to reach it too.
const POSITIONER = '[data-slot="preview-card-positioner"]';
const VIEWPORT = '[data-slot="preview-card-viewport"]';

// Defaults mirror registry/default/preview-card/preview-card.tsx. A rule is
// only emitted once its dial leaves the default, so untouched dials show the
// real component.
const DELAY = 400;
const CLOSE_DELAY = 200;
const SIDE = "bottom";
const SIDE_OFFSET = 8;
const RADIUS = 14; // rounded-xl
const PADDING = 16;
const LEVEL = 3;
const START_SCALE = 0.98;
const START_BLUR = 1;
const END_SCALE = 0.98;
const SLIDE_DISTANCE = 30; // % of the content's width

const EXPO: EasingConfig["ease"] = [0.19, 1, 0.22, 1]; // --ease-out-expo
const QUINT: EasingConfig["ease"] = [0.22, 1, 0.36, 1];
// Scale, opacity, and blur are separate entries in the popup's transition
// list, so each gets its own baseline even though they match today.
const SCALE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.1,
  ease: EXPO,
};
const FADE_DEFAULT: EasingConfig = { ...SCALE_DEFAULT };
// data-ending-style:duration-100 ease-out (Tailwind's ease-out).
const EXIT_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.1,
  ease: [0, 0, 0.2, 1],
};
// A trigger switch runs four transitions together: the popup resizes, the
// positioner (and arrow) glides, and the content slides while it fades.
const SIZE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.2,
  ease: QUINT,
};
const GLIDE_DEFAULT: EasingConfig = { ...SIZE_DEFAULT };
const SLIDE_DEFAULT: EasingConfig = { ...SIZE_DEFAULT, duration: 0.15 };
const SLIDE_FADE_DEFAULT: EasingConfig = { ...SIZE_DEFAULT, duration: 0.1 };

type Person = {
  id: string;
  name: string;
  initials: string;
  role: string;
  commits: number;
  tint: string;
};

// The docs example's row, plus one longer role so a switch also exercises the
// height morph, not just the glide.
const PEOPLE: Person[] = [
  {
    id: "maren",
    name: "Maren Okafor",
    initials: "MO",
    role: "Typography",
    commits: 412,
    tint: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    id: "tomas",
    name: "Tomás Reyes",
    initials: "TR",
    role: "Motion and gestures",
    commits: 268,
    tint: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  },
  {
    id: "ines",
    name: "Inès Laurent",
    initials: "IL",
    role: "Accessibility review",
    commits: 1093,
    tint: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  {
    id: "kenji",
    name: "Kenji Arai",
    initials: "KA",
    role: "Docs and examples",
    commits: 57,
    tint: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  },
  {
    id: "priya",
    name: "Priya Natarajan",
    initials: "PN",
    role: "Release engineering, the CI pipeline, and every changelog since 1.0",
    commits: 731,
    tint: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
  },
];

const handle = createPreviewCardHandle<Person>();
// Reference row: Base UI's own detached-triggers demo, for side-by-side
// comparison of the switch motion.
const baseHandle = BasePreviewCard.createHandle<Person>();
// Stacked list: moving down or up the list is a purely vertical switch, which
// is the only case that slides the content vertically.
const listHandle = createPreviewCardHandle<Person>();
const BASE_POSITIONER = '[data-tune="base-positioner"]';

// Component values only. Playback controls live in the TuneToolbar so they
// stay out of DialKit's Copy output and saved versions.
const CONFIG = {
  timing: {
    delay: [DELAY, 0, 1000, 25],
    closeDelay: [CLOSE_DELAY, 0, 800, 25],
  },
  placement: {
    side: { type: "select", options: [SIDE, "top", "left", "right"] },
    sideOffset: [SIDE_OFFSET, 0, 24, 1],
  },
  surface: {
    radius: [RADIUS, 0, 32, 1],
    padding: [PADDING, 0, 32, 1],
    level: [LEVEL, 1, 8, 1],
    shadowLevel: [LEVEL, 1, 8, 1],
  },
  enter: {
    // Springs overshoot and swing back. Scale shows that as bounce; opacity
    // and blur are capped, so they only show the swing-back as a flicker.
    // Hence separate dials, and fade ignores springs.
    scale: { ...SCALE_DEFAULT },
    fade: { ...FADE_DEFAULT }, // easing only, also drives the blur
    startScale: [START_SCALE, 0.8, 1, 0.01],
    startBlur: [START_BLUR, 0, 8, 0.5],
  },
  exit: {
    curve: { ...EXIT_DEFAULT }, // easing only
    endScale: [END_SCALE, 0.8, 1, 0.01],
  },
  // Runs when the pointer moves to another avatar while the card is open.
  // Easing only: none of these should overshoot. Keep them in step, or the
  // card stops reading as one object.
  morph: {
    glide: { ...GLIDE_DEFAULT },
    size: { ...SIZE_DEFAULT },
    slide: { ...SLIDE_DEFAULT },
    slideFade: { ...SLIDE_FADE_DEFAULT },
    slideDistance: [SLIDE_DISTANCE, 0, 100, 1],
  },
} satisfies DialConfig;

export default function PreviewCardTune(): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [triggerId, setTriggerId] = React.useState<string | null>(
    `tune-${PEOPLE[0].id}`,
  );
  const [tune, setTune] = useTuneState();
  const replayTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(replayTimer.current), []);
  const v = useDialKit("Preview Card", CONFIG, { id: PANEL_ID, persist: true });

  useCssScrub({
    selector: SELECTOR,
    enabled: tune.freeze,
    phase: tune.phase,
    time: tune.time,
  });
  // Both rows, so the reference plays at the same speed.
  useSlowMotion(`${POSITIONER}, ${BASE_POSITIONER}`, tune.rate);

  // Easing tab gives a bezier; Time and Physics tabs give a spring.
  const { scale } = v.enter;
  const fade = bezierOnly(v.enter.fade, FADE_DEFAULT);
  const exit = bezierOnly(v.exit.curve, EXIT_DEFAULT);
  const size = bezierOnly(v.morph.size, SIZE_DEFAULT);
  const glide = bezierOnly(v.morph.glide, GLIDE_DEFAULT);
  const slide = bezierOnly(v.morph.slide, SLIDE_DEFAULT);
  const slideFade = bezierOnly(v.morph.slideFade, SLIDE_FADE_DEFAULT);
  const scaleTiming = transitionToCss(scale);
  const fadeTiming = transitionToCss(fade);
  const exitTiming = transitionToCss(exit);
  const sizeTiming = transitionToCss(size);
  const glideTiming = transitionToCss(glide);
  const slideTiming = transitionToCss(slide);
  const slideFadeTiming = transitionToCss(slideFade);

  const enterChanged =
    isChanged(scale, SCALE_DEFAULT) ||
    isChanged(fade, FADE_DEFAULT) ||
    isChanged(size, SIZE_DEFAULT);
  const slideChanged =
    isChanged(slide, SLIDE_DEFAULT) || isChanged(slideFade, SLIDE_FADE_DEFAULT);

  const longestMs = Math.max(toMs(scaleTiming), toMs(fadeTiming));

  function replay(): void {
    // Exit scrubbing needs an open card to close; enter needs a closed one.
    // Wait out the current transition so the next starts from rest.
    const ms = Math.max(400, longestMs) / tune.rate + 100;
    const leaving = tune.phase === "exit";
    window.clearTimeout(replayTimer.current);
    setOpen(leaving);
    replayTimer.current = window.setTimeout(() => setOpen(!leaving), ms);
  }

  const d = v.morph.slideDistance;
  const css = [
    v.surface.radius !== RADIUS &&
      `${SELECTOR} { border-radius: ${v.surface.radius}px; }`,
    v.surface.padding !== PADDING &&
      `${VIEWPORT} { padding: ${v.surface.padding}px; --viewport-padding: ${v.surface.padding}px; }`,
    // Order matches the component's transition-[width,height,scale,opacity,filter].
    // The blur rides on the fade's curve, as it does in the component.
    enterChanged &&
      `${SELECTOR} {
        transition-duration: ${sizeTiming.duration}, ${sizeTiming.duration}, ${scaleTiming.duration}, ${fadeTiming.duration}, ${fadeTiming.duration};
        transition-timing-function: ${sizeTiming.easing}, ${sizeTiming.easing}, ${scaleTiming.easing}, ${fadeTiming.easing}, ${fadeTiming.easing};
      }`,
    // An unlayered enter override would also beat the component's layered
    // exit timing, so restate the exit whenever the enter changes.
    (enterChanged || isChanged(exit, EXIT_DEFAULT)) &&
      `${SELECTOR}[data-ending-style] {
        transition-duration: ${exitTiming.duration};
        transition-timing-function: ${exitTiming.easing};
      }`,
    (v.enter.startScale !== START_SCALE || v.enter.startBlur !== START_BLUR) &&
      `${SELECTOR}[data-starting-style] { scale: ${v.enter.startScale}; filter: blur(${v.enter.startBlur}px); }`,
    v.exit.endScale !== END_SCALE &&
      `${SELECTOR}[data-ending-style] { scale: ${v.exit.endScale}; }`,
    isChanged(glide, GLIDE_DEFAULT) &&
      `${POSITIONER}, [data-slot="preview-card-arrow"] {
        transition-duration: ${glideTiming.duration};
        transition-timing-function: ${glideTiming.easing};
      }`,
    // Order matches transition-[translate,opacity] on the content wrappers.
    slideChanged &&
      `${VIEWPORT} :is([data-current], [data-previous]) {
        transition-duration: ${slideTiming.duration}, ${slideFadeTiming.duration};
        transition-timing-function: ${slideTiming.easing}, ${slideFadeTiming.easing};
      }`,
    d !== SLIDE_DISTANCE &&
      `${VIEWPORT}[data-activation-direction~="right"] [data-current][data-starting-style],
      ${VIEWPORT}[data-activation-direction~="left"] [data-previous][data-ending-style] { translate: ${d}% 0; }
      ${VIEWPORT}[data-activation-direction~="left"] [data-current][data-starting-style],
      ${VIEWPORT}[data-activation-direction~="right"] [data-previous][data-ending-style] { translate: -${d}% 0; }
      ${VIEWPORT}[data-activation-direction~="down"]:not([data-activation-direction~="left"], [data-activation-direction~="right"]) [data-current][data-starting-style],
      ${VIEWPORT}[data-activation-direction~="up"]:not([data-activation-direction~="left"], [data-activation-direction~="right"]) [data-previous][data-ending-style] { translate: 0 ${d}%; }
      ${VIEWPORT}[data-activation-direction~="up"]:not([data-activation-direction~="left"], [data-activation-direction~="right"]) [data-current][data-starting-style],
      ${VIEWPORT}[data-activation-direction~="down"]:not([data-activation-direction~="left"], [data-activation-direction~="right"]) [data-previous][data-ending-style] { translate: 0 -${d}%; }`,
  ]
    .filter(Boolean)
    .join("\n");

  // Same rule as the CSS: only props whose dial left the default. Spread onto
  // the components and copied by the toolbar as new defaults.
  const contentProps: ContentProps = {
    ...(v.placement.side !== SIDE && { side: v.placement.side as Side }),
    ...(v.placement.sideOffset !== SIDE_OFFSET && {
      sideOffset: v.placement.sideOffset,
    }),
    ...(v.surface.level !== LEVEL && {
      level: v.surface.level as SurfaceLevel,
    }),
    ...(v.surface.shadowLevel !== LEVEL && {
      shadowLevel: v.surface.shadowLevel as SurfaceLevel,
    }),
  };
  const triggerProps: TriggerProps = {
    ...(v.timing.delay !== DELAY && { delay: v.timing.delay }),
    ...(v.timing.closeDelay !== CLOSE_DELAY && {
      closeDelay: v.timing.closeDelay,
    }),
  };

  return (
    <div className="flex min-h-screen items-center justify-center gap-96 p-8">
      {!tune.original && css && <style>{css}</style>}

      <section className="flex flex-col items-start gap-1">
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          Stacked list (vertical switch)
        </p>
        {PEOPLE.map((person) => (
          <PreviewCardTrigger
            key={person.id}
            id={`tune-list-${person.id}`}
            handle={listHandle}
            payload={person}
            href="#"
            onClick={(event) => event.preventDefault()}
            className="hover:bg-muted data-popup-open:bg-muted focus-visible:outline-ring flex w-48 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:outline-2"
            {...(!tune.original && triggerProps)}
          >
            <Avatar size="sm">
              <AvatarFallback
                className={cn("text-xs font-medium", person.tint)}
              >
                {person.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground truncate">{person.name}</span>
          </PreviewCardTrigger>
        ))}
      </section>
      <PreviewCard handle={listHandle}>
        {({ payload }) => (
          <PreviewCardContent
            side="right"
            className="w-60"
            {...(!tune.original && contentProps)}
          >
            {payload && <PersonCard person={payload} />}
          </PreviewCardContent>
        )}
      </PreviewCard>

      <section className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-xs font-medium">Cubby</p>
        <div className="flex -space-x-2">
          {PEOPLE.map((person) => (
            <PreviewCardTrigger
              key={person.id}
              id={`tune-${person.id}`}
              handle={handle}
              payload={person}
              href="#"
              aria-label={person.name}
              onClick={(event) => event.preventDefault()}
              className="group focus-visible:outline-ring inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
              {...(!tune.original && triggerProps)}
            >
              <PersonAvatar person={person} />
            </PreviewCardTrigger>
          ))}
        </div>
        <p className="text-muted-foreground mt-48 text-xs font-medium">
          Base UI demo (reference)
        </p>
        <div className="flex -space-x-2">
          {PEOPLE.map((person) => (
            <BasePreviewCard.Trigger
              key={person.id}
              handle={baseHandle}
              payload={person}
              href="#"
              aria-label={`${person.name} (reference)`}
              onClick={(event) => event.preventDefault()}
              className="group inline-flex rounded-full"
            >
              <PersonAvatar person={person} />
            </BasePreviewCard.Trigger>
          ))}
        </div>
        <BaseUIReference />
      </section>

      <PreviewCard
        handle={handle}
        open={open}
        triggerId={triggerId}
        onOpenChange={(next, details) => {
          // Hovering off toward the dial panel or toolbar, or clicking them,
          // would close the card. Escape still does.
          const leaving =
            details.reason === "trigger-hover" ||
            details.reason === "outside-press";
          if (!next && tune.keepOpen && leaving) return;
          if (next && details.trigger) setTriggerId(details.trigger.id);
          setOpen(next);
        }}
      >
        {({ payload }) => (
          <PreviewCardContent
            className="w-60"
            {...(!tune.original && contentProps)}
          >
            {payload && <PersonCard person={payload} />}
          </PreviewCardContent>
        )}
      </PreviewCard>

      <TuneToolbar
        state={tune}
        setState={setTune}
        panelId={PANEL_ID}
        file="registry/default/preview-card/preview-card.tsx"
        css={css}
        props={{
          PreviewCardTrigger: triggerProps,
          PreviewCardContent: contentProps,
        }}
        onReplay={replay}
        showKeepOpen
        // Springs can settle past 1s; round up so the slider reaches the end.
        scrubMax={Math.max(1000, Math.ceil(longestMs / 100) * 100)}
      />
    </div>
  );
}

function PersonAvatar({ person }: { person: Person }): React.ReactElement {
  return (
    <Avatar className="ring-background ring-2 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-data-popup-open:-translate-y-0.5 motion-reduce:transition-none">
      <AvatarFallback className={cn("text-sm font-medium", person.tint)}>
        {person.initials}
      </AvatarFallback>
    </Avatar>
  );
}

function PersonCard({ person }: { person: Person }): React.ReactElement {
  return (
    <>
      <p className="text-foreground font-semibold">{person.name}</p>
      <p className="text-muted-foreground">{person.role}</p>
      <p className="text-muted-foreground mt-3 tabular-nums">
        <span className="text-foreground font-medium">
          {person.commits.toLocaleString("en-US")}
        </span>{" "}
        commits this year
      </p>
    </>
  );
}

/**
 * Base UI's detached-triggers-full demo with its motion classes copied
 * verbatim: positioner, popup, and viewport. Only the surface (fill, shadow,
 * radius) and the content are ours, so any difference left is motion. Their
 * content carries its own padding inside the viewport, so this does too.
 */
function BaseUIReference(): React.ReactElement {
  return (
    <BasePreviewCard.Root handle={baseHandle}>
      {({ payload }) => (
        <BasePreviewCard.Portal>
          <BasePreviewCard.Positioner
            data-tune="base-positioner"
            sideOffset={8}
            className="z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] transition-[top,left,right,bottom,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <BasePreviewCard.Popup
              className={cn(
                "text-popover-foreground relative h-[var(--popup-height,auto)] w-[var(--popup-width,auto)] origin-[var(--transform-origin)] rounded-xl text-sm transition-[width,height,opacity,transform] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:[transform:scale(0.98)] data-ending-style:opacity-0 data-starting-style:[transform:scale(0.98)] data-starting-style:opacity-0",
                solidSurface(3, 3),
              )}
            >
              <BasePreviewCard.Viewport className="relative h-full w-full overflow-clip rounded-[inherit] [&_[data-current]]:w-[var(--popup-width)] [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100 [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-[30%] data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-[30%] data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0 [&_[data-previous]]:w-[var(--popup-width)] [&_[data-previous]]:translate-x-0 [&_[data-previous]]:opacity-100 [&_[data-previous]]:transition-[translate,opacity] [&_[data-previous]]:duration-[350ms,175ms] [&_[data-previous]]:ease-[cubic-bezier(0.22,1,0.36,1)] data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-[30%] data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0 data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-[30%] data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0">
                {payload && (
                  <div className="w-60 p-4">
                    <PersonCard person={payload} />
                  </div>
                )}
              </BasePreviewCard.Viewport>
            </BasePreviewCard.Popup>
          </BasePreviewCard.Positioner>
        </BasePreviewCard.Portal>
      )}
    </BasePreviewCard.Root>
  );
}
