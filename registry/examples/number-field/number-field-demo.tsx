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

export default function NumberFieldDemo() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={2} min={1}>
      <Label htmlFor={id}>Guests</Label>
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}
