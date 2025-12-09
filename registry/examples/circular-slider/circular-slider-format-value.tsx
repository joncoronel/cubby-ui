"use client";

import * as React from "react";
import {
  CircularSliderRoot,
  CircularSliderTrack,
  CircularSliderIndicator,
  CircularSliderThumb,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderFormatValue() {
  const [temperature, setTemperature] = React.useState(72);
  const [angle, setAngle] = React.useState(180);
  const [percentage, setPercentage] = React.useState(65);

  return (
    <div className="flex items-center justify-center gap-8 p-8">
      <div className="text-center">
        <CircularSliderRoot
          value={temperature}
          onValueChange={setTemperature}
          min={32}
          max={100}
          aria-label="Temperature"
          aria-valuetext={(v) => `${v} degrees Fahrenheit`}
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderThumb />
          <CircularSliderValue formatValue={(v) => `${v}°F`} />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Temperature</p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={angle}
          onValueChange={setAngle}
          min={0}
          max={360}
          aria-label="Angle"
          aria-valuetext={(v) => `${v} degrees`}
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderThumb />
          <CircularSliderValue formatValue={(v) => `${v}°`} />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Angle</p>
      </div>
      <div className="text-center">
        <CircularSliderRoot
          value={percentage}
          onValueChange={setPercentage}
          min={0}
          max={100}
          aria-label="Percentage"
          aria-valuetext={(v) => `${v} percent`}
        >
          <CircularSliderTrack />
          <CircularSliderIndicator />
          <CircularSliderThumb />
          <CircularSliderValue formatValue={(v) => `${v}%`} />
        </CircularSliderRoot>
        <p className="text-muted-foreground mt-2 text-sm">Percentage</p>
      </div>
    </div>
  );
}
