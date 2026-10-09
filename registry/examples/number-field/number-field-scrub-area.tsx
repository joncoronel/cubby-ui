"use client";

import * as React from "react";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
} from "@/registry/default/number-field/number-field";

export default function NumberFieldScrubAreaDemo() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={100}>
      <NumberFieldScrubArea>
        <label htmlFor={id} className="text-sm font-medium">
          Amount
        </label>
        <NumberFieldScrubAreaCursor />
      </NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}
