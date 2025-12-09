"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/registry/default/select/select";

export default function SelectControlled() {
  const themeItems = [
    { label: "Select a theme", value: null },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];

  const [value, setValue] = useState<string | null>(null);

  return (
    <div>
      <Select
        value={value}
        onValueChange={(value) => setValue(value)}
        items={themeItems}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {themeItems.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-muted-foreground mt-2 text-sm">
        Selected: {value || "none"}
      </p>
    </div>
  );
}
