"use client";

import * as React from "react";
import {
  CircularSliderKnob,
  CircularSliderRoot,
  CircularSliderTicks,
} from "@/registry/default/circular-slider/circular-slider";

export default function CircularSliderKnobExample() {
  const [volume, setVolume] = React.useState(42);

  return (
    <div className="flex flex-col items-center gap-3">
      <CircularSliderRoot
        variant="knob"
        value={volume}
        onValueChange={setVolume}
        size={136}
        thickness={10}
        aria-label="Volume"
      >
        <CircularSliderTicks />
        <CircularSliderKnob />
      </CircularSliderRoot>
      <p className="text-muted-foreground text-sm">
        Volume{" "}
        <span className="text-foreground font-medium tabular-nums">
          {volume}
        </span>
      </p>
    </div>
  );
}
