"use client";

import { RadioGroup, RadioGroupItem } from "@/registry/default/radio-group/radio-group";
import { Label } from "@/registry/default/label/label";
import { useState } from "react";

export default function RadioGroupControlled() {
  const [selectedValue, setSelectedValue] = useState("comfortable");

  return (
    <div>
      <RadioGroup value={selectedValue} onValueChange={(value) => setSelectedValue(value as string)}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="light" id="light" />
          <Label htmlFor="light">Light</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="dark" id="dark" />
          <Label htmlFor="dark">Dark</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="system" id="system" />
          <Label htmlFor="system">System</Label>
        </div>
      </RadioGroup>
      <p className="text-sm text-muted-foreground mt-2">
        Selected: {selectedValue}
      </p>
    </div>
  );
}