"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupNested() {
  const id = React.useId();
  const communicationOptions = ["email", "sms", "push"];
  const marketingOptions = ["newsletter", "promotions", "updates"];
  const allOptions = [...communicationOptions, ...marketingOptions];

  const [value, setValue] = React.useState<string[]>([]);

  // Communication group state
  const isCommunicationSelected = communicationOptions.every((opt) => value.includes(opt));
  const isCommunicationIndeterminate = 
    communicationOptions.some((opt) => value.includes(opt)) && 
    !isCommunicationSelected;

  // Marketing group state  
  const isMarketingSelected = marketingOptions.every((opt) => value.includes(opt));
  const isMarketingIndeterminate = 
    marketingOptions.some((opt) => value.includes(opt)) && 
    !isMarketingSelected;

  // Master checkbox state
  const isAllSelected = value.length === allOptions.length;
  const isAllIndeterminate = value.length > 0 && value.length < allOptions.length;

  const handleMasterChange = (checked: boolean) => {
    setValue(checked ? allOptions : []);
  };

  const handleCommunicationChange = (checked: boolean) => {
    if (checked) {
      setValue((prev) => [...new Set([...prev, ...communicationOptions])]);
    } else {
      setValue((prev) => prev.filter((item) => !communicationOptions.includes(item)));
    }
  };

  const handleMarketingChange = (checked: boolean) => {
    if (checked) {
      setValue((prev) => [...new Set([...prev, ...marketingOptions])]);
    } else {
      setValue((prev) => prev.filter((item) => !marketingOptions.includes(item)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${id}-all`}
            checked={isAllSelected}
            indeterminate={isAllIndeterminate}
            onCheckedChange={handleMasterChange}
          />
          <Label htmlFor={`${id}-all`} className="text-base font-semibold">
            All Notifications
          </Label>
        </div>
        
        <div className="ml-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${id}-communication`}
                checked={isCommunicationSelected}
                indeterminate={isCommunicationIndeterminate}
                onCheckedChange={handleCommunicationChange}
              />
              <Label htmlFor={`${id}-communication`} className="font-medium">
                Communication Preferences
              </Label>
            </div>
            <div className="ml-6 space-y-2">
              <CheckboxGroup value={value} onValueChange={setValue}>
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
              </CheckboxGroup>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${id}-marketing`}
                checked={isMarketingSelected}
                indeterminate={isMarketingIndeterminate}
                onCheckedChange={handleMarketingChange}
              />
              <Label htmlFor={`${id}-marketing`} className="font-medium">
                Marketing Communications
              </Label>
            </div>
            <div className="ml-6 space-y-2">
              <CheckboxGroup value={value} onValueChange={setValue}>
                <div className="flex items-center space-x-2">
                  <Checkbox id={`${id}-newsletter`} value="newsletter" />
                  <Label htmlFor={`${id}-newsletter`}>Weekly newsletter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id={`${id}-promotions`} value="promotions" />
                  <Label htmlFor={`${id}-promotions`}>Promotional offers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id={`${id}-updates`} value="updates" />
                  <Label htmlFor={`${id}-updates`}>Product updates</Label>
                </div>
              </CheckboxGroup>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}