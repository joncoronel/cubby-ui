"use client";

import * as React from "react";
import {
  CircularSliderIndicator,
  CircularSliderRoot,
  CircularSliderThumb,
  CircularSliderTicks,
  CircularSliderTrack,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export default function CircularSliderRange() {
  const [hours, setHours] = React.useState<readonly number[]>([22, 7]);
  // The window runs clockwise from the first value, through midnight.
  const length = (((hours[1] - hours[0]) % 24) + 24) % 24;

  return (
    <CircularSliderRoot
      value={hours}
      onValueChange={setHours}
      min={0}
      max={24}
      step={0.25}
      largeStep={1}
      sweep={360}
      wrap
      size={208}
      thickness={16}
      aria-label="Quiet hours"
      formatValue={formatTime}
    >
      <CircularSliderTrack />
      <CircularSliderTicks count={24} />
      <CircularSliderIndicator />
      <CircularSliderThumb />
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Quiet hours
        </span>
        <CircularSliderValue separator="–" className="text-xl" />
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatDuration(length)}
        </span>
      </div>
    </CircularSliderRoot>
  );
}
