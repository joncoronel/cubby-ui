"use client";

import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";
import { useState } from "react";

export default function RadioGroupControlled() {
  const [selectedValue, setSelectedValue] = useState("comfortable");

  return (
    <div>
      <RadioGroup value={selectedValue} onValueChange={(value) => setSelectedValue(value as string)}>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="light" />
          Light
        </Label>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="dark" />
          Dark
        </Label>
        <Label className="flex-row items-center gap-2">
          <RadioGroupItem value="system" />
          System
        </Label>
      </RadioGroup>
      <p className="text-sm text-muted-foreground mt-2">
        Selected: {selectedValue}
      </p>
    </div>
  );
}