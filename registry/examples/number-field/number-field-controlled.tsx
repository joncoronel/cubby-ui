"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Label } from "@/registry/default/label/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/default/number-field/number-field";

export default function NumberFieldControlled() {
  const id = React.useId();
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <div className="space-y-2">
      <NumberField id={id} value={value} onValueChange={setValue}>
        <Label htmlFor={id}>Quantity</Label>
        <NumberFieldGroup>
          <NumberFieldDecrement>
            <Minus className="size-4" />
          </NumberFieldDecrement>
          <NumberFieldInput />
          <NumberFieldIncrement>
            <Plus className="size-4" />
          </NumberFieldIncrement>
        </NumberFieldGroup>
      </NumberField>
      <p className="text-muted-foreground text-sm">
        Current value: {value ?? "empty"}
      </p>
    </div>
  );
}
