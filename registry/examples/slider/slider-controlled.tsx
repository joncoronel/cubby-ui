"use client";

import { Slider, SliderValue } from "@/registry/default/slider/slider";
import { useState } from "react";

export default function SliderControlled() {
  const [value, setValue] = useState([50]);

  return (
    <Slider
      className="max-w-sm"
      value={value}
      onValueChange={(value) =>
        setValue(Array.isArray(value) ? value : [value])
      }
      max={100}
      step={1}
      label="Controlled"
    >
      <SliderValue />
    </Slider>
  );
}
