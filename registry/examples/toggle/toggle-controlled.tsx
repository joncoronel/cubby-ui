"use client";

import { Toggle } from "@/registry/default/toggle/toggle";
import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { TextBoldIcon } from "@hugeicons/core-free-icons";
export default function ToggleControlled() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Toggle pressed={isPressed} onPressedChange={setIsPressed}>
      <HugeiconsIcon icon={TextBoldIcon} className="h-4 w-4"  strokeWidth={2} />
    </Toggle>
  );
}