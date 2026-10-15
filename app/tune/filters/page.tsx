"use client";

import * as React from "react";
import { useDialKit, type DialConfig, type EasingConfig } from "dialkit";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardCircleIcon,
  Flag02Icon,
  TextFontIcon,
  Timer01Icon,
} from "@hugeicons/core-free-icons";
import {
  Filters,
  createFilter,
  type FilterField,
  type FilterSize,
  type FilterValue,
  type FilterVariant,
} from "@/registry/default/filters/filters";
import {
  bezierOnly,
  isChanged,
  toMs,
  transitionToCss,
  type CssTiming,
} from "../_lib/transition-css";
import { TuneToolbar, useTuneState } from "../_lib/tune-toolbar";
import { useCssScrub } from "../_lib/use-css-scrub";
import { useSlowMotion } from "../_lib/use-slow-motion";

type FiltersProps = { size?: FilterSize; variant?: FilterVariant };

const PANEL_ID = "filters";
const BAR = '[data-slot="filters"]';
// The add menu's popup. Its submenus switch with no motion and its positioner
// doesn't glide, so neither has a dial.
const MENU_POPUP = '[data-slot="dropdown-menu-popup"]';
const FOLDS =
  '[data-slot="filter-add-label"], [data-slot="filter-clear-segment"]';

// Defaults mirror the source. A rule is only emitted once its dial leaves the
// default, so untouched dials show the real component.
const SIZE: FilterSize = "default";
const VARIANT: FilterVariant = "outline";
const EASE_SNAP = [0.22, 1, 0.36, 1] as const;
const EASE_OUT_EXPO = [0.19, 1, 0.22, 1] as const;
// lib/flow-presence.ts: FLOW_MS, EASE, EXIT_FADE_MS, and the entrance fade's
// literal "ease-out". These run through element.animate(), not CSS.
const FLOW_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.22,
  ease: [...EASE_SNAP],
};
const CHIP_FADE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.22,
  ease: [0, 0, 0.58, 1], // CSS `ease-out`
};
const EXIT_FADE_DEFAULT: EasingConfig = { ...FLOW_DEFAULT, duration: 0.13 };
// The add button's label and the clear segment fold on the same clock.
const FOLD_DEFAULT: EasingConfig = { ...FLOW_DEFAULT };
const MENU_SCALE_DEFAULT: EasingConfig = {
  type: "easing",
  duration: 0.1,
  ease: [...EASE_OUT_EXPO],
};
const MENU_FADE_DEFAULT: EasingConfig = { ...MENU_SCALE_DEFAULT };
const START_SCALE = 0.95;

// The values flow-presence.ts passes to element.animate(), to tell calls apart.
const FLOW_MS = 220;
const EXIT_FADE_MS = 130;
const FLOW_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Component values only. Playback controls live in the TuneToolbar.
const CONFIG = {
  size: { type: "select", options: [SIZE, "sm", "lg"] },
  variant: { type: "select", options: [VARIANT, "soft", "elevated"] },
  // Easing only: the space is a negative margin, so an overshoot would pull
  // the chip over its neighbour.
  chips: {
    flow: { ...FLOW_DEFAULT },
    fadeIn: { ...CHIP_FADE_DEFAULT },
    fadeOut: { ...EXIT_FADE_DEFAULT },
  },
  // "Filter +" folding to "+", and the clear segment opening.
  actions: {
    fold: { ...FOLD_DEFAULT },
  },
  menu: {
    scale: { ...MENU_SCALE_DEFAULT },
    fade: { ...MENU_FADE_DEFAULT }, // easing only
    startScale: [START_SCALE, 0.8, 1, 0.01],
  },
} satisfies DialConfig;

type FlowOverrides = {
  flow?: CssTiming;
  fadeIn?: CssTiming;
  fadeOut?: CssTiming;
};

/**
 * Rewrites flow-presence's element.animate() timings inside a Filters bar,
 * matched by fixed duration and easing. Returns a cleanup that restores it.
 */
function patchFlowAnimations(read: () => FlowOverrides): () => void {
  const original = Element.prototype.animate;
  Element.prototype.animate = function animate(
    this: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ): Animation {
    if (typeof options === "object" && this.closest(BAR)) {
      const overrides = read();
      const { duration, easing } = options;
      const timing =
        duration === FLOW_MS && easing === FLOW_EASE
          ? overrides.flow
          : duration === FLOW_MS && easing === "ease-out"
            ? overrides.fadeIn
            : duration === EXIT_FADE_MS
              ? overrides.fadeOut
              : undefined;
      if (timing) {
        options = { ...options, duration: toMs(timing), easing: timing.easing };
      }
    }
    return original.call(this, keyframes, options);
  };
  return () => {
    Element.prototype.animate = original;
  };
}

