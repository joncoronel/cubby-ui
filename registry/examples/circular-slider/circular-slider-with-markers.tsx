"use client";

import * as React from "react";
import {
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderMarkers,
  CircularSliderThumb,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderWithMarkers() {
  const [value, setValue] = React.useState(4);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <CircularSliderRoot
        value={value}
        onValueChange={setValue}
        min={0}
        max={12}
        step={1}
        aria-label="Hours"
        aria-valuetext={(v) => `${v} hours`}
      >
        <CircularSliderTrack />
        <CircularSliderIndicator />
        <CircularSliderMarkers count={12} />
        <CircularSliderThumb />
        <CircularSliderValue formatValue={(v) => `${v}h`} />
      </CircularSliderRoot>
    </div>
  );
}
