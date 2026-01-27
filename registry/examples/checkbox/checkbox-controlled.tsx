"use client";

import * as React from "react";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxControlled() {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="space-y-3">
      <Label className="flex-row items-center gap-2">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => setChecked(value as boolean)}
        />
        Enable notifications
      </Label>
      <p className="text-sm text-muted-foreground">
        Notifications are {checked ? "enabled" : "disabled"}
      </p>
    </div>
  );
}
