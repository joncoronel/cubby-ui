"use client";

import * as React from "react";
import {
  CircularSliderKnob,
  CircularSliderRoot,
  CircularSliderTicks,
} from "@/registry/default/circular-slider/circular-slider";

const KNOBS = [
  { label: "Drive", defaultValue: 30 },
  { label: "Tone", defaultValue: 62 },
  { label: "Level", defaultValue: 75 },
] as const;

export default function CircularSliderDragMode() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-6">
      {KNOBS.map((knob) => (
        <KnobControl key={knob.label} {...knob} />
      ))}
    </div>
  );
}

function KnobControl({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: number;
}) {
  const [value, setValue] = React.useState<number>(defaultValue);

  return (
    <div className="flex flex-col items-center gap-2">
      <CircularSliderRoot
        variant="knob"
        dragMode="vertical"
        value={value}
        onValueChange={setValue}
        size={88}
        thickness={7}
        aria-label={label}
      >
        <CircularSliderTicks count={20} />
        <CircularSliderKnob />
      </CircularSliderRoot>
      <p className="text-muted-foreground text-xs">
        {label}{" "}
        <span className="text-foreground font-medium tabular-nums">
          {value}
        </span>
      </p>
    </div>
  );
}
