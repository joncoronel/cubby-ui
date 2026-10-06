"use client";

import { CircularSlider } from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderBasic() {
  return (
    <CircularSlider
      defaultValue={64}
      aria-label="Brightness"
      formatValue={(v) => `${v}%`}
      getAriaValueText={(v) => `${v} percent`}
    />
  );
}
