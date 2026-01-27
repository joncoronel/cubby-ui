"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupBasic() {
  const id = React.useId();
  const [value, setValue] = React.useState<string[]>(["react"]);

  return (
    <div className="space-y-4">
      <CheckboxGroup value={value} onValueChange={setValue}>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${id}-react`} value="react" />
          <Label htmlFor={`${id}-react`}>React</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${id}-vue`} value="vue" />
          <Label htmlFor={`${id}-vue`}>Vue</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${id}-angular`} value="angular" />
          <Label htmlFor={`${id}-angular`}>Angular</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${id}-svelte`} value="svelte" />
          <Label htmlFor={`${id}-svelte`}>Svelte</Label>
        </div>
      </CheckboxGroup>
      <div className="text-sm text-muted-foreground">
        Selected: {value.length > 0 ? value.join(", ") : "None"}
      </div>
    </div>
  );
}