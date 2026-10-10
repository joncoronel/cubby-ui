"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group";

export default function ToggleGroupCustomColor() {
  return (
    <ToggleGroup
      variant="outline"
      aria-label="Text alignment"
      defaultValue={["center"]}
      className="[--toggle-group-selected-bg:var(--primary)] [--toggle-group-selected-fg:var(--primary-foreground)]"
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  );
}
