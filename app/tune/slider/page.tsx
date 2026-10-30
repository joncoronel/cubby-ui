"use client";

import * as React from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { useDialKit, type DialConfig } from "dialkit";
import {
  Slider,
  SliderValue,
  type SliderProps,
} from "@/registry/default/slider/slider";
import { Toggle } from "@/registry/default/toggle/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";
import { TuneToolbar, useTuneState } from "../_lib/tune-toolbar";

type Variant = NonNullable<SliderProps["variant"]>;
type Marks = "off" | "on" | "hover";
type Labels = "none" | "text" | "value";

const PANEL_ID = "slider";
const VARIANTS: Variant[] = ["default", "inset", "bar", "squareThumb"];
const MARK_STEP = 20;

// Scoped by the page's per-variant wrappers, since the slider root doesn't
// name its variant.
const INSET = '[data-tune-variant="inset"]';
const BAR = '[data-tune-variant="bar"]';
const H = '[data-slot="slider"][data-orientation="horizontal"]';
const V = '[data-slot="slider"][data-orientation="vertical"]';
const TRACK = '[data-slot="slider-track"]';
const STEP = '[data-slot="slider-step"]';
const BAR_LAYERS =
  ':is([data-slot="slider-labels"], [data-slot="slider-indicator"])';
// The bar handle is drawn in both layers, after the two label spans.
const BAR_HANDLE = `${BAR_LAYERS} > span:nth-child(n + 3)`;

// Defaults mirror registry/default/slider/slider.tsx. A rule is only emitted
// once its dial leaves the default, so untouched dials show the real component.
const INSET_TRACK = 24;
const INSET_RADIUS = 6; // --radius-xs
const INSET_PRESS = 0.95;
const INSET_MARK = 8;
const BAR_TRACK = 32;
const BAR_RADIUS = 8; // --radius-sm
const BAR_HANDLE_LENGTH = 14;
const BAR_HANDLE_WIDTH = 2;
const BAR_PRESS = 1.15;
const BAR_LABEL_SIZE = 13;
const BAR_MARK = 10;

// Component values only. Which variants, orientations, and props to show are
// page controls, so they stay out of DialKit's Copy output.
const CONFIG = {
  inset: {
    track: [INSET_TRACK, 16, 40, 1],
    radius: [INSET_RADIUS, 0, 16, 1],
    press: [INSET_PRESS, 0.85, 1, 0.01],
    mark: [INSET_MARK, 4, 16, 1],
  },
  bar: {
    track: [BAR_TRACK, 20, 56, 1],
    radius: [BAR_RADIUS, 0, 20, 1],
    handleLength: [BAR_HANDLE_LENGTH, 6, 32, 1],
    handleWidth: [BAR_HANDLE_WIDTH, 1, 6, 0.5],
    press: [BAR_PRESS, 1, 1.5, 0.01],
    labelSize: [BAR_LABEL_SIZE, 10, 18, 0.5],
    mark: [BAR_MARK, 4, 20, 1],
  },
} satisfies DialConfig;

