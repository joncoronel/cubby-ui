"use client";

import * as React from "react";
import {
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderThumb,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderNonContinuous() {
  const [continuousAngle, setContinuousAngle] = React.useState(350);
  const [nonContinuousAngle, setNonContinuousAngle] = React.useState(270);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="text-center">
        <CircularSliderRoot
          value={continuousAngle}
          onValueChange={setContinuousAngle}
          min={0}
          max={360}
          aria-label="Continuous angle"
          aria-valuetext={(v) => `${v} degrees`}
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderThumb />
          <CircularSliderValue formatValue={(v) => `${v}°`} />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">
          Continuous (default)
        </p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={nonContinuousAngle}
          onValueChange={setNonContinuousAngle}
          min={0}
          max={360}
          continuous={false}
          aria-label="Non-continuous angle"
          aria-valuetext={(v) => `${v} degrees`}
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderThumb />
          <CircularSliderValue formatValue={(v) => `${v}°`} />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">
          Non-continuous (has gap)
        </p>
      </div>
    </div>
  );
}
