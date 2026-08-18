"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group"

// The selected cell is neutral by default. Override the cell's selected-paint
// token (plus the ink, which is a plain text class) — here, an accent look using
// the brand-hue tint + accessible brand-hue ink.
export default function ToggleGroupCustomColor() {
  return (
    <ToggleGroup
      aria-label="Text alignment"
      defaultValue={["center"]}
      className="**:data-[slot=toggle]:data-pressed:text-info-foreground **:data-[slot=toggle]:[--tgl-bg-selected:color-mix(in_oklab,var(--primary)_10%,transparent)]"
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  )
}
