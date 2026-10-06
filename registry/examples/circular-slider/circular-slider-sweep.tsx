"use client";

import { CircularSlider } from "@/registry/default/circular-slider/circular-slider";

const SWEEPS = [360, 270, 180] as const;

export default function CircularSliderSweep() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-8">
      {SWEEPS.map((sweep) => (
        <div key={sweep} className="flex flex-col items-center gap-3">
          <CircularSlider
            defaultValue={40}
            sweep={sweep}
            size={112}
            thickness={10}
            aria-label={`Volume, ${sweep}° dial`}
          />
          <p className="text-muted-foreground text-sm tabular-nums">{sweep}°</p>
        </div>
      ))}
    </div>
  );
}
