"use client";

import {
  CircularSliderIndicator,
  CircularSliderRoot,
  CircularSliderThumb,
  CircularSliderTicks,
  CircularSliderTrack,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderWrap() {
  return (
    <CircularSliderRoot
      defaultValue={135}
      min={0}
      max={360}
      sweep={360}
      wrap
      largeStep={15}
      aria-label="Shadow angle"
      getAriaValueText={(v) => `${v} degrees`}
    >
      <CircularSliderTrack />
      <CircularSliderTicks count={12} />
      <CircularSliderIndicator />
      <CircularSliderThumb />
      <CircularSliderValue formatValue={(v) => `${v}°`} />
    </CircularSliderRoot>
  );
}
