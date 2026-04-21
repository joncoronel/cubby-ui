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

import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
function CursorGrowIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

export default function NumberFieldScrubAreaDemo() {
  const id = React.useId();

  return (
    <NumberField id={id} defaultValue={100}>
      <NumberFieldScrubArea>
        <label
          htmlFor={id}
          className="cursor-ew-resize text-sm font-medium select-none"
        >
          Amount
        </label>
        <NumberFieldScrubAreaCursor>
          <CursorGrowIcon />
        </NumberFieldScrubAreaCursor>
      </NumberFieldScrubArea>
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
