"use client";

import { Toggle } from "@/registry/default/toggle/toggle";
import { Bold } from "lucide-react";
import { useState } from "react";

export default function ToggleControlled() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Toggle pressed={isPressed} onPressedChange={setIsPressed}>
      <Bold className="h-4 w-4" />
    </Toggle>
  );
}