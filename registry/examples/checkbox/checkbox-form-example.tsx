"use client";

import * as React from "react";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import { Label } from "@/registry/default/label/label";
import { Button } from "@/registry/default/button/button";
import { toast } from "@/registry/default/toast/toast";

export default function CheckboxFormExample() {
  const [accepted, setAccepted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) {
      toast.error({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to continue.",
      });
      return;
    }

    toast.success({
      title: "Form submitted",
      description: "Thank you for accepting the terms.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Label className="flex-row items-start gap-3 font-normal">
        <Checkbox
          checked={accepted}
          onCheckedChange={(value) => setAccepted(value as boolean)}
          className="mt-0.5"
        />
        <span>
          I agree to the terms and conditions
        </span>
      </Label>
      <Button type="submit">Submit</Button>
    </form>
  );
}
