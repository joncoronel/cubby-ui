"use client";

import { CircularSlider } from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderColor() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10">
      <CircularSlider
        defaultValue={64}
        aria-label="Brightness, neutral"
        formatValue={(v) => `${v}%`}
        getAriaValueText={(v) => `${v} percent`}
      />
      <CircularSlider
        color="primary"
        defaultValue={64}
        aria-label="Brightness, primary"
        formatValue={(v) => `${v}%`}
        getAriaValueText={(v) => `${v} percent`}
      />
    </div>
  );
}
