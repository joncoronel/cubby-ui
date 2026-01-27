"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupControlled() {
  const id = React.useId();
  const [value, setValue] = React.useState<string[]>(["email", "sms"]);

  const handleClearAll = () => setValue([]);
  const handleSelectAll = () => setValue(["email", "sms", "push", "in-app"]);

  return (
    <div className="space-y-4">
      <CheckboxGroup value={value} onValueChange={setValue}>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Notification Preferences</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-email`} value="email" />
              <Label htmlFor={`${id}-email`}>Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-sms`} value="sms" />
              <Label htmlFor={`${id}-sms`}>SMS notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-push`} value="push" />
              <Label htmlFor={`${id}-push`}>Push notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-in-app`} value="in-app" />
              <Label htmlFor={`${id}-in-app`}>In-app notifications</Label>
            </div>
          </div>
        </div>
      </CheckboxGroup>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{value.length} of 4 selected</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={handleClearAll}
          className="hover:text-foreground"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={handleSelectAll}
          className="hover:text-foreground"
        >
          Select all
        </button>
      </div>
    </div>
  );
}