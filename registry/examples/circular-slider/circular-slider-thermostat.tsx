"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/registry/default/button/button";
import {
  CircularSliderIndicator,
  CircularSliderMark,
  CircularSliderRoot,
  CircularSliderThumb,
  CircularSliderTicks,
  CircularSliderTrack,
  CircularSliderValue,
} from "@/registry/default/circular-slider/circular-slider";

const MIN = 10;
const MAX = 30;
const STEP = 0.5;

const formatTemperature = (v: number): string => `${v.toFixed(1)}°`;

export default function CircularSliderThermostat() {
  const [target, setTarget] = React.useState(21.5);
  const [current, setCurrent] = React.useState(19.4);

  // The room drifts toward the target, so the "Now" mark glides along.
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setCurrent((now) => {
        const gap = target - now;
        if (Math.abs(gap) < 0.05) return target;
        return Math.round((now + Math.sign(gap) * 0.1) * 10) / 10;
      });
    }, 1200);
    return () => window.clearInterval(id);
  }, [target]);

  const mode =
    Math.abs(target - current) < 0.05
      ? "Holding at"
      : target > current
        ? "Heating to"
        : "Cooling to";

  const nudge = (delta: number) =>
    setTarget((t) => Math.min(MAX, Math.max(MIN, t + delta)));

  return (
    <div className="flex flex-col items-center gap-4">
      <CircularSliderRoot
        value={target}
        onValueChange={setTarget}
        min={MIN}
        max={MAX}
        step={STEP}
        origin={current}
        size={208}
        thickness={14}
        thumbShape="pill"
        aria-label="Target temperature"
        getAriaValueText={(v) => `${v} degrees`}
      >
        <CircularSliderTrack />
        <CircularSliderTicks count={40} />
        <CircularSliderIndicator />
        <CircularSliderMark value={current} />
        <CircularSliderThumb />
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            {mode}
          </span>
          <CircularSliderValue
            formatValue={formatTemperature}
            className="text-4xl"
          />
          <span className="text-muted-foreground text-xs tabular-nums">
            Now {formatTemperature(current)}
          </span>
        </div>
      </CircularSliderRoot>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon_sm"
          aria-label="Lower target"
          disabled={target <= MIN}
          onClick={() => nudge(-STEP)}
        >
          <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
        </Button>
        <Button
          variant="outline"
          size="icon_sm"
          aria-label="Raise target"
          disabled={target >= MAX}
          onClick={() => nudge(STEP)}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
