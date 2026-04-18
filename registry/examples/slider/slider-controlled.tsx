"use client";

import { useState } from "react";
import {
  Slider,
  SliderLabel,
  SliderValue,
} from "@/registry/default/slider/slider";

export default function SliderControlled() {
  const [value, setValue] = useState(50);

  return (
    <Slider
      className="max-w-sm"
      value={value}
      onValueChange={(next) =>
        setValue(Array.isArray(next) ? next[0] : next)
      }
      max={100}
      step={1}
    >
      <div className="flex items-center justify-between">
        <SliderLabel>Controlled</SliderLabel>
        <SliderValue />
      </div>
    </Slider>
  );
}
