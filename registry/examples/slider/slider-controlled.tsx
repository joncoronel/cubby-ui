"use client";

import { Slider } from "@/registry/default/slider/slider";
import { useState } from "react";

export default function SliderControlled() {
  const [value, setValue] = useState([50]);

  return (
    <div className="w-full max-w-sm space-y-2">
      <Slider
        value={value}
        onValueChange={(value) =>
          setValue(Array.isArray(value) ? value : [value])
        }
        max={100}
        step={1}
      />
      <div className="text-muted-foreground text-sm">Value: {value[0]}</div>
    </div>
  );
}
