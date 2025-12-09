"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupHorizontal() {
  const [value, setValue] = React.useState<string[]>(["small"]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Select sizes</h3>
        <CheckboxGroup
          value={value}
          onValueChange={setValue}
          className="flex flex-row flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <Checkbox id="xs" value="xs" />
            <Label htmlFor="xs">XS</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="small" value="small" />
            <Label htmlFor="small">Small</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="medium" value="medium" />
            <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="large" value="large" />
            <Label htmlFor="large">Large</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="xl" value="xl" />
            <Label htmlFor="xl">XL</Label>
          </div>
        </CheckboxGroup>
      </div>
      <div className="text-sm text-muted-foreground">
        Selected sizes: {value.length > 0 ? value.join(", ").toUpperCase() : "None"}
      </div>
    </div>
  );
}