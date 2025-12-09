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

export default function CircularSliderCustomStart() {
  const [value, setValue] = React.useState(50);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="text-center">
        <CircularSliderRoot
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          startAngle={0}
          aria-label="Start at top"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderMarkers count={12} />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Start: 0° (top)</p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          startAngle={90}
          aria-label="Start at right"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderMarkers count={12} />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Start: 90° (right)</p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={value}
          onValueChange={setValue}
          min={0}
          max={100}
          startAngle={270}
          aria-label="Start at left"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderMarkers count={12} />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Start: 270° (left)</p>
      </div>
    </div>
  );
}
