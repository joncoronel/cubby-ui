"use client";

import {
  CircularSlider,
  CircularSliderKnob,
  CircularSliderRoot,
  CircularSliderTicks,
} from "@/registry/default/circular-slider/circular-slider";

const RINGS = [
  { label: "Bead", thumbShape: "bead", thickness: 12 },
  { label: "Pill", thumbShape: "pill", thickness: 12 },
  { label: "Pill, thin band", thumbShape: "pill", thickness: 6 },
] as const;

const KNOBS = [
  { label: "Knob, pill", thumbShape: "pill" },
  { label: "Knob, bead", thumbShape: "bead" },
] as const;

export default function CircularSliderThumbShape() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="flex flex-wrap items-start justify-center gap-8">
        {RINGS.map(({ label, thumbShape, thickness }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <CircularSlider
              defaultValue={60}
              thumbShape={thumbShape}
              thickness={thickness}
              size={128}
              aria-label={`Volume, ${label.toLowerCase()}`}
            />
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-start justify-center gap-8">
        {KNOBS.map(({ label, thumbShape }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <CircularSliderRoot
              variant="knob"
              thumbShape={thumbShape}
              defaultValue={60}
              step={5}
              size={112}
              thickness={8}
              aria-label={`Volume, ${label.toLowerCase()}`}
            >
              <CircularSliderTicks count={20} />
              <CircularSliderKnob />
            </CircularSliderRoot>
            <p className="text-muted-foreground text-sm">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
