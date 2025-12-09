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

export default function CircularSliderCounterclockwise() {
  const [clockwiseValue, setClockwiseValue] = React.useState(75);
  const [counterclockwiseValue, setCounterclockwiseValue] = React.useState(75);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="text-center">
        <CircularSliderRoot
          value={clockwiseValue}
          onValueChange={setClockwiseValue}
          min={0}
          max={100}
          direction="clockwise"
          aria-label="Clockwise"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderMarkers count={10} />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">
          Clockwise (default)
        </p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={counterclockwiseValue}
          onValueChange={setCounterclockwiseValue}
          min={0}
          max={100}
          direction="counterclockwise"
          aria-label="Counterclockwise"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderMarkers count={10} />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Counterclockwise</p>
      </div>
    </div>
  );
}
