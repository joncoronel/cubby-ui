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
export default function NumberFieldMinMax() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={5} min={1} max={10}>
      <Label htmlFor={id}>Rating (1-10)</Label>
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
  );
}
