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

const SIZES = ["sm", "default"] as const;

export default function NumberFieldSize() {
  const id = React.useId();

  return (
    <div className="flex flex-wrap items-end gap-6">
      {SIZES.map((size) => (
        <NumberField key={size} id={`${id}-${size}`} defaultValue={8}>
          <Label htmlFor={`${id}-${size}`}>
            {size === "sm" ? "Small" : "Default"}
          </Label>
          <NumberFieldGroup size={size}>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      ))}
    </div>
  );
}
