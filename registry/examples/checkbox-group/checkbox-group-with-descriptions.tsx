"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupWithDescriptions() {
  const [value, setValue] = React.useState<string[]>(["security"]);

  return (
    <CheckboxGroup value={value} onValueChange={setValue} className="gap-3">
      <Label className="flex-row items-start gap-3 font-normal">
        <Checkbox value="security" className="mt-0.5" />
        <div className="grid gap-1">
          <span className="font-medium">Security alerts</span>
          <span className="text-sm text-muted-foreground">
            Get notified about important security updates and suspicious
            activities.
          </span>
        </div>
      </Label>
      <Label className="flex-row items-start gap-3 font-normal">
        <Checkbox value="product" className="mt-0.5" />
        <div className="grid gap-1">
          <span className="font-medium">Product updates</span>
          <span className="text-sm text-muted-foreground">
            Stay informed about new features, improvements, and bug fixes.
          </span>
        </div>
      </Label>
      <Label className="flex-row items-start gap-3 font-normal">
        <Checkbox value="newsletter" className="mt-0.5" />
        <div className="grid gap-1">
          <span className="font-medium">Newsletter</span>
          <span className="text-sm text-muted-foreground">
            Weekly digest with tips, tutorials, and community highlights.
          </span>
        </div>
      </Label>
      <Label className="flex-row items-start gap-3 font-normal">
        <Checkbox value="events" className="mt-0.5" />
        <div className="grid gap-1">
          <span className="font-medium">Events & webinars</span>
          <span className="text-sm text-muted-foreground">
            Invitations to online events, workshops, and educational webinars.
          </span>
        </div>
      </Label>
    </CheckboxGroup>
  );
}
