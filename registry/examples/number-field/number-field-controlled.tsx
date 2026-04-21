"use client";

import * as React from "react";
import { Label } from "@/registry/default/label/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/default/number-field/number-field";

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
export default function NumberFieldControlled() {
  const id = React.useId();
  const [value, setValue] = React.useState<number | null>(50);

  return (
    <div className="space-y-2">
      <NumberField id={id} value={value} onValueChange={setValue}>
        <Label htmlFor={id}>Quantity</Label>
        <NumberFieldGroup>
          <NumberFieldDecrement>
            <HugeiconsIcon icon={MinusSignIcon} className="size-4"  strokeWidth={2} />
          </NumberFieldDecrement>
          <NumberFieldInput />
          <NumberFieldIncrement>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4"  strokeWidth={2} />
          </NumberFieldIncrement>
        </NumberFieldGroup>
      </NumberField>
      <p className="text-muted-foreground text-sm">
        Current value: {value ?? "empty"}
      </p>
    </div>
  );
}
