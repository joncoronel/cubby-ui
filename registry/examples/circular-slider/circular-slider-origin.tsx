"use client";

import * as React from "react";
import {
  CircularSliderKnob,
  CircularSliderRoot,
  CircularSliderTicks,
} from "@/registry/default/circular-slider/circular-slider";

const formatPan = (v: number): string =>
  v === 0 ? "C" : v < 0 ? `L ${-v}` : `R ${v}`;

export default function CircularSliderOrigin() {
  const [pan, setPan] = React.useState(-20);

  return (
    <div className="flex flex-col items-center gap-3">
      <CircularSliderRoot
        variant="knob"
        value={pan}
        onValueChange={setPan}
        min={-50}
        max={50}
        step={5}
        origin={0}
        size={120}
        thickness={9}
        aria-label="Pan"
        getAriaValueText={(v) =>
          v === 0 ? "Center" : `${Math.abs(v)} ${v < 0 ? "left" : "right"}`
        }
      >
        <CircularSliderTicks count={20} />
        <CircularSliderKnob />
      </CircularSliderRoot>
      <p className="text-muted-foreground text-sm">
        Pan{" "}
        <span className="text-foreground font-medium tabular-nums">
          {formatPan(pan)}
        </span>
      </p>
    </div>
  );
}
