"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/default/toggle-group/toggle-group"

// The selected cell is neutral by default. Override it with any Tailwind classes —
// here, an accent look using the brand-hue tint + accessible brand-hue ink.
export default function ToggleGroupCustomColor() {
  return (
    <ToggleGroup
      aria-label="Text alignment"
      defaultValue={["center"]}
      className="**:data-[slot=toggle]:data-pressed:bg-primary/10 **:data-[slot=toggle]:data-pressed:text-info-foreground"
    >
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  )
}
