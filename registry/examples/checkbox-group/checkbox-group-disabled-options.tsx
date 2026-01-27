"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupDisabledOptions() {
  const id = React.useId();

  return (
    <CheckboxGroup>
      <div className="flex items-center space-x-2">
        <Checkbox id={`${id}-read`} defaultChecked />
        <Label htmlFor={`${id}-read`}>Read</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id={`${id}-write`} />
        <Label htmlFor={`${id}-write`}>Write</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id={`${id}-admin`} disabled />
        <Label htmlFor={`${id}-admin`} className="text-muted-foreground">
          Admin (requires upgrade)
        </Label>
      </div>
    </CheckboxGroup>
  );
}