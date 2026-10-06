"use client";

import { CircularSlider } from "@/registry/default/circular-slider/circular-slider";

const SHAPES = [
  { label: "Bead", thumbShape: "bead", thickness: 12 },
  { label: "Pill", thumbShape: "pill", thickness: 12 },
  { label: "Pill, thin band", thumbShape: "pill", thickness: 6 },
] as const;

export default function CircularSliderThumbShape() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      {SHAPES.map(({ label, thumbShape, thickness }) => (
        <div key={label} className="flex flex-col items-center gap-3">
          <CircularSlider
            defaultValue={58}
            thumbShape={thumbShape}
            thickness={thickness}
            size={128}
            aria-label="Volume"
          />
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>
      ))}
    </div>
  );
}
