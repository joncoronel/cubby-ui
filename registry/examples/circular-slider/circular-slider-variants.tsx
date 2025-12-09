"use client";

import * as React from "react";
import {
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderThumb,
  CircularSliderValue,
  CircularSliderMarkers,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderVariants() {
  const [defaultValue, setDefaultValue] = React.useState(70);
  const [filledValue, setFilledValue] = React.useState(93);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="text-center">
        <CircularSliderRoot
          value={defaultValue}
          onValueChange={setDefaultValue}
          min={0}
          max={100}
          variant="default"
          aria-label="Default variant"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Default</p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={filledValue}
          onValueChange={setFilledValue}
          min={0}
          max={100}
          variant="filled"
          aria-label="Filled variant"
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderMarkers count={10} />
          <CircularSliderThumb />
          <CircularSliderValue />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Filled</p>
      </div>
    </div>
  );
}
