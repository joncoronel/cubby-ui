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

export default function NumberFieldMinMax() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={5} min={1} max={10}>
      <Label htmlFor={id}>Rating (1-10)</Label>
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
