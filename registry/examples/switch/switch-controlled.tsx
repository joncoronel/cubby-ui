"use client";

import { Switch } from "@/registry/default/switch/switch";
import { Label } from "@/registry/default/label/label";
import { useState } from "react";

export default function SwitchControlled() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch 
          id="notifications" 
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
        <Label htmlFor="notifications">
          Enable notifications
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">
        {isEnabled ? "You will receive notifications" : "Notifications are disabled"}
      </p>
    </div>
  );
}