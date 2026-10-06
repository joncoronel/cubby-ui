"use client";

import { CircularSlider } from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderCounterclockwise() {
  return (
    <CircularSlider
      defaultValue={35}
      direction="counterclockwise"
      aria-label="Timer"
    />
  );
}
