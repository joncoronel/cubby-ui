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
          <HugeiconsIcon icon={MinusSignIcon} className="size-4"  strokeWidth={2} />
        </NumberFieldDecrement>
        <NumberFieldInput className="w-32" />
        <NumberFieldIncrement>
          <HugeiconsIcon icon={PlusSignIcon} className="size-4"  strokeWidth={2} />
        </NumberFieldIncrement>
      </NumberFieldGroup>
    </NumberField>
  );
}
