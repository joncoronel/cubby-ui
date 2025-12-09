"use client";

import * as React from "react";
import {
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderThumb,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderSizes() {
  const [value, setValue] = React.useState(60);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      {/* Small: 64px circle, 12px track/thumb */}
      <CircularSliderRoot
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        size={64}
        aria-label="Value (small)"
      >
        <CircularSliderTrack strokeWidth={12} />
        <CircularSliderIndicator strokeWidth={12} />
        <CircularSliderThumb size={12} />
        <CircularSliderValue />
      </CircularSliderRoot>

      {/* Medium: 96px circle, 16px track/thumb (defaults) */}
      <CircularSliderRoot
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        size={96}
        aria-label="Value (medium)"
      >
        <CircularSliderTrack />
        <CircularSliderIndicator />
        <CircularSliderThumb />
        <CircularSliderValue />
      </CircularSliderRoot>

      {/* Large: 128px circle, 20px track/thumb */}
      <CircularSliderRoot
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        size={128}
        aria-label="Value (large)"
      >
        <CircularSliderTrack strokeWidth={20} />
        <CircularSliderIndicator strokeWidth={20} />
        <CircularSliderThumb size={20} />
        <CircularSliderValue />
      </CircularSliderRoot>
    </div>
  );
}
