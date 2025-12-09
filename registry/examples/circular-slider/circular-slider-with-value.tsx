"use client";

import * as React from "react";
import {
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderThumb,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderWithValue() {
  const [value, setValue] = React.useState(75);

  return (
    <div className="flex items-center justify-center p-8">
      <CircularSliderRoot
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        aria-label="Value"
      >
        <CircularSliderTrack />
        <CircularSliderIndicator />
        <CircularSliderThumb />
        <CircularSliderValue />
      </CircularSliderRoot>
    </div>
  );
}
