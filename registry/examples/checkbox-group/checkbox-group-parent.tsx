"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupParent() {
  const id = React.useId();
  const allOptions = ["notifications", "emails", "sms", "push"];
  const [value, setValue] = React.useState<string[]>([]);

  const isAllSelected = value.length === allOptions.length;
  const isIndeterminate = value.length > 0 && value.length < allOptions.length;

  const handleParentChange = (checked: boolean) => {
    setValue(checked ? allOptions : []);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${id}-all`}
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onCheckedChange={handleParentChange}
          />
          <Label htmlFor={`${id}-all`} className="font-medium">
            Select All Notifications
          </Label>
        </div>
        <div className="ml-6 space-y-2">
          <CheckboxGroup value={value} onValueChange={setValue}>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-notifications`} value="notifications" />
              <Label htmlFor={`${id}-notifications`}>Browser notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-emails`} value="emails" />
              <Label htmlFor={`${id}-emails`}>Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-sms`} value="sms" />
              <Label htmlFor={`${id}-sms`}>SMS notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id={`${id}-push`} value="push" />
              <Label htmlFor={`${id}-push`}>Push notifications</Label>
            </div>
          </CheckboxGroup>
        </div>
      </div>
    </div>
  );
}