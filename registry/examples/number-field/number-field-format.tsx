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

export default function NumberFieldFormat() {
  const id = React.useId();

  return (
    <NumberField
      id={id}
      defaultValue={99.99}
      step={0.01}
      format={{ style: "currency", currency: "USD" }}
    >
      <Label htmlFor={id}>Price</Label>
      <NumberFieldGroup>
        <NumberFieldDecrement>
          <Minus className="size-4" />
        </NumberFieldDecrement>
        <NumberFieldInput className="w-32" />
        <NumberFieldIncrement>
          <Plus className="size-4" />
        </NumberFieldIncrement>
      </NumberFieldGroup>
    </NumberField>
  );
}