function Dot({ className }: { className: string }): React.ReactElement {
  return (
    <span aria-hidden className={`size-2 shrink-0 rounded-full ${className}`} />
  );
}

const FIELDS: FilterField[] = [
  {
    id: "status",
    label: "Status",
    icon: <HugeiconsIcon icon={DashboardCircleIcon} strokeWidth={2} />,
    type: "select",
    options: [
      {
        value: "todo",
        label: "Todo",
        icon: <Dot className="bg-[oklch(0.7_0_0)]" />,
      },
      {
        value: "in_progress",
        label: "In progress",
        icon: <Dot className="bg-[oklch(0.75_0.15_75)]" />,
      },
      {
        value: "done",
        label: "Done",
        icon: <Dot className="bg-[oklch(0.7_0.16_150)]" />,
      },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    icon: <HugeiconsIcon icon={Flag02Icon} strokeWidth={2} />,
    type: "multiselect",
    options: [
      {
        value: "low",
        label: "Low",
        icon: <Dot className="bg-[oklch(0.7_0_0)]" />,
      },
      {
        value: "high",
        label: "High",
        icon: <Dot className="bg-[oklch(0.75_0.15_75)]" />,
      },
      {
        value: "urgent",
        label: "Urgent",
        icon: <Dot className="bg-[oklch(0.62_0.2_25)]" />,
      },
    ],
  },
  {
    id: "title",
    label: "Title",
    icon: <HugeiconsIcon icon={TextFontIcon} strokeWidth={2} />,
    type: "text",
  },
  {
    id: "estimate",
    label: "Estimate",
    icon: <HugeiconsIcon icon={Timer01Icon} strokeWidth={2} />,
    type: "number",
  },
];

// Replay adds and removes this chip, so the flow runs without the menu.
const REPLAY_FILTER = createFilter(FIELDS[1], {
  id: "tune-replay",
  value: ["urgent"],
});

const VARIANTS = [
  { id: "empty", label: "Empty (folds the add button)", width: undefined },
  { id: "seeded", label: "With a chip", width: undefined },
  { id: "narrow", label: "Narrow (scrolls)", width: "w-80" },
] as const;

function seedFor(id: (typeof VARIANTS)[number]["id"]): FilterValue[] {
  if (id === "empty") return [];
  const status = createFilter(FIELDS[0], {
    id: `seed-status-${id}`,
    value: "in_progress",
  });
  if (id === "seeded") return [status];
  return [
    status,
    createFilter(FIELDS[2], { id: "seed-title", value: "Design review" }),
    createFilter(FIELDS[3], { id: "seed-estimate", value: 3 }),
  ];
}

export default function FiltersTune(): React.ReactElement {
  const [tune, setTune] = useTuneState();
  const [values, setValues] = React.useState(() =>
    Object.fromEntries(VARIANTS.map(({ id }) => [id, seedFor(id)])),
  );
  const replayTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(replayTimer.current), []);
  const v = useDialKit("Filters", CONFIG, { id: PANEL_ID, persist: true });

  // Scrub reaches the menu's CSS transitions. The chips run on
  // element.animate(), which transitionrun never reports.
  useCssScrub({
    selector: MENU_POPUP,
    enabled: tune.freeze,
    phase: tune.phase,
    time: tune.time,
  });
  // Slow motion reaches the chips, but flow-presence removes a leaving chip's
  // copy on a real-time timer, so slowed exits get cut short.
  useSlowMotion(`${BAR}, [data-slot="dropdown-menu-positioner"]`, tune.rate);

  const flow = bezierOnly(v.chips.flow, FLOW_DEFAULT);
  const fadeIn = bezierOnly(v.chips.fadeIn, CHIP_FADE_DEFAULT);
  const fadeOut = bezierOnly(v.chips.fadeOut, EXIT_FADE_DEFAULT);
  const fold = bezierOnly(v.actions.fold, FOLD_DEFAULT);
  const { scale: menuScale } = v.menu;
  const menuFade = bezierOnly(v.menu.fade, MENU_FADE_DEFAULT);

  const flowTiming = transitionToCss(flow);
  const fadeInTiming = transitionToCss(fadeIn);
  const fadeOutTiming = transitionToCss(fadeOut);
  const foldTiming = transitionToCss(fold);
  const menuScaleTiming = transitionToCss(menuScale);
  const menuFadeTiming = transitionToCss(menuFade);

  // The chips call element.animate() with fixed values, so the page rewrites
  // those calls instead. Only dials that left their default are applied.
  const flowOverrides: FlowOverrides = tune.original
    ? {}
    : {
        flow: isChanged(flow, FLOW_DEFAULT) ? flowTiming : undefined,
        fadeIn: isChanged(fadeIn, CHIP_FADE_DEFAULT) ? fadeInTiming : undefined,
        fadeOut: isChanged(fadeOut, EXIT_FADE_DEFAULT)
          ? fadeOutTiming
          : undefined,
      };
  const flowOverridesRef = React.useRef(flowOverrides);
  React.useEffect(() => {
    flowOverridesRef.current = flowOverrides;
  });
  React.useEffect(
    () => patchFlowAnimations(() => flowOverridesRef.current),
    [],
  );

  const longestMs = Math.max(
    toMs(flowTiming),
    toMs(fadeInTiming),
    toMs(fadeOutTiming),
  );

  function replay(): void {
    // Enter: take the chip out, then add it. Exit: the reverse.
    const ms = Math.max(400, longestMs) / tune.rate + 100;
    const exit = tune.phase === "exit";
    const withChip = (list: FilterValue[]): FilterValue[] =>
      list.some((filter) => filter.id === REPLAY_FILTER.id)
        ? list
        : [...list, REPLAY_FILTER];
    const withoutChip = (list: FilterValue[]): FilterValue[] =>
      list.filter((filter) => filter.id !== REPLAY_FILTER.id);
    const apply = (fn: (list: FilterValue[]) => FilterValue[]): void =>
      setValues((current) =>
        Object.fromEntries(
          Object.entries(current).map(([id, list]) => [id, fn(list)]),
        ),
      );
    window.clearTimeout(replayTimer.current);
    apply(exit ? withChip : withoutChip);
    replayTimer.current = window.setTimeout(
      () => apply(exit ? withoutChip : withChip),
      ms,
    );
  }

  const css = [
    isChanged(fold, FOLD_DEFAULT) &&
      `/* filters-add-menu.tsx (label), filters.tsx (clear segment) */
${FOLDS} {
  transition-duration: ${foldTiming.duration};
  transition-timing-function: ${foldTiming.easing};
}`,
    // Order matches DropdownMenuPopup's transition-[scale,opacity].
    (isChanged(menuScale, MENU_SCALE_DEFAULT) ||
      isChanged(menuFade, MENU_FADE_DEFAULT)) &&
      `/* dropdown-menu.tsx: DropdownMenuPopup */
${MENU_POPUP} {
  transition-duration: ${menuScaleTiming.duration}, ${menuFadeTiming.duration};
  transition-timing-function: ${menuScaleTiming.easing}, ${menuFadeTiming.easing};
}`,
    v.menu.startScale !== START_SCALE &&
      `/* dropdown-menu.tsx: DropdownMenuPopup */
${MENU_POPUP}:is([data-starting-style], [data-ending-style]) { scale: ${v.menu.startScale}; }`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const changedProps: FiltersProps = {
    ...(v.size !== SIZE && { size: v.size as FilterSize }),
    ...(v.variant !== VARIANT && { variant: v.variant as FilterVariant }),
  };
  // Not CSS or props: constants in lib/flow-presence.ts.
  const flowConstants = {
    ...(flowOverrides.flow && {
      "FLOW_MS / EASE": `${toMs(flowTiming)}ms ${flowTiming.easing}`,
    }),
    ...(flowOverrides.fadeIn && {
      "entrance fade (duration FLOW_MS, easing 'ease-out')": `${toMs(fadeInTiming)}ms ${fadeInTiming.easing}`,
    }),
    ...(flowOverrides.fadeOut && {
      "EXIT_FADE_MS (easing EASE)": `${toMs(fadeOutTiming)}ms ${fadeOutTiming.easing}`,
    }),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      {!tune.original && css && <style>{css}</style>}

      {VARIANTS.map(({ id, label, width }) => (
        <section key={id} className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground text-xs">{label}</p>
          <div className={width}>
            <Filters
              fields={FIELDS}
              value={values[id]}
              onValueChange={(next) =>
                setValues((current) => ({ ...current, [id]: next }))
              }
              {...(!tune.original && changedProps)}
            />
          </div>
        </section>
      ))}

      <TuneToolbar
        state={tune}
        setState={setTune}
        panelId={PANEL_ID}
        file="Filters (each rule names its source file)"
        css={css}
        props={{
          Filters: changedProps,
          "lib/flow-presence.ts": flowConstants,
        }}
        onReplay={replay}
        scrubMax={1000}
      />
    </div>
  );
}
