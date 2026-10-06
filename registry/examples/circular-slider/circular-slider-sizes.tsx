"use client";

import { CircularSlider } from "@/registry/default/circular-slider/circular-slider";

const SIZES = [
  { size: 80, thickness: 8 },
  { size: 120, thickness: 12 },
  { size: 168, thickness: 18 },
] as const;

export default function CircularSliderSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      {SIZES.map(({ size, thickness }) => (
        <CircularSlider
          key={size}
          defaultValue={60}
          size={size}
          thickness={thickness}
          aria-label={`Brightness, ${size}px dial`}
        />
      ))}
    </div>
  );
}
