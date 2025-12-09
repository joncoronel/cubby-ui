"use client";

import * as React from "react";
import { CheckboxGroup } from "@/registry/default/checkbox-group/checkbox-group";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";

export default function CheckboxGroupWithDescriptions() {
  const [value, setValue] = React.useState<string[]>(["security"]);

  return (
    <CheckboxGroup value={value} onValueChange={setValue} className="space-y-3">
      <div className="flex items-start space-x-3">
        <Checkbox id="security" value="security" className="mt-1" />
        <div className="space-y-1 leading-none">
          <Label htmlFor="security" className="font-medium">
            Security alerts
          </Label>
          <p className="text-sm text-muted-foreground">
            Get notified about important security updates and suspicious activities.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <Checkbox id="product" value="product" className="mt-1" />
        <div className="space-y-1 leading-none">
          <Label htmlFor="product" className="font-medium">
            Product updates
          </Label>
          <p className="text-sm text-muted-foreground">
            Stay informed about new features, improvements, and bug fixes.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <Checkbox id="newsletter" value="newsletter" className="mt-1" />
        <div className="space-y-1 leading-none">
          <Label htmlFor="newsletter" className="font-medium">
            Newsletter
          </Label>
          <p className="text-sm text-muted-foreground">
            Weekly digest with tips, tutorials, and community highlights.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <Checkbox id="events" value="events" className="mt-1" />
        <div className="space-y-1 leading-none">
          <Label htmlFor="events" className="font-medium">
            Events & webinars
          </Label>
          <p className="text-sm text-muted-foreground">
            Invitations to online events, workshops, and educational webinars.
          </p>
        </div>
      </div>
    </CheckboxGroup>
  );
}