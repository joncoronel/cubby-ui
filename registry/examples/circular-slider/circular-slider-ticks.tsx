"use client";

import {
  CircularSliderIndicator,
  CircularSliderRoot,
  CircularSliderThumb,
  CircularSliderTicks,
  CircularSliderTrack,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

const DIALS = [
  { label: "Smooth", smooth: true },
  { label: "Stepped", smooth: false },
] as const;

export default function CircularSliderTicksExample() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-10">
      {DIALS.map(({ label, smooth }) => (
        <div key={label} className="flex flex-col items-center gap-3">
          <CircularSliderRoot
            defaultValue={4}
            min={0}
            max={10}
            smooth={smooth}
            aria-label={`Intensity, ${label.toLowerCase()}`}
          >
            <CircularSliderTrack />
            <CircularSliderTicks count={10} />
            <CircularSliderIndicator />
            <CircularSliderThumb />
            <CircularSliderValue />
          </CircularSliderRoot>
          <p className="text-muted-foreground text-sm">{label}</p>
        </div>
      ))}
    </div>
  );
}
