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

export default function NumberFieldDemo() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={100}>
      <Label htmlFor={id}>Amount</Label>
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
  );
}