export default function SliderTune(): React.ReactElement {
  const [tune, setTune] = useTuneState();
  const [marks, setMarks] = React.useState<Marks>("on");
  const [labels, setLabels] = React.useState<Labels>("text");
  const [snap, setSnap] = React.useState(false);
  const [primary, setPrimary] = React.useState(false);
  const [rtl, setRtl] = React.useState(false);
  const v = useDialKit("Slider", CONFIG, { id: PANEL_ID, persist: true });

  const css = [
    v.inset.track !== INSET_TRACK &&
      `${INSET} ${H} ${TRACK} { height: ${v.inset.track}px; }
      ${INSET} ${V} ${TRACK} { width: ${v.inset.track}px; }`,
    v.inset.radius !== INSET_RADIUS &&
      `${INSET} :is(${TRACK}, [data-slot="slider-thumb"]) { border-radius: ${v.inset.radius}px; }
      ${INSET} [data-slot="slider-thumb"]::before { border-radius: ${Math.max(0, v.inset.radius - 2)}px; }
      ${INSET} ${H} [data-slot="slider-indicator"] { border-start-start-radius: ${v.inset.radius}px; border-end-start-radius: ${v.inset.radius}px; }
      ${INSET} ${V} [data-slot="slider-indicator"] { border-bottom-left-radius: ${v.inset.radius}px; border-bottom-right-radius: ${v.inset.radius}px; }`,
    v.inset.press !== INSET_PRESS &&
      `${INSET} [data-slot="slider-thumb"][data-held]::before { scale: ${v.inset.press}; }`,
    v.inset.mark !== INSET_MARK &&
      `${INSET} ${H} ${STEP} { height: ${v.inset.mark}px; }
      ${INSET} ${V} ${STEP} { width: ${v.inset.mark}px; }`,
    v.bar.track !== BAR_TRACK &&
      `${BAR} ${H} ${TRACK} { height: ${v.bar.track}px; }
      ${BAR} ${V} ${TRACK} { width: ${v.bar.track}px; }`,
    v.bar.radius !== BAR_RADIUS &&
      `${BAR} ${TRACK} { border-radius: ${v.bar.radius}px; }`,
    (v.bar.handleLength !== BAR_HANDLE_LENGTH ||
      v.bar.handleWidth !== BAR_HANDLE_WIDTH) &&
      `${BAR} ${H} ${BAR_HANDLE} { height: ${v.bar.handleLength}px; width: ${v.bar.handleWidth}px; }
      ${BAR} ${V} ${BAR_HANDLE} { width: ${v.bar.handleLength}px; height: ${v.bar.handleWidth}px; }`,
    v.bar.press !== BAR_PRESS &&
      `${BAR} ${H} ${BAR_HANDLE}[data-held]:not([data-dodge]) { scale: 1 ${v.bar.press}; }
      ${BAR} ${V} ${BAR_HANDLE}[data-held]:not([data-dodge]) { scale: ${v.bar.press} 1; }`,
    v.bar.labelSize !== BAR_LABEL_SIZE &&
      `${BAR} ${BAR_LAYERS} { font-size: ${v.bar.labelSize}px; }`,
    v.bar.mark !== BAR_MARK &&
      `${BAR} ${H} ${STEP} { height: ${v.bar.mark}px; }
      ${BAR} ${V} ${STEP} { width: ${v.bar.mark}px; }`,
  ]
    .filter(Boolean)
    .join("\n");

  const shared: Partial<SliderProps> = {
    color: primary ? "primary" : "neutral",
    step: snap ? MARK_STEP : 1,
    showSteps: marks === "off" ? false : marks === "on" ? true : "hover",
    markStep: MARK_STEP,
    ...(labels === "text" && { startLabel: "Low", endLabel: "High" }),
    ...(labels === "value" && {
      startLabel: "Volume",
      endLabel: <SliderValue />,
    }),
  };

  return (
    <div className="min-h-screen p-8 pb-28">
      {!tune.original && css && <style>{css}</style>}

      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            size="sm"
            aria-label="Marks"
            value={[marks]}
            onValueChange={(value) => {
              if (value[0]) setMarks(value[0] as Marks);
            }}
          >
            <ToggleGroupItem value="off" className="text-xs">
              No marks
            </ToggleGroupItem>
            <ToggleGroupItem value="on" className="text-xs">
              Marks
            </ToggleGroupItem>
            <ToggleGroupItem value="hover" className="text-xs">
              Hover marks
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            size="sm"
            aria-label="Bar labels"
            value={[labels]}
            onValueChange={(value) => {
              if (value[0]) setLabels(value[0] as Labels);
            }}
          >
            <ToggleGroupItem value="none" className="text-xs">
              No labels
            </ToggleGroupItem>
            <ToggleGroupItem value="text" className="text-xs">
              Low / High
            </ToggleGroupItem>
            <ToggleGroupItem value="value" className="text-xs">
              Live value
            </ToggleGroupItem>
          </ToggleGroup>
          <Toggle
            size="sm"
            className="text-xs"
            pressed={snap}
            onPressedChange={setSnap}
          >
            Snap to marks
          </Toggle>
          <Toggle
            size="sm"
            className="text-xs"
            pressed={primary}
            onPressedChange={setPrimary}
          >
            Primary
          </Toggle>
          <Toggle
            size="sm"
            className="text-xs"
            pressed={rtl}
            onPressedChange={setRtl}
          >
            RTL
          </Toggle>
        </div>

        <DirectionProvider direction={rtl ? "rtl" : "ltr"}>
          <div dir={rtl ? "rtl" : "ltr"} className="flex flex-col gap-12">
            {VARIANTS.map((variant) => (
              <section
                key={variant}
                data-tune-variant={variant}
                className="flex flex-col gap-4"
              >
                <h2 className="text-muted-foreground text-xs font-medium">
                  {variant}
                </h2>
                <div className="flex flex-wrap items-center gap-10">
                  <div className="flex w-full max-w-sm flex-col gap-6">
                    <Slider
                      {...shared}
                      variant={variant}
                      defaultValue={60}
                      getAriaLabel={() => `${variant} single`}
                    />
                    <Slider
                      {...shared}
                      variant={variant}
                      defaultValue={[20, 70]}
                      getAriaLabel={(index) =>
                        `${variant} range ${index === 0 ? "start" : "end"}`
                      }
                    />
                  </div>
                  <div className="flex h-56 gap-8">
                    <Slider
                      {...shared}
                      variant={variant}
                      orientation="vertical"
                      defaultValue={60}
                      getAriaLabel={() => `${variant} vertical`}
                    />
                    <Slider
                      {...shared}
                      variant={variant}
                      orientation="vertical"
                      defaultValue={[20, 70]}
                      getAriaLabel={(index) =>
                        `${variant} vertical range ${index === 0 ? "start" : "end"}`
                      }
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </DirectionProvider>
      </div>

      <TuneToolbar
        state={tune}
        setState={setTune}
        panelId={PANEL_ID}
        file="registry/default/slider/slider.tsx"
        css={css}
      />
    </div>
  );
}
