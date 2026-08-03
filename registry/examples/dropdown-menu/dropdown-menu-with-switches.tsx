"use client";

import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Button } from "@/registry/default/button/button";

export default function DropdownMenuWithSwitches() {
  const [autoSave, setAutoSave] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [telemetry, setTelemetry] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Preferences
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Editor</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          indicator="switch"
          checked={autoSave}
          onCheckedChange={setAutoSave}
        >
          Auto save
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          indicator="switch"
          checked={wordWrap}
          onCheckedChange={setWordWrap}
        >
          Word wrap
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          indicator="switch"
          checked={telemetry}
          onCheckedChange={setTelemetry}
          disabled
        >
          Share telemetry
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
