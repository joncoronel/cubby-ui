"use client";

import * as React from "react";
import { Label } from "@/registry/default/label/label";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldStepper,
} from "@/registry/default/number-field/number-field";

export default function NumberFieldStacked() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={100}>
      <Label htmlFor={id}>Amount</Label>
      <NumberFieldGroup>
        <NumberFieldInput className="rounded-l-lg border-l" />
        <NumberFieldStepper />
      </NumberFieldGroup>
    </NumberField>
  );
}
